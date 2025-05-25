import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        isLoading: false,
        login: (user) =>
          set((state) => {
            state.user = user;
            state.isLoading = false;
          }),
        logout: () =>
          set((state) => {
            state.user = null;
          }),
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),
      })),
      {
        name: "user-storage",
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: "user-store" }
  )
);
