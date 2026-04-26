import { Download, Search, SlidersVertical, Edit, Trash2, Plus, Users, Network, Building2, Crown, Sparkles, RotateCw, Mail, Phone } from "lucide-react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { searchHierarchy, searchSuggestHierarchy, type OrgUnitHierarchy, type OrgUnitManager, type ProfileSearchResult, type ProfileSuggestion } from "../../api/orgStructureApi";
import usePortalStore from "../../store/usePortalStore";
import {
  CreateOrgUnitModal,
  EditOrgUnitModal,
  DeleteOrgUnitModal,
  SetManagerModal,
  MoveOrgUnitModal,
} from "./OrgUnitManagement"; 
import Avatar from "../../components/common/Avatar";


const Triangle = ({ isExpanded, className = "" }: { isExpanded: boolean; className?: string }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
  >
    <path
      d={isExpanded ? "M2 2 L6 8 L10 2 Z" : "M4 2 L10 6 L4 10 Z"}
    />
  </svg>
);

const VerticalDashed = ({
  width = 12,
  lineWidth = 4,
  dashLen = 12,
  gap = 4,
  className = "",
}: {
  width?: number;
  lineWidth?: number;
  dashLen?: number;
  gap?: number;
  className?: string;
}) => {
  const total = dashLen + gap;
  const rectX = (width - lineWidth) / 2;
  
  const colorMatch = className.match(/text-(\w+-?\d+)/);
  const colorClass = colorMatch ? colorMatch[1] : "purple-300";
  
  const tailwindColors: { [key: string]: string } = {
    "purple-300": "#d8b4fe",
    "purple-400": "#c084fc",
    "purple-500": "#a855f7",
    "purple-600": "#9333ea",
  };
  
  const color = tailwindColors[colorClass];
  
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${total}' viewBox='0 0 ${width} ${total}'>
      <rect x='${rectX}' y='0' width='${lineWidth}' height='${dashLen}' rx='${lineWidth / 2}' fill='${color}' />
    </svg>
  `;
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        minHeight: "100%",
        backgroundImage: `url("${uri}")`,
        backgroundRepeat: "repeat-y",
        backgroundPosition: "center top",
        backgroundSize: `${width}px ${total}px`,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    />
  );
};

interface ExpandedNodes {
  [key: string]: boolean;
}

// interface SearchableEmployee {
//   eid: number;
//   full_name: string;
//   position: string;
// }

// const collectAllEmployees = (
//   nodes: OrgUnitHierarchy[]
// ): SearchableEmployee[] => {
//   const employees: SearchableEmployee[] = [];

//   const collect = (node: OrgUnitHierarchy) => {
//     if (node.manager) {
//       employees.push({
//         eid: node.manager.eid,
//         full_name: node.manager.full_name,
//         position: node.manager.position,
//       });
//     }
//     if (node.children && node.children.length > 0) {
//       node.children.forEach(collect);
//     }
//   };

//   nodes.forEach(collect);
//   return employees;
// };

interface EmployeeCardProps {
  manager: OrgUnitManager;
  level: number;
  onOpenProfile?: (eid: string) => void;
}

const EmployeeCard = ({ manager, level, onOpenProfile }: EmployeeCardProps) => {
  return (
    <div className="mt-2 flex gap-0">
      <div className="flex flex-col items-center">
        {level > 0 && (
          <>
            <div
              className="p-1 font-black text-purple-300">
                —
            </div>
          </>
        ) }
      </div>

      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-2.5">
          <div className="flex flex-row items-center gap-2">
            <Avatar
              fullName={manager.full_name}
              size={6}
            />
            <button
              type="button"
              onClick={() => onOpenProfile?.(manager.eid)}
              className="truncate text-base font-medium text-purple-600 hover:underline"
            >
              {manager.full_name}
            </button>
          </div>
          <p className="truncate pl-8 text-sm text-gray-600">{manager.position}</p>
        </div>
      </div>
    </div>
  );
};



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
    setExpandedNodes({
      ...expandedNodes,
      [unitKey]: !isExpanded,
    });
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
                <EmployeeCard
                  manager={unit.manager}
                  level={0}
                  onOpenProfile={onOpenProfile}
                />
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

const StructureModule = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});

  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);

  const { organizationHierarchy, loading, fetchOrgStructure, roles } = usePortalStore();

  // Модальные окна
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [setManagerModalOpen, setSetManagerModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  
  const [selectedUnit, setSelectedUnit] = useState<OrgUnitHierarchy | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  // Проверка прав на управление
  const canManage = roles.includes('admin') || roles.includes('hr');

  useEffect(() => {
    if (organizationHierarchy.length === 0) {
      fetchOrgStructure();
    }
  }, [organizationHierarchy.length, fetchOrgStructure]);

  const [filteredEmployees, setFilteredEmployees] = useState<ProfileSearchResult>({total: 0, results: [], error: null});
  const [searchSuggestions, setSearchSuggestions] = useState<ProfileSuggestion[]>([]);

  const [searchError, setSearchError] = useState<string | null>(null);

  const structureStats = useMemo(() => {
    let units = 0;
    let withManagers = 0;
    let maxDepth = 0;

    const walk = (nodes: OrgUnitHierarchy[], depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      for (const node of nodes) {
        units += 1;
        if (node.manager) {
          withManagers += 1;
        }
        if (node.children.length > 0) {
          walk(node.children, depth + 1);
        }
      }
    };

    walk(organizationHierarchy, 1);

    return {
      units,
      withManagers,
      withoutManagers: Math.max(units - withManagers, 0),
      maxDepth,
    };
  }, [organizationHierarchy]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (activeSearchQuery.trim() === "") {
        setFilteredEmployees({ total: 0, results: [], error: null });
        setSearchError(null);
        return;
      }
      setSearchError(null);

      try {
        const response = await searchHierarchy(activeSearchQuery.trim(), 0, 10);
        if (response.status === 200 && response.data) {
          setFilteredEmployees(response.data);
          setSearchError(null);
        } else {
          setFilteredEmployees({ total: 0, results: [], error: response.message || 'Ошибка поиска' });
          setSearchError(response.message || 'Ошибка поиска');
        }
      } catch (err: any) {
        setFilteredEmployees({ total: 0, results: [], error: err?.message || 'Ошибка поиска' });
        setSearchError(err?.message || 'Ошибка поиска');
      }
    };
    fetchSearchResults();
  }, [activeSearchQuery]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim() === "" || searchQuery.trim().length < 2) {
        setSearchSuggestions([]);
        return;
      }
      const response = await searchSuggestHierarchy(searchQuery.trim(), 6);
      if (response.status === 200 && response.data) {
        setSearchSuggestions(response.data.suggestions || []);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setExpandedNodes({});
    setSearchSuggestions([]);
    setIsSuggestionsOpen(false);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setActiveSearchQuery(searchQuery);
    setSearchSuggestions([]);
    setIsSuggestionsOpen(false);
    inputRef.current?.blur();
  }, [searchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  }, [handleSearchSubmit]);

  const handleSuggestionClick = useCallback((suggestion: ProfileSuggestion) => {
    setSearchQuery(suggestion.full_name);
    setActiveSearchQuery(suggestion.full_name);
    setSearchSuggestions([]);
    setIsSuggestionsOpen(false);
  }, []);

  // Обработчики для управления структурой
  const handleCreateChild = useCallback((parentId: number) => {
    setSelectedParentId(parentId);
    setCreateModalOpen(true);
  }, []);

  const handleEditUnit = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setEditModalOpen(true);
  }, []);

  const handleDeleteUnit = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setDeleteModalOpen(true);
  }, []);

  const handleSetManager = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setSetManagerModalOpen(true);
  }, []);

  const handleMoveUnit = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setMoveModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchOrgStructure();
  }, [fetchOrgStructure]);

  const handleOpenProfile = useCallback((eid: string) => {
    navigate(`/profile/${eid}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border border-purple-100 bg-linear-to-br from-white via-purple-50/60 to-blue-50/40 p-6 md:p-8">
        <div className="mb-6 h-10 w-72 rounded-xl bg-purple-100"></div>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="h-24 rounded-2xl bg-white"></div>
          <div className="h-24 rounded-2xl bg-white"></div>
          <div className="h-24 rounded-2xl bg-white"></div>
          <div className="h-24 rounded-2xl bg-white"></div>
        </div>
        <div className="space-y-3">
          <div className="h-20 rounded-2xl bg-white"></div>
          <div className="h-20 rounded-2xl bg-white"></div>
          <div className="h-20 rounded-2xl bg-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-purple-100 bg-linear-to-br from-white via-purple-50/60 to-blue-50/40 shadow-sm">
        <div className="border-b border-purple-100/80 bg-white/70 p-6 backdrop-blur md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-medium text-purple-700">
                <Sparkles className="h-3.5 w-3.5" />
                Карта команды
              </div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Организационная структура</h2>
              <p className="mt-2 text-sm text-gray-600">Навигация по подразделениям, руководителям и ролям в одном месте.</p>
            </div>
            {canManage && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Создать подразделение
                </button>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <RotateCw className="h-4 w-4" />
                  Обновить
                </button>
              </div>
            )}
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
              <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700"><Building2 className="h-4 w-4" /></div>
              <p className="text-2xl font-bold text-gray-900">{structureStats.units}</p>
              <p className="text-sm font-medium text-gray-700">Подразделений</p>
            </div>
            <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
              <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700"><Crown className="h-4 w-4" /></div>
              <p className="text-2xl font-bold text-gray-900">{structureStats.withManagers}</p>
              <p className="text-sm font-medium text-gray-700">С руководителем</p>
            </div>
            <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
              <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700"><Users className="h-4 w-4" /></div>
              <p className="text-2xl font-bold text-gray-900">{structureStats.withoutManagers}</p>
              <p className="text-sm font-medium text-gray-700">Без руководителя</p>
            </div>
            <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
              <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700"><Network className="h-4 w-4" /></div>
              <p className="text-2xl font-bold text-gray-900">{structureStats.maxDepth}</p>
              <p className="text-sm font-medium text-gray-700">Уровней иерархии</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Найти сотрудника"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsSuggestionsOpen(true);
                }}
                onBlur={() => {}}
                className="w-full rounded-xl border border-purple-100 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
              />
              {isSuggestionsOpen && searchSuggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute left-0 right-0 z-10 mt-2 max-h-80 overflow-y-auto rounded-xl border border-purple-200 bg-white p-2 shadow-lg">
                  {searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.eid}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-purple-50"
                    >
                      <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2 lg:whitespace-nowrap">
                        <span className="truncate font-medium text-purple-700">{suggestion.full_name}</span>
                        <span className="hidden text-gray-400 lg:inline">•</span>
                        <span className="truncate text-sm text-gray-600">{suggestion.position}</span>
                        <span className="hidden text-gray-400 lg:inline">•</span>
                        <span className="truncate text-sm text-gray-500">{suggestion.department}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              <Download strokeWidth={2} className="h-5 w-5 text-gray-500" />
              Экспорт
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              <SlidersVertical strokeWidth={2} className="h-5 w-5 text-gray-500" />
              Фильтры
            </button>
          </div>
        </div>
      </div>

      {activeSearchQuery.trim() ? (
        <>
          <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-4">
            <div className="text-sm text-gray-600">
              Найдено сотрудников: {filteredEmployees.total}
            </div>
            <button
              onClick={handleReset}
              className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              Сбросить
            </button>
          </div>
          {filteredEmployees.total > 0 ? (
            <div className="space-y-4">
              {filteredEmployees.results.map((emp) => (
                <div key={emp.eid} className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
                  <div className="flex gap-4">
                    <div>
                      <Avatar
                        fullName={emp.full_name}
                        size={16}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleOpenProfile(String(emp.eid))}
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
                          <a href={`mailto:${emp.work_email}`} className="inline-flex items-center gap-1 text-purple-600 hover:underline"><Mail className="h-3.5 w-3.5" />{emp.work_email}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium">Телефон:</span>
                          <a href={`tel:${emp.work_phone}`} className="inline-flex items-center gap-1 text-purple-600 hover:underline"><Phone className="h-3.5 w-3.5" />{emp.work_phone}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>) : searchError ? (
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
      ) : (
        <div className="space-y-4">
          {organizationHierarchy.length > 0 ? (
            organizationHierarchy.map((unit) => (
              <div key={unit.id} className="rounded-2xl border border-purple-100 bg-white p-5 md:p-6">
                <DepartmentNode
                  unit={unit}
                  expandedNodes={expandedNodes}
                  setExpandedNodes={setExpandedNodes}
                  canManage={canManage}
                  allUnits={organizationHierarchy}
                  onEdit={handleEditUnit}
                  onDelete={handleDeleteUnit}
                  onSetManager={handleSetManager}
                  onMove={handleMoveUnit}
                  onCreateChild={handleCreateChild}
                  onOpenProfile={handleOpenProfile}
                />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="text-center py-12 text-gray-500">
                <p>Структура пуста</p>
              </div>
            </div>
          )}
        </div>)}

      {/* Модальные окна */}
      <CreateOrgUnitModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedParentId(null);
        }}
        parentId={selectedParentId}
        onSuccess={handleRefresh}
      />

      {selectedUnit && (
        <>
          <EditOrgUnitModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />

          <DeleteOrgUnitModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />

          <SetManagerModal
            isOpen={setManagerModalOpen}
            onClose={() => setSetManagerModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />

          <MoveOrgUnitModal
            isOpen={moveModalOpen}
            onClose={() => setMoveModalOpen(false)}
            unit={selectedUnit}
            allUnits={organizationHierarchy}
            onSuccess={handleRefresh}
          />
        </>
      )}
    </div>
  );
};

export default StructureModule;
