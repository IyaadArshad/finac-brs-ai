import React from "react";
import { PlusIcon, PanelLeftClose, ChevronRight, FolderIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate } from "@/lib/utils";
import { NavUser } from "@/components/NavUser";

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

  const myDocuments = [
    { id: "doc1", title: "Product Requirements" },
    { id: "doc2", title: "System Architecture" },
    { id: "doc3", title: "User Stories" }
  ];

  return (
    <>
      <aside
        className={cn(
          "h-screen bg-[#F0F4F9] border-r border-gray-200 flex flex-col transition-all duration-300 relative",
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

        <Separator className="my-2 bg-gray-200" />
        
        {/* My Documents Section */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-gray-500 px-2 py-1">My Documents</h3>
          {myDocuments.map((doc) => (
            <button
              key={doc.id}
              className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-left text-sm transition-colors"
            >
              <FolderIcon className="h-4 w-4 mr-2 text-[#1A479D]" />
              <span className="text-gray-700">{doc.title}</span>
            </button>
          ))}
        </div>

        <Separator className="my-2 bg-gray-200" />
        
        {/* Conversation History Section */}
        <div className="flex-1 overflow-y-auto px-3">
          {todayConversations.length > 0 && (
            <>
              <h3 className="text-xs font-medium text-gray-500 px-2 py-1">Today</h3>
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
              <h3 className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">Previous 7 Days</h3>
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
              <h3 className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">Previous 30 Days</h3>
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
        
        {/* User section at the bottom */}
        <NavUser />
        
      </aside>
      
      {/* Collapse/Expand Control */}
      <div 
        className={cn(
          "absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 z-10",
          isCollapsed 
            ? "left-0" 
            : "left-64"
        )}
      >
        <button
          onClick={toggleSidebar}
          className={cn(
            "bg-white shadow-md border border-gray-200 rounded-full p-1.5 flex items-center justify-center hover:bg-gray-50 transition-transform",
            !isCollapsed && "transform rotate-180"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </>
  );
}
