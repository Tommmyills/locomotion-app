import React, { useEffect, useState } from "react";
import { View, Image, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

const { width } = Dimensions.get("window");

// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const handleImageLoad = () => {
    console.log("Splash image loaded!");
    setIsReady(true);
    SplashScreen.hideAsync();
  };

  useEffect(() => {
    if (!isReady) return;

    // Navigate to home after 2.5 seconds once image is loaded
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [isReady, router]);

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
