import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Link, Image, CheckCircle } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { SlotTypeBadge } from "@/components/SlotCard";
import type { SlotType } from "@/lib/state/app-store";
import { useCreatorBookings, useUploadProof } from "@/lib/db-hooks";
import { useAuthStore } from "@/lib/auth-store";
import * as Haptics from "expo-haptics";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function UploadProofScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const creatorId = useAuthStore((s) => s.creatorId);
  const { data: bookings = [], isLoading } = useCreatorBookings(creatorId ?? undefined);
  const uploadProofMutation = useUploadProof();

  const booking = bookings.find((b) => b.id === id);

  const [proofUrl, setProofUrl] = useState("");
  const [uploaded, setUploaded] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading booking...</Text>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-black text-lg font-semibold mb-2">Booking not found</Text>
        <Text className="text-gray-500 text-center mb-6">
          This booking may have been completed or removed.
        </Text>
        <PillButton
          title="Back to Dashboard"
          onPress={() => router.replace("/creator")}
          variant="black"
        />
      </SafeAreaView>
    );
  }

  const handleUpload = async () => {
    if (!proofUrl.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await uploadProofMutation.mutateAsync({
        bookingId: booking.id,
        proofUrl: proofUrl.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUploaded(true);
    } catch (error) {
      console.error("Error uploading proof:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  if (uploaded) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 justify-center items-center">
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="items-center"
          >
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
              <CheckCircle size={40} color="#16a34a" />
            </View>
            <Text className="text-black text-xl font-bold mb-2 text-center">
              Proof Submitted!
            </Text>
            <Text className="text-gray-500 text-base text-center mb-8">
              We'll verify your post and update your booking status.
            </Text>
            <PillButton
              title="Back to Dashboard"
              onPress={() => router.replace("/creator")}
              variant="black"
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Booking Info */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="mt-4 mb-6"
        >
          <View
            className="rounded-2xl bg-gray-50 p-4"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            <Text className="text-black font-semibold text-lg mb-2">
              {booking.business_name}
            </Text>
            <View className="flex-row items-center">
              <SlotTypeBadge type={booking.slot_type as SlotType} />
              <Text className="text-gray-500 text-sm ml-3">
                {formatDate(booking.date)}
              </Text>
            </View>
            <View className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-black font-bold text-lg">${booking.price}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Upload Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="mb-6"
        >
          <Text className="text-black font-semibold text-base mb-2">
            Proof of Post
          </Text>
          <Text className="text-gray-500 text-sm mb-4">
            Paste the link to your Instagram post
          </Text>

          <View
            className="rounded-2xl bg-white p-4 mb-4"
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
            <View className="flex-row items-center mb-3">
              <Link size={20} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-2">Instagram URL</Text>
            </View>
            <TextInput
              value={proofUrl}
              onChangeText={setProofUrl}
              placeholder="https://instagram.com/p/..."
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-gray-50 rounded-xl px-4 py-4 text-black text-base"
              style={{
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
              }}
            />
          </View>

          <View
            className="rounded-2xl bg-blue-50 p-4 flex-row items-start"
            style={{
              borderWidth: 1,
              borderColor: "rgba(59, 130, 246, 0.15)",
            }}
          >
            <Image size={20} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-800 font-medium text-sm mb-1">
                How to get your post link
              </Text>
              <Text className="text-blue-600 text-sm">
                Open your post on Instagram → Tap the three dots → Copy Link
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-5 pb-6 pt-4 border-t border-gray-100">
        <PillButton
          title={uploadProofMutation.isPending ? "Submitting..." : "Submit Proof"}
          onPress={handleUpload}
          variant="black"
          size="lg"
          disabled={!proofUrl.trim() || uploadProofMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
