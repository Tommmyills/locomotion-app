import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Mail, ArrowRight } from "lucide-react-native";
import { authClient } from "@/lib/auth/auth-client";
import * as Haptics from "expo-haptics";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "sign-in",
      });

      if (result.error) {
        setError(result.error.message || "Failed to send verification code");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push({ pathname: "/verify-otp", params: { email: email.trim().toLowerCase() } });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = email.trim().includes("@") && email.trim().includes(".");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          <Animated.View entering={FadeInDown.duration(400)}>
            {/* Logo/Title */}
            <Text className="text-black text-4xl font-bold tracking-tight mb-2">
              LOCO•MOTION
            </Text>
            <Text className="text-gray-500 text-lg mb-10">
              Sign in to continue
            </Text>

            {/* Email Input */}
            <Text className="text-black font-medium mb-2">Email</Text>
            <View
              className="flex-row items-center bg-gray-50 rounded-2xl px-4 mb-4"
              style={{
                borderWidth: 1,
                borderColor: error ? "#ef4444" : "rgba(0,0,0,0.05)",
              }}
            >
              <Mail size={20} color="#9ca3af" />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                placeholder="your@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                className="flex-1 py-4 ml-3 text-black text-lg"
                editable={!isLoading}
              />
            </View>

            {/* Error Message */}
            {error && (
              <Text className="text-red-500 text-sm mb-4">{error}</Text>
            )}

            {/* Send Code Button */}
            <Pressable
              onPress={handleSendOTP}
              disabled={!isValidEmail || isLoading}
              className="mt-4"
            >
              <View
                className={`rounded-2xl py-4 flex-row items-center justify-center ${
                  isValidEmail && !isLoading ? "bg-black" : "bg-gray-200"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isValidEmail ? 0.15 : 0,
                  shadowRadius: 12,
                  elevation: isValidEmail ? 4 : 0,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text
                      className={`text-lg font-semibold mr-2 ${
                        isValidEmail ? "text-white" : "text-gray-400"
                      }`}
                    >
                      Send Code
                    </Text>
                    <ArrowRight size={20} color={isValidEmail ? "#fff" : "#9ca3af"} />
                  </>
                )}
              </View>
            </Pressable>

            {/* Info Text */}
            <Text className="text-gray-400 text-sm text-center mt-6">
              We'll send a 6-digit code to your email
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
