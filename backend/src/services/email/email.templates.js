const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const wrapTemplate = ({ title, subtitle, contentBlocks }) => {
  const blocks = contentBlocks
    .map(
      (block) => `
      <div style="margin:0 0 12px 0;padding:10px 12px;border:1px solid rgba(255,255,255,0.10);border-radius:10px;background:rgba(255,255,255,0.03);color:#cbd5e1;font-size:14px;line-height:1.5;">
        ${block}
      </div>
    `
    )
    .join("");

  return `
  <html>
    <body style="margin:0;padding:24px;background:transparent;color:#e8edf5;font-family:Inter,Segoe UI,Arial,sans-serif;">
      <div style="max-width:620px;margin:0 auto;padding:24px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:#0f172a;">
        <h1 style="margin:0 0 6px 0;font-size:22px;line-height:1.2;color:#e8edf5;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 18px 0;font-size:14px;color:#8b95a8;">${escapeHtml(subtitle)}</p>
        ${blocks}
        <p style="margin:16px 0 0 0;font-size:12px;color:#64748b;">TCC Idea Builder</p>
      </div>
    </body>
  </html>
  `;
};

const formatDate = (value) => new Date(value || Date.now()).toLocaleString("pt-BR");

const buildRegisterTemplate = (payload = {}) => {
  const name = escapeHtml(payload.name || "Usuario");
  const subject = "Bem-vindo ao TCC Idea Builder";
  return {
    subject,
    html: wrapTemplate({
      title: "Conta criada com sucesso",
      subtitle: "Seu acesso ao TCC Idea Builder esta pronto.",
      contentBlocks: [
        `<strong>Ola, ${name}.</strong><br/>Sua conta foi criada e ja esta ativa.`,
        "Voce ja pode criar projetos e gerar documentacoes com IA."
      ]
    }),
    text: `Conta criada com sucesso.\nOla, ${payload.name || "Usuario"}.\nSeu acesso ao TCC Idea Builder esta pronto.`
  };
};

const buildLoginTemplate = (payload = {}) => {
  const subject = "Novo login na sua conta";
  return {
    subject,
    html: wrapTemplate({
      title: "Login realizado",
      subtitle: "Detectamos um novo acesso na sua conta.",
      contentBlocks: [
        `Data/hora do acesso: <strong>${escapeHtml(formatDate(payload.loggedAt))}</strong>`,
        `Conta: <strong>${escapeHtml(payload.email || "-")}</strong>`
      ]
    }),
    text: `Login realizado em ${formatDate(payload.loggedAt)}.\nConta: ${payload.email || "-"}.`
  };
};

const buildProjectCreatedTemplate = (payload = {}) => {
  const subject = "Seu projeto foi gerado com sucesso";
  return {
    subject,
    html: wrapTemplate({
      title: "Projeto pronto",
      subtitle: "As documentacoes foram geradas com IA.",
      contentBlocks: [
        `Projeto: <strong>${escapeHtml(payload.projectTitle || "Projeto de TCC")}</strong>`,
        `ID: <code style="color:#93c5fd;">${escapeHtml(payload.projectId || "-")}</code>`
      ]
    }),
    text: `Projeto gerado com sucesso.\nTitulo: ${payload.projectTitle || "Projeto de TCC"}\nID: ${payload.projectId || "-"}`
  };
};

const buildCreditsChangedTemplate = (payload = {}) => {
  const subject = "Movimentacao de creditos na sua conta";
  const movement = `${payload.type || "-"} ${payload.amount || 0}`;
  return {
    subject,
    html: wrapTemplate({
      title: "Credito atualizado",
      subtitle: "Registramos uma nova movimentacao de creditos.",
      contentBlocks: [
        `Movimento: <strong>${escapeHtml(movement)}</strong>`,
        `Motivo: <strong>${escapeHtml(payload.reason || "-")}</strong>`,
        `Saldo atual: <strong>${escapeHtml(String(payload.newBalance ?? "-"))}</strong>`
      ]
    }),
    text: `Movimentacao de creditos.\nMovimento: ${movement}\nMotivo: ${payload.reason || "-"}\nSaldo atual: ${payload.newBalance ?? "-"}`
  };
};

const buildTemplate = (eventType, payload) => {
  switch (eventType) {
    case "REGISTER":
      return buildRegisterTemplate(payload);
    case "LOGIN":
      return buildLoginTemplate(payload);
    case "PROJECT_CREATED":
      return buildProjectCreatedTemplate(payload);
    case "CREDITS_CHANGED":
      return buildCreditsChangedTemplate(payload);
    default:
      return {
        subject: "Notificacao do TCC Idea Builder",
        html: wrapTemplate({
          title: "Notificacao",
          subtitle: "Voce recebeu uma notificacao.",
          contentBlocks: ["Uma nova acao ocorreu na sua conta."]
        }),
        text: "Voce recebeu uma notificacao do TCC Idea Builder."
      };
  }
};

module.exports = {
  buildTemplate
};
