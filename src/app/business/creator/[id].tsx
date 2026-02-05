import React, { useState } from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Instagram, Users, Clock, Image as LucideImage, Film, Calendar, Sparkles } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { useCreator, useCreatorSlots } from "@/lib/db-hooks";
import { cn } from "@/lib/cn";
import * as Haptics from "expo-haptics";

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getSlotIcon(type: string, color: string = "#6b7280") {
  switch (type) {
    case "story": return <Clock size={20} color={color} />;
    case "reel": return <Film size={20} color={color} />;
    case "post": return <LucideImage size={20} color={color} />;
    default: return <LucideImage size={20} color={color} />;
  }
}

export default function CreatorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: creator, isLoading: creatorLoading } = useCreator(id);
  const { data: slots = [], isLoading: slotsLoading } = useCreatorSlots(id);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const isLoading = creatorLoading || slotsLoading;
  const availableSlots = slots.filter((s) => s.available);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!creator) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Creator not found</Text>
      </SafeAreaView>
    );
  }

  const handleSlotSelect = (slotId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSlotId(slotId);
  };

  const handleBookSlot = () => {
    if (!selectedSlotId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/business/booking/${selectedSlotId}`);
  };

  const selectedSlot = availableSlots.find((s) => s.id === selectedSlotId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="items-center pt-4 pb-6 px-5"
        >
          <Image
            source={{ uri: creator.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" }}
            className="w-28 h-28 rounded-full"
            resizeMode="cover"
          />
          <Text className="text-black text-2xl font-bold mt-4">
            {creator.name}
          </Text>

          <View className="flex-row items-center mt-2">
            <Instagram size={18} color="#000" />
            <Text className="text-gray-600 text-base ml-2">
              {creator.instagram_handle}
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
                  {formatFollowers(creator.follower_count || 0)}
                </Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">Followers</Text>
            </View>
            <View className="w-px bg-gray-200 mx-4" />
            <View className="items-center px-4">
              <Text className="text-black text-xl font-bold">
                {(creator.engagement_rate || 0).toFixed(1)}%
              </Text>
              <Text className="text-gray-500 text-xs mt-1">Engagement</Text>
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
          className="px-5 mb-6"
        >
          <Text className="text-black font-semibold text-base mb-4">
            Available Slots
          </Text>

          {availableSlots.length === 0 ? (
            <View className="py-12 items-center">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Calendar size={32} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 font-medium mb-1">No slots available</Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                This creator hasn't added any available slots yet. Check back later!
              </Text>
            </View>
          ) : (
            availableSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;

              return (
                <Pressable
                  key={slot.id}
                  onPress={() => handleSlotSelect(slot.id)}
                  className="mb-3"
                >
                  <View
                    className={cn(
                      "rounded-2xl p-4 flex-row items-center",
                      isSelected ? "bg-black" : "bg-white"
                    )}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: isSelected ? 4 : 1 },
                      shadowOpacity: isSelected ? 0.2 : 0.08,
                      shadowRadius: isSelected ? 12 : 4,
                      elevation: isSelected ? 4 : 2,
                      borderWidth: 1,
                      borderColor: isSelected ? "#000" : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <View
                      className={cn(
                        "w-12 h-12 rounded-xl items-center justify-center mr-4",
                        isSelected ? "bg-white" : "bg-gray-50"
                      )}
                    >
                      {getSlotIcon(slot.type, isSelected ? "#000" : "#6b7280")}
                    </View>
                    <View className="flex-1">
                      <Text className={cn("font-semibold text-base capitalize", isSelected ? "text-white" : "text-black")}>
                        {slot.type}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Calendar size={12} color={isSelected ? "#9ca3af" : "#6b7280"} />
                        <Text className={cn("text-sm ml-1", isSelected ? "text-gray-400" : "text-gray-500")}>
                          {formatDate(slot.date)}
                        </Text>
                      </View>
                    </View>
                    <Text className={cn("text-xl font-bold", isSelected ? "text-white" : "text-black")}>
                      ${slot.price}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </Animated.View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom CTA */}
      {availableSlots.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-white border-t border-gray-100">
          <PillButton
            title={selectedSlot ? `Book ${selectedSlot.type} - $${selectedSlot.price}` : "Select a slot to book"}
            onPress={handleBookSlot}
            variant="black"
            size="lg"
            disabled={!selectedSlotId}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
