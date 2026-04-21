import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatRing } from "@/components/StatRing";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { WorkoutTypeChip, getWorkoutMeta } from "@/components/WorkoutTypeChip";
import { useApp, useGoals } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, workouts, meals, getTodaySummary } = useApp();
  const goals = useGoals();

  const summary = useMemo(() => getTodaySummary(), [getTodaySummary]);
  const today = new Date().toISOString().split("T")[0];
  const todayWorkouts = workouts.filter((w) => w.date === today).slice(0, 3);
  const todayMeals = meals.filter((m) => m.date === today).slice(0, 3);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalCalMeals = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {greeting()}
            </Text>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {user?.name ?? "Athlete"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/(tabs)/profile");
            }}
            style={[styles.avatar, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.avatarText}>
              {(user?.name ?? "A")[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date banner */}
        <View style={[styles.dateBanner, { backgroundColor: colors.primaryLight }]}>
          <Feather name="calendar" size={13} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.primary }]}>
            {formatDate(today)}
          </Text>
        </View>

        {/* ── Hero Stats Card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Today's Progress
          </Text>
          <View style={styles.rings}>
            <StatRing
              progress={summary.caloriesBurned / goals.calories}
              label="Calories"
              value={`${summary.caloriesBurned}`}
              color={colors.primary}
              size={78}
            />
            <StatRing
              progress={summary.waterGlasses / goals.water}
              label="Water"
              value={`${summary.waterGlasses}`}
              color={colors.secondary}
              size={78}
            />
            <StatRing
              progress={summary.sleepHours / goals.sleep}
              label="Sleep"
              value={`${summary.sleepHours}h`}
              color="#818CF8"
              size={78}
            />
            <StatRing
              progress={summary.mealsLogged / 3}
              label="Meals"
              value={`${summary.mealsLogged}`}
              color={colors.peach}
              size={78}
            />
          </View>

          {/* Goal bars */}
          <View style={styles.goalBars}>
            <GoalBar
              label="Calories burned"
              current={summary.caloriesBurned}
              goal={goals.calories}
              color={colors.primary}
              unit="kcal"
            />
            <GoalBar
              label="Water intake"
              current={summary.waterGlasses}
              goal={goals.water}
              color="#38BDF8"
              unit=" glasses"
            />
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.qaGrid}>
          <QuickAction
            icon="zap"
            label="Workout"
            color={colors.primary}
            bg={colors.primaryLight}
            onPress={() => router.push("/(tabs)/workout")}
          />
          <QuickAction
            icon="coffee"
            label="Meals"
            color={colors.peach}
            bg={colors.peachLight}
            onPress={() => router.push("/(tabs)/log")}
          />
          <QuickAction
            icon="droplet"
            label="Water"
            color="#38BDF8"
            bg="#E0F7FF"
            onPress={() => router.push("/(tabs)/log")}
          />
          <QuickAction
            icon="bar-chart-2"
            label="Progress"
            color="#818CF8"
            bg="#EEF2FF"
            onPress={() => router.push("/(tabs)/progress")}
          />
        </View>

        {/* ── Calories from meals ── */}
        {totalCalMeals > 0 && (
          <View style={[styles.calBanner, { backgroundColor: colors.peachLight }]}>
            <Feather name="info" size={14} color={colors.peach} />
            <Text style={[styles.calBannerText, { color: colors.peach }]}>
              {totalCalMeals} kcal consumed from {todayMeals.length} meal{todayMeals.length !== 1 ? "s" : ""} today
            </Text>
          </View>
        )}

        {/* ── Today's Workouts ── */}
        <SectionHeader
          title="Today's Workouts"
          action={todayWorkouts.length > 0 ? "See all" : undefined}
          onAction={() => router.push("/(tabs)/workout")}
        />
        {todayWorkouts.length === 0 ? (
          <EmptyCard
            icon="zap"
            message="No workouts yet. Start your first session!"
            color={colors.primary}
            onPress={() => router.push("/(tabs)/workout")}
            colors={colors}
          />
        ) : (
          <View style={styles.list}>
            {todayWorkouts.map((w) => {
              const meta = getWorkoutMeta(w.type);
              return (
                <View key={w.id} style={[styles.listItem, { backgroundColor: colors.card }]}>
                  <View style={[styles.listIcon, { backgroundColor: meta.color + "18" }]}>
                    <Feather name={meta.icon as any} size={18} color={meta.color} />
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={[styles.listTitle, { color: colors.foreground }]}>
                      {meta.label}
                    </Text>
                    <Text style={[styles.listSub, { color: colors.mutedForeground }]}>
                      {w.duration} min
                    </Text>
                  </View>
                  <View style={[styles.calBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.calBadgeText, { color: colors.primary }]}>
                      {w.calories} kcal
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Today's Meals ── */}
        <SectionHeader
          title="Today's Meals"
          action={todayMeals.length > 0 ? "See all" : undefined}
          onAction={() => router.push("/(tabs)/log")}
        />
        {todayMeals.length === 0 ? (
          <EmptyCard
            icon="coffee"
            message="No meals logged yet. Add your first meal!"
            color={colors.peach}
            onPress={() => router.push("/(tabs)/log")}
            colors={colors}
          />
        ) : (
          <View style={styles.list}>
            {todayMeals.map((m) => (
              <View key={m.id} style={[styles.listItem, { backgroundColor: colors.card }]}>
                <View style={[styles.listIcon, { backgroundColor: colors.peachLight }]}>
                  <Feather name="coffee" size={18} color={colors.peach} />
                </View>
                <View style={styles.listInfo}>
                  <Text style={[styles.listTitle, { color: colors.foreground }]}>
                    {m.name}
                  </Text>
                  <Text style={[styles.listSub, { color: colors.mutedForeground }]}>
                    {m.category.charAt(0).toUpperCase() + m.category.slice(1)}
                  </Text>
                </View>
                {m.calories ? (
                  <View style={[styles.calBadge, { backgroundColor: colors.peachLight }]}>
                    <Text style={[styles.calBadgeText, { color: colors.peach }]}>
                      {m.calories} kcal
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function GoalBar({
  label,
  current,
  goal,
  color,
  unit,
}: {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit: string;
}) {
  const colors = useColors();
  return (
    <View style={goalBarStyles.wrap}>
      <View style={goalBarStyles.row}>
        <Text style={[goalBarStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[goalBarStyles.value, { color }]}>
          {current}
          <Text style={[goalBarStyles.goal, { color: colors.mutedForeground }]}>/{goal}{unit}</Text>
        </Text>
      </View>
      <AnimatedProgressBar progress={current / goal} color={color} height={6} />
    </View>
  );
}

const goalBarStyles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12, fontFamily: "Inter_400Regular" },
  value: { fontSize: 12, fontFamily: "Inter_700Bold" },
  goal: { fontFamily: "Inter_400Regular" },
});

function QuickAction({
  icon, label, color, bg, onPress,
}: { icon: string; label: string; color: string; bg: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.qa}>
      <View style={[styles.qaIcon, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.qaLabel, { color: "#666" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmptyCard({
  icon, message, color, onPress, colors,
}: { icon: string; message: string; color: string; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: color + "22", borderWidth: 1.5 }]}
    >
      <View style={[styles.emptyIconWrap, { backgroundColor: color + "14" }]}>
        <Feather name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{message}</Text>
      <Feather name="plus-circle" size={16} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 24, fontFamily: "Inter_700Bold" },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  dateBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  dateText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    gap: 16,
    shadowColor: "#9B5DE5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  heroTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  rings: { flexDirection: "row", justifyContent: "space-between" },
  goalBars: { gap: 10 },
  qaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  qa: { alignItems: "center", gap: 6 },
  qaIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  qaLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  calBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  calBannerText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  list: { gap: 10, marginBottom: 24 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  listInfo: { flex: 1, gap: 2 },
  listTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  listSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  calBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  calBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
