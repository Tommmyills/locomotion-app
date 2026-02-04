import React, { useEffect, useState } from "react";
import { View, Image, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import useAppStore from "@/lib/state/app-store";
import { useAuthStore } from "@/lib/auth-store";

const { width } = Dimensions.get("window");

// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Check both auth stores
  const isAppAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);
  const creatorId = useAuthStore((s) => s.creatorId);

  const handleImageLoad = () => {
    console.log("Splash image loaded!");
    setIsReady(true);
    SplashScreen.hideAsync();
  };

  useEffect(() => {
    if (!isReady) return;

    // Navigate after 2 seconds once image is loaded
    const timer = setTimeout(() => {
      // Check if creator is logged in via authStore (Supabase-backed)
      if (creatorId) {
        router.replace("/creator");
        return;
      }

      // Check if user is logged in via appStore
      if (isAppAuthenticated && currentUser) {
        if (currentUser.role === "business") {
          router.replace("/business");
        } else if (currentUser.role === "creator") {
          router.replace("/creator");
        } else if (currentUser.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/home");
        }
        return;
      }

      // Not logged in, go to home
      router.replace("/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, [isReady, router, creatorId, isAppAuthenticated, currentUser]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
        onLoad={handleImageLoad}
        onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
      />
      {!isReady && (
        <ActivityIndicator size="large" color="#E85D04" style={styles.loader} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: width * 0.85,
    height: width * 0.85,
  },
  loader: {
    position: "absolute",
    bottom: 100,
  },
});
