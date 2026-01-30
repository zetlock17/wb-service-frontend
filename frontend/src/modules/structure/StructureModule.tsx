import { Download, Search, SlidersVertical } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { searchHierarchy, searchSuggestHierarchy, type OrgUnitHierarchy, type OrgUnitManager, type ProfileSearchResult, type ProfileSuggestion } from "../../api/orgStructureApi";
import usePortalStore from "../../store/usePortalStore"; 


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

const getAvatarInitials = (fullName: string): string => {
  return fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

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
}

const EmployeeCard = ({ manager, level }: EmployeeCardProps) => {
  const initials = getAvatarInitials(manager.full_name);

  return (
    <div className="flex gap-0">
      <div className="flex flex-col items-center">
        {level > 0 && (
          <>
            <div
              className="font-black p-1 text-purple-300">
                —
            </div>
          </>
        ) }
      </div>

      <div className="flex-1 min-w-0">
        <div className="p-1">
          <div className="flex flex-row items-center gap-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[0.6rem] leading-none bg-linear-to-br from-purple-500 to-fuchsia-500">
              {initials}
            </div>
            <h4 className="text-lg text-purple-500 truncate">
              {manager.full_name}
            </h4>
          </div>
          <p className="text-base text-gray-600 truncate">{manager.position}</p>
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
}

const DepartmentNode = ({
  unit,
  level = 0,
  expandedNodes,
  setExpandedNodes,
}: DepartmentNodeProps) => {
  const unitKey = `unit-${unit.id}`;
  const isExpanded = expandedNodes[unitKey] ?? true;

  const handleToggle = () => {
    setExpandedNodes({
      ...expandedNodes,
      [unitKey]: !isExpanded,
    });
  };

  return (
    <div className="bg-purple-50 rounded-lg">
      <div className="flex gap-0">
        {unit.children && unit.children.length > 0 ? (
          <div className={`flex flex-col items-center py-${level > 0 ? 2 : 3}`} style={{ width: 'auto' }}>
            <button
              onClick={handleToggle}
              className="p-1 rounded transition-colors"
            >
              <Triangle
                isExpanded={isExpanded}
                className="w-5 h-5 text-purple-600 cursor-pointer hover:text-purple-500 transition-all"
              />
            </button>
            {isExpanded && (
              <div className="h-full flex items-start" style={{ width: 24 }}>
                <VerticalDashed className={`h-full text-purple-${level > 0 ? 300 : 500}`}/>
              </div>
            )}
          </div>
        ) : (
          <div
            className="pr-2 pt-2 font-black text-purple-300">
              —
          </div>
        )}

        <div className="flex-1 py-2 pr-4">
          <h3 className={`font-medium text-black text-${level > 0 ? level > 1 ? 'lg' : 'xl' : '2xl'}`}>{unit.name}</h3>
          {unit.manager && (
            <EmployeeCard
              manager={unit.manager}
              level={0}
            />
          )}
          {isExpanded && unit.children && unit.children.length > 0 && (
            <div className="space-y-1">
              {unit.children.map((child) => (
                <DepartmentNode
                  key={child.id}
                  unit={child}
                  level={level+1}
                  expandedNodes={expandedNodes}
                  setExpandedNodes={setExpandedNodes}
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});

  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);
  // const [searchFocus, setSearchFocus] = useState<boolean>(false);

  const { organizationHierarchy, loading, fetchOrgStructure } = usePortalStore();

  useEffect(() => {
    if (organizationHierarchy.length === 0) {
      fetchOrgStructure();
    }
  }, [organizationHierarchy.length, fetchOrgStructure]);

  const [filteredEmployees, setFilteredEmployees] = useState<ProfileSearchResult>({total: 0, results: [], error: null});
  const [searchSuggestions, setSearchSuggestions] = useState<ProfileSuggestion[]>([]);

  const [searchError, setSearchError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Загрузка организационной структуры...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center gap-3 mb-1">
        <Search strokeWidth={3} className="w-5 h-5 text-gray-600" />
        <div className="relative flex-1 max-w-3xl">
          <input
            ref={inputRef}
            type="text"
            placeholder="Найти сотрудника"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { setIsSuggestionsOpen(true); /* setSearchFocus(true); */ }}
            onBlur={() => /* setSearchFocus(false) */ {}}
            className="w-full px-3 py-1 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {isSuggestionsOpen && searchSuggestions.length > 0 && (
            <div ref={suggestionsRef} className="absolute left-0 right-0 mt-2 p-2 bg-white border-2 border-purple-500 rounded-lg shadow-lg z-10 max-h-80 w-full max-w-[90vw] lg:max-w-4xl overflow-y-auto">
              {searchSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.eid}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 hover:bg-purple-50 cursor-pointer rounded transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 lg:whitespace-nowrap">
                      <span className="font-medium text-purple-600 truncate">{suggestion.full_name}</span>
                      <span className="hidden lg:inline text-gray-400">—</span>
                      <span className="text-sm text-gray-600 truncate">{suggestion.position}</span>
                      <span className="hidden lg:inline text-gray-400">—</span>
                      <span className="text-sm text-gray-500 truncate">{suggestion.department}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        <button className="flex flex-row items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Download strokeWidth={2} className="w-6 h-6 text-gray-600" />
          Экспорт
        </button>
        <button className="flex flex-row items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <SlidersVertical strokeWidth={2} className="w-6 h-6 text-gray-600" />
          Фильтры
        </button>
      </div>

      {activeSearchQuery.trim() ? (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Найдено сотрудников: {filteredEmployees.total}
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Сбросить
            </button>
          </div>
          {filteredEmployees.total > 0 ? (
            <div className="space-y-4">
              {filteredEmployees.results.map((emp) => (
                <div key={emp.eid} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex gap-4">
                    <div>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl bg-linear-to-br from-purple-500 to-fuchsia-500">
                        {getAvatarInitials(emp.full_name)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-purple-600 mb-1">{emp.full_name}</h3>
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
                          <a href={`mailto:${emp.work_email}`} className="text-purple-600 hover:underline">{emp.work_email}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium">Телефон:</span>
                          <a href={`tel:${emp.work_phone}`} className="text-purple-600 hover:underline">{emp.work_phone}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>) : searchError ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12 text-red-500">
                  <p>Ошибка при поиске сотрудников</p>
                  <p className="text-sm mt-1">{searchError}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
              <div key={unit.id} className="bg-white rounded-lg p-6">
                <DepartmentNode
                  unit={unit}
                  expandedNodes={expandedNodes}
                  setExpandedNodes={setExpandedNodes}
                />
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-12 text-gray-500">
                <p>Структура пуста</p>
              </div>
            </div>
          )}
        </div>)}
    </div>
  );
};

export default StructureModule;
