import { Download, Search, SlidersVertical } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { type OrgUnitHierarchy, type OrgUnitManager } from "../../api/orgStructureApi";
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

interface SearchableEmployee {
  eid: number;
  full_name: string;
  position: string;
}

const getAvatarInitials = (fullName: string): string => {
  return fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = (id: number): string => {
  const colors = [
    "from-blue-500 to-purple-500",
    "from-green-500 to-blue-500",
    "from-pink-500 to-red-500",
    "from-indigo-500 to-blue-500",
    "from-cyan-500 to-blue-500",
    "from-teal-500 to-green-500",
    "from-orange-500 to-red-500",
    "from-purple-500 to-pink-500",
  ];
  return colors[id % colors.length];
};

const collectAllEmployees = (
  nodes: OrgUnitHierarchy[]
): SearchableEmployee[] => {
  const employees: SearchableEmployee[] = [];

  const collect = (node: OrgUnitHierarchy) => {
    if (node.manager) {
      employees.push({
        eid: node.manager.eid,
        full_name: node.manager.full_name,
        position: node.manager.position,
      });
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(collect);
    }
  };

  nodes.forEach(collect);
  return employees;
};

const filterHierarchy = (
  nodes: OrgUnitHierarchy[],
  searchQuery: string
): OrgUnitHierarchy[] => {
  if (!searchQuery.trim()) {
    return nodes;
  }

  const query = searchQuery.toLowerCase();

  const matchesSearch = (node: OrgUnitHierarchy): boolean => {
    const nameMatches = node.name.toLowerCase().includes(query);
    const managerMatches = node.manager
      ? node.manager.full_name.toLowerCase().includes(query) ||
        node.manager.position.toLowerCase().includes(query)
      : false;
    const childrenMatches = node.children?.some(matchesSearch) ?? false;

    return nameMatches || managerMatches || childrenMatches;
  };

  return nodes
    .map((unit) => {
      if (!matchesSearch(unit)) return null;

      const filteredChildren = unit.children
        ?.map((child) => {
          if (!matchesSearch(child)) return null;
          
          const nestedChildren = child.children
            ?.map(c => matchesSearch(c) ? c : null)
            .filter((c) => c !== null) as OrgUnitHierarchy[] | undefined;

          return { ...child, children: nestedChildren || [] };
        })
        .filter((child) => child !== null) as OrgUnitHierarchy[] | undefined;

      return { ...unit, children: filteredChildren || [] };
    })
    .filter((unit) => unit !== null) as OrgUnitHierarchy[];
};

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
              className="flex-shrink-0 font-black p-1 text-purple-300">
                —
            </div>
          </>
        ) }
      </div>

      <div className="flex-1 min-w-0">
        <div className="p-1">
          <div className="flex flex-row items-center gap-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[0.6rem] leading-none bg-gradient-to-br from-purple-500 to-fuchsia-500">
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
        {unit.children && unit.children.length > 0 && (
          <div className={`flex flex-col items-center py-${level > 0 ? 2 : 3}`} style={{ width: 'auto' }}>
            <button
              onClick={handleToggle}
              className="flex-shrink-0 p-1 rounded transition-colors"
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
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});
  
  const { organizationHierarchy, loading, fetchOrgStructure } = usePortalStore();

  useEffect(() => {
    if (organizationHierarchy.length === 0) {
      fetchOrgStructure();
    }
  }, [organizationHierarchy.length, fetchOrgStructure]);

  const allEmployees = collectAllEmployees(organizationHierarchy);
  const filteredHierarchy = filterHierarchy(organizationHierarchy, searchQuery);
  const filteredEmployees = searchQuery.trim()
    ? allEmployees.filter(
        (emp) =>
          emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.position.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allEmployees;

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setExpandedNodes({});
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
        <input
          type="text"
          placeholder="Найти сотрудника"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-2xs px-3 py-1 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button className="flex flex-row items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Download strokeWidth={2} className="w-6 h-6 text-gray-600" />
          Экспорт
        </button>
        <button className="flex flex-row items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <SlidersVertical strokeWidth={2} className="w-6 h-6 text-gray-600" />
          Фильтры
        </button>
      </div>

      {searchQuery.trim() && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Найдено сотрудников: {filteredEmployees.length}
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Сбросить
          </button>
        </div>
      )}

        <div className="space-y-4">
          {filteredHierarchy.length > 0 ? (
            filteredHierarchy.map((unit) => (
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
                <p>Сотрудники не найдены</p>
                <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default StructureModule;
