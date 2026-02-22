import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import AuthIcon from "../components/ui/AuthIcon.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import useToast from "../context/useToast.js";

const mapRegisterErrorMessage = (error) => {
  const status = error?.response?.status;
  const apiMessage = String(error?.response?.data?.message || "").toLowerCase();

  if (status === 409 || apiMessage.includes("email")) {
    return "Este e-mail já está em uso. Tente outro e-mail para continuar.";
  }

  if (status === 400) {
    return "Dados inválidos no cadastro. Revise os campos e tente novamente.";
  }

  if (status === 429) {
    return "Muitas tentativas de cadastro. Aguarde alguns instantes e tente novamente.";
  }

  if (status >= 500) {
    return "Não foi possível concluir o cadastro agora. Tente novamente em instantes.";
  }

  return "Não foi possível criar sua conta. Revise os dados e tente novamente.";
};

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await register(form);
      addToast({
        title: "Conta criada",
        message: "Cadastro realizado com sucesso.",
        tone: "success"
      });
      navigate("/", { replace: true });
    } catch (submitError) {
      const message = mapRegisterErrorMessage(submitError);
      addToast({ title: "Erro de cadastro", message, tone: "error" });
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
            Criar conta
          </h1>
          <p className="body-sm" style={{ textAlign: "center" }}>
            Comece seu planejamento de TCC com estrutura padronizada.
          </p>
        </div>

        <form className="stack-md" onSubmit={handleSubmit}>
          <Input
            id="register-name"
            label="Nome"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Seu nome"
            required
          />
          <Input
            id="register-email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="voce@faculdade.com"
            required
          />
          <Input
            id="register-password"
            label="Senha"
            type="password"
            helperText="Minimo de 8 caracteres."
            value={form.password}
            onChange={handleChange("password")}
            placeholder="********"
            required
          />
          <Button type="submit" fullWidth disabled={loading} loading={loading}>
            {loading ? (
              <>
                <Spinner />
                Criando...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <div className="divider">OR</div>

        <p className="body-sm" style={{ textAlign: "center" }}>
          Ja possui conta?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--accent-primary)",
              fontWeight: 500,
              transition: "color var(--transition-fast)"
            }}
          >
            Entrar
          </Link>
        </p>
      </Card>
    </main>
  );
}

export default Register;
