import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, User } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PillButton } from "@/components/PillButton";

const DEMO_USERS: User[] = [
  {
    id: "client1",
    name: "Sofia Martinez",
    email: "sofia@example.com",
    role: "client",
    goals: { calories: 400, water: 2.5, sleep: 8, workouts: 5 },
  },
  {
    id: "coach1",
    name: "Coach Alex",
    email: "coach@fittrackpro.com",
    role: "coach",
    goals: { calories: 500, water: 3.0, sleep: 7, workouts: 6 },
  },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser, workouts, meals, waterEntries, sleepEntries } = useApp();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name ?? "");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSave = () => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUser({ ...(user!), name: name.trim() });
    setEditMode(false);
  };

  const stats = [
    { label: "Workouts", value: workouts.length.toString(), icon: "zap", color: colors.primary },
    { label: "Meals", value: meals.length.toString(), icon: "coffee", color: colors.peach },
    { label: "Avg Water", value: `${(waterEntries.reduce((sum, w) => sum + w.litres, 0) / Math.max(waterEntries.length, 1)).toFixed(2)}L`, icon: "droplet", color: "#38BDF8" },
    { label: "Avg Sleep", value: `${(sleepEntries.reduce((sum, s) => sum + s.hours, 0) / Math.max(sleepEntries.length, 1)).toFixed(1)}h`, icon: "moon", color: "#818CF8" },
  ];

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Choose a demo account to get started
          </Text>
          {DEMO_USERS.map((u) => (
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
                  {
                    backgroundColor:
                      u.role === "coach" ? colors.primaryLight : colors.peachLight,
                  },
                ]}
              >
                <Feather
                  name={u.role === "coach" ? "briefcase" : "user"}
                  size={24}
                  color={u.role === "coach" ? colors.primary : colors.peach}
                />
              </View>
              <View style={styles.demoInfo}>
                <Text style={[styles.demoName, { color: colors.foreground }]}>
                  {u.name}
                </Text>
                <Text
                  style={[styles.demoRole, { color: colors.mutedForeground }]}
                >
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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={[styles.bigAvatar, { backgroundColor: colors.primaryLight }]}
          >
            <Text style={[styles.bigAvatarText, { color: colors.primary }]}>
              {user.name[0].toUpperCase()}
            </Text>
          </View>
          {editMode ? (
            <View style={styles.editRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                style={[
                  styles.nameInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.muted,
                  },
                ]}
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
              onPress={() => {
                setName(user.name);
                setEditMode(true);
              }}
              style={styles.nameRow}
            >
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {user.name}
              </Text>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  user.role === "coach" ? colors.primaryLight : colors.peachLight,
              },
            ]}
          >
            <Feather
              name={user.role === "coach" ? "briefcase" : "user"}
              size={12}
              color={user.role === "coach" ? colors.primary : colors.peach}
            />
            <Text
              style={[
                styles.roleBadgeText,
                {
                  color: user.role === "coach" ? colors.primary : colors.peach,
                },
              ]}
            >
              {user.role === "coach" ? "Fitness Coach" : "Client"}
            </Text>
          </View>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
            {user.email}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { backgroundColor: colors.card }]}
            >
              <Feather name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Subscription */}
        {user.role === "client" && (
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
                      UGX 75,000 · Airtel Money · Merchant 7071895
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )
        )}

        {/* Switch Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Switch Account
          </Text>
          {DEMO_USERS.filter((u) => u.id !== user.id).map((u) => (
            <TouchableOpacity
              key={u.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setUser(u);
              }}
              style={[styles.switchCard, { backgroundColor: colors.card }]}
            >
              <Feather
                name={u.role === "coach" ? "briefcase" : "user"}
                size={18}
                color={colors.mutedForeground}
              />
              <Text style={[styles.switchName, { color: colors.foreground }]}>
                {u.name}
              </Text>
              <Text style={[styles.switchRole, { color: colors.mutedForeground }]}>
                {u.role === "coach" ? "Coach" : "Client"}
              </Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 20 }}>
          <PillButton
            label="Sign Out"
            variant="ghost"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setUser(null);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  bigAvatarText: { fontSize: 36, fontFamily: "Inter_700Bold" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileName: { fontSize: 24, fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 14, fontFamily: "Inter_400Regular" },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
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
  subBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  switchName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  switchRole: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
