import { Mail, Phone, Building2, Award, Users } from "lucide-react";
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
    <div className="flex items-center justify-between rounded-[28px] bg-white p-5">
      <div className="text-[14.5px] font-bold text-gray-700">
        Найдено сотрудников:{" "}
        <span className="text-wb-pink-dark">{results.total}</span>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-full bg-wb-pink-light px-4 py-2 text-[13.5px] font-bold text-wb-green transition hover:opacity-80"
      >
        Сбросить
      </button>
    </div>

    {results.total > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {results.results.map((emp) => (
          <article
            key={emp.eid}
            className="group rounded-[28px] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onOpenProfile(String(emp.eid))}
                className="shrink-0"
                aria-label={`Профиль ${emp.full_name}`}
              >
                <Avatar fullName={emp.full_name} size={16} />
              </button>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onOpenProfile(String(emp.eid))}
                  className="block text-left text-[18px] font-extrabold text-gray-900 transition hover:text-wb-green hover:underline"
                >
                  {emp.full_name}
                </button>
                <p className="mt-0.5 truncate text-[14px] font-semibold text-gray-600">{emp.position}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {emp.organization_unit_name && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light px-2.5 py-1 text-[12px] font-extrabold text-wb-pink-dark">
                      <Building2 className="h-3 w-3" />
                      {emp.organization_unit_name}
                    </span>
                  )}
                  {emp.work_band && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-wb-green-light px-2.5 py-1 text-[12px] font-extrabold text-wb-green">
                      <Award className="h-3 w-3" />
                      {emp.work_band}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {(emp.work_email || emp.work_phone) && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3.5">
                {emp.work_email && (
                  <a
                    href={`mailto:${emp.work_email}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light/60 px-3 py-1.5 text-[12.5px] font-bold text-wb-green transition hover:bg-wb-pink-light"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {emp.work_email}
                  </a>
                )}
                {emp.work_phone && (
                  <a
                    href={`tel:${emp.work_phone}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light/60 px-3 py-1.5 text-[12.5px] font-bold text-wb-green transition hover:bg-wb-pink-light"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {emp.work_phone}
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    ) : searchError ? (
      <div className="rounded-[28px] bg-white p-12 text-center">
        <p className="text-[15px] font-extrabold text-red-600">Ошибка при поиске сотрудников</p>
        <p className="mt-1 text-[13px] font-semibold text-gray-500">{searchError}</p>
      </div>
    ) : (
      <div className="rounded-[28px] bg-white p-12 text-center">
        <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-wb-pink-light text-wb-pink-dark">
          <Users className="h-7 w-7" />
        </div>
        <p className="text-[15px] font-extrabold text-gray-700">Сотрудники не найдены</p>
        <p className="mt-1 text-[13px] font-semibold text-gray-500">Попробуйте изменить параметры поиска</p>
      </div>
    )}
  </>
);

export default SearchResults;
