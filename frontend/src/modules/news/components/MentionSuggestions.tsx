import type { ProfileSuggestion } from "../../../api/orgStructureApi";

interface MentionSuggestionsProps {
  suggestions: ProfileSuggestion[];
  loading: boolean;
  activeIndex: number;
  onSelect: (suggestion: ProfileSuggestion) => void;
}

const MentionSuggestions = ({
  suggestions,
  loading,
  activeIndex,
  onSelect,
}: MentionSuggestionsProps) => {
  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
      {loading ? (
        <div className="px-3 py-2 text-sm text-gray-500">Поиск сотрудников...</div>
      ) : (
        suggestions.map((item, index) => (
          <button
            key={item.eid}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(item);
            }}
            className={`w-full text-left px-3 py-2 transition-colors ${
              index === activeIndex ? "bg-purple-50" : "hover:bg-gray-50"
            }`}
          >
            <p className="text-sm font-medium text-gray-800">{item.full_name}</p>
            <p className="text-xs text-gray-500">{item.position} · {item.department}</p>
          </button>
        ))
      )}
    </div>
  );
};

export default MentionSuggestions;
