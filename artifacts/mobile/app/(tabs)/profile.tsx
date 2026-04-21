import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { useApp, User, CoachProfile } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PillButton } from "@/components/PillButton";

const DEMO_CLIENT: User = {
  id: "client1",
  name: "Sofia Martinez",
  email: "sofia@example.com",
  role: "client",
  goals: { calories: 400, water: 2.5, sleep: 8, workouts: 5 },
};

function buildDemoUsers(coach: CoachProfile): User[] {
  return [
    DEMO_CLIENT,
    {
      id: coach.id,
      name: coach.name,
      email: coach.email,
      role: "coach",
      goals: { calories: 500, water: 3.0, sleep: 7, workouts: 6 },
    },
  ];
}

// ─── Shared row button ────────────────────────────────────────────────────────
function RowItem({
  icon,
  label,
  sub,
  iconColor,
  onPress,
  colors,
}: {
  icon: string;
  label: string;
  sub?: string;
  iconColor?: string;
  onPress: () => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.rowCard, { backgroundColor: colors.card }]}
    >
      <Feather name={icon as any} size={18} color={iconColor ?? colors.mutedForeground} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser, logout, workouts, meals, waterEntries, sleepEntries, coachProfile } = useApp();
  const demoUsers = buildDemoUsers(coachProfile);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name ?? "");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isCoach = user?.role === "coach";

  const handleSave = () => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUser({ ...(user!), name: name.trim() });
    setEditMode(false);
  };

  const stats = [
    { label: "Workouts", value: workouts.length.toString(), icon: "zap", color: colors.primary },
    { label: "Meals", value: meals.length.toString(), icon: "coffee", color: colors.peach },
    {
      label: "Avg Water",
      value: `${(waterEntries.reduce((s, w) => s + w.litres, 0) / Math.max(waterEntries.length, 1)).toFixed(2)}L`,
      icon: "droplet",
      color: "#38BDF8",
    },
    {
      label: "Avg Sleep",
      value: `${(sleepEntries.reduce((s, e) => s + e.hours, 0) / Math.max(sleepEntries.length, 1)).toFixed(1)}h`,
      icon: "moon",
      color: "#818CF8",
    },
  ];

  // ── Account chooser (no user logged in) ──────────────────────────────────
  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Sign In</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Choose an account to continue
          </Text>
          {demoUsers.map((u) => (
            <TouchableOpacity
              key={u.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setUser(u);
              }}
              activeOpacity={0.8}
              style={[styles.demoCard, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.demoAvatar,
                  { backgroundColor: u.role === "coach" ? colors.primaryLight : colors.peachLight },
                ]}
              >
                <Feather
                  name={u.role === "coach" ? "briefcase" : "user"}
                  size={24}
                  color={u.role === "coach" ? colors.primary : colors.peach}
                />
              </View>
              <View style={styles.demoInfo}>
                <Text style={[styles.demoName, { color: colors.foreground }]}>{u.name}</Text>
                <Text style={[styles.demoRole, { color: colors.mutedForeground }]}>
                  {u.role === "coach" ? "Fitness Coach" : "Client"}
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={isCoach ? ["#6A0DAD", "#4A0876"] : ["#FF7F7F", "#FF5A5A"]}
            style={styles.bigAvatar}
          >
            <Text style={styles.bigAvatarText}>{user.name[0].toUpperCase()}</Text>
          </LinearGradient>

          {editMode ? (
            <View style={styles.editRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                style={[styles.nameInput, { color: colors.foreground, backgroundColor: colors.muted }]}
                autoFocus
              />
              <TouchableOpacity onPress={handleSave}>
                <Feather name="check" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditMode(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => { setName(user.name); setEditMode(true); }}
              style={styles.nameRow}
            >
              <Text style={[styles.profileName, { color: colors.foreground }]}>{user.name}</Text>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}

          <View
            style={[
              styles.roleBadge,
              { backgroundColor: isCoach ? colors.primaryLight : colors.peachLight },
            ]}
          >
            <Feather
              name={isCoach ? "briefcase" : "user"}
              size={12}
              color={isCoach ? colors.primary : colors.peach}
            />
            <Text
              style={[styles.roleBadgeText, { color: isCoach ? colors.primary : colors.peach }]}
            >
              {isCoach ? "Fitness Coach" : "Client"}
            </Text>
          </View>

          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
        </View>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Feather name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── CLIENT-ONLY: Subscription status ───────────────────────────── */}
        {!isCoach && (
          user.isPremium ? (
            <View style={[styles.subscriptionCard, { backgroundColor: "#22C55E18" }]}>
              <View style={styles.subRow}>
                <Feather name="check-circle" size={20} color="#22C55E" />
                <View style={styles.subInfo}>
                  <Text style={[styles.subTitle, { color: "#22C55E" }]}>Premium Active</Text>
                  <Text style={[styles.subDesc, { color: colors.mutedForeground }]}>
                    Your transformation journey is fully unlocked.
                  </Text>
                </View>
                <View style={[styles.subBadge, { backgroundColor: "#22C55E" }]}>
                  <Text style={styles.subBadgeText}>PRO</Text>
                </View>
              </View>
            </View>
          ) : user.paymentStatus === "pending" ? (
            <View style={[styles.subscriptionCard, { backgroundColor: "#F59E0B18" }]}>
              <View style={styles.subRow}>
                <Feather name="clock" size={20} color="#F59E0B" />
                <View style={styles.subInfo}>
                  <Text style={[styles.subTitle, { color: "#F59E0B" }]}>Payment Under Review</Text>
                  <Text style={[styles.subDesc, { color: colors.mutedForeground }]}>
                    Your coach will confirm your payment shortly.
                  </Text>
                </View>
              </View>
              <PillButton
                label="View Status"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/upgrade");
                }}
                style={{ marginTop: 12 }}
              />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/upgrade");
              }}
            >
              <LinearGradient
                colors={["#6A0DAD", "#9B5DE5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.upgradeGradient}
              >
                <View style={styles.subRow}>
                  <Feather name="star" size={20} color="#FFD700" />
                  <View style={styles.subInfo}>
                    <Text style={[styles.subTitle, { color: "#fff" }]}>Unlock Premium</Text>
                    <Text style={[styles.subDesc, { color: "#ffffffbb" }]}>
                      UGX 75,000/month · Airtel Money · Merchant 7071895
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )
        )}

        {/* ── COACH-ONLY: Admin controls ──────────────────────────────────── */}
        {isCoach && (
          <View style={styles.section}>
            <SectionHead title="Admin Controls" colors={colors} />
            <RowItem
              icon="users"
              label="Client Management"
              sub="View and manage all clients"
              iconColor={colors.primary}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/coach");
              }}
              colors={colors}
            />
            <RowItem
              icon="check-square"
              label="Payment Approvals"
              sub="Review and approve pending payments"
              iconColor="#22C55E"
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/coach");
              }}
              colors={colors}
            />
            <RowItem
              icon="bar-chart-2"
              label="Client Progress Reports"
              sub="Monitor client workout and meal data"
              iconColor="#818CF8"
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/coach");
              }}
              colors={colors}
            />
          </View>
        )}

        {/* ── Help & Support (all roles) ──────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHead title="Help & Support" colors={colors} />
          <RowItem
            icon="help-circle"
            label="Support Center"
            iconColor={colors.mutedForeground}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/support");
            }}
            colors={colors}
          />
          <RowItem
            icon="message-circle"
            label={`Chat with ${coachProfile.name}`}
            sub={`WhatsApp · ${coachProfile.phone}`}
            iconColor="#25D366"
            onPress={() => {
              Haptics.selectionAsync();
              const phone = coachProfile.phone.replace(/\D/g, "");
              const msg = encodeURIComponent(
                `Hello ${coachProfile.name}, I need help with CoreHer Fitness.`
              );
              Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
            }}
            colors={colors}
          />
        </View>

        {/* ── COACH-ONLY: Switch to client view (demo helper) ─────────────── */}
        {isCoach && (
          <View style={styles.section}>
            <SectionHead title="Switch Account" colors={colors} />
            {demoUsers
              .filter((u) => u.id !== user.id)
              .map((u) => (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setUser(u);
                  }}
                  style={[styles.rowCard, { backgroundColor: colors.card }]}
                >
                  <Feather
                    name={u.role === "coach" ? "briefcase" : "user"}
                    size={18}
                    color={colors.mutedForeground}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.foreground }]}>{u.name}</Text>
                    <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                      {u.role === "coach" ? "Coach" : "Client"}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* ── Sign Out (all roles) ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20 }}>
          <PillButton
            label="Sign Out"
            variant="ghost"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              logout();
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Account chooser */
  title: { fontSize: 28, fontFamily: "Inter_700Bold", paddingHorizontal: 20, marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", paddingHorizontal: 20, marginBottom: 20 },
  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  demoAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  demoInfo: { flex: 1 },
  demoName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  demoRole: { fontSize: 13, fontFamily: "Inter_400Regular" },

  /* Profile header */
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  bigAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  bigAvatarText: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  profileName: { fontSize: 24, fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 14, fontFamily: "Inter_400Regular" },
  editRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nameInput: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 160,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  roleBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  /* Stats */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },

  /* Subscription */
  subscriptionCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  upgradeGradient: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  subRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  subInfo: { flex: 1, gap: 2 },
  subTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  subDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  subBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  subBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  /* Sections */
  section: { paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },

  /* Row items */
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
});
