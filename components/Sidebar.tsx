import React from "react";
import { PlusIcon, PanelLeftClose } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate } from "@/lib/utils";

interface ConversationHistoryItem {
  id: string;
  title: string;
  date: Date;
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  conversationHistory: ConversationHistoryItem[];
  currentConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

export function Sidebar({
  isCollapsed,
  toggleSidebar,
  conversationHistory,
  currentConversationId,
  onNewChat,
  onSelectConversation,
}: SidebarProps) {
  const today = new Date();
  const formattedDate = formatDate(today);

  // Group conversations by date: today, previous 7 days, previous 30 days
  const todaysDate = new Date().setHours(0, 0, 0, 0);
  const previous7Days = new Date(todaysDate);
  previous7Days.setDate(previous7Days.getDate() - 7);
  const previous30Days = new Date(todaysDate);
  previous30Days.setDate(previous30Days.getDate() - 30);

  const todayConversations = conversationHistory.filter(
    (item) => new Date(item.date).setHours(0, 0, 0, 0) === todaysDate
  );
  const last7DaysConversations = conversationHistory.filter(
    (item) => {
      const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
      return itemDate < todaysDate && itemDate >= previous7Days.getTime();
    }
  );
  const last30DaysConversations = conversationHistory.filter(
    (item) => {
      const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
      return itemDate < previous7Days.getTime() && itemDate >= previous30Days.getTime();
    }
  );

  return (
    <aside
      className={cn(
        "h-screen bg-[#F0F4F9] border-r border-gray-200 flex flex-col transition-all duration-300",
        isCollapsed ? "w-0 overflow-hidden" : "w-64"
      )}
    >
      <div className="p-3">
        <div className="text-[#1A479D] text-lg font-medium">
          {formattedDate}
        </div>
      </div>
      
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[#1A479D] hover:bg-[#153A82] text-white transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New chat</span>
        </button>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        <PanelLeftClose className="h-5 w-5" />
      </button>

      <Separator className="my-2 bg-gray-200" />
      
      <div className="flex-1 overflow-y-auto px-3">
        {todayConversations.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-gray-500 py-2">Today</h3>
            {todayConversations.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-left text-sm transition-colors mb-1",
                  currentConversationId === item.id
                    ? "bg-[#EBF2FF] text-[#1A479D]"
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                {item.title}
              </button>
            ))}
          </>
        )}

        {last7DaysConversations.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-gray-500 py-2">Previous 7 Days</h3>
            {last7DaysConversations.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-left text-sm transition-colors mb-1",
                  currentConversationId === item.id
                    ? "bg-[#EBF2FF] text-[#1A479D]"
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                {item.title}
              </button>
            ))}
          </>
        )}

        {last30DaysConversations.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-gray-500 py-2">Previous 30 Days</h3>
            {last30DaysConversations.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-left text-sm transition-colors mb-1",
                  currentConversationId === item.id
                    ? "bg-[#EBF2FF] text-[#1A479D]"
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                {item.title}
              </button>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
