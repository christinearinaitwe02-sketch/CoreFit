import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import { YoutubePlayer } from "@/components/YoutubePlayer";
import { HIIT_WORKOUTS } from "@/data/hiitWorkouts";
import { useColors } from "@/hooks/useColors";

const LEVEL_COLOR: Record<string, string> = {
  Beginner:     "#10B981",
  Intermediate: "#FF8C42",
  Advanced:     "#FF6B6B",
};

export default function WorkoutVideoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const workout = HIIT_WORKOUTS.find((w) => w.id === id) ?? HIIT_WORKOUTS[0];
  const levelColor = LEVEL_COLOR[workout.level] ?? "#9B5DE5";
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#3D007A", "#6A0DAD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <BackButton color="#fff" fallback="/(tabs)/workout" />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Guided Workout
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Video Player */}
        <View style={styles.playerWrap}>
          <YoutubePlayer videoUrl={workout.videoUrl} height={210} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info card */}
        <View
          style={[styles.infoCard, { backgroundColor: colors.card }]}
        >
          {/* Title + level */}
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={[styles.workoutTitle, { color: colors.foreground }]}>
                {workout.title}
              </Text>
              <View style={styles.badges}>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: levelColor + "20" },
                  ]}
                >
                  <Text style={[styles.levelText, { color: levelColor }]}>
                    {workout.level}
                  </Text>
                </View>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: "#6A0DAD18" },
                  ]}
                >
                  <Feather name="zap" size={11} color="#6A0DAD" />
                  <Text style={[styles.levelText, { color: "#6A0DAD" }]}>
                    HIIT
                  </Text>
                </View>
              </View>
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
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.statItem}>
              <Feather name="flame" size={18} color="#FF7F7F" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {workout.calories}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Est. Burn
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
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
              <View
                style={[
                  styles.stepNumber,
                  { backgroundColor: colors.primary + "18" },
                ]}
              >
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
            Press play in the video above and follow along. Pause anytime to
            rest — listen to your body.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingBottom: 0,
  },
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
    marginBottom: 0,
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleBlock: { flex: 1 },
  workoutTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  levelText: {
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
  stepNumber: {
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
    marginBottom: 8,
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
});
