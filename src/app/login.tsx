import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, User, Mail, Trash2 } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import useAppStore, { UserRole } from "@/lib/state/app-store";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const logout = useAppStore((s) => s.logout);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

  // Auth store for creator login
  const loginCreator = useAuthStore((s) => s.loginCreator);
  const logoutCreator = useAuthStore((s) => s.logoutCreator);
  const creatorId = useAuthStore((s) => s.creatorId);
  const creatorName = useAuthStore((s) => s.creatorName);
  const creatorEmail = useAuthStore((s) => s.creatorEmail);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("creator");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // For creators, check if they exist in the database
      if (selectedRole === "creator") {
        const { data: existingCreator, error } = await supabase
          .from("creators")
          .select("*")
          .eq("email", email.trim())
          .single();

        if (existingCreator && !error) {
          // Found existing creator - log them in
          loginCreator(existingCreator.id, existingCreator.email, existingCreator.name);
          login(existingCreator.email, "creator", existingCreator.name);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/creator");
          return;
        } else {
          // No creator found with this email - send to onboarding
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.push("/creator-onboard");
          return;
        }
      }

      // For business/admin, use local auth
      if (name.trim()) {
        login(email.trim(), selectedRole, name.trim());
        if (selectedRole === "business") {
          router.replace("/business");
        } else if (selectedRole === "admin") {
          router.replace("/admin");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    logoutCreator();
    router.replace("/home");
  };

  const handleDeleteAccount = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // Clear all stored data
    await AsyncStorage.clear();
    logout();
    logoutCreator();
    router.replace("/home");
  };

  // If already logged in, show account screen
  if ((isAuthenticated && currentUser) || creatorId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6">
          {/* Header */}
          <Pressable onPress={() => router.back()} className="py-4 -ml-2">
            <ArrowLeft size={24} color="#000" />
          </Pressable>

          <Animated.View entering={FadeInDown.duration(400)} className="flex-1">
            <Text className="text-black text-2xl font-bold mb-2">
              Your Account
            </Text>
            <Text className="text-gray-500 text-base mb-8">
              Manage your LOCO•MOTION account
            </Text>

            {/* User Info */}
            <View
              className="bg-gray-50 rounded-2xl p-5 mb-6"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            >
              <View className="flex-row items-center mb-4">
                <View className="w-14 h-14 bg-black rounded-full items-center justify-center mr-4">
                  <User size={28} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-black text-lg font-bold">
                    {currentUser?.name ?? creatorName ?? "User"}
                  </Text>
                  <Text className="text-gray-500 text-sm">{currentUser?.email ?? creatorEmail ?? ""}</Text>
                </View>
              </View>
              <View className="bg-black/5 rounded-xl px-4 py-2">
                <Text className="text-gray-600 text-sm text-center capitalize">
                  {currentUser?.role ?? "Creator"} Account
                </Text>
              </View>
            </View>

            <View className="flex-1" />

            {/* Actions */}
            <View className="pb-6">
              <PillButton
                title="Log Out"
                onPress={handleLogout}
                variant="white"
                size="lg"
              />

              <Pressable
                onPress={handleDeleteAccount}
                className="mt-4 py-4 flex-row items-center justify-center"
              >
                <Trash2 size={18} color="#ef4444" />
                <Text className="text-red-500 font-medium ml-2">
                  Delete Account & Clear Data
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Login / Sign Up form
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6">
            {/* Header */}
            <Pressable onPress={() => router.back()} className="py-4 -ml-2">
              <ArrowLeft size={24} color="#000" />
            </Pressable>

            <Animated.View entering={FadeInDown.duration(400)} className="flex-1">
              <Text className="text-black text-2xl font-bold mb-2">
                Sign In / Create Account
              </Text>
              <Text className="text-gray-500 text-base mb-8">
                Enter your details to continue
              </Text>

              {/* Role Selection */}
              <Text className="text-black font-medium mb-3">I am a...</Text>
              <View className="flex-row mb-6">
                {(["business", "creator", "admin"] as UserRole[]).map((role) => (
                  <Pressable
                    key={role}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedRole(role);
                    }}
                    className="mr-3"
                  >
                    <View
                      className={`px-4 py-2 rounded-full ${
                        selectedRole === role ? "bg-black" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`font-medium capitalize ${
                          selectedRole === role ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {role}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Input Fields */}
              <Text className="text-black font-medium mb-2">Name</Text>
              <View
                className="flex-row items-center bg-gray-50 rounded-xl px-4 mb-4"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
              >
                <User size={18} color="#9ca3af" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name or business name"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 py-4 ml-3 text-black text-base"
                />
              </View>

              <Text className="text-black font-medium mb-2">Email</Text>
              <View
                className="flex-row items-center bg-gray-50 rounded-xl px-4 mb-8"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
              >
                <Mail size={18} color="#9ca3af" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 py-4 ml-3 text-black text-base"
                />
              </View>

              <View className="flex-1" />

              {/* Login Button */}
              <View className="pb-6">
                <PillButton
                  title="Continue"
                  onPress={handleLogin}
                  variant="black"
                  size="lg"
                  disabled={!name.trim() || !email.trim()}
                />

                <Text className="text-gray-400 text-xs text-center mt-4">
                  By continuing, you agree to our Terms of Service
                </Text>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
