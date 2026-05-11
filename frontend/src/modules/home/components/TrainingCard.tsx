import { GraduationCap } from "lucide-react";
import type { Course, ModuleId } from "../../../types/portal";
import Card from "./Card";

interface TrainingCardProps {
  courses: Course[];
  onNavigate: (moduleId: ModuleId) => void;
}

const TrainingCard = ({ courses, onNavigate }: TrainingCardProps) => (
  <Card title="Моё обучение" icon={<GraduationCap className="w-5 h-5 text-purple-600" />}>
    <div className="space-y-3">
      {courses
        .filter((course) => course.status !== "completed")
        .slice(0, 2)
        .map((course) => (
          <div key={course.id} className="p-3 border border-gray-200 rounded-lg">
            <p className="font-medium text-gray-900 mb-2">{course.title}</p>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{course.progress}%</span>
            </div>
          </div>
        ))}
    </div>
    <button onClick={() => onNavigate("training")} className="mt-4 text-sm text-purple-600 hover:underline">
      Все курсы →
    </button>
  </Card>
);

export default TrainingCard;
