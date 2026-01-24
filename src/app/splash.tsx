import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

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
    <View className="flex-1 bg-white items-center justify-center">
      <Animated.View entering={FadeIn.duration(500)}>
        <Image
          source={require("../../public/image-1769241623.png")}
          style={{ width: 280, height: 280 }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
