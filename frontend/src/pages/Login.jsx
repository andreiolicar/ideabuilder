import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import AuthIcon from "../components/ui/AuthIcon.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import useToast from "../context/useToast.js";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
      navigate(from, { replace: true });
    } catch (submitError) {
      const message = submitError?.response?.data?.message || "Falha ao autenticar.";
      addToast({ title: "Erro de login", message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
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
    </main>
  );
}

export default Login;
