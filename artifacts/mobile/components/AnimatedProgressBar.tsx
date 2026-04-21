import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface AnimatedProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function AnimatedProgressBar({
  progress,
  color,
  height = 8,
  backgroundColor,
}: AnimatedProgressBarProps) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.min(progress, 1),
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [progress]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: backgroundColor ?? (color ?? colors.primary) + "22",
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width,
            height,
            borderRadius: height / 2,
            backgroundColor: color ?? colors.primary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    width: "100%",
  },
  fill: {},
});
