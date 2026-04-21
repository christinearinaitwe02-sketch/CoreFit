import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Linking,
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

type Step = "instructions" | "form" | "success";

const DIAL_STEPS = [
  {
    icon: "phone",
    label: "Open Airtel Money",
    detail: "Dial *185# on your phone",
    color: "#FF6600",
  },
  {
    icon: "list",
    label: "Select Pay Merchant",
    detail: "Choose option from the menu",
    color: "#6A0DAD",
  },
  {
    icon: "hash",
    label: "Enter Merchant Code",
    detail: "Code: 7071895",
    color: "#0EA5E9",
  },
  {
    icon: "dollar-sign",
    label: "Enter Amount",
    detail: "UGX 75,000",
    color: "#22C55E",
  },
  {
    icon: "lock",
    label: "Confirm with PIN",
    detail: "Enter your Airtel Money PIN",
    color: "#F59E0B",
  },
];

const BENEFITS = [
  { icon: "trending-down" as const, label: "Lose belly fat" },
  { icon: "zap" as const, label: "Daily guided workouts" },
  { icon: "book-open" as const, label: "Meal tracking" },
  { icon: "heart" as const, label: "Coach support" },
];

const COUNTDOWN_SECS = 5 * 60;

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

const WHATSAPP_URL = "https://wa.me/256702568383";

