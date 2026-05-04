import { Edit, Trash2, Plus, Users, SlidersVertical } from "lucide-react";
import type { OrgUnitHierarchy } from "../../../api/orgStructureApi";
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
  onEdit?: (unit: OrgUnitHierarchy) => void;
  onDelete?: (unit: OrgUnitHierarchy) => void;
  onSetManager?: (unit: OrgUnitHierarchy) => void;
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
  onEdit,
  onDelete,
  onSetManager,
  onMove,
  onCreateChild,
  onOpenProfile,
}: DepartmentNodeProps) => {
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

          {isExpanded && unit.children && unit.children.length > 0 && (
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
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSetManager={onSetManager}
                  onMove={onMove}
                  onCreateChild={onCreateChild}
                  onOpenProfile={onOpenProfile}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentNode;
