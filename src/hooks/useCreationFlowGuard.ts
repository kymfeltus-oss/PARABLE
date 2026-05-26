"use client";

import { useEffect } from "react";
import type { CreateFlowKind } from "@/lib/create-flow/routes";
import { runCreationPermissionGuard } from "@/lib/create-flow/creation-menu-engine";

/** Runs permission guard loop when a create route mounts. */
export function useCreationFlowGuard(kind: CreateFlowKind) {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await runCreationPermissionGuard(kind);
      if (cancelled || !result.offline) return;
      console.warn("[create-flow] Live broadcast started while device is offline.");
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);
}
