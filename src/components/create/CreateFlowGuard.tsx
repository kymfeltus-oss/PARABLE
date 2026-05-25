"use client";

import { useCreationFlowGuard } from "@/hooks/useCreationFlowGuard";

export default function CreateFlowGuard({ kind }: { kind: "post" | "story" | "reel" }) {
  useCreationFlowGuard(kind);
  return null;
}
