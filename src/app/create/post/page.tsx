"use client";

import CreatePostFlow from "@/components/create/CreatePostFlow";
import CreateFlowGuard from "@/components/create/CreateFlowGuard";

export default function CreatePostPage() {
  return (
    <>
      <CreateFlowGuard kind="post" />
      <CreatePostFlow />
    </>
  );
}
