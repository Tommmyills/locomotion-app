import React from "react";
import { View, Text, Pressable } from "react-native";
import { Film, Image, Clock } from "lucide-react-native";
import { cn } from "@/lib/cn";
import type { AdSlot, SlotType } from "@/lib/state/app-store";

interface SlotCardProps {
  slot: AdSlot;
  onPress: () => void;
  selected?: boolean;
}

function SlotIcon({ type, size = 20 }: { type: SlotType; size?: number }) {
  const color = "#000";
  switch (type) {
    case "story":
      return <Clock size={size} color={color} />;
    case "reel":
      return <Film size={size} color={color} />;
    case "post":
      return <Image size={size} color={color} />;
    default:
      return null;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function SlotCard({ slot, onPress, selected = false }: SlotCardProps) {
  if (!slot.available) {
    return (
      <View
        className="rounded-xl overflow-hidden bg-gray-100 p-4 mb-3 opacity-50"
        style={{
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.1)",
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
              <SlotIcon type={slot.type} size={18} />
            </View>
            <View>
              <Text className="text-gray-400 font-semibold capitalize text-base">
                {slot.type}
              </Text>
              <Text className="text-gray-400 text-sm">{formatDate(slot.date)}</Text>
            </View>
          </View>
          <Text className="text-gray-400 font-bold text-lg line-through">
            ${slot.price}
          </Text>
        </View>
        <Text className="text-gray-400 text-xs mt-2 text-center">Booked</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      <View
        className={cn(
          "rounded-xl overflow-hidden p-4 mb-3",
          selected ? "bg-black" : "bg-white"
        )}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: selected ? 0.2 : 0.08,
          shadowRadius: 8,
          elevation: 3,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? "#ef4444" : "rgba(0,0,0,0.05)",
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className={cn(
                "w-10 h-10 rounded-full items-center justify-center mr-3",
                selected ? "bg-white" : "bg-gray-100"
              )}
            >
              <SlotIcon type={slot.type} size={18} />
            </View>
            <View>
              <Text
                className={cn(
                  "font-semibold capitalize text-base",
                  selected ? "text-white" : "text-black"
                )}
              >
                {slot.type}
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  selected ? "text-gray-300" : "text-gray-500"
                )}
              >
                {formatDate(slot.date)}
              </Text>
            </View>
          </View>
          <Text
            className={cn(
              "font-bold text-xl",
              selected ? "text-white" : "text-black"
            )}
          >
            ${slot.price}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function SlotTypeBadge({ type }: { type: SlotType }) {
  return (
    <View className="bg-gray-100 rounded-full px-3 py-1 flex-row items-center">
      <SlotIcon type={type} size={14} />
      <Text className="text-black text-xs font-medium ml-1 capitalize">{type}</Text>
    </View>
  );
}
