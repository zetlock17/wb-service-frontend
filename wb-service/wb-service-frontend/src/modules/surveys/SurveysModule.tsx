import { BarChart3, CalendarClock, CheckCircle, Loader, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { Survey } from "../../types/portal";

const SurveysModule = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const { surveys, loading } = usePortalStore();

  const filteredSurveys = useMemo(() => {
    if (statusFilter === "all") {
      return surveys;
    }
    return surveys.filter((survey) => survey.status === statusFilter);
  }, [surveys, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex gap-3 mb-6">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-4">
            <div className="h-28 bg-gray-200 rounded"></div>
            <div className="h-28 bg-gray-200 rounded"></div>
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
            <h2 className="text-2xl font-bold text-gray-900">Опросы и голосования</h2>
            <p className="text-gray-500 text-sm mt-1">Ваш голос помогает улучшать сервисы банка</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Создать опрос
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Все", value: "all" },
            { label: "Активные", value: "active" },
            { label: "Завершённые", value: "completed" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as typeof statusFilter)}
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
        <div className="space-y-4">
          {filteredSurveys.map((survey) => {
            const completion = Math.round((survey.responses / survey.total) * 100);
            return (
              <div key={survey.id} className="border border-gray-200 rounded-lg p-5">
                <div className="flex flex-wrap gap-4 items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {survey.status === "active" ? (
                        <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm font-medium text-gray-600">
                        {survey.status === "active" ? "Активен до" : "Завершён"} {survey.endDate}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{survey.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{survey.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSurvey(survey)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                      survey.status === "active"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    {survey.status === "active" ? "Пройти опрос" : "Посмотреть результаты"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex-1 min-w-44">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Участие</span>
                      <span>{completion}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" />
                    Ответили {survey.responses} из {survey.total}
                  </div>
                </div>
              </div>
            );
          })}
          {!filteredSurveys.length && (
            <p className="text-center text-gray-500 py-8">Опросы по выбранным параметрам не найдены</p>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(selectedSurvey)} title={selectedSurvey?.title ?? ""} onClose={() => setSelectedSurvey(null)}>
        {selectedSurvey && (
          <div className="space-y-5">
            <p className="text-gray-600">{selectedSurvey.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                {selectedSurvey.status === "active" ? "Активный" : "Завершён"}
              </span>
              <span>Дедлайн: {selectedSurvey.endDate}</span>
              <span>Ответов: {selectedSurvey.responses}</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 mb-2">Насколько вы удовлетворены работой корпоративных сервисов?</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Отлично", "Хорошо", "Удовлетворительно", "Нужно улучшить"].map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="radio" name="survey-option" className="text-purple-600" />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">Комментарий</p>
                <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} placeholder="Поделитесь своими предложениями" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 min-w-44 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Отправить ответы</button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setSelectedSurvey(null)}>
                Закрыть
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SurveysModule;
