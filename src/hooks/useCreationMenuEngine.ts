"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CreationMenuAction } from "@/lib/create-flow/creation-menu-engine";
import {
  ACTIVE_CREATION_ACTION_KEY,
  getCreationRoute,
  primeCreationPermissions,
  setActiveCreationAction,
} from "@/lib/create-flow/creation-menu-engine";
import { SANCTUARY_CREATE_MENU_EVENT } from "@/lib/sanctuary-home-interactions";

/**
 * Create menu state engine — maps menu selection to route + permission priming.
 * Naming: `creationMenuOpen` (modal), `activeCreationAction` (selected option).
 */
export function useCreationMenuEngine() {
  const router = useRouter();
  const [creationMenuOpen, setCreationMenuOpen] = useState(false);
  const [activeCreationAction, setActiveCreationActionState] = useState<CreationMenuAction | null>(null);

  const openCreationMenu = useCallback(() => {
    setCreationMenuOpen(true);
  }, []);

  const closeCreationMenu = useCallback(() => {
    setCreationMenuOpen(false);
  }, []);

  const selectCreationAction = useCallback(
    (action: CreationMenuAction) => {
      setActiveCreationActionState(action);
      setActiveCreationAction(action);
      setCreationMenuOpen(false);
      void primeCreationPermissions(action);
      router.push(getCreationRoute(action));
    },
    [router],
  );

  const launchCreationAction = useCallback(
    (action: CreationMenuAction, href?: string) => {
      setActiveCreationActionState(action);
      setActiveCreationAction(action);
      setCreationMenuOpen(false);
      void primeCreationPermissions(action);
      router.push(href ?? getCreationRoute(action));
    },
    [router],
  );

  useEffect(() => {
    const openMenu = () => setCreationMenuOpen(true);
    window.addEventListener(SANCTUARY_CREATE_MENU_EVENT, openMenu);
    return () => window.removeEventListener(SANCTUARY_CREATE_MENU_EVENT, openMenu);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(ACTIVE_CREATION_ACTION_KEY);
    if (stored === "post" || stored === "story" || stored === "reel" || stored === "live") {
      setActiveCreationActionState(stored);
    }
  }, []);

  return {
    creationMenuOpen,
    activeCreationAction,
    openCreationMenu,
    closeCreationMenu,
    selectCreationAction,
    launchCreationAction,
  };
}
