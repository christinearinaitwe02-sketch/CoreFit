import { isElevated } from "@/utils/roles";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PillButton } from "@/components/PillButton";
import { PremiumGateModal } from "@/components/PremiumGateModal";
import { SectionHeader } from "@/components/SectionHeader";
import {
  WorkoutTypeChip,
  getWorkoutMeta,
  WorkoutType,
} from "@/components/WorkoutTypeChip";
import {
  getWorkoutsByCategory,
  CATEGORY_COLOR,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  GUIDED_CATEGORIES,
  GuidedWorkoutCategory,
} from "@/data/hiitWorkouts";
import { getYoutubeThumbnail } from "@/components/YoutubePlayer";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const LEVEL_COLOR: Record<string, string> = {
  Beginner:     "#10B981",
  Intermediate: "#FF8C42",
  Advanced:     "#FF6B6B",
};

const FREE_PREVIEW_ID = "hiit-belly-blast";

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
  const router = useRouter();
  const { user, workouts, addWorkout, removeWorkout } = useApp();

  const [selectedType, setSelectedType] = useState<WorkoutType>("walking");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gateVisible, setGateVisible] = useState(false);

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
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
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

        {/* Guided Videos — shown when the selected type has video content */}
        {GUIDED_CATEGORIES.includes(selectedType as GuidedWorkoutCategory) && (() => {
          const cat = selectedType as GuidedWorkoutCategory;
          const guided = getWorkoutsByCategory(cat);
          const catColor = CATEGORY_COLOR[cat];
          const catLabel = CATEGORY_LABEL[cat];
          if (guided.length === 0) return null;
          return (
            <View style={styles.guidedSection}>
              <View style={styles.guidedHeader}>
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                  Guided {catLabel} Videos
                </Text>
                <View style={[styles.newBadge, { backgroundColor: catColor + "22" }]}>
                  <Feather name="play-circle" size={11} color={catColor} />
                  <Text style={[styles.newBadgeText, { color: catColor }]}>
                    Video
                  </Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.guidedCards}
              >
                {guided.map((w) => {
                  const lc = LEVEL_COLOR[w.level] ?? "#9B5DE5";
                  const isFree = w.id === FREE_PREVIEW_ID;
                  const isLocked = !user?.isPremium && !isElevated(user?.role) && !isFree;

                  return (
                    <TouchableOpacity
                      key={w.id}
                      activeOpacity={0.85}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if (isLocked) {
                          setGateVisible(true);
                        } else {
                          router.push(`/workout-video?id=${w.id}`);
                        }
                      }}
                      style={[styles.guidedCard, { backgroundColor: colors.card }]}
                    >
                      {/* Thumbnail */}
                      <View style={styles.thumbnail}>
                        <Image
                          source={{ uri: getYoutubeThumbnail(w.videoUrl) }}
                          style={styles.thumbImage}
                          resizeMode="cover"
                          blurRadius={isLocked ? 3 : 0}
                        />
                        {/* Gradient fade */}
                        <LinearGradient
                          colors={
                            isLocked
                              ? ["rgba(0,0,0,0.45)", "rgba(0,0,0,0.78)"]
                              : ["transparent", "rgba(0,0,0,0.65)"]
                          }
                          style={styles.thumbGradientOverlay}
                        />

                        {isLocked ? (
                          /* Lock overlay */
                          <View style={styles.playOverlay}>
                            <View style={styles.lockCircle}>
                              <Feather name="lock" size={18} color="#FFD700" />
                            </View>
                          </View>
                        ) : (
                          /* Play button */
                          <View style={styles.playOverlay}>
                            <View style={styles.playCircle}>
                              <Feather name="play" size={16} color="#fff" />
                            </View>
                          </View>
                        )}

                        {/* Duration badge — bottom right */}
                        <View style={styles.durationBadge}>
                          <Feather name="clock" size={9} color="#fff" />
                          <Text style={styles.durationText}>{w.duration}</Text>
                        </View>

                        {/* Free / Premium tag — top left */}
                        {isFree ? (
                          <View style={styles.freeTag}>
                            <Text style={styles.freeTagText}>Free Preview</Text>
                          </View>
                        ) : (
                          <View style={styles.premiumTag}>
                            <Feather name="star" size={9} color="#FFD700" />
                            <Text style={styles.premiumTagText}>Premium</Text>
                          </View>
                        )}
                      </View>

                      {/* Card body */}
                      <View style={styles.cardBody}>
                        <Text
                          style={[
                            styles.cardTitle,
                            { color: isLocked ? colors.mutedForeground : colors.foreground },
                          ]}
                          numberOfLines={2}
                        >
                          {w.title}
                        </Text>
                        <View style={[styles.levelPill, { backgroundColor: lc + "20" }]}>
                          <View style={[styles.levelDot, { backgroundColor: lc }]} />
                          <Text style={[styles.levelPillText, { color: lc }]}>
                            {w.level}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          );
        })()}

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
      <PremiumGateModal
        visible={gateVisible}
        onClose={() => setGateVisible(false)}
        featureName="Guided Video Workouts"
      />
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
  guidedSection: {
    marginBottom: 24,
  },
  guidedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  newBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  guidedCards: {
    paddingHorizontal: 20,
    gap: 12,
  },
  guidedCard: {
    width: 180,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  thumbnail: {
    height: 108,
    backgroundColor: "#1a1a2e",
    position: "relative",
    overflow: "hidden",
  },
  thumbImage: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.72)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  cardBody: {
    padding: 10,
    gap: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
  },
  levelPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  levelPillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.60)",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  freeTag: {
    position: "absolute",
    top: 7,
    left: 7,
    backgroundColor: "#10B981",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeTagText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  premiumTag: {
    position: "absolute",
    top: 7,
    left: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.4)",
  },
  premiumTagText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#FFD700",
    letterSpacing: 0.3,
  },
});
