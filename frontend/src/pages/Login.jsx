import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Falha ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Entrar
          </h1>
          <p className="text-sm text-zinc-500">
            Acesse seu workspace de ideias e documentacao.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-zinc-500">
          Nao tem conta?{" "}
          <Link className="font-medium text-teal-700 hover:text-teal-800" to="/register">
            Criar conta
          </Link>
        </p>
      </Card>
    </main>
  );
}

export default Login;
