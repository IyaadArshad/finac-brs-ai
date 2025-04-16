import Image from "next/image";
import { formatDate } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-white justify-center">
      {/* Top section with date and user icon */}
      <div className="flex justify-between items-center w-full p-2">
        <div className="text-[#1A479D] pl-2 text-lg font-medium">
          {formatDate(new Date())}
        </div>
        <div className="relative w-12 h-12 border-2 rounded-full overflow-hidden flex items-center justify-center bg-white">
          <Image
            src="https://img.icons8.com/material-sharp/384/color/1A479D/user-male-circle.png"
            alt="User icon"
            fill
            className="object-cover relative w-12 h-12 border-2 border-[#1A479D] rounded-full overflow-hidden flex items-center justify-center bg-white"
          />
        </div>
      </div>

      {/* Main content - centered vertically */}
      <main className="flex-1 flex flex-col items-center justify-center -mt-6">
        <div className="w-full max-w-2xl flex flex-col items-center px-4 pt-0">
          {/* Logo */}
          <div className="mb-3 w-32 h-32 relative">
            <Image
              src="/logo.png"
              alt="FiNAC Logo"
              fill
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
            Type a message to start your conversation
          </p>

          {/* Input box */}
          <div className="w-full mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Type something great here..."
                className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-0 focus:ring-[#1A479D] focus:border-[#1A479D] hover:border-[#1A479D] transition-colors"
              />
              <button className="absolute right-3 pr-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#1A479D]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
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