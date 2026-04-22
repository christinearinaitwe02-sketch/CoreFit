import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const BULLETS = [
  "90-Day Transformation Program",
  "Guided workouts & meal tracking",
  "Direct coach support",
];

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { login } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed.");
    }
  };

  const handleShowSignIn = () => {
    setShowForm(true);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#2D0B4E", "#4A0876", "#6A0DAD"]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logo}>app-pure</Text>
          <Text style={styles.tagline}>
            Build your core. Transform your confidence.
          </Text>

          <Text style={styles.heroTitle}>
            Start your transformation{"\n"}today
          </Text>
          <Text style={styles.heroDesc}>
            app-pure fitness helps you lose belly fat, track your lifestyle, and
            rebuild confidence with a guided 90-day program.
          </Text>

          <View style={styles.bullets}>
            {BULLETS.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={styles.bulletIcon}>
                  <Feather name="check" size={13} color="#6A0DAD" />
                </View>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/auth/signup")}
          >
            <LinearGradient
              colors={["#6A0DAD", "#FF7F7F"]}
              style={styles.primaryBtnInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>Create Account</Text>
            </LinearGradient>
          </Pressable>

          {!showForm && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.pressed,
              ]}
              onPress={handleShowSignIn}
            >
              <Text style={styles.secondaryBtnText}>Sign In</Text>
            </Pressable>
          )}
        </View>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formSubtitle}>
              Welcome back — continue your journey
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.light.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={colors.light.mutedForeground}
                secureTextEntry
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.formBtn,
                pressed && styles.pressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#6A0DAD", "#FF7F7F"]}
                style={styles.formBtnInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => router.push("/auth/forgot-password")}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotLinkText}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowForm(false)}
              style={styles.backLink}
            >
              <Feather name="arrow-left" size={14} color={colors.light.mutedForeground} />
              <Text style={styles.backLinkText}>  Back</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#2D0B4E" },
  scrollContent: { flexGrow: 1 },
  hero: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 44,
  },
  logo: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 36,
  },
  heroTitle: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 42,
    marginBottom: 16,
  },
  heroDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.82)",
    lineHeight: 24,
    marginBottom: 28,
  },
  bullets: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bulletIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    flex: 1,
  },
  actions: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  primaryBtnInner: {
    paddingVertical: 17,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#6A0DAD",
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#6A0DAD",
  },
  pressed: { opacity: 0.82 },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 32,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: colors.light.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#DC2626",
    textAlign: "center",
  },
  field: { marginBottom: 14 },
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
  formBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 16,
  },
  formBtnInner: {
    paddingVertical: 16,
    alignItems: "center",
  },
  forgotLink: {
    alignItems: "center",
    marginBottom: 16,
  },
  forgotLinkText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.primary,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
  },
});
