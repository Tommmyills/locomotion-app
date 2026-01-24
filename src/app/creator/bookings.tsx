import React from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, CheckCircle, Clock, Upload, Shield, ExternalLink, Zap, Lightbulb } from "lucide-react-native";
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

// Local posting tips for Albuquerque creators
const postingTips = [
  "Tag location: Nob Hill, Old Town, or UNM",
  "Best times: 11am-1pm or 7-9pm MST",
  "Use #ABQ #505 #Albuquerque #BurqueFood",
];

export default function CreatorBookingsScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const creators = useAppStore((s) => s.creators);
  const bookings = useAppStore((s) => s.bookings);

  const myCreator = creators.find((c) => c.userId === currentUser?.id);
  const myBookings = myCreator
    ? bookings
        .filter((b) => b.creatorId === myCreator.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    : [];

  const pendingBookings = myBookings.filter((b) => b.status === "pending");
  const completedBookings = myBookings.filter((b) => b.status === "completed");

  const handleUploadProof = (bookingId: string) => {
    router.push(`/creator/upload-proof/${bookingId}`);
  };

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
                  Needs Your Action ({pendingBookings.length})
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
                        <View>
                          <Text className="text-black font-semibold text-base">
                            {booking.businessName}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            Booked your {booking.slotType}
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

                      {/* Local Post Helper Tips */}
                      {!booking.proofUrl && (
                        <View
                          className="bg-blue-50 rounded-xl p-3 mb-4"
                          style={{
                            borderWidth: 1,
                            borderColor: "rgba(37, 99, 235, 0.15)",
                          }}
                        >
                          <View className="flex-row items-center mb-2">
                            <Lightbulb size={14} color="#2563eb" />
                            <Text className="text-blue-800 font-medium text-xs ml-1">
                              Local Post Tips
                            </Text>
                          </View>
                          {postingTips.map((tip, i) => (
                            <Text key={i} className="text-blue-600 text-xs mb-0.5">
                              • {tip}
                            </Text>
                          ))}
                        </View>
                      )}

                      {booking.proofUrl ? (
                        <View className="bg-amber-50 rounded-xl p-3" style={{ borderWidth: 1, borderColor: "rgba(217, 119, 6, 0.2)" }}>
                          <View className="flex-row items-center">
                            <Zap size={18} color="#d97706" />
                            <View className="flex-1 ml-2">
                              <Text className="text-amber-800 font-medium text-sm">
                                Auto-Verifying Post
                              </Text>
                              <Text className="text-amber-600 text-xs">
                                Checking your Instagram for the post...
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <PillButton
                          title="Upload Proof of Post"
                          onPress={() => handleUploadProof(booking.id)}
                          variant="black"
                          size="sm"
                        />
                      )}
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
                      <View className="flex-row items-center justify-between mb-2">
                        <View>
                          <Text className="text-black font-semibold text-base">
                            {booking.businessName}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <SlotTypeBadge type={booking.slotType} />
                            <View className="flex-row items-center ml-3">
                              <Calendar size={14} color="#6b7280" />
                              <Text className="text-gray-500 text-sm ml-1">
                                {formatDate(booking.date)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-black font-bold">
                            ${booking.price}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <Shield size={12} color="#16a34a" />
                            <Text className="text-green-600 text-xs ml-1">
                              Verified & Paid
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Proof Link */}
                      {booking.proofUrl && (
                        <Pressable
                          onPress={() => Linking.openURL(booking.proofUrl!)}
                          className="flex-row items-center mt-2 pt-2 border-t border-gray-200"
                        >
                          <ExternalLink size={12} color="#6b7280" />
                          <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
                            View post
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
