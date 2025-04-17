"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Cookies from "js-cookie";
import gravatarUrl from "gravatar-url";
import ReactDOMServer from "react-dom/server";
import { Message } from "@/types/types";
import { StatusIndicator } from "@/components/indicator";
import { logVerbose } from "@/components/home/camelCased/logVerbose";
import { CommandMenu } from "@/components/home/CommandMenu";
import { MessageComponent } from "@/components/home/MessageComponent";
import { SplitScreenEditor } from "@/components/splitScreenEditor";
import { DocumentHeader } from "@/components/DocumentHeader";
import { ChatInputBox } from "@/components/ChatInputBox";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

declare global {
  interface Window {
    verbose: boolean;
  }
}

function SearchParamsHandler({
  onParamsChange,
}: {
  onParamsChange: (splitScreen: string | null, fileName: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const splitScreenParam = searchParams.get("splitScreen");
    const fileNameParam = searchParams.get("fileName");
    onParamsChange(splitScreenParam, fileNameParam);
  }, [searchParams, onParamsChange]);

  return null;
}

// New WelcomeScreen component
function WelcomeScreen({
  message,
  setMessage,
  handleSendMessage,
  handleStopRequest,
  isStreaming,
}: {
  message: string;
  setMessage: (value: string) => void;
  handleSendMessage: () => void;
  handleStopRequest: () => void;
  isStreaming: boolean;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-white text-black">
      {/* Top section with date and user icon */}
      <div className="flex justify-between items-center w-full p-6">
        <div className="text-[#1A479D] text-lg font-medium">
          {formatDate(new Date())}
        </div>
        <div className="relative w-12 h-12 border-2 border-[#1A479D] rounded-full overflow-hidden flex items-center justify-center bg-white">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-[#1A479D]"
            fill="currentColor"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M12 11c-3.866 0-7 3.134-7 7v2h14v-2c0-3.866-3.134-7-7-7z" />
          </svg>
        </div>
      </div>

      {/* Main content - centered vertically */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col items-center px-4">
          {/* Logo */}
          <div className="mb-3 w-32 h-32 relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/finac-logo-removebg-aLpR2MPh5KBTtDt9S0tD9MKhOeyle0.png"
              alt="FiNAC Logo"
              width={128}
              height={128}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          {/* Welcome text */}
          <h1 className="text-4xl font-semibold mb-1 text-center">
            <span className="text-[#1A479D] font-bold">FiNAC BRS AI</span>{" "}
            Welcomes You
          </h1>

          <p className="text-gray-500 mb-6 text-md text-center">
            Type a message to start your BRS generation process
          </p>

          {/* Input box */}
          <div className="w-full mb-8">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type something great here..."
                className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1A479D] focus:border-[#1A479D] hover:border-[#1A479D] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isStreaming || !message.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#1A479D]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-send"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-sm">
        Powered by FiNAC AI
      </footer>
    </div>
  );
}

// New styled message component to match the theme
function StyledMessageComponent({
  message,
  streaming,
  onEdit,
  onDelete,
  onRegenerate,
}: {
  message: Message;
  streaming?: boolean;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => Promise<void>;
}) {
  const isUser = message.role === "user";
  const isEmpty = !message.content || message.content.trim() === "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`px-4 py-6 flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-3xl ${isUser ? "order-2" : "order-1"}`}>
        {/* Avatar */}
        <div
          className={`relative w-8 h-8 ${
            isUser ? "ml-3" : "mr-3"
          } inline-block align-top`}
        >
          <div
            className={`w-8 h-8 rounded-full border-2 border-[#1A479D] flex items-center justify-center bg-white overflow-hidden`}
          >
            {isUser ? (
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-[#1A479D]"
                fill="currentColor"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M12 11c-3.866 0-7 3.134-7 7v2h14v-2c0-3.866-3.134-7-7-7z" />
              </svg>
            ) : (
              <Image
                src="/logo.png"
                alt="FiNAC AI"
                width={24}
                height={24}
                className="object-contain"
              />
            )}
          </div>
        </div>

        {/* Message content */}
        <div
          className={`inline-block px-4 py-2 rounded-2xl max-w-[calc(100%-3rem)] ${
            isUser
              ? "bg-[#EBF2FF] text-[#1A479D] rounded-tr-none"
              : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
          }`}
        >
          {isEmpty && !streaming ? (
            <span className="italic text-gray-400">
              {isUser
                ? "Empty message"
                : "No response generated. Please try again."}
            </span>
          ) : isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || ""}
            </ReactMarkdown>
          )}
        </div>

        {/* Action buttons for assistant messages */}
        {!isUser && !streaming && (
          <div className="mt-2 flex space-x-2 text-xs text-gray-500">
            <button
              onClick={() => onRegenerate(message.id)}
              className="hover:text-[#1A479D] transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="hover:text-[#1A479D] transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Styled chat input box for conversation
function StyledChatInputBox({
  message,
  setMessage,
  handleSendMessage,
  handleStopRequest,
  isStreaming,
  commandFilter,
  setCommandFilter,
  selectedButtons,
  setSelectedButtons,
}: {
  message: string;
  setMessage: (value: string) => void;
  handleSendMessage: () => void;
  handleStopRequest: () => void;
  isStreaming: boolean;
  commandFilter?: string;
  setCommandFilter?: (value: string) => void;
  selectedButtons?: {
    search: boolean;
    reason: boolean;
  };
  setSelectedButtons?: (value: { search: boolean; reason: boolean }) => void;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type something great here..."
          className="w-full p-4 pr-12 bg-transparent text-gray-800 focus:outline-none resize-none rounded-xl"
          rows={1}
          style={{
            minHeight: "56px",
            maxHeight: "200px",
          }}
        />

        {isStreaming ? (
          <button
            onClick={handleStopRequest}
            className="absolute right-3 bottom-3 text-gray-400 hover:text-[#1A479D] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`absolute right-3 bottom-3 transition-colors ${
              message.trim()
                ? "text-[#1A479D] hover:text-[#0D3B8B]"
                : "text-gray-300"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        )}
      </div>

      {/* Feature buttons */}
      {setSelectedButtons && selectedButtons && (
        <div className="flex border-t border-gray-100 px-3 py-2 text-sm text-gray-600">
          <button
            onClick={() =>
              setSelectedButtons({
                ...selectedButtons,
                search: !selectedButtons.search,
              })
            }
            className={`mr-3 px-3 py-1 rounded-full ${
              selectedButtons.search
                ? "bg-[#EBF2FF] text-[#1A479D]"
                : "hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Search
            </span>
          </button>
          <button
            onClick={() =>
              setSelectedButtons({
                ...selectedButtons,
                reason: !selectedButtons.reason,
              })
            }
            className={`px-3 py-1 rounded-full ${
              selectedButtons.reason
                ? "bg-[#EBF2FF] text-[#1A479D]"
                : "hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M14 19c3.771 0 5.657 0 6.828-1.172C22 16.657 22 14.771 22 11c0-3.771 0-5.657-1.172-6.828C19.657 3 17.771 3 14 3h-4C6.229 3 4.343 3 3.172 4.172 2 5.343 2 7.229 2 11c0 3.771 0 5.657 1.172 6.828.653.654 1.528.943 2.828 1.07" />
                <path d="M14 19c-1.236 0-2.598.5-3.841 1.145-1.998 1.037-2.997 1.556-3.489 1.225-.492-.33-.399-1.355-.212-3.404L6.5 17.5" />
                <path d="M7 8h10" />
                <path d="M7 12h6" />
              </svg>
              Reason
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function ChatInterface() {
  const handleSearchParamsChange = (
    splitScreen: string | null,
    fileName: string | null
  ) => {
    if (splitScreen === "true" && fileName) {
      setSplitView(true);
      setOpenedDocument(fileName);
      setIsConversationStarted(true);
    }
  };

  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [commandFilter, setCommandFilter] = useState("");
  const [splitView, setSplitView] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string }>({
    name: "FiNAC User",
    email: "user@finac.com",
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [leftPaneToRight, setLeftPaneToRight] = useState(true);
  const [openedDocument, setOpenedDocument] = useState<string>("");
  const [fileContent, setFileContent] = useState("");
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState({
    search: false,
    reason: false,
  });
  const [versionData, setVersionData] = useState<{
    currentVersion: number;
    latestVersion: number;
    versions: Record<string, string> | null;
  } | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        let newWidth;
        if (leftPaneToRight) {
          newWidth =
            ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
        } else {
          newWidth = (e.clientX / window.innerWidth) * 100;
        }
        newWidth = Math.max(25, Math.min(75, newWidth));
        setEditorWidth(newWidth);
        document.body.style.cursor = "col-resize"; // Change cursor during drag
      }
    },
    [isDragging, leftPaneToRight]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = "auto";
    document.body.style.cursor = "default"; // Reset cursor when done
  };

  const handleMouseDown = () => {
    setIsDragging(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize"; // Set resize cursor on mousedown
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  const handleCommandSelect = (action: string) => {
    // Implement the action handling logic here
    console.log(`Selected action: ${action}`);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userInput = message.trim();
    setMessage("");

    // Handle commands without adding them to chat
    if (userInput.startsWith("/")) {
      const commandParts = userInput.split(" ");
      const command = commandParts[0].toLowerCase();

      if (command === "/help" || userInput === "/") {
        // Process help command silently
        // Only show output for errors (none for help)
        const helpMessage =
          "I can help you with the following commands:\n\n **/help** - Show available commands\n\n**/create** [filename] - Create new document\n\n**/open** [filename] - Open Editor Files\n\n Please make sure you type out **full commands.** The command menu only serves for reference purposes";

        await new Promise((resolve) => setTimeout(resolve, 1700));
        let currentMessage = "";
        const words = helpMessage.split(" ");
        for (let i = 0; i < words.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 20));
          currentMessage += (i === 0 ? "" : " ") + words[i];
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: currentMessage },
              ];
            } else {
              return [
                ...prev,
                {
                  id: Date.now().toString(),
                  content: currentMessage,
                  role: "assistant",
                  timestamp: Date.now(),
                },
              ];
            }
          });
        }
        setIsConversationStarted(true);
        return;
      } else if (command === "/create") {
        setIsConversationStarted(true);
        async function createFile(file_name: string) {
          const response = await fetch(
            "https://finac-brs-agent.acroford.com/api/legacy/data/createFile",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ file_name }),
            }
          );
          const responseData = await response.json();

          if (!response.ok) {
            return { message: responseData.message };
          }
          return responseData.message;
        }

        if (commandParts.length !== 2 || !commandParts[1].endsWith(".md")) {
          await new Promise((resolve) => setTimeout(resolve, 950));
          let currentMessage = "";
          const words =
            "Invalid format: \n\n Please provide a single name for a file. \n\n -It must end in '.md' \n\n -Use dashes, underscores, and characters only \n\n -The file name cannot have spaces".split(
              " "
            );
          for (let i = 0; i < words.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 45));
            currentMessage += (i === 0 ? "" : " ") + words[i];
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                content: currentMessage,
                role: "assistant",
                timestamp: Date.now(),
              },
            ]);
            break;
          }
        } else {
          // Create file but only show response on error
          const response = await createFile(commandParts[1]);
          if (
            response.includes("Error") ||
            response.includes("failed") ||
            response.includes("Invalid")
          ) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                content: response,
                role: "assistant",
                timestamp: Date.now(),
              },
            ]);
          }
        }
        return;
      } else if (command === "/open") {
        setIsConversationStarted(true);
        const parts = userInput.split(" ");
        if (
          parts.length === 2 &&
          (parts[1].endsWith(".md") || parts[1].endsWith(".pdf"))
        ) {
          setSplitView(true);
          setOpenedDocument(parts[1]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content:
                "Invalid /open command format. Provide one file name ending with .md or .pdf",
              role: "assistant",
              timestamp: Date.now(),
            },
          ]);
        }
        return;
      } else if (command === "/exit") {
        setSplitView(false);
        return;
      }

      // If we get here, it's an unrecognized command - show error
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `Unknown command: ${command}. Type /help to see available commands.`,
          role: "assistant",
          timestamp: Date.now(),
        },
      ]);
      setIsConversationStarted(true);
      return;
    }

    // For non-command messages, maintain existing behavior
    const newMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsConversationStarted(true);
    await fetchAIResponse(newMessage);
  };

  function stripFunctionCallDivs(content: string): string {
    let functionCallText = "";
    const regex =
      /<div class="flex function-call[^>]*>.*?<span[^>]*>(.*?)<\/span>.*?<\/div>/g;
    let match;
    content = content.replace(
      /<div class="flex flex-col gap-2">[\s\S]*?<\/div>/g,
      (match) => {
        const spanMatches =
          match.match(/<span class="[^"]*text-sm[^"]*">([\s\S]*?)<\/span>/g) ||
          [];
        const texts = spanMatches.map((span) => {
          const textMatch = span.match(/<span[^>]*>([\s\S]*?)<\/span>/);
          return textMatch ? textMatch[1] : "";
        });
        functionCallText += texts.join("\n") + "\n";
        return "";
      }
    );

    // Combine extracted function call text with remaining content
    return (functionCallText + content).trim();
  }

  const fetchAIResponse = async (userMessage: Message) => {
    try {
      setIsStreaming(true);
      abortControllerRef.current = new AbortController();
      const cleanedMessages = messages.map((msg) => ({
        role: msg.role,
        content: stripFunctionCallDivs(msg.content),
      }));

      // Dynamically choose API endpoint based on button selections
      const endpoint = selectedButtons.reason
        ? "/api/v2/completionReason"
        : selectedButtons.search
        ? "/api/v2/completionSearch"
        : "/api/v2/completion";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...cleanedMessages,
            {
              role: userMessage.role,
              content: userMessage.content,
            },
          ],
          search: selectedButtons.search || false,
          userName: user?.name || "",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      let currentMessage = "";
      const messageId = Date.now().toString(); // Store ID in a constant
      let functionCalls: { description: string; status: "loading" | "done" }[] =
        [];

      // Create initial message container with the same ID that we'll reference later
      setMessages((prev) => [
        ...prev,
        {
          id: messageId, // Use the stored ID
          content: "",
          role: "assistant",
          timestamp: Date.now(),
        },
      ]);

      // Ensure we start processing after the state has updated
      await new Promise((resolve) => setTimeout(resolve, 0));

      while (true) {
        const { done, value } = (await reader?.read()) || {};
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const jsonStr = line.replace("data: ", "");
            // Skip empty or clearly invalid JSON strings
            if (!jsonStr.trim()) continue;

            const json = JSON.parse(jsonStr);

            logVerbose("Stream chunk:", json);

            switch (json.type) {
              case "function": {
                const fnName = json.data;
                const fnParams = json.parameters;
                let fnDescription = fnName;
                if (fnParams && fnParams.file_name) {
                  fnDescription += ` for ${fnParams.file_name}`;
                }
                functionCalls.push({
                  description: fnDescription,
                  status: "loading",
                });

                // Instead of filtering out search function calls, render them normally
                const indicatorsHTML = ReactDOMServer.renderToString(
                  <div className="flex flex-col gap-2">
                    {functionCalls.map((call, index) => (
                      <div
                        key={index}
                        className={
                          index === functionCalls.length - 1
                            ? "bottom-function"
                            : ""
                        }
                      >
                        <StatusIndicator
                          status={call.status}
                          loadingText={`Processing ${call.description}...`}
                          doneText={`Processed ${call.description}`}
                        />
                      </div>
                    ))}
                  </div>
                );

                setMessages((prev) => {
                  const messageIndex = prev.findIndex(
                    (msg) => msg.id === messageId
                  );
                  if (messageIndex !== -1) {
                    const updatedMessages = [...prev];
                    updatedMessages[messageIndex] = {
                      ...updatedMessages[messageIndex],
                      content: `${indicatorsHTML}${currentMessage}`,
                    };
                    return updatedMessages;
                  }
                  return prev;
                });
                break;
              }

              case "functionResult": {
                // Update the status of the latest function call to "done"
                if (functionCalls.length > 0) {
                  functionCalls[functionCalls.length - 1].status = "done";

                  // Re-render all indicators with updated status
                  const indicatorsHTML = ReactDOMServer.renderToString(
                    <div className="flex flex-col gap-2">
                      {functionCalls.map((call, index) => (
                        <div
                          key={index}
                          className={
                            index === functionCalls.length - 1 ? "mb-16" : ""
                          }
                        >
                          <StatusIndicator
                            status={call.status}
                            loadingText={`Processing ${call.description}...`}
                            doneText={`Processed ${call.description}`}
                          />
                        </div>
                      ))}
                    </div>
                  );

                  setMessages((prev) => {
                    const messageIndex = prev.findIndex(
                      (msg) => msg.id === messageId
                    );
                    if (messageIndex !== -1) {
                      const updatedMessages = [...prev];
                      updatedMessages[messageIndex] = {
                        ...updatedMessages[messageIndex],
                        content: `${indicatorsHTML}${currentMessage}`,
                      };
                      return updatedMessages;
                    }
                    return prev;
                  });
                }
                break;
              }

              case "message": {
                // Keep indicators visible while streaming message content
                const newWords = json.content.split(" ");
                for (let word of newWords) {
                  currentMessage += (currentMessage ? " " : "") + word;
                  const indicatorsHTML =
                    functionCalls.length > 0
                      ? ReactDOMServer.renderToString(
                          <div className="flex flex-col gap-2">
                            {functionCalls.map((call, index) => (
                              <div
                                key={index}
                                className={
                                  index === functionCalls.length - 1
                                    ? "mb-4"
                                    : ""
                                }
                              >
                                <StatusIndicator
                                  status={call.status}
                                  loadingText={`Processing ${call.description}...`}
                                  doneText={`Processed ${call.description}`}
                                />
                              </div>
                            ))}
                          </div>
                        )
                      : "";

                  setMessages((prev) => {
                    const messageIndex = prev.findIndex(
                      (msg) => msg.id === messageId
                    );
                    if (messageIndex !== -1) {
                      const updatedMessages = [...prev];
                      updatedMessages[messageIndex] = {
                        ...updatedMessages[messageIndex],
                        content: `${indicatorsHTML}${currentMessage}`,
                      };
                      return updatedMessages;
                    }
                    return prev;
                  });
                }
                break;
              }

              case "verbose":
                logVerbose("Verbose log:", json.data);
                break;
              case "end":
                logVerbose("Stream ended");
                break;
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }

      // Final update to ensure content is saved properly
      if (currentMessage) {
        setMessages((prev) => {
          const messageIndex = prev.findIndex((msg) => msg.id === messageId);
          if (messageIndex !== -1) {
            const updatedMessages = [...prev];
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              content: currentMessage,
            };
            return updatedMessages;
          }
          return prev;
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + " [stopped]" },
            ];
          }
          return prev;
        });
      } else {
        console.error("Error fetching AI response:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: "An error occurred while fetching the response.",
            role: "assistant",
            timestamp: Date.now(),
          },
        ]);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleEditMessage = (id: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content: newContent } : msg))
    );
  };

  const handleDeleteMessage = (id: string) => {
    const index = messages.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      setMessages((prev) => prev.slice(0, index));
    }
  };

  const handleRegenerateMessage = async (id: string): Promise<void> => {
    // Find the index of the message to regenerate
    const index = messages.findIndex((msg) => msg.id === id);
    if (index === -1) return;

    // Find the preceding user message
    let userMessageIndex = index - 1;
    while (
      userMessageIndex >= 0 &&
      messages[userMessageIndex].role !== "user"
    ) {
      userMessageIndex--;
    }

    if (userMessageIndex >= 0) {
      // Remove all messages after the user message
      setMessages((prev) => prev.slice(0, userMessageIndex + 1));
      // Regenerate the response based on the user message
      await fetchAIResponse(messages[userMessageIndex]);
    }
  };

  useEffect(() => {
    if (splitView && openedDocument) {
      setIsFileLoading(true);
      // Use the new rawFetch endpoint
      fetch(`/api/v3/editor/rawFetch?file_name=${openedDocument}`)
        .then((res) => res.json())
        .then((response) => {
          if (response.success && response.data) {
            const { data } = response;

            // Check if data has versions
            if (data.data && data.data.versions && data.data.latestVersion) {
              const latestVersion = data.data.latestVersion;
              const versions = data.data.versions;

              // Set the file content to the latest version
              setFileContent(versions[latestVersion.toString()] || "");

              // Store version data for navigation
              setVersionData({
                currentVersion: latestVersion,
                latestVersion: latestVersion,
                versions: versions,
              });
            } else {
              // Fallback to legacy behavior for files without versioning
              setFileContent(data.content || "");
              setVersionData(null);
            }
          } else {
            setFileContent("");
            setVersionData(null);
          }
        })
        .catch((error) => {
          console.error("Error reading file:", error);
          setFileContent("");
          setVersionData(null);
        })
        .finally(() => setIsFileLoading(false));
    }
  }, [openedDocument, splitView]);

  // Handle version selection
  const handleSelectVersion = (version: number) => {
    if (
      versionData &&
      versionData.versions &&
      versionData.versions[version.toString()]
    ) {
      setFileContent(versionData.versions[version.toString()]);
      setVersionData((prev) =>
        prev ? { ...prev, currentVersion: version } : null
      );
    }
  };

  const handleDocumentClose = () => {
    setSplitView(false);
    setOpenedDocument("");
  };

  // Header component for chat interface
  const ChatHeader = () => (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex justify-between items-center w-full p-4">
      <div className="flex items-center">
        <div className="w-8 h-8 relative mr-3">
          <Image
            src="/logo.png"
            alt="FiNAC AI"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <h1 className="text-lg font-medium text-[#1A479D]">FiNAC BRS AI</h1>
      </div>
      <div className="text-[#1A479D] text-sm">{formatDate(new Date())}</div>
    </div>
  );

  return (
    <>
      <SearchParamsHandler onParamsChange={handleSearchParamsChange} />
      {splitView ? (
        <div className="flex h-screen overflow-hidden bg-white">
          {leftPaneToRight ? (
            <>
              {/* Chat pane */}
              <div
                className="flex screen flex-col bg-white text-black overflow-y-auto chat-container"
                style={{ flexBasis: `${100 - editorWidth}%` }}
              >
                {!isConversationStarted ? (
                  <WelcomeScreen
                    message={message}
                    setMessage={setMessage}
                    handleSendMessage={handleSendMessage}
                    handleStopRequest={handleStopRequest}
                    isStreaming={isStreaming}
                  />
                ) : (
                  <>
                    <ChatHeader />
                    <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                      <AnimatePresence>
                        {messages.map((msg, index) => (
                          <StyledMessageComponent
                            key={msg.id}
                            message={msg}
                            onEdit={handleEditMessage}
                            onDelete={handleDeleteMessage}
                            onRegenerate={handleRegenerateMessage}
                            streaming={
                              isStreaming &&
                              msg.role === "assistant" &&
                              index === messages.length - 1
                            }
                          />
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} className="h-32" />
                    </div>

                    <div className="bg-white border-t border-gray-100 p-4">
                      <StyledChatInputBox
                        message={message}
                        setMessage={setMessage}
                        handleSendMessage={handleSendMessage}
                        handleStopRequest={handleStopRequest}
                        isStreaming={isStreaming}
                        commandFilter={commandFilter}
                        setCommandFilter={setCommandFilter}
                        selectedButtons={selectedButtons}
                        setSelectedButtons={setSelectedButtons}
                      />

                      {message.startsWith("/") && (
                        <div className="mt-2">
                          <CommandMenu
                            isOpen={true}
                            onSelect={handleCommandSelect}
                            filter={commandFilter}
                            splitView={splitView}
                          />
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Powered by FiNAC AI
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div
                className="w-[4px] transition-colors duration-300 hover:bg-[#1A479D]/20 bg-gray-100 cursor-col-resize"
                onMouseDown={handleMouseDown}
              />
              {/* Editor pane */}
              <div
                className="border-l screen border-gray-200 overflow-y-auto bg-white"
                style={{
                  flexBasis: `${editorWidth}%`,
                }}
              >
                <div>
                  {/* Document header */}
                  <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
                    <DocumentHeader
                      documentName={openedDocument}
                      onClose={handleDocumentClose}
                      onMoveSide={() => setLeftPaneToRight(false)}
                      moveLabel="Move to left side"
                      documentContent={fileContent}
                      versionData={versionData || undefined}
                      onSelectVersion={handleSelectVersion}
                    />
                  </div>

                  {/* Editor content */}
                  {isFileLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1A479D]"></div>
                      <h2 className="text-2xl text-[#1A479D] font-bold mt-4">
                        Loading {openedDocument}
                      </h2>
                      <p className="text-gray-500 mt-2">
                        Please wait while we load your document...
                      </p>
                    </div>
                  ) : (
                    <div className="h-full">
                      <SplitScreenEditor markdown={fileContent} />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Default layout with editor on left side, chat on right
            <>
              {/* Editor pane */}
              <div
                className="border-r screen border-gray-200 overflow-y-auto bg-white"
                style={{
                  flexBasis: `${editorWidth}%`,
                }}
              >
                <div>
                  {/* Document header bar - now using the component */}
                  <div className="bg-[#2f2f2f] sticky top-0 z-10">
                    <DocumentHeader
                      documentName={openedDocument}
                      onClose={handleDocumentClose}
                      onMoveSide={() => setLeftPaneToRight(true)}
                      moveLabel="Move to right side"
                      documentContent={fileContent}
                      versionData={versionData || undefined}
                      onSelectVersion={handleSelectVersion}
                    />
                  </div>
                  {/* Editor content */}
                  {isFileLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-screen">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
                      <h2 className="text-2xl text-[#fff] font-bold mt-4">
                        Loading {openedDocument}
                      </h2>
                      <p className="text-gray-500 mt-2">
                        Please wait while we load your document...
                      </p>
                    </div>
                  ) : (
                    <div className="h-full">
                      <SplitScreenEditor markdown={fileContent} />
                    </div>
                  )}
                </div>
              </div>
              <div
                className="w-[4px] hover:bg-[#1A479D]/20 duration-300 transition-colors bg-gray-100 cursor-col-resize"
                onMouseDown={handleMouseDown}
              />
              {/* Chat pane */}
              <div
                className="flex screen flex-col bg-white text-black overflow-y-auto chat-container"
                style={{ flexBasis: `${100 - editorWidth}%` }}
              >
                {!isConversationStarted ? (
                  <WelcomeScreen
                    message={message}
                    setMessage={setMessage}
                    handleSendMessage={handleSendMessage}
                    handleStopRequest={handleStopRequest}
                    isStreaming={isStreaming}
                  />
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto">
                      <AnimatePresence>
                        {messages.map((msg, index) => (
                          <MessageComponent
                            key={msg.id}
                            message={msg}
                            onEdit={handleEditMessage}
                            onDelete={handleDeleteMessage}
                            onRegenerate={handleRegenerateMessage}
                            streaming={
                              isStreaming &&
                              msg.role === "assistant" &&
                              index === messages.length - 1
                            }
                          />
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="">
                      <div className="max-w-3xl mx-auto p-4">
                        <div className="sticky bottom-0 p-4">
                          <ChatInputBox
                            message={message}
                            setMessage={setMessage}
                            handleSendMessage={handleSendMessage}
                            handleStopRequest={handleStopRequest}
                            isStreaming={isStreaming}
                            commandFilter={commandFilter}
                            setCommandFilter={setCommandFilter}
                            selectedButtons={selectedButtons}
                            setSelectedButtons={setSelectedButtons}
                          />

                          {message.startsWith("/") && (
                            <CommandMenu
                              isOpen={true}
                              onSelect={handleCommandSelect}
                              filter={commandFilter}
                              splitView={splitView}
                            />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          GPT can make mistakes. It is not a bug, it is a
                          feature.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="h-screen chat-container screen text-black flex flex-col overflow-hidden bg-white">
          {!isConversationStarted ? (
            <WelcomeScreen
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              handleStopRequest={handleStopRequest}
              isStreaming={isStreaming}
            />
          ) : (
            <>
              <ChatHeader />
              <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <StyledMessageComponent
                      key={msg.id}
                      message={msg}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      onRegenerate={handleRegenerateMessage}
                      streaming={
                        isStreaming &&
                        msg.role === "assistant" &&
                        index === messages.length - 1
                      }
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-32" />
              </div>

              <div className="bg-white border-t border-gray-100 p-4">
                <StyledChatInputBox
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleStopRequest={handleStopRequest}
                  isStreaming={isStreaming}
                  commandFilter={commandFilter}
                  setCommandFilter={setCommandFilter}
                  selectedButtons={selectedButtons}
                  setSelectedButtons={setSelectedButtons}
                />

                {message.startsWith("/") && (
                  <div className="mt-2">
                    <CommandMenu
                      isOpen={true}
                      onSelect={handleCommandSelect}
                      filter={commandFilter}
                      splitView={splitView}
                    />
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2 text-center">
                  Powered by FiNAC AI
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1A479D]"></div>
        </div>
      }
    >
      <ChatInterface />
    </Suspense>
  );
}