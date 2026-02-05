import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/cn";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CALENDAR_PADDING = 20;
const DAY_SIZE = (SCREEN_WIDTH - CALENDAR_PADDING * 2 - 12) / 7; // 12 for gaps

interface AvailabilityCalendarProps {
  blockedDates: string[];
  bookedDates: string[];
  onToggleDate: (date: string) => void;
  selectionMode?: "block" | "book";
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add padding for days before the first day of the month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  // Add all days in the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add padding for days after the last day of the month
  const endPadding = 6 - lastDay.getDay();
  for (let i = 1; i <= endPadding; i++) {
    const date = new Date(year, month + 1, i);
    days.push(date);
  }

  return days;
}

export function AvailabilityCalendar({
  blockedDates,
  bookedDates,
  onToggleDate,
  selectionMode = "block",
  selectedDate,
  onSelectDate,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const days = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayPress = (date: Date) => {
    const dateKey = formatDateKey(date);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isBooked = bookedSet.has(dateKey);

    if (isPast) return;

    if (selectionMode === "block") {
      // Creator blocking/unblocking dates
      if (isBooked) return; // Can't unblock booked dates
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onToggleDate(dateKey);
    } else {
      // Business selecting a date to book
      const isBlocked = blockedSet.has(dateKey);
      if (isBlocked || isBooked) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelectDate?.(dateKey);
    }
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;
  const isToday = (date: Date) => formatDateKey(date) === formatDateKey(today);
  const isPast = (date: Date) => date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <View className="bg-white rounded-3xl p-4" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4 px-1">
        <Pressable
          onPress={handlePrevMonth}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
        >
          <ChevronLeft size={20} color="#000" />
        </Pressable>

        <Text className="text-black text-lg font-bold">
          {MONTHS[currentMonth]} {currentYear}
        </Text>

        <Pressable
          onPress={handleNextMonth}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
        >
          <ChevronRight size={20} color="#000" />
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View className="flex-row mb-2">
        {WEEKDAYS.map((day) => (
          <View key={day} style={{ width: DAY_SIZE }} className="items-center">
            <Text className="text-gray-400 text-xs font-medium">{day}</Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View className="flex-row flex-wrap">
        {days.map((date, index) => {
          const dateKey = formatDateKey(date);
          const isInMonth = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isPastDate = isPast(date);
          const isBlocked = blockedSet.has(dateKey);
          const isBooked = bookedSet.has(dateKey);
          const isSelected = selectedDate === dateKey;

          // Determine the state
          let bgColor = "bg-transparent";
          let textColor = "text-black";
          let borderColor = "transparent";

          if (!isInMonth) {
            textColor = "text-gray-200";
          } else if (isPastDate) {
            textColor = "text-gray-300";
          } else if (isBooked) {
            bgColor = "bg-green-500";
            textColor = "text-white";
          } else if (isBlocked) {
            bgColor = "bg-gray-200";
            textColor = "text-gray-400";
          } else if (isSelected) {
            bgColor = "bg-black";
            textColor = "text-white";
          } else if (isTodayDate) {
            borderColor = "#000";
          }

          const isDisabled = !isInMonth || isPastDate || (selectionMode === "book" && (isBlocked || isBooked));

          return (
            <Pressable
              key={index}
              onPress={() => handleDayPress(date)}
              disabled={isDisabled}
              style={{ width: DAY_SIZE, height: DAY_SIZE }}
              className="items-center justify-center"
            >
              <View
                className={cn(
                  "w-10 h-10 rounded-full items-center justify-center",
                  bgColor
                )}
                style={borderColor !== "transparent" ? { borderWidth: 2, borderColor } : undefined}
              >
                <Text className={cn("text-sm font-medium", textColor)}>
                  {date.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row justify-center mt-4 pt-4 border-t border-gray-100">
        {selectionMode === "block" ? (
          <>
            <View className="flex-row items-center mr-6">
              <View className="w-4 h-4 rounded-full bg-gray-200 mr-2" />
              <Text className="text-gray-500 text-xs">Blocked</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-green-500 mr-2" />
              <Text className="text-gray-500 text-xs">Booked</Text>
            </View>
          </>
        ) : (
          <>
            <View className="flex-row items-center mr-4">
              <View className="w-4 h-4 rounded-full bg-black mr-2" />
              <Text className="text-gray-500 text-xs">Selected</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <View className="w-4 h-4 rounded-full bg-gray-200 mr-2" />
              <Text className="text-gray-500 text-xs">Unavailable</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-green-500 mr-2" />
              <Text className="text-gray-500 text-xs">Booked</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
