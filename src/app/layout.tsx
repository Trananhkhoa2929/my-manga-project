import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "MangaHub - Đọc truyện tranh online",
  description: "Đọc truyện tranh online miễn phí, cập nhật nhanh nhất.  Manga, Manhwa, Manhua đủ thể loại.",
};

export default function RootLayout({
  children,
}: {
  children: React. ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}