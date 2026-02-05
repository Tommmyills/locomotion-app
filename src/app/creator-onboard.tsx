import React, { useState } from "react";
import { View, Text, Pressable, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Instagram, ArrowLeft, CheckCircle, Users, DollarSign, Sparkles, Clock, Image as ImageIcon, Film, Camera } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { LaserButton } from "@/components/LaserButton";
import { useCreateCreator, useCreateSlots, useCreatorByEmail } from "@/lib/db-hooks";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth-store";
import useAppStore from "@/lib/state/app-store";
import * as Haptics from "expo-haptics";

type OnboardStep = "info" | "confirm" | "pricing";

// Default placeholder for creators who don't add a photo yet
const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400";

export default function CreatorOnboardScreen() {
  const router = useRouter();
  const loginCreator = useAuthStore((s) => s.loginCreator);
  const appStoreLogin = useAppStore((s) => s.login);

  // Get existing info from auth store (in case they're already a business)
  const existingCreatorEmail = useAuthStore((s) => s.creatorEmail);
  const existingBusinessEmail = useAuthStore((s) => s.businessEmail);

  const [step, setStep] = useState<OnboardStep>("info");

  // Step 1: Creator enters their real info
  const [email, setEmail] = useState(existingCreatorEmail || existingBusinessEmail || "");
  const [name, setName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleContinueToConfirm = () => {
    if (!email.trim() || !name.trim() || !instagramHandle.trim() || !followerCount.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep("confirm");
  };

  const handleConfirmProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("pricing");
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("info");
    } else if (step === "pricing") {
      setStep("confirm");
    } else {
      router.back();
    }
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Parse follower count from user input
  const parseFollowerCount = (input: string): number => {
    const cleaned = input.replace(/[^0-9]/g, "");
    return parseInt(cleaned, 10) || 0;
  };

  // Format the Instagram handle
  const formatHandle = (handle: string): string => {
    const cleaned = handle.replace("@", "").trim();
    return cleaned ? `@${cleaned}` : "";
  };

  const parsedFollowers = parseFollowerCount(followerCount);
  const formattedHandle = formatHandle(instagramHandle);
  const displayPhoto = photoUrl.trim() || DEFAULT_PHOTO;

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
              {step === "info" && "Step 1 of 3"}
              {step === "confirm" && "Step 2 of 3"}
              {step === "pricing" && "Step 3 of 3"}
            </Text>
          </View>
        </View>

        {/* Step 1: Enter Info */}
        {step === "info" && (
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Animated.View entering={FadeInDown.duration(400)} className="mt-4">
              <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-4">
                <Instagram size={32} color="#fff" />
              </View>

              <Text className="text-black text-2xl font-bold mb-2">
                Join as a Creator
              </Text>
              <Text className="text-gray-500 text-base mb-6">
                Enter your info to start earning from local businesses.
              </Text>

              {/* Name */}
              <Text className="text-black font-medium mb-2">Your Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Sofia Martinez"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                className="bg-gray-50 rounded-xl px-4 py-4 text-black text-lg mb-4"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              />

              {/* Email */}
              <Text className="text-black font-medium mb-2">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-gray-50 rounded-xl px-4 py-4 text-black text-lg mb-4"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              />

              {/* Instagram Handle */}
              <Text className="text-black font-medium mb-2">Instagram Handle</Text>
              <TextInput
                value={instagramHandle}
                onChangeText={setInstagramHandle}
                placeholder="@yourhandle"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-gray-50 rounded-xl px-4 py-4 text-black text-lg mb-4"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              />

              {/* Follower Count */}
              <Text className="text-black font-medium mb-2">Follower Count</Text>
              <TextInput
                value={followerCount}
                onChangeText={setFollowerCount}
                placeholder="25000"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                className="bg-gray-50 rounded-xl px-4 py-4 text-black text-lg mb-4"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              />

              {/* Photo URL */}
              <Text className="text-black font-medium mb-2">Profile Photo URL <Text className="text-gray-400 font-normal">(optional)</Text></Text>
              <TextInput
                value={photoUrl}
                onChangeText={setPhotoUrl}
                placeholder="https://..."
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-gray-50 rounded-xl px-4 py-4 text-black text-lg mb-2"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              />
              <Text className="text-gray-400 text-xs mb-6">
                Paste a link to your profile photo. You can use your Instagram profile picture URL.
              </Text>
            </Animated.View>

            <View className="pb-8">
              <PillButton
                title="Continue"
                onPress={handleContinueToConfirm}
                variant="black"
                size="lg"
                disabled={!email.trim() || !name.trim() || !instagramHandle.trim() || !followerCount.trim() || parsedFollowers < 100}
              />
              {parsedFollowers > 0 && parsedFollowers < 100 && (
                <Text className="text-red-500 text-xs text-center mt-2">
                  Minimum 100 followers required
                </Text>
              )}
            </View>
          </ScrollView>
        )}

        {/* Step 2: Confirm Profile */}
        {step === "confirm" && (
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(400)} className="mt-4">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={20} color="#16a34a" />
                <Text className="text-green-600 text-sm font-medium ml-2">Profile Ready</Text>
              </View>

              <Text className="text-black text-2xl font-bold mb-6">
                Confirm Your Profile
              </Text>

              {/* Profile Card */}
              <View
                className="bg-white rounded-3xl p-6 mb-6"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 16,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              >
                <View className="items-center mb-4">
                  <Image
                    source={{ uri: displayPhoto }}
                    className="w-24 h-24 rounded-full mb-3"
                    resizeMode="cover"
                  />
                  <Text className="text-black text-xl font-bold">{name}</Text>
                  <Text className="text-gray-500">{formattedHandle}</Text>
                </View>

                <View className="flex-row justify-around py-4 border-t border-gray-100">
                  <View className="items-center">
                    <Text className="text-black text-xl font-bold">{formatFollowers(parsedFollowers)}</Text>
                    <Text className="text-gray-500 text-sm">Followers</Text>
                  </View>
                </View>
              </View>

              <Text className="text-gray-400 text-sm text-center mb-8">
                This is how businesses will see your profile
              </Text>
            </Animated.View>

            <View className="pb-8">
              <PillButton
                title="Looks Good, Continue"
                onPress={handleConfirmProfile}
                variant="black"
                size="lg"
              />
              <Pressable onPress={() => setStep("info")} className="mt-4 py-2">
                <Text className="text-gray-500 text-center">Edit my info</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* Step 3: Pricing */}
        {step === "pricing" && (
          <CreatorPricingStep
            name={name}
            email={email}
            instagramHandle={formattedHandle}
            followerCount={parsedFollowers}
            photoUrl={displayPhoto}
            onComplete={(creatorId) => {
              loginCreator(creatorId, email, name);
              appStoreLogin(email, "creator", name);
              router.replace("/creator");
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Pricing setup component
function CreatorPricingStep({
  name,
  email,
  instagramHandle,
  followerCount,
  photoUrl,
  onComplete,
}: {
  name: string;
  email: string;
  instagramHandle: string;
  followerCount: number;
  photoUrl: string;
  onComplete: (creatorId: string) => void;
}) {
  const createCreator = useCreateCreator();
  const createSlots = useCreateSlots();

  const [storyPrice, setStoryPrice] = useState(50);
  const [postPrice, setPostPrice] = useState(100);
  const [reelPrice, setReelPrice] = useState(150);

  // Suggested price ranges based on follower count
  const getSuggestedRange = (type: "story" | "post" | "reel") => {
    const base = followerCount / 1000;
    switch (type) {
      case "story":
        return { min: Math.max(25, Math.floor(base * 0.8)), max: Math.floor(base * 2) };
      case "post":
        return { min: Math.max(50, Math.floor(base * 1.5)), max: Math.floor(base * 4) };
      case "reel":
        return { min: Math.max(75, Math.floor(base * 2)), max: Math.floor(base * 6) };
    }
  };

  const storyRange = getSuggestedRange("story");
  const postRange = getSuggestedRange("post");
  const reelRange = getSuggestedRange("reel");

  const handleGoLive = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // First check if creator with this email already exists
      const { data: existingCreator, error: fetchError } = await supabase
        .from("creators")
        .select("*")
        .eq("email", email)
        .single();

      if (existingCreator && !fetchError) {
        // Creator already exists, just log them in
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete(existingCreator.id);
        return;
      }

      // Create creator in database
      const creator = await createCreator.mutateAsync({
        email: email,
        name: name,
        instagram_handle: instagramHandle,
        photo: photoUrl,
        follower_count: followerCount,
        engagement_rate: 0, // Can be added later
        bio: `${instagramHandle} on Instagram`,
        story_price: storyPrice,
        post_price: postPrice,
        reel_price: reelPrice,
      });

      // Create initial ad slots
      const today = new Date();
      const slots = [
        {
          creator_id: creator.id,
          type: "story" as const,
          price: storyPrice,
          date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
          creator_id: creator.id,
          type: "post" as const,
          price: postPrice,
          date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
          creator_id: creator.id,
          type: "reel" as const,
          price: reelPrice,
          date: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
      ];

      await createSlots.mutateAsync(slots);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(creator.id);
    } catch (error) {
      console.error("Error creating creator:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const isSubmitting = createCreator.isPending || createSlots.isPending;

  return (
    <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(400)} className="mt-4">
        <View className="w-12 h-12 bg-black rounded-xl items-center justify-center mb-4">
          <DollarSign size={24} color="#fff" />
        </View>

        <Text className="text-black text-2xl font-bold mb-2">
          Set Your Prices
        </Text>
        <Text className="text-gray-500 text-base mb-6">
          Choose what to charge for each type of post.
        </Text>

        {/* Story Pricing */}
        <PricingCard
          label="Instagram Story"
          description="24-hour visibility"
          icon={<Clock size={20} color="#000" />}
          value={storyPrice}
          onChange={setStoryPrice}
          suggestedMin={storyRange.min}
          suggestedMax={storyRange.max}
        />

        {/* Post Pricing */}
        <PricingCard
          label="Instagram Post"
          description="Permanent feed post"
          icon={<ImageIcon size={20} color="#000" />}
          value={postPrice}
          onChange={setPostPrice}
          suggestedMin={postRange.min}
          suggestedMax={postRange.max}
        />

        {/* Reel Pricing */}
        <PricingCard
          label="Instagram Reel"
          description="Short-form video"
          icon={<Film size={20} color="#000" />}
          value={reelPrice}
          onChange={setReelPrice}
          suggestedMin={reelRange.min}
          suggestedMax={reelRange.max}
        />

        {/* Earnings Preview */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <View
            className="bg-gray-50 rounded-2xl p-4 mb-6"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <Text className="text-gray-500 text-sm mb-2">If you complete 4 bookings/week:</Text>
            <Text className="text-black text-2xl font-bold">
              ${Math.round(((storyPrice + postPrice + reelPrice) / 3) * 4 * 4)}/month
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Estimated potential earnings</Text>
          </View>
        </Animated.View>
      </Animated.View>

      <View className="pb-8">
        <PillButton
          title={isSubmitting ? "Going Live..." : "Go Live & Start Earning"}
          onPress={handleGoLive}
          variant="black"
          size="lg"
          disabled={isSubmitting}
        />
        <Text className="text-gray-400 text-xs text-center mt-4">
          You can update prices anytime from your dashboard
        </Text>
      </View>
    </ScrollView>
  );
}

// Pricing card component
function PricingCard({
  label,
  description,
  icon,
  value,
  onChange,
  suggestedMin,
  suggestedMax,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  suggestedMin: number;
  suggestedMax: number;
}) {
  const absoluteMin = 5;
  const absoluteMax = 1000;

  const handleDecrease = () => {
    const newValue = Math.max(absoluteMin, value - 25);
    onChange(newValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleIncrease = () => {
    const newValue = Math.min(absoluteMax, value + 25);
    onChange(newValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View
      className="mb-4 bg-white rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-black font-semibold text-base">{label}</Text>
          <Text className="text-gray-400 text-xs">{description}</Text>
        </View>
      </View>

      {/* Price Control */}
      <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-2">
        {/* Minus Button */}
        <LaserButton onPress={handleDecrease} variant="white" size={56} borderRadius={12}>
          <Text className="text-2xl font-bold text-gray-400">−</Text>
        </LaserButton>

        {/* Price Display */}
        <View className="flex-1 items-center">
          <Text className="text-black text-4xl font-bold">${value}</Text>
          <Text className="text-gray-400 text-xs mt-1">
            ${suggestedMin} - ${suggestedMax} suggested
          </Text>
        </View>

        {/* Plus Button */}
        <LaserButton onPress={handleIncrease} variant="black" size={56} borderRadius={12}>
          <Text className="text-2xl font-bold text-white">+</Text>
        </LaserButton>
      </View>
    </View>
  );
}
