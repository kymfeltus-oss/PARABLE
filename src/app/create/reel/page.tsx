"use client";

import CreateReelFlow from "@/components/create/CreateReelFlow";
import CreateFlowGuard from "@/components/create/CreateFlowGuard";

export default function CreateReelPage() {
  return (
    <>
      <CreateFlowGuard kind="reel" />
      <CreateReelFlow />
    </>
  );
}
