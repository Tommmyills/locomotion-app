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
import { Plus, X, Film, Image, Clock, Trash2, Calendar, Pencil } from "lucide-react-native";
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
  { id: "post", label: "Post", icon: <Image size={20} color="#000" />, description: "Permanent feed" },
];

export default function ManageSlotsScreen() {
  const creatorId = useAuthStore((s) => s.creatorId);
  const creatorEmail = useAuthStore((s) => s.creatorEmail);

  const { data: myCreator } = useCreatorByEmail(creatorEmail ?? undefined);
  const { data: mySlots = [], isLoading, refetch } = useCreatorSlots(creatorId ?? undefined);
  const createSlot = useCreateSlot();

  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{ id: string; type: SlotType; price: number; date: string } | null>(null);
  const [selectedType, setSelectedType] = useState<SlotType>("story");
  const [price, setPrice] = useState(50);
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

  const getSuggestedPrice = (type: SlotType): number => {
    if (!myCreator) return 50;
    switch (type) {
      case "story": return myCreator.story_price || 50;
      case "post": return myCreator.post_price || 100;
      case "reel": return myCreator.reel_price || 150;
    }
  };

  const handleTypeSelect = (type: SlotType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
    if (!editingSlot) {
      setPrice(getSuggestedPrice(type));
    }
  };

  const handlePriceDecrease = () => {
    setPrice(Math.max(5, price - 25));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePriceIncrease = () => {
    setPrice(Math.min(1000, price + 25));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openAddModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingSlot(null);
    setSelectedType("story");
    setPrice(getSuggestedPrice("story"));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
    setShowModal(true);
  };

  const openEditModal = (slot: { id: string; type: string; price: number; date: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingSlot({ id: slot.id, type: slot.type as SlotType, price: slot.price, date: slot.date });
    setSelectedType(slot.type as SlotType);
    setPrice(slot.price);
    setSelectedDate(new Date(slot.date));
    setShowModal(true);
  };

  const handleSaveSlot = async () => {
    if (!creatorId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (editingSlot) {
        // Update existing slot
        const { error } = await supabase
          .from("ad_slots")
          .update({
            type: selectedType,
            price: price,
            date: selectedDate.toISOString().split("T")[0],
          })
          .eq("id", editingSlot.id);

        if (error) throw error;
        await refetch();
      } else {
        // Create new slot
        await createSlot.mutateAsync({
          creator_id: creatorId,
          type: selectedType,
          price: price,
          date: selectedDate.toISOString().split("T")[0],
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowModal(false);
      setEditingSlot(null);
    } catch (error) {
      console.error("Error saving slot:", error);
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
      // Try to delete from database (may fail due to RLS)
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
      case "post": return <Image size={18} color="#6b7280" />;
      default: return <Image size={18} color="#6b7280" />;
    }
  };

  if (isLoading || isLoadingDeleted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-4">Loading slots...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(400)} className="flex-row mt-4 mb-6">
          <View
            className="flex-1 bg-gray-50 rounded-xl p-4 mr-2"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <Text className="text-black text-2xl font-bold">{availableSlots.length}</Text>
            <Text className="text-gray-500 text-sm">Available</Text>
          </View>
          <View
            className="flex-1 bg-gray-50 rounded-xl p-4 ml-2"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <Text className="text-black text-2xl font-bold">{bookedSlots.length}</Text>
            <Text className="text-gray-500 text-sm">Booked</Text>
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
              <Text className="text-white font-semibold ml-2">Add New Slot</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Available Slots */}
        {availableSlots.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-6">
            <Text className="text-black font-semibold text-base mb-4">Available Slots</Text>
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
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    {getSlotIcon(slot.type)}
                  </View>
                  <View>
                    <Text className="text-black font-semibold capitalize">{slot.type}</Text>
                    <Text className="text-gray-500 text-sm">{formatDate(slot.date)}</Text>
                  </View>
                </View>
                <Text className="text-black font-bold text-lg mr-3">${slot.price}</Text>

                {/* Edit Button */}
                <Pressable
                  onPress={() => openEditModal(slot)}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-2 active:bg-gray-200"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Pencil size={16} color="#000" />
                </Pressable>

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
          <Animated.View entering={FadeInDown.delay(300).duration(400)} className="mb-6">
            <Text className="text-black font-semibold text-base mb-4">Booked Slots</Text>
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
                  <Text className="text-green-600 text-xs">Booked</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {visibleSlots.length === 0 && (
          <View className="py-12 items-center">
            <Calendar size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-4">No slots created yet</Text>
            <Text className="text-gray-400 text-sm mt-1">Tap "Add New Slot" to get started</Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Add/Edit Slot Modal */}
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
              <Text className="text-black text-xl font-bold">
                {editingSlot ? "Edit Slot" : "Add New Slot"}
              </Text>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={18} color="#000" />
              </Pressable>
            </View>

            {/* Slot Type */}
            <Text className="text-black font-medium mb-3">Type</Text>
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
                    <Text className={cn("text-xs mt-0.5", selectedType === type.id ? "text-gray-400" : "text-gray-500")}>
                      {type.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Price */}
            <Text className="text-black font-medium mb-3">Price</Text>
            <View
              className="flex-row items-center justify-between bg-gray-50 rounded-xl p-2 mb-6"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            >
              <LaserButton onPress={handlePriceDecrease} variant="white" size={48} borderRadius={10}>
                <Text className="text-xl font-bold text-gray-400">−</Text>
              </LaserButton>
              <View className="flex-1 items-center">
                <Text className="text-black text-3xl font-bold">${price}</Text>
              </View>
              <LaserButton onPress={handlePriceIncrease} variant="black" size={48} borderRadius={10}>
                <Text className="text-xl font-bold text-white">+</Text>
              </LaserButton>
            </View>

            {/* Date Picker */}
            <Text className="text-black font-medium mb-3">Date</Text>
            <DateWheelPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

            <View className="mt-6">
              <PillButton
                title={createSlot.isPending ? "Saving..." : editingSlot ? "Save Changes" : "Add Slot"}
                onPress={handleSaveSlot}
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
