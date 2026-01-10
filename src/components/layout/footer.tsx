import React from "react";
import Link from "next/link";
import { GENRES } from "@/lib/constants";
import { Facebook, Mail, MessageCircle, Heart, Github, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-gradient-to-b from-background-surface1 to-background-base">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-110">
                <span className="text-xl font-black text-white">M</span>
              </div>
              <span className="text-2xl font-black text-text-primary">MangaHub</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Nền tảng đọc và dịch truyện tranh cộng đồng. Manga, Manhwa, Manhua đủ thể loại, cập nhật nhanh nhất.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-surface2 text-text-muted transition-all hover:bg-blue-600 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-surface2 text-text-muted transition-all hover:bg-purple-600 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-surface2 text-text-muted transition-all hover:bg-gray-700 hover:text-white"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-text-muted">Điều Hướng</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-text-secondary transition-colors hover:text-accent-brand">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link href="/bang-xep-hang" className="text-text-secondary transition-colors hover:text-accent-brand">
                  Bảng Xếp Hạng
                </Link>
              </li>
              <li>
                <Link href="/dich-truyen" className="text-text-secondary transition-colors hover:text-accent-brand">
                  Công Cụ Dịch
                </Link>
              </li>
              <li>
                <Link href="/editor" className="text-text-secondary transition-colors hover:text-accent-brand">
                  Editor
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-text-secondary transition-colors hover:text-accent-brand">
                  Dự Án Dịch
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-text-muted">Thể Loại</h3>
            <ul className="space-y-3 text-sm">
              {GENRES.slice(0, 6).map((genre) => (
                <li key={genre.id}>
                  <Link
                    href={`/tim-kiem?genre=${genre.slug}`}
                    className="text-text-secondary transition-colors hover:text-accent-brand"
                  >
                    {genre.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-text-muted">Liên Hệ</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-text-muted" />
                contact@mangahub.com
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-text-muted" />
                mangahub.com
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="mb-3 text-sm text-text-muted">Đăng ký nhận thông báo</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 rounded-lg border border-border bg-background-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-brand focus:outline-none"
                />
                <button className="rounded-lg bg-accent-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-brand/80">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="flex items-center gap-1 text-sm text-text-muted">
            © 2024 MangaHub. Made with <Heart className="h-4 w-4 text-red-500" /> for manga lovers.
          </p>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <Link href="#" className="hover:text-text-primary">Điều khoản</Link>
            <Link href="#" className="hover:text-text-primary">Bảo mật</Link>
            <Link href="#" className="hover:text-text-primary">DMCA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}