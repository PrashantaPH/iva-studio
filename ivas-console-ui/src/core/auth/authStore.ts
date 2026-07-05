import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, User } from "@/core/types/dto";

interface AuthState {
  session: AuthSession | null;
  activeOrgId: string | null;
  activeWorkspaceId: string | null;
  setSession: (session: AuthSession) => void;
  setUser: (user: User) => void;
  setActiveOrg: (orgId: string | null) => void;
  setActiveWorkspace: (workspaceId: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      activeOrgId: null,
      activeWorkspaceId: null,
      setSession: (session) => set({ session }),
      setUser: (user) =>
        set((state) =>
          state.session ? { session: { ...state.session, user } } : {},
        ),
      setActiveOrg: (activeOrgId) => set({ activeOrgId }),
      setActiveWorkspace: (activeWorkspaceId) => set({ activeWorkspaceId }),
      signOut: () =>
        set({
          session: null,
          activeOrgId: null,
          activeWorkspaceId: null,
        }),
    }),
    { name: "iva-auth" },
  ),
);
