import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PillButton } from "@/components/PillButton";
import { SectionHeader } from "@/components/SectionHeader";
import {
  WorkoutTypeChip,
  getWorkoutMeta,
  WorkoutType,
} from "@/components/WorkoutTypeChip";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const WORKOUT_TYPES: WorkoutType[] = [
  "walking",
  "jogging",
  "cardio",
  "strength",
  "hiit",
  "yoga",
  "cycling",
  "other",
];

const CALORIE_RATES: Record<WorkoutType, number> = {
  walking:  3.3,
  jogging:  5.8,
  cardio:   6.7,
  strength: 6,
  hiit:     11,
  yoga:     3,
  cycling:  8,
  other:    6,
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function WorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workouts, addWorkout, removeWorkout } = useApp();

  const [selectedType, setSelectedType] = useState<WorkoutType>("walking");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const estimatedCalories = Math.round(
    (elapsed / 60) * CALORIE_RATES[selectedType]
  );

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunning(true);
  }, []);

  const handlePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRunning(false);
  }, []);

  const handleSave = useCallback(() => {
    if (elapsed < 30) {
      Alert.alert("Too short", "Workout must be at least 30 seconds.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const today = new Date().toISOString().split("T")[0];
    addWorkout({
      date: today,
      type: selectedType,
      duration: Math.round(elapsed / 60),
      calories: estimatedCalories,
    });
    setRunning(false);
    setElapsed(0);
    Alert.alert("Saved!", `Great work! You burned ~${estimatedCalories} kcal.`);
  }, [elapsed, selectedType, estimatedCalories, addWorkout]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
  }, []);

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Workout
          </Text>
        </View>

        {/* Timer Card */}
        <View
          style={[
            styles.timerCard,
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={[styles.timerLabel, { color: "#ffffff99" }]}>
            {running ? "Active Session" : elapsed > 0 ? "Paused" : "Ready"}
          </Text>
          <Text style={styles.timer}>{formatTime(elapsed)}</Text>
          <Text style={[styles.calorieEstimate, { color: "#ffffffbb" }]}>
            ~{estimatedCalories} kcal burned
          </Text>

          {/* Controls */}
          <View style={styles.timerControls}>
            {!running && elapsed > 0 && (
              <TouchableOpacity
                onPress={handleReset}
                style={[styles.iconBtn, { backgroundColor: "#ffffff22" }]}
              >
                <Feather name="rotate-ccw" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={running ? handlePause : handleStart}
              activeOpacity={0.8}
              style={[styles.playBtn, { backgroundColor: "#fff" }]}
            >
              <Feather
                name={running ? "pause" : "play"}
                size={26}
                color={colors.primary}
              />
            </TouchableOpacity>
            {elapsed > 0 && (
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.iconBtn, { backgroundColor: "#ffffff22" }]}
              >
                <Feather name="check" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Workout Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            Workout Type
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {WORKOUT_TYPES.map((t) => (
              <WorkoutTypeChip
                key={t}
                type={t}
                selected={selectedType === t}
                onPress={() => {
                  setSelectedType(t);
                  Haptics.selectionAsync();
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* History */}
        <SectionHeader title="History" />
        {sortedWorkouts.length === 0 ? (
          <View
            style={[styles.emptyHistory, { backgroundColor: colors.card }]}
          >
            <Feather name="zap" size={28} color={colors.primary + "66"} />
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              No workouts yet. Start your first session!
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {sortedWorkouts.map((w) => {
              const meta = getWorkoutMeta(w.type);
              return (
                <View
                  key={w.id}
                  style={[styles.histItem, { backgroundColor: colors.card }]}
                >
                  <View
                    style={[
                      styles.histIcon,
                      { backgroundColor: meta.color + "18" },
                    ]}
                  >
                    <Feather
                      name={meta.icon as any}
                      size={20}
                      color={meta.color}
                    />
                  </View>
                  <View style={styles.histInfo}>
                    <Text
                      style={[styles.histType, { color: colors.foreground }]}
                    >
                      {meta.label}
                    </Text>
                    <Text
                      style={[styles.histDate, { color: colors.mutedForeground }]}
                    >
                      {w.date} · {w.duration} min
                    </Text>
                  </View>
                  <View style={styles.histRight}>
                    <Text style={[styles.histCals, { color: colors.primary }]}>
                      {w.calories} kcal
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        removeWorkout(w.id);
                      }}
                    >
                      <Feather
                        name="trash-2"
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  timerCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
    shadowColor: "#9B5DE5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  timerLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  timer: {
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -2,
  },
  calorieEstimate: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 20,
  },
  timerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
  },
  historyList: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  histItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  histIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  histInfo: { flex: 1, gap: 2 },
  histType: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  histDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  histRight: { alignItems: "flex-end", gap: 6 },
  histCals: { fontSize: 14, fontFamily: "Inter_700Bold" },
  emptyHistory: {
    marginHorizontal: 20,
    padding: 28,
    borderRadius: 16,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
