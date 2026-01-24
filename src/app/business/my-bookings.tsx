import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, CheckCircle, Clock, ExternalLink } from "lucide-react-native";
import { SlotTypeBadge } from "@/components/SlotCard";
import useAppStore from "@/lib/state/app-store";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function MyBookingsScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);

  const myBookings = bookings
    .filter((b) => b.businessId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingBookings = myBookings.filter((b) => b.status === "pending");
  const completedBookings = myBookings.filter((b) => b.status === "completed");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {myBookings.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-base">No bookings yet</Text>
          </View>
        ) : (
          <>
            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="mb-6"
              >
                <Text className="text-black font-semibold text-base mb-4 mt-4">
                  Pending ({pendingBookings.length})
                </Text>

                {pendingBookings.map((booking, index) => (
                  <Animated.View
                    key={booking.id}
                    entering={FadeInDown.delay(index * 50).duration(400)}
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
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-black font-semibold text-base">
                          {booking.creatorName}
                        </Text>
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Clock size={12} color="#ca8a04" />
                          <Text className="text-yellow-600 text-xs ml-1">
                            Pending
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <SlotTypeBadge type={booking.slotType} />
                          <View className="flex-row items-center ml-3">
                            <Calendar size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-sm ml-1">
                              {formatDate(booking.date)}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-black font-bold">
                          ${booking.price}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {/* Completed Bookings */}
            {completedBookings.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(200).duration(400)}
                className="mb-6"
              >
                <Text className="text-black font-semibold text-base mb-4">
                  Completed ({completedBookings.length})
                </Text>

                {completedBookings.map((booking, index) => (
                  <Animated.View
                    key={booking.id}
                    entering={FadeInDown.delay(200 + index * 50).duration(400)}
                  >
                    <View
                      className="rounded-2xl bg-gray-50 p-4 mb-3"
                      style={{
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.05)",
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-black font-semibold text-base">
                          {booking.creatorName}
                        </Text>
                        <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle size={12} color="#16a34a" />
                          <Text className="text-green-600 text-xs ml-1">
                            Completed
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <SlotTypeBadge type={booking.slotType} />
                          <View className="flex-row items-center ml-3">
                            <Calendar size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-sm ml-1">
                              {formatDate(booking.date)}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-black font-bold">
                          ${booking.price}
                        </Text>
                      </View>

                      {booking.proofUrl && (
                        <Pressable className="flex-row items-center mt-3 pt-3 border-t border-gray-200">
                          <ExternalLink size={14} color="#3b82f6" />
                          <Text className="text-blue-500 text-sm ml-1">
                            View Proof of Post
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
