import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/useColors";

export type WorkoutType =
  | "walking"
  | "jogging"
  | "cardio"
  | "strength"
  | "hiit"
  | "yoga"
  | "cycling"
  | "other";

interface WorkoutTypeChipProps {
  type: WorkoutType;
  selected?: boolean;
  onPress?: () => void;
}

const WORKOUT_META: Record<
  WorkoutType,
  { label: string; icon: string; color: string }
> = {
  walking:  { label: "Walking",  icon: "navigation",    color: "#10B981" },
  jogging:  { label: "Jogging",  icon: "activity",      color: "#FF8C42" },
  cardio:   { label: "Cardio",   icon: "heart",         color: "#FF6B6B" },
  strength: { label: "Strength", icon: "zap",           color: "#9B5DE5" },
  hiit:     { label: "HIIT",     icon: "trending-up",   color: "#FF8FAB" },
  yoga:     { label: "Yoga",     icon: "wind",          color: "#38BDF8" },
  cycling:  { label: "Cycling",  icon: "circle",        color: "#34D399" },
  other:    { label: "Other",    icon: "more-horizontal",color: "#94A3B8" },
};

export function getWorkoutMeta(type: WorkoutType | string) {
  return (WORKOUT_META as Record<string, { label: string; icon: string; color: string }>)[type] ?? WORKOUT_META.other;
}

export function WorkoutTypeChip({
  type,
  selected = false,
  onPress,
}: WorkoutTypeChipProps) {
  const colors = useColors();
  const meta = getWorkoutMeta(type);
  const bg = selected ? meta.color : meta.color + "18";
  const fg = selected ? "#fff" : meta.color;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, { backgroundColor: bg }]}
    >
      <Feather name={meta.icon as any} size={14} color={fg} />
      <Text style={[styles.label, { color: fg }]}>{meta.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
