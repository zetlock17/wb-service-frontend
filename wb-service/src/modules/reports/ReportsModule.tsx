import { Download, ExternalLink, FileOutput, Filter, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { ReportCard } from "../../types/portal";

const ReportsModule = () => {
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);
  const [period, setPeriod] = useState("month");
  const { reports, loading } = usePortalStore();

  const summary = useMemo(
    () => ({
      users: period === "month" ? "+12%" : "+4%",
      documents: period === "month" ? "+8%" : "+2%",
      training: period === "month" ? "+23%" : "+11%",
    }),
    [period],
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-gray-200 rounded"></div>
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
            <h2 className="text-2xl font-bold text-gray-900">Отчётность и аналитика</h2>
            <p className="text-gray-500 text-sm mt-1">Следите за ключевыми метриками портала и подразделений</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="bg-transparent focus:outline-none"
              >
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
                <option value="quarter">Квартал</option>
              </select>
            </div>
            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Обновить данные
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <FileOutput className="w-4 h-4" />
              Экспорт PDF
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Активность пользователей</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">1 245</p>
            <p className="text-sm text-green-600">{summary.users} за период</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Просмотры документов</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">8 912</p>
            <p className="text-sm text-green-600">{summary.documents} за период</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Завершено обучений</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">384</p>
            <p className="text-sm text-green-600">{summary.training} за период</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="border border-gray-200 rounded-lg p-5 text-left hover:shadow-md transition-shadow"
            >
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600 w-fit mb-4">
                <report.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
                Открыть отчёт
                <ExternalLink className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={Boolean(selectedReport)} title={selectedReport?.name ?? ""} onClose={() => setSelectedReport(null)}>
        {selectedReport && (
          <div className="space-y-4">
            <p className="text-gray-600">{selectedReport.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Уникальные пользователи", "Просмотры", "Среднее время", "Скачивания"].map((metric, index) => (
                <div key={metric} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-500">{metric}</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{1_200 + index * 134}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 min-w-40 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 justify-center">
                <Download className="w-4 h-4" />
                Скачать XLSX
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Открыть в BI
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsModule;