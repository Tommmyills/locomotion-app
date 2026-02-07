import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MapPin, LogOut, ShoppingBag, Instagram, Home, Sparkles, X } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { useCreators, useAdSlots } from "@/lib/db-hooks";
import { useAuthStore } from "@/lib/auth-store";
import useAppStore from "@/lib/state/app-store";
import * as Haptics from "expo-haptics";

export default function BusinessHomeScreen() {
  const router = useRouter();
  const businessName = useAuthStore((s) => s.businessName);
  const businessEmail = useAuthStore((s) => s.businessEmail);
  const clearBusinessInfo = useAuthStore((s) => s.clearBusinessInfo);
  const logout = useAppStore((s) => s.logout);
  const currentUser = useAppStore((s) => s.currentUser);

  // Check if they also have a creator account
  const creatorId = useAuthStore((s) => s.creatorId);
  const creatorEmail = useAuthStore((s) => s.creatorEmail);
  const hasCreatorAccount = !!(creatorId && creatorEmail);

  const { data: creators = [], isLoading: creatorsLoading } = useCreators();
  const { data: adSlots = [], isLoading: slotsLoading } = useAdSlots();

  const [showMenu, setShowMenu] = useState(false);

  const isLoading = creatorsLoading || slotsLoading;
  const displayName = businessName || currentUser?.name || "Business";

  const handleCreatorPress = (creatorId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/browse-creators`);
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMenu(false);
    router.replace("/home");
  };

  const handleSwitchToCreator = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMenu(false);
    // If they already have a creator account, go straight to the dashboard
    if (hasCreatorAccount) {
      router.push("/creator");
    } else {
      router.push("/creator-onboard");
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearBusinessInfo();
    logout();
    router.replace("/home");
  };

  const handleBrowseCreators = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/browse-creators");
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMenu(true);
              }}
              className="flex-1"
            >
              <Text className="text-gray-500 text-sm">Welcome back,</Text>
              <Text className="text-black text-xl font-bold">
                {displayName}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMenu(true);
              }}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Home size={20} color="#000" />
            </Pressable>
          </View>

          {/* City Selector */}
          <View className="flex-row items-center mt-2">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1">Albuquerque</Text>
          </View>
        </View>

        {/* Hero Banner */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="mx-5 mb-6"
        >
          <View
            className="rounded-2xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800",
              }}
              className="w-full h-40"
              resizeMode="cover"
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 16,
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              <Text className="text-white font-bold text-lg">
                Promote your business in ABQ
              </Text>
              <Text className="text-gray-200 text-sm">
                Book local creators • Fixed prices • Verified posts
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Browse Creators CTA */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          className="px-5 mb-6"
        >
          <PillButton
            title="Browse All Creators"
            onPress={handleBrowseCreators}
            variant="black"
            size="lg"
          />
        </Animated.View>

        {/* Featured Creators */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View className="flex-row items-center justify-between px-5 mb-4">
            <Text className="text-black text-lg font-bold">Featured Creators</Text>
            <Text className="text-gray-500 text-sm">
              {creators.length} available
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            style={{ flexGrow: 0 }}
          >
            {creators.slice(0, 4).map((creator) => {
              const creatorSlots = adSlots.filter(
                (s) => s.creator_id === creator.id && s.available
              );
              const lowestPrice = creatorSlots.length > 0
                ? Math.min(...creatorSlots.map((s) => s.price))
                : null;

              return (
                <Pressable
                  key={creator.id}
                  onPress={handleBrowseCreators}
                  className="mr-3"
                >
                  <View
                    className="w-40 rounded-2xl overflow-hidden bg-white"
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
                    <Image
                      source={{ uri: creator.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" }}
                      className="w-full h-32"
                      resizeMode="cover"
                    />
                    <View className="p-3">
                      <Text className="text-black font-semibold" numberOfLines={1}>
                        {creator.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Instagram size={12} color="#E1306C" />
                        <Text className="text-gray-500 text-xs ml-1">
                          {formatFollowers(creator.follower_count)}
                        </Text>
                      </View>
                      {lowestPrice && (
                        <Text className="text-black font-bold text-sm mt-1">
                          From ${lowestPrice}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* All Creators */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="mt-8 px-5"
        >
          <Text className="text-black text-lg font-bold mb-4">All Creators</Text>

          {creators.map((creator) => {
            const creatorSlots = adSlots.filter(
              (s) => s.creator_id === creator.id && s.available
            );
            const lowestPrice = creatorSlots.length > 0
              ? Math.min(...creatorSlots.map((s) => s.price))
              : null;

            return (
              <Pressable
                key={creator.id}
                onPress={handleBrowseCreators}
                className="active:opacity-90"
              >
                <View
                  className="rounded-2xl overflow-hidden bg-white mb-4"
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
                  <View className="flex-row">
                    <Image
                      source={{ uri: creator.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" }}
                      className="w-24 h-24"
                      resizeMode="cover"
                    />
                    <View className="flex-1 p-3 justify-center">
                      <Text
                        className="text-black font-semibold text-base"
                        numberOfLines={1}
                      >
                        {creator.name}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        <Instagram size={12} color="#E1306C" />
                        <Text className="text-gray-500 text-sm ml-1">
                          {formatFollowers(creator.follower_count)}
                        </Text>
                      </View>
                      {creator.bio && (
                        <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                          {creator.bio}
                        </Text>
                      )}
                      {lowestPrice && (
                        <Text className="text-black font-semibold text-sm mt-1">
                          From ${lowestPrice}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>

        <View className="h-8" />
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowMenu(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl px-5 pb-8 pt-4">
              {/* Handle */}
              <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-black text-xl font-bold">Menu</Text>
                <Pressable
                  onPress={() => setShowMenu(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <X size={18} color="#000" />
                </Pressable>
              </View>

              {/* Options */}
              <Pressable
                onPress={handleGoHome}
                className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
              >
                <View className="w-10 h-10 bg-black rounded-full items-center justify-center mr-3">
                  <Home size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-black font-semibold">Go to Main Menu</Text>
                  <Text className="text-gray-500 text-sm">Return to home screen</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={handleSwitchToCreator}
                className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
              >
                <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                  <Sparkles size={20} color="#000" />
                </View>
                <View className="flex-1">
                  <Text className="text-black font-semibold">Switch to Creator</Text>
                  <Text className="text-gray-500 text-sm">Earn money as an influencer</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                className="flex-row items-center p-4 bg-red-50 rounded-xl"
                style={{ borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" }}
              >
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                  <LogOut size={20} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-red-600 font-semibold">Log Out</Text>
                  <Text className="text-red-400 text-sm">Sign out of your account</Text>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
