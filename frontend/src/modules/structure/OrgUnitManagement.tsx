import { useState, useEffect } from "react";
import usePortalStore from "../../store/usePortalStore";
import Modal from "../../components/common/Modal";
import { 
  searchSuggestHierarchy,
  type OrgUnitHierarchy,
  type ProfileSuggestion,
  type OrgUnitCreate,
  type OrgUnitUpdate,
  type OrgUnitType,
} from "../../api/orgStructureApi";

interface CreateOrgUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: number | null;
  onSuccess?: () => void;
}

// Модальное окно для создания подразделения
export const CreateOrgUnitModal = ({ isOpen, onClose, parentId, onSuccess }: CreateOrgUnitModalProps) => {
  const [formData, setFormData] = useState<OrgUnitCreate>({
    name: "",
    unit_type: "Department",
    parent_id: parentId || null,
    manager_eid: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createOrgUnitAsync } = usePortalStore();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      parent_id: parentId || null,
    }));
  }, [parentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Введите название подразделения");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createOrgUnitAsync(formData);
      setFormData({ name: "", unit_type: "Department", parent_id: parentId || null, manager_eid: null });
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Ошибка при создании подразделения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Создать подразделение" onClose={onClose} widthClass="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Введите название"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тип подразделения</label>
          <select
            value={formData.unit_type}
            onChange={(e) => setFormData({ ...formData, unit_type: e.target.value as OrgUnitType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Department">Отдел</option>
            <option value="Division">Подразделение</option>
            <option value="Management">Управление</option>
            <option value="Group">Группа</option>
            <option value="ProjectTeam">Проектная команда</option>
          </select>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            {loading ? "Сохранение..." : "Создать"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Модальное окно для редактирования подразделения
interface EditOrgUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: OrgUnitHierarchy;
  onSuccess?: () => void;
}

export const EditOrgUnitModal = ({ 
  isOpen, 
  onClose, 
  unit,
  onSuccess,
}: EditOrgUnitModalProps) => {
  const [formData, setFormData] = useState<OrgUnitUpdate>({
    name: unit?.name || "",
    unit_type: unit?.unit_type || "Department",
    is_temporary: unit?.is_temporary || false,
    start_date: unit?.start_date || null,
    end_date: unit?.end_date || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateOrgUnitAsync } = usePortalStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError("Введите название подразделения");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (unit) {
        await updateOrgUnitAsync(unit.id, formData);
        onClose();
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err?.message || "Ошибка при обновлении подразделения");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !unit) return null;

  return (
    <Modal isOpen={isOpen} title="Редактировать подразделение" onClose={onClose} widthClass="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Введите название"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тип подразделения</label>
          <select
            value={formData.unit_type || "Department"}
            onChange={(e) => setFormData({ ...formData, unit_type: e.target.value as OrgUnitType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Department">Отдел</option>
            <option value="Division">Подразделение</option>
            <option value="Management">Управление</option>
            <option value="Group">Группа</option>
            <option value="ProjectTeam">Проектная команда</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_temporary"
            checked={formData.is_temporary || false}
            onChange={(e) => setFormData({ ...formData, is_temporary: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="is_temporary" className="text-sm font-medium text-gray-700">
            Временное подразделение
          </label>
        </div>

        {formData.is_temporary && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
              <input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
              <input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </>
        )}

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Модальное окно для удаления подразделения
interface DeleteOrgUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: OrgUnitHierarchy;
  onSuccess?: () => void;
}

export const DeleteOrgUnitModal = ({ 
  isOpen, 
  onClose, 
  unit,
  onSuccess,
}: DeleteOrgUnitModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteOrgUnitAsync } = usePortalStore();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      if (unit) {
        await deleteOrgUnitAsync(unit.id);
        onClose();
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err?.message || "Ошибка при удалении подразделения");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !unit) return null;

  return (
    <Modal isOpen={isOpen} title="Удалить подразделение" onClose={onClose} widthClass="max-w-md">
      <div className="space-y-4">
        <div>
          <p className="text-gray-700 mb-2">Вы уверены, что хотите удалить подразделение:</p>
          <p className="font-semibold text-purple-600">{unit.name}</p>
          {unit.children && unit.children.length > 0 && (
            <p className="text-sm text-red-600 mt-3">
              ⚠️ У этого подразделения есть подчиненные подразделения. Они также будут удалены.
            </p>
          )}
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            {loading ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Модальное окно для назначения руководителя
interface SetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: OrgUnitHierarchy;
  onSuccess?: () => void;
}

export const SetManagerModal = ({ 
  isOpen, 
  onClose, 
  unit,
  onSuccess,
}: SetManagerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [selectedManager, setSelectedManager] = useState<ProfileSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setOrgUnitManagerAsync } = usePortalStore();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await searchSuggestHierarchy(query, 10);
      if (response.status === 200 && response.data) {
        setSuggestions(response.data.suggestions || []);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) {
      setError("Выберите руководителя");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (unit) {
        await setOrgUnitManagerAsync(unit.id, selectedManager.eid.toString());
        onClose();
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err?.message || "Ошибка при назначении руководителя");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !unit) return null;

  return (
    <Modal isOpen={isOpen} title="Назначить руководителя" onClose={onClose} widthClass="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение: {unit.name}</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Поиск сотрудника</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Введите имя сотрудника"
          />
          
          {suggestions.length > 0 && (
            <div className="mt-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.eid}
                  onClick={() => {
                    setSelectedManager(suggestion);
                    setSearchQuery(suggestion.full_name);
                    setSuggestions([]);
                  }}
                  className="px-3 py-2 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="font-medium text-purple-600">{suggestion.full_name}</div>
                  <div className="text-sm text-gray-600">{suggestion.position}</div>
                  <div className="text-xs text-gray-500">{suggestion.department}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedManager && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm font-medium text-gray-700">Выбранный руководитель:</div>
            <div className="font-semibold text-purple-600 mt-1">{selectedManager.full_name}</div>
            <div className="text-sm text-gray-600">{selectedManager.position}</div>
          </div>
        )}

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading || !selectedManager}
            className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            {loading ? "Сохранение..." : "Назначить"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Компонент для перемещения подразделения
interface MoveOrgUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: OrgUnitHierarchy;
  allUnits: OrgUnitHierarchy[];
  onSuccess?: () => void;
}

export const MoveOrgUnitModal = ({ 
  isOpen, 
  onClose, 
  unit,
  allUnits,
  onSuccess,
}: MoveOrgUnitModalProps) => {
  const [selectedParentId, setSelectedParentId] = useState<number | null>(unit?.parent_id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { moveOrgUnitAsync } = usePortalStore();

  const handleMove = async () => {
    setLoading(true);
    setError(null);
    try {
      if (unit) {
        await moveOrgUnitAsync(unit.id, selectedParentId);
        onClose();
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err?.message || "Ошибка при перемещении подразделения");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !unit) return null;

  const getAllUnitsExcept = (units: OrgUnitHierarchy[], excludeId: number): OrgUnitHierarchy[] => {
    return units.filter((u) => u.id !== excludeId).flatMap((u) => [u, ...getAllUnitsExcept(u.children, excludeId)]);
  };

  const availableParents = getAllUnitsExcept(allUnits, unit.id);

  return (
    <Modal isOpen={isOpen} title="Переместить подразделение" onClose={onClose} widthClass="max-w-md">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-700">Перемещаемое подразделение: <span className="font-semibold text-purple-600">{unit.name}</span></p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Переместить в:</label>
          <select
            value={selectedParentId || ""}
            onChange={(e) => setSelectedParentId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">На верхний уровень</option>
            {availableParents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleMove}
            disabled={loading}
            className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            {loading ? "Перемещение..." : "Переместить"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
