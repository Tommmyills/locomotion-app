import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export type UserRole = "business" | "creator" | "admin";
export type Platform = "instagram" | "tiktok" | "facebook";
export type SlotType = "story" | "reel" | "post";
export type BookingStatus = "pending" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
}

export interface Creator {
  id: string;
  userId: string;
  name: string;
  photo: string;
  platform: Platform;
  followerCount: number;
  bio: string;
  city: string;
  approved: boolean;
}

export interface AdSlot {
  id: string;
  creatorId: string;
  type: SlotType;
  price: number;
  date: string; // ISO date string
  available: boolean;
}

export interface Booking {
  id: string;
  businessId: string;
  businessName: string;
  creatorId: string;
  creatorName: string;
  slotId: string;
  slotType: SlotType;
  date: string;
  price: number;
  status: BookingStatus;
  proofUrl?: string;
  createdAt: string;
}

interface AppStore {
  // Auth state
  currentUser: User | null;
  isAuthenticated: boolean;

  // Data
  creators: Creator[];
  adSlots: AdSlot[];
  bookings: Booking[];
  cities: string[];
  selectedCity: string;

  // Actions
  setCurrentUser: (user: User | null) => void;
  login: (email: string, role: UserRole, name: string) => void;
  logout: () => void;
  setSelectedCity: (city: string) => void;

  // Creator actions
  addCreator: (creator: Omit<Creator, "id">) => void;
  approveCreator: (creatorId: string) => void;

  // Slot actions
  addSlot: (slot: Omit<AdSlot, "id">) => void;
  updateSlotAvailability: (slotId: string, available: boolean) => void;

  // Booking actions
  createBooking: (booking: Omit<Booking, "id" | "createdAt">) => void;
  uploadProof: (bookingId: string, proofUrl: string) => void;
  completeBooking: (bookingId: string) => void;
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Empty arrays - no mock data, real creators come from Supabase
const emptyCreators: Creator[] = [];
const emptySlots: AdSlot[] = [];

const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      creators: emptyCreators,
      adSlots: emptySlots,
      bookings: [],
      cities: ["Albuquerque"],
      selectedCity: "Albuquerque",

      // Auth actions
      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),

      login: (email, role, name) => {
        const userId = generateId();
        const user: User = {
          id: userId,
          name,
          email,
          role,
          city: "Albuquerque",
        };

        // If registering as a creator, create a creator profile (pending approval)
        if (role === "creator") {
          const newCreator: Creator = {
            id: generateId(),
            userId: userId,
            name: name,
            photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            platform: "instagram",
            followerCount: 5000,
            bio: "New creator on LocalPromote",
            city: "Albuquerque",
            approved: false,
          };
          set({
            currentUser: user,
            isAuthenticated: true,
            creators: [...get().creators, newCreator],
          });
        } else {
          set({ currentUser: user, isAuthenticated: true });
        }
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      setSelectedCity: (city) => set({ selectedCity: city }),

      // Creator actions
      addCreator: (creator) => {
        const newCreator: Creator = { ...creator, id: generateId() };
        set({ creators: [...get().creators, newCreator] });
      },

      approveCreator: (creatorId) => {
        set({
          creators: get().creators.map((c) =>
            c.id === creatorId ? { ...c, approved: true } : c
          ),
        });
      },

      // Slot actions
      addSlot: (slot) => {
        const newSlot: AdSlot = { ...slot, id: generateId() };
        set({ adSlots: [...get().adSlots, newSlot] });
      },

      updateSlotAvailability: (slotId, available) => {
        set({
          adSlots: get().adSlots.map((s) =>
            s.id === slotId ? { ...s, available } : s
          ),
        });
      },

      // Booking actions
      createBooking: (booking) => {
        const newBooking: Booking = {
          ...booking,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        // Mark slot as unavailable
        set({
          bookings: [...get().bookings, newBooking],
          adSlots: get().adSlots.map((s) =>
            s.id === booking.slotId ? { ...s, available: false } : s
          ),
        });
      },

      uploadProof: (bookingId, proofUrl) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === bookingId ? { ...b, proofUrl } : b
          ),
        });
      },

      completeBooking: (bookingId) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "completed" } : b
          ),
        });
      },
    }),
    {
      name: "localpromote-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user auth and bookings - always use fresh creator data
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        bookings: state.bookings,
      }),
    }
  )
);

export default useAppStore;
