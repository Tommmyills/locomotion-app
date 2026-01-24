import React, { useEffect } from "react";
import { View, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function SplashScreenPage() {
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();

    // Show splash for 2.5 seconds then navigate to home
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 bg-white">
      <Animated.View
        entering={FadeIn.duration(800)}
        className="flex-1 items-center justify-center"
      >
        <Image
          source={require("../../public/image-1769267615.png")}
          style={{
            width: width * 0.85,
            height: height * 0.5,
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
