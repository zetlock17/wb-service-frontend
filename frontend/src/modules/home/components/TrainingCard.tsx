import { GraduationCap } from "lucide-react";
import type { Course, ModuleId } from "../../../types/portal";
import Card from "./Card";

interface TrainingCardProps {
  courses: Course[];
  onNavigate: (moduleId: ModuleId) => void;
}

const TrainingCard = ({ courses, onNavigate }: TrainingCardProps) => (
  <Card title="Моё обучение" icon={<GraduationCap className="w-4 h-4 text-wb-green" />}>
    <div className="space-y-3">
      {courses
        .filter((course) => course.status !== "completed")
        .slice(0, 2)
        .map((course) => (
          <div key={course.id} className="p-4 bg-wb-pink-light rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 text-sm">{course.title}</p>
              <span className="text-sm font-medium text-wb-green">{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-wb-green rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        ))}
    </div>
    <button
      onClick={() => onNavigate("training")}
      className="mt-4 text-sm text-wb-green hover:text-wb-green-dark flex items-center gap-1 transition-colors"
    >
      Все курсы →
    </button>
  </Card>
);

export default TrainingCard;
