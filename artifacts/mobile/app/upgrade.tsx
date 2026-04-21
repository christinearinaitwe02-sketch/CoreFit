import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

const BENEFITS = [
  { icon: "award",     text: "90-Day Transformation Challenge" },
  { icon: "trending-up", text: "Full weekly & monthly progress charts" },
  { icon: "zap",       text: "Unlimited AI-powered calorie estimation" },
  { icon: "users",     text: "Direct coach access & feedback" },
  { icon: "star",      text: "Personalised workout programs" },
  { icon: "lock",      text: "Premium community & resources" },
];

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
    const fresh = user;
    if (fresh?.isPremium) {
      Alert.alert("Premium Active!", "Your Premium access is now active. Welcome to your transformation journey.");
    } else if (fresh?.paymentStatus === "pending") {
      Alert.alert("Pending", "Your payment is still pending review. You will be activated shortly.");
    } else {
      Alert.alert("Not found", "No approved payment found yet. Please try again later.");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Upgrade to Premium</Text>
          <View style={{ width: 36 }} />
        </View>

        <LinearGradient
          colors={["#6A0DAD", "#9B5DE5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <Feather name="star" size={36} color="#FFD700" />
          <Text style={styles.heroTitle}>CoreHer Premium</Text>
          <Text style={styles.heroSub}>Unlock your full transformation journey</Text>
        </LinearGradient>

        <View style={[styles.benefitsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>What you get</Text>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: "#6A0DAD18" }]}>
                <Feather name={b.icon as any} size={16} color="#6A0DAD" />
              </View>
              <Text style={[styles.benefitText, { color: colors.foreground }]}>{b.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.payCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>How to pay</Text>
          <View style={[styles.merchantBox, { backgroundColor: "#FF6600" + "12", borderColor: "#FF6600" + "30" }]}>
            <View style={styles.merchantRow}>
              <View style={[styles.airtelDot, { backgroundColor: "#FF6600" }]}>
                <Text style={styles.airtelDotText}>A</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.airtelLabel, { color: colors.mutedForeground }]}>Airtel Money Uganda</Text>
                <Text style={[styles.merchantCode, { color: "#FF6600" }]}>Merchant Code: 7071895</Text>
              </View>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>One-time fee</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceAmount}>UGX 75,000</Text>
              </View>
            </View>
          </View>

          {isApproved ? (
            <View style={[styles.approvedBadge, { backgroundColor: "#22C55E18" }]}>
              <Feather name="check-circle" size={18} color="#22C55E" />
              <Text style={[styles.approvedText, { color: "#22C55E" }]}>Premium is Active</Text>
            </View>
          ) : hasPendingPayment ? (
            <View>
              <View style={[styles.pendingBadge, { backgroundColor: "#F59E0B18" }]}>
                <Feather name="clock" size={16} color="#F59E0B" />
                <Text style={[styles.pendingText, { color: "#F59E0B" }]}>
                  Payment pending review
                </Text>
              </View>
              <Text style={[styles.pendingSub, { color: colors.mutedForeground }]}>
                You will be notified once your coach approves your payment.
              </Text>
              <PillButton
                label={checking ? "Checking..." : "Check Status"}
                variant="ghost"
                onPress={handleCheckStatus}
              />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/payment");
              }}
              style={styles.airtelBtn}
            >
              <LinearGradient
                colors={["#FF6600", "#FF8533"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.airtelBtnGradient}
              >
                <View style={[styles.airtelDotSm, { backgroundColor: "#fff3" }]}>
                  <Text style={styles.airtelDotSmText}>A</Text>
                </View>
                <Text style={styles.airtelBtnLabel}>Pay with Airtel Money</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Payments are manually verified by your coach. Access is activated within 24 hours of confirmation.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: { padding: 6 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  heroBanner: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  heroTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  heroSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#ffffffcc", textAlign: "center" },
  benefitsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  sectionLabel: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  payCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    gap: 14,
  },
  merchantBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  merchantRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  priceDivider: { height: 1, backgroundColor: "#FF660020", marginVertical: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  priceBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  priceAmount: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  airtelDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  airtelDotText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  airtelLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  merchantCode: { fontSize: 16, fontFamily: "Inter_700Bold" },
  airtelBtn: { borderRadius: 16, overflow: "hidden" },
  airtelBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  airtelDotSm: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  airtelDotSmText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  airtelBtnLabel: { flex: 1, fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  approvedText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  pendingText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  pendingSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12, lineHeight: 18 },
  note: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginHorizontal: 32,
    lineHeight: 18,
    marginTop: 4,
  },
});
