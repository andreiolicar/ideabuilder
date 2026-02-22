import { useEffect, useMemo, useState } from "react";
import CreateProjectModal from "../components/CreateProjectModal.jsx";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import {
  DashboardIcon,
  FolderIcon,
  LedgerIcon,
  LogoutIcon,
  UsersIcon
} from "../components/ui/SidebarIcons.jsx";
import useAuth from "../context/useAuth.js";
import useToast from "../context/useToast.js";
import api from "../lib/api.js";

const initialFilters = {
  search: "",
  category: "",
  tag: "",
  sort: "recent",
  page: 1
};

function Dashboard() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [filters, setFilters] = useState(initialFilters);
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchProjects = async (nextFilters) => {
    setLoading(true);
    setError("");

    try {
      const params = Object.fromEntries(
        Object.entries(nextFilters).filter(([, value]) => value !== "")
      );
      const { data } = await api.get("/projects", { params });
      setProjects(data.items || []);
      setMeta(data.meta || { page: 1, totalPages: 1, balance: 0 });
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Falha ao carregar projetos.";
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProjects(filters);
    }, 250);

    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilters = (field) => (event) => {
    setFilters((current) => ({
      ...current,
      [field]: event.target.value,
      page: field === "page" ? event.target.value : 1
    }));
  };

  const changePage = (step) => {
    setFilters((current) => {
      const nextPage = Math.min(Math.max(1, current.page + step), meta.totalPages || 1);
      return { ...current, page: nextPage };
    });
  };

  const balance = useMemo(() => meta.balance ?? 0, [meta.balance]);

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
              { key: "dashboard", label: "Dashboard", active: true, icon: <DashboardIcon /> }
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
            <Button fullWidth onClick={() => setCreateOpen(true)}>
              <span className="nav-item-icon"><FolderIcon /></span>
              Criar projeto
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
          <div>
            <h1 className="heading-sm">Dashboard</h1>
            <p className="body-xs">Seu hub para projetos e documentacoes de TCC.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Criar</Button>
        </div>

        <Card className="stack-md animate-in">
          <div
            style={{
              display: "grid",
              gap: "var(--space-3)",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
            }}
          >
            <Input
              id="search"
              label="Busca"
              value={filters.search}
              onChange={updateFilters("search")}
              placeholder="Nome do projeto"
            />
            <Input
              id="category"
              label="Categoria"
              value={filters.category}
              onChange={updateFilters("category")}
              placeholder="Web, IA..."
            />
            <Input
              id="tag"
              label="Tag"
              value={filters.tag}
              onChange={updateFilters("tag")}
              placeholder="Dados"
            />
            <label htmlFor="sort" className="form-group">
              <span className="label">Ordenacao</span>
              <select id="sort" value={filters.sort} onChange={updateFilters("sort")} className="input select">
                <option value="recent">Recentes</option>
                <option value="az">A-Z</option>
              </select>
            </label>
          </div>
        </Card>

        {error ? <p className="form-error">{error}</p> : null}

        <section className="content-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-40 w-full" />
              ))
            : projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </section>

        <div className="flex-between" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
          <div className="body-sm">
            Pagina {meta.page || 1} de {meta.totalPages || 1}
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button variant="secondary" onClick={() => changePage(-1)} disabled={meta.page <= 1}>
              Anterior
            </Button>
            <Button
              variant="secondary"
              onClick={() => changePage(1)}
              disabled={(meta.page || 1) >= (meta.totalPages || 1)}
            >
              Proxima
            </Button>
          </div>
        </div>
      </main>

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export default Dashboard;
