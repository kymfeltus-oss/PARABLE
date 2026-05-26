"use client";

import { Suspense } from "react";
import CreateStoryFlow from "@/components/create/CreateStoryFlow";
import CreateFlowGuard from "@/components/create/CreateFlowGuard";

export default function CreateStoryPage() {
  return (
    <Suspense fallback={null}>
      <CreateFlowGuard kind="story" />
      <CreateStoryFlow />
    </Suspense>
  );
}
