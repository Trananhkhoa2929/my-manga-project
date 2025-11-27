"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, History, Moon, Sun, User, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_LINKS, GENRES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(! isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-brand">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <span className="hidden text-xl font-bold text-text-primary sm:block">
            MangaHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {NAV_LINKS. map((link) =>
            link.label === "Thể Loại" ? (
              <div
                key={link. href}
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
                  <div className="absolute left-0 top-full w-[600px] rounded-lg border border-border bg-background-surface1 p-4 shadow-xl">
                    <div className="grid grid-cols-4 gap-2">
                      {GENRES.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/tim-kiem? genre=${genre.slug}`}
                          className="rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-background-surface2 hover:text-accent-brand"
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
                className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-background-surface1 hover:text-text-primary"
              >
                {link. label}
              </Link>
            )
          )}
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
          <Button variant="default" size="sm" className="hidden sm:flex">
            Đăng nhập
          </Button>
          <Button variant="ghost" size="icon" className="sm:hidden">
            <User className="h-5 w-5" />
          </Button>
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
                className="rounded-lg px-3 py-3 text-sm font-medium text-text-secondary hover:bg-background-surface1 hover:text-text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
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