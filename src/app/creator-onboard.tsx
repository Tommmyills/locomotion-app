import React, { useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Instagram, ArrowLeft, CheckCircle, Users, BarChart3, Sparkles } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import useAppStore from "@/lib/state/app-store";
import * as Haptics from "expo-haptics";

type OnboardStep = "connect" | "loading" | "confirm" | "pricing";

// Simulated Instagram data (in a real app, this would come from Instagram API)
const simulateInstagramFetch = (handle: string) => {
  // Generate realistic-looking data based on handle
  const followers = Math.floor(Math.random() * 50000) + 5000;
  const engagement = (Math.random() * 3 + 2).toFixed(1);
  const posts = Math.floor(Math.random() * 200) + 50;

  return {
    handle: handle.startsWith("@") ? handle : `@${handle}`,
    name: handle.replace("@", "").split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    photo: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000000)}-?w=400`,
    followers,
    engagement,
    posts,
  };
};

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
  const login = useAppStore((s) => s.login);
  const addCreator = useAppStore((s) => s.addCreator);

  const [step, setStep] = useState<OnboardStep>("connect");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [igData, setIgData] = useState<{
    handle: string;
    name: string;
    photo: string;
    followers: number;
    engagement: string;
    posts: number;
  } | null>(null);

  const handleConnectInstagram = async () => {
    if (!instagramHandle.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("loading");

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const data = simulateInstagramFetch(instagramHandle);
    // Use a consistent placeholder photo
    data.photo = placeholderPhotos[Math.floor(Math.random() * placeholderPhotos.length)];
    setIgData(data);

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
              {step === "loading" && "Connecting..."}
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
                Connect Your Instagram
              </Text>
              <Text className="text-gray-500 text-base mb-8">
                We'll automatically pull your profile photo, follower count, and engagement rate.
              </Text>

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
                <Text className="text-black font-semibold mb-3">Why connect Instagram?</Text>

                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                    <CheckCircle size={16} color="#16a34a" />
                  </View>
                  <Text className="text-gray-600 text-sm flex-1">Auto-generate your profile</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Users size={16} color="#16a34a" />
                  </View>
                  <Text className="text-gray-600 text-sm flex-1">Show verified follower count</Text>
                </View>

                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                    <BarChart3 size={16} color="#16a34a" />
                  </View>
                  <Text className="text-gray-600 text-sm flex-1">Display engagement estimate</Text>
                </View>
              </View>
            </Animated.View>

            <View className="pb-8">
              <PillButton
                title="Connect Instagram"
                onPress={handleConnectInstagram}
                variant="black"
                size="lg"
                disabled={!instagramHandle.trim()}
              />
            </View>
          </ScrollView>
        )}

        {/* Loading Step */}
        {step === "loading" && (
          <View className="flex-1 px-6 items-center justify-center">
            <Animated.View entering={FadeIn.duration(400)} className="items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                <ActivityIndicator size="large" color="#000" />
              </View>
              <Text className="text-black text-xl font-bold mb-2">
                Connecting to Instagram
              </Text>
              <Text className="text-gray-500 text-base text-center">
                Fetching your profile data...
              </Text>
            </Animated.View>
          </View>
        )}

        {/* Confirm Profile Step */}
        {step === "confirm" && igData && (
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(400)} className="mt-4">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={20} color="#16a34a" />
                <Text className="text-green-600 text-sm font-medium ml-2">Connected</Text>
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

        {/* Pricing Step - moved to separate screen */}
        {step === "pricing" && igData && (
          <CreatorPricingStep
            igData={igData}
            onComplete={() => {
              router.replace("/creator");
            }}
            login={login}
            addCreator={addCreator}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Pricing setup component
function CreatorPricingStep({
  igData,
  onComplete,
  login,
  addCreator,
}: {
  igData: { handle: string; name: string; photo: string; followers: number };
  onComplete: () => void;
  login: (email: string, role: "creator", name: string) => void;
  addCreator: (creator: any) => void;
}) {
  const addSlot = useAppStore((s) => s.addSlot);

  const [storyPrice, setStoryPrice] = useState(50);
  const [postPrice, setPostPrice] = useState(100);
  const [reelPrice, setReelPrice] = useState(150);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Create user account
    const email = `${igData.handle.replace("@", "")}@instagram.local`;
    login(email, "creator", igData.name);

    // Wait a bit for the login to process
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get the created creator and update with Instagram data
    const store = useAppStore.getState();
    const currentUser = store.currentUser;

    if (currentUser) {
      // Find and update the creator profile with IG data and mark as approved
      const updatedCreators = store.creators.map(c => {
        if (c.userId === currentUser.id) {
          return {
            ...c,
            photo: igData.photo,
            followerCount: igData.followers,
            bio: `${igData.handle} on Instagram`,
            approved: true, // Auto-approve creators who connect Instagram
          };
        }
        return c;
      });

      useAppStore.setState({ creators: updatedCreators });

      // Find the creator ID
      const myCreator = updatedCreators.find(c => c.userId === currentUser.id);

      if (myCreator) {
        // Create initial ad slots based on their pricing
        const today = new Date();
        const dates = [
          new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
          new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        ];

        // Add story slot
        addSlot({
          creatorId: myCreator.id,
          type: "story",
          price: storyPrice,
          date: dates[0].toISOString().split("T")[0],
          available: true,
        });

        // Add post slot
        addSlot({
          creatorId: myCreator.id,
          type: "post",
          price: postPrice,
          date: dates[1].toISOString().split("T")[0],
          available: true,
        });

        // Add reel slot
        addSlot({
          creatorId: myCreator.id,
          type: "reel",
          price: reelPrice,
          date: dates[2].toISOString().split("T")[0],
          available: true,
        });
      }
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

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
          Choose what to offer and set prices using our suggested ranges based on your followers.
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
