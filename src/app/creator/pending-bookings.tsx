import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, ChevronRight } from "lucide-react-native";
import { SlotTypeBadge } from "@/components/SlotCard";
import type { SlotType } from "@/lib/state/app-store";
import { useAuthStore } from "@/lib/auth-store";
import { useCreatorBookings } from "@/lib/db-hooks";
import * as Haptics from "expo-haptics";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function PendingBookingsScreen() {
  const router = useRouter();
  const creatorId = useAuthStore((s) => s.creatorId);
  const { data: myBookings = [] } = useCreatorBookings(creatorId ?? undefined);

  const pendingBookings = myBookings.filter((b) => b.status === "pending");

  const handleUploadProof = (bookingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/creator/upload-proof/${bookingId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-black font-semibold text-lg mb-2 mt-4">
          Pending Bookings
        </Text>
        <Text className="text-gray-500 text-sm mb-6">
          Tap a booking to upload proof of your post
        </Text>

        {pendingBookings.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-base">No pending bookings</Text>
          </View>
        ) : (
          pendingBookings.map((booking, index) => (
            <Animated.View
              key={booking.id}
              entering={FadeInDown.delay(index * 50).duration(400)}
            >
              <Pressable
                onPress={() => handleUploadProof(booking.id)}
                className="active:opacity-80"
              >
                <View
                  className="rounded-2xl bg-white p-4 mb-3"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.05)",
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base">
                        {booking.business_name}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        Booked your {booking.slot_type}
                      </Text>

                      <View className="flex-row items-center mt-3">
                        <SlotTypeBadge type={booking.slot_type as SlotType} />
                        <View className="flex-row items-center ml-3">
                          <Calendar size={14} color="#6b7280" />
                          <Text className="text-gray-500 text-sm ml-1">
                            {formatDate(booking.date)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-black font-bold text-lg mb-2">
                        ${booking.price}
                      </Text>
                      <View className="w-8 h-8 bg-black rounded-full items-center justify-center">
                        <ChevronRight size={18} color="#fff" />
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
