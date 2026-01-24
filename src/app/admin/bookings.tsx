import React from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, CheckCircle, Clock, ExternalLink, Image } from "lucide-react-native";
import { SlotTypeBadge } from "@/components/SlotCard";
import { PillButton } from "@/components/PillButton";
import useAppStore from "@/lib/state/app-store";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function ManageBookingsScreen() {
  const bookings = useAppStore((s) => s.bookings);
  const completeBooking = useAppStore((s) => s.completeBooking);

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Bookings with proof ready for review
  const readyForReview = sortedBookings.filter(
    (b) => b.status === "pending" && b.proofUrl
  );
  // Pending bookings without proof
  const awaitingProof = sortedBookings.filter(
    (b) => b.status === "pending" && !b.proofUrl
  );
  // Completed bookings
  const completedBookings = sortedBookings.filter(
    (b) => b.status === "completed"
  );

  const handleComplete = (bookingId: string) => {
    completeBooking(bookingId);
  };

  const handleViewProof = (proofUrl: string) => {
    Linking.openURL(proofUrl);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {bookings.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-base">No bookings yet</Text>
          </View>
        ) : (
          <>
            {/* Ready for Review */}
            {readyForReview.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="mb-6"
              >
                <Text className="text-black font-semibold text-base mb-4 mt-4">
                  Ready for Review ({readyForReview.length})
                </Text>

                {readyForReview.map((booking, index) => (
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
                        borderWidth: 2,
                        borderColor: "#3b82f6",
                      }}
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-black font-semibold text-base">
                            {booking.creatorName}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            for {booking.businessName}
                          </Text>
                        </View>
                        <Text className="text-black font-bold text-lg">
                          ${booking.price}
                        </Text>
                      </View>

                      <View className="flex-row items-center mb-4">
                        <SlotTypeBadge type={booking.slotType} />
                        <View className="flex-row items-center ml-3">
                          <Calendar size={14} color="#6b7280" />
                          <Text className="text-gray-500 text-sm ml-1">
                            {formatDate(booking.date)}
                          </Text>
                        </View>
                      </View>

                      {/* Proof Link */}
                      {booking.proofUrl && (
                        <Pressable
                          onPress={() => handleViewProof(booking.proofUrl!)}
                          className="mb-4"
                        >
                          <View className="flex-row items-center bg-blue-50 rounded-xl p-3">
                            <Image size={18} color="#3b82f6" />
                            <Text
                              className="text-blue-600 text-sm ml-2 flex-1"
                              numberOfLines={1}
                            >
                              {booking.proofUrl}
                            </Text>
                            <ExternalLink size={16} color="#3b82f6" />
                          </View>
                        </Pressable>
                      )}

                      <PillButton
                        title="Mark as Complete"
                        onPress={() => handleComplete(booking.id)}
                        variant="black"
                        size="sm"
                      />
                    </View>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {/* Awaiting Proof */}
            {awaitingProof.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(readyForReview.length * 50 + 100).duration(400)}
                className="mb-6"
              >
                <Text className="text-black font-semibold text-base mb-4">
                  Awaiting Proof ({awaitingProof.length})
                </Text>

                {awaitingProof.map((booking, index) => (
                  <View
                    key={booking.id}
                    className="rounded-2xl bg-yellow-50 p-4 mb-3"
                    style={{
                      borderWidth: 1,
                      borderColor: "rgba(202, 138, 4, 0.2)",
                    }}
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-black font-semibold">
                          {booking.creatorName}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          for {booking.businessName}
                        </Text>
                      </View>
                      <Text className="text-black font-bold">${booking.price}</Text>
                    </View>

                    <View className="flex-row items-center">
                      <SlotTypeBadge type={booking.slotType} />
                      <View className="flex-row items-center ml-3">
                        <Calendar size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-sm ml-1">
                          {formatDate(booking.date)}
                        </Text>
                      </View>
                      <View className="flex-row items-center ml-auto">
                        <Clock size={14} color="#ca8a04" />
                        <Text className="text-yellow-600 text-xs ml-1">
                          Awaiting proof
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Completed */}
            {completedBookings.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(
                  (readyForReview.length + awaitingProof.length) * 50 + 200
                ).duration(400)}
                className="mb-6"
              >
                <Text className="text-black font-semibold text-base mb-4">
                  Completed ({completedBookings.length})
                </Text>

                {completedBookings.map((booking) => (
                  <View
                    key={booking.id}
                    className="rounded-2xl bg-gray-50 p-4 mb-3"
                    style={{
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.05)",
                    }}
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-black font-semibold">
                          {booking.creatorName}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          for {booking.businessName}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-black font-bold">${booking.price}</Text>
                        <View className="flex-row items-center mt-1">
                          <CheckCircle size={12} color="#16a34a" />
                          <Text className="text-green-600 text-xs ml-1">
                            Complete
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <SlotTypeBadge type={booking.slotType} />
                      <View className="flex-row items-center ml-3">
                        <Calendar size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-sm ml-1">
                          {formatDate(booking.date)}
                        </Text>
                      </View>
                    </View>
                  </View>
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
