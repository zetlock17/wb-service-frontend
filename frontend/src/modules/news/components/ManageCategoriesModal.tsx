import { useState } from "react";
import { Bell, BellOff, Plus, Trash2, X } from "lucide-react";
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        {/* header */}
        <header className="flex items-center justify-between gap-3 border-b-2 border-gray-100 px-7 pb-4 pt-6">
          <h2 className="text-[22px] font-black tracking-tight text-gray-900">
            Управление категориями
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-wb-pink-light hover:text-wb-green"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* body */}
        <div className="flex flex-col gap-6 overflow-y-auto px-7 py-6">
          {/* create */}
          <div>
            <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">
              Создать новую категорию
            </label>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => { setNewCategoryName(e.target.value); setCategoryError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Название категории"
                className="flex-1 rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-wb-green px-5 py-3 text-[14.5px] font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                <Plus className="h-4 w-4" />
                {creatingCategory ? 'Создание...' : 'Создать'}
              </button>
            </div>
            {categoryError && (
              <p className="mt-2 text-[13px] font-semibold text-red-600">{categoryError}</p>
            )}
          </div>

          {/* list */}
          <div>
            <div className="mb-2.5 text-[13.5px] font-extrabold text-gray-800">
              Существующие категории{' '}
              <span className="text-gray-400">({categories.length})</span>
            </div>
            {categories.length === 0 ? (
              <div className="rounded-[20px] bg-wb-pink-light py-8 text-center text-[14.5px] font-semibold text-gray-400">
                Категорий пока нет
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {categories.map((cat) => {
                  const followed = isFollowedCategory(cat.id);
                  return (
                    <li
                      key={cat.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-wb-pink-light px-4 py-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span className="truncate text-[15px] font-extrabold text-gray-900">
                          {cat.name}
                        </span>
                        {followed && (
                          <span className="shrink-0 rounded-full bg-wb-green-light px-2.5 py-0.5 text-[11px] font-extrabold text-wb-green">
                            Отслеживается
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => followed ? onUnfollowCategory(cat.id) : onFollowCategory(cat.id)}
                          style={{ paddingLeft: 12, paddingRight: 12 }}
                          className={`inline-flex items-center gap-1.5 rounded-full py-1.5 text-[13px] font-bold transition hover:-translate-y-px ${
                            followed
                              ? 'bg-wb-green text-white hover:opacity-90'
                              : 'bg-white text-wb-green ring-1 ring-inset ring-wb-green/30 hover:ring-wb-green'
                          }`}
                          title={followed ? 'Отписаться от категории' : 'Подписаться на категорию'}
                        >
                          {followed ? (
                            <><BellOff className="h-3 w-3" /> Отписаться</>
                          ) : (
                            <><Bell className="h-3 w-3" /> Подписаться</>
                          )}
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onDeleteCategory(cat.id)}
                            disabled={deletingCategoryId === cat.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white hover:text-red-600 disabled:text-gray-300"
                            aria-label={`Удалить категорию ${cat.name}`}
                          >
                            {deletingCategoryId === cat.id ? (
                              <span className="text-[11px]">...</span>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* footer */}
        <footer className="flex justify-end border-t-2 border-gray-100 bg-gray-50/60 px-7 py-5">
          <button
            type="button"
            onClick={handleClose}
            style={{ paddingLeft: 18, paddingRight: 18 }}
            className="rounded-full bg-white py-3 text-[15px] font-bold text-gray-700 ring-1 ring-inset ring-gray-200 transition hover:-translate-y-px hover:ring-gray-300"
          >
            Закрыть
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
