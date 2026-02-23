import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
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

const defaultSettings = {
  locale: "pt-BR",
  emailNotifications: true,
  dashboardDefaultSort: "recent",
  compactTables: false,
  requireDangerConfirm: true,
  itemsPerPage: 20
};

function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [balance, setBalance] = useState("--");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError("");
      try {
        const [settingsResponse, projectsResponse] = await Promise.all([
          api.get("/users/settings"),
          api.get("/projects", { params: { page: 1 } })
        ]);

        setSettings({ ...defaultSettings, ...settingsResponse.data?.settings });
        setBalance(projectsResponse?.data?.meta?.balance ?? "--");
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          "Nao foi possivel carregar configuracoes.";
        setError(message);
        addToast({ title: "Erro", message, tone: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [addToast]);

  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        locale: settings.locale,
        emailNotifications: settings.emailNotifications,
        dashboardDefaultSort: settings.dashboardDefaultSort
      };

      if (isAdmin) {
        payload.compactTables = settings.compactTables;
        payload.requireDangerConfirm = settings.requireDangerConfirm;
        payload.itemsPerPage = Number(settings.itemsPerPage);
      }

      const { data } = await api.patch("/users/settings", payload);
      setSettings({ ...defaultSettings, ...data?.settings });
      addToast({
        title: "Configuracoes salvas",
        message: "Suas preferencias foram atualizadas com sucesso.",
        tone: "success"
      });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        "Nao foi possivel salvar configuracoes.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    setRevokingSessions(true);
    setError("");
    try {
      await api.post("/auth/sessions/revoke-all");
      await logout();
      addToast({
        title: "Sessoes encerradas",
        message: "Todas as sessoes foram revogadas. Faca login novamente.",
        tone: "success"
      });
      navigate("/login", { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        "Nao foi possivel encerrar as sessoes.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setRevokingSessions(false);
      setConfirmOpen(false);
    }
  };

  const sections = useMemo(
    () => [
      {
        key: "menu",
        title: "Menu",
        items: [{ key: "dashboard", label: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> }]
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
          {
            key: "profile",
            label: "Perfil",
            to: "/profile",
            active: location.pathname === "/profile",
            icon: <ProfileIcon />
          },
          {
            key: "settings",
            label: "Configuracoes",
            to: "/settings",
            active: location.pathname === "/settings",
            icon: <SettingsIcon />
          }
        ]
      }
    ],
    [isAdmin, location.pathname]
  );

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        credits={balance}
        sections={sections}
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
            <h1 className="heading-sm">Configuracoes</h1>
            <p className="body-xs">Gerencie preferencias da conta e seguranca.</p>
          </div>
          <span className="nav-item-icon nav-item-icon--large"><SettingsIcon /></span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <form className="stack-md" onSubmit={handleSave}>
          <Card className="stack-md animate-in">
            <div>
              <h2 className="heading-sm">Preferencias</h2>
              <p className="body-sm">Ajustes gerais para uso da plataforma.</p>
            </div>
            <div className="settings-grid">
              <label htmlFor="settings-locale" className="form-group">
                <span className="label">Idioma</span>
                <select
                  id="settings-locale"
                  className="input select"
                  value={settings.locale}
                  onChange={updateField("locale")}
                  disabled={loading || saving}
                >
                  <option value="pt-BR">Portugues (Brasil)</option>
                </select>
              </label>

              <label htmlFor="settings-sort" className="form-group">
                <span className="label">Ordenacao padrao do dashboard</span>
                <select
                  id="settings-sort"
                  className="input select"
                  value={settings.dashboardDefaultSort}
                  onChange={updateField("dashboardDefaultSort")}
                  disabled={loading || saving}
                >
                  <option value="recent">Recentes</option>
                  <option value="az">A-Z</option>
                </select>
              </label>
            </div>

            <label className="settings-switch-row">
              <input
                type="checkbox"
                checked={Boolean(settings.emailNotifications)}
                onChange={updateField("emailNotifications")}
                disabled={loading || saving}
              />
              <span className="body-sm">Receber notificacoes por e-mail</span>
            </label>
          </Card>

          {isAdmin ? (
            <Card className="stack-md animate-in">
              <div>
                <h2 className="heading-sm">ADMIN - Preferencias operacionais</h2>
                <p className="body-sm">Ajustes para fluxo administrativo.</p>
              </div>
              <div className="settings-grid">
                <Input
                  id="settings-items-per-page"
                  label="Itens por pagina"
                  type="number"
                  min={5}
                  max={100}
                  value={settings.itemsPerPage}
                  onChange={updateField("itemsPerPage")}
                  disabled={loading || saving}
                />
              </div>
              <label className="settings-switch-row">
                <input
                  type="checkbox"
                  checked={Boolean(settings.compactTables)}
                  onChange={updateField("compactTables")}
                  disabled={loading || saving}
                />
                <span className="body-sm">Usar tabelas compactas no admin</span>
              </label>
              <label className="settings-switch-row">
                <input
                  type="checkbox"
                  checked={Boolean(settings.requireDangerConfirm)}
                  onChange={updateField("requireDangerConfirm")}
                  disabled={loading || saving}
                />
                <span className="body-sm">Exigir confirmacao para acoes criticas</span>
              </label>
            </Card>
          ) : null}

          <Card className="animate-in">
            <div className="settings-security-row">
              <div className="settings-security-content">
                <h2 className="heading-sm">Seguranca</h2>
                <p className="body-sm">
                  Encerre todas as sessoes ativas da sua conta em outros dispositivos.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmOpen(true)}
                disabled={loading || revokingSessions}
              >
                Encerrar sessoes
              </Button>
            </div>
          </Card>

          <div className="settings-actions">
            <Button type="submit" disabled={loading || saving}>
              {saving ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </main>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Encerrar sessoes"
      >
        <div className="stack-md">
          <p className="body-sm">
            Esta acao vai revogar todas as sessoes ativas da conta e exigir novo login.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={revokingSessions}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleRevokeAllSessions} disabled={revokingSessions}>
              {revokingSessions ? "Encerrando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Settings;
