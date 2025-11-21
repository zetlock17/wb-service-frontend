import { BookOpen, CheckCircle2, Download, Play, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { Course } from "../../types/portal";

type StatusFilter = "all" | Course["status"];

const statusLabels: Record<Course["status"], string> = {
  completed: "Завершён",
  in_progress: "В процессе",
  not_started: "Не начат",
};

const TrainingModule = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { courses, loading } = usePortalStore();

  const filteredCourses = useMemo(() => {
    if (statusFilter === "all") {
      return courses;
    }
    return courses.filter((course) => course.status === statusFilter);
  }, [courses, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex gap-3 mb-6">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Обучение и развитие</h2>
            <p className="text-gray-500 text-sm mt-1">Проходите обязательные программы и выбирайте курсы по интересам</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Записаться на курс
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Все", value: "all" },
            { label: "Завершённые", value: "completed" },
            { label: "В процессе", value: "in_progress" },
            { label: "Не начаты", value: "not_started" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as StatusFilter)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                statusFilter === filter.value
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  {course.mandatory && <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">Обязательно</span>}
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{statusLabels[course.status]}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{course.description}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Прогресс</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className={`flex-1 min-w-40 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${
                    course.status === "completed"
                      ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {course.status === "completed" ? <Download className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {course.status === "completed" ? "Сертификат" : "Продолжить"}
                </button>
                {course.mandatory && course.status !== "completed" && (
                  <span className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium self-center">
                    До завершения: {course.duration}
                  </span>
                )}
              </div>
            </div>
          ))}
          {!filteredCourses.length && (
            <p className="text-center text-gray-500 col-span-full py-8">Курсы по фильтру отсутствуют</p>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(selectedCourse)} title={selectedCourse?.title ?? ""} onClose={() => setSelectedCourse(null)}>
        {selectedCourse && (
          <div className="space-y-4">
            <p className="text-gray-700">{selectedCourse.description}</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded-full">Длительность: {selectedCourse.duration}</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">Статус: {statusLabels[selectedCourse.status]}</span>
              {selectedCourse.mandatory && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Обязательный курс</span>}
            </div>
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-2">Программа модуля</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Введение и цели курса</li>
                <li>Практическая часть с примерами</li>
                <li>Итоговое тестирование</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 min-w-40 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {selectedCourse.status === "completed" ? "Скачать сертификат" : "Начать обучение"}
              </button>
              {selectedCourse.status === "completed" && selectedCourse.certificate && (
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Просмотр сертификата
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrainingModule;
