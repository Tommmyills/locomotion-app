import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Link, Image, CheckCircle } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { SlotTypeBadge } from "@/components/SlotCard";
import useAppStore from "@/lib/state/app-store";

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

  const bookings = useAppStore((s) => s.bookings);
  const uploadProof = useAppStore((s) => s.uploadProof);

  const booking = bookings.find((b) => b.id === id);

  const [proofUrl, setProofUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Booking not found</Text>
      </SafeAreaView>
    );
  }

  const handleUpload = async () => {
    if (!proofUrl.trim()) return;

    setIsUploading(true);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    uploadProof(booking.id, proofUrl.trim());

    setIsUploading(false);
    setUploaded(true);
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
              Proof Uploaded!
            </Text>
            <Text className="text-gray-500 text-base text-center mb-8">
              The admin will review and mark this booking as complete.
            </Text>
            <PillButton
              title="Back to Bookings"
              onPress={() => router.replace("/creator/bookings")}
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
              {booking.businessName}
            </Text>
            <View className="flex-row items-center">
              <SlotTypeBadge type={booking.slotType} />
              <Text className="text-gray-500 text-sm ml-3">
                {formatDate(booking.date)}
              </Text>
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
            Enter a link to your post (Instagram URL, screenshot link, etc.)
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
              <Text className="text-gray-500 text-sm ml-2">Post URL</Text>
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
            className="rounded-2xl bg-gray-50 p-4 flex-row items-start"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            <Image size={20} color="#6b7280" />
            <View className="flex-1 ml-3">
              <Text className="text-gray-600 text-sm">
                You can also upload a screenshot to any image hosting service
                and paste the link here.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-5 pb-6 pt-4 border-t border-gray-100">
        <PillButton
          title={isUploading ? "Uploading..." : "Submit Proof"}
          onPress={handleUpload}
          variant="black"
          size="lg"
          disabled={!proofUrl.trim() || isUploading}
        />
      </View>
    </SafeAreaView>
  );
}
