import React, { useCallback } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/cn";

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: "black" | "white";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function PillButton({
  title,
  onPress,
  variant = "black",
  disabled = false,
  className,
  size = "md",
}: PillButtonProps) {
  const beamProgress = useSharedValue(0);
  const isPressed = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePressIn = useCallback(() => {
    isPressed.value = withTiming(1, { duration: 100 });
    beamProgress.value = 0;
    beamProgress.value = withTiming(1, {
      duration: 600,
      easing: Easing.linear,
    });
    runOnJS(triggerHaptic)();
  }, [beamProgress, isPressed, triggerHaptic]);

  const handlePressOut = useCallback(() => {
    isPressed.value = withTiming(0, { duration: 150 });
  }, [isPressed]);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - isPressed.value * 0.02 }],
  }));

  // Top beam (left to right)
  const topBeamStyle = useAnimatedStyle(() => {
    const progress = beamProgress.value;
    // Active during 0-25% of animation
    const localProgress = Math.min(progress / 0.25, 1);
    return {
      position: "absolute" as const,
      top: -1,
      left: 0,
      height: 3,
      width: `${localProgress * 100}%`,
      backgroundColor: "#ef4444",
      opacity: progress < 0.25 ? 1 : withTiming(0, { duration: 100 }),
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 8,
      borderRadius: 2,
    };
  });

  // Right beam (top to bottom)
  const rightBeamStyle = useAnimatedStyle(() => {
    const progress = beamProgress.value;
    // Active during 25-50% of animation
    const localProgress = progress < 0.25 ? 0 : Math.min((progress - 0.25) / 0.25, 1);
    return {
      position: "absolute" as const,
      top: 0,
      right: -1,
      width: 3,
      height: `${localProgress * 100}%`,
      backgroundColor: "#ef4444",
      opacity: progress >= 0.25 && progress < 0.5 ? 1 : withTiming(0, { duration: 100 }),
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 8,
      borderRadius: 2,
    };
  });

  // Bottom beam (right to left)
  const bottomBeamStyle = useAnimatedStyle(() => {
    const progress = beamProgress.value;
    // Active during 50-75% of animation
    const localProgress = progress < 0.5 ? 0 : Math.min((progress - 0.5) / 0.25, 1);
    return {
      position: "absolute" as const,
      bottom: -1,
      right: 0,
      height: 3,
      width: `${localProgress * 100}%`,
      backgroundColor: "#ef4444",
      opacity: progress >= 0.5 && progress < 0.75 ? 1 : withTiming(0, { duration: 100 }),
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 8,
      borderRadius: 2,
    };
  });

  // Left beam (bottom to top)
  const leftBeamStyle = useAnimatedStyle(() => {
    const progress = beamProgress.value;
    // Active during 75-100% of animation
    const localProgress = progress < 0.75 ? 0 : Math.min((progress - 0.75) / 0.25, 1);
    return {
      position: "absolute" as const,
      bottom: 0,
      left: -1,
      width: 3,
      height: `${localProgress * 100}%`,
      backgroundColor: "#ef4444",
      opacity: progress >= 0.75 ? 1 : withTiming(0, { duration: 100 }),
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 8,
      borderRadius: 2,
    };
  });

  const sizeClasses = {
    sm: "py-2 px-4",
    md: "py-3 px-6",
    lg: "py-4 px-8",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <AnimatedView
        style={[buttonAnimatedStyle]}
        className={cn(
          "rounded-full",
          variant === "black" ? "bg-black" : "bg-white border border-black",
          sizeClasses[size],
          disabled && "opacity-50",
          className
        )}
      >
        {/* Inner shadow effect for 3D depth */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 999,
            borderWidth: 1,
            borderTopColor: variant === "black" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.8)",
            borderLeftColor: variant === "black" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)",
            borderRightColor: variant === "black" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
            borderBottomColor: variant === "black" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)",
          }}
        />

        {/* Red beam animations - positioned outside clipping */}
        <AnimatedView style={topBeamStyle} />
        <AnimatedView style={rightBeamStyle} />
        <AnimatedView style={bottomBeamStyle} />
        <AnimatedView style={leftBeamStyle} />

        <Text
          className={cn(
            "font-semibold text-center",
            textSizeClasses[size],
            variant === "black" ? "text-white" : "text-black"
          )}
        >
          {title}
        </Text>
      </AnimatedView>
    </Pressable>
  );
}
