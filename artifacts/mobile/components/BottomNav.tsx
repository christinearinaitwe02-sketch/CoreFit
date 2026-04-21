import { Feather } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export type NavTab = "home" | "workout" | "log" | "progress" | "profile";

interface Tab {
  key: NavTab;
  label: string;
  icon: string;
  route: string;
}

const TABS: Tab[] = [
  { key: "home",     label: "Home",     icon: "home",         route: "/(tabs)"          },
  { key: "workout",  label: "Workout",  icon: "zap",          route: "/(tabs)/workout"  },
  { key: "log",      label: "Log",      icon: "plus-circle",  route: "/(tabs)/log"      },
  { key: "progress", label: "Progress", icon: "bar-chart-2",  route: "/(tabs)/progress" },
  { key: "profile",  label: "Profile",  icon: "user",         route: "/(tabs)/profile"  },
];

interface Props {
  active?: NavTab;
}

export default function BottomNav({ active }: Props) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const bottomPad = Platform.OS === "web" ? 20 : Math.max(insets.bottom, 8);
  const barHeight = 50 + bottomPad;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.tabBackground,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
          height: barHeight,
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? colors.primary : colors.tabInactive;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => {
              if (!isActive) {
                Haptics.selectionAsync();
                router.push(tab.route as any);
              }
            }}
          >
            <View style={[styles.iconWrap, isActive && { backgroundColor: colors.primaryLight }]}>
              <Feather name={tab.icon as any} size={21} color={color} />
            </View>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    alignItems: "flex-start",
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  iconWrap: {
    padding: 4,
    borderRadius: 10,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});
