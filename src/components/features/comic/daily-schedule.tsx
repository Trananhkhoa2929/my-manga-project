"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ComicCard } from "./comic-card";
import { DAYS, DAY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api } from "@shared/api";
import { Comic } from "@/lib/types";

export function DailySchedule() {
  // Get current day
  const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const todayKey = today === "MON" ? "MON" :
    today === "TUE" ? "TUE" :
      today === "WED" ? "WED" :
        today === "THU" ? "THU" :
          today === "FRI" ? "FRI" :
            today === "SAT" ? "SAT" : "SUN";

  const [activeDay, setActiveDay] = useState(todayKey);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const response = await api.get<{ data: Comic[] }>('/comics?sort=latest&limit=50');
        setComics(response.data.data);
      } catch (error) {
        console.error('Failed to fetch comics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, []);

  // Group comics by day of week based on their lastUpdated date
  const comicsByDay = useMemo(() => {
    const groups: Record<string, Comic[]> = {
      MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: []
    };

    comics.forEach((comic) => {
      const date = new Date(comic.lastUpdated);
      const day = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      const dayKey = day === "MON" ? "MON" :
        day === "TUE" ? "TUE" :
          day === "WED" ? "WED" :
            day === "THU" ? "THU" :
              day === "FRI" ? "FRI" :
                day === "SAT" ? "SAT" : "SUN";

      if (groups[dayKey]) {
        groups[dayKey].push(comic);
      }
    });

    return groups;
  }, [comics]);

  // Count comics per day
  const comicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DAYS.forEach((day) => {
      counts[day] = comicsByDay[day]?.length || 0;
    });
    return counts;
  }, [comicsByDay]);

  const currentComics = comicsByDay[activeDay] || [];

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-background-surface1/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Lịch Phát Hành
              </span>
            </h2>
            <p className="mt-2 text-sm text-text-secondary">Đang tải...</p>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-lg bg-background-surface2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background-surface1/50 to-transparent">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Lịch Phát Hành
              </span>
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Theo dõi truyện cập nhật theo ngày trong tuần
            </p>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-background-surface1 p-2">
          {DAYS.map((day) => {
            const isActive = activeDay === day;
            const isToday = day === todayKey;
            const count = comicCounts[day];

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-accent-brand text-white shadow-lg shadow-accent-brand/25"
                    : "text-text-secondary hover:bg-background-surface2 hover:text-text-primary"
                )}
              >
                <span>{DAY_LABELS[day]}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-background-surface2 text-text-muted"
                    )}
                  >
                    {count}
                  </span>
                )}
                {isToday && !isActive && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent-brand" />
                )}
              </button>
            );
          })}
        </div>

        {/* Comics Grid - Webtoon Style */}
        {currentComics.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {currentComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} variant="webtoon" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-background-surface1 py-12 text-center">
            <p className="text-text-secondary">
              Không có truyện cập nhật vào ngày này
            </p>
          </div>
        )}
      </div>
    </section>
  );
}