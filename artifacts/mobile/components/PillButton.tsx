import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function PillButton({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  icon,
}: PillButtonProps) {
  const colors = useColors();

  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
      ? colors.peachLight
      : variant === "danger"
      ? colors.destructive
      : "transparent";

  const textColor =
    variant === "primary"
      ? "#fff"
      : variant === "secondary"
      ? colors.peach
      : variant === "danger"
      ? "#fff"
      : colors.primary;

  const paddingVertical = size === "sm" ? 8 : size === "lg" ? 16 : 12;
  const paddingHorizontal = size === "sm" ? 16 : size === "lg" ? 32 : 24;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 17 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: bgColor,
          paddingVertical,
          paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === "ghost" ? 1.5 : 0,
          borderColor: variant === "ghost" ? colors.primary : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              { color: textColor, fontSize },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
