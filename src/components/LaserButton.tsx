import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedView = Animated.createAnimatedComponent(View);

interface LaserButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: "black" | "white";
  size?: number;
  borderRadius?: number;
  disabled?: boolean;
}

export function LaserButton({
  onPress,
  children,
  variant = "black",
  size = 56,
  borderRadius = 12,
  disabled = false,
}: LaserButtonProps) {
  const beamProgress = useSharedValue(0);
  const isPressed = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handlePressIn = useCallback(() => {
    isPressed.value = withTiming(1, { duration: 80 });
    beamProgress.value = 0;
    beamProgress.value = withTiming(1, {
      duration: 400,
      easing: Easing.linear,
    });
    runOnJS(triggerHaptic)();
  }, [beamProgress, isPressed, triggerHaptic]);

  const handlePressOut = useCallback(() => {
    isPressed.value = withTiming(0, { duration: 100 });
  }, [isPressed]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [onPress, disabled]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - isPressed.value * 0.05 }],
  }));

  // Top beam (left to right)
  const topBeamStyle = useAnimatedStyle(() => {
    const progress = beamProgress.value;
    const localProgress = Math.min(progress / 0.25, 1);
    return {
      position: "absolute" as const,
      top: -2,
      left: 0,
      height: 3,
      width: `${localProgress * 100}%`,
      backgroundColor: "#ef4444",
      opacity: progress < 0.25 ? 1 : withTiming(0, { duration: 80 }),
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 6,
      borderRadius: 2,
    };
  });

  // Right beam (top to bottom)
  const rightBeamStyle = useAnimatedStyle(() => {
    const progress = beamProgress.value;
    const localProgress = progress < 0.25 ? 0 : Math.min((progress - 0.25) / 0.25, 1);
    return {
      position: "absolute" as const,
      top: 0,
      right: -2,
      width: 3,
      height: `${localProgress * 100}%`,
      backgroundColor: "#ef4444",
      opacity: progress >= 0.25 && progress < 0.5 ? 1 : withTiming(0, { duration: 80 }),
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 6,
      borderRadius: 2,
    };
  });

  // Bottom beam (right to left)
  const bottomBeamStyle = useAnimatedStyle(() => {
    const progress = beamProgress.value;
    const localProgress = progress < 0.5 ? 0 : Math.min((progress - 0.5) / 0.25, 1);
    return {
      position: "absolute" as const,
      bottom: -2,
      right: 0,
      height: 3,
      width: `${localProgress * 100}%`,
      backgroundColor: "#ef4444",
      opacity: progress >= 0.5 && progress < 0.75 ? 1 : withTiming(0, { duration: 80 }),
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 6,
      borderRadius: 2,
    };
  });

  // Left beam (bottom to top)
  const leftBeamStyle = useAnimatedStyle(() => {
    const progress = beamProgress.value;
    const localProgress = progress < 0.75 ? 0 : Math.min((progress - 0.75) / 0.25, 1);
    return {
      position: "absolute" as const,
      bottom: 0,
      left: -2,
      width: 3,
      height: `${localProgress * 100}%`,
      backgroundColor: "#ef4444",
      opacity: progress >= 0.75 ? 1 : withTiming(0, { duration: 80 }),
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 6,
      borderRadius: 2,
    };
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <AnimatedView style={[buttonAnimatedStyle, { position: "relative" }]}>
        {/* Red beam animations */}
        <AnimatedView style={topBeamStyle} />
        <AnimatedView style={rightBeamStyle} />
        <AnimatedView style={bottomBeamStyle} />
        <AnimatedView style={leftBeamStyle} />

        {/* Actual button */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: borderRadius,
            backgroundColor: variant === "black" ? "#000" : "#fff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: variant === "black" ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {children}
        </View>
      </AnimatedView>
    </Pressable>
  );
}
