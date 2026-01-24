import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, TextInput, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { MapPin, ArrowLeft, Search, Instagram, Clock, Film, Image as ImageIcon, X, Check } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import useAppStore, { Creator, AdSlot, SlotType } from "@/lib/state/app-store";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/cn";

export default function BrowseCreatorsScreen() {
  const router = useRouter();
  const creators = useAppStore((s) => s.creators);
  const adSlots = useAppStore((s) => s.adSlots);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AdSlot | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Filter to Albuquerque and approved creators
  const approvedCreators = creators.filter(
    (c) => c.approved && c.city === "Albuquerque"
  );

  const filteredCreators = approvedCreators.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatorPress = (creator: Creator) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCreator(creator);
  };

  const handleSlotSelect = (slot: AdSlot) => {
    if (!slot.available) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSlot(slot);
  };

  const handleBookNow = () => {
    if (!selectedSlot || !selectedCreator) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCheckout(true);
  };

  const handleBack = () => {
    if (showCheckout) {
      setShowCheckout(false);
    } else if (selectedCreator) {
      setSelectedCreator(null);
      setSelectedSlot(null);
    } else {
      router.back();
    }
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getSlotIcon = (type: SlotType) => {
    switch (type) {
      case "story":
        return <Clock size={16} color="#6b7280" />;
      case "reel":
        return <Film size={16} color="#6b7280" />;
      case "post":
        return <ImageIcon size={16} color="#6b7280" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // If viewing a creator's profile
  if (selectedCreator) {
    const creatorSlots = adSlots.filter(
      (s) => s.creatorId === selectedCreator.id && s.available
    );

    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* Header */}
          <View className="px-5 py-4 flex-row items-center border-b border-gray-100">
            <Pressable onPress={handleBack} className="p-1 -ml-1">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
            <Text className="flex-1 text-center text-black font-semibold pr-6">
              {selectedCreator.name}
            </Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Creator Profile Header */}
            <Animated.View entering={FadeIn.duration(400)} className="px-5 py-6">
              <View className="items-center mb-4">
                <Image
                  source={{ uri: selectedCreator.photo }}
                  className="w-24 h-24 rounded-full mb-3"
                  resizeMode="cover"
                />
                <Text className="text-black text-xl font-bold">
                  {selectedCreator.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Instagram size={14} color="#E1306C" />
                  <Text className="text-gray-500 text-sm ml-1 capitalize">
                    {selectedCreator.platform} • {formatFollowers(selectedCreator.followerCount)} followers
                  </Text>
                </View>
              </View>

              <Text className="text-gray-600 text-center mb-4">
                {selectedCreator.bio}
              </Text>

              {/* Trust Badge */}
              <View className="bg-green-50 rounded-xl px-4 py-3 flex-row items-center justify-center" style={{ borderWidth: 1, borderColor: "rgba(22, 163, 74, 0.2)" }}>
                <Check size={16} color="#16a34a" />
                <Text className="text-green-700 text-sm font-medium ml-2">
                  Verified Albuquerque Creator
                </Text>
              </View>
            </Animated.View>

            {/* Available Slots */}
            <View className="px-5">
              <Text className="text-black font-semibold text-lg mb-4">
                Available Ad Slots
              </Text>

              {creatorSlots.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-gray-400">No slots available right now</Text>
                </View>
              ) : (
                creatorSlots.map((slot, index) => (
                  <Animated.View
                    key={slot.id}
                    entering={FadeInDown.delay(index * 50).duration(300)}
                  >
                    <Pressable
                      onPress={() => handleSlotSelect(slot)}
                      className="mb-3"
                    >
                      <View
                        className={cn(
                          "rounded-2xl p-4 flex-row items-center justify-between",
                          selectedSlot?.id === slot.id ? "bg-black" : "bg-gray-50"
                        )}
                        style={{
                          borderWidth: selectedSlot?.id === slot.id ? 2 : 1,
                          borderColor: selectedSlot?.id === slot.id ? "#ef4444" : "rgba(0,0,0,0.05)",
                        }}
                      >
                        <View className="flex-row items-center">
                          <View
                            className={cn(
                              "w-10 h-10 rounded-full items-center justify-center mr-3",
                              selectedSlot?.id === slot.id ? "bg-white" : "bg-white"
                            )}
                          >
                            {React.cloneElement(getSlotIcon(slot.type) as React.ReactElement<{color: string}>, {
                              color: "#000",
                            })}
                          </View>
                          <View>
                            <Text
                              className={cn(
                                "font-semibold capitalize",
                                selectedSlot?.id === slot.id ? "text-white" : "text-black"
                              )}
                            >
                              {slot.type}
                            </Text>
                            <Text
                              className={cn(
                                "text-sm",
                                selectedSlot?.id === slot.id ? "text-gray-400" : "text-gray-500"
                              )}
                            >
                              {formatDate(slot.date)}
                            </Text>
                          </View>
                        </View>
                        <Text
                          className={cn(
                            "text-xl font-bold",
                            selectedSlot?.id === slot.id ? "text-white" : "text-black"
                          )}
                        >
                          ${slot.price}
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))
              )}
            </View>

            <View className="h-32" />
          </ScrollView>

          {/* Bottom CTA */}
          {creatorSlots.length > 0 && (
            <View
              className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 10,
                borderTopWidth: 1,
                borderTopColor: "rgba(0,0,0,0.05)",
              }}
            >
              <PillButton
                title={selectedSlot ? `Book for $${selectedSlot.price}` : "Select a Slot"}
                onPress={handleBookNow}
                variant="black"
                size="lg"
                disabled={!selectedSlot}
              />
            </View>
          )}
        </View>

        {/* Checkout Modal */}
        <Modal
          visible={showCheckout}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCheckout(false)}
        >
          <CheckoutModal
            creator={selectedCreator}
            slot={selectedSlot}
            onClose={() => setShowCheckout(false)}
            formatFollowers={formatFollowers}
          />
        </Modal>
      </SafeAreaView>
    );
  }

  // Main browse view
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 py-4">
          <View className="flex-row items-center mb-4">
            <Pressable onPress={() => router.back()} className="p-1 -ml-1 mr-3">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-black text-xl font-bold">Browse Creators</Text>
              <View className="flex-row items-center mt-0.5">
                <MapPin size={12} color="#6b7280" />
                <Text className="text-gray-500 text-sm ml-1">Albuquerque</Text>
              </View>
            </View>
          </View>

          {/* Search */}
          <View
            className="flex-row items-center bg-gray-100 rounded-xl px-4"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.03)" }}
          >
            <Search size={18} color="#9ca3af" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search creators..."
              placeholderTextColor="#9ca3af"
              className="flex-1 py-3 ml-2 text-black"
            />
          </View>
        </View>

        {/* Creators List */}
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-4">
            <View
              className="bg-gray-50 rounded-2xl p-4"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            >
              <Text className="text-black font-semibold mb-1">
                Book local influencers instantly
              </Text>
              <Text className="text-gray-500 text-sm">
                No negotiations. Fixed prices. Pay at checkout.
              </Text>
            </View>
          </Animated.View>

          {filteredCreators.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-gray-400">No creators found</Text>
            </View>
          ) : (
            filteredCreators.map((creator, index) => {
              const creatorSlots = adSlots.filter(
                (s) => s.creatorId === creator.id && s.available
              );
              const lowestPrice = creatorSlots.length > 0
                ? Math.min(...creatorSlots.map((s) => s.price))
                : null;

              return (
                <Animated.View
                  key={creator.id}
                  entering={FadeInDown.delay(150 + index * 50).duration(400)}
                >
                  <Pressable
                    onPress={() => handleCreatorPress(creator)}
                    className="mb-4 active:opacity-90"
                  >
                    <View
                      className="rounded-2xl overflow-hidden bg-white"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.05)",
                      }}
                    >
                      <View className="flex-row">
                        <Image
                          source={{ uri: creator.photo }}
                          className="w-28 h-28"
                          resizeMode="cover"
                        />
                        <View className="flex-1 p-4 justify-center">
                          <Text className="text-black font-bold text-base" numberOfLines={1}>
                            {creator.name}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <Instagram size={12} color="#E1306C" />
                            <Text className="text-gray-500 text-sm ml-1">
                              {formatFollowers(creator.followerCount)}
                            </Text>
                          </View>
                          <Text className="text-gray-400 text-xs mt-2" numberOfLines={2}>
                            {creator.bio}
                          </Text>
                          {lowestPrice !== null && (
                            <Text className="text-black font-semibold text-sm mt-2">
                              From ${lowestPrice}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })
          )}

          <View className="h-8" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Checkout Modal Component
