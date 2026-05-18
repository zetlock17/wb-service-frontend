import {
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  UserPlus,
  UserMinus,
  Crown,
  Move,
  Check,
  X,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { OrgUnitHierarchy, ProfileSearchEmployee } from "../../../api/orgStructureApi";
import Avatar from "../../../components/common/Avatar";
import type { ExpandedNodes } from "../types";
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

interface RowActionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "accent" | "danger";
}

const RowAction = ({ icon: Icon, label, onClick, tone = "neutral" }: RowActionProps) => {
  const tones: Record<string, string> = {
    neutral: "text-gray-400 hover:bg-wb-pink-light hover:text-wb-green",
    accent: "text-wb-green hover:bg-wb-pink-light",
    danger: "text-gray-400 hover:bg-red-50 hover:text-red-600",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};

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
  onRemoveEmployee: _onRemoveEmployee,
  onRemoveEmployeeById,
  onMove,
  onCreateChild,
  onOpenProfile,
}: DepartmentNodeProps) => {
  const [confirmingEid, setConfirmingEid] = useState<string | null>(null);
  const unitKey = `unit-${unit.id}`;
  const isExpanded = expandedNodes[unitKey] ?? level < 2;

  const managerEid = unit.manager?.eid;
  const unitMembers = (employeesByUnit[unit.id] || []).filter((e) => e.eid !== managerEid);
  const hasChildren = (unit.children?.length || 0) > 0;
  const hasMembers = unitMembers.length > 0;
  const hasContent = hasChildren || hasMembers || Boolean(unit.manager);

  const handleToggle = () => setExpandedNodes({ ...expandedNodes, [unitKey]: !isExpanded });

  return (
    <div className={`relative ${level > 0 ? "pl-5 sm:pl-8" : ""}`}>
      {level > 0 && (
        <span aria-hidden="true" className="absolute top-0 bottom-3 left-1.5 w-px bg-wb-pink-light sm:left-2.5" />
      )}

      <div className="group relative rounded-[22px] bg-white ring-1 ring-inset ring-gray-100 transition hover:ring-wb-pink-dark/30">
        {/* header row */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3.5">
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
            disabled={!hasContent}
            className={`inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg transition ${
              hasContent
                ? "bg-wb-pink-light text-wb-pink-dark hover:bg-wb-pink-light/70"
                : "text-gray-300"
            }`}
          >
            {hasContent && (
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            )}
          </button>

          <h3
            className={`min-w-0 truncate font-extrabold ${
              level === 0 ? "text-[20px] text-gray-900" : "text-[16px] text-gray-800"
            }`}
          >
            {unit.name}
          </h3>

          {(hasMembers || unit.manager) && (
            <span className="hidden items-center gap-1 rounded-full bg-wb-green-light px-2.5 py-1 text-[11.5px] font-extrabold text-wb-green sm:inline-flex">
              <Users className="h-3 w-3" />
              {unitMembers.length + (unit.manager ? 1 : 0)} чел.
            </span>
          )}

          {canManage && (
            <div className="ml-auto flex items-center gap-0.5">
              {!unit.manager ? (
                <RowAction icon={Crown} label="Назначить руководителя" onClick={() => onSetManager?.(unit)} tone="accent" />
              ) : (
                <RowAction icon={UserMinus} label="Удалить руководителя" onClick={() => onRemoveManager?.(unit)} tone="danger" />
              )}
              <RowAction icon={UserPlus} label="Добавить сотрудника" onClick={() => onAddEmployee?.(unit)} />
              <RowAction icon={Plus} label="Создать подразделение" onClick={() => onCreateChild?.(unit.id)} tone="accent" />
              <RowAction icon={Pencil} label="Редактировать" onClick={() => onEdit?.(unit)} />
              <RowAction icon={Move} label="Переместить" onClick={() => onMove?.(unit)} />
              <RowAction icon={Trash2} label="Удалить" onClick={() => onDelete?.(unit)} tone="danger" />
            </div>
          )}
        </div>

        {/* body */}
        {isExpanded && (
          <div className="px-4 pb-4">
            {/* manager */}
            {unit.manager && (
              <EmployeeCard manager={unit.manager} level={level} onOpenProfile={onOpenProfile} />
            )}

            {/* members grid */}
            {hasMembers && (
              <div className="mt-3">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-gray-400">
                  <Users className="h-3.5 w-3.5" />
                  Сотрудники
                  <span className="rounded-full bg-wb-pink-light px-2 py-0.5 text-[11px] font-extrabold text-wb-pink-dark">
                    {unitMembers.length}
                  </span>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {unitMembers.map((emp) => (
                    <li key={emp.eid}>
                      <div className="group/emp relative flex items-center gap-3 rounded-2xl bg-wb-pink-light/50 px-3.5 py-2.5 transition hover:bg-wb-pink-light">
                        <button
                          type="button"
                          onClick={() => onOpenProfile?.(emp.eid)}
                          className="shrink-0"
                          aria-label={`Профиль ${emp.full_name}`}
                        >
                          <Avatar fullName={emp.full_name} size={10} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onOpenProfile?.(emp.eid)}
                            className="block w-full truncate text-left text-[14px] font-extrabold text-wb-pink-dark transition hover:underline"
                          >
                            {emp.full_name}
                          </button>
                          {emp.position && (
                            <p className="truncate text-[12.5px] font-semibold text-gray-600">{emp.position}</p>
                          )}
                        </div>
                        {canManage && (
                          confirmingEid === emp.eid ? (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onRemoveEmployeeById?.(unit.id, emp.eid);
                                  setConfirmingEid(null);
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white transition hover:opacity-90"
                                title="Подтвердить"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingEid(null)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-500 ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50"
                                title="Отмена"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingEid(emp.eid)}
                              className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 opacity-0 transition group-hover/emp:opacity-100 hover:bg-white hover:text-red-600"
                              title="Удалить сотрудника"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* empty state */}
            {!unit.manager && !hasMembers && !hasChildren && (
              <p className="mt-3 rounded-2xl bg-wb-pink-light/40 px-4 py-3 text-[13px] font-semibold text-gray-500">
                В этом подразделении пока нет сотрудников.
              </p>
            )}

            {/* children */}
            {hasChildren && (
              <div className="mt-4 flex flex-col gap-2.5">
                {unit.children!.map((child) => (
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
                    onRemoveEmployee={_onRemoveEmployee}
                    onRemoveEmployeeById={onRemoveEmployeeById}
                    onMove={onMove}
                    onCreateChild={onCreateChild}
                    onOpenProfile={onOpenProfile}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentNode;
