import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface GradientCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  progress?: number;
  goal?: number | string;
}

export function GradientCard({
  title,
  value,
  subtitle,
  icon,
  color,
  bgColor,
  onPress,
  style,
  progress,
  goal,
}: GradientCardProps) {
  const colors = useColors();

  const cardBg = bgColor ?? colors.purpleLight;
  const accentColor = color ?? colors.primary;

  const content = (
    <View style={[styles.card, { backgroundColor: cardBg }, style]}>
      <View style={styles.header}>
        {icon && (
          <View
            style={[styles.iconWrap, { backgroundColor: accentColor + "22" }]}
          >
            {icon}
          </View>
        )}
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      )}
      {progress !== undefined && goal !== undefined && (
        <View style={styles.progressWrap}>
          <View style={[styles.progressBg, { backgroundColor: accentColor + "22" }]}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: accentColor,
                  width: `${Math.min(progress * 100, 100)}%` as any,
                },
              ]}
            />
          </View>
          <Text style={[styles.goalText, { color: colors.mutedForeground }]}>
            Goal: {goal}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  progressWrap: {
    marginTop: 8,
    gap: 4,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  goalText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
