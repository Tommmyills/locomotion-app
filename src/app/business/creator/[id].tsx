import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Instagram, Youtube, Facebook, Users } from "lucide-react-native";
import { SlotCard } from "@/components/SlotCard";
import { PillButton } from "@/components/PillButton";
import useAppStore, { Platform } from "@/lib/state/app-store";

function PlatformIcon({ platform, size = 20 }: { platform: Platform; size?: number }) {
  const color = "#000";
  switch (platform) {
    case "instagram":
      return <Instagram size={size} color={color} />;
    case "tiktok":
      return <Youtube size={size} color={color} />;
    case "facebook":
      return <Facebook size={size} color={color} />;
    default:
      return null;
  }
}

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}

export default function CreatorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const creators = useAppStore((s) => s.creators);
  const adSlots = useAppStore((s) => s.adSlots);

  const creator = creators.find((c) => c.id === id);
  const creatorSlots = adSlots.filter((s) => s.creatorId === id);
  const availableSlots = creatorSlots.filter((s) => s.available);

  if (!creator) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Creator not found</Text>
      </SafeAreaView>
    );
  }

  const handleSlotPress = (slotId: string) => {
    router.push(`/business/booking/${slotId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="items-center pt-4 pb-6 px-5"
        >
          <Image
            source={{ uri: creator.photo }}
            className="w-28 h-28 rounded-full"
            resizeMode="cover"
          />
          <Text className="text-black text-2xl font-bold mt-4">
            {creator.name}
          </Text>

          <View className="flex-row items-center mt-2">
            <PlatformIcon platform={creator.platform} size={18} />
            <Text className="text-gray-600 text-base ml-2 capitalize">
              {creator.platform}
            </Text>
          </View>

          {/* Stats */}
          <View
            className="flex-row mt-6 bg-gray-50 rounded-2xl px-6 py-4"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            <View className="items-center px-4">
              <View className="flex-row items-center">
                <Users size={16} color="#6b7280" />
                <Text className="text-black text-xl font-bold ml-2">
                  {formatFollowers(creator.followerCount)}
                </Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">Followers</Text>
            </View>
            <View className="w-px bg-gray-200 mx-4" />
            <View className="items-center px-4">
              <Text className="text-black text-xl font-bold">
                {availableSlots.length}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">Available Slots</Text>
            </View>
          </View>
        </Animated.View>

        {/* Bio */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="px-5 mb-6"
        >
          <Text className="text-black font-semibold text-base mb-2">About</Text>
          <Text className="text-gray-600 text-sm leading-5">{creator.bio}</Text>
        </Animated.View>

        {/* Available Slots */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="px-5"
        >
          <Text className="text-black font-semibold text-base mb-4">
            Available Ad Slots
          </Text>

          {creatorSlots.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-gray-400">No slots available</Text>
            </View>
          ) : (
            creatorSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onPress={() => handleSlotPress(slot.id)}
              />
            ))
          )}
        </Animated.View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
