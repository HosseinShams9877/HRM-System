import { create } from 'zustand'

interface AppState {
  // User session
  user: {
    id: string
    email: string
    role: string
    name: string
    department: string | null
    position: string | null
  } | null
  setUser: (user: AppState['user']) => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Active module
  activeModule: string
  setActiveModule: (module: string) => void

  // Global loading
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void

  // Notifications count
  notificationCount: number
  setNotificationCount: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  activeModule: 'dashboard',
  setActiveModule: (activeModule) => set({ activeModule }),

  globalLoading: false,
  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  notificationCount: 0,
  setNotificationCount: (notificationCount) => set({ notificationCount }),
}))
