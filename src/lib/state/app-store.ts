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

// Mock data for MVP - Albuquerque creators
const mockCreators: Creator[] = [
  {
    id: "c1",
    userId: "u1",
    name: "@albuquerquegeorge",
    photo: "https://images.composerapi.com/019beec7-0626-7599-b51a-5782d05789c9/assets/images/image_1769257455_1769257455307_019beff6-4ecb-732f-a420-20bee18f643c.jpg",
    platform: "instagram",
    followerCount: 7797,
    bio: "Albuquerque local content creator. Showcasing the best of the Duke City!",
    city: "Albuquerque",
    approved: true,
  },
  {
    id: "c2",
    userId: "u2",
    name: "Diego Romero",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    platform: "instagram",
    followerCount: 52000,
    bio: "Outdoor adventure & hiking in NM. From the Sandias to the Rio Grande.",
    city: "Albuquerque",
    approved: true,
  },
  {
    id: "c3",
    userId: "u3",
    name: "Mia Chavez",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    platform: "instagram",
    followerCount: 28000,
    bio: "Fashion & beauty in the 505. Supporting local Burque businesses.",
    city: "Albuquerque",
    approved: true,
  },
  {
    id: "c4",
    userId: "u4",
    name: "Carlos Sanchez",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    platform: "instagram",
    followerCount: 21000,
    bio: "ABQ food & chile enthusiast. Red or green? Always Christmas!",
    city: "Albuquerque",
    approved: true,
  },
  {
    id: "c5",
    userId: "u5",
    name: "Pending Creator",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    platform: "instagram",
    followerCount: 8000,
    bio: "New creator waiting for approval",
    city: "Albuquerque",
    approved: false,
  },
];

const mockSlots: AdSlot[] = [
  { id: "s1", creatorId: "c1", type: "story", price: 50, date: "2026-01-25", available: true },
  { id: "s2", creatorId: "c1", type: "reel", price: 150, date: "2026-01-26", available: true },
  { id: "s3", creatorId: "c1", type: "post", price: 100, date: "2026-01-27", available: true },
  { id: "s4", creatorId: "c2", type: "story", price: 75, date: "2026-01-25", available: true },
  { id: "s5", creatorId: "c2", type: "reel", price: 250, date: "2026-01-26", available: true },
  { id: "s6", creatorId: "c2", type: "post", price: 175, date: "2026-01-28", available: true },
  { id: "s7", creatorId: "c3", type: "story", price: 40, date: "2026-01-25", available: true },
  { id: "s8", creatorId: "c3", type: "reel", price: 120, date: "2026-01-27", available: true },
  { id: "s9", creatorId: "c4", type: "post", price: 80, date: "2026-01-26", available: true },
  { id: "s10", creatorId: "c4", type: "story", price: 35, date: "2026-01-29", available: true },
];

const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      creators: mockCreators,
      adSlots: mockSlots,
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
