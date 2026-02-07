import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Instagram, Users, Clock, Image as LucideImage, Film, X, Calendar } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { useCreator, useCreatorBookings } from "@/lib/db-hooks";
import { cn } from "@/lib/cn";
import * as Haptics from "expo-haptics";

type SlotType = "story" | "post" | "reel";

const slotTypes: { id: SlotType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "story", label: "Story", icon: <Clock size={20} color="#000" />, description: "24hr visibility" },
  { id: "reel", label: "Reel", icon: <Film size={20} color="#000" />, description: "Short video" },
  { id: "post", label: "Post", icon: <LucideImage size={20} color="#000" />, description: "Permanent feed" },
];

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
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function CreatorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: creator, isLoading: creatorLoading } = useCreator(id);
  const { data: bookings = [], isLoading: bookingsLoading } = useCreatorBookings(id);

  const [selectedType, setSelectedType] = useState<SlotType>("story");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const isLoading = creatorLoading || bookingsLoading;

  // Get blocked and booked dates
  const blockedDates: string[] = [];
  const bookedDates = useMemo(() => {
    return bookings
      .filter((b) => b.status === "pending" || b.status === "completed")
      .map((b) => b.date);
  }, [bookings]);

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

  const getPrice = (type: SlotType): number => {
    switch (type) {
      case "story": return creator.story_price || 50;
      case "post": return creator.post_price || 100;
      case "reel": return creator.reel_price || 150;
    }
  };

  const handleTypeSelect = (type: SlotType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
  };

  const handleSelectDate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCalendar(true);
  };

  const handleDateSelected = (date: string) => {
    setSelectedDate(date);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCalendar(false);

    // Navigate to booking with selected options
    router.push({
      pathname: "/business/booking/confirm",
      params: {
        creatorId: creator.id,
        type: selectedType,
        date: selectedDate,
        price: getPrice(selectedType).toString(),
      },
    });
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

        {/* Content Type Selection */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="px-5 mb-6"
        >
          <Text className="text-black font-semibold text-base mb-4">
            What do you need?
          </Text>

          {slotTypes.map((type) => {
            const price = getPrice(type.id);
            const isSelected = selectedType === type.id;

            return (
              <Pressable
                key={type.id}
                onPress={() => handleTypeSelect(type.id)}
                className="mb-3"
              >
                <View
                  className={cn(
                    "rounded-2xl p-4 flex-row items-center",
                    isSelected ? "bg-black" : "bg-gray-50"
                  )}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? "#000" : "rgba(0,0,0,0.05)",
                  }}
                >
                  <View
                    className={cn(
                      "w-12 h-12 rounded-xl items-center justify-center mr-4",
                      isSelected ? "bg-white" : "bg-white"
                    )}
                  >
                    {React.cloneElement(type.icon as React.ReactElement<{ color: string }>, {
                      color: "#000",
                    })}
                  </View>
                  <View className="flex-1">
                    <Text className={cn("font-semibold text-base", isSelected ? "text-white" : "text-black")}>
                      {type.label}
                    </Text>
                    <Text className={cn("text-sm", isSelected ? "text-gray-400" : "text-gray-500")}>
                      {type.description}
                    </Text>
                  </View>
                  <Text className={cn("text-xl font-bold", isSelected ? "text-white" : "text-black")}>
                    ${price}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-white border-t border-gray-100">
        <PillButton
          title="Select Date"
          onPress={handleSelectDate}
          variant="black"
          size="lg"
        />
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCalendar(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-5 pb-8 pt-4 max-h-[85%]">
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-black text-xl font-bold">Pick a Date</Text>
              <Pressable
                onPress={() => setShowCalendar(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={18} color="#000" />
              </Pressable>
            </View>

            {/* Selected Info */}
            <View
              className="bg-gray-50 rounded-2xl p-4 mb-4 flex-row items-center"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            >
              <Image
                source={{ uri: creator.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" }}
                className="w-12 h-12 rounded-full mr-3"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-black font-semibold">{creator.name}</Text>
                <Text className="text-gray-500 text-sm capitalize">{selectedType} • ${getPrice(selectedType)}</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Calendar */}
              <AvailabilityCalendar
                blockedDates={blockedDates}
                bookedDates={bookedDates}
                onToggleDate={() => {}}
                selectionMode="book"
                selectedDate={selectedDate}
                onSelectDate={handleDateSelected}
              />

              {/* Selected Date Display */}
              {selectedDate && (
                <View className="mt-4 p-4 bg-black rounded-2xl flex-row items-center">
                  <Calendar size={20} color="#fff" />
                  <Text className="text-white font-semibold ml-3 flex-1">
                    {formatDate(selectedDate)}
                  </Text>
                  <Text className="text-white font-bold">${getPrice(selectedType)}</Text>
                </View>
              )}

              <View className="mt-6 mb-4">
                <PillButton
                  title={selectedDate ? "Continue to Checkout" : "Select a date above"}
                  onPress={handleConfirmBooking}
                  variant="black"
                  size="lg"
                  disabled={!selectedDate}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
