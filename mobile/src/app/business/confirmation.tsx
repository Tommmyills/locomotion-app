import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { CheckCircle, Lightbulb, Clock, MapPin, Sparkles } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";

// Local Post Helper tips for Albuquerque
const localTips = [
  {
    icon: <Clock size={16} color="#2563eb" />,
    title: "Best posting time",
    tip: "Weekday posts at 11am-1pm or 7-9pm perform best in ABQ",
  },
  {
    icon: <MapPin size={16} color="#2563eb" />,
    title: "Tag local spots",
    tip: "Geotag Nob Hill, Old Town, or UNM for better local reach",
  },
  {
    icon: <Sparkles size={16} color="#2563eb" />,
    title: "ABQ hashtags",
    tip: "Use #ABQ #Albuquerque #505 #NewMexico #BurqueFood",
  },
];

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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-6">
          {/* Success Icon */}
          <Animated.View
            entering={FadeIn.delay(200).duration(600)}
            className="items-center mb-6"
          >
            <View
              className="w-20 h-20 rounded-full bg-green-100 items-center justify-center"
              style={{
                shadowColor: "#16a34a",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <CheckCircle size={40} color="#16a34a" />
            </View>
          </Animated.View>

          {/* Message */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            className="items-center mb-6"
          >
            <Text className="text-black text-2xl font-bold mb-2 text-center">
              Booking Confirmed!
            </Text>
            <Text className="text-gray-500 text-base text-center px-4">
              Your ad slot has been booked. The creator will post on the scheduled date.
            </Text>
          </Animated.View>

          {/* What happens next */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            className="mb-6"
          >
            <View
              className="rounded-2xl bg-gray-50 p-5"
              style={{
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
              }}
            >
              <Text className="text-black font-semibold text-base mb-3">
                What happens next?
              </Text>
              <View className="flex-row items-start mb-3">
                <View className="w-6 h-6 bg-black rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white text-xs font-bold">1</Text>
                </View>
                <Text className="text-gray-600 text-sm flex-1">
                  Creator receives your booking
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <View className="w-6 h-6 bg-black rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white text-xs font-bold">2</Text>
                </View>
                <Text className="text-gray-600 text-sm flex-1">
                  Post goes live on the scheduled date
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-black rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
                <Text className="text-gray-600 text-sm flex-1">
                  Auto-verified & you'll see the proof
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Local Post Helper */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(600)}
            className="mb-6"
          >
            <View
              className="rounded-2xl bg-blue-50 p-5"
              style={{
                borderWidth: 1,
                borderColor: "rgba(37, 99, 235, 0.15)",
              }}
            >
              <View className="flex-row items-center mb-3">
                <Lightbulb size={18} color="#2563eb" />
                <Text className="text-blue-800 font-semibold text-base ml-2">
                  Local Post Helper
                </Text>
              </View>
              <Text className="text-blue-700 text-sm mb-4">
                Tips shared with your creator to maximize your ABQ reach:
              </Text>

              {localTips.map((tip, index) => (
                <View key={index} className="flex-row items-start mb-3 last:mb-0">
                  <View className="w-8 h-8 bg-white rounded-lg items-center justify-center mr-3">
                    {tip.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-900 font-medium text-sm">
                      {tip.title}
                    </Text>
                    <Text className="text-blue-600 text-xs mt-0.5">
                      {tip.tip}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(1000).duration(600)}>
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
      </ScrollView>
    </SafeAreaView>
  );
}
