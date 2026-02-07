import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  CheckCircle,
  Users,
  Zap,
  Shield,
} from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { useAuthStore } from "@/lib/auth-store";
import useAppStore from "@/lib/state/app-store";
import * as Haptics from "expo-haptics";

export default function BusinessOnboardScreen() {
  const router = useRouter();
  const setBusinessInfo = useAuthStore((s) => s.setBusinessInfo);
  const appStoreLogin = useAppStore((s) => s.login);

  // Get existing info from auth store (in case they're already a creator)
  const existingCreatorEmail = useAuthStore((s) => s.creatorEmail);
  const existingCreatorName = useAuthStore((s) => s.creatorName);
  const existingBusinessEmail = useAuthStore((s) => s.businessEmail);
  const existingBusinessName = useAuthStore((s) => s.businessName);

  // Pre-fill with existing info if available
  const [businessName, setBusinessName] = useState(existingBusinessName || "");
  const [email, setEmail] = useState(existingBusinessEmail || existingCreatorEmail || "");
  const [location, setLocation] = useState("");

  const handleContinue = () => {
    if (!businessName.trim() || !email.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save business info
    setBusinessInfo(email.trim(), businessName.trim());
    appStoreLogin(email.trim(), "business", businessName.trim());

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Go to business dashboard (browse creators)
    router.replace("/business");
  };

  const handleBack = () => {
    router.back();
  };

  const isValid = businessName.trim().length > 0 && email.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-5 py-4 flex-row items-center">
          <Pressable onPress={handleBack} className="p-1 -ml-1">
            <ArrowLeft size={24} color="#000" />
          </Pressable>
          <View className="flex-1 items-center pr-6">
            <Text className="text-gray-400 text-xs uppercase tracking-wider">
              Quick Setup
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(400)} className="mt-4">
            {/* Icon */}
            <View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center mb-4">
              <Building2 size={32} color="#000" />
            </View>

            {/* Title */}
            <Text className="text-black text-2xl font-bold mb-2">
              Set Up Your Business
            </Text>
            <Text className="text-gray-500 text-base mb-8">
              Add your info to start booking local creators instantly.
            </Text>

            {/* Business Name */}
            <Text className="text-black font-medium mb-2">Business Name</Text>
            <View
              className="flex-row items-center bg-gray-50 rounded-xl px-4 mb-4"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            >
              <Building2 size={18} color="#9ca3af" />
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Downtown Coffee Co."
                placeholderTextColor="#9ca3af"
                className="flex-1 py-4 ml-3 text-black text-base"
              />
            </View>

            {/* Email */}
            <Text className="text-black font-medium mb-2">Email</Text>
            <View
              className="flex-row items-center bg-gray-50 rounded-xl px-4 mb-4"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            >
              <Mail size={18} color="#9ca3af" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@business.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 py-4 ml-3 text-black text-base"
              />
            </View>

            {/* Location (optional) */}
            <Text className="text-black font-medium mb-2">
              Location <Text className="text-gray-400">(optional)</Text>
            </Text>
            <View
              className="flex-row items-center bg-gray-50 rounded-xl px-4 mb-8"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            >
              <MapPin size={18} color="#9ca3af" />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Old Town, Albuquerque"
                placeholderTextColor="#9ca3af"
                className="flex-1 py-4 ml-3 text-black text-base"
              />
            </View>

            {/* Benefits */}
            <View
              className="bg-gray-50 rounded-2xl p-4 mb-8"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            >
              <Text className="text-black font-semibold mb-3">
                What you get
              </Text>

              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Users size={16} color="#16a34a" />
                </View>
                <Text className="text-gray-600 text-sm flex-1">
                  Access to verified local creators
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Zap size={16} color="#16a34a" />
                </View>
                <Text className="text-gray-600 text-sm flex-1">
                  Book instantly with fixed prices
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Shield size={16} color="#16a34a" />
                </View>
                <Text className="text-gray-600 text-sm flex-1">
                  Proof of posting guaranteed
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* CTA */}
          <View className="pb-8">
            <PillButton
              title="Start Browsing Creators"
              onPress={handleContinue}
              variant="black"
              size="lg"
              disabled={!isValid}
            />

            <Text className="text-gray-400 text-xs text-center mt-4">
              You can update your info anytime from settings
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
