import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { PillButton } from "@/components/PillButton";
import useAppStore from "@/lib/state/app-store";

export default function LandingScreen() {
  const router = useRouter();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (isAuthenticated && currentUser) {
      const role = currentUser.role;
      if (role === "business") {
        router.replace("/business");
      } else if (role === "creator") {
        router.replace("/creator");
      } else if (role === "admin") {
        router.replace("/admin");
      }
    }
  }, [isAuthenticated, currentUser, router]);

  const handleGetStarted = () => {
    router.push("/role-select");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-between py-8">
        {/* Header */}
        <Animated.View entering={FadeIn.delay(200).duration(600)} className="items-center mt-12">
          <View className="w-20 h-20 bg-black rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">LM</Text>
          </View>
          <Text className="text-black text-2xl font-bold tracking-wider">LOCO•MOTION</Text>
          <Text className="text-gray-500 text-base mt-2">
            Influencer ads made simple
          </Text>
        </Animated.View>

        {/* Hero Image */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          className="items-center my-8"
        >
          <Image
            source={{
              uri: "https://images.composerapi.com/019beec7-0626-7599-b51a-5782d05789c9/assets/images/image_1769241505_1769241527335_019bef03-4427-73fa-baa6-cb2d3cd10887.png",
            }}
            className="w-full h-64 rounded-3xl"
            resizeMode="cover"
          />
        </Animated.View>

        {/* Value Props */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          className="mb-8"
        >
          <View className="flex-row items-start mb-4">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-black font-semibold text-base">
                Browse Local Creators
              </Text>
              <Text className="text-gray-500 text-sm">
                Find trusted influencers in your city
              </Text>
            </View>
          </View>

          <View className="flex-row items-start mb-4">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-black font-semibold text-base">
                Book Fixed Ad Slots
              </Text>
              <Text className="text-gray-500 text-sm">
                Stories, Reels, or Posts at set prices
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-black font-semibold text-base">
                Get Promoted
              </Text>
              <Text className="text-gray-500 text-sm">
                Creator posts, you grow your business
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)}>
          <PillButton
            title="Get Started"
            onPress={handleGetStarted}
            variant="black"
            size="lg"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
