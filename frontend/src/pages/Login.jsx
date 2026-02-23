import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import AuthIcon from "../components/ui/AuthIcon.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import useToast from "../context/useToast.js";
import api from "../lib/api.js";
import PublicAuthLayout from "../components/landing/PublicAuthLayout.jsx";

const mapLoginErrorMessage = (error) => {
  const status = error?.response?.status;
  const apiMessage = String(error?.response?.data?.message || "").toLowerCase();

  if (status === 401) {
    return "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
  }

  if (status === 429) {
    return "Muitas tentativas de login. Aguarde alguns instantes e tente novamente.";
  }

  if (status >= 500) {
    return "Não foi possível concluir o login agora. Tente novamente em instantes.";
  }

  if (apiMessage.includes("network") || apiMessage.includes("fetch")) {
    return "Falha de conexão com o servidor. Verifique sua internet e tente novamente.";
  }

  return "Não foi possível realizar login. Revise os dados e tente novamente.";
};

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotForm, setForgotForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!forgotCooldown) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setForgotCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [forgotCooldown]);

  useEffect(() => {
    if (forgotOpen) {
      setForgotVisible(true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setForgotVisible(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [forgotOpen]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login(form);
      addToast({
        title: "Login realizado",
        message: "Bem-vindo ao TCC Idea Builder.",
        tone: "success"
      });
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      const message = mapLoginErrorMessage(submitError);
      addToast({ title: "Erro de login", message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updateForgot = (field) => (event) => {
    setForgotForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleForgotRequestCode = async (event) => {
    event.preventDefault();

    const email = forgotForm.email.trim();
    if (!email) {
      addToast({
        title: "Validacao",
        message: "Informe seu e-mail para receber o codigo.",
        tone: "warning"
      });
      return;
    }

    setForgotLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password/request-code", { email });
      addToast({
        title: "Codigo enviado",
        message:
          data?.message || "Se o e-mail existir, enviaremos um codigo de redefinicao.",
        tone: "success"
      });
      setForgotStep(2);
      setForgotCooldown(60);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || "Nao foi possivel enviar o codigo.";
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotConfirm = async (event) => {
    event.preventDefault();

    const email = forgotForm.email.trim();
    const code = forgotForm.code.trim();

    if (!email || !code || !forgotForm.newPassword || !forgotForm.confirmPassword) {
      addToast({
        title: "Validacao",
        message: "Preencha todos os campos para redefinir a senha.",
        tone: "warning"
      });
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      addToast({
        title: "Validacao",
        message: "O codigo deve conter 6 digitos.",
        tone: "warning"
      });
      return;
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      addToast({
        title: "Validacao",
        message: "A confirmacao da senha nao confere.",
        tone: "warning"
      });
      return;
    }

    setForgotLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password/confirm", {
        email,
        code,
        newPassword: forgotForm.newPassword
      });

      addToast({
        title: "Senha redefinida",
        message: data?.message || "Sua senha foi atualizada com sucesso.",
        tone: "success"
      });

      setForgotOpen(false);
      setForgotStep(1);
      setForgotForm({
        email: "",
        code: "",
        newPassword: "",
        confirmPassword: ""
      });
      setForgotCooldown(0);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || "Nao foi possivel redefinir a senha.";
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <PublicAuthLayout isAuthenticated={isAuthenticated}>
      <section className="auth-shell">
        <Card elevated corners className="w-full max-w-[420px] animate-in">
        <div className="flex-center" style={{ marginBottom: "var(--space-5)" }}>
          <div className="app-icon app-icon--lg">
            <AuthIcon />
          </div>
        </div>

        <div style={{ marginBottom: "var(--space-6)" }}>
          <h1 className="heading-sm" style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
            Entrar na plataforma
          </h1>
          <p className="body-sm" style={{ textAlign: "center" }}>
            Acesse seu workspace de ideias e documentacao.
          </p>
        </div>

        <form className="stack-md" onSubmit={handleSubmit}>
          <Input
            id="login-email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="voce@faculdade.com"
            required
          />
          <Input
            id="login-password"
            label="Senha"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            placeholder="********"
            required
          />
          <Button type="submit" fullWidth disabled={loading} loading={loading}>
            {loading ? (
              <>
                <Spinner />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="divider">OR</div>

        <section className="auth-recovery">
          <div className="auth-recovery-header" style={{ justifyContent: "center" }}>
            <p className="body-sm" style={{ textAlign: "center" }}>
              Esqueceu sua senha?{" "}
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => {
                  setForgotOpen((current) => {
                    const next = !current;
                    if (next) {
                      setForgotVisible(true);
                    }
                    return next;
                  });
                  setForgotStep(1);
                }}
              >
                {forgotOpen ? "Fechar" : "Redefinir agora"}
              </button>
            </p>
          </div>
          <div className={["auth-recovery-panel", forgotOpen ? "open" : ""].join(" ")}>
            {forgotVisible ? (
              forgotStep === 1 ? (
                <form className="stack-md" onSubmit={handleForgotRequestCode}>
                  <Input
                    id="forgot-email"
                    label="E-mail"
                    type="email"
                    value={forgotForm.email}
                    onChange={updateForgot("email")}
                    placeholder="voce@faculdade.com"
                    required
                  />
                  <Button type="submit" variant="secondary" fullWidth disabled={forgotLoading || forgotCooldown > 0}>
                    {forgotLoading ? (
                      <>
                        <Spinner />
                        Enviando...
                      </>
                    ) : forgotCooldown > 0 ? (
                      `Reenviar em ${forgotCooldown}s`
                    ) : (
                      "Enviar codigo"
                    )}
                  </Button>
                </form>
              ) : (
                <form className="stack-md" onSubmit={handleForgotConfirm}>
                  <Input
                    id="forgot-code"
                    label="Codigo OTP"
                    value={forgotForm.code}
                    onChange={updateForgot("code")}
                    placeholder="000000"
                    required
                  />
                  <Input
                    id="forgot-new-password"
                    label="Nova senha"
                    type="password"
                    value={forgotForm.newPassword}
                    onChange={updateForgot("newPassword")}
                    placeholder="********"
                    required
                  />
                  <Input
                    id="forgot-confirm-password"
                    label="Confirmar nova senha"
                    type="password"
                    value={forgotForm.confirmPassword}
                    onChange={updateForgot("confirmPassword")}
                    placeholder="********"
                    required
                  />
                  <div className="auth-recovery-actions">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setForgotStep(1)}
                      disabled={forgotLoading}
                    >
                      Voltar
                    </Button>
                    <Button type="submit" variant="secondary" disabled={forgotLoading}>
                      {forgotLoading ? (
                        <>
                          <Spinner />
                          Confirmando...
                        </>
                      ) : (
                        "Redefinir senha"
                      )}
                    </Button>
                  </div>
                </form>
              )
            ) : null}
          </div>
        </section>

        <p className="body-sm" style={{ textAlign: "center" }}>
          Nao tem conta?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--accent-primary)",
              fontWeight: 500,
              transition: "color var(--transition-fast)"
            }}
          >
            Criar conta
          </Link>
        </p>
        </Card>
      </section>
    </PublicAuthLayout>
  );
}

export default Login;
