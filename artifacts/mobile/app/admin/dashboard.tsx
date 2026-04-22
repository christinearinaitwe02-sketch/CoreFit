import { getApiBase } from "@/utils/api";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_BASE = getApiBase();

export interface Payment {
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

export function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

type AdminTab = "overview" | "payments" | "clients";

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, clients } = useApp();

  const [tab, setTab] = useState<AdminTab>("overview");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const fetchPayments = useCallback(async (silent = false) => {
    if (!silent) setLoadingPayments(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments ?? []);
      }
    } catch { /* silent */ }
    finally { setLoadingPayments(false); }
  }, []);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(() => fetchPayments(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayments(true);
    setRefreshing(false);
  };

  const handlePaymentAction = async (id: string, action: "approve" | "reject") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setApprovingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) { Alert.alert("Error", "Could not update payment status."); return; }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPayments((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: action === "approve" ? "approved" : "rejected" } : p)
      );
    } catch {
      Alert.alert("Error", "Network error. Try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); logout(); } },
    ]);
  };

  const pending = payments.filter((p) => p.status === "pending");
  const approved = payments.filter((p) => p.status === "approved");
  const rejected = payments.filter((p) => p.status === "rejected");
  const totalRevenue = approved.reduce((s, p) => s + p.amount, 0);

  const filteredPayments = payments.filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (p.userEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
    p.transactionId.toLowerCase().includes(search.toLowerCase())
  );
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { key: AdminTab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "grid" },
    { key: "payments", label: `Payments${pending.length > 0 ? ` (${pending.length})` : ""}`, icon: "credit-card" },
    { key: "clients", label: "Clients", icon: "users" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Admin Dashboard</Text>
            <Text style={styles.headerName}>{user?.name ?? "Administrator"}</Text>
            <Text style={styles.headerEmail}>{user?.email}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.adminBadge}>
              <Feather name="shield" size={12} color="#fff" />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Feather name="log-out" size={18} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Header stats pills */}
        <View style={styles.statsRow}>
          <StatPill label="Pending" value={pending.length} color="#FCD34D" />
          <StatPill label="Approved" value={approved.length} color="#34D399" />
          <StatPill label="Rejected" value={rejected.length} color="#F87171" />
          <StatPill label="Clients" value={clients.length} color="#93C5FD" />
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => { setTab(t.key); setSearch(""); Haptics.selectionAsync(); }}
            style={[styles.tabBtn, tab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Feather name={t.icon as any} size={14} color={tab === t.key ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? colors.primary : colors.mutedForeground }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Search (not on overview) ── */}
      {tab !== "overview" && (
        <View style={[styles.searchRow, { backgroundColor: colors.muted }]}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={tab === "payments" ? "Search by name, email, txn ID…" : "Search clients…"}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={[styles.content, tab === "overview" && styles.contentOverview]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* ─ OVERVIEW ─ */}
        {tab === "overview" && (
          <>
            {/* Revenue card */}
            <View style={[styles.revenueCard, { backgroundColor: colors.primary }]}>
              <Text style={styles.revenueLabel}>Total Revenue Collected</Text>
              <Text style={styles.revenueAmount}>UGX {totalRevenue.toLocaleString()}</Text>
              <Text style={styles.revenueSub}>{approved.length} approved payments</Text>
            </View>

            {/* Stats grid */}
            <View style={styles.overviewGrid}>
              <OverviewTile label="Total Clients" value={String(clients.length)} icon="users" color="#6A0DAD" bg={colors.primaryLight} />
              <OverviewTile label="Pending Payments" value={String(pending.length)} icon="clock" color="#F59E0B" bg="#FEF3C7" />
              <OverviewTile label="Approved" value={String(approved.length)} icon="check-circle" color="#22C55E" bg="#DCFCE7" />
              <OverviewTile label="Rejected" value={String(rejected.length)} icon="x-circle" color="#EF4444" bg="#FEE2E2" />
            </View>

            {/* Recent payments */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Payments</Text>
            {loadingPayments ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : payments.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <Feather name="inbox" size={28} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No payments yet</Text>
              </View>
            ) : (
              payments.slice(0, 5).map((p) => (
                <View key={p.id} style={[styles.recentRow, { backgroundColor: colors.card }]}>
                  <View style={[styles.recentAvatar, { backgroundColor: avatarColor(p.fullName) + "22" }]}>
                    <Text style={[styles.recentAvatarText, { color: avatarColor(p.fullName) }]}>
                      {initials(p.fullName)}
                    </Text>
                  </View>
                  <View style={styles.recentMeta}>
                    <Text style={[styles.recentName, { color: colors.foreground }]}>{p.fullName}</Text>
                    <Text style={[styles.recentSub, { color: colors.mutedForeground }]}>
                      {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      {" · UGX "}{p.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, {
                    backgroundColor:
                      p.status === "approved" ? "#22C55E20"
                      : p.status === "rejected" ? "#EF444420"
                      : "#F59E0B20"
                  }]}>
                    <Text style={[styles.statusPillText, {
                      color: p.status === "approved" ? "#22C55E" : p.status === "rejected" ? "#EF4444" : "#F59E0B"
                    }]}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {/* Clients quick list */}
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>
              Clients ({clients.length})
            </Text>
            {clients.slice(0, 4).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.recentRow, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/admin/client/${c.id}`)}
                activeOpacity={0.8}
              >
                <View style={[styles.recentAvatar, { backgroundColor: avatarColor(c.name) + "22" }]}>
                  <Text style={[styles.recentAvatarText, { color: avatarColor(c.name) }]}>{initials(c.name)}</Text>
                </View>
                <View style={styles.recentMeta}>
                  <Text style={[styles.recentName, { color: colors.foreground }]}>{c.name}</Text>
                  <Text style={[styles.recentSub, { color: colors.mutedForeground }]}>{c.email}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
            {clients.length > 4 && (
              <TouchableOpacity onPress={() => setTab("clients")} style={[styles.viewAllBtn, { borderColor: colors.border }]}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View all {clients.length} clients</Text>
                <Feather name="arrow-right" size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ─ PAYMENTS ─ */}
        {tab === "payments" && (
          loadingPayments ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading payments…</Text>
            </View>
          ) : filteredPayments.length === 0 ? (
            <View style={styles.center}>
              <Feather name="inbox" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {search ? "No payments match your search" : "No payments yet"}
              </Text>
            </View>
          ) : (
            filteredPayments.map((p) => (
              <PaymentCard
                key={p.id}
                payment={p}
                loading={approvingId === p.id}
                colors={colors}
                onApprove={() => handlePaymentAction(p.id, "approve")}
                onReject={() => handlePaymentAction(p.id, "reject")}
              />
            ))
          )
        )}

        {/* ─ CLIENTS ─ */}
        {tab === "clients" && (
          filteredClients.length === 0 ? (
            <View style={styles.center}>
              <Feather name="users" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {search ? "No clients match your search" : "No clients yet"}
              </Text>
            </View>
          ) : (
            filteredClients.map((c) => (
              <View key={c.id} style={[styles.clientCard, { backgroundColor: colors.card }]}>
                <View style={[styles.avatar, { backgroundColor: avatarColor(c.name) + "22" }]}>
                  <Text style={[styles.avatarText, { color: avatarColor(c.name) }]}>{initials(c.name)}</Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={[styles.clientName, { color: colors.foreground }]}>{c.name}</Text>
                  <Text style={[styles.clientEmail, { color: colors.mutedForeground }]}>{c.email}</Text>
                  {c.notes ? (
                    <Text style={[styles.clientNotes, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {c.notes}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.clientRight}>
                  {c.weight ? (
                    <Text style={[styles.clientWeight, { color: colors.mutedForeground }]}>{c.weight} kg</Text>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); router.push(`/admin/client/${c.id}`); }}
                    style={[styles.detailsBtn, { backgroundColor: colors.primaryLight }]}
                  >
                    <Text style={[styles.detailsBtnText, { color: colors.primary }]}>View Details</Text>
                    <Feather name="chevron-right" size={13} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.statPill, { backgroundColor: color + "22" }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.8)" }]}>{label}</Text>
    </View>
  );
}

function OverviewTile({ label, value, icon, color, bg }: { label: string; value: string; icon: string; color: string; bg: string }) {
  return (
    <View style={[styles.overviewTile, { backgroundColor: bg }]}>
      <Feather name={icon as any} size={20} color={color} />
      <Text style={[styles.overviewValue, { color }]}>{value}</Text>
      <Text style={[styles.overviewLabel, { color: color + "bb" }]}>{label}</Text>
    </View>
  );
}

function PaymentCard({
  payment, loading, colors, onApprove, onReject,
}: {
  payment: Payment;
  loading: boolean;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  onApprove: () => void;
  onReject: () => void;
}) {
  const statusColor =
    payment.status === "approved" ? "#22C55E" : payment.status === "rejected" ? "#EF4444" : "#F59E0B";
  const date = new Date(payment.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
      <View style={styles.paymentTop}>
        <View style={[styles.paymentAvatar, { backgroundColor: avatarColor(payment.fullName) + "22" }]}>
          <Text style={[styles.paymentAvatarText, { color: avatarColor(payment.fullName) }]}>
            {initials(payment.fullName)}
          </Text>
        </View>
        <View style={styles.paymentMeta}>
          <Text style={[styles.paymentName, { color: colors.foreground }]}>{payment.fullName}</Text>
          {payment.userEmail ? <Text style={[styles.paymentSub, { color: colors.primary }]}>{payment.userEmail}</Text> : null}
          <Text style={[styles.paymentSub, { color: colors.mutedForeground }]}>{payment.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.detailGrid, { borderColor: colors.border }]}>
        <DetailRow label="Amount" value={`UGX ${payment.amount.toLocaleString()}`} colors={colors} />
        <DetailRow label="Transaction ID" value={payment.transactionId} colors={colors} />
        <DetailRow label="Submitted" value={date} colors={colors} />
      </View>

      {payment.status === "pending" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onReject} disabled={loading}
            style={[styles.actionBtn, { backgroundColor: "#EF444412", borderColor: "#EF444440" }]}
          >
            {loading ? <ActivityIndicator size="small" color="#EF4444" /> : <Feather name="x" size={15} color="#EF4444" />}
            <Text style={[styles.actionText, { color: "#EF4444" }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onApprove} disabled={loading}
            style={[styles.actionBtn, { backgroundColor: "#22C55E12", borderColor: "#22C55E40", flex: 1 }]}
          >
            {loading ? <ActivityIndicator size="small" color="#22C55E" /> : <Feather name="check" size={15} color="#22C55E" />}
            <Text style={[styles.actionText, { color: "#22C55E" }]}>Approve & Activate</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.detailItem}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerGreeting: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_500Medium" },
  headerName: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 2 },
  headerEmail: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  adminBadgeText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  logoutBtn: { padding: 6 },
  statsRow: { flexDirection: "row", gap: 8 },
  statPill: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center", gap: 2 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  // Tabs
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  // Search
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 12, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  // Scroll content
  content: { padding: 16, gap: 10, paddingBottom: 60 },
  contentOverview: { gap: 10 },
  // Overview
  revenueCard: { borderRadius: 20, padding: 20, marginBottom: 2 },
  revenueLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_500Medium" },
  revenueAmount: { color: "#fff", fontSize: 32, fontFamily: "Inter_700Bold", marginTop: 4 },
  revenueSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  overviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  overviewTile: { width: "47.5%", borderRadius: 16, padding: 16, gap: 6 },
  overviewValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  overviewLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 4 },
  recentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14 },
  recentAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recentAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  recentMeta: { flex: 1 },
  recentName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  recentSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  statusPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  viewAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 12, borderWidth: 1, marginTop: 2 },
  viewAllText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyCard: { alignItems: "center", padding: 32, borderRadius: 16, gap: 10 },
  // Shared
  center: { alignItems: "center", paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  // Payment card
  paymentCard: { borderRadius: 16, padding: 16, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  paymentTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  paymentAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  paymentAvatarText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  paymentMeta: { flex: 1 },
  paymentName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  paymentSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  detailGrid: { borderTopWidth: 1, paddingTop: 10, gap: 6 },
  detailItem: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  // Client card
  clientCard: { borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  clientEmail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  clientNotes: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  clientRight: { alignItems: "flex-end", gap: 6 },
  clientWeight: { fontSize: 12, fontFamily: "Inter_500Medium" },
  detailsBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  detailsBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
