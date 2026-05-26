"use client";

import LiveBroadcastFlow from "@/components/create/LiveBroadcastFlow";
import { useCreationFlowGuard } from "@/hooks/useCreationFlowGuard";

export default function CreateLivePage() {
  useCreationFlowGuard("live");
  return <LiveBroadcastFlow />;
}
