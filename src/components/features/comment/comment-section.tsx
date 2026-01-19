"use client";

import React, { useState } from "react";
import { Comment } from "@/lib/types";
import { CommentInput } from "@/components/features/comment/comment-input";
import { CommentItem } from "@/components/features/comment/comment-item";

// Mock comments
const mockComments: Comment[] = [
  {
    id: "1",
    userId: "u1",
    userName: "TuTienDaiNhan",
    userAvatar: "https://picsum.photos/seed/user1/100",
    userLevel: 50,
    userTitle: "Hóa Thần",
    userRole: "vip",
    content: "Chương này hay quá!  Main bắt đầu bá đạo rồi 🔥🔥🔥",
    likes: 234,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    replies: [
      {
        id: "1-1",
        userId: "u2",
        userName: "MangaLover",
        userAvatar: "https://picsum.photos/seed/user2/100",
        userLevel: 25,
        userTitle: "Kim Đan",
        userRole: "member",
        content: "Đồng ý!  Tác giả vẽ battle scene đỉnh thật 👍",
        likes: 45,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    id: "2",
    userId: "u3",
    userName: "Admin_MangaHub",
    userAvatar: "https://picsum.photos/seed/admin/100",
    userLevel: 100,
    userTitle: "Độ Kiếp",
    userRole: "admin",
    content: "📢 Thông báo: Truyện sẽ được cập nhật vào thứ 2, 4, 6 hàng tuần.  Theo dõi để không bỏ lỡ nhé!",
    likes: 567,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    userId: "u4",
    userName: "NoiTamTu",
    userAvatar: "https://picsum.photos/seed/user4/100",
    userLevel: 10,
    userTitle: "Trúc Cơ",
    userRole: "member",
    content: "Ai spoil tui block nha 😤",
    likes: 89,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

type SortType = "newest" | "oldest" | "top";

export function CommentSection({ chapterId }: { chapterId: string }) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [sortBy, setSortBy] = useState<SortType>("newest");

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return b.likes - a.likes;
  });

  const handleSubmit = (content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: "current-user",
      userName: "Bạn",
      userAvatar: "https://picsum.photos/seed/me/100",
      userLevel: 1,
      userTitle: "Luyện Khí",
      userRole: "member",
      content,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    setComments([newComment, ...comments]);
  };

  return (
    <div id="comments" className="mt-8 rounded-lg bg-background-surface1 p-4">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          💬 Bình luận ({comments.length})
        </h3>

        {/* Sort Tabs */}
        <div className="flex gap-1 rounded-lg bg-background-surface2 p-1">
          {(["newest", "oldest", "top"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSortBy(type)}
              className={`rounded-md px-3 py-1 text-sm ${sortBy === type
                  ? "bg-accent-brand text-white"
                  : "text-text-secondary hover:text-text-primary"
                }`}
            >
              {type === "newest" ? "Mới nhất" : type === "oldest" ? "Cũ nhất" : "Top"}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <CommentInput onSubmit={handleSubmit} />

      {/* Comments List */}
      <div className="mt-6 space-y-4">
        {sortedComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}