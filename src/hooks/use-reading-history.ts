"use client";

import { useState, useEffect, useCallback } from "react";
import { ReadingHistory } from "@/lib/types";

const STORAGE_KEY = "reading_history";
const MAX_HISTORY = 20;

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load từ localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse reading history:", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save vào localStorage
  const saveHistory = useCallback((newHistory: ReadingHistory[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }
    setHistory(newHistory);
  }, []);

  // Thêm hoặc update lịch sử
  const addToHistory = useCallback(
    (entry: Omit<ReadingHistory, "timestamp">) => {
      const timestamp = Date.now();
      const newEntry: ReadingHistory = { ...entry, timestamp };

      setHistory((prev) => {
        // Loại bỏ entry cũ của cùng comic
        const filtered = prev.filter((h) => h.comicId !== entry.comicId);
        // Thêm entry mới vào đầu
        const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
        // Save to localStorage directly to avoid triggering another setState
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    },
    []
  );

  // Xóa một entry
  const removeFromHistory = useCallback(
    (comicId: string) => {
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.comicId !== comicId);
        saveHistory(filtered);
        return filtered;
      });
    },
    [saveHistory]
  );

  // Xóa toàn bộ
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // Kiểm tra đã đọc chương nào chưa
  const getLastReadChapter = useCallback(
    (comicId: string): ReadingHistory | undefined => {
      return history.find((h) => h.comicId === comicId);
    },
    [history]
  );

  return {
    history,
    isLoaded,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getLastReadChapter,
  };
}