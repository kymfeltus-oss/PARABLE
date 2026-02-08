"use client";
import { Sparkles, ScrollText, Radio, DollarSign, Globe, MessageSquare, BookOpen, Heart } from "lucide-react";

export type CockpitMode = "Preacher" | "Musician" | "Gamer";

export const COCKPIT_MODES = [
  { id: "Preacher", label: "Apostolic" },
  { id: "Musician", label: "Psalmist" },
  { id: "Gamer", label: "Guardian" },
];

export const getCockpitTools = (mode: CockpitMode) => {
  const modes = {
    Preacher: [
      { icon: Sparkles, t: "RHEMA AI", d: "Sermon Synthesis", path: "/studio/rhema" },
      { icon: ScrollText, t: "THE ORACLE", d: "Live Prompter", path: "/studio/prompter" },
      { icon: Globe, t: "GLOBAL REACH", d: "AI Translation", path: "/studio/translate" },
      { icon: MessageSquare, t: "THE FLOCK", d: "Prophetic Chat", path: "/studio/chat" },
      { icon: BookOpen, t: "MANNA", d: "Theological Insights", path: "/studio/manna" },
      { icon: DollarSign, t: "SEEDS", d: "Prophetic Economy", path: "/studio/seeds" },
    ],
    Musician: [
      { icon: Radio, t: "FREQUENCY", d: "Hi-Fi Broadcast", path: "/studio/broadcast" },
      { icon: Heart, t: "ALTAR CALL", d: "Prayer Sync", path: "/studio/prayer" },
      { icon: DollarSign, t: "OFFERINGS", d: "Digital Seeds", path: "/studio/seeds" },
      { icon: Sparkles, t: "SONGWRITER", d: "AI Lyric Assist", path: "/studio/lyrics" },
    ],
    Gamer: [
      { icon: Radio, t: "LIVE FEED", d: "Gameplay Sync", path: "/studio/stream" },
      { icon: MessageSquare, t: "GUILD", d: "Community Hub", path: "/studio/community" },
      { icon: DollarSign, t: "BLESSINGS", d: "Neon Alerts", path: "/studio/seeds" },
      { icon: Heart, t: "INTERCESSOR", d: "Live Prayer", path: "/studio/prayer" },
    ],
  };
  return modes[mode];
};