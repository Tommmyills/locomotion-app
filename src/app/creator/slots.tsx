import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Clock, Image as ImageIcon, Film, Check, DollarSign } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { LaserButton } from "@/components/LaserButton";
import { useCreatorByEmail } from "@/lib/db-hooks";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import * as Haptics from "expo-haptics";

type SlotType = "story" | "post" | "reel";

const slotTypes: { id: SlotType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "story", label: "Story", icon: <Clock size={24} color="#000" />, description: "24hr visibility" },
  { id: "reel", label: "Reel", icon: <Film size={24} color="#000" />, description: "Short video" },
  { id: "post", label: "Post", icon: <ImageIcon size={24} color="#000" />, description: "Permanent feed" },
];

export default function ManagePricingScreen() {
  const creatorEmail = useAuthStore((s) => s.creatorEmail);
  const { data: myCreator, isLoading, refetch } = useCreatorByEmail(creatorEmail ?? undefined);

  const [storyPrice, setStoryPrice] = useState<number | null>(null);
  const [postPrice, setPostPrice] = useState<number | null>(null);
  const [reelPrice, setReelPrice] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize prices from creator data
  React.useEffect(() => {
    if (myCreator && storyPrice === null) {
      setStoryPrice(myCreator.story_price || 50);
      setPostPrice(myCreator.post_price || 100);
      setReelPrice(myCreator.reel_price || 150);
    }
  }, [myCreator, storyPrice]);

  const handlePriceChange = (type: SlotType, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasChanges(true);

    switch (type) {
      case "story":
        setStoryPrice((prev) => Math.max(5, Math.min(1000, (prev || 50) + delta)));
        break;
      case "post":
        setPostPrice((prev) => Math.max(5, Math.min(1000, (prev || 100) + delta)));
        break;
      case "reel":
        setReelPrice((prev) => Math.max(5, Math.min(1000, (prev || 150) + delta)));
        break;
    }
  };

  const handleSavePrices = async () => {
    if (!myCreator) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("creators")
        .update({
          story_price: storyPrice,
          post_price: postPrice,
          reel_price: reelPrice,
        })
        .eq("id", myCreator.id);

      if (error) throw error;

      await refetch();
      setHasChanges(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error saving prices:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || storyPrice === null) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading pricing...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <Animated.View entering={FadeInDown.duration(400)} className="mt-4 mb-6">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 bg-black rounded-xl items-center justify-center mr-3">
              <DollarSign size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-black text-xl font-bold">Your Pricing</Text>
              <Text className="text-gray-500 text-sm">Set prices for each content type</Text>
            </View>
          </View>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} className="mb-6">
          <View
            className="bg-blue-50 rounded-2xl p-4"
            style={{ borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)" }}
          >
            <Text className="text-blue-800 font-medium mb-1">How it works</Text>
            <Text className="text-blue-600 text-sm leading-5">
              You're always available for bookings. Businesses will pick the date they want and the type of content. You just set your prices below.
            </Text>
          </View>
        </Animated.View>

        {/* Pricing Cards */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <PricingCard
            type="story"
            label="Instagram Story"
            description="24-hour visibility"
            icon={<Clock size={24} color="#000" />}
            price={storyPrice || 50}
            onDecrease={() => handlePriceChange("story", -25)}
            onIncrease={() => handlePriceChange("story", 25)}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <PricingCard
            type="post"
            label="Instagram Post"
            description="Permanent feed post"
            icon={<ImageIcon size={24} color="#000" />}
            price={postPrice || 100}
            onDecrease={() => handlePriceChange("post", -25)}
            onIncrease={() => handlePriceChange("post", 25)}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <PricingCard
            type="reel"
            label="Instagram Reel"
            description="Short-form video"
            icon={<Film size={24} color="#000" />}
            price={reelPrice || 150}
            onDecrease={() => handlePriceChange("reel", -25)}
            onIncrease={() => handlePriceChange("reel", 25)}
          />
        </Animated.View>

        {/* Earnings Preview */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} className="mb-6">
          <View
            className="bg-gray-50 rounded-2xl p-4"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <Text className="text-gray-500 text-sm mb-2">If you complete 4 bookings/week:</Text>
            <Text className="text-black text-2xl font-bold">
              ${Math.round((((storyPrice || 50) + (postPrice || 100) + (reelPrice || 150)) / 3) * 4 * 4)}/month
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Estimated potential earnings</Text>
          </View>
        </Animated.View>

        <View className="h-24" />
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-white border-t border-gray-100"
        >
          <PillButton
            title={isSaving ? "Saving..." : "Save Changes"}
            onPress={handleSavePrices}
            variant="black"
            size="lg"
            disabled={isSaving}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

function PricingCard({
  type,
  label,
  description,
  icon,
  price,
  onDecrease,
  onIncrease,
}: {
  type: SlotType;
  label: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
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
        <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-3">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-black font-semibold text-lg">{label}</Text>
          <Text className="text-gray-400 text-sm">{description}</Text>
        </View>
      </View>

      {/* Price Control */}
      <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-2">
        <LaserButton onPress={onDecrease} variant="white" size={56} borderRadius={12}>
          <Text className="text-2xl font-bold text-gray-400">−</Text>
        </LaserButton>

        <View className="flex-1 items-center">
          <Text className="text-black text-4xl font-bold">${price}</Text>
        </View>

        <LaserButton onPress={onIncrease} variant="black" size={56} borderRadius={12}>
          <Text className="text-2xl font-bold text-white">+</Text>
        </LaserButton>
      </View>
    </View>
  );
}
