require("dotenv").config();

const shared = {
  dialect: "postgres",
  define: {
    underscored: true
  }
};

module.exports = {
  development: {
    ...shared,
    use_env_variable: "DATABASE_URL"
  },
  test: {
    ...shared,
    use_env_variable: "DATABASE_URL_TEST"
  },
  production: {
    ...shared,
    use_env_variable: "DATABASE_URL"
  }
};
