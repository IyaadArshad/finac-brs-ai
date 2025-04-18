import React from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface WelcomeScreenProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleStopRequest: () => void;
  isStreaming: boolean;
}

export function WelcomeScreen({
  message,
  setMessage,
  handleSendMessage,
  handleStopRequest,
  isStreaming,
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col min-h-dvh bg-white text-black">
      {/* Main content - centered vertically */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col items-center px-4">
          {/* Logo */}
          <div className="mb-3 w-32 h-32 relative">
            <Image
              src="/logo.png"
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
                className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-0 focus:ring-[#1A479D] focus:border-[#1A479D] hover:border-[#1A479D] transition-colors"
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 mr-1 hover:cursor-pointer text-gray-400 hover:text-[#1A479D]"
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
        Powered by FiNAC AI. <br />
        Icons by{" "}
        <a className="underline" href="https://icons8.com" target="_blank">
          Icons8
        </a>
      </footer>
    </div>
  );
}