function CheckoutModal({
  creator,
  slot,
  onClose,
  formatFollowers,
}: {
  creator: Creator;
  slot: AdSlot | null;
  onClose: () => void;
  formatFollowers: (count: number) => string;
}) {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const createBooking = useAppStore((s) => s.createBooking);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

  const [step, setStep] = useState<"details" | "processing" | "success">(
    isAuthenticated && currentUser?.role === "business" ? "details" : "details"
  );
  const [businessName, setBusinessName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!slot) return null;

  const platformFee = Math.round(slot.price * 0.1);
  const total = slot.price + platformFee;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const handleCheckout = async () => {
    if (!businessName.trim() || !email.trim()) return;

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // If not authenticated, create account first
    if (!isAuthenticated) {
      login(email.trim(), "business", businessName.trim());
    }

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the current user from store (will be set by login)
    const storeState = useAppStore.getState();
    const userId = storeState.currentUser?.id || `business-${Date.now()}`;

    // Create the booking
    createBooking({
      businessId: userId,
      businessName: businessName.trim(),
      creatorId: creator.id,
      creatorName: creator.name,
      slotId: slot.id,
      slotType: slot.type,
      date: slot.date,
      price: slot.price,
      status: "pending",
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep("success");
  };

  if (step === "success") {
    return (
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl px-5 pb-8 pt-4">
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-6" />

          <View className="items-center py-8">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Check size={40} color="#16a34a" />
            </View>
            <Text className="text-black text-2xl font-bold mb-2">
              Booking Confirmed!
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              {creator.name} will post your ad on {formatDate(slot.date)}.
              You'll be notified when it's live.
            </Text>

            <PillButton
              title="View My Bookings"
              onPress={() => {
                onClose();
                router.replace("/business");
              }}
              variant="black"
              size="lg"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-end bg-black/50"
    >
      <View className="bg-white rounded-t-3xl px-5 pb-8 pt-4 max-h-[90%]">
        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-black text-xl font-bold">Checkout</Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <X size={18} color="#000" />
            </Pressable>
          </View>

          {/* Order Summary */}
          <View
            className="bg-gray-50 rounded-2xl p-4 mb-6"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: creator.photo }}
                className="w-12 h-12 rounded-full mr-3"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-black font-semibold">{creator.name}</Text>
                <Text className="text-gray-500 text-sm capitalize">
                  {slot.type} • {formatDate(slot.date)}
                </Text>
              </View>
            </View>

            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Ad slot</Text>
                <Text className="text-black">${slot.price}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Platform fee (10%)</Text>
                <Text className="text-black">${platformFee}</Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-200">
                <Text className="text-black font-bold">Total</Text>
                <Text className="text-black font-bold text-lg">${total}</Text>
              </View>
            </View>
          </View>

          {/* Business Details */}
          {!isAuthenticated && (
            <>
              <Text className="text-black font-semibold mb-3">Your Details</Text>
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Business name"
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 rounded-xl px-4 py-4 text-black text-base mb-3"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 rounded-xl px-4 py-4 text-black text-base mb-6"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
              />
            </>
          )}

          {/* Trust Badges */}
          <View className="flex-row justify-around mb-6">
            <View className="items-center">
              <Text className="text-gray-400 text-xs">Secure</Text>
              <Text className="text-gray-600 text-xs">Payment</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-400 text-xs">Money-back</Text>
              <Text className="text-gray-600 text-xs">Guarantee</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-400 text-xs">Verified</Text>
              <Text className="text-gray-600 text-xs">Post</Text>
            </View>
          </View>

          <PillButton
            title={isProcessing ? "Processing..." : `Pay $${total}`}
            onPress={handleCheckout}
            variant="black"
            size="lg"
            disabled={isProcessing || !businessName.trim() || !email.trim()}
          />

          <Text className="text-gray-400 text-xs text-center mt-4">
            By completing this purchase, you agree to our Terms of Service
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
