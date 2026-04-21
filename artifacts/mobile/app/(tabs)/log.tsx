import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PillButton } from "@/components/PillButton";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";

type LogTab = "meal" | "water" | "sleep";

const MEAL_CATEGORIES = [
  { key: "breakfast", label: "Breakfast", icon: "sunrise" },
  { key: "lunch", label: "Lunch", icon: "sun" },
  { key: "dinner", label: "Dinner", icon: "sunset" },
  { key: "snack", label: "Snack", icon: "package" },
] as const;

type MealCategory = typeof MEAL_CATEGORIES[number]["key"];

const WATER_GOAL = 2.5;
const WATER_INCREMENTS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5];
const SLEEP_HOURS = [4, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10];

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

async function fetchCalorieEstimate(
  mealName: string,
  category: string
): Promise<{ foodName: string; calories: number; confidence: string; notes: string }> {
  const res = await fetch(`${API_BASE}/api/estimate-calories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mealName, category }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Failed to estimate");
  }
  return res.json() as Promise<{ foodName: string; calories: number; confidence: string; notes: string }>;
}

export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMeal, addWaterEntry, addSleepEntry, getTodayWater, sleepEntries, meals } = useApp();

  const [activeTab, setActiveTab] = useState<LogTab>("meal");

  // Meal state
  const [mealName, setMealName] = useState("");
  const [mealCategory, setMealCategory] = useState<MealCategory>("breakfast");
  const [mealCalories, setMealCalories] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [aiFoodName, setAiFoodName] = useState("");
  const [aiConfidence, setAiConfidence] = useState<"low" | "medium" | "high" | "">("");

  // Water state
  const today = new Date().toISOString().split("T")[0];
  const todayWater = getTodayWater();
  const [litres, setLitres] = useState(todayWater);

  // Sleep state
  const todaySleep = sleepEntries.find((s) => s.date === today);
  const [sleepHours, setSleepHours] = useState(todaySleep?.hours ?? 7);
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">(
    todaySleep?.quality ?? "good"
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Today's meals for quick view
  const todayMeals = meals.filter((m) => m.date === today);

  const handleEstimateCalories = async () => {
    if (!mealName.trim()) {
      Alert.alert("Enter a meal name", "Type a meal name first to get an AI estimate.");
      return;
    }
    setEstimating(true);
    setAiNote("");
    setAiFoodName("");
    setAiConfidence("");
    try {
      const result = await fetchCalorieEstimate(mealName.trim(), mealCategory);
      setMealCalories(result.calories.toString());
      setAiFoodName(result.foodName);
      setAiNote(result.notes);
      setAiConfidence(result.confidence as "low" | "medium" | "high");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't reach the AI.";
      Alert.alert("Estimation failed", `${msg}\n\nYou can enter calories manually.`);
    } finally {
      setEstimating(false);
    }
  };

  const handleSaveMeal = () => {
    if (!mealName.trim()) {
      Alert.alert("Missing info", "Please enter a meal name.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMeal({
      date: today,
      category: mealCategory,
      name: mealName.trim(),
      calories: mealCalories ? parseInt(mealCalories) : undefined,
    });
    setMealName("");
    setMealCalories("");
    setAiNote("");
    setAiFoodName("");
    setAiConfidence("");
    Alert.alert("Saved!", `${mealName} has been added.`);
  };

  const handleSaveWater = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addWaterEntry(today, litres);
    Alert.alert("Saved!", `${litres.toFixed(2)}L of water logged.`);
  };

  const handleSaveSleep = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSleepEntry({ date: today, hours: sleepHours, quality: sleepQuality });
    Alert.alert("Saved!", `${sleepHours} hours of sleep logged.`);
  };

  const confidenceColor =
    aiConfidence === "high" ? "#22C55E" : aiConfidence === "medium" ? "#F59E0B" : "#94A3B8";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Daily Log</Text>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          {([
            { key: "meal", label: "Meals", icon: "coffee" },
            { key: "water", label: "Water", icon: "droplet" },
            { key: "sleep", label: "Sleep", icon: "moon" },
          ] as const).map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => {
                setActiveTab(t.key);
                Haptics.selectionAsync();
              }}
              style={[
                styles.tabBtn,
                activeTab === t.key && {
                  backgroundColor: colors.card,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                },
              ]}
            >
              <Feather
                name={t.icon}
                size={16}
                color={activeTab === t.key ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === t.key ? colors.primary : colors.mutedForeground },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── MEAL LOG ─── */}
        {activeTab === "meal" && (
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Log a Meal</Text>

            {/* Category */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
            <View style={styles.catRow}>
              {MEAL_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => {
                    setMealCategory(c.key);
                    setAiNote("");
                    setAiConfidence("");
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.catChip,
                    { backgroundColor: mealCategory === c.key ? colors.primary : colors.muted },
                  ]}
                >
                  <Feather
                    name={c.icon as any}
                    size={14}
                    color={mealCategory === c.key ? "#fff" : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.catLabel,
                      { color: mealCategory === c.key ? "#fff" : colors.mutedForeground },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Meal Name */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Meal Name *</Text>
            <TextInput
              value={mealName}
              onChangeText={(t) => {
                setMealName(t);
                setAiNote("");
                setAiFoodName("");
                setAiConfidence("");
              }}
              placeholder="e.g. Grilled chicken salad"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                { backgroundColor: colors.muted, color: colors.foreground },
              ]}
            />

            {/* AI Calorie Estimate */}
            <View style={[styles.aiCard, { backgroundColor: colors.primaryLight }]}>
              <View style={styles.aiHeader}>
                <View style={[styles.aiIcon, { backgroundColor: colors.primary }]}>
                  <Feather name="cpu" size={14} color="#fff" />
                </View>
                <View style={styles.aiText}>
                  <Text style={[styles.aiTitle, { color: colors.primary }]}>AI Calorie Estimate</Text>
                  <Text style={[styles.aiSub, { color: colors.purpleDark }]}>
                    Type a meal name, then tap estimate
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleEstimateCalories}
                  disabled={estimating}
                  style={[
                    styles.estimateBtn,
                    { backgroundColor: colors.primary, opacity: estimating ? 0.7 : 1 },
                  ]}
                >
                  {estimating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.estimateBtnText}>Estimate</Text>
                  )}
                </TouchableOpacity>
              </View>
              {mealCalories && aiConfidence ? (
                <View style={styles.aiResult}>
                  {aiFoodName ? (
                    <Text style={[styles.aiFoodName, { color: colors.foreground }]}>
                      {aiFoodName}
                    </Text>
                  ) : null}
                  <View style={styles.aiResultRow}>
                    <Text style={[styles.aiCalorieValue, { color: colors.primary }]}>
                      {mealCalories} kcal
                    </Text>
                    <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "22" }]}>
                      <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
                      <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                        {aiConfidence} confidence
                      </Text>
                    </View>
                  </View>
                  {aiNote ? (
                    <Text style={[styles.aiNoteText, { color: colors.purpleDark }]}>{aiNote}</Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Calories Manual */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Calories (edit if needed)
            </Text>
            <TextInput
              value={mealCalories}
              onChangeText={setMealCalories}
              placeholder="e.g. 450"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[
                styles.input,
                { backgroundColor: colors.muted, color: colors.foreground },
              ]}
            />

            <PillButton label="Save Meal" onPress={handleSaveMeal} style={{ marginTop: 4 }} />

            {/* Today's Meals Quick List */}
            {todayMeals.length > 0 && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
                  Logged today
                </Text>
                {todayMeals.map((m) => (
                  <View
                    key={m.id}
                    style={[styles.mealItem, { backgroundColor: colors.muted }]}
                  >
                    <Feather name="check-circle" size={16} color={colors.primary} />
                    <View style={styles.mealItemInfo}>
                      <Text style={[styles.mealItemName, { color: colors.foreground }]}>
                        {m.name}
                      </Text>
                      <Text style={[styles.mealItemMeta, { color: colors.mutedForeground }]}>
                        {m.category} {m.calories ? `· ${m.calories} kcal` : ""}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* ─── WATER LOG ─── */}
        {activeTab === "water" && (
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Water Intake</Text>

            {/* Big number */}
            <View style={styles.waterCenter}>
              <Text style={[styles.waterCount, { color: "#38BDF8" }]}>{litres.toFixed(2)}</Text>
              <Text style={[styles.waterUnit, { color: colors.mutedForeground }]}>
                litres today
              </Text>
            </View>

            {/* Progress bar */}
            <AnimatedProgressBar
              progress={litres / WATER_GOAL}
              color="#38BDF8"
              height={10}
              backgroundColor="#E0F7FF"
            />
            <Text style={[styles.waterGoalText, { color: colors.mutedForeground }]}>
              Goal: {WATER_GOAL}L · {litres >= WATER_GOAL ? "Goal reached!" : `${(WATER_GOAL - litres).toFixed(2)}L more to go`}
            </Text>

            {/* Litre increment grid */}
            <View style={styles.waterGrid}>
              {WATER_INCREMENTS.map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => {
                    setLitres(v);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.waterGlass,
                    {
                      backgroundColor: v <= litres ? "#38BDF8" : "#E0F7FF",
                      borderColor: v <= litres ? "#38BDF8" : "#B0E8F8",
                    },
                  ]}
                >
                  <Feather name="droplet" size={18} color={v <= litres ? "#fff" : "#38BDF8"} />
                  <Text style={[styles.glassNum, { color: v <= litres ? "#fff" : "#38BDF8" }]}>
                    {v.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* +/- buttons */}
            <View style={styles.waterBtns}>
              <PillButton
                label="−"
                variant="ghost"
                size="sm"
                onPress={() => setLitres((l) => Math.max(0, Math.round((l - 0.25) * 100) / 100))}
              />
              <Text style={[styles.waterCountSmall, { color: colors.foreground }]}>
                {litres.toFixed(2)} L
              </Text>
              <PillButton
                label="+"
                size="sm"
                onPress={() => setLitres((l) => Math.min(5, Math.round((l + 0.25) * 100) / 100))}
              />
            </View>

            <PillButton label="Save Water Log" onPress={handleSaveWater} />
          </View>
        )}

        {/* ─── SLEEP LOG ─── */}
        {activeTab === "sleep" && (
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Sleep Tracker</Text>

            <View style={styles.waterCenter}>
              <Text style={[styles.waterCount, { color: "#818CF8" }]}>{sleepHours}h</Text>
              <Text style={[styles.waterUnit, { color: colors.mutedForeground }]}>
                hours slept
              </Text>
            </View>

            <AnimatedProgressBar
              progress={sleepHours / 8}
              color="#818CF8"
              height={10}
              backgroundColor="#EEF2FF"
            />
            <Text style={[styles.waterGoalText, { color: colors.mutedForeground }]}>
              Goal: 8 hours · {sleepHours >= 8 ? "Goal reached!" : `${(8 - sleepHours).toFixed(1)} more needed`}
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Hours Slept</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sleepRow}
            >
              {SLEEP_HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => {
                    setSleepHours(h);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.sleepChip,
                    { backgroundColor: sleepHours === h ? "#818CF8" : "#EEF2FF" },
                  ]}
                >
                  <Text
                    style={[
                      styles.sleepChipLabel,
                      { color: sleepHours === h ? "#fff" : "#818CF8" },
                    ]}
                  >
                    {h}h
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Sleep Quality</Text>
            <View style={styles.qualityRow}>
              {(["poor", "fair", "good", "excellent"] as const).map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => {
                    setSleepQuality(q);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.qualityChip,
                    { backgroundColor: sleepQuality === q ? "#818CF8" : "#EEF2FF" },
                  ]}
                >
                  <Text
                    style={[
                      styles.qualityLabel,
                      { color: sleepQuality === q ? "#fff" : "#818CF8" },
                    ]}
                  >
                    {q.charAt(0).toUpperCase() + q.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <PillButton label="Save Sleep Log" onPress={handleSaveSleep} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  panel: { marginHorizontal: 20, gap: 12 },
  panelTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.4, textTransform: "uppercase" },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 100,
  },
  catLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  // AI card
  aiCard: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  aiText: { flex: 1 },
  aiTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  aiSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  estimateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    minWidth: 72,
    alignItems: "center",
  },
  estimateBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  aiResult: { gap: 6 },
  aiResultRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiCalorieValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  confidenceDot: { width: 6, height: 6, borderRadius: 3 },
  confidenceText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  aiFoodName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  aiNoteText: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  // meal list
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  mealItemInfo: { flex: 1 },
  mealItemName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  mealItemMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  // Water
  waterCenter: { alignItems: "center", gap: 4 },
  waterCount: { fontSize: 64, fontFamily: "Inter_700Bold", letterSpacing: -2 },
  waterUnit: { fontSize: 14, fontFamily: "Inter_400Regular" },
  waterGoalText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  waterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 4,
  },
  waterGlass: {
    width: 66,
    height: 66,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    gap: 2,
  },
  glassNum: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  waterBtns: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  waterCountSmall: { fontSize: 16, fontFamily: "Inter_700Bold", minWidth: 80, textAlign: "center" },
  // Sleep
  sleepRow: { gap: 8, paddingVertical: 2 },
  sleepChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100 },
  sleepChipLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  qualityRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  qualityChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 100 },
  qualityLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
