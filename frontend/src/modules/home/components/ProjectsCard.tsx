import { Award, ExternalLink, Plus } from "lucide-react";
import type { UserProfile } from "../../../types/portal";
import { formatDate } from "../utils/dateUtils";
import Card from "./Card";

interface ProjectsCardProps {
  user: UserProfile;
  canEditPersonalFields: boolean;
  startEditing: (section: string, field?: string, currentValue?: unknown) => void;
}

const ProjectsCard = ({ user, canEditPersonalFields, startEditing }: ProjectsCardProps) => (
  <Card
    title="Проекты"
    icon={<Award className="w-4 h-4 text-wb-green" />}
    action={
      canEditPersonalFields ? (
        <button
          onClick={() => startEditing("projects", "add", {})}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-full hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Добавить проект
        </button>
      ) : null
    }
  >
    <div className="space-y-2">
      {(user.projects || []).map((project) => (
        <div
          key={project.id}
          className="flex items-start justify-between p-4 bg-wb-pink-light rounded-xl hover:bg-pink-100 transition-colors"
        >
          <div>
            <h4 className="font-semibold text-gray-900 mb-0.5">{project.name || "Без названия"}</h4>
            <p className="text-sm text-gray-500 mb-0.5">{project.position || "Не указана"}</p>
            <p className="text-xs text-gray-400">
              {project.start_d ? formatDate(project.start_d, "my") : "Не указано"} —{" "}
              {project.end_d ? formatDate(project.end_d, "my") : "настоящее время"}
            </p>
          </div>
          {project.link && (
            <a
              href={/^https?:\/\//i.test(project.link) ? project.link : `https://${project.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 bg-wb-green-light text-wb-green-dark rounded-lg hover:bg-wb-green hover:text-white transition-colors shrink-0"
              aria-label="Открыть проект"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  </Card>
);

export default ProjectsCard;
