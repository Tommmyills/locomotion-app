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
import { ArrowLeft, Mail, User, Trash2, Sparkles, Building2 } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import useAppStore from "@/lib/state/app-store";
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
  const businessName = useAuthStore((s) => s.businessName);
  const businessEmail = useAuthStore((s) => s.businessEmail);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setError("");

    try {
      // First check if this email belongs to a creator
      const { data: existingCreator, error: creatorError } = await supabase
        .from("creators")
        .select("*")
        .eq("email", email.trim())
        .single();

      if (existingCreator && !creatorError) {
        // Found existing creator - log them in
        loginCreator(existingCreator.id, existingCreator.email, existingCreator.name);
        login(existingCreator.email, "creator", existingCreator.name);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/creator");
        return;
      }

      // Check if they have business info saved
      const savedBusinessEmail = await AsyncStorage.getItem("locomotion-auth");
      if (savedBusinessEmail) {
        try {
          const parsed = JSON.parse(savedBusinessEmail);
          if (parsed?.state?.businessEmail === email.trim()) {
            login(email.trim(), "business", parsed.state.businessName || "Business");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/business");
            return;
          }
        } catch {
          // Ignore parse errors
        }
      }

      // No account found
      setError("No account found with this email. Please sign up first.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
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
    await AsyncStorage.clear();
    logout();
    logoutCreator();
    router.replace("/home");
  };

  // If already logged in, show account screen
  if ((isAuthenticated && currentUser) || creatorId) {
    const displayName = creatorName || currentUser?.name || businessName || "User";
    const displayEmail = creatorEmail || currentUser?.email || businessEmail || "";
    const accountType = creatorId ? "Creator" : currentUser?.role || "User";

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
                  {creatorId ? (
                    <Sparkles size={28} color="#fff" />
                  ) : (
                    <Building2 size={28} color="#fff" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-black text-lg font-bold">
                    {displayName}
                  </Text>
                  <Text className="text-gray-500 text-sm">{displayEmail}</Text>
                </View>
              </View>
              <View className="bg-black/5 rounded-xl px-4 py-2">
                <Text className="text-gray-600 text-sm text-center capitalize">
                  {accountType} Account
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

  // Login form
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
                Welcome Back
              </Text>
              <Text className="text-gray-500 text-base mb-8">
                Sign in with your email to continue
              </Text>

              {/* Email Input */}
              <Text className="text-black font-medium mb-2">Email</Text>
              <View
                className="flex-row items-center bg-gray-50 rounded-xl px-4 mb-4"
                style={{ borderWidth: 1, borderColor: error ? "#ef4444" : "rgba(0,0,0,0.05)" }}
              >
                <Mail size={18} color={error ? "#ef4444" : "#9ca3af"} />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  placeholder="your@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 py-4 ml-3 text-black text-base"
                />
              </View>

              {/* Error Message */}
              {error ? (
                <View className="mb-4">
                  <Text className="text-red-500 text-sm">{error}</Text>
                </View>
              ) : null}

              <View className="flex-1" />

              {/* Sign In Button */}
              <View className="pb-6">
                <PillButton
                  title={isLoading ? "Signing in..." : "Sign In"}
                  onPress={handleLogin}
                  variant="black"
                  size="lg"
                  disabled={!email.trim() || isLoading}
                />

                {/* Sign Up Link */}
                <View className="mt-6 items-center">
                  <Text className="text-gray-500 text-sm mb-3">
                    Don't have an account?
                  </Text>
                  <View className="flex-row">
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push("/creator-onboard");
                      }}
                      className="mr-4"
                    >
                      <Text className="text-black font-semibold">
                        Sign up as Creator
                      </Text>
                    </Pressable>
                    <Text className="text-gray-300">|</Text>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push("/business-onboard");
                      }}
                      className="ml-4"
                    >
                      <Text className="text-black font-semibold">
                        Sign up as Business
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
