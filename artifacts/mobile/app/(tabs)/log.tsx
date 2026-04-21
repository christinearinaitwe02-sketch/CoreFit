import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PillButton } from "@/components/PillButton";

type LogTab = "meal" | "water" | "sleep";

const MEAL_CATEGORIES = [
  { key: "breakfast", label: "Breakfast", icon: "sunrise" },
  { key: "lunch", label: "Lunch", icon: "sun" },
  { key: "dinner", label: "Dinner", icon: "sunset" },
  { key: "snack", label: "Snack", icon: "package" },
] as const;

type MealCategory = typeof MEAL_CATEGORIES[number]["key"];

const WATER_GLASSES = [1, 2, 3, 4, 5, 6, 7, 8];
const SLEEP_HOURS = [4, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10];

export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMeal, addWaterEntry, addSleepEntry, getTodayWater, waterEntries, sleepEntries } =
    useApp();

  const [activeTab, setActiveTab] = useState<LogTab>("meal");

  // Meal state
  const [mealName, setMealName] = useState("");
  const [mealCategory, setMealCategory] = useState<MealCategory>("breakfast");
  const [mealCalories, setMealCalories] = useState("");

  // Water state
  const today = new Date().toISOString().split("T")[0];
  const todayWater = getTodayWater();
  const [glasses, setGlasses] = useState(todayWater);

  // Sleep state
  const todaySleep = sleepEntries.find((s) => s.date === today);
  const [sleepHours, setSleepHours] = useState(todaySleep?.hours ?? 7);
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">(
    todaySleep?.quality ?? "good"
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
    Alert.alert("Logged!", `${mealName} has been added.`);
  };

  const handleSaveWater = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addWaterEntry(today, glasses);
    Alert.alert("Saved!", `${glasses} glasses of water logged for today.`);
  };

  const handleSaveSleep = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSleepEntry({ date: today, hours: sleepHours, quality: sleepQuality });
    Alert.alert("Saved!", `${sleepHours} hours of sleep logged.`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>
          Daily Log
        </Text>

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
                  {
                    color:
                      activeTab === t.key
                        ? colors.primary
                        : colors.mutedForeground,
                  },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal Log */}
        {activeTab === "meal" && (
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>
              Log a Meal
            </Text>

            {/* Category */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Category
            </Text>
            <View style={styles.catRow}>
              {MEAL_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => {
                    setMealCategory(c.key);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor:
                        mealCategory === c.key
                          ? colors.primary
                          : colors.muted,
                    },
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
                      {
                        color:
                          mealCategory === c.key ? "#fff" : colors.mutedForeground,
                      },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Meal Name */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Meal Name *
            </Text>
            <TextInput
              value={mealName}
              onChangeText={setMealName}
              placeholder="e.g. Grilled chicken salad"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                { backgroundColor: colors.muted, color: colors.foreground },
              ]}
            />

            {/* Calories */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Calories (optional)
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

            <PillButton label="Save Meal" onPress={handleSaveMeal} style={{ marginTop: 8 }} />
          </View>
        )}

        {/* Water Log */}
        {activeTab === "water" && (
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>
              Water Intake
            </Text>
            <Text style={[styles.waterCount, { color: colors.primary }]}>
              {glasses}
            </Text>
            <Text style={[styles.waterUnit, { color: colors.mutedForeground }]}>
              glasses today
            </Text>

            <View style={styles.waterGrid}>
              {WATER_GLASSES.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => {
                    setGlasses(g);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.waterGlass,
                    {
                      backgroundColor:
                        g <= glasses ? "#38BDF8" : "#E0F7FF",
                      borderColor: g <= glasses ? "#38BDF8" : "#B0E8F8",
                    },
                  ]}
                >
                  <Feather
                    name="droplet"
                    size={22}
                    color={g <= glasses ? "#fff" : "#38BDF8"}
                  />
                  <Text
                    style={[
                      styles.glassNum,
                      { color: g <= glasses ? "#fff" : "#38BDF8" },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.waterBtns}>
              <PillButton
                label="Remove Glass"
                variant="ghost"
                size="sm"
                onPress={() => setGlasses((g) => Math.max(0, g - 1))}
                icon={<Feather name="minus" size={14} color={"#9B5DE5"} />}
              />
              <PillButton
                label="Add Glass"
                size="sm"
                onPress={() => setGlasses((g) => Math.min(20, g + 1))}
                icon={<Feather name="plus" size={14} color="#fff" />}
              />
            </View>

            <PillButton label="Save Water Log" onPress={handleSaveWater} style={{ marginTop: 4 }} />
          </View>
        )}

        {/* Sleep Log */}
        {activeTab === "sleep" && (
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>
              Sleep Tracker
            </Text>
            <Text style={[styles.waterCount, { color: "#818CF8" }]}>
              {sleepHours}h
            </Text>
            <Text style={[styles.waterUnit, { color: colors.mutedForeground }]}>
              hours slept
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Hours Slept
            </Text>
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
                    {
                      backgroundColor:
                        sleepHours === h ? "#818CF8" : "#EEF2FF",
                    },
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

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Sleep Quality
            </Text>
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
                    {
                      backgroundColor:
                        sleepQuality === q ? "#818CF8" : "#EEF2FF",
                    },
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

            <PillButton label="Save Sleep Log" onPress={handleSaveSleep} style={{ marginTop: 8 }} />
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
  tabLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  panel: {
    marginHorizontal: 20,
    gap: 12,
  },
  panelTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: -4,
  },
  catRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
  },
  catLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  waterCount: {
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -2,
  },
  waterUnit: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: -4,
    marginBottom: 8,
  },
  waterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  waterGlass: {
    width: 68,
    height: 68,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    gap: 2,
  },
  glassNum: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  waterBtns: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 4,
  },
  sleepRow: {
    gap: 8,
    paddingVertical: 2,
  },
  sleepChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  sleepChipLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  qualityRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  qualityChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  qualityLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
