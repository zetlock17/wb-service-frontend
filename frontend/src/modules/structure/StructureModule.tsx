import { ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";
import { organizationHierarchy, type DepartmentHierarchy, type EmployeeNode } from "../../data/organizationStructure";

interface ExpandedNodes {
  [key: string]: boolean;
}

interface SearchableEmployee {
  id: number;
  full_name: string;
  position: string;
  work_phone: string;
  work_email: string;
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
  nodes: (DepartmentHierarchy | EmployeeNode)[]
): SearchableEmployee[] => {
  const employees: SearchableEmployee[] = [];

  const collect = (node: DepartmentHierarchy | EmployeeNode) => {
    if ("manager" in node) {
      employees.push(node.manager);
      if (node.children) {
        node.children.forEach(collect);
      }
    } else if ("full_name" in node) {
      employees.push(node);
      if (node.children) {
        node.children.forEach(collect);
      }
    }
  };

  nodes.forEach(collect);
  return employees;
};

const filterHierarchy = (
  nodes: DepartmentHierarchy[],
  searchQuery: string
): DepartmentHierarchy[] => {
  if (!searchQuery.trim()) {
    return nodes;
  }

  const query = searchQuery.toLowerCase();

  const matchesSearch = (node: EmployeeNode | DepartmentHierarchy): boolean => {
    if ("manager" in node) {
      const managerMatches =
        node.manager.full_name.toLowerCase().includes(query) ||
        node.manager.position.toLowerCase().includes(query);

      const childrenMatches = node.children?.some(matchesSearch) ?? false;

      return managerMatches || childrenMatches;
    } else {
      return (
        node.full_name.toLowerCase().includes(query) ||
        node.position.toLowerCase().includes(query)
      );
    }
  };

  return nodes
    .map((dept) => {
      if (!matchesSearch(dept)) return null;

      const filterChildren = (node: EmployeeNode): EmployeeNode | null => {
        const nodeMatches =
          node.full_name.toLowerCase().includes(query) ||
          node.position.toLowerCase().includes(query);

        const filteredChildren = node.children
          ?.map(filterChildren)
          .filter((child) => child !== null) as EmployeeNode[] | undefined;

        if (nodeMatches || (filteredChildren && filteredChildren.length > 0)) {
          return { ...node, children: filteredChildren };
        }

        return null;
      };

      const filteredDeptChildren = dept.children
        ?.map((child) => {
          const managerMatches =
            child.manager.full_name.toLowerCase().includes(query) ||
            child.manager.position.toLowerCase().includes(query);

          const filteredManager = {
            ...child.manager,
            children: child.manager.children
              ?.map(filterChildren)
              .filter((c) => c !== null) as EmployeeNode[] | undefined,
          };

          const childrenMatches = child.children?.some(matchesSearch) ?? false;

          if (
            managerMatches ||
            filteredManager.children?.length ||
            childrenMatches
          ) {
            return { ...child, manager: filteredManager, children: child.children };
          }

          return null;
        })
        .filter((child) => child !== null) as DepartmentHierarchy[] | undefined;

      return { ...dept, children: filteredDeptChildren };
    })
    .filter((dept) => dept !== null) as DepartmentHierarchy[];
};

interface EmployeeCardProps {
  employee: EmployeeNode;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const EmployeeCard = ({ employee, level, isExpanded, onToggle }: EmployeeCardProps) => {
  const hasChildren = employee.children && employee.children.length > 0;
  const initials = getAvatarInitials(employee.full_name);

  return (
    <div className="space-y-0">
      <div
        className="p-3 rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-sm transition-all"
        style={{
          marginLeft: `${level * 20}px`,
          backgroundColor: level === 0 ? "#fafafa" : "#ffffff",
        }}
      >
        <div className="flex items-center gap-3">
          {hasChildren && (
            <button
              onClick={onToggle}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  isExpanded ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>
          )}
          {!hasChildren && <div className="w-6 flex-shrink-0" />}

          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-gradient-to-br ${getRandomColor(employee.id)}`}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {employee.full_name}
            </h4>
            <p className="text-xs text-gray-600 truncate">{employee.position}</p>
            <p className="text-xs text-gray-500 truncate">{employee.work_email}</p>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-0 border-l-2 border-gray-200 ml-8">
          {employee.children!.map((child) => (
            <HierarchyNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              setExpandedNodes={setExpandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface HierarchyNodeProps {
  node: EmployeeNode;
  level: number;
  expandedNodes: ExpandedNodes;
  setExpandedNodes: (nodes: ExpandedNodes) => void;
}

const HierarchyNode = ({
  node,
  level,
  expandedNodes,
  setExpandedNodes,
}: HierarchyNodeProps) => {
  const nodeKey = `${level}-${node.id}`;
  const isExpanded = expandedNodes[nodeKey] ?? false;

  const handleToggle = () => {
    setExpandedNodes({
      ...expandedNodes,
      [nodeKey]: !isExpanded,
    });
  };

  return (
    <EmployeeCard
      employee={node}
      level={level}
      isExpanded={isExpanded}
      onToggle={handleToggle}
    />
  );
};

interface DepartmentNodeProps {
  dept: DepartmentHierarchy;
  expandedNodes: ExpandedNodes;
  setExpandedNodes: (nodes: ExpandedNodes) => void;
}

const DepartmentNode = ({
  dept,
  expandedNodes,
  setExpandedNodes,
}: DepartmentNodeProps) => {
  const deptKey = `dept-${dept.id}`;
  const isExpanded = expandedNodes[deptKey] ?? true;

  const handleToggle = () => {
    setExpandedNodes({
      ...expandedNodes,
      [deptKey]: !isExpanded,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 group">
        <button
          onClick={handleToggle}
          className="flex-shrink-0 p-1 hover:bg-white rounded transition-colors"
        >
          <ChevronDown
            className={`w-5 h-5 text-purple-600 transition-transform ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>
        <h3 className="font-bold text-purple-900 text-lg">{dept.name}</h3>
      </div>

      {isExpanded && (
        <div className="space-y-1 pl-4">
          <EmployeeCard
            employee={dept.manager}
            level={0}
            isExpanded={expandedNodes[`${0}-${dept.manager.id}`] ?? false}
            onToggle={() => {
              const key = `${0}-${dept.manager.id}`;
              setExpandedNodes({
                ...expandedNodes,
                [key]: !expandedNodes[key],
              });
            }}
          />

          {dept.manager.children && dept.manager.children.length > 0 && (
            expandedNodes[`${0}-${dept.manager.id}`] && (
              <div className="space-y-0 border-l-2 border-gray-200 ml-8">
                {dept.manager.children.map((child) => (
                  <HierarchyNode
                    key={child.id}
                    node={child}
                    level={1}
                    expandedNodes={expandedNodes}
                    setExpandedNodes={setExpandedNodes}
                  />
                ))}
              </div>
            )
          )}

          {dept.children &&
            dept.children.map((child) => (
              <DepartmentNode
                key={child.id}
                dept={child}
                expandedNodes={expandedNodes}
                setExpandedNodes={setExpandedNodes}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const StructureModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Организационная структура
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Поиск по ФИО или должности..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

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
        </div>

        <div className="space-y-4">
          {filteredHierarchy.length > 0 ? (
            filteredHierarchy.map((dept) => (
              <DepartmentNode
                key={dept.id}
                dept={dept}
                expandedNodes={expandedNodes}
                setExpandedNodes={setExpandedNodes}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Сотрудники не найдены</p>
              <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StructureModule;
