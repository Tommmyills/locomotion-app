import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { CheckCircle } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";

export default function ConfirmationScreen() {
  const router = useRouter();

  const handleViewBookings = () => {
    router.replace("/business/my-bookings");
  };

  const handleBrowseMore = () => {
    router.replace("/business");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center items-center">
        {/* Success Icon */}
        <Animated.View
          entering={FadeIn.delay(200).duration(600)}
          className="mb-8"
        >
          <View
            className="w-24 h-24 rounded-full bg-black items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <CheckCircle size={48} color="#fff" />
          </View>
        </Animated.View>

        {/* Message */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          className="items-center"
        >
          <Text className="text-black text-2xl font-bold mb-2 text-center">
            Booking Confirmed!
          </Text>
          <Text className="text-gray-500 text-base text-center mb-8 px-4">
            Your ad slot has been booked successfully. The creator will post
            on the scheduled date.
          </Text>
        </Animated.View>

        {/* Info Card */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          className="w-full mb-8"
        >
          <View
            className="rounded-2xl bg-gray-50 p-5"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            <Text className="text-black font-semibold text-base mb-2">
              What happens next?
            </Text>
            <View className="flex-row items-start mb-3">
              <View className="w-6 h-6 bg-black rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">1</Text>
              </View>
              <Text className="text-gray-600 text-sm flex-1">
                Creator receives your booking request
              </Text>
            </View>
            <View className="flex-row items-start mb-3">
              <View className="w-6 h-6 bg-black rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">2</Text>
              </View>
              <Text className="text-gray-600 text-sm flex-1">
                Creator posts your ad on the scheduled date
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-black rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
              <Text className="text-gray-600 text-sm flex-1">
                You'll receive proof of posting for confirmation
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          className="w-full"
        >
          <PillButton
            title="View My Bookings"
            onPress={handleViewBookings}
            variant="black"
            size="lg"
            className="mb-3"
          />
          <PillButton
            title="Browse More Creators"
            onPress={handleBrowseMore}
            variant="white"
            size="lg"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
