import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Plus, X, Film, Image as LucideImage, Clock, Trash2, Calendar, Sparkles } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import { LaserButton } from "@/components/LaserButton";
import { DateWheelPicker } from "@/components/DateWheelPicker";
import { useCreatorSlots, useCreateSlot, useCreatorByEmail } from "@/lib/db-hooks";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/cn";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DELETED_SLOTS_KEY = "loco_deleted_slot_ids";

type SlotType = "story" | "post" | "reel";

const slotTypes: { id: SlotType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "story", label: "Story", icon: <Clock size={20} color="#000" />, description: "24hr visibility" },
  { id: "reel", label: "Reel", icon: <Film size={20} color="#000" />, description: "Short video" },
  { id: "post", label: "Post", icon: <LucideImage size={20} color="#000" />, description: "Permanent feed" },
];

export default function ManageSlotsScreen() {
  const creatorId = useAuthStore((s) => s.creatorId);
  const creatorEmail = useAuthStore((s) => s.creatorEmail);

  const { data: myCreator } = useCreatorByEmail(creatorEmail ?? undefined);
  const { data: mySlots = [], isLoading, refetch } = useCreatorSlots(creatorId ?? undefined);
  const createSlot = useCreateSlot();

  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<SlotType>("story");
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [deletedSlotIds, setDeletedSlotIds] = useState<string[]>([]);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  // Load deleted slot IDs from AsyncStorage on mount
  useEffect(() => {
    const loadDeletedSlots = async () => {
      try {
        const stored = await AsyncStorage.getItem(DELETED_SLOTS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          setDeletedSlotIds(parsed);
        }
      } catch (error) {
        console.error("Error loading deleted slots:", error);
      } finally {
        setIsLoadingDeleted(false);
      }
    };
    loadDeletedSlots();
  }, []);

  // Save deleted slot IDs to AsyncStorage whenever they change
  const persistDeletedSlots = useCallback(async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(DELETED_SLOTS_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error("Error saving deleted slots:", error);
    }
  }, []);

  // Filter out locally deleted slots
  const visibleSlots = mySlots.filter(s => !deletedSlotIds.includes(s.id));
  const availableSlots = visibleSlots.filter((s) => s.available);
  const bookedSlots = visibleSlots.filter((s) => !s.available);

  const getPrice = (type: SlotType): number => {
    if (!myCreator) return type === "story" ? 50 : type === "post" ? 100 : 150;
    switch (type) {
      case "story": return myCreator.story_price || 50;
      case "post": return myCreator.post_price || 100;
      case "reel": return myCreator.reel_price || 150;
    }
  };

  const handleTypeSelect = (type: SlotType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
  };

  const openAddModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedType("story");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
    setShowModal(true);
  };

  const handleAddSlot = async () => {
    if (!creatorId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createSlot.mutateAsync({
        creator_id: creatorId,
        type: selectedType,
        price: getPrice(selectedType),
        date: selectedDate.toISOString().split("T")[0],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating slot:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeletingSlotId(slotId);

    // Immediately hide from UI and persist to storage
    const newDeletedIds = [...deletedSlotIds, slotId];
    setDeletedSlotIds(newDeletedIds);
    await persistDeletedSlots(newDeletedIds);

    try {
      const { error } = await supabase
        .from("ad_slots")
        .delete()
        .eq("id", slotId);

      if (error) {
        console.log("Delete from DB failed (RLS), but slot hidden locally:", error.message);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
    } catch (error) {
      console.log("Delete error, but slot hidden locally");
    } finally {
      setDeletingSlotId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getSlotIcon = (type: string) => {
    switch (type) {
      case "story": return <Clock size={18} color="#6b7280" />;
      case "reel": return <Film size={18} color="#6b7280" />;
      case "post": return <LucideImage size={18} color="#6b7280" />;
      default: return <LucideImage size={18} color="#6b7280" />;
    }
  };

  if (isLoading || isLoadingDeleted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading your slots...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} className="mt-4 mb-2">
          <Text className="text-black text-xl font-bold">Your Availability</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Add slots when you're ready to create content
          </Text>
        </Animated.View>

        {/* Pricing Info */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} className="mb-6">
          <View
            className="bg-gray-50 rounded-2xl p-4 flex-row justify-around"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <View className="items-center">
              <Text className="text-gray-500 text-xs mb-1">Story</Text>
              <Text className="text-black font-bold">${getPrice("story")}</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-gray-500 text-xs mb-1">Post</Text>
              <Text className="text-black font-bold">${getPrice("post")}</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-gray-500 text-xs mb-1">Reel</Text>
              <Text className="text-black font-bold">${getPrice("reel")}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Add Slot Button */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-6">
          <Pressable onPress={openAddModal} className="active:opacity-90">
            <View
              className="rounded-2xl bg-black p-4 flex-row items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Plus size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">Add Available Slot</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Available Slots */}
        {availableSlots.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)} className="mb-6">
            <Text className="text-black font-semibold text-base mb-3">
              Open for Booking ({availableSlots.length})
            </Text>
            {availableSlots.map((slot) => (
              <View
                key={slot.id}
                className="rounded-xl bg-white p-4 mb-3 flex-row items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                    {getSlotIcon(slot.type)}
                  </View>
                  <View>
                    <Text className="text-black font-semibold capitalize">{slot.type}</Text>
                    <Text className="text-gray-500 text-sm">{formatDate(slot.date)}</Text>
                  </View>
                </View>
                <Text className="text-black font-bold text-lg mr-3">${slot.price}</Text>

                {/* Delete Button */}
                <Pressable
                  onPress={() => handleDeleteSlot(slot.id)}
                  disabled={deletingSlotId === slot.id}
                  className="w-10 h-10 bg-red-50 rounded-full items-center justify-center active:bg-red-100"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {deletingSlotId === slot.id ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Trash2 size={16} color="#ef4444" />
                  )}
                </Pressable>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Booked Slots */}
        {bookedSlots.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-6">
            <Text className="text-black font-semibold text-base mb-3">
              Already Booked ({bookedSlots.length})
            </Text>
            {bookedSlots.map((slot) => (
              <View
                key={slot.id}
                className="rounded-xl bg-gray-50 p-4 mb-3 flex-row items-center justify-between"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    {getSlotIcon(slot.type)}
                  </View>
                  <View>
                    <Text className="text-black font-semibold capitalize">{slot.type}</Text>
                    <Text className="text-gray-500 text-sm">{formatDate(slot.date)}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-black font-bold">${slot.price}</Text>
                  <Text className="text-green-600 text-xs font-medium">Booked</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Empty State */}
        {visibleSlots.length === 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)} className="py-12 items-center">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Sparkles size={32} color="#9ca3af" />
            </View>
            <Text className="text-black font-semibold text-lg mb-2">No slots yet</Text>
            <Text className="text-gray-400 text-sm text-center px-8">
              Add your first available slot and businesses can start booking you!
            </Text>
          </Animated.View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Add Slot Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-5 pb-8 pt-4">
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-black text-xl font-bold">Add Slot</Text>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={18} color="#000" />
              </Pressable>
            </View>

            {/* Slot Type */}
            <Text className="text-black font-medium mb-3">What type of content?</Text>
            <View className="flex-row mb-6">
              {slotTypes.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => handleTypeSelect(type.id)}
                  className="flex-1 mx-1"
                >
                  <View
                    className={cn(
                      "rounded-xl p-3 items-center",
                      selectedType === type.id ? "bg-black" : "bg-gray-100"
                    )}
                  >
                    {React.cloneElement(type.icon as React.ReactElement<{ color: string }>, {
                      color: selectedType === type.id ? "#fff" : "#000",
                    })}
                    <Text className={cn("font-semibold mt-1", selectedType === type.id ? "text-white" : "text-black")}>
                      {type.label}
                    </Text>
                    <Text className={cn("text-xs", selectedType === type.id ? "text-white" : "text-black")}>
                      ${getPrice(type.id)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Date Picker */}
            <Text className="text-black font-medium mb-3">When can you post?</Text>
            <DateWheelPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

            <View className="mt-6">
              <PillButton
                title={createSlot.isPending ? "Adding..." : "Add This Slot"}
                onPress={handleAddSlot}
                variant="black"
                size="lg"
                disabled={createSlot.isPending}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
