import { useState, useEffect } from "react";
import { searchSuggestHierarchy, type ProfileSuggestion } from "../../../api/orgStructureApi";

const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const id = setTimeout(async () => {
      const response = await searchSuggestHierarchy(query.trim(), 6);
      if (response.status === 200 && response.data) {
        setSuggestions(response.data.suggestions || []);
      }
    }, 200);

    return () => clearTimeout(id);
  }, [query]);

  const clear = () => setSuggestions([]);

  return { suggestions, clear };
};

export default useSearchSuggestions;
