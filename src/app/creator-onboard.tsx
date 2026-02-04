import React, { useState } from "react";
import { View, Text, Pressable, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Instagram, ArrowLeft, CheckCircle, Users, BarChart3, Sparkles } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { useCreateCreator, useCreateSlots } from "@/lib/db-hooks";
import { useAuthStore } from "@/lib/auth-store";
import * as Haptics from "expo-haptics";

type OnboardStep = "connect" | "confirm" | "pricing";

// Placeholder photos for demo
const placeholderPhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
];

export default function CreatorOnboardScreen() {
  const router = useRouter();
  const loginCreator = useAuthStore((s) => s.loginCreator);

  const [step, setStep] = useState<OnboardStep>("connect");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [email, setEmail] = useState("");
  const [igData, setIgData] = useState<{
    handle: string;
    name: string;
    photo: string;
    followers: number;
    engagement: string;
    posts: number;
  } | null>(null);

  const handleConnectInstagram = () => {
    if (!instagramHandle.trim() || !email.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Generate profile from handle
    const handle = instagramHandle.startsWith("@") ? instagramHandle : `@${instagramHandle}`;
    const name = instagramHandle.replace("@", "").split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const followers = Math.floor(Math.random() * 50000) + 5000;
    const engagement = (Math.random() * 3 + 2).toFixed(1);
    const posts = Math.floor(Math.random() * 200) + 50;
    const photo = placeholderPhotos[Math.floor(Math.random() * placeholderPhotos.length)];

    setIgData({ handle, name, photo, followers, engagement, posts });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep("confirm");
  };

  const handleConfirmProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("pricing");
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("connect");
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
              {step === "connect" && "Step 1 of 2"}
              {step === "confirm" && "Step 1 of 2"}
              {step === "pricing" && "Step 2 of 2"}
            </Text>
          </View>
        </View>

        {/* Connect Instagram Step */}
        {step === "connect" && (
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(400)} className="mt-4">
              <View className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: "#E1306C" }}>
                <Instagram size={32} color="#fff" />
              </View>

              <Text className="text-black text-2xl font-bold mb-2">
                Join as a Creator
              </Text>
              <Text className="text-gray-500 text-base mb-8">
                Enter your details to start earning from local businesses.
              </Text>

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

              <Text className="text-black font-medium mb-2">Instagram Handle</Text>
              <TextInput
                value={instagramHandle}
                onChangeText={setInstagramHandle}
                placeholder="@yourhandle"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-gray-50 rounded-xl px-4 py-4 text-black text-lg mb-6"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              />

              {/* Benefits */}
              <View className="bg-gray-50 rounded-2xl p-4 mb-8" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}>
                <Text className="text-black font-semibold mb-3">What you get</Text>

                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                    <CheckCircle size={16} color="#16a34a" />
                  </View>
                  <Text className="text-gray-600 text-sm flex-1">Your own creator profile</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Users size={16} color="#16a34a" />
                  </View>
                  <Text className="text-gray-600 text-sm flex-1">Direct bookings from local businesses</Text>
                </View>

                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                    <BarChart3 size={16} color="#16a34a" />
                  </View>
                  <Text className="text-gray-600 text-sm flex-1">Set your own prices</Text>
                </View>
              </View>
            </Animated.View>

            <View className="pb-8">
              <PillButton
                title="Continue"
                onPress={handleConnectInstagram}
                variant="black"
                size="lg"
                disabled={!instagramHandle.trim() || !email.trim()}
              />
            </View>
          </ScrollView>
        )}

        {/* Confirm Profile Step */}
        {step === "confirm" && igData && (
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
                    source={{ uri: igData.photo }}
                    className="w-24 h-24 rounded-full mb-3"
                    resizeMode="cover"
                  />
                  <Text className="text-black text-xl font-bold">{igData.name}</Text>
                  <Text className="text-gray-500">{igData.handle}</Text>
                </View>

                <View className="flex-row justify-around py-4 border-t border-gray-100">
                  <View className="items-center">
                    <Text className="text-black text-xl font-bold">{formatFollowers(igData.followers)}</Text>
                    <Text className="text-gray-500 text-sm">Followers</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-black text-xl font-bold">{igData.engagement}%</Text>
                    <Text className="text-gray-500 text-sm">Engagement</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-black text-xl font-bold">{igData.posts}</Text>
                    <Text className="text-gray-500 text-sm">Posts</Text>
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
            </View>
          </ScrollView>
        )}

        {/* Pricing Step */}
        {step === "pricing" && igData && (
          <CreatorPricingStep
            igData={igData}
            email={email}
            onComplete={(creatorId) => {
              loginCreator(creatorId, email, igData.name);
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
  igData,
  email,
  onComplete,
}: {
  igData: { handle: string; name: string; photo: string; followers: number; engagement: string };
  email: string;
  onComplete: (creatorId: string) => void;
}) {
  const createCreator = useCreateCreator();
  const createSlots = useCreateSlots();

  const [storyPrice, setStoryPrice] = useState(50);
  const [postPrice, setPostPrice] = useState(100);
  const [reelPrice, setReelPrice] = useState(150);

  // Suggested price ranges based on follower count
  const getSuggestedRange = (type: "story" | "post" | "reel") => {
    const base = igData.followers / 1000;
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
      // Create creator in database
      const creator = await createCreator.mutateAsync({
        email: email,
        name: igData.name,
        instagram_handle: igData.handle,
        photo: igData.photo,
        follower_count: igData.followers,
        engagement_rate: parseFloat(igData.engagement),
        bio: `${igData.handle} on Instagram`,
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
          <Sparkles size={24} color="#fff" />
        </View>

        <Text className="text-black text-2xl font-bold mb-2">
          Set Your Prices
        </Text>
        <Text className="text-gray-500 text-base mb-6">
          Choose what to charge for each type of post.
        </Text>

        {/* Story Pricing */}
        <PricingSlider
          label="Instagram Story"
          description="24-hour visibility"
          value={storyPrice}
          onChange={setStoryPrice}
          min={storyRange.min}
          max={storyRange.max}
        />

        {/* Post Pricing */}
        <PricingSlider
          label="Instagram Post"
          description="Permanent feed post"
          value={postPrice}
          onChange={setPostPrice}
          min={postRange.min}
          max={postRange.max}
        />

        {/* Reel Pricing */}
        <PricingSlider
          label="Instagram Reel"
          description="Short-form video"
          value={reelPrice}
          onChange={setReelPrice}
          min={reelRange.min}
          max={reelRange.max}
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

// Pricing slider component
function PricingSlider({
  label,
  description,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-baseline mb-2">
        <View>
          <Text className="text-black font-semibold text-base">{label}</Text>
          <Text className="text-gray-400 text-xs">{description}</Text>
        </View>
        <Text className="text-black text-2xl font-bold">${value}</Text>
      </View>

      {/* Custom slider track */}
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-black rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>

      {/* Pressable areas for adjustment */}
      <View className="flex-row justify-between mt-2">
        <Pressable
          onPress={() => onChange(Math.max(min, value - 10))}
          className="px-3 py-1 bg-gray-100 rounded-full"
        >
          <Text className="text-gray-600 text-sm">-$10</Text>
        </Pressable>
        <Text className="text-gray-400 text-xs self-center">
          Suggested: ${min} - ${max}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 10))}
          className="px-3 py-1 bg-gray-100 rounded-full"
        >
          <Text className="text-gray-600 text-sm">+$10</Text>
        </Pressable>
      </View>
    </View>
  );
}
