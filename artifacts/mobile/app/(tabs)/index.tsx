import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { GradientCard } from "@/components/GradientCard";
import { StatRing } from "@/components/StatRing";
import { SectionHeader } from "@/components/SectionHeader";
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
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, workouts, meals, waterEntries, sleepEntries, getTodaySummary } = useApp();
  const goals = useGoals();

  const summary = useMemo(() => getTodaySummary(), [getTodaySummary]);

  const today = new Date().toISOString().split("T")[0];

  const todayWorkouts = workouts.filter((w) => w.date === today).slice(0, 3);
  const todayMeals = meals.filter((m) => m.date === today).slice(0, 3);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {greeting()},
            </Text>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {user?.name ?? "Athlete"} 
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={[styles.avatar, { backgroundColor: colors.primaryLight }]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(user?.name ?? "A")[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date */}
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
          Today — {formatDate(today)}
        </Text>

        {/* Rings */}
        <View style={[styles.ringsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.ringsTitle, { color: colors.foreground }]}>
            Daily Progress
          </Text>
          <View style={styles.rings}>
            <StatRing
              progress={summary.caloriesBurned / goals.calories}
              label="Calories"
              value={`${summary.caloriesBurned}`}
              color={colors.primary}
              size={82}
            />
            <StatRing
              progress={summary.waterGlasses / goals.water}
              label="Water"
              value={`${summary.waterGlasses}`}
              color={colors.secondary}
              size={82}
            />
            <StatRing
              progress={summary.sleepHours / goals.sleep}
              label="Sleep"
              value={`${summary.sleepHours}h`}
              color="#38BDF8"
              size={82}
            />
            <StatRing
              progress={summary.mealsLogged / 3}
              label="Meals"
              value={`${summary.mealsLogged}`}
              color={colors.peach}
              size={82}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickAction
            icon="zap"
            label="Workout"
            color={colors.primary}
            bg={colors.primaryLight}
            onPress={() => router.push("/(tabs)/workout")}
          />
          <QuickAction
            icon="coffee"
            label="Log Meal"
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
            icon="moon"
            label="Sleep"
            color="#818CF8"
            bg="#EEF2FF"
            onPress={() => router.push("/(tabs)/log")}
          />
        </View>

        {/* Today's Workouts */}
        <SectionHeader
          title="Today's Workouts"
          action={todayWorkouts.length > 0 ? "See all" : undefined}
          onAction={() => router.push("/(tabs)/workout")}
        />
        {todayWorkouts.length === 0 ? (
          <EmptyState
            icon="zap"
            message="No workouts logged today. Start one!"
            color={colors.primary}
            onPress={() => router.push("/(tabs)/workout")}
            colors={colors}
          />
        ) : (
          <View style={styles.list}>
            {todayWorkouts.map((w) => {
              const meta = getWorkoutMeta(w.type);
              return (
                <View
                  key={w.id}
                  style={[styles.listItem, { backgroundColor: colors.card }]}
                >
                  <View
                    style={[
                      styles.listIcon,
                      { backgroundColor: meta.color + "22" },
                    ]}
                  >
                    <Feather name={meta.icon as any} size={18} color={meta.color} />
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={[styles.listTitle, { color: colors.foreground }]}>
                      {meta.label}
                    </Text>
                    <Text
                      style={[styles.listSub, { color: colors.mutedForeground }]}
                    >
                      {w.duration} min · {w.calories} kcal
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Today's Meals */}
        <SectionHeader
          title="Today's Meals"
          action={todayMeals.length > 0 ? "See all" : undefined}
          onAction={() => router.push("/(tabs)/log")}
        />
        {todayMeals.length === 0 ? (
          <EmptyState
            icon="coffee"
            message="No meals logged yet. Add your first meal!"
            color={colors.peach}
            onPress={() => router.push("/(tabs)/log")}
            colors={colors}
          />
        ) : (
          <View style={styles.list}>
            {todayMeals.map((m) => (
              <View
                key={m.id}
                style={[styles.listItem, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.listIcon,
                    { backgroundColor: colors.peachLight },
                  ]}
                >
                  <Feather name="coffee" size={18} color={colors.peach} />
                </View>
                <View style={styles.listInfo}>
                  <Text
                    style={[styles.listTitle, { color: colors.foreground }]}
                  >
                    {m.name}
                  </Text>
                  <Text
                    style={[
                      styles.listSub,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {m.category.charAt(0).toUpperCase() + m.category.slice(1)}
                    {m.calories ? ` · ${m.calories} kcal` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  bg,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.qa}>
      <View style={[styles.qaIcon, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.qaLabel, { color: "#555" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmptyState({
  icon,
  message,
  color,
  onPress,
  colors,
}: {
  icon: string;
  message: string;
  color: string;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.empty, { backgroundColor: colors.card }]}
    >
      <Feather name={icon as any} size={28} color={color + "88"} />
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
        {message}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  name: { fontSize: 24, fontFamily: "Inter_700Bold" },
  dateText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  ringsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#9B5DE5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  ringsTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  rings: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  qa: { alignItems: "center", gap: 6 },
  qaIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  qaLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  list: { gap: 10, marginBottom: 28, paddingHorizontal: 0 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 12,
    marginHorizontal: 0,
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
  listSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 16,
    gap: 10,
    marginBottom: 28,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
