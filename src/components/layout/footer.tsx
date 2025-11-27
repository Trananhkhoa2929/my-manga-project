import React from "react";
import Link from "next/link";
import { GENRES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-background-surface1">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-brand">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <span className="text-xl font-bold text-text-primary">MangaHub</span>
            </Link>
            <p className="mt-4 text-sm text-text-secondary">
              Đọc truyện tranh online miễn phí, cập nhật nhanh nhất.  Manga, Manhwa, Manhua đủ thể loại.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Liên Kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-text-secondary hover:text-accent-brand">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link href="/bang-xep-hang" className="text-text-secondary hover:text-accent-brand">
                  Bảng Xếp Hạng
                </Link>
              </li>
              <li>
                <Link href="/lich-su" className="text-text-secondary hover:text-accent-brand">
                  Lịch Sử Đọc
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Thể Loại</h3>
            <ul className="space-y-2 text-sm">
              {GENRES. slice(0, 6).map((genre) => (
                <li key={genre. id}>
                  <Link
                    href={`/tim-kiem? genre=${genre.slug}`}
                    className="text-text-secondary hover:text-accent-brand"
                  >
                    {genre. name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Liên Hệ</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>Email: contact@mangahub. com</li>
              <li>Facebook: /mangahub</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-text-muted">
          © 2024 MangaHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}