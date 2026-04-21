import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface BackButtonProps {
  fallback?: string;
  color?: string;
  style?: ViewStyle;
}

export default function BackButton({
  fallback = "/(tabs)",
  color = "#1a1a2e",
  style,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback as any);
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Feather name="arrow-left" size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.93 }],
  },
});
