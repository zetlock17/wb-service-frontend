import { Edit, Trash2, Plus, Users, SlidersVertical, UserMinus, UserPlus, X, Check } from "lucide-react";
import { useState } from "react";
import type { OrgUnitHierarchy, ProfileSearchEmployee } from "../../../api/orgStructureApi";
import Avatar from "../../../components/common/Avatar";
import type { ExpandedNodes } from "../types";
import Triangle from "./Triangle";
import VerticalDashed from "./VerticalDashed";
import EmployeeCard from "./EmployeeCard";

interface DepartmentNodeProps {
  unit: OrgUnitHierarchy;
  level?: number;
  expandedNodes: ExpandedNodes;
  setExpandedNodes: (nodes: ExpandedNodes) => void;
  canManage?: boolean;
  allUnits?: OrgUnitHierarchy[];
  employeesByUnit?: Record<number, ProfileSearchEmployee[]>;
  onEdit?: (unit: OrgUnitHierarchy) => void;
  onDelete?: (unit: OrgUnitHierarchy) => void;
  onSetManager?: (unit: OrgUnitHierarchy) => void;
  onRemoveManager?: (unit: OrgUnitHierarchy) => void;
  onAddEmployee?: (unit: OrgUnitHierarchy) => void;
  onRemoveEmployee?: (unit: OrgUnitHierarchy) => void;
  onRemoveEmployeeById?: (unitId: number, eid: string) => void;
  onMove?: (unit: OrgUnitHierarchy) => void;
  onCreateChild?: (parentId: number) => void;
  onOpenProfile?: (eid: string) => void;
}

const DepartmentNode = ({
  unit,
  level = 0,
  expandedNodes,
  setExpandedNodes,
  canManage = false,
  allUnits = [],
  employeesByUnit = {},
  onEdit,
  onDelete,
  onSetManager,
  onRemoveManager,
  onAddEmployee,
  onRemoveEmployee,
  onRemoveEmployeeById,
  onMove,
  onCreateChild,
  onOpenProfile,
}: DepartmentNodeProps) => {
  const [confirmingEid, setConfirmingEid] = useState<string | null>(null);
  const unitKey = `unit-${unit.id}`;
  const isExpanded = expandedNodes[unitKey] ?? true;
  const titleClass = level === 0 ? "text-2xl" : level === 1 ? "text-xl" : "text-lg";
  const lineColorClass = level > 0 ? "text-purple-300" : "text-purple-500";

  const handleToggle = () => {
    setExpandedNodes({ ...expandedNodes, [unitKey]: !isExpanded });
  };

  return (
    <div className="rounded-2xl border border-purple-100 bg-white/90 shadow-sm">
      <div className="flex gap-1">
        {unit.children && unit.children.length > 0 ? (
          <div
            className={`flex w-12 shrink-0 flex-col items-center px-2 ${
              isExpanded ? (level > 0 ? "pt-3 pb-2" : "pt-4 pb-3") : level > 0 ? "py-2" : "py-3"
            }`}
          >
            <button
              onClick={handleToggle}
              className="rounded-lg border border-purple-200 bg-white p-1 transition hover:bg-purple-50"
            >
              <Triangle
                isExpanded={isExpanded}
                className="h-5 w-5 cursor-pointer text-purple-600 transition-all hover:text-purple-500"
              />
            </button>
            {isExpanded && (
              <div className="flex h-full w-full justify-center pt-1">
                <VerticalDashed className={`h-full ${lineColorClass}`} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-12 shrink-0 items-start justify-center px-2 pt-4 font-black text-purple-300">
            —
          </div>
        )}

        <div className="flex-1 py-3 pr-4 pl-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`${titleClass} font-semibold text-gray-900`}>{unit.name}</h3>
              {unit.manager && (
                <EmployeeCard manager={unit.manager} level={0} onOpenProfile={onOpenProfile} />
              )}
            </div>

            {canManage && (
              <div className="flex gap-1 shrink-0">
                {!unit.manager && (
                  <button
                    onClick={() => onSetManager?.(unit)}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-purple-100"
                    title="Назначить руководителя"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                )}
                {unit.manager && (
                  <button
                    onClick={() => onRemoveManager?.(unit)}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-100"
                    title="Удалить руководителя"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onAddEmployee?.(unit)}
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-purple-100"
                  title="Добавить сотрудника"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onCreateChild?.(unit.id)}
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-purple-100"
                  title="Создать подразделение"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit?.(unit)}
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-purple-100"
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMove?.(unit)}
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-purple-100"
                  title="Переместить"
                >
                  <SlidersVertical className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete?.(unit)}
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-100"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {isExpanded && (() => {
            const managerEid = unit.manager?.eid;
            const unitEmployees = (employeesByUnit[unit.id] || []).filter(
              (e) => e.eid !== managerEid
            );
            return (
              <>
                {unitEmployees.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {unitEmployees.map((emp) => (
                      <div
                        key={emp.eid}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5"
                      >
                        <Avatar fullName={emp.full_name} size={6} />
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onOpenProfile?.(emp.eid)}
                            className="block truncate text-sm font-medium text-purple-600 hover:underline"
                          >
                            {emp.full_name}
                          </button>
                          {emp.position && (
                            <p className="truncate text-xs text-gray-600">{emp.position}</p>
                          )}
                        </div>
                        {canManage && (
                          confirmingEid === emp.eid ? (
                            <div className="flex shrink-0 items-center gap-1">
                              <span className="text-xs text-gray-500">Удалить?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onRemoveEmployeeById?.(unit.id, emp.eid);
                                  setConfirmingEid(null);
                                }}
                                className="rounded-lg p-1 text-red-600 transition-colors hover:bg-red-100"
                                title="Подтвердить"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingEid(null)}
                                className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100"
                                title="Отмена"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingEid(emp.eid)}
                              className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                              title="Удалить сотрудника"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {unit.children && unit.children.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {unit.children.map((child) => (
                      <DepartmentNode
                        key={child.id}
                        unit={child}
                        level={level + 1}
                        expandedNodes={expandedNodes}
                        setExpandedNodes={setExpandedNodes}
                        canManage={canManage}
                        allUnits={allUnits}
                        employeesByUnit={employeesByUnit}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onSetManager={onSetManager}
                        onRemoveManager={onRemoveManager}
                        onAddEmployee={onAddEmployee}
                        onRemoveEmployee={onRemoveEmployee}
                        onRemoveEmployeeById={onRemoveEmployeeById}
                        onMove={onMove}
                        onCreateChild={onCreateChild}
                        onOpenProfile={onOpenProfile}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default DepartmentNode;
