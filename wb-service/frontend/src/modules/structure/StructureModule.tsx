import { Download, Mail, Phone, Users } from "lucide-react";
import { useMemo, useState } from "react";
import usePortalStore from "../../store/usePortalStore";

const StructureModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const { employees, loading } = usePortalStore();

  const departments = useMemo(() => ["all", ...new Set(employees.map((employee) => employee.department))], [employees]);
  const positions = useMemo(() => ["all", ...new Set(employees.map((employee) => employee.position))], [employees]);

  const filteredEmployees = useMemo(() => {
    let result = employees;
    if (departmentFilter !== "all") {
      result = result.filter((employee) => employee.department === departmentFilter);
    }
    if (positionFilter !== "all") {
      result = result.filter((employee) => employee.position === positionFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (employee) =>
          employee.name.toLowerCase().includes(query) ||
          employee.position.toLowerCase().includes(query) ||
          employee.department.toLowerCase().includes(query),
      );
    }
    return result;
  }, [employees, departmentFilter, positionFilter, searchQuery]);

  const exportToCSV = () => {
    const headers = ["ФИО", "Должность", "Департамент", "Телефон", "Email"];
    const rows = filteredEmployees.map((employee) => [employee.name, employee.position, employee.department, employee.phone, employee.email]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employees.csv";
    link.click();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setPositionFilter("all");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-3"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-48"></div>
            <div className="h-10 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Справочник сотрудников</h2>
          <button onClick={exportToCSV} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Экспорт CSV
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Поиск по ФИО, должности, департаменту..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Все департаменты</option>
              {departments
                .filter((department) => department !== "all")
                .map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
            </select>
            <select
              value={positionFilter}
              onChange={(event) => setPositionFilter(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Все должности</option>
              {positions
                .filter((position) => position !== "all")
                .map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
            </select>
            {(searchQuery.trim() || departmentFilter !== "all" || positionFilter !== "all") && (
              <button onClick={resetFilters} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Сбросить
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">Найдено сотрудников: {filteredEmployees.length}</div>
        </div>
        {filteredEmployees.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {employee.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{employee.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{employee.position}</p>
                    <p className="text-xs text-gray-500 truncate">{employee.department}</p>
                    <div className="mt-3 space-y-1">
                      <a href={`mailto:${employee.email}`} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                      <a href={`tel:${employee.phone}`} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Позвонить
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Сотрудники не найдены</p>
            <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StructureModule;
