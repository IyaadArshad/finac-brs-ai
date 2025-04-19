import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { MessageProps } from "@/types/types";
import { motion } from "framer-motion";
import { parseMarkdown } from "@/utils/markdownParser";
import { groupWords } from "./camelCased/groupWords";
import { WordSpan } from "./WordSpan";
import Image from "next/image";
import {
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
} from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

export function MessageComponent({
  message,
  onEdit,
  onDelete,
  onRegenerate,
  streaming = false,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(message.id, editedContent);
    }
    setIsEditing(!isEditing);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className={`group flex items-start px-32 py-4 ${
        message.role === "user" ? "justify-end" : "justify-start"
      } relative hover:bg-gray-50`}
      aria-label={`Message from ${message.role}`}
    >
      <div className={`max-w-3xl ${message.role === "user" ? "text-right" : ""}`}>
        {isEditing ? (
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full bg-white border border-gray-200 text-black px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[#1A479D]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEdit();
              if (e.key === "Escape") setIsEditing(false);
            }}
          />
        ) : (
          <div className={`markdown-body prose max-w-none ${
            message.role === "user" 
              ? "bg-[#EBF2FF] text-[#1A479D] px-4 py-3 rounded-xl"
              : ""
          }`}>
            {message.role === "assistant" ? (
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: "1.5",
                  letterSpacing: "-0.01em",
                }}
              >
                {/(?:\*\*|__|\*|_)/.test(message.content) ? (
                  // Render full parsed markdown so bold/italic are preserved
                  <span
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdown(message.content),
                    }}
                  />
                ) : (
                  // Animate word groups if no markdown tokens are detected
                  groupWords(message.content, 3).map((group, index) => (
                    <WordSpan key={index} word={group + " "} index={index} />
                  ))
                )}
              </div>
            ) : (
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: "1.5",
                  letterSpacing: "-0.01em",
                }}
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(message.content),
                }}
              />
            )}
          </div>
        )}
        {message.role === "assistant" && !streaming && (
          <div className="flex gap-1 mt-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRegenerate?.(message.id)}
              className="h-7 w-7 text-gray-400 hover:text-[#1A479D]"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-7 w-7 text-gray-400 hover:text-[#1A479D]"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-[#1A479D]"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-[#1A479D]"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {message.role !== "assistant" && (
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity top-2 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(message.id)}
            className="h-8 w-8 text-gray-400 hover:text-[#1A479D]"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}