import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for our database
export interface DbCreator {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  instagram_handle: string | null;
  photo: string | null;
  follower_count: number;
  engagement_rate: number | null;
  bio: string | null;
  city: string;
  approved: boolean;
  story_price: number | null;
  post_price: number | null;
  reel_price: number | null;
  created_at: string;
}

export interface DbAdSlot {
  id: string;
  creator_id: string;
  type: "story" | "post" | "reel";
  price: number;
  date: string;
  available: boolean;
  created_at: string;
}

export interface DbBooking {
  id: string;
  business_id: string | null;
  business_name: string;
  business_email: string;
  creator_id: string;
  slot_id: string;
  slot_type: string;
  date: string;
  price: number;
  status: "pending" | "completed";
  proof_url: string | null;
  created_at: string;
}
