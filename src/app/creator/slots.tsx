import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, Info } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { useCreatorByEmail, useCreatorBookings, useUpdateBlockedDates } from "@/lib/db-hooks";
import { useAuthStore } from "@/lib/auth-store";
import * as Haptics from "expo-haptics";

export default function ManageAvailabilityScreen() {
  const creatorId = useAuthStore((s) => s.creatorId);
  const creatorEmail = useAuthStore((s) => s.creatorEmail);

  const { data: myCreator, isLoading: creatorLoading } = useCreatorByEmail(creatorEmail ?? undefined);
  const { data: myBookings = [], isLoading: bookingsLoading } = useCreatorBookings(creatorId ?? undefined);
  const updateBlockedDates = useUpdateBlockedDates();

  const [localBlockedDates, setLocalBlockedDates] = useState<string[] | null>(null);

  // Initialize local state from creator data
  React.useEffect(() => {
    if (myCreator && localBlockedDates === null) {
      setLocalBlockedDates(myCreator.blocked_dates || []);
    }
  }, [myCreator, localBlockedDates]);

  // Get booked dates from bookings
  const bookedDates = useMemo(() => {
    return myBookings
      .filter((b) => b.status === "pending" || b.status === "completed")
      .map((b) => b.date);
  }, [myBookings]);

  const blockedDates = localBlockedDates || [];
  const hasChanges = JSON.stringify(blockedDates) !== JSON.stringify(myCreator?.blocked_dates || []);

  const handleToggleDate = (date: string) => {
    setLocalBlockedDates((prev) => {
      const current = prev || [];
      if (current.includes(date)) {
        return current.filter((d) => d !== date);
      } else {
        return [...current, date];
      }
    });
  };

  const handleSave = async () => {
    if (!creatorId || !localBlockedDates) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateBlockedDates.mutateAsync({
        creatorId,
        blockedDates: localBlockedDates,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error saving blocked dates:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const isLoading = creatorLoading || bookingsLoading;

  if (isLoading || localBlockedDates === null) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading your calendar...</Text>
      </SafeAreaView>
    );
  }

  // Count stats
  const blockedCount = blockedDates.length;
  const bookedCount = bookedDates.length;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} className="mt-4 mb-4">
          <Text className="text-black text-xl font-bold">Your Availability</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Tap dates to block them off
          </Text>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} className="mb-4">
          <View
            className="bg-blue-50 rounded-2xl p-4 flex-row"
            style={{ borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)" }}
          >
            <Info size={20} color="#3b82f6" className="mr-3 mt-0.5" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-800 font-medium mb-1">How it works</Text>
              <Text className="text-blue-600 text-sm leading-5">
                You're available by default. Block dates when you can't create content. Businesses can only book your open dates.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-4">
          <View className="flex-row">
            <View
              className="flex-1 bg-gray-100 rounded-xl p-3 mr-2 items-center"
            >
              <Text className="text-black text-xl font-bold">{blockedCount}</Text>
              <Text className="text-gray-500 text-xs">Blocked</Text>
            </View>
            <View
              className="flex-1 bg-green-50 rounded-xl p-3 ml-2 items-center"
              style={{ borderWidth: 1, borderColor: "rgba(34, 197, 94, 0.2)" }}
            >
              <Text className="text-green-600 text-xl font-bold">{bookedCount}</Text>
              <Text className="text-gray-500 text-xs">Booked</Text>
            </View>
          </View>
        </Animated.View>

        {/* Calendar */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} className="mb-6">
          <AvailabilityCalendar
            blockedDates={blockedDates}
            bookedDates={bookedDates}
            onToggleDate={handleToggleDate}
            selectionMode="block"
          />
        </Animated.View>

        {/* Pricing Info */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-6">
          <Text className="text-black font-semibold text-base mb-3">Your Pricing</Text>
          <View
            className="bg-gray-50 rounded-2xl p-4 flex-row justify-around"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <View className="items-center">
              <Text className="text-gray-500 text-xs mb-1">Story</Text>
              <Text className="text-black font-bold">${myCreator?.story_price || 50}</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-gray-500 text-xs mb-1">Post</Text>
              <Text className="text-black font-bold">${myCreator?.post_price || 100}</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-gray-500 text-xs mb-1">Reel</Text>
              <Text className="text-black font-bold">${myCreator?.reel_price || 150}</Text>
            </View>
          </View>
        </Animated.View>

        <View className="h-24" />
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-white border-t border-gray-100"
        >
          <PillButton
            title={updateBlockedDates.isPending ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            variant="black"
            size="lg"
            disabled={updateBlockedDates.isPending}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
