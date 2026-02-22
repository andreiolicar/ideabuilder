import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Chip from "../components/ui/Chip.jsx";
import Input from "../components/ui/Input.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import {
  AdminIcon,
  DashboardIcon,
  LedgerIcon,
  LogoutIcon,
  UsersIcon
} from "../components/ui/SidebarIcons.jsx";
import useAuth from "../context/useAuth.js";
import useToast from "../context/useToast.js";
import api from "../lib/api.js";

function AdminLedger() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerUserId, setLedgerUserId] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get("/admin/users", { params: { page: 1 } });
      setUsers(data.items || []);
    } catch {
      // best effort for profile credits
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLedger = async (nextPage = ledgerPage, nextUserId = ledgerUserId) => {
    setLoadingLedger(true);
    setError("");
    try {
      const { data } = await api.get("/admin/credits/ledger", {
        params: { page: nextPage, userId: nextUserId || undefined }
      });
      setLedger(data.items || []);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Falha ao listar ledger.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyLedgerFilter = (userId = "") => {
    setLedgerPage(1);
    setLedgerUserId(userId);
    fetchLedger(1, userId);
  };

  const myCredits = useMemo(() => {
    const currentUser = users.find((item) => item.id === user?.id);
    return currentUser?.balance ?? "--";
  }, [users, user?.id]);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        credits={loadingUsers ? "--" : myCredits}
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
              { key: "users", label: "Usuarios", to: "/admin/users", icon: <UsersIcon /> },
              { key: "ledger", label: "Ledger de creditos", to: "/admin/ledger", active: true, icon: <LedgerIcon /> }
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
            <h1 className="heading-sm">Admin - Ledger de creditos</h1>
            <p className="body-xs">Auditoria de movimentacoes de credito/debito.</p>
          </div>
          <span className="nav-item-icon nav-item-icon--large"><AdminIcon /></span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <Card className="stack-md animate-in">
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ minWidth: "260px", flex: 1 }}>
              <Input
                id="ledger-user-id"
                label="Filtro por userId"
                value={ledgerUserId}
                onChange={(event) => setLedgerUserId(event.target.value)}
                placeholder="UUID do usuario"
              />
            </div>
            <Button variant="secondary" onClick={() => applyLedgerFilter(ledgerUserId)}>
              Aplicar
            </Button>
            <Button variant="ghost" onClick={() => applyLedgerFilter("")}>
              Limpar
            </Button>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Motivo</th>
                  <th>Valor</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {loadingLedger
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  : ledger.map((item) => (
                      <tr key={item.id}>
                        <td style={{ color: "var(--text-secondary)" }}>{item.userId}</td>
                        <td>
                          <Chip tone={item.type === "CREDIT" ? "success" : "warning"}>{item.type}</Chip>
                        </td>
                        <td>{item.reason}</td>
                        <td>{item.amount}</td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {new Date(item.createdAt).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <div className="flex-between" style={{ gap: "var(--space-2)", flexWrap: "wrap" }}>
            <div className="body-sm">Pagina {ledgerPage}</div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  const next = Math.max(ledgerPage - 1, 1);
                  setLedgerPage(next);
                  fetchLedger(next, ledgerUserId);
                }}
                disabled={ledgerPage <= 1}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const next = ledgerPage + 1;
                  setLedgerPage(next);
                  fetchLedger(next, ledgerUserId);
                }}
              >
                Proxima
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default AdminLedger;
