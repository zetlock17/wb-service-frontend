import { useState, useEffect } from "react";
import { searchHierarchy, type ProfileSearchResult } from "../../../api/orgStructureApi";

const EMPTY: ProfileSearchResult = { total: 0, results: [], error: null };

const useSearchResults = (activeQuery: string) => {
  const [results, setResults] = useState<ProfileSearchResult>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeQuery.trim() === "") {
      setResults(EMPTY);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setError(null);
      try {
        const response = await searchHierarchy(activeQuery.trim(), 0, 10);
        if (cancelled) return;
        if (response.status === 200 && response.data) {
          setResults(response.data);
        } else {
          setResults(EMPTY);
          setError(response.message || "Ошибка поиска");
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Ошибка поиска");
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [activeQuery]);

  return { results, error };
};

export default useSearchResults;
