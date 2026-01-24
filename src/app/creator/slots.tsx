import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Plus, X, Calendar, Film, Image, Clock } from "lucide-react-native";
import { SlotCard } from "@/components/SlotCard";
import { PillButton } from "@/components/PillButton";
import useAppStore, { SlotType } from "@/lib/state/app-store";
import { cn } from "@/lib/cn";

const slotTypes: { id: SlotType; label: string; icon: React.ReactNode }[] = [
  { id: "story", label: "Story", icon: <Clock size={20} color="#000" /> },
  { id: "reel", label: "Reel", icon: <Film size={20} color="#000" /> },
  { id: "post", label: "Post", icon: <Image size={20} color="#000" /> },
];

export default function ManageSlotsScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const creators = useAppStore((s) => s.creators);
  const adSlots = useAppStore((s) => s.adSlots);
  const addSlot = useAppStore((s) => s.addSlot);

  const myCreator = creators.find((c) => c.userId === currentUser?.id);
  const mySlots = myCreator
    ? adSlots.filter((s) => s.creatorId === myCreator.id)
    : [];

  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<SlotType>("story");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");

  const handleAddSlot = () => {
    if (!myCreator || !price || !date) return;

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum <= 0) return;

    addSlot({
      creatorId: myCreator.id,
      type: selectedType,
      price: priceNum,
      date: date,
      available: true,
    });

    // Reset form
    setPrice("");
    setDate("");
    setSelectedType("story");
    setShowModal(false);
  };

  const availableSlots = mySlots.filter((s) => s.available);
  const bookedSlots = mySlots.filter((s) => !s.available);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="flex-row mt-4 mb-6"
        >
          <View
            className="flex-1 bg-gray-50 rounded-xl p-4 mr-2"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <Text className="text-black text-2xl font-bold">
              {availableSlots.length}
            </Text>
            <Text className="text-gray-500 text-sm">Available</Text>
          </View>
          <View
            className="flex-1 bg-gray-50 rounded-xl p-4 ml-2"
            style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <Text className="text-black text-2xl font-bold">
              {bookedSlots.length}
            </Text>
            <Text className="text-gray-500 text-sm">Booked</Text>
          </View>
        </Animated.View>

        {/* Add Slot Button */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="mb-6"
        >
          <Pressable
            onPress={() => setShowModal(true)}
            className="active:opacity-90"
          >
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
              <Text className="text-white font-semibold ml-2">
                Add New Slot
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Available Slots */}
        {availableSlots.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="mb-6"
          >
            <Text className="text-black font-semibold text-base mb-4">
              Available Slots
            </Text>
            {availableSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onPress={() => {}}
              />
            ))}
          </Animated.View>
        )}

        {/* Booked Slots */}
        {bookedSlots.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            className="mb-6"
          >
            <Text className="text-black font-semibold text-base mb-4">
              Booked Slots
            </Text>
            {bookedSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onPress={() => {}}
              />
            ))}
          </Animated.View>
        )}

        {mySlots.length === 0 && (
          <View className="py-12 items-center">
            <Text className="text-gray-400 text-base">
              No slots created yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Tap "Add New Slot" to get started
            </Text>
          </View>
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
            {/* Handle */}
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-black text-xl font-bold">Add New Slot</Text>
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
                  onPress={() => setSelectedType(type.id)}
                  className="flex-1 mx-1"
                >
                  <View
                    className={cn(
                      "rounded-xl p-4 items-center",
                      selectedType === type.id ? "bg-black" : "bg-gray-100"
                    )}
                  >
                    {React.cloneElement(type.icon as React.ReactElement<{color: string}>, {
                      color: selectedType === type.id ? "#fff" : "#000",
                    })}
                    <Text
                      className={cn(
                        "font-medium mt-2",
                        selectedType === type.id ? "text-white" : "text-black"
                      )}
                    >
                      {type.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Price */}
            <Text className="text-black font-medium mb-2">Price ($)</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="50"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className="bg-gray-50 rounded-xl px-4 py-4 text-black text-base mb-4"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            />

            {/* Date */}
            <Text className="text-black font-medium mb-2">Date (YYYY-MM-DD)</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2026-01-30"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 rounded-xl px-4 py-4 text-black text-base mb-6"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
            />

            {/* Submit */}
            <PillButton
              title="Add Slot"
              onPress={handleAddSlot}
              variant="black"
              size="lg"
              disabled={!price || !date}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
