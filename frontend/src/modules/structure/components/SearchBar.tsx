import { Search } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ProfileSuggestion } from "../../../api/orgStructureApi";

interface SearchBarProps {
  searchQuery: string;
  suggestions: ProfileSuggestion[];
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onSuggestionClick: (suggestion: ProfileSuggestion) => void;
}

const SearchBar = ({
  searchQuery,
  suggestions,
  onQueryChange,
  onSubmit,
  onSuggestionClick,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0, width: 0 });

  const updateRect = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      updateRect();
    }
  }, [isOpen, suggestions, updateRect]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: ProfileSuggestion) => {
    onSuggestionClick(suggestion);
    setIsOpen(false);
  };

  const showDropdown = isOpen && suggestions.length > 0;

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Найти сотрудника"
        value={searchQuery}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        className="w-full rounded-xl border border-purple-100 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
      />

      {showDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              zIndex: 9999,
            }}
            className="max-h-80 overflow-y-auto rounded-xl border border-purple-200 bg-white p-2 shadow-xl"
          >
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.eid}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }}
                className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-purple-50"
              >
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2 lg:whitespace-nowrap">
                  <span className="truncate font-medium text-purple-700">{suggestion.full_name}</span>
                  <span className="hidden text-gray-400 lg:inline">•</span>
                  <span className="truncate text-sm text-gray-600">{suggestion.position}</span>
                  <span className="hidden text-gray-400 lg:inline">•</span>
                  <span className="truncate text-sm text-gray-500">{suggestion.department}</span>
                </div>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default SearchBar;
