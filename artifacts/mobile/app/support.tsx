import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import { PremiumGate } from "@/components/PremiumGate";

const FAQS = [
  {
    q: "How long until my payment is confirmed?",
    a: "Typically within 24 hours. Your coach manually verifies each payment.",
  },
  {
    q: "What if I paid but nothing happened?",
    a: "Contact Coach TinaBarks on WhatsApp with your Airtel Money transaction ID.",
  },
  {
    q: "Can I get a refund?",
    a: "Reach out to the coach directly on WhatsApp to discuss your situation.",
  },
  {
    q: "How do I access the 90-Day Challenge?",
    a: "The challenge becomes available once your Premium access is activated.",
  },
];

export default function SupportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { coachProfile } = useApp();

  const whatsappNumber = coachProfile.phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const defaultMsg = `Hello ${coachProfile.name}, I need help with app-pure fitness.`;

  const openWhatsApp = async (message?: string) => {
    const url = `${whatsappUrl}?text=${encodeURIComponent(message ?? defaultMsg)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        "WhatsApp not found",
        `Please message ${coachProfile.name} directly on ${coachProfile.phone}`
      );
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header — always accessible so users can navigate back */}
      <View style={{ paddingTop: topPad + 8 }}>
        <View style={styles.header}>
          <BackButton color={colors.foreground} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Coach Support</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <PremiumGate feature="Personal Coaching" embedded>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#6A0DAD", "#9B5DE5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Feather name="message-circle" size={30} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>We're here for you</Text>
          <Text style={styles.heroSub}>
            We're here to support your transformation journey.{"\n"}Reach out anytime.
          </Text>
        </LinearGradient>

        {/* Primary WhatsApp CTA */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Chat with your Coach
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            {coachProfile.name} is available to help with payments, workouts, and your progress.
          </Text>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              openWhatsApp();
            }}
            activeOpacity={0.85}
            style={styles.whatsappBtnWrap}
          >
            <LinearGradient
              colors={["#25D366", "#128C7E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.whatsappBtn}
            >
              <Feather name="message-circle" size={20} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.whatsappBtnLabel}>Chat on WhatsApp</Text>
                <Text style={styles.whatsappBtnSub}>+{whatsappNumber}</Text>
              </View>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={[styles.coachRow, { backgroundColor: colors.muted }]}>
            <View style={[styles.coachAvatar, { backgroundColor: "#6A0DAD" }]}>
              <Text style={styles.coachAvatarText}>
                {coachProfile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.coachName, { color: colors.foreground }]}>{coachProfile.name}</Text>
              <Text style={[styles.coachRole, { color: colors.mutedForeground }]}>
                Your Personal Fitness Coach
              </Text>
            </View>
            <View style={[styles.onlineDot, { backgroundColor: "#22C55E" }]} />
          </View>
        </View>

        {/* Quick contact links */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Quick Contact</Text>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              openWhatsApp(`Hi ${coachProfile.name}, I have a payment question.`);
            }}
            style={[styles.quickRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#25D36618" }]}>
              <Feather name="dollar-sign" size={16} color="#25D366" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Payment Issue</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>WhatsApp · Instant reply</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              openWhatsApp(`Hi ${coachProfile.name}, I need help with my workout plan.`);
            }}
            style={[styles.quickRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#6A0DAD18" }]}>
              <Feather name="zap" size={16} color="#6A0DAD" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Workout Guidance</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>WhatsApp · Instant reply</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              openWhatsApp(`Hi ${coachProfile.name}, I have a question about my nutrition.`);
            }}
            style={[styles.quickRow, { borderBottomColor: "transparent" }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#FF7F7F18" }]}>
              <Feather name="book-open" size={16} color="#FF7F7F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Nutrition & Meals</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>WhatsApp · Instant reply</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>FAQs</Text>
          {FAQS.map((faq, i) => (
            <View
              key={i}
              style={[
                styles.faqItem,
                i < FAQS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={styles.faqQRow}>
                <View style={[styles.faqQBadge, { backgroundColor: "#6A0DAD18" }]}>
                  <Text style={[styles.faqQBadgeText, { color: "#6A0DAD" }]}>Q</Text>
                </View>
                <Text style={[styles.faqQ, { color: colors.foreground }]}>{faq.q}</Text>
              </View>
              <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* Number display */}
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            openWhatsApp();
          }}
          style={[styles.numberBox, { backgroundColor: colors.card }]}
        >
          <Feather name="phone" size={16} color="#25D366" />
          <Text style={[styles.numberText, { color: colors.foreground }]}>
            +{whatsappNumber}
          </Text>
          <View style={[styles.waBadge, { backgroundColor: "#25D36618" }]}>
            <Text style={[styles.waBadgeText, { color: "#25D366" }]}>WhatsApp</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      </PremiumGate>
      <BottomNav active="profile" />
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
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  hero: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  heroSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#ffffffcc",
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    gap: 14,
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginTop: -4 },

  whatsappBtnWrap: { borderRadius: 16, overflow: "hidden" },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  whatsappBtnLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  whatsappBtnSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#ffffff99", marginTop: 1 },

  coachRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 12,
  },
  coachAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  coachAvatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  coachName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  coachRole: { fontSize: 12, fontFamily: "Inter_400Regular" },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },

  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  quickSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  faqItem: { paddingVertical: 12, gap: 8 },
  faqQRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  faqQBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  faqQBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  faqQ: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1, lineHeight: 19 },
  faqA: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, paddingLeft: 32 },

  numberBox: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  numberText: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  waBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  waBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
