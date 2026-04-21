import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PillButton } from "@/components/PillButton";
import { PremiumGateModal } from "@/components/PremiumGateModal";

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

const DEMO_PROGRESS = [
  { week: "W1", calories: 1200, workouts: 4, sleep: 7.5 },
  { week: "W2", calories: 1450, workouts: 5, sleep: 7.8 },
  { week: "W3", calories: 1300, workouts: 3, sleep: 6.9 },
  { week: "W4", calories: 1600, workouts: 6, sleep: 8.1 },
];

export default function ClientDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients } = useApp();

  const client = clients.find((c) => c.id === id);

  const [note, setNote] = useState(client?.notes ?? "");
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [editNote, setEditNote] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!client) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: colors.mutedForeground }]}>
            Client not found.
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.back, { color: colors.primary }]}>
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const avatarColor = getAvatarColor(client.name);
  const joinDate = new Date(client.joinDate + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  const handleSaveNote = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditNote(false);
    Alert.alert("Saved", "Note updated for " + client.name);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.muted }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Client Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View
          style={[styles.profileCard, { backgroundColor: colors.card }]}
        >
          <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>
              {client.name[0].toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.clientName, { color: colors.foreground }]}>
            {client.name}
          </Text>
          <Text style={[styles.clientEmail, { color: colors.mutedForeground }]}>
            {client.email}
          </Text>
          <View style={styles.metaRow}>
            <MetaPill icon="calendar" label={`Joined ${joinDate}`} color={colors.primary} bg={colors.primaryLight} />
            {client.weight && (
              <MetaPill icon="activity" label={`${client.weight} kg`} color={colors.peach} bg={colors.peachLight} />
            )}
          </View>
        </View>

        {/* Weekly Progress */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Weekly Progress
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.progressRow}
        >
          {DEMO_PROGRESS.map((p) => (
            <View
              key={p.week}
              style={[styles.progressCard, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.progWeek, { color: colors.mutedForeground }]}>
                {p.week}
              </Text>
              <StatLine label="Calories" value={`${p.calories}`} color={colors.primary} />
              <StatLine label="Workouts" value={`${p.workouts}`} color={colors.secondary} />
              <StatLine label="Sleep" value={`${p.sleep}h`} color="#818CF8" />
            </View>
          ))}
        </ScrollView>

        {/* Consistency */}
        <View style={[styles.consistencyCard, { backgroundColor: colors.primaryLight }]}>
          <View style={styles.consistencyRow}>
            <Feather name="trending-up" size={22} color={colors.primary} />
            <View style={styles.consistencyInfo}>
              <Text style={[styles.consistencyTitle, { color: colors.primary }]}>
                Consistency Score
              </Text>
              <Text style={[styles.consistencyDesc, { color: colors.purpleDark }]}>
                Based on workout and log frequency
              </Text>
            </View>
            <Text style={[styles.consistencyValue, { color: colors.primary }]}>
              78%
            </Text>
          </View>
          <View style={[styles.consistencyBarBg, { backgroundColor: colors.primary + "22" }]}>
            <View
              style={[
                styles.consistencyBarFill,
                { backgroundColor: colors.primary, width: "78%" as any },
              ]}
            />
          </View>
        </View>

        {/* Coach Notes */}
        <View style={styles.notesSection}>
          <View style={styles.noteHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Coach Notes
            </Text>
            <TouchableOpacity
              onPress={() => setEditNote(!editNote)}
              style={[styles.editNoteBtn, { backgroundColor: colors.primaryLight }]}
            >
              <Feather
                name={editNote ? "x" : "edit-2"}
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          {editNote ? (
            <View style={styles.noteEdit}>
              <TextInput
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Add notes, recommendations, or observations..."
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.noteInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.muted,
                    borderColor: colors.primary + "44",
                  },
                ]}
                numberOfLines={5}
                textAlignVertical="top"
              />
              <PillButton label="Save Note" onPress={handleSaveNote} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setEditNote(true)}
              style={[styles.noteDisplay, { backgroundColor: colors.card }]}
            >
              {note ? (
                <Text style={[styles.noteText, { color: colors.foreground }]}>
                  {note}
                </Text>
              ) : (
                <Text style={[styles.notePlaceholder, { color: colors.mutedForeground }]}>
                  Tap to add notes or recommendations for this client...
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Message Client */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <PillButton
            label="Send Recommendation"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPremiumGate(true);
            }}
            icon={<Feather name="send" size={16} color="#fff" />}
          />
        </View>
      </ScrollView>

      <PremiumGateModal
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        featureName="Coach Recommendations"
      />
    </View>
  );
}

function MetaPill({
  icon,
  label,
  color,
  bg,
}: {
  icon: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.metaPill, { backgroundColor: bg }]}>
      <Feather name={icon as any} size={12} color={color} />
      <Text style={[styles.metaPillText, { color }]}>{label}</Text>
    </View>
  );
}

function StatLine({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statLine}>
      <Text style={styles.statLineLabel}>{label}</Text>
      <Text style={[styles.statLineValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFound: { fontSize: 16, fontFamily: "Inter_400Regular" },
  back: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold" },
  clientName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  clientEmail: { fontSize: 14, fontFamily: "Inter_400Regular" },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  metaPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressRow: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  progressCard: {
    width: 130,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  progWeek: { fontSize: 12, fontFamily: "Inter_700Bold" },
  statLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLineLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#999" },
  statLineValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  consistencyCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  consistencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  consistencyInfo: { flex: 1 },
  consistencyTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  consistencyDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  consistencyValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  consistencyBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  consistencyBarFill: {
    height: 8,
    borderRadius: 4,
  },
  notesSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  editNoteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  noteEdit: { gap: 12 },
  noteInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 120,
    borderWidth: 1.5,
  },
  noteDisplay: {
    borderRadius: 14,
    padding: 16,
    minHeight: 80,
  },
  noteText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  notePlaceholder: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
});
