"use client";

// ===========================================
// HERO SPOTLIGHT - Featured Manga Slider
// Premium animated hero section
// ===========================================

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, Eye, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedManga {
    id: string;
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
}

// Mock featured manga
const FEATURED_MANGA: FeaturedManga[] = [
    {
        id: "1",
        title: "Tower of God",
        description: "Câu chuyện về chàng trai Bam và hành trình chinh phục Tháp Thần để tìm lại người con gái anh yêu. Một thế giới kỳ bí với những bí ẩn chờ được khám phá.",
        coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
        bannerImage: "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=1400&q=80",
        rating: 9.2,
        views: 15600000,
        chapters: 580,
        genres: ["Fantasy", "Action", "Adventure"],
        isHot: true,
    },
    {
        id: "2",
        title: "Solo Leveling",
        description: "Sung Jin-Woo, từ một thợ săn hạng E yếu nhất, trở thành thợ săn mạnh nhất thế giới sau khi nhận được sức mạnh bí ẩn từ hệ thống.",
        coverImage: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&q=80",
        bannerImage: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1400&q=80",
        rating: 9.5,
        views: 25000000,
        chapters: 200,
        genres: ["Action", "Fantasy", "Martial Arts"],
        isHot: true,
    },
    {
        id: "3",
        title: "The Beginning After The End",
        description: "Vua Arthur Leywin được tái sinh vào một thế giới mới đầy phép thuật. Liệu anh có thể thay đổi số phận bi thảm của kiếp trước?",
        coverImage: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?w=400&q=80",
        bannerImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&q=80",
        rating: 9.0,
        views: 12000000,
        chapters: 420,
        genres: ["Fantasy", "Isekai", "Magic"],
        isNew: true,
    },
];

export function HeroSpotlight() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % FEATURED_MANGA.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + FEATURED_MANGA.length) % FEATURED_MANGA.length);
    }, []);

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [isAutoPlaying, nextSlide]);

    const currentManga = FEATURED_MANGA[currentIndex];

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
        return views.toString();
    };

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
                                <span className="text-sm font-bold text-white">{currentManga.rating}</span>
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
                            {currentManga.genres.map((genre) => (
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
                            {currentManga.description}
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
                                href={`/truyen/${currentManga.id}`}
                                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/40"
                            >
                                <span>Đọc ngay</span>
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href={`/truyen/${currentManga.id}`}
                                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                            >
                                <BookOpen className="h-5 w-5" />
                                <span>Xem chi tiết</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
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
                        {FEATURED_MANGA.map((_, index) => (
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
            </div>
        </section>
    );
}
