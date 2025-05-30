import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Square, Upload, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const BrainCircuit = (props: IconProps) => {
  const { width, height, color, className } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      width={width}
      height={height}
      className={className}
      style={{ color }}
    >
      <path
        fillRule="evenodd"
        fill="currentColor"
        clipRule="evenodd"
        d="m12 3c-3.585 0-6.5 2.9225-6.5 6.5385 0 2.2826 1.162 4.2913 2.9248 5.4615h7.1504c1.7628-1.1702 2.9248-3.1789 2.9248-5.4615 0-3.6159-2.915-6.5385-6.5-6.5385zm2.8653 14h-5.7306v1h5.7306v-1zm-1.1329 3h-3.4648c0.3458 0.5978 0.9921 1 1.7324 1s1.3866-0.4022 1.7324-1zm-5.6064 0c0.44403 1.7252 2.0101 3 3.874 3s3.43-1.2748 3.874-3c0.5483-0.0047 0.9913-0.4506 0.9913-1v-2.4593c2.1969-1.5431 3.6347-4.1045 3.6347-7.0022 0-4.7108-3.8008-8.5385-8.5-8.5385-4.6992 0-8.5 3.8276-8.5 8.5385 0 2.8977 1.4378 5.4591 3.6347 7.0022v2.4593c0 0.5494 0.44301 0.9953 0.99128 1z"
      ></path>
    </svg>
  );
};

interface ChatInputBoxProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleStopRequest: () => void;
  isStreaming: boolean;
  commandFilter?: string;
  setCommandFilter?: (filter: string) => void;
  selectedButtons?: {
    search: boolean;
    reason: boolean;
  };
  setSelectedButtons?: (buttons: { search: boolean; reason: boolean }) => void;
  centerAlignment?: boolean;
}

export const ChatInputBox: React.FC<ChatInputBoxProps> = ({
  message,
  setMessage,
  handleSendMessage,
  handleStopRequest,
  isStreaming,
  commandFilter,
  setCommandFilter,
  selectedButtons = { search: false, reason: false },
  setSelectedButtons,
  centerAlignment = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (setCommandFilter && e.target.value.startsWith("/")) {
      setCommandFilter(e.target.value.slice(1));
    } else if (setCommandFilter) {
      setCommandFilter("");
    }
  };

  // Simple version for the welcome screen with center alignment
  if (centerAlignment) {
    return (
      <div className="w-full max-w-2xl relative">
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-6 rounded-full pr-12 focus-visible:ring-1 focus-visible:ring-[#1A479D] focus-visible:ring-offset-0 focus-visible:border-[#1A479D]"
          placeholder="Type your message..."
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                disabled={!message.trim()}
                onClick={isStreaming ? handleStopRequest : handleSendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A479D] bg-transparent hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            {!message.trim() && (
              <TooltipContent>
                <p>Please enter a message</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Full version with all buttons and features
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Top part - Input area */}
      <div className="px-4 pt-4 mb-2">
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full border-0 bg-transparent p-0 text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Type your message..."
        />
      </div>

      {/* Bottom part - Actions */}
      <div className="mb-2 mt-2 flex items-center justify-between px-4 pb-2">
        <div className="flex gap-x-2">
          {/* Upload button */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-500">
            <Upload className="h-[18px] w-[18px]" />
          </button>

          {/* Search button */}
          <button
            onClick={() =>
              setSelectedButtons?.({
                search: !selectedButtons.search,
                reason: false, // Disable reason when toggling search
              })
            }
            className={`flex h-9 items-center justify-center rounded-full ${
              selectedButtons.search
                ? "bg-[#EBF2FF] text-[#1A479D] border-0"
                : "border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-500"
            } px-3`}
          >
            <Search className="h-[18px] w-[18px] mr-2" />
            <span className="text-sm">Search</span>
          </button>

          {/* Reason button */}
          <button
            onClick={() =>
              setSelectedButtons?.({
                reason: !selectedButtons.reason,
                search: false, // Disable search when toggling reason
              })
            }
            className={`flex h-9 items-center justify-center rounded-full ${
              selectedButtons.reason
                ? "bg-[#EBF2FF] text-[#1A479D] border-0"
                : "border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-500"
            } px-3`}
          >
            <BrainCircuit className="h-[18px] w-[18px] mr-2" />
            <span className="text-sm">Reason</span>
          </button>
        </div>

        {/* Send button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                disabled={!message.trim()}
                onClick={isStreaming ? handleStopRequest : handleSendMessage}
                className={`h-9 w-9 rounded-full ${
                  message.trim()
                    ? "bg-[#1A479D] text-white hover:bg-[#153A82]"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isStreaming ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            {!message.trim() && (
              <TooltipContent>
                <p>Please enter a message</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};