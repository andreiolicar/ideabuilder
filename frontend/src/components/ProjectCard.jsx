import { Link } from "react-router-dom";
import Card from "./ui/Card.jsx";
import Chip from "./ui/Chip.jsx";

function simplifyTitle(title) {
  const normalized = String(title || "").trim();
  if (!normalized) {
    return "Projeto sem titulo";
  }

  return normalized.split(":")[0].trim();
}

function ProjectCard({ project, selectable = false, selected = false, onToggleSelect }) {
  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card className="h-full animate-in" style={{ transition: "transform var(--transition-fast)" }}>
        <div className="flex-between" style={{ gap: "var(--space-4)", alignItems: "flex-start" }}>
          <div className="stack-sm">
            <h3 className="heading-sm">{simplifyTitle(project.title)}</h3>
            <p className="body-sm">{project.category || "Sem categoria"}</p>
          </div>
          {selectable ? (
            <button
              type="button"
              className={["project-select-check", selected ? "is-selected" : ""].join(" ")}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleSelect?.(project.id, !selected);
              }}
            >
              <span>{selected ? "✓" : ""}</span>
            </button>
          ) : null}
        </div>

        <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {(project.tags || []).slice(0, 4).map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </Card>
    </Link>
  );
}

export default ProjectCard;
