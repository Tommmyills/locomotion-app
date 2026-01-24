import React, { useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Sparkles, Building2, ChevronRight, User } from "lucide-react-native";
import useAppStore from "@/lib/state/app-store";
import * as Haptics from "expo-haptics";

export default function LandingScreen() {
  const router = useRouter();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

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

  const handleCreatorFlow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/creator-onboard");
  };

  const handleBusinessFlow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/browse-creators");
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-between py-6">
        {/* Top Bar with Sign In */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} className="flex-row justify-end mb-2">
          <Pressable
            onPress={handleLogin}
            className="flex-row items-center bg-gray-100 rounded-full px-4 py-2"
          >
            <User size={16} color="#000" />
            <Text className="text-black font-medium ml-2 text-sm">
              {isAuthenticated ? "Account" : "Sign In"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeIn.delay(200).duration(600)} className="items-center mt-4">
          <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-3">
            <Text className="text-white text-xl font-bold">LM</Text>
          </View>
          <Text className="text-black text-2xl font-bold tracking-wider">LOCO•MOTION</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Albuquerque's Local Influencer Marketplace
          </Text>
        </Animated.View>

        {/* Hero Image */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          className="items-center my-6"
        >
          <Image
            source={{
              uri: "https://images.composerapi.com/019beec7-0626-7599-b51a-5782d05789c9/assets/images/image_1769241505_1769241527335_019bef03-4427-73fa-baa6-cb2d3cd10887.png",
            }}
            className="w-full h-52 rounded-3xl"
            resizeMode="cover"
          />
        </Animated.View>

        {/* Two Clear CTAs */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          className="flex-1 justify-center"
        >
          {/* Creator CTA */}
          <Pressable
            onPress={handleCreatorFlow}
            className="active:scale-[0.98]"
          >
            <View
              className="bg-black rounded-2xl p-5 mb-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                    <Sparkles size={24} color="#000" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">
                      Earn as a Local Creator
                    </Text>
                    <Text className="text-gray-400 text-sm mt-0.5">
                      Connect Instagram & start earning
                    </Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#6b7280" />
              </View>
            </View>
          </Pressable>

          {/* Business CTA */}
          <Pressable
            onPress={handleBusinessFlow}
            className="active:scale-[0.98]"
          >
            <View
              className="bg-white rounded-2xl p-5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.08)",
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                    <Building2 size={24} color="#000" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-black text-lg font-bold">
                      Promote My Business
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5">
                      Browse creators & book ads
                    </Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#9ca3af" />
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Trust Badge */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          className="items-center pt-4"
        >
          <Text className="text-gray-400 text-xs text-center">
            Trusted by local businesses in Albuquerque
          </Text>
          <Text className="text-gray-300 text-xs mt-1">
            No negotiations • Fixed prices • Verified posts
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
