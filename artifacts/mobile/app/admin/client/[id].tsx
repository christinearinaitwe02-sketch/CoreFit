import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AVATAR_COLORS = ["#9B5DE5", "#FF8FAB", "#FFB085", "#38BDF8", "#34D399", "#818CF8"];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** Deterministic mock stat so numbers are consistent per client id */
function mockStat(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminClientDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients } = useApp();

  const client = clients.find((c) => c.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!client) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Feather name="user-x" size={44} color={colors.border} />
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Client not found</Text>
        </View>
      </View>
    );
  }

  const color = avatarColor(client.name);

  // Deterministic mock stats seeded on client id
  const workouts = mockStat(client.id + "w", 8, 42);
  const meals    = mockStat(client.id + "m", 24, 90);
  const water    = mockStat(client.id + "wa", 12, 40); // litres total
  const sleep    = mockStat(client.id + "s", 45, 72); // hours total

  const stats = [
    { label: "Workouts",    value: String(workouts),        unit: "sessions",  icon: "activity",   color: "#6A0DAD", bg: "#F1E4FA" },
    { label: "Meals",       value: String(meals),           unit: "logged",    icon: "coffee",     color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Water",       value: water.toFixed(1),        unit: "litres",    icon: "droplet",    color: "#38BDF8", bg: "#E0F2FE" },
    { label: "Sleep",       value: sleep.toFixed(0),        unit: "hours",     icon: "moon",       color: "#818CF8", bg: "#EDE9FE" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Nav bar ── */}
      <View style={[styles.navBar, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Client Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Profile card ── */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          {/* Avatar */}
          <View style={[styles.bigAvatar, { backgroundColor: color + "22" }]}>
            <Text style={[styles.bigAvatarText, { color }]}>{initials(client.name)}</Text>
          </View>

          <Text style={[styles.clientName, { color: colors.foreground }]}>{client.name}</Text>
          <Text style={[styles.clientEmail, { color: colors.mutedForeground }]}>{client.email}</Text>

          {/* Info rows */}
          <View style={[styles.infoGrid, { borderTopColor: colors.border }]}>
            <InfoRow icon="calendar" label="Joined" value={formatDate(client.joinDate)} colors={colors} />
            {client.weight ? (
              <InfoRow icon="bar-chart-2" label="Weight" value={`${client.weight} kg`} colors={colors} />
            ) : null}
            {client.notes ? (
              <InfoRow icon="file-text" label="Notes" value={client.notes} colors={colors} />
            ) : null}
          </View>
        </View>

        {/* ── Activity stats ── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Activity Overview</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Estimated totals since joining
        </Text>

        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statTile, { backgroundColor: s.bg }]}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + "20" }]}>
                <Feather name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statUnit, { color: s.color + "99" }]}>{s.unit}</Text>
              <Text style={[styles.statLabel, { color: s.color + "bb" }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Engagement bar ── */}
        <View style={[styles.engagementCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.engagementTitle, { color: colors.foreground }]}>Engagement Score</Text>
          <Text style={[styles.engagementSub, { color: colors.mutedForeground }]}>
            Based on logged activity
          </Text>
          <View style={styles.progressRow}>
            {[
              { label: "Workout", pct: Math.min(1, workouts / 40), color: "#6A0DAD" },
              { label: "Nutrition", pct: Math.min(1, meals / 90), color: "#F59E0B" },
              { label: "Hydration", pct: Math.min(1, water / 40), color: "#38BDF8" },
              { label: "Sleep", pct: Math.min(1, sleep / 70), color: "#818CF8" },
            ].map((b) => (
              <View key={b.label} style={styles.barWrap}>
                <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
                  <View style={[styles.barFill, { width: `${Math.round(b.pct * 100)}%` as any, backgroundColor: b.color }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{b.label}</Text>
                <Text style={[styles.barPct, { color: b.color }]}>{Math.round(b.pct * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick contact ── */}
        <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
          <Feather name="mail" size={16} color={colors.mutedForeground} />
          <Text style={[styles.contactText, { color: colors.foreground }]}>{client.email}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={14} color={colors.mutedForeground} style={{ marginTop: 1 }} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "Inter_700Bold" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  content: { padding: 16, gap: 14, paddingBottom: 60 },
  // Profile card
  profileCard: { borderRadius: 20, padding: 20, alignItems: "center", gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  bigAvatar: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  bigAvatarText: { fontSize: 28, fontFamily: "Inter_700Bold" },
  clientName: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  clientEmail: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  infoGrid: { width: "100%", borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 10 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 1 },
  infoValue: { fontSize: 14, fontFamily: "Inter_500Medium", flexWrap: "wrap" },
  // Stats grid
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 4 },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statTile: { width: "47.5%", borderRadius: 16, padding: 14, gap: 4, alignItems: "flex-start" },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  statValue: { fontSize: 26, fontFamily: "Inter_700Bold" },
  statUnit: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: -4 },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  // Engagement
  engagementCard: { borderRadius: 20, padding: 18, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  engagementTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  engagementSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  progressRow: { gap: 8 },
  barWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  barBg: { flex: 1, height: 8, borderRadius: 100, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 100 },
  barLabel: { width: 70, fontSize: 11, fontFamily: "Inter_500Medium" },
  barPct: { width: 34, textAlign: "right", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  // Contact
  contactCard: { borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  contactText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
});
