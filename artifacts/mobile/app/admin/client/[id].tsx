import { getApiBase } from "@/utils/api";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_BASE = getApiBase();

interface PaymentRecord {
  id: string;
  userEmail?: string;
  fullName: string;
  phone: string;
  amount: number;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const AVATAR_COLORS = ["#9B5DE5", "#FF8FAB", "#FFB085", "#38BDF8", "#34D399", "#818CF8"];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** Deterministic mock number — same client always shows the same values */
function mock(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

const STATUS_CFG = {
  approved: { label: "Approved", color: "#22C55E", bg: "#DCFCE7", icon: "check-circle" },
  pending:  { label: "Pending",  color: "#F59E0B", bg: "#FEF3C7", icon: "clock"        },
  rejected: { label: "Rejected", color: "#EF4444", bg: "#FEE2E2", icon: "x-circle"     },
} as const;

export default function AdminClientDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients } = useApp();

  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  const client = clients.find((c) => c.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!client) { setLoadingPayment(false); return; }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments`, {
          cache: "no-store", headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          const all: PaymentRecord[] = data.payments ?? [];
          setPayment(
            all.find((p) => p.userEmail?.toLowerCase() === client.email.toLowerCase()) ??
            all.find((p) => p.fullName.toLowerCase() === client.name.toLowerCase()) ??
            null
          );
        }
      } catch { /* ignore */ }
      finally { setLoadingPayment(false); }
    })();
  }, [client]);

  if (!client) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <NavBar onBack={() => router.back()} topPad={topPad} colors={colors} />
        <View style={styles.notFound}>
          <Feather name="user-x" size={44} color={colors.border} />
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Client not found</Text>
        </View>
      </View>
    );
  }

  const color = avatarColor(client.name);
  const paymentCfg = payment ? STATUS_CFG[payment.status] : null;

  // ── Mock activity data (deterministic per client id) ──
  const workouts  = mock(client.id + "w",  8, 42);
  const meals     = mock(client.id + "m",  24, 90);
  const waterL    = mock(client.id + "wa", 12, 40);
  const sleepH    = mock(client.id + "s",  45, 72);
  const avgWater  = (waterL / mock(client.id + "wd", 14, 30)).toFixed(1);
  const avgSleep  = (sleepH / mock(client.id + "sd", 14, 30)).toFixed(1);
  const avgKcal   = 1400 + mock(client.id + "kc", 0, 600);

  // ── Mock progress data ──
  const challengeDay  = mock(client.id + "cd", 1, 90);
  const streak        = mock(client.id + "st", 1, 21);
  const startWeight   = (client.weight ?? 70) + mock(client.id + "sw", 2, 10);
  const currentWeight = client.weight ?? startWeight - mock(client.id + "cw", 1, 8);
  const lostKg        = +(startWeight - currentWeight).toFixed(1);

  // Mock weekly progress bars (pct 0–1)
  const goals = [
    { label: "Workouts",  pct: Math.min(1, workouts / 40),  color: "#6A0DAD", icon: "activity"   },
    { label: "Nutrition", pct: Math.min(1, meals / 90),     color: "#F59E0B", icon: "coffee"      },
    { label: "Hydration", pct: Math.min(1, waterL / 40),    color: "#38BDF8", icon: "droplet"     },
    { label: "Sleep",     pct: Math.min(1, sleepH / 70),    color: "#818CF8", icon: "moon"        },
  ];

  // Mock mini weight chart (8 points, slightly declining)
  const weightPoints: number[] = [];
  let w = startWeight;
  for (let i = 0; i < 8; i++) {
    w = +(w - mock(client.id + `wc${i}`, 0, 10) / 10).toFixed(1);
    weightPoints.push(w);
  }
  const minW = Math.min(...weightPoints) - 1;
  const maxW = Math.max(...weightPoints) + 1;
  const chartH = 60;
  const chartW = 220;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <NavBar onBack={() => { Haptics.selectionAsync(); router.back(); }} topPad={topPad} colors={colors} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ════════════════════════════════════
            SECTION 1 — PROFILE
        ════════════════════════════════════ */}
        <SectionHeader label="Profile" icon="user" colors={colors} />

        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          {/* Avatar + name */}
          <View style={styles.profileTop}>
            <View style={[styles.bigAvatar, { backgroundColor: color + "22" }]}>
              <Text style={[styles.bigAvatarText, { color }]}>{initials(client.name)}</Text>
            </View>
            <View style={styles.profileMeta}>
              <Text style={[styles.clientName, { color: colors.foreground }]}>{client.name}</Text>
              <Text style={[styles.clientEmail, { color: colors.mutedForeground }]}>{client.email}</Text>
              {loadingPayment ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 6 }} />
              ) : paymentCfg ? (
                <View style={[styles.statusBadge, { backgroundColor: paymentCfg.bg }]}>
                  <Feather name={paymentCfg.icon as any} size={12} color={paymentCfg.color} />
                  <Text style={[styles.statusBadgeText, { color: paymentCfg.color }]}>{paymentCfg.label}</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: colors.muted }]}>
                  <Feather name="minus-circle" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.statusBadgeText, { color: colors.mutedForeground }]}>No payment</Text>
                </View>
              )}
            </View>
          </View>

          {/* Info grid */}
          <View style={[styles.infoGrid, { borderTopColor: colors.border }]}>
            <InfoRow icon="calendar"    label="Join Date"       value={fmtDate(client.joinDate)}              colors={colors} />
            {client.weight   ? <InfoRow icon="bar-chart-2"  label="Current Weight"  value={`${client.weight} kg`}               colors={colors} /> : null}
            {payment?.phone  ? <InfoRow icon="phone"        label="Phone"           value={payment.phone}                        colors={colors} /> : null}
            {payment         ? <InfoRow icon="credit-card"  label="Payment Amount"  value={`UGX ${payment.amount.toLocaleString()}`} colors={colors} /> : null}
            {payment?.transactionId ? <InfoRow icon="hash"  label="Transaction ID"  value={payment.transactionId}                colors={colors} /> : null}
            {payment?.createdAt     ? <InfoRow icon="clock" label="Payment Date"    value={fmtDate(payment.createdAt)}           colors={colors} /> : null}
            {client.notes    ? <InfoRow icon="file-text"    label="Coach Notes"     value={client.notes}                         colors={colors} /> : null}
          </View>
        </View>

        {/* ════════════════════════════════════
            SECTION 2 — ACTIVITY
        ════════════════════════════════════ */}
        <SectionHeader label="Activity" icon="activity" colors={colors} badge="Mock" />

        <View style={styles.activityGrid}>
          {[
            { label: "Workouts", stat: String(workouts), unit: "sessions",          icon: "activity",  accent: "#6A0DAD", bg: "#F1E4FA",
              sub: `~${Math.round(workouts / 4)}/wk · ${30 + mock(client.id + "wd2", 0, 30)} min avg` },
            { label: "Meals",    stat: String(meals),    unit: "logged",             icon: "coffee",    accent: "#F59E0B", bg: "#FEF3C7",
              sub: `~${Math.round(meals / 4)}/wk · ${avgKcal} kcal/day` },
            { label: "Water",    stat: `${waterL} L`,    unit: "total",              icon: "droplet",   accent: "#38BDF8", bg: "#E0F2FE",
              sub: `${avgWater} L / day avg` },
            { label: "Sleep",    stat: `${sleepH} hrs`,  unit: "total",              icon: "moon",      accent: "#818CF8", bg: "#EDE9FE",
              sub: `${avgSleep} hrs / night avg` },
          ].map((a) => (
            <View key={a.label} style={[styles.activityTile, { backgroundColor: a.bg }]}>
              <View style={[styles.activityIcon, { backgroundColor: a.accent + "20" }]}>
                <Feather name={a.icon as any} size={16} color={a.accent} />
              </View>
              <Text style={[styles.activityStat, { color: a.accent }]}>{a.stat}</Text>
              <Text style={[styles.activityUnit, { color: a.accent + "99" }]}>{a.unit}</Text>
              <Text style={[styles.activityLabel, { color: a.accent + "cc" }]}>{a.label}</Text>
              <Text style={[styles.activitySub, { color: a.accent + "88" }]}>{a.sub}</Text>
            </View>
          ))}
        </View>

        {/* Goal attainment bars */}
        <View style={[styles.goalsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.goalsTitle, { color: colors.foreground }]}>Goal Attainment</Text>
          <Text style={[styles.goalsSub, { color: colors.mutedForeground }]}>How close to weekly targets</Text>
          {goals.map((g) => (
            <View key={g.label} style={styles.goalRow}>
              <Feather name={g.icon as any} size={13} color={g.color} />
              <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>{g.label}</Text>
              <View style={[styles.goalBarBg, { backgroundColor: colors.muted }]}>
                <View style={[styles.goalBarFill, { width: `${Math.round(g.pct * 100)}%` as any, backgroundColor: g.color }]} />
              </View>
              <Text style={[styles.goalPct, { color: g.color }]}>{Math.round(g.pct * 100)}%</Text>
            </View>
          ))}
        </View>

        {/* ════════════════════════════════════
            SECTION 3 — PROGRESS
        ════════════════════════════════════ */}
        <SectionHeader label="Progress" icon="trending-up" colors={colors} badge="Mock" />

        {/* Key progress stats */}
        <View style={styles.progressStatsRow}>
          <ProgressStat label="Challenge Day" value={`Day ${challengeDay}`} sub="of 90" icon="award"  color="#6A0DAD" bg="#F1E4FA" />
          <ProgressStat label="Current Streak"value={`${streak} days`}     sub="active" icon="zap"   color="#F59E0B" bg="#FEF3C7" />
          <ProgressStat label="Weight Lost"   value={`${lostKg} kg`}       sub="since joining" icon="trending-down" color="#22C55E" bg="#DCFCE7" />
        </View>

        {/* 90-Day Challenge progress bar */}
        <View style={[styles.challengeCard, { backgroundColor: colors.card }]}>
          <View style={styles.challengeHeader}>
            <View style={[styles.challengeIcon, { backgroundColor: "#F1E4FA" }]}>
              <Feather name="award" size={16} color="#6A0DAD" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.challengeTitle, { color: colors.foreground }]}>90-Day Challenge</Text>
              <Text style={[styles.challengeSub, { color: colors.mutedForeground }]}>
                Day {challengeDay} of 90 completed
              </Text>
            </View>
            <Text style={[styles.challengePct, { color: "#6A0DAD" }]}>
              {Math.round((challengeDay / 90) * 100)}%
            </Text>
          </View>
          <View style={[styles.challengeBarBg, { backgroundColor: colors.muted }]}>
            <View style={[styles.challengeBarFill, { width: `${Math.round((challengeDay / 90) * 100)}%` as any }]} />
          </View>
        </View>

        {/* Weight trend chart */}
        <View style={[styles.weightCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.weightTitle, { color: colors.foreground }]}>Weight Trend</Text>
          <Text style={[styles.weightSub, { color: colors.mutedForeground }]}>
            {startWeight} kg → {currentWeight} kg  ·  {lostKg > 0 ? `–${lostKg} kg` : "no change"}
          </Text>

          {/* SVG-free chart using Views */}
          <View style={styles.chartWrap}>
            {weightPoints.map((pt, i) => {
              const pct = (maxW - pt) / (maxW - minW);
              const barH = Math.max(4, Math.round(pct * chartH));
              return (
                <View key={i} style={styles.chartCol}>
                  <View
                    style={[
                      styles.chartDot,
                      {
                        marginTop: Math.round((1 - pct) * chartH),
                        backgroundColor: i === weightPoints.length - 1 ? "#22C55E" : "#6A0DAD",
                      },
                    ]}
                  />
                  <View style={[styles.chartBar, { height: barH, backgroundColor: i === weightPoints.length - 1 ? "#22C55E30" : "#6A0DAD20" }]} />
                  <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>
                    {["W1","W2","W3","W4","W5","W6","W7","Now"][i]}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#6A0DAD" }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Start: {startWeight} kg</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Now: {currentWeight} kg</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Reusable sub-components ─────────────────────────────────────────────────

function NavBar({ onBack, topPad, colors }: { onBack: () => void; topPad: number; colors: any }) {
  return (
    <View style={[styles.navBar, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>
      <Text style={[styles.navTitle, { color: colors.foreground }]}>Client Details</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function SectionHeader({ label, icon, colors, badge }: { label: string; icon: string; colors: any; badge?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Feather name={icon as any} size={15} color={colors.primary} />
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{label}</Text>
      {badge ? (
        <View style={[styles.mockBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.mockBadgeText, { color: colors.mutedForeground }]}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={13} color={colors.mutedForeground} style={{ marginTop: 1 }} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

function ProgressStat({ label, value, sub, icon, color, bg }: {
  label: string; value: string; sub: string; icon: string; color: string; bg: string;
}) {
  return (
    <View style={[styles.progressStatTile, { backgroundColor: bg }]}>
      <Feather name={icon as any} size={16} color={color} />
      <Text style={[styles.progressStatValue, { color }]}>{value}</Text>
      <Text style={[styles.progressStatSub, { color: color + "99" }]}>{sub}</Text>
      <Text style={[styles.progressStatLabel, { color: color + "bb" }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "Inter_700Bold" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 15, fontFamily: "Inter_400Regular" },

  content: { padding: 16, gap: 12, paddingBottom: 60 },

  // Section headers
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  sectionTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold" },
  mockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  mockBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  // Profile card
  profileCard: {
    borderRadius: 20, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  profileTop: { flexDirection: "row", gap: 14, marginBottom: 16 },
  bigAvatar: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  bigAvatarText: { fontSize: 24, fontFamily: "Inter_700Bold" },
  profileMeta: { flex: 1, justifyContent: "center", gap: 4 },
  clientName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  clientEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, alignSelf: "flex-start", marginTop: 2 },
  statusBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  infoGrid: { borderTopWidth: 1, paddingTop: 14, gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 1 },
  infoValue: { fontSize: 14, fontFamily: "Inter_500Medium" },

  // Activity
  activityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  activityTile: { width: "47.5%", borderRadius: 16, padding: 14, gap: 3 },
  activityIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  activityStat: { fontSize: 24, fontFamily: "Inter_700Bold" },
  activityUnit: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: -2 },
  activityLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  activitySub: { fontSize: 11, fontFamily: "Inter_400Regular" },

  // Goal bars
  goalsCard: {
    borderRadius: 16, padding: 16, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  goalsTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  goalsSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  goalLabel: { width: 72, fontSize: 12, fontFamily: "Inter_500Medium" },
  goalBarBg: { flex: 1, height: 8, borderRadius: 100, overflow: "hidden" },
  goalBarFill: { height: 8, borderRadius: 100 },
  goalPct: { width: 34, textAlign: "right", fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // Progress stats row
  progressStatsRow: { flexDirection: "row", gap: 8 },
  progressStatTile: { flex: 1, borderRadius: 14, padding: 12, gap: 3, alignItems: "center" },
  progressStatValue: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  progressStatSub: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  progressStatLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },

  // Challenge card
  challengeCard: {
    borderRadius: 16, padding: 16, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  challengeHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  challengeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  challengeTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  challengeSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  challengePct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  challengeBarBg: { height: 10, borderRadius: 100, overflow: "hidden" },
  challengeBarFill: { height: 10, borderRadius: 100, backgroundColor: "#6A0DAD" },

  // Weight chart
  weightCard: {
    borderRadius: 16, padding: 16, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  weightTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  weightSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  chartWrap: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 100 },
  chartCol: { flex: 1, alignItems: "center", gap: 3 },
  chartDot: { width: 8, height: 8, borderRadius: 4 },
  chartBar: { width: "100%", borderRadius: 4 },
  chartLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  chartLegend: { flexDirection: "row", gap: 16, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
