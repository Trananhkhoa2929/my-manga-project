"use client";

import React, { useState } from "react";
import { ThumbsUp, MessageSquare, Flag } from "lucide-react";
import { Comment } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { USER_TITLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
}

const roleColors: Record<string, string> = {
  admin: "text-red-500",
  uploader: "text-green-500",
  vip: "text-yellow-500",
  member: "text-blue-400",
};

export function CommentItem({ comment, isReply = false }: CommentItemProps) {
  const [likes, setLikes] = useState(comment. likes);
  const [liked, setLiked] = useState(false);
  const [showReply, setShowReply] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  // Get user title based on level
  const getUserTitle = (level: number) => {
    const levels = Object.keys(USER_TITLES)
      .map(Number)
      . sort((a, b) => b - a);
    for (const lvl of levels) {
      if (level >= lvl) return USER_TITLES[lvl];
    }
    return "Luyện Khí";
  };

  return (
    <div className={cn("flex gap-3", isReply && "ml-10")}>
      {/* Avatar */}
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={comment.userAvatar}
          alt={comment.userName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("font-semibold", roleColors[comment.userRole])}>
            {comment.userName}
          </span>
          <span className="rounded bg-accent-brand/20 px-1. 5 py-0.5 text-xs text-accent-brand">
            Lv. {comment.userLevel} {getUserTitle(comment.userLevel)}
          </span>
          <span className="text-xs text-text-muted">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>

        {/* Body */}
        <p className="mt-1 text-sm text-text-primary">{comment.content}</p>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 text-xs",
              liked ?  "text-accent-brand" : "text-text-muted hover:text-text-primary"
            )}
          >
            <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
            {likes}
          </button>
          {! isReply && (
            <button
              onClick={() => setShowReply(! showReply)}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
            >
              <MessageSquare className="h-4 w-4" />
              Trả lời
            </button>
          )}
          <button className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-hot">
            <Flag className="h-4 w-4" />
            Báo xấu
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}