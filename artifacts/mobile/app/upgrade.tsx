import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { PillButton } from "@/components/PillButton";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";

const BENEFITS = [
  { icon: "award",      text: "90-Day Transformation Challenge" },
  { icon: "trending-up",text: "Full weekly & monthly progress charts" },
  { icon: "zap",        text: "Unlimited AI-powered calorie estimation" },
  { icon: "users",      text: "Direct coach access & feedback" },
  { icon: "star",       text: "Personalised workout programs" },
  { icon: "lock",       text: "Premium community & resources" },
];

const BG_TOP    = "#2D0B4E";
const BG_BOTTOM = "#0F172A";
const CARD_BG   = "rgba(255,255,255,0.07)";
const CARD_BORDER = "rgba(255,255,255,0.12)";
const WHITE     = "#FFFFFF";
const MUTED     = "rgba(255,255,255,0.60)";
const ICON_TINT = "rgba(255,255,255,0.18)";

export default function UpgradeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, checkPremiumStatus } = useApp();
  const [checking, setChecking] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const hasPendingPayment = user?.paymentStatus === "pending";
  const isApproved = user?.paymentStatus === "approved" || user?.isPremium;

  const handleCheckStatus = async () => {
    setChecking(true);
    await checkPremiumStatus();
    setChecking(false);
    if (user?.isPremium) {
      Alert.alert("Premium Active!", "Your Premium access is now active. Welcome to your transformation journey.");
    } else if (user?.paymentStatus === "pending") {
      Alert.alert("Pending", "Your payment is still pending review. You will be activated shortly.");
    } else {
      Alert.alert("Not found", "No approved payment found yet. Please try again later.");
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BG_TOP, BG_BOTTOM]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Corner decorative elements — 8% opacity */}
      <View style={styles.cornerTL} pointerEvents="none">
        <View style={styles.cornerCircle}>
          <Feather name="zap" size={52} color={WHITE} style={{ opacity: 0.08 }} />
        </View>
        <View style={[styles.cornerCircle, styles.cornerCircleOuter]} />
      </View>
      <View style={styles.cornerTR} pointerEvents="none">
        <View style={styles.cornerCircle}>
          <Feather name="trending-up" size={48} color={WHITE} style={{ opacity: 0.08 }} />
        </View>
        <View style={[styles.cornerCircle, styles.cornerCircleOuter]} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton color={WHITE} style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
          <Text style={styles.headerTitle}>CoreHer Premium</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.starBadge}>
            <Feather name="star" size={16} color="#FFD700" />
            <Text style={styles.starBadgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.heroHeading}>Build your core.{"\n"}Transform your confidence.</Text>
          <Text style={styles.heroSub}>
            Everything you need to achieve a real, lasting transformation — in one place.
          </Text>
        </View>

        {/* Benefits card */}
        <View style={[styles.card, styles.benefitsCard]}>
          <Text style={styles.cardHeading}>What you unlock</Text>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitIconWrap}>
                <Feather name={b.icon as any} size={15} color="#C084FC" />
              </View>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing card */}
        <View style={[styles.card, styles.priceCard]}>
          <Text style={styles.cardHeading}>How to pay</Text>

          <View style={styles.merchantBox}>
            <View style={styles.merchantRow}>
              <View style={styles.airtelDot}>
                <Text style={styles.airtelDotText}>A</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.merchantLabel}>Airtel Money Uganda</Text>
                <Text style={styles.merchantCode}>Merchant Code: 7071895</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Monthly fee</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceAmount}>UGX 75,000</Text>
              </View>
            </View>
          </View>

          {isApproved ? (
            <View style={styles.approvedBadge}>
              <Feather name="check-circle" size={18} color="#4ADE80" />
              <Text style={styles.approvedText}>Premium is Active</Text>
            </View>
          ) : hasPendingPayment ? (
            <View>
              <View style={styles.pendingBadge}>
                <Feather name="clock" size={16} color="#FCD34D" />
                <Text style={styles.pendingText}>Payment pending review</Text>
              </View>
              <Text style={styles.pendingSub}>
                You will be notified once your coach approves your payment.
              </Text>
              <PillButton
                label={checking ? "Checking..." : "Check Status"}
                variant="ghost"
                onPress={handleCheckStatus}
              />
            </View>
          ) : (
            /* CTA button */
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/payment");
              }}
              style={styles.ctaWrap}
            >
              <LinearGradient
                colors={["#6A0DAD", "#FF7F7F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaLabel}>Start Your 90-Day Transformation</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.note}>
          Payments are manually verified by your coach. Access is activated within 24 hours of confirmation.
        </Text>
      </ScrollView>
      <BottomNav active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* ── Decorative corners ── */
  cornerTL: {
    position: "absolute",
    top: -40,
    left: -40,
    pointerEvents: "none",
  },
  cornerTR: {
    position: "absolute",
    top: -30,
    right: -40,
    pointerEvents: "none",
    alignItems: "flex-end",
  },
  cornerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(106,13,173,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  cornerCircleOuter: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    top: -30,
    left: -30,
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: WHITE,
    letterSpacing: 0.3,
  },

  /* ── Hero ── */
  hero: {
    paddingHorizontal: 24,
    marginBottom: 28,
    gap: 12,
  },
  starBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,215,0,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.30)",
  },
  starBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#FFD700",
    letterSpacing: 1.2,
  },
  heroHeading: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: WHITE,
    lineHeight: 38,
  },
  heroSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: MUTED,
    lineHeight: 22,
  },

  /* ── Cards ── */
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_BG,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    gap: 14,
  },
  benefitsCard: { marginBottom: 16 },
  priceCard:    { marginBottom: 16 },
  cardHeading: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: WHITE,
    marginBottom: 2,
  },

  /* ── Benefits ── */
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(192,132,252,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    flex: 1,
  },

  /* ── Merchant box ── */
  merchantBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,102,0,0.30)",
    backgroundColor: "rgba(255,102,0,0.08)",
    padding: 14,
  },
  merchantRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  airtelDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6600",
    alignItems: "center",
    justifyContent: "center",
  },
  airtelDotText: { fontSize: 18, fontFamily: "Inter_700Bold", color: WHITE },
  merchantLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },
  merchantCode: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FF8533",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,102,0,0.20)",
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },
  priceBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  priceAmount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: WHITE,
  },

  /* ── CTA ── */
  ctaWrap: { borderRadius: 16, overflow: "hidden" },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  ctaLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: WHITE,
    letterSpacing: 0.2,
  },

  /* ── Status badges ── */
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(74,222,128,0.12)",
  },
  approvedText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#4ADE80",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(252,211,77,0.12)",
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FCD34D",
  },
  pendingSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: MUTED,
    marginBottom: 12,
    lineHeight: 18,
  },

  /* ── Footer note ── */
  note: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginHorizontal: 32,
    lineHeight: 18,
    marginTop: 4,
    color: "rgba(255,255,255,0.35)",
  },
});
