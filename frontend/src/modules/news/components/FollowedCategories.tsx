import { Bell } from "lucide-react";
import type { Category } from "../../../api/newsApi";

interface FollowedCategoriesProps {
  followedCategories: Category[];
  selectedCategory?: number;
  onSelect: (categoryId: number | undefined) => void;
}

const FollowedCategories = ({
  followedCategories,
  selectedCategory,
  onSelect,
}: FollowedCategoriesProps) => {
  if (followedCategories.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-gray-500">
        <Bell className="h-3.5 w-3.5" />
        Подписки:
      </span>
      {followedCategories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id === selectedCategory ? undefined : cat.id)}
          style={{ paddingLeft: 14, paddingRight: 14 }}
          className={`rounded-full py-2 text-[13.5px] font-bold transition hover:-translate-y-px ${
            selectedCategory === cat.id
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-wb-pink-light hover:text-wb-green'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default FollowedCategories;
