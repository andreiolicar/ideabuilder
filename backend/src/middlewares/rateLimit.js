const rateLimit = require("express-rate-limit");

const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "RATE_LIMITED",
    message: "Too many auth attempts, try again later."
  }
});

const generationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "RATE_LIMITED",
    message: "Too many generation attempts, try again later."
  }
});

const forgotPasswordRequestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "RATE_LIMITED",
    message: "Muitas solicitacoes de recuperacao. Tente novamente mais tarde."
  }
});

const forgotPasswordConfirmRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "RATE_LIMITED",
    message: "Muitas tentativas de validacao de codigo. Tente novamente mais tarde."
  }
});

const profileSecurityRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "RATE_LIMITED",
    message: "Muitas tentativas de seguranca. Aguarde e tente novamente."
  }
});

module.exports = {
  globalRateLimit,
  authRateLimit,
  generationRateLimit,
  forgotPasswordRequestRateLimit,
  forgotPasswordConfirmRateLimit,
  profileSecurityRateLimit
};
