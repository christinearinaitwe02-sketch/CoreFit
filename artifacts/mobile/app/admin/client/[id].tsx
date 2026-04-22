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
  userId: string;
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

const PAYMENT_STATUS_CONFIG = {
  approved: { label: "Approved",  color: "#22C55E", bg: "#DCFCE7", icon: "check-circle" },
  pending:  { label: "Pending",   color: "#F59E0B", bg: "#FEF3C7", icon: "clock"        },
  rejected: { label: "Rejected",  color: "#EF4444", bg: "#FEE2E2", icon: "x-circle"     },
};

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
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          const all: PaymentRecord[] = data.payments ?? [];
          const match =
            all.find((p) => p.userEmail?.toLowerCase() === client.email.toLowerCase()) ??
            all.find((p) => p.fullName.toLowerCase() === client.name.toLowerCase()) ??
            null;
          setPayment(match);
        }
      } catch { /* network error — ignore */ }
      finally { setLoadingPayment(false); }
    })();
  }, [client]);

  if (!client) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.navBar, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
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

  // Deterministic mock stats (consistent per client id)
  const workouts = mockStat(client.id + "w",  8,  42);
  const meals    = mockStat(client.id + "m",  24, 90);
  const water    = mockStat(client.id + "wa", 12, 40);
  const sleep    = mockStat(client.id + "s",  45, 72);

  const paymentCfg = payment ? PAYMENT_STATUS_CONFIG[payment.status] : null;

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
          <View style={[styles.bigAvatar, { backgroundColor: color + "22" }]}>
            <Text style={[styles.bigAvatarText, { color }]}>{initials(client.name)}</Text>
          </View>

          <Text style={[styles.clientName, { color: colors.foreground }]}>{client.name}</Text>
          <Text style={[styles.clientEmail, { color: colors.mutedForeground }]}>{client.email}</Text>

          {/* Payment status badge */}
          {loadingPayment ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 4 }} />
          ) : paymentCfg ? (
            <View style={[styles.statusBadge, { backgroundColor: paymentCfg.bg }]}>
              <Feather name={paymentCfg.icon as any} size={13} color={paymentCfg.color} />
              <Text style={[styles.statusBadgeText, { color: paymentCfg.color }]}>
                {paymentCfg.label}
              </Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: colors.muted }]}>
              <Feather name="minus-circle" size={13} color={colors.mutedForeground} />
              <Text style={[styles.statusBadgeText, { color: colors.mutedForeground }]}>No payment</Text>
            </View>
          )}

          {/* Info rows */}
          <View style={[styles.infoGrid, { borderTopColor: colors.border }]}>
            <InfoRow icon="calendar" label="Join Date"    value={formatDate(client.joinDate)} colors={colors} />
            {client.weight ? (
              <InfoRow icon="bar-chart-2" label="Weight"  value={`${client.weight} kg`} colors={colors} />
            ) : null}
            {payment?.phone ? (
              <InfoRow icon="phone"    label="Phone"       value={payment.phone}  colors={colors} />
            ) : null}
            {payment ? (
              <InfoRow icon="credit-card" label="Payment Amount" value={`UGX ${payment.amount.toLocaleString()}`} colors={colors} />
            ) : null}
            {payment?.transactionId ? (
              <InfoRow icon="hash"     label="Transaction ID" value={payment.transactionId} colors={colors} />
            ) : null}
            {payment?.createdAt ? (
              <InfoRow icon="clock"    label="Payment Date" value={formatDate(payment.createdAt)} colors={colors} />
            ) : null}
            {client.notes ? (
              <InfoRow icon="file-text" label="Coach Notes" value={client.notes} colors={colors} />
            ) : null}
          </View>
        </View>

        {/* ── Activity sections ── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Activity Overview</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Estimated totals since joining
        </Text>

        {/* Workouts */}
        <ActivitySection
          icon="activity"
          title="Workouts"
          accent="#6A0DAD"
          bg="#F1E4FA"
          colors={colors}
          stat={String(workouts)}
          statUnit="sessions completed"
          detail={`~${Math.round(workouts / 4)} per week · Avg ${30 + mockStat(client.id + "wd", 0, 30)} min/session`}
          pct={Math.min(1, workouts / 40)}
        />

        {/* Meals */}
        <ActivitySection
          icon="coffee"
          title="Meals"
          accent="#F59E0B"
          bg="#FEF3C7"
          colors={colors}
          stat={String(meals)}
          statUnit="meals logged"
          detail={`~${Math.round(meals / 4)} per week · Avg ${1400 + mockStat(client.id + "mc", 0, 600)} kcal/day`}
          pct={Math.min(1, meals / 90)}
        />

        {/* Water */}
        <ActivitySection
          icon="droplet"
          title="Water Intake"
          accent="#38BDF8"
          bg="#E0F2FE"
          colors={colors}
          stat={water.toFixed(1)}
          statUnit="litres total"
          detail={`~${(water / (mockStat(client.id + "days", 20, 60))).toFixed(1)} L/day avg`}
          pct={Math.min(1, water / 40)}
        />

        {/* Sleep */}
        <ActivitySection
          icon="moon"
          title="Sleep"
          accent="#818CF8"
          bg="#EDE9FE"
          colors={colors}
          stat={sleep.toFixed(0)}
          statUnit="hours logged"
          detail={`~${(sleep / (mockStat(client.id + "sdays", 10, 30))).toFixed(1)} hrs/night avg`}
          pct={Math.min(1, sleep / 70)}
        />

        {/* ── Engagement score ── */}
        <View style={[styles.engagementCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.engagementTitle, { color: colors.foreground }]}>Engagement Score</Text>
          <Text style={[styles.engagementSub, { color: colors.mutedForeground }]}>
            Based on logged activity across all categories
          </Text>
          <View style={styles.progressRow}>
            {[
              { label: "Workouts",   pct: Math.min(1, workouts / 40), color: "#6A0DAD" },
              { label: "Nutrition",  pct: Math.min(1, meals / 90),    color: "#F59E0B" },
              { label: "Hydration",  pct: Math.min(1, water / 40),    color: "#38BDF8" },
              { label: "Sleep",      pct: Math.min(1, sleep / 70),    color: "#818CF8" },
            ].map((b) => (
              <View key={b.label} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{b.label}</Text>
                <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
                  <View style={[styles.barFill, { width: `${Math.round(b.pct * 100)}%` as any, backgroundColor: b.color }]} />
                </View>
                <Text style={[styles.barPct, { color: b.color }]}>{Math.round(b.pct * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

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

function ActivitySection({
  icon, title, accent, bg, colors, stat, statUnit, detail, pct,
}: {
  icon: string; title: string; accent: string; bg: string;
  colors: any; stat: string; statUnit: string; detail: string; pct: number;
}) {
  return (
    <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.activityHeader}>
        <View style={[styles.activityIconWrap, { backgroundColor: bg }]}>
          <Feather name={icon as any} size={16} color={accent} />
        </View>
        <Text style={[styles.activityTitle, { color: colors.foreground }]}>{title}</Text>
        <View style={[styles.mockBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.mockBadgeText, { color: colors.mutedForeground }]}>Mock</Text>
        </View>
      </View>

      {/* Big number */}
      <View style={styles.activityBody}>
        <Text style={[styles.activityStat, { color: accent }]}>{stat}</Text>
        <Text style={[styles.activityUnit, { color: accent + "99" }]}>{statUnit}</Text>
      </View>

      {/* Detail text */}
      <Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>{detail}</Text>

      {/* Progress bar */}
      <View style={[styles.activityBarBg, { backgroundColor: colors.muted }]}>
        <View style={[styles.activityBarFill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: accent }]} />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  navBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "Inter_700Bold" },

  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 15, fontFamily: "Inter_400Regular" },

  content: { padding: 16, gap: 14, paddingBottom: 60 },

  // Profile card
  profileCard: {
    borderRadius: 20, padding: 20, alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  bigAvatar: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  bigAvatarText: { fontSize: 28, fontFamily: "Inter_700Bold" },
  clientName: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  clientEmail: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, marginTop: 4,
  },
  statusBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  infoGrid: { width: "100%", borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 1 },
  infoValue: { fontSize: 14, fontFamily: "Inter_500Medium", flexWrap: "wrap" },

  // Section headers
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 2 },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -10 },

  // Activity section cards
  activityCard: {
    borderRadius: 16, padding: 16, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  activityHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  activityIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  activityTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold" },
  mockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  mockBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  activityBody: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  activityStat: { fontSize: 32, fontFamily: "Inter_700Bold" },
  activityUnit: { fontSize: 13, fontFamily: "Inter_400Regular" },
  activityDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  activityBarBg: { height: 6, borderRadius: 100, overflow: "hidden" },
  activityBarFill: { height: 6, borderRadius: 100 },

  // Engagement card
  engagementCard: {
    borderRadius: 20, padding: 18, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  engagementTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  engagementSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  progressRow: { gap: 10 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { width: 72, fontSize: 11, fontFamily: "Inter_500Medium" },
  barBg: { flex: 1, height: 8, borderRadius: 100, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 100 },
  barPct: { width: 34, textAlign: "right", fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
