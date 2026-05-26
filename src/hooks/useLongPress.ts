"use client";

import { useCallback, useRef } from "react";

type Options = {
  delayMs?: number;
};

/** Touch/mouse long-press with click suppression after hold. */
export function useLongPress(
  onLongPress: () => void,
  onClick?: () => void,
  { delayMs = 500 }: Options = {},
) {
  const timerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    longPressTriggeredRef.current = false;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      onLongPress();
    }, delayMs);
  }, [clearTimer, delayMs, onLongPress]);

  const cancel = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handleClick = useCallback(() => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    onClick?.();
  }, [onClick]);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onClick: handleClick,
  };
}
