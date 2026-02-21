import { Link } from "react-router-dom";
import Card from "./ui/Card.jsx";
import Chip from "./ui/Chip.jsx";

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-zinc-900">{project.title}</h3>
            <p className="text-sm text-zinc-500">
              {project.category || "Sem categoria"}
            </p>
          </div>
          <Chip tone={project.status === "READY" ? "accent" : "default"}>
            {project.status}
          </Chip>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(project.tags || []).slice(0, 4).map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </Card>
    </Link>
  );
}

export default ProjectCard;
