import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MarkdownViewer from "../components/MarkdownViewer.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Chip from "../components/ui/Chip.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import api from "../lib/api.js";

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
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
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Nao foi possivel carregar.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <main className="app-shell space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost">Voltar</Button>
        </Link>
        <Button
          variant="secondary"
          className="border-rose-200/80 text-rose-700 hover:bg-rose-50"
          disabled={loading || deleting}
          onClick={async () => {
            const confirmed = window.confirm(
              "Tem certeza que deseja excluir este projeto?"
            );
            if (!confirmed) {
              return;
            }

            try {
              setDeleting(true);
              await api.delete(`/projects/${id}`);
              navigate("/", { replace: true });
            } catch (requestError) {
              setError(
                requestError?.response?.data?.message ||
                  "Nao foi possivel excluir o projeto."
              );
            } finally {
              setDeleting(false);
            }
          }}
        >
          {deleting ? "Excluindo..." : "Excluir projeto"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : (
        <>
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {project?.title}
                </h1>
                <p className="text-sm text-zinc-500">
                  {project?.category || "Sem categoria"}
                </p>
              </div>
              <Chip tone={project?.status === "READY" ? "accent" : "default"}>
                {project?.status}
              </Chip>
            </div>
            <div className="flex flex-wrap gap-2">
              {(project?.tags || []).map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          </Card>

          <MarkdownViewer documents={project?.documents || []} />
        </>
      )}
    </main>
  );
}

export default Project;
