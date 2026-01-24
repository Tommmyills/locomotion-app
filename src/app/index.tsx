import React, { useEffect, useState } from "react";
import { View, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Animated, { FadeIn } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Pre-load the image
const logoImage = require("../assets/logo.png");

export default function SplashScreenPage() {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

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
          source={logoImage}
          style={{
            width: width * 0.85,
            height: width * 0.85,
          }}
          resizeMode="contain"
          onLoad={() => setImageLoaded(true)}
        />
      </Animated.View>
    </View>
  );
}
