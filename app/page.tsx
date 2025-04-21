"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOMServer from "react-dom/server";
import { Message } from "@/types/types";
import { logVerbose } from "@/components/home/camelCased/logVerbose";
import { CommandMenu } from "@/components/home/CommandMenu";
import { MessageComponent } from "@/components/home/MessageComponent";
import { SplitScreenEditor } from "@/components/splitScreenEditor";
import { DocumentHeader } from "@/components/DocumentHeader";
import { ChatInputBox } from "@/components/ChatInputBox";
import { Sidebar } from "@/components/Sidebar";
import { PanelLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import Image from "next/image";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Loader2, Check } from "lucide-react";

interface StatusIndicatorProps {
  status: "loading" | "done";
  loadingText: string;
  doneText: string;
}

function StatusIndicator({
  status,
  loadingText,
  doneText,
}: StatusIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-2 bg-[#2f2f2f] text-[#e4e4e7] px-3 py-2 
      relative overflow-hidden`}
      style={{
        border: "1px solid #444444!important",
        borderRadius: status === "done" ? "8px!important" : "9999px!important",
        maxWidth: "24rem",
      }}
    >
      <div className="relative z-10 flex items-center gap-2">
        {status === "done" ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">{doneText}</span>
          </>
        ) : (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{loadingText}</span>
          </>
        )}
      </div>
      <style jsx global>{`
        @keyframes checkPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .check-pop {
          animation: checkPop 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

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
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
    isGuest: boolean;
  }>({
    name: "Guest User",
    email: "guest@datamation.lk",
    avatar: "/icons/user-male-circle.png",
    isGuest: true,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ id: string; title: string; date: Date }>
  >([
    {
      id: "1",
      title: "Requirements for Feature Deployment Pipeline",
      date: new Date(),
    },
    {
      id: "2",
      title: "GitHub Actions Integration BRS",
      date: new Date(Date.now() - 86400000), // yesterday
    },
    {
      id: "3",
      title: "Automating Code Review Process",
      date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
      id: "4",
      title: "Sprint Release Reconciliation Spec",
      date: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: "5",
      title: "Bug Tracking System Sync Document",
      date: new Date(Date.now() - 86400000 * 4),
    },
  ]);

  useEffect(() => {
    if (messages.length > 0 && messages[0].role === "user") {
      const userFirstMessage = messages[0].content;
      const title =
        userFirstMessage.length > 25
          ? userFirstMessage.substring(0, 25) + "..."
          : userFirstMessage;

      const conversationExists = conversationHistory.some(
        (conv) => conv.title === title
      );

      if (!conversationExists && isConversationStarted) {
        const newConversation = {
          id: Date.now().toString(),
          title: title,
          date: new Date(),
        };

        setConversationHistory((prev) => [newConversation, ...prev]);
      }
    }
  }, [isConversationStarted, messages]);

  const handleNewChat = () => {
    setMessages([]);
    setIsConversationStarted(false);
    setMessage("");
  };

  const handleSelectConversation = (id: string) => {
    handleNewChat();
    setIsConversationStarted(true);
  };

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

    if (userInput.startsWith("/")) {
      const commandParts = userInput.split(" ");
      const command = commandParts[0].toLowerCase();

      if (command === "/help" || userInput === "/") {
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
      const messageId = Date.now().toString();
      let functionCalls: { description: string; status: "loading" | "done" }[] =
        [];

      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          content: "",
          role: "assistant",
          timestamp: Date.now(),
        },
      ]);

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
                if (functionCalls.length > 0) {
                  functionCalls[functionCalls.length - 1].status = "done";

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
    const index = messages.findIndex((msg) => msg.id === id);
    if (index === -1) return;

    let userMessageIndex = index - 1;
    while (
      userMessageIndex >= 0 &&
      messages[userMessageIndex].role !== "user"
    ) {
      userMessageIndex--;
    }

    if (userMessageIndex >= 0) {
      setMessages((prev) => prev.slice(0, userMessageIndex + 1));
      await fetchAIResponse(messages[userMessageIndex]);
    }
  };

  useEffect(() => {
    if (splitView && openedDocument) {
      setIsFileLoading(true);
      fetch(`/api/v3/editor/rawFetch?file_name=${openedDocument}`)
        .then((res) => res.json())
        .then((response) => {
          if (response.success && response.data) {
            const { data } = response;

            if (data.data && data.data.versions && data.data.latestVersion) {
              const latestVersion = data.data.latestVersion;
              const versions = data.data.versions;

              setFileContent(versions[latestVersion.toString()] || "");

              setVersionData({
                currentVersion: latestVersion,
                latestVersion: latestVersion,
                versions: versions,
              });
            } else {
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

  const ChatHeader = () => (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex justify-between items-center w-full p-4 shadow-sm">
      <div className="flex items-center">
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="mr-3 hover:bg-gray-100 p-1 rounded-md transition-colors"
          >
            <PanelLeft className="h-5 w-5 text-[#1A479D]" />
          </button>
        )}
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
    </div>
  );

  return (
    <>
      <SearchParamsHandler onParamsChange={handleSearchParamsChange} />
      {splitView ? (
        <div className="flex h-screen overflow-hidden bg-white">
          {leftPaneToRight ? (
            <>
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full"
                  >
                    <ChatHeader />
                    <div className="flex-1 overflow-y-auto bg-[#fff]">
                      <AnimatePresence mode="popLayout">
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
                      <div ref={messagesEndRef} className="h-32" />
                    </div>

                    <div className=" border-gray-100 p-4 flex justify-center">
                      <div className="w-3/4 max-w-3xl">
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
                          Powered by FiNAC AI. <br />
                          Icons by{" "}
                          <a
                            className="underline"
                            href="https://icons8.com"
                            target="_blank"
                          >
                            Icons8
                          </a>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div
                className="w-[4px] transition-colors duration-300 hover:bg-[#1A479D]/20 bg-gray-100 cursor-col-resize"
                onMouseDown={handleMouseDown}
              />
              <div
                className="border-l screen border-gray-200 overflow-y-auto bg-white"
                style={{
                  flexBasis: `${editorWidth}%`,
                }}
              >
                <div>
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
            <>
              <div
                className="border-r screen border-gray-200 overflow-y-auto bg-white"
                style={{
                  flexBasis: `${editorWidth}%`,
                }}
              >
                <div>
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex-1 overflow-y-auto bg-[#fff]">
                      <AnimatePresence mode="popLayout">
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

                    <div className=" border-gray-100 p-4 flex justify-center">
                      <div className="w-3/4 max-w-3xl">
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

                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Powered by FiNAC AI.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden bg-white">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            conversationHistory={conversationHistory}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            currentConversationId={
              messages.length > 0 ? conversationHistory[0]?.id : undefined
            }
          />

          <div className="flex-1 h-screen chat-container screen text-black flex flex-col overflow-hidden bg-white">
            {!isConversationStarted ? (
              <WelcomeScreen
                message={message}
                setMessage={setMessage}
                handleSendMessage={handleSendMessage}
                handleStopRequest={handleStopRequest}
                isStreaming={isStreaming}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <ChatHeader />
                <div className="flex-1 overflow-y-auto bg-[#fff]">
                  <AnimatePresence mode="popLayout">
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
                  <div ref={messagesEndRef} className="h-32" />
                </div>

                <div className=" border-gray-100 p-4 flex justify-center">
                  <div className="w-3/4 max-w-3xl">
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
                      Powered by FiNAC AI. <br />
                      Icons by{" "}
                      <a
                        className="underline"
                        href="https://icons8.com"
                        target="_blank"
                      >
                        Icons8
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
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
