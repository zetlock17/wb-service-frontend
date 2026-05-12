import { useState } from "react";
import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Category } from "../../../api/newsApi";

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  isAdmin: boolean;
  creatingCategory: boolean;
  deletingCategoryId: number | null;
  categoryError: string | null;
  setCategoryError: (value: string | null) => void;
  isFollowedCategory: (id: number) => boolean;
  onCreateCategory: (name: string) => Promise<number | null>;
  onDeleteCategory: (id: number) => Promise<void> | void;
  onFollowCategory: (id: number) => Promise<void> | void;
  onUnfollowCategory: (id: number) => Promise<void> | void;
}

const ManageCategoriesModal = ({
  isOpen,
  onClose,
  categories,
  isAdmin,
  creatingCategory,
  deletingCategoryId,
  categoryError,
  setCategoryError,
  isFollowedCategory,
  onCreateCategory,
  onDeleteCategory,
  onFollowCategory,
  onUnfollowCategory,
}: ManageCategoriesModalProps) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleClose = () => {
    setNewCategoryName('');
    setCategoryError(null);
    onClose();
  };

  const handleCreate = async () => {
    const created = await onCreateCategory(newCategoryName);
    if (created) setNewCategoryName('');
  };

  return (
    <Modal isOpen={isOpen} title="Управление категориями" onClose={handleClose} widthClass="max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Создать новую категорию</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setCategoryError(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Название категории"
            />
            <button
              onClick={handleCreate}
              disabled={creatingCategory || !newCategoryName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {creatingCategory ? 'Создание...' : 'Создать'}
            </button>
          </div>
          {categoryError && <p className="mt-2 text-sm text-red-600">{categoryError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Существующие категории ({categories.length})
          </label>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Категорий пока нет</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((cat) => {
                const followed = isFollowedCategory(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-gray-900 font-medium truncate">{cat.name}</span>
                      {followed && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full shrink-0">
                          Отслеживается
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <button
                        onClick={() => (followed ? onUnfollowCategory(cat.id) : onFollowCategory(cat.id))}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                          followed
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={followed ? 'Отписаться от категории' : 'Подписаться на категорию'}
                      >
                        {followed ? (
                          <><BellOff className="w-3 h-3" /> Отписаться</>
                        ) : (
                          <><Bell className="w-3 h-3" /> Подписаться</>
                        )}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          disabled={deletingCategoryId === cat.id}
                          className="text-gray-400 hover:text-red-600 disabled:text-gray-300 transition-colors"
                          aria-label={`Удалить категорию ${cat.name}`}
                        >
                          {deletingCategoryId === cat.id ? (
                            <span className="text-xs">Удаление...</span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageCategoriesModal;