async function openWhatsApp(message?: string) {
  const url = message
    ? `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`
    : WHATSAPP_URL;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert("WhatsApp", "Please contact Coach TinaBarks directly on +256702568383");
  }
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setPaymentPending } = useApp();

  const [step, setStep] = useState<Step>("instructions");
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("75000");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECS);
  const [activeDialStep, setActiveDialStep] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isUrgent = timeLeft <= 60;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isUrgent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isUrgent]);

  const handleSubmit = async () => {
    if (!fullName.trim()) return Alert.alert("Required", "Please enter your full name.");
    if (!phone.trim()) return Alert.alert("Required", "Please enter your phone number.");
    if (!amount.trim() || isNaN(Number(amount)))
      return Alert.alert("Required", "Please enter a valid amount.");
    if (!transactionId.trim()) return Alert.alert("Required", "Transaction ID is required.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? "anonymous",
          fullName: fullName.trim(),
          phone: phone.trim(),
          amount: Number(amount),
          transactionId: transactionId.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) return Alert.alert("Error", data.error ?? "Something went wrong.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPaymentPending();
      if (timerRef.current) clearInterval(timerRef.current);
      setStep("success");
    } catch {
      Alert.alert("Error", "Could not connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const goToForm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStep("form");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() =>
                step === "instructions" ? router.back() : setStep("instructions")
              }
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              {step === "instructions"
                ? "Upgrade to Premium"
                : step === "form"
                ? "Confirm Payment"
                : "Payment Submitted"}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* ══════════════ STEP 1: Instructions ══════════════ */}
          {step === "instructions" && (
            <View>
              {/* Hero */}
              <LinearGradient
                colors={["#6A0DAD", "#9B5DE5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroBanner}
              >
                <Text style={styles.heroHeadline}>
                  Start Your 90-Day{"\n"}Transformation Today
                </Text>
                <Text style={styles.heroSub}>
                  Join women who are reshaping their bodies and confidence
                </Text>
                <View style={styles.benefitsGrid}>
                  {BENEFITS.map((b) => (
                    <View key={b.label} style={styles.benefitItem}>
                      <View style={styles.benefitIconWrap}>
                        <Feather name={b.icon} size={14} color="#fff" />
                      </View>
                      <Text style={styles.benefitLabel}>{b.label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.urgencyPill}>
                  <Feather name="alert-circle" size={12} color="#FF6600" />
                  <Text style={styles.urgencyText}>Limited coaching slots available</Text>
                </View>
              </LinearGradient>

              {/* Countdown */}
              <Animated.View
                style={[
                  styles.countdownBox,
                  {
                    backgroundColor: isUrgent ? "#EF444418" : "#6A0DAD12",
                    borderColor: isUrgent ? "#EF4444" : "#6A0DAD40",
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <View style={styles.countdownLeft}>
                  <Feather
                    name="clock"
                    size={20}
                    color={isUrgent ? "#EF4444" : "#6A0DAD"}
                  />
                  <View>
                    <Text
                      style={[
                        styles.countdownLabel,
                        { color: isUrgent ? "#EF4444" : "#6A0DAD" },
                      ]}
                    >
                      Complete payment within
                    </Text>
                    <Text
                      style={[
                        styles.countdownSub,
                        { color: isUrgent ? "#EF4444" + "99" : "#6A0DAD99" },
                      ]}
                    >
                      {timeLeft === 0
                        ? "Time's up — please restart"
                        : "Session timer"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.countdownTime,
                    { color: isUrgent ? "#EF4444" : "#6A0DAD" },
                  ]}
                >
                  {formatTime(timeLeft)}
                </Text>
              </Animated.View>

              {/* Step-by-step guide */}
              <View style={[styles.guideCard, { backgroundColor: colors.card }]}>
                {/* Airtel header */}
                <View style={styles.airtelRow}>
                  <View style={[styles.airtelBadge, { backgroundColor: "#FF6600" }]}>
                    <Text style={styles.airtelBadgeText}>A</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.airtelName, { color: colors.foreground }]}>
                      Airtel Money Uganda
                    </Text>
                    <Text style={styles.merchantCode}>Merchant Code: 7071895</Text>
                  </View>
                  <View style={[styles.securePill, { backgroundColor: "#22C55E18" }]}>
                    <Feather name="shield" size={11} color="#22C55E" />
                    <Text style={[styles.secureText, { color: "#22C55E" }]}>Secure</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={[styles.guideHeading, { color: colors.foreground }]}>
                  Follow these steps on your phone:
                </Text>

                {/* Timeline stepper */}
                {DIAL_STEPS.map((s, i) => {
                  const isLast = i === DIAL_STEPS.length - 1;
                  const isDone = i < activeDialStep;
                  const isActive = i === activeDialStep;
                  return (
                    <TouchableOpacity
                      key={i}
                      activeOpacity={0.75}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setActiveDialStep(i === activeDialStep ? i + 1 : i);
                      }}
                      style={styles.stepRow}
                    >
                      {/* Left: icon + connector line */}
                      <View style={styles.stepLeft}>
                        <View
                          style={[
                            styles.stepIconCircle,
                            {
                              backgroundColor: isDone
                                ? "#22C55E"
                                : isActive
                                ? s.color
                                : s.color + "22",
                              borderColor: isDone
                                ? "#22C55E"
                                : isActive
                                ? s.color
                                : s.color + "44",
                              borderWidth: isActive ? 2 : 1,
                            },
                          ]}
                        >
                          {isDone ? (
                            <Feather name="check" size={14} color="#fff" />
                          ) : (
                            <Feather
                              name={s.icon as any}
                              size={14}
                              color={isActive ? "#fff" : s.color}
                            />
                          )}
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.connector,
                              {
                                backgroundColor: isDone
                                  ? "#22C55E"
                                  : colors.border,
                              },
                            ]}
                          />
                        )}
                      </View>

                      {/* Right: text */}
                      <View style={[styles.stepContent, isLast && { paddingBottom: 0 }]}>
                        <Text
                          style={[
                            styles.stepLabel,
                            {
                              color: isDone
                                ? colors.mutedForeground
                                : isActive
                                ? colors.foreground
                                : colors.foreground,
                              textDecorationLine: isDone ? "line-through" : "none",
                            },
                          ]}
                        >
                          {s.label}
                        </Text>
                        {!isDone && (
                          <Text
                            style={[styles.stepDetail, { color: colors.mutedForeground }]}
                          >
                            {s.detail}
                          </Text>
                        )}
                        {isActive && i === 2 && (
                          <View style={[styles.codePill, { backgroundColor: "#FF660018" }]}>
                            <Text style={[styles.codeText, { color: "#FF6600" }]}>
                              7071895
                            </Text>
                          </View>
                        )}
                        {isActive && i === 3 && (
                          <View style={[styles.codePill, { backgroundColor: "#22C55E18" }]}>
                            <Text style={[styles.codeText, { color: "#22C55E" }]}>
                              UGX 75,000
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Reassurance strip */}
              <View style={[styles.reassuranceRow, { backgroundColor: colors.card }]}>
                <View style={styles.reassuranceItem}>
                  <Feather name="shield" size={16} color="#22C55E" />
                  <Text style={[styles.reassuranceText, { color: colors.foreground }]}>
                    Secure payment via Airtel Money
                  </Text>
                </View>
                <View style={[styles.reassuranceDivider, { backgroundColor: colors.border }]} />
                <View style={styles.reassuranceItem}>
                  <Feather name="clock" size={16} color="#6A0DAD" />
                  <Text style={[styles.reassuranceText, { color: colors.foreground }]}>
                    Activated within 24 hours
                  </Text>
                </View>
              </View>

              {/* WhatsApp help strip */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  openWhatsApp("Hi Coach TinaBarks, I need help with my Airtel Money payment for CoreHer Fitness.");
                }}
                activeOpacity={0.8}
                style={[styles.waStrip, { backgroundColor: "#25D36614" }]}
              >
                <Feather name="message-circle" size={16} color="#25D366" />
                <Text style={[styles.waStripText, { color: "#128C7E" }]}>
                  Need help? Contact{" "}
                  <Text style={styles.waStripBold}>Coach TinaBarks</Text>
                  {" "}on WhatsApp
                </Text>
                <View style={styles.waPhonePill}>
                  <Text style={styles.waPhoneText}>+256702568383</Text>
                </View>
              </TouchableOpacity>

              {/* I Have Paid button */}
              <TouchableOpacity
                onPress={goToForm}
                activeOpacity={0.87}
                style={styles.paidBtnWrap}
              >
                <LinearGradient
                  colors={["#6A0DAD", "#9B5DE5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.paidBtn}
                >
                  <View style={styles.paidBtnInner}>
                    <Feather name="check-circle" size={22} color="#fff" />
                    <View>
                      <Text style={styles.paidBtnLabel}>I Have Paid</Text>
                      <Text style={styles.paidBtnSub}>Tap to submit your confirmation</Text>
                    </View>
                  </View>
                  <Feather name="arrow-right" size={22} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════ STEP 2: Form ══════════════ */}
          {step === "form" && (
            <View>
              <View style={[styles.guideCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.formTitle, { color: colors.mutedForeground }]}>
                  Provide your payment details so we can verify your transaction.
                </Text>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Full Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Jane Nakato"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone Number Used</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. 0754123456"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.field}>
                  <View style={styles.amountLabelRow}>
                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Amount Paid</Text>
                    <View style={styles.amountBadge}>
                      <Text style={styles.amountBadgeText}>UGX 75,000</Text>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="75000"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                    Transaction ID <Text style={{ color: "#FF6B6B" }}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    value={transactionId}
                    onChangeText={setTransactionId}
                    placeholder="e.g. CI2412345678"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="characters"
                  />
                  <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
                    Found in your Airtel Money SMS confirmation
                  </Text>
                </View>
              </View>

              {loading ? (
                <ActivityIndicator color="#6A0DAD" style={{ marginTop: 16 }} />
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.87}
                  style={styles.paidBtnWrap}
                >
                  <LinearGradient
                    colors={["#6A0DAD", "#9B5DE5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.paidBtn}
                  >
                    <View style={styles.paidBtnInner}>
                      <Feather name="send" size={22} color="#fff" />
                      <View>
                        <Text style={styles.paidBtnLabel}>Submit Confirmation</Text>
                        <Text style={styles.paidBtnSub}>We'll verify and activate you</Text>
                      </View>
                    </View>
                    <Feather name="arrow-right" size={22} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ══════════════ STEP 3: Success ══════════════ */}
          {step === "success" && (
            <View style={styles.successWrap}>
              <LinearGradient
                colors={["#6A0DAD", "#9B5DE5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.successIcon}
              >
                <Feather name="check" size={40} color="#fff" />
              </LinearGradient>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>Thank You!</Text>
              <Text style={[styles.successMsg, { color: colors.mutedForeground }]}>
                Payment received and pending confirmation. You will be activated shortly.
              </Text>
              <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
                <Feather name="clock" size={16} color="#F59E0B" />
                <Text style={[styles.infoText, { color: colors.foreground }]}>
                  Your coach will review and approve your payment. This typically takes less than 24 hours.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  openWhatsApp("Hi Coach TinaBarks, I just submitted my payment for CoreHer Fitness Premium. Please confirm when it is approved. Thank you!");
                }}
                activeOpacity={0.8}
                style={[styles.waStrip, { backgroundColor: "#25D36614", marginHorizontal: 0, width: "100%" }]}
              >
                <Feather name="message-circle" size={16} color="#25D366" />
                <Text style={[styles.waStripText, { color: "#128C7E", flex: 1 }]}>
                  Not confirmed?{" "}
                  <Text style={styles.waStripBold}>Chat with Coach TinaBarks</Text>
                  {" "}on{" "}
                  <Text style={[styles.waStripBold, { color: "#25D366" }]}>+256702568383</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace("/(tabs)/profile")}
                activeOpacity={0.87}
                style={[styles.paidBtnWrap, { width: "100%" }]}
              >
                <LinearGradient
                  colors={["#6A0DAD", "#9B5DE5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.paidBtn}
                >
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={styles.paidBtnLabel}>Back to Profile</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  heroBanner: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    gap: 12,
  },
  heroHeadline: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 30 },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#ffffff99", lineHeight: 18 },
  benefitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 },
  benefitItem: { flexDirection: "row", alignItems: "center", gap: 7, width: "46%" },
  benefitIconWrap: {
    width: 26, height: 26, borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  benefitLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff", flex: 1 },
  urgencyPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", alignSelf: "flex-start",
    paddingVertical: 5, paddingHorizontal: 11, borderRadius: 100, marginTop: 2,
  },
  urgencyText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FF6600" },

  countdownBox: {
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    marginBottom: 14,
  },
  countdownLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  countdownLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  countdownSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  countdownTime: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 1 },

  guideCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    gap: 16,
  },
  airtelRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  airtelBadge: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  airtelBadgeText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  airtelName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  merchantCode: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FF6600" },
  securePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100,
  },
  secureText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1 },
  guideHeading: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  stepRow: { flexDirection: "row", gap: 12 },
  stepLeft: { alignItems: "center", width: 36 },
  stepIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  connector: { width: 2, flex: 1, minHeight: 16, marginTop: 4, borderRadius: 2 },
  stepContent: { flex: 1, paddingBottom: 16, gap: 3, paddingTop: 6 },
  stepLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  stepDetail: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  codePill: {
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, marginTop: 4,
  },
  codeText: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 2 },

  reassuranceRow: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  reassuranceItem: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center",
  },
  reassuranceDivider: { width: 1, height: 28 },
  reassuranceText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1, lineHeight: 17 },

  paidBtnWrap: { paddingHorizontal: 20, marginBottom: 10 },
  paidBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 20,
    shadowColor: "#6A0DAD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  paidBtnInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  paidBtnLabel: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  paidBtnSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#ffffff99", marginTop: 1 },

  formTitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  amountLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  amountBadge: {
    backgroundColor: "#22C55E18",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  amountBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#22C55E" },
  input: {
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15, fontFamily: "Inter_400Regular", borderWidth: 1,
  },
  fieldHint: { fontSize: 11, fontFamily: "Inter_400Regular" },

  waStrip: {
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  waStripText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  waStripBold: { fontFamily: "Inter_600SemiBold" },
  waPhonePill: {
    backgroundColor: "#25D366",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
  },
  waPhoneText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },

  successWrap: { alignItems: "center", paddingHorizontal: 28, paddingTop: 20, gap: 16 },
  successIcon: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  successMsg: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  infoBox: {
    flexDirection: "row", gap: 10, padding: 16, borderRadius: 14, width: "100%", alignItems: "flex-start",
  },
  infoText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 19 },
});
