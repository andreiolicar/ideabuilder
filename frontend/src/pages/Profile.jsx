import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import {
  DashboardIcon,
  LedgerIcon,
  LogoutIcon,
  ProfileIcon,
  SettingsIcon,
  UsersIcon
} from "../components/ui/SidebarIcons.jsx";
import useAuth from "../context/useAuth.js";
import useToast from "../context/useToast.js";
import api from "../lib/api.js";

const COOLDOWN_SECONDS = 60;

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    role: "USER",
    createdAt: ""
  });
  const [balance, setBalance] = useState("--");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [requestingEmailCode, setRequestingEmailCode] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState(false);
  const [requestingPasswordCode, setRequestingPasswordCode] = useState(false);
  const [confirmingPassword, setConfirmingPassword] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [emailForm, setEmailForm] = useState({ newEmail: "", code: "" });
  const [passwordForm, setPasswordForm] = useState({
    code: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [emailCodeCooldown, setEmailCodeCooldown] = useState(0);
  const [passwordCodeCooldown, setPasswordCodeCooldown] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setEmailCodeCooldown((current) => Math.max(current - 1, 0));
      setPasswordCodeCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileResponse, projectsResponse] = await Promise.all([
          api.get("/users/profile"),
          api.get("/projects", { params: { page: 1 } })
        ]);

        const nextProfile = profileResponse?.data?.profile;
        setProfile(nextProfile);
        setNewName(nextProfile?.name || "");
        setBalance(projectsResponse?.data?.meta?.balance ?? "--");
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message || "Nao foi possivel carregar perfil.";
        setError(message);
        addToast({ title: "Erro", message, tone: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [addToast]);

  const isAdmin = user?.role === "ADMIN";

  const sidebarSections = useMemo(
    () => [
      {
        key: "menu",
        title: "Menu",
        items: [{ key: "dashboard", label: "Dashboard", to: "/", icon: <DashboardIcon /> }]
      },
      ...(isAdmin
        ? [
            {
              key: "admin",
              title: "ADMIN",
              items: [
                { key: "users", label: "Usuarios", to: "/admin/users", icon: <UsersIcon /> },
                { key: "ledger", label: "Ledger de creditos", to: "/admin/ledger", icon: <LedgerIcon /> }
              ]
            }
          ]
        : []),
      {
        key: "preferences",
        title: "Preferencias",
        items: [
          { key: "profile", label: "Perfil", to: "/profile", active: true, icon: <ProfileIcon /> },
          { key: "settings", label: "Configuracoes", to: "/settings", icon: <SettingsIcon /> }
        ]
      }
    ],
    [isAdmin]
  );

  const handleSaveName = async (event) => {
    event.preventDefault();
    setSavingName(true);
    setError("");
    try {
      const { data } = await api.patch("/users/profile", { name: newName.trim() });
      setProfile((current) => ({ ...current, ...data.profile }));
      addToast({
        title: "Perfil atualizado",
        message: "Nome atualizado com sucesso.",
        tone: "success"
      });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || "Nao foi possivel atualizar nome.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setSavingName(false);
    }
  };

  const handleRequestEmailCode = async () => {
    setRequestingEmailCode(true);
    setError("");
    try {
      await api.post("/users/profile/email/request-code", {
        newEmail: emailForm.newEmail.trim()
      });
      setEmailCodeCooldown(COOLDOWN_SECONDS);
      addToast({
        title: "Codigo enviado",
        message: "Verifique o novo e-mail para continuar.",
        tone: "success"
      });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || "Nao foi possivel enviar codigo.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setRequestingEmailCode(false);
    }
  };

  const handleConfirmEmail = async (event) => {
    event.preventDefault();
    setConfirmingEmail(true);
    setError("");
    try {
      await api.post("/users/profile/email/confirm", {
        newEmail: emailForm.newEmail.trim(),
        code: emailForm.code.trim()
      });
      addToast({
        title: "E-mail atualizado",
        message: "Faca login novamente com o novo e-mail.",
        tone: "success"
      });
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || "Nao foi possivel confirmar e-mail.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setConfirmingEmail(false);
    }
  };

  const handleRequestPasswordCode = async () => {
    setRequestingPasswordCode(true);
    setError("");
    try {
      await api.post("/users/profile/password/request-code", {});
      setPasswordCodeCooldown(COOLDOWN_SECONDS);
      addToast({
        title: "Codigo enviado",
        message: "Verifique seu e-mail para trocar a senha.",
        tone: "success"
      });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || "Nao foi possivel enviar codigo.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setRequestingPasswordCode(false);
    }
  };

  const handleConfirmPassword = async (event) => {
    event.preventDefault();
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const message = "A confirmacao de senha nao confere.";
      setError(message);
      addToast({ title: "Validacao", message, tone: "warning" });
      return;
    }

    setConfirmingPassword(true);
    try {
      await api.post("/users/profile/password/confirm", {
        code: passwordForm.code.trim(),
        newPassword: passwordForm.newPassword
      });
      addToast({
        title: "Senha atualizada",
        message: "Faca login novamente para continuar.",
        tone: "success"
      });
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || "Nao foi possivel atualizar senha.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setConfirmingPassword(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        credits={balance}
        sections={sidebarSections}
        footer={
          <Button fullWidth variant="ghost" onClick={logout}>
            <span className="nav-item-icon"><LogoutIcon /></span>
            Sair
          </Button>
        }
      />

      <main className="dashboard-main">
        <div className="main-topbar">
          <div>
            <h1 className="heading-sm">Perfil</h1>
            <p className="body-xs">Atualize seus dados pessoais e seguranca da conta.</p>
          </div>
          <span className="nav-item-icon nav-item-icon--large"><ProfileIcon /></span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <Card className="stack-md animate-in">
          <div>
            <h2 className="heading-sm">Dados pessoais</h2>
            <p className="body-sm">Edite seu nome e visualize e-mail atual.</p>
          </div>
          <form className="settings-grid" onSubmit={handleSaveName}>
            <Input
              id="profile-name"
              label="Nome"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              disabled={loading || savingName}
            />
            <Input
              id="profile-email-current"
              label="E-mail atual"
              value={profile.email || ""}
              disabled
            />
            <div className="settings-actions settings-span-2">
              <Button type="submit" disabled={loading || savingName}>
                {savingName ? "Salvando..." : "Salvar nome"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="stack-md animate-in">
          <div>
            <h2 className="heading-sm">Trocar e-mail</h2>
            <p className="body-sm">Confirme o novo e-mail com codigo OTP.</p>
          </div>
          <form className="stack-md" onSubmit={handleConfirmEmail}>
            <div className="settings-grid">
              <Input
                id="profile-new-email"
                label="Novo e-mail"
                type="email"
                value={emailForm.newEmail}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, newEmail: event.target.value }))
                }
                disabled={loading || requestingEmailCode || confirmingEmail}
              />
              <Input
                id="profile-new-email-code"
                label="Codigo OTP"
                value={emailForm.code}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, code: event.target.value }))
                }
                placeholder="000000"
                disabled={loading || confirmingEmail}
              />
            </div>
            <div className="settings-actions">
              <Button
                type="button"
                variant="secondary"
                disabled={
                  loading ||
                  requestingEmailCode ||
                  !emailForm.newEmail.trim() ||
                  emailCodeCooldown > 0
                }
                onClick={handleRequestEmailCode}
              >
                {requestingEmailCode
                  ? "Enviando..."
                  : emailCodeCooldown > 0
                    ? `Reenviar em ${emailCodeCooldown}s`
                    : "Enviar codigo"}
              </Button>
              <Button
                type="submit"
                disabled={loading || confirmingEmail || !emailForm.code.trim()}
              >
                {confirmingEmail ? "Confirmando..." : "Confirmar e-mail"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="stack-md animate-in">
          <div>
            <h2 className="heading-sm">Trocar senha</h2>
            <p className="body-sm">Solicite codigo OTP para redefinir sua senha.</p>
          </div>
          <form className="stack-md" onSubmit={handleConfirmPassword}>
            <div className="settings-grid profile-password-grid">
              <div className="stack-sm">
                <Input
                  id="profile-password-new"
                  label="Nova senha"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value
                    }))
                  }
                  disabled={loading || confirmingPassword}
                />
                <Input
                  id="profile-password-confirm"
                  label="Confirmar nova senha"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value
                    }))
                  }
                  disabled={loading || confirmingPassword}
                />
              </div>
              <Input
                id="profile-password-code"
                label="Codigo OTP"
                value={passwordForm.code}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, code: event.target.value }))
                }
                placeholder="000000"
                disabled={loading || confirmingPassword}
              />
            </div>
            <div className="settings-actions">
              <Button
                type="button"
                variant="secondary"
                disabled={loading || requestingPasswordCode || passwordCodeCooldown > 0}
                onClick={handleRequestPasswordCode}
              >
                {requestingPasswordCode
                  ? "Enviando..."
                  : passwordCodeCooldown > 0
                    ? `Reenviar em ${passwordCodeCooldown}s`
                    : "Enviar codigo"}
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  confirmingPassword ||
                  !passwordForm.code.trim() ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
              >
                {confirmingPassword ? "Confirmando..." : "Confirmar troca"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default Profile;
