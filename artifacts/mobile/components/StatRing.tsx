import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface StatRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  value: string;
}

export function StatRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color,
  label,
  value,
}: StatRingProps) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={accentColor + "22"}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[styles.value, { color: colors.foreground, fontSize: size * 0.22 }]}>
            {value}
          </Text>
        </View>
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
