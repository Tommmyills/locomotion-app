import React from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, DollarSign, LogOut, Package, Clock } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { useCreatorByEmail, useCreatorSlots, useCreatorBookings } from "@/lib/db-hooks";
import { useAuthStore } from "@/lib/auth-store";

export default function CreatorDashboardScreen() {
  const router = useRouter();
  const creatorId = useAuthStore((s) => s.creatorId);
  const creatorEmail = useAuthStore((s) => s.creatorEmail);
  const creatorName = useAuthStore((s) => s.creatorName);
  const logoutCreator = useAuthStore((s) => s.logoutCreator);

  const { data: myCreator, isLoading: creatorLoading } = useCreatorByEmail(creatorEmail ?? undefined);
  const { data: mySlots = [], isLoading: slotsLoading } = useCreatorSlots(creatorId ?? undefined);
  const { data: myBookings = [], isLoading: bookingsLoading } = useCreatorBookings(creatorId ?? undefined);

  const isLoading = creatorLoading || slotsLoading || bookingsLoading;

  const pendingBookings = myBookings.filter((b) => b.status === "pending");
  const totalEarnings = myBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.price, 0);
  const availableSlots = mySlots.filter((s) => s.available).length;

  const handleLogout = () => {
    logoutCreator();
    router.replace("/");
  };

  const handleManageSlots = () => {
    router.push("/creator/slots");
  };

  const handleViewBookings = () => {
    router.push("/creator/bookings");
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  // If user is not logged in as creator
  if (!creatorId || !creatorEmail) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Package size={40} color="#9ca3af" />
          </View>
          <Text className="text-black text-xl font-bold mb-2 text-center">
            Not Logged In
          </Text>
          <Text className="text-gray-500 text-base text-center mb-8">
            Please sign up as a creator to access the dashboard.
          </Text>
          <PillButton
            title="Go Back"
            onPress={() => router.replace("/")}
            variant="black"
          />
        </View>
      </SafeAreaView>
    );
  }

  // If creator profile not found
  if (!myCreator) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Package size={40} color="#9ca3af" />
          </View>
          <Text className="text-black text-xl font-bold mb-2 text-center">
            Profile Not Found
          </Text>
          <Text className="text-gray-500 text-base text-center mb-8">
            Your creator profile couldn't be loaded. Please try again.
          </Text>
          <PillButton
            title="Logout"
            onPress={handleLogout}
            variant="white"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Image
                source={{ uri: myCreator.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" }}
                className="w-14 h-14 rounded-full mr-3"
                resizeMode="cover"
              />
              <View>
                <Text className="text-gray-500 text-sm">Welcome back,</Text>
                <Text className="text-black text-xl font-bold">
                  {myCreator.name}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleLogout}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <LogOut size={20} color="#000" />
            </Pressable>
          </View>
        </View>

        {/* Stats */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="px-5 mb-6"
        >
          <View className="flex-row">
            <View
              className="flex-1 bg-black rounded-2xl p-4 mr-2"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <DollarSign size={24} color="#fff" />
              <Text className="text-white text-2xl font-bold mt-2">
                ${totalEarnings}
              </Text>
              <Text className="text-gray-400 text-sm">Total Earnings</Text>
            </View>

            <View
              className="flex-1 bg-gray-50 rounded-2xl p-4 ml-2"
              style={{
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
              }}
            >
              <Calendar size={24} color="#000" />
              <Text className="text-black text-2xl font-bold mt-2">
                {availableSlots}
              </Text>
              <Text className="text-gray-500 text-sm">Available Slots</Text>
            </View>
          </View>
        </Animated.View>

        {/* Pending Bookings Alert */}
        {pendingBookings.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            className="px-5 mb-6"
          >
            <Pressable onPress={handleViewBookings}>
              <View
                className="rounded-2xl bg-yellow-50 p-4 flex-row items-center"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(202, 138, 4, 0.2)",
                }}
              >
                <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                  <Clock size={20} color="#ca8a04" />
                </View>
                <View className="flex-1">
                  <Text className="text-black font-semibold">
                    {pendingBookings.length} Pending Booking
                    {pendingBookings.length > 1 ? "s" : ""}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Tap to view and upload proof
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="px-5 mb-6"
        >
          <Text className="text-black font-semibold text-base mb-4">
            Quick Actions
          </Text>

          <PillButton
            title="Manage Ad Slots"
            onPress={handleManageSlots}
            variant="black"
            size="lg"
            className="mb-3"
          />

          <PillButton
            title="View Bookings"
            onPress={handleViewBookings}
            variant="white"
            size="lg"
          />
        </Animated.View>

        {/* Recent Bookings Preview */}
        {myBookings.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            className="px-5"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-black font-semibold text-base">
                Recent Bookings
              </Text>
              <Pressable onPress={handleViewBookings}>
                <Text className="text-gray-500 text-sm">View All</Text>
              </Pressable>
            </View>

            {myBookings.slice(0, 3).map((booking) => (
              <View
                key={booking.id}
                className="rounded-xl bg-gray-50 p-4 mb-3 flex-row items-center justify-between"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              >
                <View>
                  <Text className="text-black font-medium">
                    {booking.business_name}
                  </Text>
                  <Text className="text-gray-500 text-sm capitalize">
                    {booking.slot_type} • {formatDate(booking.date)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-black font-bold">${booking.price}</Text>
                  <Text
                    className={`text-xs ${
                      booking.status === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
