"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search, Menu, X, History, Moon, Sun, User, Bell, ChevronDown,
  Users, FolderOpen, Edit3, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_LINKS, GENRES, COMMUNITY_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-110">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <span className="hidden text-xl font-bold text-text-primary sm:block">
            MangaHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {NAV_LINKS.map((link) =>
            link.label === "Thể Loại" ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setIsGenreOpen(true)}
                onMouseLeave={() => setIsGenreOpen(false)}
              >
                <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-background-surface1 hover:text-text-primary">
                  {link.label}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {/* Mega Menu */}
                {isGenreOpen && (
                  <div className="absolute left-0 top-full w-[600px] rounded-xl border border-border bg-background-surface1 p-4 shadow-xl">
                    <div className="grid grid-cols-4 gap-2">
                      {GENRES.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/tim-kiem?genre=${genre.slug}`}
                          className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background-surface2 hover:text-accent-brand"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  (link as any).featured
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20"
                    : "text-text-secondary hover:bg-background-surface1 hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            )
          )}

          {/* Community Dropdown - Click-based */}
          <div className="relative">
            <button
              onClick={() => setIsCommunityOpen(!isCommunityOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/20 hover:text-purple-300"
            >
              <Sparkles className="h-4 w-4" />
              Cộng Đồng
              <ChevronDown className={cn("h-4 w-4 transition-transform", isCommunityOpen && "rotate-180")} />
            </button>

            {/* Community Dropdown Menu */}
            {isCommunityOpen && (
              <>
                {/* Backdrop to close on click outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCommunityOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-background-surface1 p-2 shadow-xl">
                  <div className="mb-2 px-3 py-2">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                      <Users className="h-3.5 w-3.5" />
                      Công Cụ Cộng Đồng
                    </p>
                  </div>

                  {COMMUNITY_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-start gap-3 rounded-lg p-3 transition-all hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10"
                      onClick={() => setIsCommunityOpen(false)}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background-surface2 text-lg transition-all group-hover:bg-purple-500/20 group-hover:scale-110">
                        {link.label.includes("Editor") && <Edit3 className="h-5 w-5 text-purple-400" />}
                        {link.label.includes("Dự Án") && <FolderOpen className="h-5 w-5 text-blue-400" />}
                        {link.label.includes("Nhóm") && <Users className="h-5 w-5 text-green-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary group-hover:text-purple-400">
                          {link.label.replace(/[✏️📁👥]/g, "").trim()}
                        </p>
                        <p className="text-xs text-text-muted">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  ))}

                  <div className="mt-2 border-t border-border pt-2">
                    <Link
                      href="/dich-truyen"
                      className="flex items-center gap-2 rounded-lg p-3 text-sm text-text-secondary transition-colors hover:bg-background-surface2 hover:text-accent-brand"
                      onClick={() => setIsCommunityOpen(false)}
                    >
                      <span className="text-lg">🌐</span>
                      <span>Đi đến công cụ dịch truyện</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden flex-1 max-w-md mx-4 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="search"
              placeholder="Tìm truyện..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* History */}
          <Link href="/lich-su">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <History className="h-5 w-5" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>

          {/* Login */}
          <Link href="/login">
            <Button variant="default" size="sm" className="hidden sm:flex">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="icon" className="sm:hidden">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="search"
              placeholder="Tìm truyện..."
              className="pl-10"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col p-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  (link as any).featured
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white my-1"
                    : "text-text-secondary hover:bg-background-surface1 hover:text-text-primary"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Community Links */}
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase text-purple-400">
                <Sparkles className="h-3.5 w-3.5" />
                Công Cụ Cộng Đồng
              </p>
              {COMMUNITY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-secondary hover:bg-purple-500/10 hover:text-purple-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label.includes("Editor") && <Edit3 className="h-4 w-4" />}
                  {link.label.includes("Dự Án") && <FolderOpen className="h-4 w-4" />}
                  {link.label.includes("Nhóm") && <Users className="h-4 w-4" />}
                  <span>{link.label.replace(/[✏️📁👥]/g, "").trim()}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Genres */}
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-text-muted">
                Thể Loại
              </p>
              <div className="grid grid-cols-2 gap-1">
                {GENRES.slice(0, 8).map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/tim-kiem?genre=${genre.slug}`}
                    className="rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-background-surface1 hover:text-accent-brand"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}