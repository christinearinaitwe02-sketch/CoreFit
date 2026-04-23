import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const BENEFITS = [
  { icon: "trending-down", label: "Lose belly fat" },
  { icon: "zap",           label: "Daily guided workouts" },
  { icon: "award",         label: "90-Day Transformation" },
  { icon: "heart",         label: "Personal coach support" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
}

export function PremiumGateModal({ visible, onClose, featureName }: Props) {
  const colors = useColors();
  const router = useRouter();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleUpgrade = () => {
    if (upgradeLoading) return;
    setUpgradeLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => {
      onClose();
      router.push("/upgrade");
      setUpgradeLoading(false);
    }, 400);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.card }]}>
              {/* Gradient header */}
              <LinearGradient
                colors={["#6A0DAD", "#9B5DE5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
              >
                <View style={styles.starWrap}>
                  <Feather name="star" size={28} color="#FFD700" />
                </View>
                <Text style={styles.headerTitle}>Premium Feature</Text>
                {featureName && (
                  <View style={styles.featureTag}>
                    <Feather name="lock" size={11} color="#fff" />
                    <Text style={styles.featureTagText}>{featureName}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </LinearGradient>

              {/* Body */}
              <View style={styles.body}>
                <Text style={[styles.headline, { color: colors.foreground }]}>
                  Upgrade to{" "}
                  <Text style={{ color: "#6A0DAD" }}>Premium</Text>
                </Text>
                <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                  {featureName
                    ? `Unlock Premium to access the ${featureName}.`
                    : "Unlock your full transformation journey with CoreHer Premium."}
                </Text>

                {/* Benefits */}
                <View style={styles.benefits}>
                  {BENEFITS.map((b) => (
                    <View key={b.label} style={styles.benefitRow}>
                      <View style={[styles.benefitIcon, { backgroundColor: "#6A0DAD18" }]}>
                        <Feather name={b.icon as any} size={14} color="#6A0DAD" />
                      </View>
                      <Text style={[styles.benefitLabel, { color: colors.foreground }]}>
                        {b.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Price */}
                <View style={[styles.priceBox, { backgroundColor: colors.muted }]}>
                  <View>
                    <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>
                      Monthly fee
                    </Text>
                    <Text style={[styles.priceAmount, { color: colors.foreground }]}>
                      UGX 75,000
                    </Text>
                  </View>
                  <View style={styles.airtelBadge}>
                    <Text style={styles.airtelBadgeText}>Airtel Money</Text>
                  </View>
                </View>

                {/* Upgrade CTA */}
                <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.87} disabled={upgradeLoading} style={styles.upgradeWrap}>
                  <LinearGradient
                    colors={["#6A0DAD", "#9B5DE5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.upgradeBtn, upgradeLoading && { opacity: 0.75 }]}
                  >
                    {upgradeLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Feather name="star" size={18} color="#FFD700" />
                        <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
                        <Feather name="arrow-right" size={18} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
                  <Text style={[styles.laterText, { color: colors.mutedForeground }]}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    padding: 24,
    alignItems: "center",
    gap: 8,
    paddingTop: 28,
  },
  starWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  featureTagText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#fff" },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  body: { padding: 24, gap: 16 },
  headline: { fontSize: 22, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginTop: -8 },
  benefits: { gap: 10 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  benefitLabel: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 14,
  },
  priceLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  priceAmount: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 2 },
  airtelBadge: {
    backgroundColor: "#FF6600",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  airtelBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  upgradeWrap: { borderRadius: 18, overflow: "hidden" },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    paddingHorizontal: 24,
  },
  upgradeBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", flex: 1, textAlign: "center" },
  laterBtn: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 20 },
  laterText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
