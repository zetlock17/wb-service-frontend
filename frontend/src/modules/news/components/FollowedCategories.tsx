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
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500 shrink-0 flex items-center gap-1">
        <Bell className="w-3.5 h-3.5" />
        Подписки:
      </span>
      {followedCategories.map((cat) => (
        <span
          key={cat.id}
          onClick={() => onSelect(cat.id === selectedCategory ? undefined : cat.id)}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
            selectedCategory === cat.id
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          {cat.name}
        </span>
      ))}
    </div>
  );
};

export default FollowedCategories;
