"use client";

import { useState, useEffect, useCallback } from "react";

interface UseScrollSpyOptions {
  threshold?: number;
  throttleMs?: number;
}

export function useScrollSpy(options: UseScrollSpyOptions = {}) {
  const { threshold = 100, throttleMs = 100 } = options;

  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollInfo = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Direction
      if (Math.abs(scrollY - lastScrollY) > threshold) {
        setScrollDirection(scrollY > lastScrollY ? "down" : "up");
        lastScrollY = scrollY;
      }

      // Position
      setIsAtTop(scrollY < 50);
      setIsAtBottom(scrollY + windowHeight >= documentHeight - 50);

      // Progress
      const progress = (scrollY / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollInfo);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollInfo(); // Initial call

    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }, []);

  return {
    scrollDirection,
    isAtTop,
    isAtBottom,
    scrollProgress,
    scrollToTop,
    scrollToBottom,
  };
}