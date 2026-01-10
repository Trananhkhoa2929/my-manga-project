import { DailySchedule } from "@/components/features/comic/daily-schedule";
import { LatestUpdates } from "@/components/features/comic/latest-updates";
import { HeroSpotlight } from "@/components/features/comic/hero-spotlight";
import { Sidebar } from "@/components/layout/sidebar";

export default function HomePage() {
  return (
    <div>
      {/* Hero Spotlight - Featured Manga */}
      <HeroSpotlight />

      {/* Daily Schedule - Webtoons Style */}
      <DailySchedule />

      {/* Main Content + Sidebar - Nettruyen Style */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            <LatestUpdates />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}