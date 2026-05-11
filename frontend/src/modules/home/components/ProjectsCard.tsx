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
    icon={<Award className="w-5 h-5 text-purple-600" />}
    action={
      canEditPersonalFields ? (
        <button
          onClick={() => startEditing("projects", "add", {})}
          className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Добавить проект
        </button>
      ) : null
    }
  >
    <div className="space-y-3">
      {(user.projects || []).map((project) => (
        <div
          key={project.id}
          className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{project.name || "Без названия"}</h4>
            <div className="flex gap-2">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{project.position || "Не указана"}</p>
          <p className="text-xs text-gray-500">
            {project.start_d ? formatDate(project.start_d, "my") : "Не указано"} -{" "}
            {project.end_d ? formatDate(project.end_d, "my") : "настоящее время"}
          </p>
        </div>
      ))}
    </div>
  </Card>
);

export default ProjectsCard;
