import { UserCheck, Users, X } from "lucide-react";
import type { ProfileSuggestion } from "../../../api/orgStructureApi";
import type { AckEmployee, AckOrgUnit, AckTargetMode } from "../types";

interface AckTargetSectionProps {
  ackTargetAll: boolean;
  onSelectAll: () => void;
  onSelectCustom: () => void;
  ackTargetMode: AckTargetMode;
  onChangeMode: (mode: AckTargetMode) => Promise<void> | void;

  ackSearchQuery: string;
  ackSearchResults: ProfileSuggestion[];
  ackSearchLoading: boolean;
  onSearch: (q: string) => Promise<void> | void;
  onAddEmployee: (emp: ProfileSuggestion) => void;
  ackSelectedEmployees: AckEmployee[];
  onRemoveEmployee: (eid: string) => void;

  ackOrgUnitOptions: AckOrgUnit[];
  ackSelectedOrgUnits: AckOrgUnit[];
  ackOrgUnitToAdd: string;
  onChangeOrgUnitToAdd: (id: string) => void;
  onLoadOrgUnits: () => Promise<void> | void;
  loadingAckOrgUnits: boolean;
  onAddOrgUnit: () => void;
  onRemoveOrgUnit: (id: number) => void;
}

const AckTargetSection = (props: AckTargetSectionProps) => {
  const {
    ackTargetAll,
    onSelectAll,
    onSelectCustom,
    ackTargetMode,
    onChangeMode,
    ackSearchQuery,
    ackSearchResults,
    ackSearchLoading,
    onSearch,
    onAddEmployee,
    ackSelectedEmployees,
    onRemoveEmployee,
    ackOrgUnitOptions,
    ackSelectedOrgUnits,
    ackOrgUnitToAdd,
    onChangeOrgUnitToAdd,
    onLoadOrgUnits,
    loadingAckOrgUnits,
    onAddOrgUnit,
    onRemoveOrgUnit,
  } = props;

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-blue-600" />
        Кому назначить ознакомление
      </p>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={ackTargetAll}
            onChange={onSelectAll}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Всем сотрудникам
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!ackTargetAll}
            onChange={onSelectCustom}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700">Выбранным сотрудникам</span>
        </label>
      </div>

      {!ackTargetAll && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChangeMode('employees')}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                ackTargetMode === 'employees'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              Сотрудники
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('departments')}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                ackTargetMode === 'departments'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              Отделы
            </button>
          </div>

          {ackTargetMode === 'employees' && (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={ackSearchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Поиск сотрудника..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {ackSearchResults.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {ackSearchResults.map((emp) => (
                      <button
                        key={emp.eid}
                        type="button"
                        onClick={() => onAddEmployee(emp)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800">{emp.full_name}</p>
                        <p className="text-xs text-gray-500">{emp.position} · {emp.department}</p>
                      </button>
                    ))}
                  </div>
                )}
                {ackSearchLoading && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-3 text-center text-sm text-gray-500">
                    Поиск...
                  </div>
                )}
              </div>

              {ackSelectedEmployees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ackSelectedEmployees.map((emp) => (
                    <span
                      key={emp.eid}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {emp.full_name}
                      <button
                        type="button"
                        onClick={() => onRemoveEmployee(emp.eid)}
                        className="hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {ackSelectedEmployees.length === 0 && (
                <p className="text-xs text-amber-600">Добавьте хотя бы одного сотрудника</p>
              )}
            </>
          )}

          {ackTargetMode === 'departments' && (
            <>
              <div className="flex gap-2">
                <select
                  value={ackOrgUnitToAdd}
                  onFocus={onLoadOrgUnits}
                  onChange={(e) => onChangeOrgUnitToAdd(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Выберите отдел</option>
                  {ackOrgUnitOptions
                    .filter((unit) => !ackSelectedOrgUnits.some((selected) => selected.id === unit.id))
                    .map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {`${'  '.repeat(unit.level)}${unit.name}`}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={onAddOrgUnit}
                  disabled={!ackOrgUnitToAdd}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:bg-gray-300"
                >
                  Добавить
                </button>
              </div>

              {loadingAckOrgUnits && (
                <p className="text-xs text-gray-500">Загрузка отделов...</p>
              )}

              {ackSelectedOrgUnits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ackSelectedOrgUnits.map((unit) => (
                    <span
                      key={unit.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {unit.name}
                      <button
                        type="button"
                        onClick={() => onRemoveOrgUnit(unit.id)}
                        className="hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {ackSelectedOrgUnits.length === 0 && (
                <p className="text-xs text-amber-600">Добавьте хотя бы один отдел</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AckTargetSection;
