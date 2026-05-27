import { create } from "zustand";

type StreamersUiState = {
  /** Mobile drawer / tablet visibility */
  sidebarOpen: boolean;
  /** Desktop icon-rail mode */
  sidebarCollapsed: boolean;
  /** Mobile / tablet chat drawer */
  chatOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setChatOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  toggleChat: () => void;
};

export const useStreamersUiStore = create<StreamersUiState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  chatOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
}));
