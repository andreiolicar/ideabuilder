import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CreateProjectModal from "../components/CreateProjectModal.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Chip from "../components/ui/Chip.jsx";
import Input from "../components/ui/Input.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import useAuth from "../context/useAuth.js";
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

  const [filters, setFilters] = useState(initialFilters);
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchProjects = async (nextFilters = filters) => {
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
      setError(requestError?.response?.data?.message || "Falha ao carregar projetos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilters = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    fetchProjects(next);
  };

  const changePage = (step) => {
    const nextPage = Math.min(Math.max(1, meta.page + step), meta.totalPages || 1);
    const nextFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    fetchProjects(nextFilters);
  };

  return (
    <main className="app-shell space-y-6">
      <header className="panel flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Seus Projetos
          </h1>
          <p className="text-sm text-zinc-500">
            Olá, {user?.name}. Crie ideias e mantenha tudo organizado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone="accent">
            Saldo: {meta.balance ?? 0} {(meta.balance ?? 0) === 1 ? "credito" : "creditos"}
          </Chip>
          <Chip>{user?.role || "USER"}</Chip>
          {user?.role === "ADMIN" ? (
            <Link to="/admin">
              <Button variant="secondary">Admin</Button>
            </Link>
          ) : null}
          <Button variant="ghost" onClick={logout}>
            Sair
          </Button>
          <Button onClick={() => setCreateOpen(true)}>Criar Projeto</Button>
        </div>
      </header>

      <Card>
        <form className="grid gap-3 sm:grid-cols-5" onSubmit={applyFilters}>
          <div className="sm:col-span-2">
            <Input
              id="search"
              label="Busca"
              value={filters.search}
              onChange={updateFilters("search")}
              placeholder="Nome do projeto"
            />
          </div>
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
          <label htmlFor="sort" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Ordenacao</span>
            <select
              id="sort"
              value={filters.sort}
              onChange={updateFilters("sort")}
              className="h-11 rounded-2xl border border-zinc-200/80 bg-white px-3.5 text-sm text-zinc-900 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20"
            >
              <option value="recent">Recentes</option>
              <option value="az">A-Z</option>
            </select>
          </label>
          <div className="sm:col-span-5 flex justify-end">
            <Button type="submit" variant="secondary">
              Aplicar filtros
            </Button>
          </div>
        </form>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))
          : projects.map((project) => <ProjectCard key={project.id} project={project} />)}
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => changePage(-1)} disabled={meta.page <= 1}>
          Anterior
        </Button>
        <span className="text-sm text-zinc-500">
          Pagina {meta.page || 1} de {meta.totalPages || 1}
        </span>
        <Button
          variant="secondary"
          onClick={() => changePage(1)}
          disabled={(meta.page || 1) >= (meta.totalPages || 1)}
        >
          Proxima
        </Button>
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </main>
  );
}

export default Dashboard;
