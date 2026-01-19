"use client";

import React, { useState } from "react";
import { X, Monitor, Smartphone, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReaderSettingsProps {
  onClose: () => void;
}

export function ReaderSettings({ onClose }: ReaderSettingsProps) {
  const [bgColor, setBgColor] = useState<"black" | "dark" | "sepia" | "white">("dark");
  const [readMode, setReadMode] = useState<"scroll" | "paged">("scroll");
  const [imageWidth, setImageWidth] = useState<"fit" | "full" | "original">("fit");

  const bgOptions = [
    { key: "black", label: "Đen", color: "#000000" },
    { key: "dark", label: "Tối", color: "#121212" },
    { key: "sepia", label: "Sepia", color: "#F4ECD8" },
    { key: "white", label: "Trắng", color: "#FFFFFF" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-background-surface1 sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-text-primary">Cài đặt đọc truyện</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-background-surface2"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-6 p-4">
          {/* Background Color */}
          <div>
            <p className="mb-3 text-sm font-medium text-text-primary">Màu nền</p>
            <div className="flex gap-3">
              {bgOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setBgColor(opt.key as typeof bgColor)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all",
                    bgColor === opt.key
                      ? "border-accent-brand"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: opt.color }}
                  title={opt.label}
                >
                  {bgColor === opt.key && (
                    <span
                      className={cn(
                        "text-xs font-bold",
                        opt.key === "white" || opt.key === "sepia"
                          ? "text-black"
                          : "text-white"
                      )}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Read Mode */}
          <div>
            <p className="mb-3 text-sm font-medium text-text-primary">Chế độ đọc</p>
            <div className="flex gap-3">
              <button
                onClick={() => setReadMode("scroll")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors",
                  readMode === "scroll"
                    ? "border-accent-brand bg-accent-brand/10 text-accent-brand"
                    : "border-border text-text-secondary hover:border-accent-brand/50"
                )}
              >
                <Smartphone className="h-4 w-4" />
                Cuộn dọc
              </button>
              <button
                onClick={() => setReadMode("paged")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors",
                  readMode === "paged"
                    ? "border-accent-brand bg-accent-brand/10 text-accent-brand"
                    : "border-border text-text-secondary hover:border-accent-brand/50"
                )}
              >
                <Monitor className="h-4 w-4" />
                Từng trang
              </button>
            </div>
          </div>

          {/* Image Width */}
          <div>
            <p className="mb-3 text-sm font-medium text-text-primary">Kích thước ảnh</p>
            <div className="flex gap-2">
              {[
                { key: "fit", label: "Vừa màn hình" },
                { key: "full", label: "Toàn bộ" },
                { key: "original", label: "Gốc" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setImageWidth(opt.key as typeof imageWidth)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    imageWidth === opt.key
                      ? "border-accent-brand bg-accent-brand/10 text-accent-brand"
                      : "border-border text-text-secondary hover:border-accent-brand/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-accent-brand py-3 font-semibold text-white hover:bg-accent-brand/90"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}