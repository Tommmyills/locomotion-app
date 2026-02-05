import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { DbCreator, DbAdSlot, DbBooking } from "./supabase";

// Re-export types for convenience
export type { DbCreator, DbAdSlot, DbBooking } from "./supabase";

// ============ CREATORS ============

export function useCreators() {
  return useQuery({
    queryKey: ["creators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DbCreator[];
    },
  });
}

export function useCreator(id: string | undefined) {
  return useQuery({
    queryKey: ["creator", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as DbCreator;
    },
    enabled: !!id,
  });
}

export function useCreatorByEmail(email: string | undefined) {
  return useQuery({
    queryKey: ["creator-by-email", email],
    queryFn: async () => {
      if (!email) return null;
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as DbCreator | null;
    },
    enabled: !!email,
  });
}

export function useCreateCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creator: {
      email: string;
      name: string;
      instagram_handle: string;
      photo: string;
      follower_count: number;
      engagement_rate: number;
      bio: string;
      story_price: number;
      post_price: number;
      reel_price: number;
    }) => {
      const { data, error } = await supabase
        .from("creators")
        .insert({
          ...creator,
          city: "Albuquerque",
          approved: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DbCreator;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creators"] });
    },
  });
}

// ============ AD SLOTS ============

export function useAdSlots() {
  return useQuery({
    queryKey: ["ad-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_slots")
        .select("*")
        .eq("available", true)
        .order("date", { ascending: true });

      if (error) throw error;
      return data as DbAdSlot[];
    },
  });
}

export function useCreatorSlots(creatorId: string | undefined) {
  return useQuery({
    queryKey: ["creator-slots", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await supabase
        .from("ad_slots")
        .select("*")
        .eq("creator_id", creatorId)
        .order("date", { ascending: true });

      if (error) throw error;
      return data as DbAdSlot[];
    },
    enabled: !!creatorId,
  });
}

export function useCreateSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slots: {
      creator_id: string;
      type: "story" | "post" | "reel";
      price: number;
      date: string;
    }[]) => {
      const { data, error } = await supabase
        .from("ad_slots")
        .insert(slots.map(slot => ({ ...slot, available: true })))
        .select();

      if (error) throw error;
      return data as DbAdSlot[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-slots"] });
      queryClient.invalidateQueries({ queryKey: ["creator-slots"] });
    },
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slot: {
      creator_id: string;
      type: "story" | "post" | "reel";
      price: number;
      date: string;
    }) => {
      const { data, error } = await supabase
        .from("ad_slots")
        .insert({ ...slot, available: true })
        .select()
        .single();

      if (error) throw error;
      return data as DbAdSlot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-slots"] });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "creator-slots"
      });
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase
        .from("ad_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all queries that start with these keys
      queryClient.invalidateQueries({ queryKey: ["ad-slots"] });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "creator-slots"
      });
    },
  });
}

// ============ BOOKINGS ============

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DbBooking[];
    },
  });
}

export function useCreatorBookings(creatorId: string | undefined) {
  return useQuery({
    queryKey: ["creator-bookings", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DbBooking[];
    },
    enabled: !!creatorId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: {
      business_name: string;
      business_email: string;
      creator_id: string;
      slot_id: string;
      slot_type: string;
      date: string;
      price: number;
    }) => {
      // Create booking
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          ...booking,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Mark slot as unavailable
      await supabase
        .from("ad_slots")
        .update({ available: false })
        .eq("id", booking.slot_id);

      return data as DbBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slots"] });
      queryClient.invalidateQueries({ queryKey: ["creator-slots"] });
    },
  });
}

export function useUploadProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, proofUrl }: { bookingId: string; proofUrl: string }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ proof_url: proofUrl })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data as DbBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["creator-bookings"] });
    },
  });
}
