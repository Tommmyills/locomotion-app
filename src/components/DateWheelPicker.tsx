import React, { useRef, useCallback } from "react";
import { View, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface WheelPickerProps<T> {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number, item: T) => void;
  renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode;
  width?: number;
}

export function WheelPicker<T>({
  items,
  selectedIndex,
  onSelect,
  renderItem,
  width = SCREEN_WIDTH / 3 - 16,
}: WheelPickerProps<T>) {
  const translateY = useSharedValue(-selectedIndex * ITEM_HEIGHT);
  const lastIndex = useRef(selectedIndex);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const snapToIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      if (clampedIndex !== lastIndex.current) {
        lastIndex.current = clampedIndex;
        runOnJS(triggerHaptic)();
        runOnJS(onSelect)(clampedIndex, items[clampedIndex]);
      }
      translateY.value = withSpring(-clampedIndex * ITEM_HEIGHT, {
        damping: 20,
        stiffness: 200,
      });
    },
    [items, onSelect, translateY, triggerHaptic]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const baseOffset = -lastIndex.current * ITEM_HEIGHT;
      translateY.value = baseOffset + event.translationY;

      // Calculate current index for haptic feedback
      const currentIndex = Math.round(-translateY.value / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, currentIndex));

      if (clampedIndex !== lastIndex.current) {
        lastIndex.current = clampedIndex;
        runOnJS(triggerHaptic)();
      }
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const currentOffset = translateY.value;

      // Calculate target index with momentum
      const projectedOffset = currentOffset + velocity * 0.1;
      const targetIndex = Math.round(-projectedOffset / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, targetIndex));

      runOnJS(snapToIndex)(clampedIndex);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Center offset to position selected item in the middle
  const centerOffset = (VISIBLE_ITEMS - 1) / 2;

  return (
    <View
      style={{
        width,
        height: PICKER_HEIGHT,
        overflow: "hidden",
      }}
    >
      {/* Selection indicator */}
      <View
        style={{
          position: "absolute",
          top: centerOffset * ITEM_HEIGHT,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          backgroundColor: "rgba(0,0,0,0.05)",
          borderRadius: 8,
        }}
        pointerEvents="none"
      />

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              paddingTop: centerOffset * ITEM_HEIGHT,
            },
            animatedStyle,
          ]}
        >
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <View
                key={index}
                style={{
                  height: ITEM_HEIGHT,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {renderItem(item, index, isSelected)}
              </View>
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// Date Picker using WheelPicker
interface DateWheelPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DateWheelPicker({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
}: DateWheelPickerProps) {
  // Generate months
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Generate years (current year to +2 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const selectedMonth = selectedDate.getMonth();
  const selectedDay = selectedDate.getDate();
  const selectedYear = selectedDate.getFullYear();

  const handleMonthChange = (index: number) => {
    const newDate = new Date(selectedYear, index, Math.min(selectedDay, getDaysInMonth(index, selectedYear)));
    onDateChange(newDate);
  };

  const handleDayChange = (index: number) => {
    const day = days[index];
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    const newDate = new Date(selectedYear, selectedMonth, Math.min(day, maxDays));
    onDateChange(newDate);
  };

  const handleYearChange = (index: number) => {
    const year = years[index];
    const maxDays = getDaysInMonth(selectedMonth, year);
    const newDate = new Date(year, selectedMonth, Math.min(selectedDay, maxDays));
    onDateChange(newDate);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  return (
    <View className="flex-row justify-center items-center bg-gray-50 rounded-2xl py-2" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}>
      {/* Month */}
      <WheelPicker
        items={months}
        selectedIndex={selectedMonth}
        onSelect={handleMonthChange}
        renderItem={(item, _, isSelected) => (
          <Text
            className={`text-base ${isSelected ? "text-black font-bold" : "text-gray-400"}`}
          >
            {item}
          </Text>
        )}
      />

      {/* Day */}
      <WheelPicker
        items={days}
        selectedIndex={selectedDay - 1}
        onSelect={handleDayChange}
        renderItem={(item, _, isSelected) => (
          <Text
            className={`text-base ${isSelected ? "text-black font-bold" : "text-gray-400"}`}
          >
            {item}
          </Text>
        )}
      />

      {/* Year */}
      <WheelPicker
        items={years}
        selectedIndex={years.indexOf(selectedYear)}
        onSelect={handleYearChange}
        renderItem={(item, _, isSelected) => (
          <Text
            className={`text-base ${isSelected ? "text-black font-bold" : "text-gray-400"}`}
          >
            {item}
          </Text>
        )}
      />
    </View>
  );
}
