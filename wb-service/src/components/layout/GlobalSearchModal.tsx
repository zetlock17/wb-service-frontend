import { BookOpen, FileText, MessageSquare, Search, Users, X } from "lucide-react";
import { useEffect } from "react";
import type {
  Department,
  DocumentItem,
  GlobalSearchResults,
  KnowledgeArticle,
  ModuleId,
  NewsItem,
} from "../../types/portal";

type SearchFilter = "all" | "documents" | "knowledge" | "employees" | "news";

interface GlobalSearchModalProps {
  isOpen: boolean;
  query: string;
  filter: SearchFilter;
  results: GlobalSearchResults;
  departments: Department[];
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: SearchFilter) => void;
  onNavigate: (moduleId: ModuleId) => void;
}

const sectionConfig: Array<{ id: SearchFilter; label: string }> = [
  { id: "all", label: "Все" },
  { id: "documents", label: "Документы" },
  { id: "knowledge", label: "База знаний" },
  { id: "employees", label: "Сотрудники" },
  { id: "news", label: "Новости" },
];

const GlobalSearchModal = ({
  isOpen,
  query,
  filter,
  results,
  departments,
  onClose,
  onQueryChange,
  onFilterChange,
  onNavigate,
}: GlobalSearchModalProps) => {
  const getDepartmentName = (id: number) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : "";
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (moduleId: ModuleId) => {
    onNavigate(moduleId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по документам, базе знаний, сотрудникам, новостям..."
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              autoFocus
              className="flex-1 text-lg outline-none"
            />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex gap-2">
            {sectionConfig.map((section) => (
              <button
                key={section.id}
                onClick={() => onFilterChange(section.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === section.id
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {!query ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Начните вводить запрос для поиска</p>
              <p className="text-sm mt-1">Поиск по документам, базе знаний, сотрудникам и новостям</p>
            </div>
          ) : (
            <div className="space-y-6">
              <SearchSection<DocumentItem>
                title="Документы"
                icon={<FileText className="w-4 h-4" />}
                items={results.documents}
                renderItem={(doc) => (
                  <>
                    <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
                    <p className="text-sm text-gray-600">
                      {doc.type} • {doc.author} • {doc.date}
                    </p>
                  </>
                )}
                onClick={() => handleSelect("documents")}
              />
              <SearchSection<KnowledgeArticle>
                title="База знаний"
                icon={<BookOpen className="w-4 h-4" />}
                items={results.knowledge}
                renderItem={(article) => (
                  <>
                    <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                    <p className="text-sm text-gray-600">
                      {article.category} • {article.author}
                    </p>
                  </>
                )}
                onClick={() => handleSelect("knowledge")}
              />
              <SearchSection
                title="Сотрудники"
                icon={<Users className="w-4 h-4" />}
                items={results.employees}
                renderItem={(employee) => (
                  <>
                    <h4 className="font-medium text-gray-900">{employee.full_name}</h4>
                    <p className="text-sm text-gray-600">
                      {employee.position} • {getDepartmentName(employee.department_id)}
                    </p>
                  </>
                )}
                onClick={() => handleSelect("structure")}
              />
              <SearchSection<NewsItem>
                title="Новости"
                icon={<MessageSquare className="w-4 h-4" />}
                items={results.news}
                renderItem={(item) => (
                  <>
                    <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.category} • {item.date}</p>
                  </>
                )}
                onClick={() => handleSelect("news")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SearchSectionProps<T> {
  title: string;
  icon: React.ReactNode;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onClick: () => void;
}

const SearchSection = <T,>({ title, icon, items, renderItem, onClick }: SearchSectionProps<T>) => {
  if (!items.length) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
        {icon}
        {title} ({items.length})
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={onClick}
            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {renderItem(item)}
          </button>
        ))}
      </div>
    </div>
  );
};

export type { SearchFilter };
export default GlobalSearchModal;
