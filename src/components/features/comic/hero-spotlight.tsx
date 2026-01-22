"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, Eye, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@shared/api";

interface FeaturedManga {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage: string;
    bannerImage?: string;
    rating: number;
    views: number;
    chapters: number;
    genres: string[];
    isNew?: boolean;
    isHot?: boolean;
    firstChapterSlug?: string;
}

export function HeroSpotlight() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [featuredManga, setFeaturedManga] = useState<FeaturedManga[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await api.get<{ data: any[] }>('/comics?sort=views&limit=5');
                const data = response.data.data.map((comic: any) => ({
                    id: comic.id,
                    slug: comic.slug,
                    title: comic.title,
                    description: comic.description || 'Khám phá câu chuyện hấp dẫn này ngay!',
                    coverImage: comic.thumbnail,
                    bannerImage: comic.coverImage,
                    rating: comic.rating || 0,
                    views: comic.totalViews || 0,
                    chapters: comic.chaptersCount || 0,
                    genres: comic.genres?.map((g: any) => g.name) || [],
                    isHot: (comic.totalViews || 0) > 10000,
                    isNew: new Date(comic.lastUpdated).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
                    // Get first chapter slug (latestChapters is sorted by number desc, so last item is chapter 1)
                    firstChapterSlug: comic.latestChapters?.length > 0
                        ? comic.latestChapters[comic.latestChapters.length - 1]?.slug
                        : undefined,
                }));
                setFeaturedManga(data);
            } catch (error) {
                console.error('Failed to fetch featured manga:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const nextSlide = useCallback(() => {
        if (featuredManga.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % featuredManga.length);
    }, [featuredManga.length]);

    const prevSlide = useCallback(() => {
        if (featuredManga.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + featuredManga.length) % featuredManga.length);
    }, [featuredManga.length]);

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying || featuredManga.length === 0) return;
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [isAutoPlaying, nextSlide, featuredManga.length]);

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
        return views.toString();
    };

    if (loading) {
        return (
            <section className="relative overflow-hidden bg-gradient-to-b from-background-base to-background-surface1 h-[500px] flex items-center justify-center">
                <div className="animate-pulse text-text-muted">Đang tải...</div>
            </section>
        );
    }

    if (featuredManga.length === 0) {
        return (
            <section className="relative overflow-hidden bg-gradient-to-b from-background-base to-background-surface1">
                <div className="container mx-auto px-4 py-16 lg:py-24 text-center">
                    <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Chưa có truyện nổi bật</h2>
                    <p className="text-gray-400">Thêm truyện vào database để hiển thị ở đây</p>
                </div>
            </section>
        );
    }

    const currentManga = featuredManga[currentIndex];

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-background-base to-background-surface1">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
                    style={{
                        backgroundImage: `url(${currentManga.bannerImage || currentManga.coverImage})`,
                        filter: "blur(8px) brightness(0.3)",
                        transform: "scale(1.1)",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background-base via-background-base/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-base via-transparent to-background-base/50" />
            </div>

            {/* Content */}
            <div className="container relative mx-auto px-4 py-16 lg:py-24">
                <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-12">
                    {/* Left: Cover Image */}
                    <div
                        className="group relative shrink-0"
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                        <div className="relative h-[400px] w-[280px] overflow-hidden rounded-2xl shadow-2xl shadow-black/50 transition-transform duration-500 group-hover:scale-105 lg:h-[480px] lg:w-[340px]">
                            <img
                                src={currentManga.coverImage}
                                alt={currentManga.title}
                                className="h-full w-full object-cover transition-transform duration-700"
                            />
                            {/* Badges */}
                            <div className="absolute left-3 top-3 flex flex-col gap-2">
                                {currentManga.isHot && (
                                    <span className="animate-pulse rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                                        🔥 HOT
                                    </span>
                                )}
                                {currentManga.isNew && (
                                    <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                                        ✨ NEW
                                    </span>
                                )}
                            </div>
                            {/* Rating Badge */}
                            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-white">{currentManga.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        {/* Glow Effect */}
                        <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-1 flex-col justify-center text-center lg:text-left">
                        {/* Featured Label */}
                        <div className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            <span className="text-sm font-medium uppercase tracking-wider text-purple-400">
                                Featured Spotlight
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="mb-4 text-4xl font-black text-white lg:text-5xl xl:text-6xl">
                            {currentManga.title}
                        </h1>

                        {/* Genres */}
                        <div className="mb-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                            {currentManga.genres.slice(0, 4).map((genre) => (
                                <span
                                    key={genre}
                                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>

                        {/* Description */}
                        <p className="mb-6 max-w-xl text-lg leading-relaxed text-gray-300 lg:text-xl">
                            {currentManga.description.slice(0, 200)}...
                        </p>

                        {/* Stats */}
                        <div className="mb-8 flex items-center justify-center gap-6 lg:justify-start">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-gray-400" />
                                <span className="font-semibold text-white">{formatViews(currentManga.views)}</span>
                                <span className="text-gray-400">lượt xem</span>
                            </div>
                            <div className="h-4 w-px bg-gray-600" />
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                                <span className="font-semibold text-white">{currentManga.chapters}</span>
                                <span className="text-gray-400">chương</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                            <Link
                                href={currentManga.firstChapterSlug
                                    ? `/truyen/${currentManga.slug}/chap/${currentManga.firstChapterSlug}`
                                    : `/truyen/${currentManga.slug}`}
                                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/40"
                            >
                                <span>Đọc ngay</span>
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href={`/truyen/${currentManga.slug}`}
                                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                            >
                                <BookOpen className="h-5 w-5" />
                                <span>Xem chi tiết</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                {featuredManga.length > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-6">
                        {/* Prev Button */}
                        <button
                            onClick={prevSlide}
                            className="rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-3">
                            {featuredManga.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        index === currentIndex
                                            ? "w-8 bg-gradient-to-r from-purple-500 to-pink-500"
                                            : "w-2 bg-white/30 hover:bg-white/50"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={nextSlide}
                            className="rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
