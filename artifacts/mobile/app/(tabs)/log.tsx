import { getApiBase } from "@/utils/api";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
const WATER_QUICK_ADDS = [0.25, 0.5, 0.75, 1.0, 1.5];
const SLEEP_HOURS = [4, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10];

const API_BASE = getApiBase();

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
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

  // ─── Toast ───────────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMsg(null));
  };

  // ─── Meal state ───────────────────────────────────────────────────────────
  const [mealName, setMealName] = useState("");
  const [mealCategory, setMealCategory] = useState<MealCategory>("breakfast");
  const [mealCalories, setMealCalories] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [aiFoodName, setAiFoodName] = useState("");
  const [aiConfidence, setAiConfidence] = useState<"low" | "medium" | "high" | "">("");

  const todayMeals = meals.filter((m) => m.date === today);

  // ─── Water state ──────────────────────────────────────────────────────────
  const todayTotal = getTodayWater();
  const [addAmount, setAddAmount] = useState(0.5);
  const [savingWater, setSavingWater] = useState(false);

  // ─── Sleep state ──────────────────────────────────────────────────────────
  const todaySleep = sleepEntries.find((s) => s.date === today);
  const [sleepHours, setSleepHours] = useState(todaySleep?.hours ?? 7);
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">(
    todaySleep?.quality ?? "good"
  );
  const [savingSleep, setSavingSleep] = useState(false);

  // ─── Handlers ────────────────────────────────────────────────────────────
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

  const handleSaveMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert("Missing info", "Please enter a meal name.");
      return;
    }
    if (savingMeal) return;
    setSavingMeal(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addMeal({
        date: today,
        category: mealCategory,
        name: mealName.trim(),
        calories: mealCalories ? parseInt(mealCalories) : undefined,
      });
      const savedName = mealName.trim();
      setMealName("");
      setMealCalories("");
      setAiNote("");
      setAiFoodName("");
      setAiConfidence("");
      showToast(`${savedName} saved`);
    } finally {
      setSavingMeal(false);
    }
  };

  const handleAddWater = async (amount: number) => {
    if (savingWater) return;
    setSavingWater(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addWaterEntry(today, amount);
      const newTotal = Math.round((todayTotal + amount) * 100) / 100;
      showToast(`+${amount}L added · Total: ${newTotal.toFixed(2)}L`);
    } finally {
      setSavingWater(false);
    }
  };

  const handleSaveSleep = async () => {
    if (savingSleep) return;
    setSavingSleep(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addSleepEntry({ date: today, hours: sleepHours, quality: sleepQuality });
      showToast(`${sleepHours}h sleep logged`);
    } finally {
      setSavingSleep(false);
    }
  };

  const confidenceColor =
    aiConfidence === "high" ? "#22C55E" : aiConfidence === "medium" ? "#F59E0B" : "#94A3B8";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 120 }}
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
              onPress={() => { setActiveTab(t.key); Haptics.selectionAsync(); }}
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
              <Feather name={t.icon} size={16} color={activeTab === t.key ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: activeTab === t.key ? colors.primary : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── MEAL LOG ─── */}
        {activeTab === "meal" && (
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Log a Meal</Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
            <View style={styles.catRow}>
              {MEAL_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => { setMealCategory(c.key); setAiNote(""); setAiConfidence(""); Haptics.selectionAsync(); }}
                  style={[styles.catChip, { backgroundColor: mealCategory === c.key ? colors.primary : colors.muted }]}
                >
                  <Feather name={c.icon as any} size={14} color={mealCategory === c.key ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.catLabel, { color: mealCategory === c.key ? "#fff" : colors.mutedForeground }]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Meal Name *</Text>
            <TextInput
              value={mealName}
              onChangeText={(t) => { setMealName(t); setAiNote(""); setAiFoodName(""); setAiConfidence(""); }}
              placeholder="e.g. Grilled chicken salad"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            />

            {/* AI Calorie Estimate */}
            <View style={[styles.aiCard, { backgroundColor: colors.primaryLight }]}>
              <View style={styles.aiHeader}>
                <View style={[styles.aiIcon, { backgroundColor: colors.primary }]}>
                  <Feather name="cpu" size={14} color="#fff" />
                </View>
                <View style={styles.aiText}>
                  <Text style={[styles.aiTitle, { color: colors.primary }]}>AI Calorie Estimate</Text>
                  <Text style={[styles.aiSub, { color: colors.purpleDark }]}>Type meal name, then tap estimate</Text>
                </View>
                <TouchableOpacity
                  onPress={handleEstimateCalories}
                  disabled={estimating}
                  style={[styles.estimateBtn, { backgroundColor: colors.primary, opacity: estimating ? 0.7 : 1 }]}
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
                  {aiFoodName ? <Text style={[styles.aiFoodName, { color: colors.foreground }]}>{aiFoodName}</Text> : null}
                  <View style={styles.aiResultRow}>
                    <Text style={[styles.aiCalorieValue, { color: colors.primary }]}>{mealCalories} kcal</Text>
                    <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "22" }]}>
                      <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
                      <Text style={[styles.confidenceText, { color: confidenceColor }]}>{aiConfidence} confidence</Text>
                    </View>
                  </View>
                  {aiNote ? <Text style={[styles.aiNoteText, { color: colors.purpleDark }]}>{aiNote}</Text> : null}
                </View>
              ) : null}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Calories (edit if needed)</Text>
            <TextInput
              value={mealCalories}
              onChangeText={setMealCalories}
              placeholder="e.g. 450"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            />

            <TouchableOpacity
              onPress={handleSaveMeal}
              disabled={savingMeal}
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: savingMeal ? 0.7 : 1 }]}
            >
              {savingMeal ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Meal</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Today's Meals Quick List */}
            {todayMeals.length > 0 && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
                  Logged today ({todayMeals.length} meals · {todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0)} kcal)
                </Text>
                {todayMeals.map((m) => (
                  <View key={m.id} style={[styles.mealItem, { backgroundColor: colors.muted }]}>
                    <Feather name="check-circle" size={16} color={colors.primary} />
                    <View style={styles.mealItemInfo}>
                      <Text style={[styles.mealItemName, { color: colors.foreground }]}>{m.name}</Text>
                      <Text style={[styles.mealItemMeta, { color: colors.mutedForeground }]}>
                        {m.category}{m.calories ? ` · ${m.calories} kcal` : ""}
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

            {/* Today's total */}
            <View style={styles.waterCenter}>
              <Text style={[styles.waterCount, { color: "#38BDF8" }]}>{todayTotal.toFixed(2)}</Text>
              <Text style={[styles.waterUnit, { color: colors.mutedForeground }]}>litres today</Text>
            </View>

            <AnimatedProgressBar
              progress={Math.min(1, todayTotal / WATER_GOAL)}
              color="#38BDF8"
              height={10}
              backgroundColor="#E0F7FF"
            />
            <Text style={[styles.waterGoalText, { color: colors.mutedForeground }]}>
              Goal: {WATER_GOAL}L · {todayTotal >= WATER_GOAL ? "Goal reached!" : `${(WATER_GOAL - todayTotal).toFixed(2)}L more to go`}
            </Text>

            {/* Quick add buttons */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 4 }]}>Quick Add</Text>
            <View style={styles.quickAddRow}>
              {WATER_QUICK_ADDS.map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => handleAddWater(v)}
                  disabled={savingWater}
                  style={[styles.quickAddChip, { backgroundColor: "#E0F7FF", borderColor: "#38BDF8" }]}
                >
                  <Feather name="droplet" size={13} color="#38BDF8" />
                  <Text style={[styles.quickAddLabel, { color: "#1E7FA8" }]}>+{v}L</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom amount stepper */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Custom Amount</Text>
            <View style={styles.waterBtns}>
              <TouchableOpacity
                onPress={() => setAddAmount((a) => Math.max(0.25, Math.round((a - 0.25) * 100) / 100))}
                style={[styles.stepperBtn, { backgroundColor: colors.muted }]}
              >
                <Text style={[styles.stepperText, { color: colors.foreground }]}>−</Text>
              </TouchableOpacity>
              <View style={[styles.stepperDisplay, { backgroundColor: colors.muted }]}>
                <Text style={[styles.stepperValue, { color: "#38BDF8" }]}>{addAmount.toFixed(2)} L</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAddAmount((a) => Math.min(3, Math.round((a + 0.25) * 100) / 100))}
                style={[styles.stepperBtn, { backgroundColor: colors.muted }]}
              >
                <Text style={[styles.stepperText, { color: colors.foreground }]}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleAddWater(addAmount)}
              disabled={savingWater}
              style={[styles.saveBtn, { backgroundColor: "#0EA5E9", opacity: savingWater ? 0.7 : 1 }]}
            >
              {savingWater ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="plus" size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>Add {addAmount.toFixed(2)}L to Today</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ─── SLEEP LOG ─── */}
        {activeTab === "sleep" && (
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Sleep Tracker</Text>

            <View style={styles.waterCenter}>
              <Text style={[styles.waterCount, { color: "#818CF8" }]}>{sleepHours}h</Text>
              <Text style={[styles.waterUnit, { color: colors.mutedForeground }]}>hours slept</Text>
            </View>

            <AnimatedProgressBar progress={sleepHours / 8} color="#818CF8" height={10} backgroundColor="#EEF2FF" />
            <Text style={[styles.waterGoalText, { color: colors.mutedForeground }]}>
              Goal: 8 hours · {sleepHours >= 8 ? "Goal reached!" : `${(8 - sleepHours).toFixed(1)} more needed`}
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Hours Slept</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sleepRow}>
              {SLEEP_HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => { setSleepHours(h); Haptics.selectionAsync(); }}
                  style={[styles.sleepChip, { backgroundColor: sleepHours === h ? "#818CF8" : "#EEF2FF" }]}
                >
                  <Text style={[styles.sleepChipLabel, { color: sleepHours === h ? "#fff" : "#818CF8" }]}>{h}h</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Sleep Quality</Text>
            <View style={styles.qualityRow}>
              {(["poor", "fair", "good", "excellent"] as const).map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => { setSleepQuality(q); Haptics.selectionAsync(); }}
                  style={[styles.qualityChip, { backgroundColor: sleepQuality === q ? "#818CF8" : "#EEF2FF" }]}
                >
                  <Text style={[styles.qualityLabel, { color: sleepQuality === q ? "#fff" : "#818CF8" }]}>
                    {q.charAt(0).toUpperCase() + q.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSaveSleep}
              disabled={savingSleep}
              style={[styles.saveBtn, { backgroundColor: "#818CF8", opacity: savingSleep ? 0.7 : 1 }]}
            >
              {savingSleep ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Sleep Log</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ─── Toast notification ─── */}
      {toastMsg ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.toastInner}>
            <Feather name="check-circle" size={16} color="#fff" />
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", paddingHorizontal: 20, marginBottom: 16 },
  tabRow: { flexDirection: "row", marginHorizontal: 20, borderRadius: 14, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 11 },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  panel: { marginHorizontal: 20, gap: 12 },
  panelTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.4, textTransform: "uppercase" },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 100 },
  catLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  input: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular" },
  // AI card
  aiCard: { borderRadius: 16, padding: 14, gap: 10 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  aiText: { flex: 1 },
  aiTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  aiSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  estimateBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, minWidth: 72, alignItems: "center" },
  estimateBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  aiResult: { gap: 6 },
  aiResultRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiCalorieValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  confidenceBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  confidenceDot: { width: 6, height: 6, borderRadius: 3 },
  confidenceText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  aiFoodName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  aiNoteText: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  // meal list
  mealItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12 },
  mealItemInfo: { flex: 1 },
  mealItemName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  mealItemMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  // Save button
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 100, marginTop: 4 },
  saveBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  // Water
  waterCenter: { alignItems: "center", gap: 4 },
  waterCount: { fontSize: 64, fontFamily: "Inter_700Bold", letterSpacing: -2 },
  waterUnit: { fontSize: 14, fontFamily: "Inter_400Regular" },
  waterGoalText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  quickAddRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickAddChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 100, borderWidth: 1.5 },
  quickAddLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  waterBtns: { flexDirection: "row", gap: 10, alignItems: "center" },
  stepperBtn: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepperText: { fontSize: 22, fontFamily: "Inter_400Regular", lineHeight: 26 },
  stepperDisplay: { flex: 1, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepperValue: { fontSize: 17, fontFamily: "Inter_700Bold" },
  // Sleep
  sleepRow: { gap: 8, paddingVertical: 2 },
  sleepChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, minWidth: 56, alignItems: "center" },
  sleepChipLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  qualityRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  qualityChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100 },
  qualityLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  // Toast
  toast: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
    alignItems: "center",
    pointerEvents: "none",
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1A1A2E",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
