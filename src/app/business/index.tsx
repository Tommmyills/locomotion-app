import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MapPin, LogOut, ShoppingBag } from "lucide-react-native";
import { CreatorCard } from "@/components/CreatorCard";
import { PillButton } from "@/components/PillButton";
import useAppStore from "@/lib/state/app-store";

export default function BusinessHomeScreen() {
  const router = useRouter();
  const selectedCity = useAppStore((s) => s.selectedCity);
  const creators = useAppStore((s) => s.creators);
  const currentUser = useAppStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);
  const logout = useAppStore((s) => s.logout);

  const approvedCreators = creators.filter((c) => c.approved && c.city === selectedCity);
  const myBookings = bookings.filter((b) => b.businessId === currentUser?.id);

  const handleCreatorPress = (creatorId: string) => {
    router.push(`/business/creator/${creatorId}`);
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const handleMyBookings = () => {
    router.push("/business/my-bookings");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-gray-500 text-sm">Welcome back,</Text>
              <Text className="text-black text-xl font-bold">
                {currentUser?.name || "Business"}
              </Text>
            </View>
            <View className="flex-row">
              {myBookings.length > 0 && (
                <Pressable
                  onPress={handleMyBookings}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-2"
                >
                  <ShoppingBag size={20} color="#000" />
                </Pressable>
              )}
              <Pressable
                onPress={handleLogout}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <LogOut size={20} color="#000" />
              </Pressable>
            </View>
          </View>

          {/* City Selector */}
          <View className="flex-row items-center mt-2">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1">{selectedCity}</Text>
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
                uri: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
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
                Promote your business locally
              </Text>
              <Text className="text-gray-200 text-sm">
                Book ad slots from trusted creators
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Featured Creators */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View className="flex-row items-center justify-between px-5 mb-4">
            <Text className="text-black text-lg font-bold">Featured Creators</Text>
            <Text className="text-gray-500 text-sm">
              {approvedCreators.length} available
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            style={{ flexGrow: 0 }}
          >
            {approvedCreators.slice(0, 4).map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onPress={() => handleCreatorPress(creator.id)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* All Creators */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="mt-8 px-5"
        >
          <Text className="text-black text-lg font-bold mb-4">All Creators</Text>

          {approvedCreators.map((creator) => (
            <Pressable
              key={creator.id}
              onPress={() => handleCreatorPress(creator.id)}
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
                    source={{ uri: creator.photo }}
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
                    <Text className="text-gray-500 text-sm capitalize">
                      {creator.platform} • {formatFollowers(creator.followerCount)}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                      {creator.bio}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </Animated.View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
