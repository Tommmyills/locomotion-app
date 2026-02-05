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
    setIsReady(true);
    SplashScreen.hideAsync();
  };

  useEffect(() => {
    if (!isReady) return;

    // Navigate after a short delay
    const timer = setTimeout(() => {
      try {
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
      } catch (error) {
        console.error("Navigation error:", error);
        router.replace("/home");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isReady, router, creatorId, isAppAuthenticated, currentUser]);

  // Fallback: if image doesn't load in 3 seconds, proceed anyway
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isReady) {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [isReady]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
        onLoad={handleImageLoad}
        onError={() => {
          // If image fails, proceed anyway
          setIsReady(true);
          SplashScreen.hideAsync();
        }}
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
