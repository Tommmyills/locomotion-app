import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Users, Calendar, LogOut, AlertCircle, CheckCircle } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import useAppStore from "@/lib/state/app-store";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const creators = useAppStore((s) => s.creators);
  const bookings = useAppStore((s) => s.bookings);
  const logout = useAppStore((s) => s.logout);

  const pendingCreators = creators.filter((c) => !c.approved);
  const approvedCreators = creators.filter((c) => c.approved);
  const pendingBookings = bookings.filter((b) => b.status === "pending" && b.proofUrl);
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const handleManageCreators = () => {
    router.push("/admin/creators");
  };

  const handleManageBookings = () => {
    router.push("/admin/bookings");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-500 text-sm">Admin Dashboard</Text>
              <Text className="text-black text-xl font-bold">
                {currentUser?.name || "Admin"}
              </Text>
            </View>
            <Pressable
              onPress={handleLogout}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <LogOut size={20} color="#000" />
            </Pressable>
          </View>
        </View>

        {/* Stats Grid */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="px-5 mb-6"
        >
          <View className="flex-row mb-3">
            <View
              className="flex-1 bg-black rounded-2xl p-4 mr-1.5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Users size={24} color="#fff" />
              <Text className="text-white text-2xl font-bold mt-2">
                {approvedCreators.length}
              </Text>
              <Text className="text-gray-400 text-sm">Active Creators</Text>
            </View>

            <View
              className="flex-1 bg-gray-50 rounded-2xl p-4 ml-1.5"
              style={{
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
              }}
            >
              <Calendar size={24} color="#000" />
              <Text className="text-black text-2xl font-bold mt-2">
                {totalBookings}
              </Text>
              <Text className="text-gray-500 text-sm">Total Bookings</Text>
            </View>
          </View>

          <View className="flex-row">
            <View
              className="flex-1 bg-gray-50 rounded-2xl p-4 mr-1.5"
              style={{
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
              }}
            >
              <CheckCircle size={24} color="#16a34a" />
              <Text className="text-black text-2xl font-bold mt-2">
                {completedBookings}
              </Text>
              <Text className="text-gray-500 text-sm">Completed</Text>
            </View>

            <View
              className="flex-1 bg-gray-50 rounded-2xl p-4 ml-1.5"
              style={{
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
              }}
            >
              <AlertCircle size={24} color="#ca8a04" />
              <Text className="text-black text-2xl font-bold mt-2">
                {pendingBookings.length}
              </Text>
              <Text className="text-gray-500 text-sm">Awaiting Review</Text>
            </View>
          </View>
        </Animated.View>

        {/* Alerts */}
        {(pendingCreators.length > 0 || pendingBookings.length > 0) && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            className="px-5 mb-6"
          >
            <Text className="text-black font-semibold text-base mb-4">
              Needs Attention
            </Text>

            {pendingCreators.length > 0 && (
              <Pressable onPress={handleManageCreators} className="mb-3">
                <View
                  className="rounded-2xl bg-yellow-50 p-4 flex-row items-center"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(202, 138, 4, 0.2)",
                  }}
                >
                  <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                    <Users size={20} color="#ca8a04" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-black font-semibold">
                      {pendingCreators.length} Creator
                      {pendingCreators.length > 1 ? "s" : ""} Pending Approval
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Review and approve new creators
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}

            {pendingBookings.length > 0 && (
              <Pressable onPress={handleManageBookings}>
                <View
                  className="rounded-2xl bg-blue-50 p-4 flex-row items-center"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Calendar size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-black font-semibold">
                      {pendingBookings.length} Booking
                      {pendingBookings.length > 1 ? "s" : ""} With Proof
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Review and mark as complete
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="px-5"
        >
          <Text className="text-black font-semibold text-base mb-4">
            Manage
          </Text>

          <PillButton
            title="Manage Creators"
            onPress={handleManageCreators}
            variant="black"
            size="lg"
            className="mb-3"
          />

          <PillButton
            title="Manage Bookings"
            onPress={handleManageBookings}
            variant="white"
            size="lg"
          />
        </Animated.View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
