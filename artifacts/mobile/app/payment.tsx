import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

type Step = "instructions" | "form" | "success";

const STEPS = [
  { num: 1, text: "Dial *185#" },
  { num: 2, text: "Select Pay Merchant" },
  { num: 3, text: "Enter Merchant Code: 7071895" },
  { num: 4, text: "Enter amount" },
  { num: 5, text: "Enter your PIN to confirm" },
];

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setPaymentPending } = useApp();

  const [step, setStep] = useState<Step>("instructions");
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSubmit = async () => {
    if (!fullName.trim()) return Alert.alert("Required", "Please enter your full name.");
    if (!phone.trim()) return Alert.alert("Required", "Please enter your phone number.");
    if (!amount.trim() || isNaN(Number(amount))) return Alert.alert("Required", "Please enter a valid amount.");
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
      if (!res.ok) {
        return Alert.alert("Error", data.error ?? "Something went wrong.");
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPaymentPending();
      setStep("success");
    } catch {
      Alert.alert("Error", "Could not connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => (step === "instructions" ? router.back() : setStep("instructions"))} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {step === "instructions" ? "How to Pay" : step === "form" ? "Confirm Payment" : "Payment Submitted"}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {step === "instructions" && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={styles.airtelHeader}>
                  <View style={[styles.airtelBadge, { backgroundColor: "#FF6600" }]}>
                    <Text style={styles.airtelBadgeText}>A</Text>
                  </View>
                  <View>
                    <Text style={[styles.airtelName, { color: colors.foreground }]}>Airtel Money Uganda</Text>
                    <Text style={[styles.merchantCode, { color: "#FF6600" }]}>Merchant Code: 7071895</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={[styles.stepsTitle, { color: colors.foreground }]}>Follow these steps:</Text>
                {STEPS.map((s) => (
                  <View key={s.num} style={styles.stepRow}>
                    <View style={[styles.stepNum, { backgroundColor: "#6A0DAD18" }]}>
                      <Text style={[styles.stepNumText, { color: "#6A0DAD" }]}>{s.num}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.foreground }]}>{s.text}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.noteBox, { backgroundColor: "#6A0DAD12" }]}>
                <Feather name="info" size={15} color="#6A0DAD" />
                <Text style={[styles.noteText, { color: colors.foreground }]}>
                  After completing the payment, return here and tap "I Have Paid" to submit your confirmation.
                </Text>
              </View>

              <View style={styles.btnWrap}>
                <PillButton
                  label="I Have Paid"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setStep("form");
                  }}
                />
              </View>
            </View>
          )}

          {step === "form" && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.formTitle, { color: colors.foreground }]}>
                  Please provide your payment details so we can verify your transaction.
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
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Amount Paid (UGX)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="e.g. 50000"
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

              <View style={styles.btnWrap}>
                {loading ? (
                  <ActivityIndicator color="#6A0DAD" />
                ) : (
                  <PillButton label="Submit Confirmation" onPress={handleSubmit} />
                )}
              </View>
            </View>
          )}

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
              <View style={styles.btnWrap}>
                <PillButton
                  label="Back to Profile"
                  onPress={() => {
                    router.replace("/(tabs)/profile");
                  }}
                />
              </View>
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
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    gap: 14,
  },
  airtelHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  airtelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  airtelBadgeText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  airtelName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  merchantCode: { fontSize: 18, fontFamily: "Inter_700Bold" },
  divider: { height: 1 },
  stepsTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  stepText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  noteBox: {
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  noteText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 19 },
  btnWrap: { paddingHorizontal: 20, marginTop: 4 },
  formTitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, color: "#666" },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  input: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  fieldHint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  successWrap: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 20,
    gap: 16,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  successMsg: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "flex-start",
  },
  infoText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 19 },
});
