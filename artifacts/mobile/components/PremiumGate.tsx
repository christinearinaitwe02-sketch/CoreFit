import { isElevated } from "@/utils/roles";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";

interface Props {
  feature: string;
  children: React.ReactNode;
  embedded?: boolean;
}

export function PremiumGate({ feature, children, embedded = false }: Props) {
  const { user } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = embedded ? 0 : Platform.OS === "web" ? 67 : insets.top;

  if (user?.isPremium || isElevated(user?.role)) return <>{children}</>;

  return (
    <LinearGradient
      colors={["#2D0B4E", "#4A0876", "#1E0538"]}
      style={[styles.container, { paddingTop: topPad }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <View style={styles.decorCircleTopRight} />
      <View style={styles.decorCircleBottomLeft} />

      <View style={styles.content}>
        <View style={styles.lockCircle}>
          <Feather name="lock" size={34} color="#FFD700" />
        </View>

        <View style={styles.badge}>
          <Feather name="star" size={12} color="#FFD700" />
          <Text style={styles.badgeText}>Premium Feature</Text>
        </View>

        <Text style={styles.title}>
          Unlock Premium to access{"\n"}
          <Text style={styles.titleHighlight}>{feature}</Text>
        </Text>

        <Text style={styles.sub}>
          Join app-pure Premium and get access to all transformation tools designed
          for women ready to lose belly fat and feel confident again.
        </Text>

        <View style={styles.bullets}>
          {PREMIUM_BENEFITS.map((b) => (
            <View key={b} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>UGX 75,000</Text>
          <Text style={styles.priceLabel}> / month</Text>
          <View style={styles.airtelBadge}>
            <Text style={styles.airtelText}>Airtel Money</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/upgrade");
          }}
          activeOpacity={0.87}
          style={styles.btnWrap}
        >
          <LinearGradient
            colors={["#9B5DE5", "#FF7F7F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Feather name="star" size={17} color="#FFD700" />
            <Text style={styles.btnText}>Upgrade to Premium</Text>
            <Feather name="arrow-right" size={17} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const PREMIUM_BENEFITS = [
  "90-Day Transformation Challenge",
  "Advanced progress charts & analytics",
  "Personal coach support via WhatsApp",
  "Guided daily workouts",
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  decorCircleTopRight: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(155,93,229,0.12)",
  },
  decorCircleBottomLeft: {
    position: "absolute",
    bottom: 60,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,127,127,0.08)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 32,
    justifyContent: "center",
    gap: 20,
  },
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,215,0,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#FFD700",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 34,
  },
  titleHighlight: {
    color: "#FFB3B3",
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 21,
  },
  bullets: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9B5DE5",
  },
  bulletText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.80)",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceAmount: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    flex: 1,
  },
  airtelBadge: {
    backgroundColor: "#FF6600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  airtelText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  btnWrap: {
    borderRadius: 18,
    overflow: "hidden",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    paddingHorizontal: 24,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
});
