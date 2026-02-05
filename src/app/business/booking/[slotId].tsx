import React, { useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, CreditCard, CheckCircle, Clock, Image as LucideImage, Film } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { useCreator, useCreateBooking } from "@/lib/db-hooks";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getSlotIcon(type: string) {
  switch (type) {
    case "story": return <Clock size={20} color="#000" />;
    case "reel": return <Film size={20} color="#000" />;
    case "post": return <LucideImage size={20} color="#000" />;
    default: return <LucideImage size={20} color="#000" />;
  }
}

export default function BookingScreen() {
  const router = useRouter();
  const { slotId } = useLocalSearchParams<{ slotId: string }>();

  const businessEmail = useAuthStore((s) => s.businessEmail);
  const businessName = useAuthStore((s) => s.businessName);

  // Fetch slot from database
  const { data: slot, isLoading: slotLoading } = useQuery({
    queryKey: ["slot", slotId],
    queryFn: async () => {
      if (!slotId) return null;
      const { data, error } = await supabase
        .from("ad_slots")
        .select("*")
        .eq("id", slotId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slotId,
  });

  const { data: creator, isLoading: creatorLoading } = useCreator(slot?.creator_id);
  const createBooking = useCreateBooking();

  const [isProcessing, setIsProcessing] = useState(false);

  const isLoading = slotLoading || creatorLoading;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!slot || !creator) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Slot not found</Text>
      </SafeAreaView>
    );
  }

  if (!slot.available) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-black text-xl font-bold mb-2">
          Slot No Longer Available
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          This slot has already been booked by another business.
        </Text>
        <PillButton
          title="Back to Creators"
          onPress={() => router.back()}
          variant="black"
        />
      </SafeAreaView>
    );
  }

  const handlePayment = async () => {
    if (!businessEmail || !businessName) return;

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create the booking
      await createBooking.mutateAsync({
        business_name: businessName,
        business_email: businessEmail,
        creator_id: creator.id,
        slot_id: slot.id,
        slot_type: slot.type,
        date: slot.date,
        price: slot.price,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/business/confirmation");
    } catch (error) {
      console.error("Error creating booking:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsProcessing(false);
    }
  };

  const platformFee = Math.round(slot.price * 0.1);
  const total = slot.price + platformFee;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Creator Info */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="px-5 pt-4 pb-6"
        >
          <View
            className="rounded-2xl overflow-hidden bg-white"
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
            <View className="flex-row p-4">
              <Image
                source={{ uri: creator.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" }}
                className="w-16 h-16 rounded-full"
                resizeMode="cover"
              />
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-black font-semibold text-lg">
                  {creator.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {creator.instagram_handle}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Slot Details */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="px-5 mb-6"
        >
          <Text className="text-black font-semibold text-base mb-3">
            Booking Details
          </Text>

          <View
            className="rounded-2xl bg-gray-50 p-4"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600">Content Type</Text>
              <View className="flex-row items-center bg-black rounded-full px-3 py-1.5">
                {getSlotIcon(slot.type)}
                <Text className="text-white font-medium ml-2 capitalize">{slot.type}</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600">Post Date</Text>
              <View className="flex-row items-center">
                <Calendar size={16} color="#000" />
                <Text className="text-black font-medium ml-2">
                  {formatDate(slot.date)}
                </Text>
              </View>
            </View>

            <View className="h-px bg-gray-200 my-2" />

            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-gray-600">Creator Fee</Text>
              <Text className="text-black font-medium">${slot.price}</Text>
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-gray-600">Platform Fee (10%)</Text>
              <Text className="text-black font-medium">${platformFee}</Text>
            </View>

            <View className="h-px bg-gray-200 my-3" />

            <View className="flex-row items-center justify-between">
              <Text className="text-black font-bold text-lg">Total</Text>
              <Text className="text-black font-bold text-xl">${total}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Payment Method */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="px-5 mb-6"
        >
          <Text className="text-black font-semibold text-base mb-3">
            Payment Method
          </Text>

          <View
            className="rounded-2xl bg-black p-4 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="w-12 h-12 bg-white rounded-xl items-center justify-center mr-4">
              <CreditCard size={24} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">
                Pay with Stripe
              </Text>
              <Text className="text-gray-400 text-sm">
                Secure checkout
              </Text>
            </View>
            <CheckCircle size={24} color="#22c55e" />
          </View>
        </Animated.View>

        {/* Terms */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="px-5 mb-6"
        >
          <Text className="text-gray-400 text-xs text-center leading-4">
            By completing this purchase, you agree to our terms of service.
            The creator will post your ad on the scheduled date. Proof of
            posting will be provided within 24 hours.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-5 pb-6 pt-4 border-t border-gray-100">
        <PillButton
          title={isProcessing ? "Processing..." : `Pay $${total}`}
          onPress={handlePayment}
          variant="black"
          size="lg"
          disabled={isProcessing}
        />
      </View>
    </SafeAreaView>
  );
}
