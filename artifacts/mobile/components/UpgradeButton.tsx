import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface UpgradeButtonProps {
  onPress: () => void;
  loading?: boolean;
  label?: string;
  sublabel?: string;
  gradientColors?: readonly [string, string, ...string[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function UpgradeButton({
  onPress,
  loading = false,
  label = "Upgrade to Premium",
  sublabel,
  gradientColors = ["#6A0DAD", "#9B5DE5"],
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
  iconSize = 17,
  style,
  disabled,
}: UpgradeButtonProps) {
  const isCard = !!sublabel;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.87}
      disabled={disabled ?? loading}
      style={[isCard ? styles.cardWrap : styles.btnWrap, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={gradientStart}
        end={gradientEnd}
        style={[isCard ? styles.cardGradient : styles.btnGradient, loading && styles.loadingOpacity]}
      >
        {loading ? (
          <View style={isCard ? styles.cardLoader : styles.btnLoader}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        ) : isCard ? (
          <View style={styles.cardRow}>
            <Feather name="star" size={iconSize} color="#FFD700" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>{label}</Text>
              <Text style={styles.cardSublabel}>{sublabel}</Text>
            </View>
            <Feather name="arrow-right" size={iconSize} color="#fff" />
          </View>
        ) : (
          <>
            <Feather name="star" size={iconSize} color="#FFD700" />
            <Text style={styles.btnLabel}>{label}</Text>
            <Feather name="arrow-right" size={iconSize} color="#fff" />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnWrap: {
    borderRadius: 18,
    overflow: "hidden",
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    paddingHorizontal: 24,
  },
  btnLoader: {
    paddingVertical: 2,
  },
  btnLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  cardWrap: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 16,
  },
  cardLoader: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 4,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  cardSublabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.73)",
  },
  loadingOpacity: {
    opacity: 0.75,
  },
});
