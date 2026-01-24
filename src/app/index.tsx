import React, { useEffect } from "react";
import { View, Image, Dimensions, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

const { width } = Dimensions.get("window");

export default function SplashScreenPage() {
  const router = useRouter();

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync();

    // Navigate to home after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
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
});
