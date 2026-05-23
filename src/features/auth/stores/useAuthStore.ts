import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setHydrated: (value: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (value) => set({ isHydrated: value }),
  clear: () => set({ user: null }),
}));

export const selectAuthUser = (state: AuthState): AuthUser | null => state.user;
export const selectIsAuthenticated = (state: AuthState): boolean => state.user !== null;
