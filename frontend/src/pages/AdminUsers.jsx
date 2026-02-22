import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Chip from "../components/ui/Chip.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import {
  AdminIcon,
  DashboardIcon,
  LedgerIcon,
  LogoutIcon,
  SettingsIcon,
  UsersIcon
} from "../components/ui/SidebarIcons.jsx";
import useAuth from "../context/useAuth.js";
import useToast from "../context/useToast.js";
import api from "../lib/api.js";

function AdminUsers() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [delta, setDelta] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  const fetchUsers = async (nextPage = page, nextSearch = search) => {
    setLoadingUsers(true);
    setError("");
    try {
      const { data } = await api.get("/admin/users", {
        params: { page: nextPage, search: nextSearch || undefined }
      });
      setUsers(data.items || []);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Falha ao listar usuarios.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyUserSearch = (event) => {
    event.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const openAdjustModal = (targetUser) => {
    setSelectedUser(targetUser);
    setDelta("");
    setAdjustError("");
    setAdjustModalOpen(true);
  };

  const closeAdjustModal = () => {
    setAdjustModalOpen(false);
    setSelectedUser(null);
    setDelta("");
    setAdjustError("");
  };

  const submitAdjustCredits = async (event) => {
    event.preventDefault();

    const parsedDelta = Number(delta);
    if (!parsedDelta || Number.isNaN(parsedDelta)) {
      const message = "Informe um valor inteiro diferente de zero.";
      setAdjustError(message);
      addToast({ title: "Validacao", message, tone: "warning" });
      return;
    }

    setAdjustLoading(true);
    setAdjustError("");

    try {
      await api.patch(`/admin/users/${selectedUser.id}/credits`, { delta: parsedDelta });
      closeAdjustModal();
      fetchUsers(page, search);
      addToast({ title: "Sucesso", message: "Creditos ajustados com sucesso.", tone: "success" });
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Falha ao ajustar creditos.";
      setAdjustError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setAdjustLoading(false);
    }
  };

  const myCredits = useMemo(() => {
    const currentUser = users.find((item) => item.id === user?.id);
    return currentUser?.balance ?? "--";
  }, [users, user?.id]);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        credits={myCredits}
        sections={[
          {
            key: "menu",
            title: "Menu",
            items: [
              { key: "dashboard", label: "Dashboard", to: "/", icon: <DashboardIcon /> }
            ]
          },
          {
            key: "admin",
            title: "ADMIN",
            items: [
              { key: "users", label: "Usuarios", to: "/admin/users", active: true, icon: <UsersIcon /> },
              { key: "ledger", label: "Ledger de creditos", to: "/admin/ledger", icon: <LedgerIcon /> }
            ]
          },
          {
            key: "preferences",
            title: "Preferencias",
            items: [
              { key: "settings", label: "Configuracoes", to: "/settings", active: location.pathname === "/settings", icon: <SettingsIcon /> }
            ]
          }
        ]}
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
            <h1 className="heading-sm">Admin - Usuarios</h1>
            <p className="body-xs">Gestao de usuarios e ajuste de creditos.</p>
          </div>
          <span className="nav-item-icon nav-item-icon--large"><AdminIcon /></span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <Card className="stack-md animate-in">
          <form className="admin-search-form" onSubmit={applyUserSearch}>
            <div className="admin-search-field">
              <Input
                id="admin-search"
                label="Buscar usuario"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome ou e-mail"
              />
            </div>
            <Button type="submit" variant="secondary" className="admin-search-button admin-action-btn">
              Buscar
            </Button>
          </form>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Role</th>
                  <th>Saldo</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index}>
                        <td colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  : users.map((targetUser) => (
                      <tr key={targetUser.id}>
                        <td>{targetUser.name}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{targetUser.email}</td>
                        <td>
                          <Chip tone={targetUser.role === "ADMIN" ? "warning" : "default"}>{targetUser.role}</Chip>
                        </td>
                        <td>{targetUser.balance}</td>
                        <td>
                          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                            <Button variant="secondary" size="sm" onClick={() => openAdjustModal(targetUser)}>
                              Ajustar creditos
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <div className="flex-between" style={{ gap: "var(--space-2)", flexWrap: "wrap" }}>
            <div className="body-sm">Pagina {page}</div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  const next = Math.max(page - 1, 1);
                  setPage(next);
                  fetchUsers(next, search);
                }}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchUsers(next, search);
                }}
              >
                Proxima
              </Button>
            </div>
          </div>
        </Card>
      </main>

      <Modal open={adjustModalOpen} onClose={closeAdjustModal} title="Ajustar creditos">
        <form className="stack-md" onSubmit={submitAdjustCredits}>
          <div className="stack-sm">
            <h3 className="heading-sm">Ajustar creditos</h3>
            <p className="body-sm">
              Usuario: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{selectedUser?.name}</span>
            </p>
            <p className="body-xs">Use valor positivo para credito e negativo para debito.</p>
          </div>

          <Input
            id="credits-delta"
            label="Delta"
            type="number"
            value={delta}
            onChange={(event) => setDelta(event.target.value)}
            placeholder="+5 ou -2"
            required
          />

          {adjustError ? <p className="form-error">{adjustError}</p> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={closeAdjustModal} disabled={adjustLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={adjustLoading} loading={adjustLoading}>
              {adjustLoading ? (
                <>
                  <Spinner />
                  Salvando...
                </>
              ) : (
                "Salvar ajuste"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminUsers;
