import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

type Step = "email" | "verify" | "password" | "success";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step !== "success") return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 6,
    }).start();
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.replace("/auth/login");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSendCode = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setStep("verify");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (codeInput.trim().length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: codeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Code verification failed. Please try again.");
      } else {
        setStep("password");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: codeInput.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reset failed. Please try again.");
      } else {
        setStep("success");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCodeInput("");
    setError(null);
    setStep("email");
  };

  if (step === "success") {
    return (
      <View style={[styles.flex, styles.successCenter]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 28 }}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Feather name="check" size={40} color="#fff" />
            </View>
          </View>
        </Animated.View>
        <Text style={styles.successTitle}>Password updated!</Text>
        <Text style={styles.successMessage}>
          Your password has been successfully updated.
        </Text>
        <Text style={styles.successDesc}>
          You can now use your new password to sign in.
        </Text>
        <View style={styles.countdownBadge}>
          <Text style={styles.countdownText}>
            Redirecting to login in{" "}
            <Text style={styles.countdownNum}>{countdown}</Text>
            {countdown === 1 ? " second" : " seconds"}...
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.replace("/auth/login")}
        >
          <LinearGradient
            colors={["#16A34A", "#22C55E"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="log-in" size={18} color="#fff" />
            <Text style={styles.buttonText}>Go to Login</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient
        colors={["#2D0B4E", "#4A0876", "#6A0DAD"]}
        style={[styles.header, { paddingTop: insets.top + 32 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.logo}>CoreHer</Text>
        <Text style={styles.tagline}>Build your core. Transform your confidence.</Text>
        <View style={styles.stepRow}>
          {(["email", "verify", "password"] as Step[]).map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepDot, step === s && styles.stepDotActive,
                (step === "verify" && i === 0) || (step === "password" && i <= 1) ? styles.stepDotDone : null]}>
                {((step === "verify" && i === 0) || (step === "password" && i <= 1)) ? (
                  <Feather name="check" size={10} color="#fff" />
                ) : (
                  <Text style={styles.stepNum}>{i + 1}</Text>
                )}
              </View>
              {i < 2 && <View style={[styles.stepLine, (step === "verify" && i === 0) || (step === "password" && i <= 1) ? styles.stepLineDone : null]} />}
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { marginTop: -24 }]}>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === "email" && (
            <>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                Enter your account email and we'll generate a reset code for you.
              </Text>
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.light.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSendCode}
                />
              </View>
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={handleSendCode}
                disabled={loading}
              >
                <LinearGradient colors={["#6A0DAD", "#FF7F7F"]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
                </LinearGradient>
              </Pressable>
            </>
          )}

          {step === "verify" && (
            <>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{" "}
                <Text style={styles.emailHighlight}>{email}</Text>. Enter it below — it expires in 15 minutes.
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>6-Digit Code</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  value={codeInput}
                  onChangeText={setCodeInput}
                  placeholder="000000"
                  placeholderTextColor={colors.light.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyCode}
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <LinearGradient colors={["#6A0DAD", "#FF7F7F"]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Code</Text>}
                </LinearGradient>
              </Pressable>

              <Pressable onPress={handleResendCode} style={styles.resendLink}>
                <Text style={styles.resendText}>Didn't get a code? </Text>
                <Text style={styles.resendAction}>Resend</Text>
              </Pressable>
            </>
          )}

          {step === "password" && (
            <>
              <Text style={styles.title}>Set new password</Text>
              <Text style={styles.subtitle}>
                Choose a strong new password for your account.
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputFlex}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.light.mutedForeground}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setShowNew((v) => !v)} style={styles.eyeBtn}>
                    <Feather name={showNew ? "eye-off" : "eye"} size={18} color={colors.light.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputFlex}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.light.mutedForeground}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                    <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.light.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <LinearGradient colors={["#6A0DAD", "#FF7F7F"]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                </LinearGradient>
              </Pressable>
            </>
          )}

          <Pressable onPress={() => router.replace("/auth/login")} style={styles.backLink}>
            <Text style={styles.backLinkText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.light.pageGradientTop },

  header: {
    paddingHorizontal: 28,
    paddingBottom: 56,
    alignItems: "center",
  },
  logo: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  stepDotActive: {
    backgroundColor: "#FF7F7F",
    borderColor: "#fff",
  },
  stepDotDone: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  stepNum: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: "#22C55E",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
    marginBottom: 24,
    lineHeight: 20,
  },
  emailHighlight: {
    fontFamily: "Inter_600SemiBold",
    color: "#6A0DAD",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#DC2626",
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: colors.light.text,
    backgroundColor: "#FAFAFA",
  },
  codeInput: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: 8,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.light.border,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: colors.light.text,
    paddingVertical: 13,
  },
  eyeBtn: { padding: 4 },
  button: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonPressed: { opacity: 0.85 },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  backLink: { alignItems: "center", marginTop: 4 },
  backLinkText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.primary,
  },
  resendLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  resendText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
  },
  resendAction: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#6A0DAD",
  },

  successCenter: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  successIconInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#15803D",
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#166534",
    textAlign: "center",
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  countdownBadge: {
    backgroundColor: "#F0FDF4",
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  countdownText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#15803D",
  },
  countdownNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#16A34A",
  },
});
