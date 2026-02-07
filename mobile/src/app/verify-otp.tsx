import React, { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, CheckCircle } from "lucide-react-native";
import { OtpInput } from "react-native-otp-entry";
import { authClient } from "@/lib/auth/auth-client";
import * as Haptics from "expo-haptics";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleVerifyOTP = async (otp: string) => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await authClient.signIn.emailOtp({
        email: email?.trim() || "",
        otp,
      });

      if (result.error) {
        setError(result.error.message || "Invalid verification code");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsLoading(false);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Stack.Protected will automatically navigate to (app) routes
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email?.trim() || "",
        type: "sign-in",
      });

      if (result.error) {
        setError(result.error.message || "Failed to resend code");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-5 py-4">
          <Pressable onPress={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft size={24} color="#000" />
          </Pressable>
        </View>

        <View className="flex-1 px-6">
          <Animated.View entering={FadeInDown.duration(400)}>
            {/* Icon */}
            <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-6">
              <CheckCircle size={32} color="#fff" />
            </View>

            {/* Title */}
            <Text className="text-black text-2xl font-bold mb-2">
              Enter verification code
            </Text>
            <Text className="text-gray-500 text-base mb-8">
              We sent a 6-digit code to{"\n"}
              <Text className="text-black font-medium">{email}</Text>
            </Text>

            {/* OTP Input */}
            <View className="mb-6">
              <OtpInput
                numberOfDigits={6}
                onFilled={handleVerifyOTP}
                type="numeric"
                focusColor="#000"
                disabled={isLoading}
                theme={{
                  containerStyle: {
                    gap: 8,
                  },
                  pinCodeContainerStyle: {
                    backgroundColor: "#f9fafb",
                    borderWidth: 1,
                    borderColor: error ? "#ef4444" : "rgba(0,0,0,0.05)",
                    borderRadius: 12,
                    width: 48,
                    height: 56,
                  },
                  pinCodeTextStyle: {
                    fontSize: 24,
                    fontWeight: "600",
                    color: "#000",
                  },
                  focusedPinCodeContainerStyle: {
                    borderColor: "#000",
                    borderWidth: 2,
                  },
                }}
              />
            </View>

            {/* Error Message */}
            {error && (
              <Text className="text-red-500 text-sm text-center mb-4">{error}</Text>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <View className="items-center mb-4">
                <ActivityIndicator size="large" color="#000" />
                <Text className="text-gray-500 mt-2">Verifying...</Text>
              </View>
            )}

            {/* Resend Code */}
            <View className="items-center mt-4">
              <Text className="text-gray-400 text-sm mb-2">
                Didn't receive the code?
              </Text>
              <Pressable onPress={handleResendCode} disabled={isResending}>
                <Text className={`font-semibold ${isResending ? "text-gray-400" : "text-black"}`}>
                  {isResending ? "Sending..." : "Resend Code"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
