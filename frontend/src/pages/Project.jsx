import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import MarkdownViewer from "../components/MarkdownViewer.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Chip from "../components/ui/Chip.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import {
  BackIcon,
  DashboardIcon,
  LedgerIcon,
  LogoutIcon,
  UsersIcon
} from "../components/ui/SidebarIcons.jsx";
import useAuth from "../context/useAuth.js";
import api from "../lib/api.js";

function simplifyTitle(title) {
  const normalized = String(title || "").trim();
  if (!normalized) {
    return "Projeto sem titulo";
  }

  return normalized.split(":")[0].trim();
}

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [project, setProject] = useState(null);
  const [balance, setBalance] = useState("--");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data.project);
        const listResponse = await api.get("/projects", { params: { page: 1 } });
        setBalance(listResponse?.data?.meta?.balance ?? "--");
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Nao foi possivel carregar.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        credits={balance}
        sections={[
          {
            key: "menu",
            title: "Menu",
            items: [
              { key: "dashboard", label: "Dashboard", to: "/", icon: <DashboardIcon /> }
            ]
          },
          ...(user?.role === "ADMIN"
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
            : [])
        ]}
        footer={
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            <Button fullWidth variant="secondary" onClick={() => navigate("/")}>
              <span className="nav-item-icon"><BackIcon /></span>
              Dashboard
            </Button>
            <Button fullWidth variant="ghost" onClick={logout}>
              <span className="nav-item-icon"><LogoutIcon /></span>
              Sair
            </Button>
          </div>
        }
      />

      <main className="dashboard-main">
        <div className="main-topbar">
          <div className="main-topbar-left">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <span className="nav-item-icon"><BackIcon /></span>
              Voltar
            </Button>
            <div>
              <h1 className="heading-sm">Detalhes do projeto</h1>
              <p className="body-xs">Acesse, copie e gerencie os documentos gerados.</p>
            </div>
          </div>
          <Button
            variant="secondary"
            disabled={loading || deleting}
            onClick={async () => {
              const confirmed = window.confirm("Tem certeza que deseja excluir este projeto?");
              if (!confirmed) {
                return;
              }

              try {
                setDeleting(true);
                await api.delete(`/projects/${id}`);
                navigate("/", { replace: true });
              } catch (requestError) {
                setError(requestError?.response?.data?.message || "Nao foi possivel excluir o projeto.");
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? "Excluindo..." : "Excluir projeto"}
          </Button>
        </div>

        {loading ? (
          <div className="stack-md">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : (
          <>
            <Card className="stack-md">
              <div className="flex-between" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
                <div>
                  <h2 className="heading-md">{simplifyTitle(project?.title)}</h2>
                  <p className="body-sm">{project?.category || "Sem categoria"}</p>
                </div>
                <Chip tone={project?.status === "READY" ? "success" : "warning"}>{project?.status}</Chip>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {(project?.tags || []).map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            </Card>

            <MarkdownViewer documents={project?.documents || []} />
          </>
        )}
      </main>
    </div>
  );
}

export default Project;
