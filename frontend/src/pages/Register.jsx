import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Falha ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Criar Conta
          </h1>
          <p className="text-sm text-zinc-500">
            Comece seu planejamento de TCC com estrutura padronizada.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-zinc-500">
          Ja possui conta?{" "}
          <Link className="font-medium text-teal-700 hover:text-teal-800" to="/login">
            Entrar
          </Link>
        </p>
      </Card>
    </main>
  );
}

export default Register;
