/**
 * Re-exports for layout routing — canonical implementations live in `@/lib/app-shell-profiles`.
 */
export {
  getShellProfile,
  isFullBleedRoute,
  isStreamingRoute,
  shouldHideGlobalTopStack,
  shouldHideGlobalTopStackForStreaming,
  shellUsesViewportLock,
  type ShellProfile,
} from "@/lib/app-shell-profiles";
