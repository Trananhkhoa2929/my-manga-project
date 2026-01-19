"use client";

import React, { useState } from "react";
import { Bold, Italic, Smile, Send, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
}

export function CommentInput({
  onSubmit,
  placeholder = "Viết bình luận của bạn...",
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent("");
    }
  };

  const emojis = ["😀", "😂", "🤣", "😍", "🥰", "😎", "🔥", "💪", "👍", "👎", "❤️", "💔", "😤", "😭", "🤔", "😱"];

  return (
    <div className="rounded-lg border border-border bg-background-surface2 p-3">
      {/* Toolbar */}
      <div className="mb-2 flex items-center gap-1">
        <button
          className="rounded p-1.5 text-text-secondary hover:bg-background-surface1 hover:text-text-primary"
          title="In đậm"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          className="rounded p-1.5 text-text-secondary hover:bg-background-surface1 hover:text-text-primary"
          title="In nghiêng"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          className="rounded p-1.5 text-text-secondary hover:bg-background-surface1 hover:text-text-primary"
          title="Spoiler"
        >
          <EyeOff className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={`rounded p-1.5 ${showEmoji
              ? "bg-accent-brand text-white"
              : "text-text-secondary hover:bg-background-surface1 hover:text-text-primary"
            }`}
          title="Emoji"
        >
          <Smile className="h-4 w-4" />
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="mb-2 flex flex-wrap gap-1 rounded-lg bg-background-surface1 p-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setContent(content + emoji)}
              className="rounded p-1 text-xl hover:bg-background-surface2"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] w-full resize-none bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      />

      {/* Submit */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!content.trim()}>
          <Send className="mr-2 h-4 w-4" />
          Gửi
        </Button>
      </div>
    </div>
  );
}