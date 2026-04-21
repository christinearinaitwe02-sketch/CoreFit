import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { PremiumGate } from "@/components/PremiumGate";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  CHALLENGE_DAYS,
  PHASE_META,
  WORKOUT_COLOR,
  WORKOUT_ICON,
  ChallengeDay,
} from "@/data/challengeProgram";

const PHASES = [1, 2, 3] as const;
type Phase = typeof PHASES[number];

function PhaseTab({
  phase,
  active,
  onPress,
}: {
  phase: Phase;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const meta = PHASE_META[phase];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.phaseTab,
        active
          ? { backgroundColor: meta.color }
          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
      ]}
    >
      <Text
        style={[
          styles.phaseTabLabel,
          { color: active ? "#fff" : colors.mutedForeground },
        ]}
      >
        {meta.label}
      </Text>
      <Text
        style={[
          styles.phaseTabRange,
          { color: active ? "rgba(255,255,255,0.75)" : colors.mutedForeground },
        ]}
      >
        {meta.range}
      </Text>
    </TouchableOpacity>
  );
}

function DayCard({
  item,
  isToday,
  isCompleted,
  isFuture,
  onComplete,
  onVideoPress,
}: {
  item: ChallengeDay;
  isToday: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  onComplete: () => void;
  onVideoPress: () => void;
}) {
  const colors = useColors();
  const typeColor = WORKOUT_COLOR[item.workoutType];
  const typeIcon = WORKOUT_ICON[item.workoutType] as any;
  const isRest = item.workoutType === "rest";

  return (
    <View
      style={[
        styles.dayCard,
        {
          backgroundColor: colors.card,
          opacity: isFuture ? 0.55 : 1,
          borderWidth: isToday ? 2 : 0,
          borderColor: isToday ? colors.primary : "transparent",
        },
      ]}
    >
      {/* Today indicator ribbon */}
      {isToday && (
        <View style={[styles.todayRibbon, { backgroundColor: colors.primary }]}>
          <Text style={styles.todayRibbonText}>TODAY</Text>
        </View>
      )}

      {/* Left: day badge */}
      <View style={[styles.dayBadge, { backgroundColor: typeColor + "22" }]}>
        {isCompleted ? (
          <Feather name="check-circle" size={20} color="#10B981" />
        ) : (
          <Feather name={typeIcon} size={20} color={typeColor} />
        )}
        <Text style={[styles.dayNumber, { color: isCompleted ? "#10B981" : typeColor }]}>
          {item.day}
        </Text>
      </View>

      {/* Centre: content */}
      <View style={styles.dayContent}>
        <View style={styles.dayTopRow}>
          <View style={[styles.workoutBadge, { backgroundColor: typeColor + "22" }]}>
            <Text style={[styles.workoutBadgeText, { color: typeColor }]}>
              {item.workoutType.charAt(0).toUpperCase() + item.workoutType.slice(1)}
            </Text>
          </View>
          {!isRest && (
            <Text style={[styles.duration, { color: colors.mutedForeground }]}>
              {item.duration} min
            </Text>
          )}
        </View>
        <Text
          style={[styles.motivation, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {item.motivation}
        </Text>

        {/* Action row */}
        {!isFuture && (
          <View style={styles.actionRow}>
            {item.videoId && !isRest && (
              <TouchableOpacity
                style={[styles.videoBtn, { borderColor: colors.primary + "55" }]}
                onPress={onVideoPress}
                activeOpacity={0.8}
              >
                <Feather name="play-circle" size={14} color={colors.primary} />
                <Text style={[styles.videoBtnText, { color: colors.primary }]}>
                  Watch workout
                </Text>
              </TouchableOpacity>
            )}
            {!isCompleted && (isToday || !isFuture) && (
              <TouchableOpacity
                style={[
                  styles.completeBtn,
                  { backgroundColor: isToday ? colors.primary : colors.card,
                    borderColor: isToday ? colors.primary : colors.border,
                    borderWidth: isToday ? 0 : 1 },
                ]}
                onPress={onComplete}
                activeOpacity={0.85}
              >
                <Feather
                  name="check"
                  size={13}
                  color={isToday ? "#fff" : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.completeBtnText,
                    { color: isToday ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  Mark complete
                </Text>
              </TouchableOpacity>
            )}
            {isCompleted && (
              <View style={styles.completedTag}>
                <Feather name="check-circle" size={13} color="#10B981" />
                <Text style={styles.completedTagText}>Completed</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export default function ChallengeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    user,
    challengeStartDate,
    startChallenge,
    getChallengeDay,
    completedChallengeDays,
    markDayComplete,
  } = useApp();

  const currentDay = getChallengeDay();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [activePhase, setActivePhase] = useState<Phase>(() => {
    if (currentDay > 60) return 3;
    if (currentDay > 30) return 2;
    return 1;
  });

  const flatListRef = useRef<FlatList>(null);

  const phasedays = CHALLENGE_DAYS.filter((d) => d.phase === activePhase);

  const handleComplete = useCallback(
    (day: number) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      markDayComplete(day);
    },
    [markDayComplete]
  );

  const handleVideoPress = useCallback(
    (videoId: string) => {
      router.push(`/workout-video?id=${videoId}`);
    },
    [router]
  );

  const handleStart = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startChallenge();
  }, [startChallenge]);

  const totalCompleted = completedChallengeDays.length;
  const phaseCompleted = completedChallengeDays.filter(
    (d) => d >= PHASE_META[activePhase === 1 ? 1 : activePhase === 2 ? 2 : 3].range.split("–")[0].replace("Days ", "").trim() as unknown as number
  ).length;

  const phase1Completed = completedChallengeDays.filter((d) => d >= 1 && d <= 30).length;
  const phase2Completed = completedChallengeDays.filter((d) => d >= 31 && d <= 60).length;
  const phase3Completed = completedChallengeDays.filter((d) => d >= 61 && d <= 90).length;

  const currentMeta = PHASE_META[activePhase];

  if (!user?.isPremium) {
    return (
      <View style={[styles.gateWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.gateBack, { top: topPad + 8 }]}>
          <BackButton color="#fff" fallback="/(tabs)" />
        </View>
        <PremiumGate feature="90-Day Transformation Program">
          <></>
        </PremiumGate>
        <BottomNav active="home" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <LinearGradient
        colors={["#3D007A", "#6A0DAD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <BackButton color="#fff" fallback="/(tabs)" />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>90-Day Journey</Text>
            <Text style={styles.headerSub}>Build your core. Transform your confidence.</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Progress overview */}
        {challengeStartDate ? (
          <View style={styles.overviewRow}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewNum}>{totalCompleted}</Text>
              <Text style={styles.overviewLabel}>Days done</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewNum}>{Math.max(0, currentDay)}</Text>
              <Text style={styles.overviewLabel}>Current day</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewNum}>{Math.max(0, 90 - totalCompleted)}</Text>
              <Text style={styles.overviewLabel}>Remaining</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.startBtn}
            activeOpacity={0.85}
            onPress={handleStart}
          >
            <Feather name="award" size={18} color="#6A0DAD" />
            <Text style={styles.startBtnText}>Start My 90-Day Journey</Text>
          </TouchableOpacity>
        )}

        {/* Overall bar */}
        <View style={styles.overallBar}>
          <View style={styles.overallBarBg}>
            <View
              style={[
                styles.overallBarFill,
                { width: `${Math.min(100, (totalCompleted / 90) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.overallBarLabel}>{totalCompleted}/90 completed</Text>
        </View>
      </LinearGradient>

      {/* ── Phase tabs ── */}
      <View style={[styles.phaseTabs, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phaseTabsInner}>
          {PHASES.map((p) => (
            <PhaseTab
              key={p}
              phase={p}
              active={activePhase === p}
              onPress={() => setActivePhase(p)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Phase header bar ── */}
      <View style={[styles.phaseHeader, { backgroundColor: colors.card }]}>
        <View style={[styles.phaseColorDot, { backgroundColor: currentMeta.color }]} />
        <View style={styles.phaseHeaderText}>
          <Text style={[styles.phaseHeaderTitle, { color: colors.foreground }]}>
            Phase {activePhase}: {currentMeta.label}
          </Text>
          <Text style={[styles.phaseHeaderDesc, { color: colors.mutedForeground }]}>
            {currentMeta.description}
          </Text>
        </View>
        <Text style={[styles.phaseProgress, { color: currentMeta.color }]}>
          {activePhase === 1 ? phase1Completed : activePhase === 2 ? phase2Completed : phase3Completed}/30
        </Text>
      </View>

      {/* ── Day list ── */}
      <FlatList
        ref={flatListRef}
        data={phasedays}
        keyExtractor={(item) => String(item.day)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isCompleted = completedChallengeDays.includes(item.day);
          const isToday = challengeStartDate ? item.day === currentDay : false;
          const isFuture = challengeStartDate
            ? item.day > currentDay
            : item.day > 1;
          return (
            <DayCard
              item={item}
              isToday={isToday}
              isCompleted={isCompleted}
              isFuture={isFuture}
              onComplete={() => handleComplete(item.day)}
              onVideoPress={() => item.videoId && handleVideoPress(item.videoId)}
            />
          );
        }}
      />
      <BottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gateWrap: { flex: 1 },
  gateBack: { position: "absolute", left: 16, zIndex: 10 },

  /* Header */
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  headerSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },

  /* Overview stats */
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 14,
  },
  overviewStat: { alignItems: "center" },
  overviewNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  overviewLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  overviewDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  /* Start button (no challenge yet) */
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  startBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#6A0DAD",
  },

  /* Overall bar */
  overallBar: { gap: 4 },
  overallBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  overallBarFill: {
    height: "100%",
    backgroundColor: "#FF7F7F",
    borderRadius: 3,
  },
  overallBarLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    textAlign: "right",
  },

  /* Phase tabs */
  phaseTabs: { paddingVertical: 10 },
  phaseTabsInner: { paddingHorizontal: 16, gap: 10, flexDirection: "row" },
  phaseTab: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 100,
    alignItems: "center",
  },
  phaseTabLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  phaseTabRange: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },

  /* Phase header bar */
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  phaseColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  phaseHeaderText: { flex: 1 },
  phaseHeaderTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  phaseHeaderDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  phaseProgress: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

  /* List */
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },

  /* Day card */
  dayCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    overflow: "hidden",
  },
  todayRibbon: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  todayRibbonText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 1,
  },
  dayBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    flexShrink: 0,
  },
  dayNumber: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  dayContent: { flex: 1, gap: 6 },
  dayTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  workoutBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  workoutBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  duration: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  motivation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  videoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  videoBtnText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  completeBtnText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  completedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedTagText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#10B981",
  },
});
