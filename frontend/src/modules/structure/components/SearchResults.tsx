import { Mail, Phone } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import type { ProfileSearchResult } from "../../../api/orgStructureApi";

interface SearchResultsProps {
  results: ProfileSearchResult;
  searchError: string | null;
  onOpenProfile: (eid: string) => void;
  onReset: () => void;
}

const SearchResults = ({ results, searchError, onOpenProfile, onReset }: SearchResultsProps) => (
  <>
    <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-4">
      <div className="text-sm text-gray-600">Найдено сотрудников: {results.total}</div>
      <button
        onClick={onReset}
        className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
      >
        Сбросить
      </button>
    </div>

    {results.total > 0 ? (
      <div className="space-y-4">
        {results.results.map((emp) => (
          <div key={emp.eid} className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <Avatar fullName={emp.full_name} size={16} />
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => onOpenProfile(String(emp.eid))}
                  className="mb-1 text-left text-xl font-semibold text-purple-600 hover:underline"
                >
                  {emp.full_name}
                </button>
                <p className="text-base text-gray-700 mb-3">{emp.position}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Департамент:</span>
                    <span className="text-gray-700">{emp.organization_unit_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Band:</span>
                    <span className="text-gray-700">{emp.work_band}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Email:</span>
                    <a
                      href={`mailto:${emp.work_email}`}
                      className="inline-flex items-center gap-1 text-purple-600 hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {emp.work_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Телефон:</span>
                    <a
                      href={`tel:${emp.work_phone}`}
                      className="inline-flex items-center gap-1 text-purple-600 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {emp.work_phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : searchError ? (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="text-center py-12 text-red-500">
          <p>Ошибка при поиске сотрудников</p>
          <p className="text-sm mt-1">{searchError}</p>
        </div>
      </div>
    ) : (
      <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="text-center py-12 text-gray-500">
          <p>Сотрудники не найдены</p>
          <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
        </div>
      </div>
    )}
  </>
);

export default SearchResults;
