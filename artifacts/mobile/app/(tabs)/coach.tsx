import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
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
import { useApp, Client } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

const AVATAR_COLORS = [
  "#9B5DE5", "#FF8FAB", "#FFB085", "#38BDF8", "#34D399", "#818CF8",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface Payment {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  amount: number;
  transactionId: string;
  status: string;
  createdAt: string;
}

function ClientCard({ client, onPress }: { client: Client; onPress: () => void }) {
  const colors = useColors();
  const avatarColor = getAvatarColor(client.name);
  const firstLetter = client.name[0].toUpperCase();
  const joinDate = new Date(client.joinDate + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.clientCard, { backgroundColor: colors.card }]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>{firstLetter}</Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={[styles.clientName, { color: colors.foreground }]}>{client.name}</Text>
        <Text style={[styles.clientEmail, { color: colors.mutedForeground }]}>{client.email}</Text>
        <Text style={[styles.clientJoin, { color: colors.mutedForeground }]}>Joined {joinDate}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function PaymentCard({
  payment,
  onApprove,
  onReject,
}: {
  payment: Payment;
  onApprove: () => void;
  onReject: () => void;
}) {
  const colors = useColors();
  const date = new Date(payment.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const statusColor =
    payment.status === "approved" ? "#22C55E" :
    payment.status === "rejected" ? "#EF4444" : "#F59E0B";

  return (
    <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
      <View style={styles.paymentHeader}>
        <View style={[styles.paymentAvatar, { backgroundColor: "#FF6600" + "18" }]}>
          <Text style={[styles.paymentAvatarText, { color: "#FF6600" }]}>
            {payment.fullName[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentName, { color: colors.foreground }]}>{payment.fullName}</Text>
          <Text style={[styles.paymentPhone, { color: colors.mutedForeground }]}>{payment.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Amount</Text>
          <Text style={[styles.detailValue, { color: colors.foreground }]}>
            UGX {payment.amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Transaction ID</Text>
          <Text style={[styles.detailValue, { color: colors.foreground }]}>{payment.transactionId}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Submitted</Text>
          <Text style={[styles.detailValue, { color: colors.foreground }]}>{date}</Text>
        </View>
      </View>

      {payment.status === "pending" && (
        <View style={styles.paymentActions}>
          <TouchableOpacity
            onPress={onReject}
            style={[styles.actionBtn, { backgroundColor: "#EF444418", borderColor: "#EF444440" }]}
          >
            <Feather name="x" size={16} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onApprove}
            style={[styles.actionBtn, { backgroundColor: "#22C55E18", borderColor: "#22C55E40", flex: 1 }]}
          >
            <Feather name="check" size={16} color="#22C55E" />
            <Text style={[styles.actionBtnText, { color: "#22C55E" }]}>Approve & Activate</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function SummaryCard({ label, value, icon, color, bg }: {
  label: string; value: string; icon: string; color: string; bg: string;
}) {
  return (
    <View style={[styles.summCard, { backgroundColor: bg }]}>
      <Feather name={icon as any} size={18} color={color} />
      <Text style={[styles.summValue, { color }]}>{value}</Text>
      <Text style={[styles.summLabel, { color: color + "bb" }]}>{label}</Text>
    </View>
  );
}

export default function CoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { clients, user } = useApp();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [activeSection, setActiveSection] = useState<"payments" | "clients">("payments");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments`);
      if (!res.ok) return;
      const data = await res.json();
      setPayments(data.payments ?? []);
    } catch {
      // network error
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "coach") {
      fetchPayments();
    }
  }, [user?.role, fetchPayments]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await fetch(`${API_BASE}/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        Alert.alert("Error", "Could not update payment status.");
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (action === "approve") {
        Alert.alert("Approved!", "User has been activated with Premium access. They will see the change next time they check their status.");
      } else {
        Alert.alert("Rejected", "Payment has been marked as rejected.");
      }
      fetchPayments();
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const pendingPayments = payments.filter((p) => p.status === "pending");

  if (user?.role !== "coach") {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.center, { paddingTop: topPad + 60 }]}>
          <Feather name="lock" size={48} color={colors.mutedForeground} />
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>
            Coach Access Only
          </Text>
          <Text style={[styles.lockedSub, { color: colors.mutedForeground }]}>
            Switch to the Coach role in Profile to access client management.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Coach Dashboard</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Manage clients and verify payments.
        </Text>

        {/* Summary cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryRow}
        >
          <SummaryCard
            label="Total Clients"
            value={`${clients.length}`}
            icon="users"
            color={colors.primary}
            bg={colors.primaryLight}
          />
          <SummaryCard
            label="Pending Payments"
            value={`${pendingPayments.length}`}
            icon="credit-card"
            color="#F59E0B"
            bg="#F59E0B18"
          />
          <SummaryCard
            label="All Payments"
            value={`${payments.length}`}
            icon="check-circle"
            color="#22C55E"
            bg="#22C55E18"
          />
        </ScrollView>

        {/* Section Toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
          {(["payments", "clients"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setActiveSection(s)}
              style={[
                styles.toggleBtn,
                activeSection === s && { backgroundColor: colors.card },
              ]}
            >
              <Feather
                name={s === "payments" ? "credit-card" : "users"}
                size={14}
                color={activeSection === s ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: activeSection === s ? colors.primary : colors.mutedForeground },
                ]}
              >
                {s === "payments"
                  ? `Payments${pendingPayments.length > 0 ? ` (${pendingPayments.length})` : ""}`
                  : "Clients"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payments Section */}
        {activeSection === "payments" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Pending Payments
              </Text>
              <TouchableOpacity onPress={fetchPayments} style={styles.refreshBtn}>
                <Feather name="refresh-cw" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {loadingPayments ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : pendingPayments.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
                <Feather name="check-circle" size={28} color="#22C55E" />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No pending payments to review.
                </Text>
              </View>
            ) : (
              pendingPayments.map((p) => (
                <PaymentCard
                  key={p.id}
                  payment={p}
                  onApprove={() => handleAction(p.id, "approve")}
                  onReject={() => handleAction(p.id, "reject")}
                />
              ))
            )}

            {payments.filter((p) => p.status !== "pending").length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 20, marginBottom: 12 }]}>
                  Processed Payments
                </Text>
                {payments
                  .filter((p) => p.status !== "pending")
                  .map((p) => (
                    <PaymentCard
                      key={p.id}
                      payment={p}
                      onApprove={() => {}}
                      onReject={() => {}}
                    />
                  ))}
              </View>
            )}
          </View>
        )}

        {/* Clients Section */}
        {activeSection === "clients" && (
          <View>
            <View
              style={[styles.searchBox, { backgroundColor: colors.muted }]}
            >
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search clients..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.searchInput, { color: colors.foreground }]}
              />
            </View>
            <View style={styles.list}>
              {filtered.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
                  <Feather name="users" size={28} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No clients found.
                  </Text>
                </View>
              ) : (
                filtered.map((c) => (
                  <ClientCard
                    key={c.id}
                    client={c}
                    onPress={() => router.push(`/client/${c.id}`)}
                  />
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  lockedTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  lockedSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryRow: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summCard: {
    width: 130,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    alignItems: "flex-start",
  },
  summValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  toggle: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 20, gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  refreshBtn: { padding: 6 },
  paymentCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  paymentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentAvatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  paymentInfo: { flex: 1, gap: 2 },
  paymentName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  paymentPhone: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  paymentDetails: {
    gap: 8,
    backgroundColor: "#00000008",
    borderRadius: 10,
    padding: 12,
  },
  detailItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  paymentActions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  list: { paddingHorizontal: 20, gap: 10 },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  clientInfo: { flex: 1, gap: 2 },
  clientName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  clientEmail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  clientJoin: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emptyBox: {
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
});
