import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { BarChart } from "@/components/BarChart";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { PillButton } from "@/components/PillButton";

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getWeekSummary, weightEntries, addWeightEntry } = useApp();

  const [weightInput, setWeightInput] = useState("");
  const [activeChart, setActiveChart] = useState<"calories" | "workouts" | "sleep" | "water">(
    "calories"
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const weekSummary = useMemo(() => getWeekSummary(), [getWeekSummary]);

  const calData = weekSummary.map((d) => ({
    label: getDayLabel(d.date),
    value: d.caloriesBurned,
  }));
  const workoutData = weekSummary.map((d) => ({
    label: getDayLabel(d.date),
    value: d.mealsLogged > 0 || d.caloriesBurned > 0 ? 1 : 0,
  }));
  const sleepData = weekSummary.map((d) => ({
    label: getDayLabel(d.date),
    value: d.sleepHours,
  }));
  const waterData = weekSummary.map((d) => ({
    label: getDayLabel(d.date),
    value: d.waterLitres,
  }));

  const totalCalories = weekSummary.reduce((s, d) => s + d.caloriesBurned, 0);
  const avgSleep =
    weekSummary.filter((d) => d.sleepHours > 0).reduce((s, d) => s + d.sleepHours, 0) /
    Math.max(weekSummary.filter((d) => d.sleepHours > 0).length, 1);
  const activeDays = weekSummary.filter((d) => d.caloriesBurned > 0).length;
  const consistency = Math.round((activeDays / 7) * 100);

  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;
  const firstWeight = weightEntries.length > 1 ? weightEntries[0] : null;
  const weightChange =
    latestWeight && firstWeight
      ? (latestWeight.kg - firstWeight.kg).toFixed(1)
      : null;

  const handleAddWeight = () => {
    const kg = parseFloat(weightInput);
    if (isNaN(kg) || kg < 20 || kg > 300) {
      Alert.alert("Invalid", "Enter a weight between 20–300 kg.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addWeightEntry(kg);
    setWeightInput("");
  };

  const CHART_TABS = [
    { key: "calories" as const, label: "Calories", icon: "zap", color: colors.primary },
    { key: "sleep" as const, label: "Sleep", icon: "moon", color: "#818CF8" },
    { key: "water" as const, label: "Water", icon: "droplet", color: "#38BDF8" },
  ];

  const chartData =
    activeChart === "calories"
      ? { data: calData, max: 600, color: colors.primary, unit: "kcal" }
      : activeChart === "sleep"
      ? { data: sleepData, max: 12, color: "#818CF8", unit: "h" }
      : { data: waterData, max: 4, color: "#38BDF8", unit: "L" };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your 7-day performance summary
        </Text>

        {/* Weekly Stats Summary */}
        <View style={styles.statsRow}>
          <StatTile
            label="Calories"
            value={`${totalCalories}`}
            unit="kcal"
            icon="zap"
            color={colors.primary}
            bg={colors.primaryLight}
          />
          <StatTile
            label="Consistency"
            value={`${consistency}%`}
            icon="trending-up"
            color="#34D399"
            bg="#DCFCE7"
          />
          <StatTile
            label="Avg Sleep"
            value={`${avgSleep.toFixed(1)}h`}
            icon="moon"
            color="#818CF8"
            bg="#EEF2FF"
          />
        </View>

        {/* Consistency bar */}
        <View style={[styles.consistencyCard, { backgroundColor: colors.card }]}>
          <View style={styles.consistRow}>
            <View style={styles.consistLeft}>
              <Text style={[styles.consistLabel, { color: colors.foreground }]}>
                Weekly Consistency
              </Text>
              <Text style={[styles.consistSub, { color: colors.mutedForeground }]}>
                {activeDays} of 7 days active
              </Text>
            </View>
            <Text style={[styles.consistPct, { color: colors.primary }]}>
              {consistency}%
            </Text>
          </View>
          <AnimatedProgressBar progress={consistency / 100} color={colors.primary} height={10} />
          <View style={styles.dayDots}>
            {weekSummary.map((d, i) => (
              <View key={i} style={styles.dayDot}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        d.caloriesBurned > 0 ? colors.primary : colors.border,
                    },
                  ]}
                />
                <Text
                  style={[styles.dotLabel, { color: colors.mutedForeground }]}
                >
                  {getDayLabel(d.date).slice(0, 1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Chart Selector */}
        <View style={styles.chartTabRow}>
          {CHART_TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => {
                setActiveChart(t.key);
                Haptics.selectionAsync();
              }}
              style={[
                styles.chartTab,
                {
                  backgroundColor:
                    activeChart === t.key ? t.color : colors.muted,
                },
              ]}
            >
              <Feather
                name={t.icon as any}
                size={13}
                color={activeChart === t.key ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.chartTabLabel,
                  {
                    color:
                      activeChart === t.key ? "#fff" : colors.mutedForeground,
                  },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bar Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>
            {activeChart === "calories"
              ? "Calories Burned"
              : activeChart === "sleep"
              ? "Sleep Hours"
              : "Water (L)"}{" "}
            — This Week
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ paddingBottom: 4, paddingTop: 8 }}>
              <BarChart
                data={chartData.data}
                maxValue={chartData.max}
                color={chartData.color}
                height={130}
                unit={chartData.unit}
              />
            </View>
          </ScrollView>
          <View style={styles.chartLegend}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: chartData.color + "55" },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
              Earlier days
            </Text>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: chartData.color, marginLeft: 12 },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
              Today
            </Text>
          </View>
        </View>

        {/* Weight Tracker */}
        <View style={[styles.weightCard, { backgroundColor: colors.card }]}>
          <View style={styles.weightHeader}>
            <View
              style={[styles.weightIcon, { backgroundColor: colors.peachLight }]}
            >
              <Feather name="activity" size={18} color={colors.peach} />
            </View>
            <View style={styles.weightInfo}>
              <Text style={[styles.weightTitle, { color: colors.foreground }]}>
                Weight Tracker
              </Text>
              {latestWeight ? (
                <Text style={[styles.weightSub, { color: colors.mutedForeground }]}>
                  Current: {latestWeight.kg} kg
                  {weightChange !== null
                    ? ` · ${parseFloat(weightChange) > 0 ? "+" : ""}${weightChange} kg since start`
                    : ""}
                </Text>
              ) : (
                <Text style={[styles.weightSub, { color: colors.mutedForeground }]}>
                  Log your weight to track progress
                </Text>
              )}
            </View>
          </View>

          {/* Weight input */}
          <View style={styles.weightInputRow}>
            <TextInput
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="Enter weight (kg)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              style={[
                styles.weightInput,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                },
              ]}
            />
            <TouchableOpacity
              onPress={handleAddWeight}
              style={[styles.addWeightBtn, { backgroundColor: colors.peach }]}
            >
              <Feather name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Weight History */}
          {weightEntries.length > 1 && (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <Text style={[styles.histLabel, { color: colors.mutedForeground }]}>
                History
              </Text>
              <View style={styles.weightHistory}>
                {weightEntries
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((w, i) => (
                    <View key={i} style={styles.weightHistItem}>
                      <Text
                        style={[styles.weightHistDate, { color: colors.mutedForeground }]}
                      >
                        {w.date}
                      </Text>
                      <Text
                        style={[styles.weightHistKg, { color: colors.foreground }]}
                      >
                        {w.kg} kg
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          )}
        </View>

        {/* Goals Overview */}
        <View style={[styles.goalsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.goalsTitle, { color: colors.foreground }]}>
            Weekly Goals
          </Text>
          <GoalRow
            label="Active Days"
            current={activeDays}
            goal={5}
            color={colors.primary}
            unit="days"
          />
          <GoalRow
            label="Total Calories Burned"
            current={totalCalories}
            goal={2000}
            color="#FF8FAB"
            unit="kcal"
          />
          <GoalRow
            label="Avg Sleep Quality"
            current={Math.round(avgSleep)}
            goal={8}
            color="#818CF8"
            unit="hrs"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({
  label,
  value,
  unit,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.statTile, { backgroundColor: bg }]}>
      <Feather name={icon as any} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: color + "99" }]}>{label}</Text>
    </View>
  );
}

function GoalRow({
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
  const progress = Math.min(current / goal, 1);
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalRowTop}>
        <Text style={[styles.goalLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.goalValue, { color }]}>
          {current}/{goal} {unit}
        </Text>
      </View>
      <AnimatedProgressBar progress={progress} color={color} height={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", paddingHorizontal: 20 },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  statTile: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  consistencyCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  consistRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  consistLeft: { gap: 2 },
  consistLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  consistSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  consistPct: { fontSize: 28, fontFamily: "Inter_700Bold" },
  dayDots: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  dayDot: { alignItems: "center", gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  chartTabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  chartTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
  },
  chartTabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chartCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  chartTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  weightCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 14,
  },
  weightHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  weightIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  weightInfo: { flex: 1, gap: 2 },
  weightTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  weightSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  weightInputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  weightInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  addWeightBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1 },
  histLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  weightHistory: { gap: 8 },
  weightHistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weightHistDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  weightHistKg: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  goalsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 16,
  },
  goalsTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  goalRow: { gap: 8 },
  goalRowTop: { flexDirection: "row", justifyContent: "space-between" },
  goalLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  goalValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
