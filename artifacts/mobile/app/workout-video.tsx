import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import { YoutubePlayer } from "@/components/YoutubePlayer";
import {
  findWorkoutById,
  ALL_GUIDED_WORKOUTS,
  CATEGORY_COLOR,
  CATEGORY_ICON,
  CATEGORY_LABEL,
} from "@/data/hiitWorkouts";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const LEVEL_COLOR: Record<string, string> = {
  Beginner:     "#10B981",
  Intermediate: "#FF8C42",
  Advanced:     "#FF6B6B",
};

export default function WorkoutVideoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addWorkout } = useApp();
  const { id } = useLocalSearchParams<{ id: string }>();

  const workout = findWorkoutById(id ?? "") ?? ALL_GUIDED_WORKOUTS[0];
  const levelColor  = LEVEL_COLOR[workout.level] ?? "#9B5DE5";
  const catColor    = CATEGORY_COLOR[workout.category] ?? "#6A0DAD";
  const catIcon     = CATEGORY_ICON[workout.category] ?? "activity";
  const catLabel    = CATEGORY_LABEL[workout.category] ?? "Workout";
  const topPad      = Platform.OS === "web" ? 67 : insets.top;

  const [completed, setCompleted] = useState(false);
  const [scale]    = useState(new Animated.Value(1));

  function handleComplete() {
    if (completed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    const today = new Date().toISOString().split("T")[0];
    addWorkout({
      date: today,
      type: workout.category as any,
      duration: workout.durationMinutes,
      calories: workout.estimatedCalories,
    });
    setCompleted(true);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header + player */}
      <LinearGradient
        colors={["#3D007A", "#6A0DAD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: topPad + 8 }}
      >
        <View style={styles.headerRow}>
          <BackButton color="#fff" fallback="/(tabs)/workout" />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Guided Workout
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.playerWrap}>
          <YoutubePlayer videoUrl={workout.videoUrl} height={210} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info card sits flush under the video */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.workoutTitle, { color: colors.foreground }]}>
            {workout.title}
          </Text>

          {/* Category + Level badges */}
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: catColor + "20" }]}>
              <Feather name={catIcon as any} size={11} color={catColor} />
              <Text style={[styles.badgeText, { color: catColor }]}>{catLabel}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: levelColor + "20" }]}>
              <Text style={[styles.badgeText, { color: levelColor }]}>{workout.level}</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={[styles.statsRow, { borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Feather name="clock" size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {workout.duration}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Duration
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Feather name="flame" size={18} color="#FF7F7F" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {workout.calories}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Est. Burn
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Feather name="bar-chart-2" size={18} color={levelColor} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {workout.level}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Level
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            How to Follow
          </Text>
          {workout.instructions.map((step, i) => (
            <View
              key={i}
              style={[styles.stepRow, { backgroundColor: colors.card }]}
            >
              <View style={[styles.stepNum, { backgroundColor: colors.primary + "18" }]}>
                <Text style={[styles.stepNumText, { color: colors.primary }]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Tip */}
        <View
          style={[
            styles.tipBox,
            { backgroundColor: "#6A0DAD12", borderColor: "#6A0DAD30" },
          ]}
        >
          <Feather name="info" size={16} color="#6A0DAD" />
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            Press play above and follow along. Pause anytime — listen to your body.
          </Text>
        </View>
      </ScrollView>

      {/* Mark as Complete — floating footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        {completed ? (
          <View style={[styles.completedRow, { backgroundColor: "#10B98118" }]}>
            <Feather name="check-circle" size={20} color="#10B981" />
            <Text style={styles.completedText}>Saved to your workout history!</Text>
          </View>
        ) : (
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleComplete}
              style={styles.completeBtn}
            >
              <LinearGradient
                colors={["#6A0DAD", "#FF7F7F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeBtnGradient}
              >
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.completeBtnText}>Mark as Complete</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  playerWrap: {
    marginHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  infoCard: {
    marginHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
  },
  statValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  tipBox: {
    marginHorizontal: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  completeBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  completeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  completeBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  completedText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#10B981",
  },
});
