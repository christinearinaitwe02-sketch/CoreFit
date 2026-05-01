import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { trackEvent, setUpgradeSource } from "@/utils/analytics";

export interface UpgradeNavigationOptions {
  source?: string;
  onBeforeNavigate?: () => void;
  haptics?: "notification-success" | "impact-medium" | "impact-light";
  navigationDelay?: number;
  resetDelay?: number;
}

export function useUpgradeNavigation({
  source,
  onBeforeNavigate,
  haptics = "impact-medium",
  navigationDelay = 0,
  resetDelay = 1000,
}: UpgradeNavigationOptions = {}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateToUpgrade = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    setUpgradeSource(source);
    trackEvent("upgrade_funnel_started", { source });

    if (haptics === "notification-success") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (haptics === "impact-light") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const execute = () => {
      onBeforeNavigate?.();
      router.push("/upgrade");
      if (resetDelay > 0) {
        setTimeout(() => setIsNavigating(false), resetDelay);
      } else {
        setIsNavigating(false);
      }
    };

    if (navigationDelay > 0) {
      setTimeout(execute, navigationDelay);
    } else {
      execute();
    }
  };

  return { isNavigating, navigateToUpgrade };
}
