import { useEffect, useRef, useState } from "react";
import {
  searchHierarchy,
  type ProfileSuggestion,
} from "../../../api/orgStructureApi";

export type MentionContext = "new" | "reply" | "edit";

interface MentionState {
  context: MentionContext;
  start: number;
  end: number;
  query: string;
}

interface GetText {
  new: string;
  reply: string;
  edit: string;
}

interface SetText {
  new: (v: string) => void;
  reply: (v: string) => void;
  edit: (v: string) => void;
}

export const useMentions = (getText: GetText, setText: SetText) => {
  const [mentionSuggestions, setMentionSuggestions] = useState<ProfileSuggestion[]>([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [activeMention, setActiveMention] = useState<MentionState | null>(null);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);

  const mentionDebounceRef = useRef<number | null>(null);
  const mentionRequestRef = useRef(0);

  useEffect(() => {
    return () => {
      if (mentionDebounceRef.current) window.clearTimeout(mentionDebounceRef.current);
    };
  }, []);

  const closeMentionSuggestions = () => {
    setMentionSuggestions([]);
    setMentionLoading(false);
    setActiveMention(null);
    setActiveMentionIndex(0);
  };

  const findMentionAtCursor = (value: string, cursorPosition: number) => {
    if (cursorPosition <= 0) return null;
    const beforeCursor = value.slice(0, cursorPosition);
    const mentionStart = beforeCursor.lastIndexOf("@");
    if (mentionStart === -1) return null;
    const beforeMentionChar = mentionStart > 0 ? beforeCursor[mentionStart - 1] : " ";
    if (beforeMentionChar && /\S/.test(beforeMentionChar)) return null;
    const mentionSlice = beforeCursor.slice(mentionStart + 1);
    if (!/^[\p{L}\p{N}._\s-]*$/u.test(mentionSlice)) return null;
    return { start: mentionStart, end: cursorPosition, query: mentionSlice.trim() };
  };

  const searchMentionSuggestions = async (query: string): Promise<ProfileSuggestion[]> => {
    const res = await searchHierarchy(query, 0, 20);
    const employees =
      res.status === 200 && res.data
        ? res.data.results.map((item) => ({
            eid: item.eid,
            full_name: item.full_name,
            position: item.position,
            department: item.organization_unit_name ?? "",
          }))
        : [];

    const byEid = new Map<string, ProfileSuggestion>();
    employees.forEach((item) => {
      if (!item?.eid || !item.full_name) return;
      const key = String(item.eid);
      if (!byEid.has(key)) byEid.set(key, item);
    });

    const normalizedQuery = query.toLowerCase();
    return Array.from(byEid.values())
      .sort((a, b) => {
        const aStarts = a.full_name.toLowerCase().startsWith(normalizedQuery) ? 1 : 0;
        const bStarts = b.full_name.toLowerCase().startsWith(normalizedQuery) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        return a.full_name.localeCompare(b.full_name, "ru");
      })
      .slice(0, 10);
  };

  const handleMentionInputChange = (context: MentionContext, value: string, cursorPosition: number) => {
    const mention = findMentionAtCursor(value, cursorPosition);
    if (!mention) {
      if (activeMention?.context === context) closeMentionSuggestions();
      return;
    }

    setActiveMention({ context, start: mention.start, end: mention.end, query: mention.query });

    if (mentionDebounceRef.current) window.clearTimeout(mentionDebounceRef.current);

    if (mention.query.length < 1) {
      setMentionSuggestions([]);
      setMentionLoading(false);
      setActiveMentionIndex(0);
      return;
    }

    const requestId = ++mentionRequestRef.current;
    setMentionLoading(true);
    mentionDebounceRef.current = window.setTimeout(async () => {
      try {
        const results = await searchMentionSuggestions(mention.query);
        if (requestId !== mentionRequestRef.current) return;
        setMentionSuggestions(results);
        setActiveMentionIndex(0);
      } catch {
        if (requestId === mentionRequestRef.current) setMentionSuggestions([]);
      } finally {
        if (requestId === mentionRequestRef.current) setMentionLoading(false);
      }
    }, 220);
  };

  const applyMentionSuggestion = (
    suggestion: ProfileSuggestion,
    inputEl?: HTMLInputElement | HTMLTextAreaElement | null
  ) => {
    if (!activeMention) return;
    const currentValue = getText[activeMention.context];
    const valueBefore = currentValue.slice(0, activeMention.start);
    const valueAfter = currentValue.slice(activeMention.end);
    const insertedMention = `@${suggestion.full_name} `;
    const nextValue = `${valueBefore}${insertedMention}${valueAfter}`;
    const cursor = valueBefore.length + insertedMention.length;

    setText[activeMention.context](nextValue);
    closeMentionSuggestions();

    if (inputEl) {
      requestAnimationFrame(() => {
        inputEl.focus();
        inputEl.setSelectionRange(cursor, cursor);
      });
    }
  };

  const handleMentionKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    context: MentionContext
  ): boolean => {
    if (!activeMention || activeMention.context !== context) return false;
    if (mentionSuggestions.length === 0) return false;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveMentionIndex((prev) => (prev + 1) % mentionSuggestions.length);
      return true;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveMentionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      applyMentionSuggestion(mentionSuggestions[activeMentionIndex], event.currentTarget);
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeMentionSuggestions();
      return true;
    }
    return false;
  };

  return {
    mentionSuggestions,
    mentionLoading,
    activeMention,
    activeMentionIndex,
    closeMentionSuggestions,
    handleMentionInputChange,
    handleMentionKeyDown,
    applyMentionSuggestion,
  };
};
