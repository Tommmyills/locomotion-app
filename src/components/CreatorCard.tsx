import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Instagram, Youtube, Facebook } from "lucide-react-native";
import { cn } from "@/lib/cn";
import type { Creator, Platform } from "@/lib/state/app-store";

interface CreatorCardProps {
  creator: Creator;
  onPress: () => void;
}

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  const color = "#000";
  switch (platform) {
    case "instagram":
      return <Instagram size={size} color={color} />;
    case "tiktok":
      return <Youtube size={size} color={color} />; // Using Youtube as TikTok substitute
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
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function CreatorCard({ creator, onPress }: CreatorCardProps) {
  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      <View
        className="w-44 mr-4 rounded-2xl overflow-hidden bg-white"
        style={{
          // Subtle 3D acrylic effect
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          // Inner glow effect
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.8)",
        }}
      >
        {/* Top highlight for acrylic look */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.9)",
            zIndex: 10,
          }}
        />

        <Image
          source={{ uri: creator.photo }}
          className="w-full h-36"
          resizeMode="cover"
        />

        <View className="p-3">
          <Text className="text-black font-semibold text-base" numberOfLines={1}>
            {creator.name}
          </Text>

          <View className="flex-row items-center mt-1">
            <PlatformIcon platform={creator.platform} size={14} />
            <Text className="text-gray-600 text-xs ml-1 capitalize">
              {creator.platform}
            </Text>
            <View className="w-1 h-1 rounded-full bg-gray-400 mx-2" />
            <Text className="text-gray-600 text-xs">
              {formatFollowers(creator.followerCount)}
            </Text>
          </View>

          <Text className="text-gray-500 text-xs mt-2" numberOfLines={2}>
            {creator.bio}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function CreatorCardLarge({ creator, onPress }: CreatorCardProps) {
  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      <View
        className="rounded-2xl overflow-hidden bg-white mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.8)",
        }}
      >
        <View className="flex-row">
          <Image
            source={{ uri: creator.photo }}
            className="w-24 h-24"
            resizeMode="cover"
          />

          <View className="flex-1 p-3 justify-center">
            <Text className="text-black font-semibold text-lg" numberOfLines={1}>
              {creator.name}
            </Text>

            <View className="flex-row items-center mt-1">
              <PlatformIcon platform={creator.platform} size={14} />
              <Text className="text-gray-600 text-sm ml-1 capitalize">
                {creator.platform}
              </Text>
              <View className="w-1 h-1 rounded-full bg-gray-400 mx-2" />
              <Text className="text-gray-600 text-sm">
                {formatFollowers(creator.followerCount)} followers
              </Text>
            </View>

            <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
              {creator.bio}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
