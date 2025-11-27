import React from "react";
import Link from "next/link";
import { Heart, Eye, BookOpen, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChapterList } from "@/components/features/comic/chapter-list";
import { getComicBySlug } from "@/lib/mock-data/comics";
import { generateChapters } from "@/lib/mock-data/chapters";
import { formatNumber } from "@/lib/utils";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string };
}

export default function ComicDetailPage({ params }: Props) {
  const comic = getComicBySlug(params.slug);

  if (!comic) {
    notFound();
  }

  // Generate full chapter list
  const latestChapterNumber = comic.latestChapters[0]?.number || 100;
  const chapters = generateChapters(comic.id, latestChapterNumber);

  return (
    <div>
      {/* Hero Section with Glassmorphism */}
      <div className="relative">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${comic.coverImage || comic.thumbnail})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>

        {/* Content */}
        <div className="container relative mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <img
                src={comic. thumbnail}
                alt={comic.title}
                className="mx-auto h-80 w-56 rounded-lg object-cover shadow-2xl md:mx-0"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-text-primary">
                {comic. title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {comic.genres.map((genre) => (
                  <Link key={genre. id} href={`/tim-kiem? genre=${genre.slug}`}>
                    <Badge variant="default">{genre.name}</Badge>
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-text-secondary md:justify-start">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {comic.rating}/5
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatNumber(comic.totalViews)} lượt xem
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {formatNumber(comic. followers)} theo dõi
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {chapters.length} chương
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm md:justify-start">
                <span className="text-text-secondary">Tác giả:</span>
                <span className="text-text-primary">{comic.authors.join(", ")}</span>
                <span className="mx-2 text-border">|</span>
                <span className="text-text-secondary">Tình trạng:</span>
                <span
                  className={
                    comic.status === "Completed"
                      ? "text-green-500"
                      : "text-accent-brand"
                  }
                >
                  {comic.status === "Completed" ?  "Hoàn thành" : "Đang tiến hành"}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
                {comic.description}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Link href={`/truyen/${comic.slug}/chap/chap-1`}>
                  <Button variant="accent" size="lg">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Đọc từ đầu
                  </Button>
                </Link>
                <Link href={`/truyen/${comic.slug}/chap/${comic.latestChapters[0]?. slug}`}>
                  <Button variant="secondary" size="lg">
                    <Clock className="mr-2 h-5 w-5" />
                    Đọc mới nhất
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  <Heart className="mr-2 h-5 w-5" />
                  Theo dõi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="container mx-auto px-4 py-8">
        <ChapterList chapters={chapters} comicSlug={comic.slug} />
      </div>
    </div>
  );
}