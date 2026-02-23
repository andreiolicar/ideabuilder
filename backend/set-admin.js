require("dotenv").config();

const { User, sequelize } = require("./src/models");

const TARGET_EMAIL = "andreiolicar7@gmail.com";

async function run() {
  try {
    await sequelize.authenticate();

    const user = await User.findOne({
      where: { email: TARGET_EMAIL.toLowerCase() }
    });

    if (!user) {
      console.error(`[set-admin] Usuario nao encontrado: ${TARGET_EMAIL}`);
      process.exitCode = 1;
      return;
    }

    await user.update({ role: "ADMIN" });
    console.log(`[set-admin] Usuario atualizado para ADMIN: ${user.email}`);
  } catch (error) {
    console.error("[set-admin] Erro ao atualizar usuario:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
