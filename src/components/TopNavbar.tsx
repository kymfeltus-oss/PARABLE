"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Heart, ChevronDown, Send } from "lucide-react";

interface TopNavbarProps {
  onCreateClick?: () => void;
  onActivityClick?: () => void;
  onFeedChange?: (option: string) => void;
  hasUnreadNotifications?: boolean;
  unreadMessagesCount?: number;
}

export default function TopNavbar({
  onCreateClick,
  onActivityClick,
  onFeedChange,
  hasUnreadNotifications = false,
  unreadMessagesCount = 0,
}: TopNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeFeed, setActiveFeed] = useState("For You");
  const messagesActive = (pathname ?? "").startsWith("/messages");

  const feedOptions = ["For You", "Following", "Favorites"];

  const handleFeedChange = (option: string) => {
    setActiveFeed(option);
    setIsDropdownOpen(false);
    onFeedChange?.(option);
  };

  const openMessages = () => {
    router.push("/messages");
  };

  return (
    <header className="sticky top-0 z-50 flex h-[56px] w-full select-none items-center justify-between bg-[#02040A]/80 px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onCreateClick}
        className="flex h-11 w-11 items-center justify-start text-[#F8FAFC] transition-colors hover:text-[#00F2FE] focus:outline-none"
        aria-label="Create Post"
      >
        <Plus className="h-6 w-6 stroke-[2.25]" />
      </button>

      <div className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="group flex items-center gap-1.5 transition-opacity focus:outline-none active:opacity-80"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
        >
          <div className="relative h-8 w-[140px] drop-shadow-[0_0_16px_rgba(0,242,254,0.36)] drop-shadow-[0_0_54px_rgba(0,242,254,0.16)]">
            <Image src="/logo.svg" alt="PARABLE Logo" fill priority className="object-contain" />
          </div>
          <ChevronDown
            className={`h-4 w-4 text-[#94A3B8] transition-transform duration-200 group-hover:text-[#67E8F9] ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isDropdownOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              aria-label="Close feed menu"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div
              className="absolute left-1/2 top-[44px] z-20 w-48 -translate-x-1/2 rounded-xl bg-[#06111E] p-1.5 shadow-2xl"
              role="listbox"
            >
              {feedOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={activeFeed === option}
                  onClick={() => handleFeedChange(option)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    activeFeed === option
                      ? "bg-white/5 text-[#00F2FE]"
                      : "text-[#CBD5E1] hover:bg-white/5 hover:text-[#F8FAFC]"
                  }`}
                >
                  {option}
                  {activeFeed === option ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00F2FE]" />
                  ) : null}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={openMessages}
          className={`relative flex h-11 w-10 items-center justify-center transition-colors focus:outline-none ${
            messagesActive ? "text-[#00F2FE]" : "text-[#F8FAFC] hover:text-[#00F2FE]"
          }`}
          aria-label="Open inbox"
          aria-current={messagesActive ? "page" : undefined}
        >
          <Send
            className={`h-[22px] w-[22px] stroke-[2.25] ${messagesActive ? "fill-[#00F2FE]/20" : ""}`}
          />
          {unreadMessagesCount > 0 ? (
            <span className="absolute right-0.5 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white ring-2 ring-[#02040A]">
              {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onActivityClick}
          className="relative flex h-11 w-10 items-center justify-end text-[#F8FAFC] transition-colors hover:text-[#00F2FE] focus:outline-none"
          aria-label="View Activity"
        >
          <Heart className="h-6 w-6 stroke-[2.25]" />
          {hasUnreadNotifications ? (
            <span className="absolute right-0 top-2.5 h-2.5 w-2.5 animate-pulse rounded-full bg-[#EF4444] ring-2 ring-[#02040A]" />
          ) : null}
        </button>
      </div>
    </header>
  );
}
