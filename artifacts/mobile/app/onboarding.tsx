import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const PREMIUM_PERKS = [
  { icon: "trending-down", label: "Lose belly fat", color: "#FF7F7F" },
  { icon: "zap",           label: "Daily guided workouts", color: "#6A0DAD" },
  { icon: "book-open",     label: "Track meals & progress", color: "#FF7F7F" },
  { icon: "award",         label: "90-Day Challenge access", color: "#6A0DAD" },
  { icon: "heart",         label: "Personal coach support", color: "#FF7F7F" },
];

const FEATURES = [
  {
    icon: "zap",
    title: "Track Workouts",
    desc: "Log strength, cardio, HIIT, and yoga sessions",
  },
  {
    icon: "coffee",
    title: "Log Meals & Water",
    desc: "AI-powered calorie estimation in seconds",
  },
  {
    icon: "moon",
    title: "Monitor Sleep",
    desc: "Build consistent recovery habits",
  },
  {
    icon: "trending-up",
    title: "90-Day Transformation",
    desc: "Follow a structured program built for you",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useApp();

  const topPad = Platform.OS === "web" ? 32 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const handleStart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const handleStartPremium = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding();
    router.replace("/upgrade" as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad, paddingBottom: bottomPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIconWrap}>
            <Image
              source={require("../assets/images/logo-mark.png")}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brand}>CoreHer Fitness</Text>
          <Text style={styles.tagline}>Build your core. Transform your confidence.</Text>
        </LinearGradient>

        {/* Description */}
        <View style={[styles.descCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.descTitle, { color: colors.foreground }]}>
            Welcome to your transformation
          </Text>
          <Text style={[styles.descText, { color: colors.mutedForeground }]}>
            CoreHer Fitness is your all-in-one transformation platform designed for women ready to lose belly fat, track their lifestyle, and rebuild confidence.
          </Text>
          <Text style={[styles.descText, { color: colors.mutedForeground, marginTop: 10 }]}>
            Track your workouts, meals, water intake, and sleep all in one place, while following structured programs like the 90-Day Transformation Challenge.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={[
                styles.featureCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: i % 2 === 0 ? colors.primaryLight : colors.peachLight },
                ]}
              >
                <Feather
                  name={f.icon as any}
                  size={20}
                  color={i % 2 === 0 ? colors.primary : colors.peach}
                />
              </View>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>
                {f.title}
              </Text>
              <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>
                {f.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* Made for women */}
        <View style={[styles.badgeRow, { backgroundColor: colors.primaryLight }]}>
          <Feather name="users" size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            Designed for women ready to lose belly fat and feel confident again
          </Text>
        </View>

        {/* ── Premium Upsell Card ── */}
        <View style={[styles.premiumCard, { backgroundColor: colors.card }]}>
          {/* Card header */}
          <LinearGradient
            colors={["#6A0DAD", "#9B5DE5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumCardHeader}
          >
            <View style={styles.premiumCardHeaderRow}>
              <View style={styles.premiumStarCircle}>
                <Feather name="star" size={18} color="#FFD700" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumCardTitle}>Go Premium Today</Text>
                <Text style={styles.premiumCardSub}>
                  Unlock your full transformation
                </Text>
              </View>
              <View style={styles.premiumCardPricePill}>
                <Text style={styles.premiumCardPriceAmt}>UGX 75,000</Text>
                <Text style={styles.premiumCardPriceSub}>one-time</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Perks */}
          <View style={styles.premiumPerks}>
            {PREMIUM_PERKS.map((p) => (
              <View key={p.label} style={styles.premiumPerkRow}>
                <View
                  style={[
                    styles.premiumPerkIcon,
                    { backgroundColor: p.color + "18" },
                  ]}
                >
                  <Feather name={p.icon as any} size={14} color={p.color} />
                </View>
                <Text style={[styles.premiumPerkLabel, { color: colors.foreground }]}>
                  {p.label}
                </Text>
                <Feather name="check" size={14} color="#22C55E" />
              </View>
            ))}
          </View>

          {/* Primary CTA */}
          <TouchableOpacity onPress={handleStartPremium} activeOpacity={0.87} style={styles.premiumCTAWrap}>
            <LinearGradient
              colors={["#6A0DAD", "#9B5DE5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumCTA}
            >
              <Feather name="star" size={17} color="#FFD700" />
              <Text style={styles.premiumCTAText}>Start My Transformation</Text>
              <Feather name="arrow-right" size={17} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary */}
          <TouchableOpacity onPress={handleStart} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
              Explore for free first
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 18 },
  hero: {
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 8,
    shadowColor: "#6A0DAD",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  heroIconWrap: {
    width: 150,
    height: 190,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    padding: 6,
    overflow: "hidden",
  },
  heroLogo: { width: "100%", height: "100%" },
  brand: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
  },
  descCard: {
    borderRadius: 20,
    padding: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  descTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  descText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 100,
    alignSelf: "center",
  },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  premiumCard: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#6A0DAD",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  premiumCardHeader: { padding: 18 },
  premiumCardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  premiumStarCircle: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  premiumCardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  premiumCardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  premiumCardPricePill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12, padding: 10, alignItems: "center",
  },
  premiumCardPriceAmt: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  premiumCardPriceSub: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 1 },
  premiumPerks: { padding: 16, gap: 12 },
  premiumPerkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  premiumPerkIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  premiumPerkLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  premiumCTAWrap: { marginHorizontal: 16, marginBottom: 4, borderRadius: 100, overflow: "hidden" },
  premiumCTA: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, paddingHorizontal: 20,
  },
  premiumCTAText: {
    flex: 1, textAlign: "center",
    color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold",
  },
  skipBtn: { alignSelf: "center", paddingVertical: 14, paddingBottom: 18 },
  skipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
