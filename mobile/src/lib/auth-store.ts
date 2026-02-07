import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthStore {
  // Current logged in creator
  creatorId: string | null;
  creatorEmail: string | null;
  creatorName: string | null;

  // Business session (for when businesses book)
  businessEmail: string | null;
  businessName: string | null;

  // Actions
  loginCreator: (id: string, email: string, name: string) => void;
  logoutCreator: () => void;
  setBusinessInfo: (email: string, name: string) => void;
  clearBusinessInfo: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      creatorId: null,
      creatorEmail: null,
      creatorName: null,
      businessEmail: null,
      businessName: null,

      loginCreator: (id, email, name) =>
        set({
          creatorId: id,
          creatorEmail: email,
          creatorName: name,
        }),

      logoutCreator: () =>
        set({
          creatorId: null,
          creatorEmail: null,
          creatorName: null,
        }),

      setBusinessInfo: (email, name) =>
        set({
          businessEmail: email,
          businessName: name,
        }),

      clearBusinessInfo: () =>
        set({
          businessEmail: null,
          businessName: null,
        }),
    }),
    {
      name: "locomotion-auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
