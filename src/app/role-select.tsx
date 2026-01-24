import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, Building2, Sparkles, Shield } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import useAppStore, { UserRole } from "@/lib/state/app-store";
import { cn } from "@/lib/cn";

const roles: { id: UserRole; title: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "business",
    title: "Business",
    description: "Book ad slots from local creators",
    icon: <Building2 size={24} color="#000" />,
  },
  {
    id: "creator",
    title: "Creator",
    description: "Offer ad slots to local businesses",
    icon: <Sparkles size={24} color="#000" />,
  },
  {
    id: "admin",
    title: "Admin",
    description: "Manage creators and bookings",
    icon: <Shield size={24} color="#000" />,
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"role" | "info">("role");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setStep("info");
    }
  };

  const handleLogin = () => {
    if (selectedRole && name.trim() && email.trim()) {
      login(email.trim(), selectedRole, name.trim());

      // Navigate based on role
      if (selectedRole === "business") {
        router.replace("/business");
      } else if (selectedRole === "creator") {
        router.replace("/creator");
      } else if (selectedRole === "admin") {
        router.replace("/admin");
      }
    }
  };

  const handleBack = () => {
    if (step === "info") {
      setStep("role");
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* Header */}
          <Pressable onPress={handleBack} className="py-4 -ml-2">
            <ArrowLeft size={24} color="#000" />
          </Pressable>

          {step === "role" ? (
            <Animated.View entering={FadeInDown.duration(400)} className="flex-1">
              <Text className="text-black text-2xl font-bold mb-2">
                How will you use LOCO•MOTION?
              </Text>
              <Text className="text-gray-500 text-base mb-8">
                Select your role to get started
              </Text>

              {/* Role Options */}
              <View className="flex-1">
                {roles.map((role, index) => (
                  <Animated.View
                    key={role.id}
                    entering={FadeInDown.delay(index * 100).duration(400)}
                  >
                    <Pressable
                      onPress={() => handleRoleSelect(role.id)}
                      className="mb-4"
                    >
                      <View
                        className={cn(
                          "rounded-2xl p-5 flex-row items-center",
                          selectedRole === role.id ? "bg-black" : "bg-white"
                        )}
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: selectedRole === role.id ? 0.15 : 0.08,
                          shadowRadius: 8,
                          elevation: 3,
                          borderWidth: 1,
                          borderColor:
                            selectedRole === role.id
                              ? "#ef4444"
                              : "rgba(0,0,0,0.05)",
                        }}
                      >
                        <View
                          className={cn(
                            "w-12 h-12 rounded-full items-center justify-center mr-4",
                            selectedRole === role.id ? "bg-white" : "bg-gray-100"
                          )}
                        >
                          {role.icon}
                        </View>
                        <View className="flex-1">
                          <Text
                            className={cn(
                              "font-semibold text-lg",
                              selectedRole === role.id ? "text-white" : "text-black"
                            )}
                          >
                            {role.title}
                          </Text>
                          <Text
                            className={cn(
                              "text-sm",
                              selectedRole === role.id
                                ? "text-gray-300"
                                : "text-gray-500"
                            )}
                          >
                            {role.description}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>

              {/* Continue Button */}
              <View className="pb-6">
                <PillButton
                  title="Continue"
                  onPress={handleContinue}
                  variant="black"
                  size="lg"
                  disabled={!selectedRole}
                />
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(400)} className="flex-1">
              <Text className="text-black text-2xl font-bold mb-2">
                Enter your details
              </Text>
              <Text className="text-gray-500 text-base mb-8">
                We'll use this to identify you
              </Text>

              {/* Input Fields */}
              <View className="flex-1">
                <Text className="text-black font-medium mb-2">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 rounded-xl px-4 py-4 text-black text-base mb-6"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.05)",
                  }}
                />

                <Text className="text-black font-medium mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-gray-50 rounded-xl px-4 py-4 text-black text-base"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.05)",
                  }}
                />
              </View>

              {/* Login Button */}
              <View className="pb-6">
                <PillButton
                  title={`Continue as ${selectedRole}`}
                  onPress={handleLogin}
                  variant="black"
                  size="lg"
                  disabled={!name.trim() || !email.trim()}
                />
              </View>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
