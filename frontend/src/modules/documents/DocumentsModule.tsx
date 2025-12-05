import { ChevronRight, Eye, FileText, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { DocumentItem } from "../../types/portal";

const DocumentsModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const { documents, loading } = usePortalStore();

  const types = useMemo(() => ["all", ...new Set(documents.map((doc) => doc.type))], [documents]);

  const filteredDocuments = useMemo(() => {
    let result = documents;
    if (documentFilter !== "all") {
      result = result.filter((doc) => doc.type === documentFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((doc) => doc.title.toLowerCase().includes(query));
    }
    return result;
  }, [documents, documentFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Управление документами</h2>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Добавить документ
          </button>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Поиск по названию, содержимому..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={documentFilter}
            onChange={(event) => setDocumentFilter(event.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Все типы</option>
            {types
              .filter((type) => type !== "all")
              .map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocument(doc)}
              className="w-full border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        doc.status === "Актуален" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {doc.type}
                    </span>
                    <span>{doc.date}</span>
                    <span>{doc.author}</span>
                    <span>v{doc.version}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {doc.views}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
          {!filteredDocuments.length && (
            <p className="text-center text-gray-500 py-8">Документы по выбранным параметрам не найдены</p>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(selectedDocument)} title={selectedDocument?.title ?? ""} onClose={() => setSelectedDocument(null)}>
        {selectedDocument && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span
                className={`px-3 py-1 rounded-full ${
                  selectedDocument.status === "Актуален" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {selectedDocument.status}
              </span>
              <span>{selectedDocument.type}</span>
              <span>Версия {selectedDocument.version}</span>
              <span>{selectedDocument.date}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Автор</h3>
              <p className="text-gray-600">{selectedDocument.author}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Описание</h3>
              <p className="text-gray-600">
                Документ содержит важную информацию для всех сотрудников банка. Необходимо ознакомиться с содержанием и
                следовать указанным требованиям.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 min-w-44 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Скачать PDF
              </button>
              <button className="flex-1 min-w-44 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Открыть в Тезис
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Отметить ознакомление</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentsModule;
