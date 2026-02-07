import React from "react";
import { View, Text, Image, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Sparkles, Building2, ChevronRight, LogIn } from "lucide-react-native";
import { useAuthStore } from "@/lib/auth-store";
import useAppStore from "@/lib/state/app-store";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();

  // Check if user is already logged in
  const creatorId = useAuthStore((s) => s.creatorId);
  const isAppAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

  // Redirect authenticated users
  React.useEffect(() => {
    if (creatorId) {
      router.replace("/creator");
      return;
    }
    if (isAppAuthenticated && currentUser) {
      const role = currentUser.role;
      if (role === "business") {
        router.replace("/business");
      } else if (role === "creator") {
        router.replace("/creator");
      } else if (role === "admin") {
        router.replace("/admin");
      }
    }
  }, [creatorId, isAppAuthenticated, currentUser, router]);

  const handleCreatorSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/creator-onboard");
  };

  const handleBusinessSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/business-onboard");
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Logo Area */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="items-center pt-8 pb-4"
        >
          <Image
            source={require("../assets/logo.png")}
            style={{ width: width * 0.5, height: width * 0.5 }}
            resizeMode="contain"
          />
          <Text className="text-gray-500 text-sm mt-1 text-center">
            Albuquerque's Local Influencer Marketplace
          </Text>
        </Animated.View>

        {/* Main Content */}
        <View className="flex-1 justify-center">
          {/* Headline */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-8">
            <Text className="text-black text-2xl font-bold text-center mb-2">
              Get Started Now
            </Text>
            <Text className="text-gray-500 text-center">
              Choose how you want to use LOCO•MOTION
            </Text>
          </Animated.View>

          {/* Creator Option */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Pressable
              onPress={handleCreatorSignUp}
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
                        I'm a Creator
                      </Text>
                      <Text className="text-gray-400 text-sm mt-0.5">
                        Earn money from local businesses
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={24} color="#6b7280" />
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Business Option */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Pressable
              onPress={handleBusinessSignUp}
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
                        I'm a Business
                      </Text>
                      <Text className="text-gray-500 text-sm mt-0.5">
                        Promote with local influencers
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={24} color="#9ca3af" />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Bottom Section */}
        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
          className="pb-6"
        >
          {/* Already have account */}
          <Pressable
            onPress={handleLogin}
            className="flex-row items-center justify-center py-4"
          >
            <LogIn size={18} color="#6b7280" />
            <Text className="text-gray-600 font-medium ml-2">
              Already have an account? Sign In
            </Text>
          </Pressable>

          {/* Trust Badge */}
          <View className="items-center pt-2">
            <Text className="text-gray-400 text-xs text-center">
              No negotiations • Fixed prices • Verified posts
            </Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
