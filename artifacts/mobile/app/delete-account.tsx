import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import BackButton from "@/components/BackButton";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

export default function DeleteAccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { authToken, logout } = useApp();

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const canSubmit = password.length >= 1 && confirmText === "DELETE";

  const handleDelete = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not delete account. Please try again.");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setDeleted(true);
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (deleted) {
    return (
      <View style={[styles.root, styles.successCenter, { backgroundColor: colors.background }]}>
        <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
          <Feather name="trash-2" size={36} color="#DC2626" />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>Account Deleted</Text>
        <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
          Your account has been scheduled for deletion. You have 7 days to recover it by
          signing in and cancelling the deletion.
        </Text>
        <TouchableOpacity
          onPress={() => logout()}
          activeOpacity={0.85}
          style={styles.doneBtn}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BackButton color={colors.foreground} />
          <Text style={[styles.title, { color: colors.foreground }]}>Delete Account</Text>
        </View>

        <View style={[styles.warningBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
          <Feather name="alert-triangle" size={22} color="#DC2626" style={{ marginBottom: 10 }} />
          <Text style={styles.warningTitle}>This action is permanent</Text>
          <Text style={styles.warningText}>
            All your data will be deleted — workouts, meals, progress, and payment history.
            You will have 7 days to recover your account before it is permanently removed.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Confirm your password</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground }]}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Type{" "}
              <Text style={{ color: "#DC2626", fontFamily: "Inter_700Bold" }}>DELETE</Text>
              {" "}to confirm
            </Text>
            <TextInput
              value={confirmText}
              onChangeText={(v) => setConfirmText(v.toUpperCase())}
              autoCapitalize="characters"
              placeholder="DELETE"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.confirmInput,
                {
                  color: confirmText === "DELETE" ? "#DC2626" : colors.foreground,
                  backgroundColor: colors.muted,
                  borderColor: confirmText === "DELETE" ? "#DC2626" : colors.border,
                },
              ]}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleDelete}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
            style={[
              styles.deleteBtn,
              { opacity: canSubmit && !loading ? 1 : 0.4 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="trash-2" size={18} color="#fff" />
                <Text style={styles.deleteBtnText}>Delete My Account</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel, keep my account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  successCenter: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  successDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  doneBtn: {
    marginTop: 28,
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  warningBox: {
    margin: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    alignItems: "center",
  },
  warningTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#DC2626",
    marginBottom: 8,
    textAlign: "center",
  },
  warningText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#7F1D1D",
    textAlign: "center",
    lineHeight: 21,
  },
  form: { paddingHorizontal: 20, gap: 18 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    paddingVertical: 14,
  },
  eyeBtn: { padding: 4 },
  confirmInput: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#DC2626",
    textAlign: "center",
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  cancelBtn: { alignItems: "center", paddingVertical: 4 },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
