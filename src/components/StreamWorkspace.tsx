"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export type StreamChatMessage = {
  id: string;
  user: string;
  text: string;
};

export type StreamWorkspaceProps = {
  streamId: string;
  playbackUrl: string;
  creatorName: string;
  /** Optional LiveKit / video shell — kept outside chat state to avoid player remounts. */
  videoSlot?: ReactNode;
  initialViewMode?: "clean" | "gamer";
};

export default function StreamWorkspace({
  streamId,
  playbackUrl,
  creatorName,
  videoSlot,
  initialViewMode = "clean",
}: StreamWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"clean" | "gamer">(initialViewMode);
  const [messages, setMessages] = useState<StreamChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: StreamChatMessage = {
      id: crypto.randomUUID(),
      user: "You",
      text: chatInput.trim(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    void fetch("/api/chat/send-async", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamId, message: newMessage }),
    }).catch((err) => console.error("Background logging omitted crash risk:", err));
  };

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col bg-slate-950 text-slate-50 ${
        viewMode === "gamer" ? "lg:flex-row" : "flex-col"
      }`}
    >
      <div className="z-10 flex w-full items-center justify-between border-b border-slate-800 bg-slate-900 p-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold font-inter">{creatorName} Live Meeting</h1>
          <p className="text-xs text-slate-400">Stream Tracking ID: {streamId}</p>
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === "clean" ? "gamer" : "clean")}
          className="shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 font-semibold font-inter text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all duration-200 hover:scale-105"
        >
          Switch to {viewMode === "clean" ? "💥 Gamer Mode" : "📺 Clean Mode"}
        </button>
      </div>

      <div
        className={`flex w-full flex-1 overflow-hidden ${
          viewMode === "gamer" ? "flex-col lg:flex-row" : "flex-col"
        }`}
      >
        <div
          className={`relative flex flex-1 items-center justify-center bg-black ${
            viewMode === "gamer" ? "w-full lg:w-3/4" : "mx-auto w-full max-w-4xl p-4"
          }`}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
            {videoSlot ?? (
              <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-slate-500">
                [ Low-Latency Video Player Connected: {playbackUrl} ]
              </div>
            )}

            {viewMode === "gamer" ? (
              <div className="absolute left-4 top-4 animate-pulse rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Live
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={`flex flex-col border-slate-800 bg-slate-900 ${
            viewMode === "gamer"
              ? "h-[400px] w-full border-t lg:h-auto lg:w-1/4 lg:border-l lg:border-t-0"
              : "mx-auto w-full max-w-4xl border-t p-4"
          }`}
        >
          <div className="max-h-[300px] flex-1 space-y-3 overflow-y-auto p-4 font-inter text-sm">
            {messages.length === 0 ? (
              <p className="text-center italic text-slate-500">Welcome to the secure stream chat.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="rounded border border-slate-800 bg-slate-950 p-2">
                  <span className="mr-2 font-bold text-cyan-400">{msg.user}:</span>
                  <span className="text-slate-200">{msg.text}</span>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 border-t border-slate-800 bg-slate-950 p-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                viewMode === "gamer" ? "Send high energy chat..." : "Type a respectful message..."
              }
              className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none font-inter"
            />
            <button
              type="submit"
              className="rounded bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
