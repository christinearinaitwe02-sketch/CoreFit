import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const AVATAR_COLORS = [
  "#9B5DE5",
  "#FF8FAB",
  "#FFB085",
  "#38BDF8",
  "#34D399",
  "#818CF8",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function ClientCard({ client, onPress }: { client: Client; onPress: () => void }) {
  const colors = useColors();
  const avatarColor = getAvatarColor(client.name);
  const firstLetter = client.name[0].toUpperCase();

  const joinDate = new Date(client.joinDate + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.clientCard, { backgroundColor: colors.card }]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>
          {firstLetter}
        </Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={[styles.clientName, { color: colors.foreground }]}>
          {client.name}
        </Text>
        <Text style={[styles.clientEmail, { color: colors.mutedForeground }]}>
          {client.email}
        </Text>
        <Text style={[styles.clientJoin, { color: colors.mutedForeground }]}>
          Joined {joinDate}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function CoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { clients, user } = useApp();
  const router = useRouter();

  const [search, setSearch] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <Text style={[styles.title, { color: colors.foreground }]}>
            My Clients
          </Text>
          <View
            style={[styles.badge, { backgroundColor: colors.primaryLight }]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {clients.length}
            </Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Monitor your clients' progress and add notes.
        </Text>

        {/* Search */}
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
            label="Active Today"
            value="2"
            icon="activity"
            color="#34D399"
            bg="#DCFCE7"
          />
          <SummaryCard
            label="Avg. Consistency"
            value="78%"
            icon="bar-chart-2"
            color={colors.peach}
            bg={colors.peachLight}
          />
        </ScrollView>

        {/* Client List */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
              <Feather name="users" size={28} color={colors.mutedForeground} />
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
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
      </ScrollView>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.summCard, { backgroundColor: bg }]}>
      <Feather name={icon as any} size={18} color={color} />
      <Text style={[styles.summValue, { color }]}>{value}</Text>
      <Text style={[styles.summLabel, { color: color + "bb" }]}>{label}</Text>
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  summaryRow: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summCard: {
    width: 120,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    alignItems: "flex-start",
  },
  summValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  summLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
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
  avatarText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
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
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
