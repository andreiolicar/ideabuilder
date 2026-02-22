const { Op, Transaction } = require("sequelize");
const env = require("../../config/env");
const { EmailQueue, sequelize } = require("../../models");
const { sendEmail, hasSmtpConfig } = require("./email.transport");

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 20;
const PROCESSING_STALE_MS = 2 * 60 * 1000;
const ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;

let timer = null;
let running = false;
let warnedMissingConfig = false;

const now = () => new Date();

const calcNextAttemptAt = (attemptCount) =>
  new Date(Date.now() + env.emailRetryBaseMs * Math.pow(2, Math.max(0, attemptCount - 1)));

const reserveJobs = async () => {
  return sequelize.transaction(
    { isolationLevel: ISOLATION_LEVELS.READ_COMMITTED },
    async (transaction) => {
      const jobs = await EmailQueue.findAll({
        where: {
          status: {
            [Op.in]: ["PENDING", "FAILED"]
          },
          nextAttemptAt: {
            [Op.lte]: now()
          },
          attemptCount: {
            [Op.lt]: sequelize.col("max_attempts")
          }
        },
        order: [["nextAttemptAt", "ASC"]],
        limit: BATCH_SIZE,
        transaction,
        lock: true,
        skipLocked: true,
        logging: false
      });

      if (jobs.length === 0) {
        return [];
      }

      const ids = jobs.map((job) => job.id);
      await EmailQueue.update(
        { status: "PROCESSING" },
        { where: { id: ids }, transaction, logging: false }
      );

      return jobs;
    }
  );
};

const recoverStuckProcessingJobs = async () => {
  const staleBefore = new Date(Date.now() - PROCESSING_STALE_MS);
  const [count] = await EmailQueue.update(
    {
      status: "FAILED",
      lastError: "Recovered from stale PROCESSING state",
      nextAttemptAt: now()
    },
    {
      where: {
        status: "PROCESSING",
        updatedAt: { [Op.lt]: staleBefore }
      },
      logging: false
    }
  );

  if (count > 0) {
    console.warn(`[email] recovered ${count} stale processing job(s)`);
  }
};

const processJob = async (job) => {
  const html = job.payload?._template?.html || "";
  const text = job.payload?._template?.text || "";

  try {
    await sendEmail({
      to: job.toEmail,
      subject: job.subject,
      html,
      text
    });

    await job.update({
      status: "SENT",
      sentAt: now(),
      lastError: null
    });
    console.log(`[email] sent jobId=${job.id} event=${job.eventType}`);
    return;
  } catch (error) {
    const nextAttemptCount = Number(job.attemptCount || 0) + 1;
    const exhausted = nextAttemptCount >= Number(job.maxAttempts || env.emailRetryMax);

    await EmailQueue.update(
      {
        status: "FAILED",
        attemptCount: nextAttemptCount,
        lastError: String(error?.message || "Unknown email error").slice(0, 1000),
        nextAttemptAt: exhausted ? job.nextAttemptAt : calcNextAttemptAt(nextAttemptCount)
      },
      { where: { id: job.id }, logging: false }
    );

    if (exhausted) {
      console.error(`[email] exhausted retries jobId=${job.id} event=${job.eventType}`);
    } else {
      console.warn(
        `[email] send failed jobId=${job.id} retry=${nextAttemptCount}/${job.maxAttempts}`
      );
    }
  }
};

const processQueue = async () => {
  if (running || !env.emailEnabled) {
    return;
  }

  if (!hasSmtpConfig()) {
    if (!warnedMissingConfig) {
      console.warn("[email] SMTP config missing, queue worker is idle");
      warnedMissingConfig = true;
    }
    return;
  }

  warnedMissingConfig = false;

  running = true;
  try {
    await recoverStuckProcessingJobs();
    const jobs = await reserveJobs();
    for (const job of jobs) {
      // Sequential sending keeps implementation simple and avoids SMTP bursts.
      // Can be parallelized later if needed.
      // eslint-disable-next-line no-await-in-loop
      await processJob(job);
    }
  } catch (error) {
    console.error("[email] queue processing error:", error.message);
  } finally {
    running = false;
  }
};

const startEmailWorker = () => {
  if (!env.emailEnabled) {
    console.log("[email] worker disabled (EMAIL_ENABLED=false)");
    return null;
  }

  if (timer) {
    return timer;
  }

  timer = setInterval(processQueue, POLL_INTERVAL_MS);
  timer.unref?.();
  processQueue();
  console.log("[email] worker started");
  return timer;
};

const stopEmailWorker = () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = null;
  console.log("[email] worker stopped");
};

module.exports = {
  startEmailWorker,
  stopEmailWorker
};
