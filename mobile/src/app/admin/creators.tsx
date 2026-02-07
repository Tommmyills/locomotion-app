import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CheckCircle, Clock, Instagram, Youtube, Facebook } from "lucide-react-native";
import { PillButton } from "@/components/PillButton";
import useAppStore, { Platform } from "@/lib/state/app-store";

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  const color = "#6b7280";
  switch (platform) {
    case "instagram":
      return <Instagram size={size} color={color} />;
    case "tiktok":
      return <Youtube size={size} color={color} />;
    case "facebook":
      return <Facebook size={size} color={color} />;
    default:
      return null;
  }
}

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default function ManageCreatorsScreen() {
  const creators = useAppStore((s) => s.creators);
  const approveCreator = useAppStore((s) => s.approveCreator);

  const pendingCreators = creators.filter((c) => !c.approved);
  const approvedCreators = creators.filter((c) => c.approved);

  const handleApprove = (creatorId: string) => {
    approveCreator(creatorId);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Pending Creators */}
        {pendingCreators.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="mb-6"
          >
            <Text className="text-black font-semibold text-base mb-4 mt-4">
              Pending Approval ({pendingCreators.length})
            </Text>

            {pendingCreators.map((creator, index) => (
              <Animated.View
                key={creator.id}
                entering={FadeInDown.delay(index * 50).duration(400)}
              >
                <View
                  className="rounded-2xl bg-white p-4 mb-3"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 2,
                    borderColor: "#fbbf24",
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <Image
                      source={{ uri: creator.photo }}
                      className="w-14 h-14 rounded-full mr-3"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base">
                        {creator.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <PlatformIcon platform={creator.platform} />
                        <Text className="text-gray-500 text-sm ml-1 capitalize">
                          {creator.platform}
                        </Text>
                        <Text className="text-gray-400 mx-2">•</Text>
                        <Text className="text-gray-500 text-sm">
                          {formatFollowers(creator.followerCount)} followers
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
                      <Clock size={12} color="#ca8a04" />
                      <Text className="text-yellow-600 text-xs ml-1">
                        Pending
                      </Text>
                    </View>
                  </View>

                  <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>
                    {creator.bio}
                  </Text>

                  <PillButton
                    title="Approve Creator"
                    onPress={() => handleApprove(creator.id)}
                    variant="black"
                    size="sm"
                  />
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Approved Creators */}
        <Animated.View
          entering={FadeInDown.delay(pendingCreators.length * 50 + 100).duration(400)}
          className="mb-6"
        >
          <Text className="text-black font-semibold text-base mb-4">
            Approved Creators ({approvedCreators.length})
          </Text>

          {approvedCreators.map((creator, index) => (
            <Animated.View
              key={creator.id}
              entering={FadeInDown.delay(pendingCreators.length * 50 + 100 + index * 30).duration(400)}
            >
              <View
                className="rounded-2xl bg-gray-50 p-4 mb-3"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              >
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: creator.photo }}
                    className="w-12 h-12 rounded-full mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-black font-semibold">
                      {creator.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <PlatformIcon platform={creator.platform} />
                      <Text className="text-gray-500 text-sm ml-1 capitalize">
                        {creator.platform}
                      </Text>
                      <Text className="text-gray-400 mx-2">•</Text>
                      <Text className="text-gray-500 text-sm">
                        {formatFollowers(creator.followerCount)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle size={12} color="#16a34a" />
                    <Text className="text-green-600 text-xs ml-1">
                      Approved
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
