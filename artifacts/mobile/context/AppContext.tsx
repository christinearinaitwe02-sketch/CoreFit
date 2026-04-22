import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type UserRole = "client" | "coach";

export interface CoachProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

const DEFAULT_COACH: CoachProfile = {
  id: "coach-tina-barks",
  name: "Coach TinaBarks",
  email: "coach@corehrfitness.com",
  phone: "+256702568383",
  role: "coach",
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isPremium?: boolean;
  paymentStatus?: "none" | "pending" | "approved" | "rejected";
  goals?: {
    calories: number;
    water: number;
    sleep: number;
    workouts: number;
  };
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: "cardio" | "strength" | "hiit" | "yoga" | "cycling" | "other" | "walking" | "jogging";
  duration: number;
  calories: number;
  notes?: string;
}

export interface MealEntry {
  id: string;
  date: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories?: number;
  notes?: string;
}

export interface WaterEntry {
  id: string;
  date: string;
  litres: number;
}

export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality?: "poor" | "fair" | "good" | "excellent";
}

export interface WeightEntry {
  date: string;
  kg: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  weight?: number;
  notes?: string;
}

export interface DaySummary {
  date: string;
  caloriesBurned: number;
  mealsLogged: number;
  waterLitres: number;
  sleepHours: number;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AppContextValue {
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;

  setUser: (user: User | null) => void;
  setPaymentPending: () => void;
  checkPremiumStatus: () => Promise<void>;
  coachProfile: CoachProfile;

  workouts: WorkoutEntry[];
  addWorkout: (workout: Omit<WorkoutEntry, "id">) => void;
  removeWorkout: (id: string) => void;

  meals: MealEntry[];
  addMeal: (meal: Omit<MealEntry, "id">) => void;
  removeMeal: (id: string) => void;

  waterEntries: WaterEntry[];
  addWaterEntry: (date: string, litres: number) => void;
  getTodayWater: () => number;

  sleepEntries: SleepEntry[];
  addSleepEntry: (entry: Omit<SleepEntry, "id">) => void;

  weightEntries: WeightEntry[];
  addWeightEntry: (kg: number) => void;

  hasOnboarded: boolean;
  completeOnboarding: () => void;

  challengeStartDate: string | null;
  startChallenge: () => void;
  getChallengeDay: () => number;

  completedChallengeDays: number[];
  markDayComplete: (day: number) => void;

  clients: Client[];

  getTodaySummary: () => DaySummary;
  getWeekSummary: () => DaySummary[];

  isLoading: boolean;
}

const defaultGoals = {
  calories: 400,
  water: 2.5,
  sleep: 8,
  workouts: 5,
};

const DEMO_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Sofia Martinez",
    email: "sofia@example.com",
    joinDate: "2025-01-15",
    weight: 62,
    notes: "Focus on strength training. Avoid high impact due to knee issues.",
  },
  {
    id: "c2",
    name: "Emma Thompson",
    email: "emma@example.com",
    joinDate: "2025-02-01",
    weight: 70,
    notes: "Working on weight loss. Great consistency with cardio.",
  },
  {
    id: "c3",
    name: "Ava Johnson",
    email: "ava@example.com",
    joinDate: "2025-02-20",
    weight: 58,
    notes: "Athletic background. Training for 10k run.",
  },
  {
    id: "c4",
    name: "Isabella Brown",
    email: "isabella@example.com",
    joinDate: "2025-03-05",
    weight: 65,
  },
];

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
};

const SEED_WORKOUTS: WorkoutEntry[] = [
  { id: "w1", date: today(), type: "hiit", duration: 30, calories: 320, notes: "Morning HIIT circuit" },
  { id: "w2", date: daysAgo(1), type: "strength", duration: 45, calories: 280 },
  { id: "w3", date: daysAgo(2), type: "jogging", duration: 35, calories: 339, notes: "Evening jog" },
  { id: "w4", date: daysAgo(3), type: "walking", duration: 45, calories: 149, notes: "Morning walk" },
  { id: "w5", date: daysAgo(5), type: "cycling", duration: 50, calories: 400 },
];

const SEED_MEALS: MealEntry[] = [
  { id: "m1", date: today(), category: "breakfast", name: "Oatmeal with berries", calories: 320 },
  { id: "m2", date: today(), category: "lunch", name: "Grilled chicken salad", calories: 450 },
  { id: "m3", date: daysAgo(1), category: "breakfast", name: "Avocado toast", calories: 380 },
  { id: "m4", date: daysAgo(1), category: "lunch", name: "Quinoa bowl", calories: 520 },
  { id: "m5", date: daysAgo(1), category: "dinner", name: "Salmon with veggies", calories: 580 },
];

const SEED_WATER: WaterEntry[] = [
  { id: "wt1", date: today(), litres: 1.25 },
  { id: "wt2", date: daysAgo(1), litres: 2.0 },
  { id: "wt3", date: daysAgo(2), litres: 1.75 },
  { id: "wt4", date: daysAgo(3), litres: 1.5 },
];

const SEED_SLEEP: SleepEntry[] = [
  { id: "sl1", date: today(), hours: 7.5, quality: "good" },
  { id: "sl2", date: daysAgo(1), hours: 8, quality: "excellent" },
  { id: "sl3", date: daysAgo(2), hours: 6.5, quality: "fair" },
  { id: "sl4", date: daysAgo(3), hours: 7, quality: "good" },
  { id: "sl5", date: daysAgo(4), hours: 9, quality: "excellent" },
];

const SEED_WEIGHTS: WeightEntry[] = [
  { date: daysAgo(30), kg: 67.2 },
  { date: daysAgo(21), kg: 66.5 },
  { date: daysAgo(14), kg: 65.8 },
  { date: daysAgo(7), kg: 65.1 },
  { date: daysAgo(1), kg: 64.6 },
];

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(SEED_WORKOUTS);
  const [meals, setMeals] = useState<MealEntry[]>(SEED_MEALS);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>(SEED_WATER);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>(SEED_SLEEP);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(SEED_WEIGHTS);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(null);
  const [completedChallengeDays, setCompletedChallengeDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coachProfile, setCoachProfile] = useState<CoachProfile>(DEFAULT_COACH);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  useEffect(() => {
    loadData();
    fetchCoachProfile();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const ok = await restoreSession(token);
        if (!ok) {
          await AsyncStorage.removeItem("authToken");
        }
      }

      const savedWorkouts = await AsyncStorage.getItem("workouts");
      if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
      const savedMeals = await AsyncStorage.getItem("meals");
      if (savedMeals) setMeals(JSON.parse(savedMeals));
      const savedWater = await AsyncStorage.getItem("waterEntries");
      if (savedWater) setWaterEntries(JSON.parse(savedWater));
      const savedSleep = await AsyncStorage.getItem("sleepEntries");
      if (savedSleep) setSleepEntries(JSON.parse(savedSleep));
      const savedWeight = await AsyncStorage.getItem("weightEntries");
      if (savedWeight) setWeightEntries(JSON.parse(savedWeight));
      const savedOnboarded = await AsyncStorage.getItem("hasOnboarded");
      if (savedOnboarded === "true") setHasOnboarded(true);
      const savedChallenge = await AsyncStorage.getItem("challengeStartDate");
      if (savedChallenge) setChallengeStartDate(savedChallenge);
      const savedCompletedDays = await AsyncStorage.getItem("completedChallengeDays");
      if (savedCompletedDays) setCompletedChallengeDays(JSON.parse(savedCompletedDays));
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const restoreSession = async (token: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return false;
      const data = await res.json();
      if (data.user) {
        setUserState(data.user as User);
        setAuthToken(token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error ?? "Login failed." };
        setUserState(data.user as User);
        setAuthToken(data.token);
        await AsyncStorage.setItem("authToken", data.token);
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Check your connection." };
      }
    },
    [API_BASE_URL]
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error ?? "Registration failed." };
        setUserState(data.user as User);
        setAuthToken(data.token);
        await AsyncStorage.setItem("authToken", data.token);
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Check your connection." };
      }
    },
    [API_BASE_URL]
  );

  const logout = useCallback(async () => {
    setUserState(null);
    setAuthToken(null);
    setHasOnboarded(false);
    await AsyncStorage.multiRemove(["authToken", "hasOnboarded", "challengeStartDate"]);
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const setPaymentPending = useCallback(() => {
    setUserState((prev) => {
      if (!prev) return prev;
      return { ...prev, paymentStatus: "pending" as const };
    });
  }, []);

  const fetchCoachProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/coach`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.coach?.name) setCoachProfile(data.coach as CoachProfile);
    } catch {
      // keep default
    }
  };

  const checkPremiumStatus = useCallback(async () => {
    if (!user?.id || !authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/status/${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "approved") {
        setUserState((prev) => prev ? { ...prev, isPremium: true, paymentStatus: "approved" as const } : prev);
      } else if (data.status === "pending") {
        setUserState((prev) => prev ? { ...prev, paymentStatus: "pending" as const } : prev);
      }
    } catch {
      // ignore
    }
  }, [user?.id, authToken, API_BASE_URL]);

  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appStateRef.current !== "active" && nextState === "active") {
        checkPremiumStatus();
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [checkPremiumStatus]);

  const addWorkout = useCallback(
    async (workout: Omit<WorkoutEntry, "id">) => {
      const entry: WorkoutEntry = { ...workout, id: generateId() };
      const updated = [entry, ...workouts];
      setWorkouts(updated);
      await AsyncStorage.setItem("workouts", JSON.stringify(updated));
    },
    [workouts]
  );

  const removeWorkout = useCallback(
    async (id: string) => {
      const updated = workouts.filter((w) => w.id !== id);
      setWorkouts(updated);
      await AsyncStorage.setItem("workouts", JSON.stringify(updated));
    },
    [workouts]
  );

  const addMeal = useCallback(
    async (meal: Omit<MealEntry, "id">) => {
      const entry: MealEntry = { ...meal, id: generateId() };
      const updated = [entry, ...meals];
      setMeals(updated);
      await AsyncStorage.setItem("meals", JSON.stringify(updated));
    },
    [meals]
  );

  const removeMeal = useCallback(
    async (id: string) => {
      const updated = meals.filter((m) => m.id !== id);
      setMeals(updated);
      await AsyncStorage.setItem("meals", JSON.stringify(updated));
    },
    [meals]
  );

  const addWaterEntry = useCallback(
    async (date: string, litres: number) => {
      const existing = waterEntries.find((w) => w.date === date);
      let updated: WaterEntry[];
      if (existing) {
        updated = waterEntries.map((w) => (w.date === date ? { ...w, litres } : w));
      } else {
        updated = [{ id: generateId(), date, litres }, ...waterEntries];
      }
      setWaterEntries(updated);
      await AsyncStorage.setItem("waterEntries", JSON.stringify(updated));
    },
    [waterEntries]
  );

  const getTodayWater = useCallback(() => {
    const entry = waterEntries.find((w) => w.date === today());
    return entry?.litres ?? 0;
  }, [waterEntries]);

  const addSleepEntry = useCallback(
    async (entry: Omit<SleepEntry, "id">) => {
      const existing = sleepEntries.find((s) => s.date === entry.date);
      let updated: SleepEntry[];
      if (existing) {
        updated = sleepEntries.map((s) =>
          s.date === entry.date ? { ...s, ...entry, id: s.id } : s
        );
      } else {
        updated = [{ ...entry, id: generateId() }, ...sleepEntries];
      }
      setSleepEntries(updated);
      await AsyncStorage.setItem("sleepEntries", JSON.stringify(updated));
    },
    [sleepEntries]
  );

  const addWeightEntry = useCallback(
    async (kg: number) => {
      const t = today();
      const existing = weightEntries.find((w) => w.date === t);
      let updated: WeightEntry[];
      if (existing) {
        updated = weightEntries.map((w) => (w.date === t ? { ...w, kg } : w));
      } else {
        updated = [...weightEntries, { date: t, kg }];
      }
      setWeightEntries(updated);
      await AsyncStorage.setItem("weightEntries", JSON.stringify(updated));
    },
    [weightEntries]
  );

  const completeOnboarding = useCallback(async () => {
    setHasOnboarded(true);
    await AsyncStorage.setItem("hasOnboarded", "true");
  }, []);

  const startChallenge = useCallback(async () => {
    const t = today();
    setChallengeStartDate(t);
    await AsyncStorage.setItem("challengeStartDate", t);
  }, []);

  const markDayComplete = useCallback(
    async (day: number) => {
      if (completedChallengeDays.includes(day)) return;
      const updated = [...completedChallengeDays, day];
      setCompletedChallengeDays(updated);
      await AsyncStorage.setItem("completedChallengeDays", JSON.stringify(updated));
    },
    [completedChallengeDays]
  );

  const getChallengeDay = useCallback(() => {
    if (!challengeStartDate) return 0;
    const start = new Date(challengeStartDate + "T00:00:00").getTime();
    const now = new Date(today() + "T00:00:00").getTime();
    return Math.min(90, Math.max(1, Math.floor((now - start) / 86400000) + 1));
  }, [challengeStartDate]);

  const getTodaySummary = useCallback((): DaySummary => {
    const t = today();
    return {
      date: t,
      caloriesBurned: workouts.filter((w) => w.date === t).reduce((s, w) => s + w.calories, 0),
      mealsLogged: meals.filter((m) => m.date === t).length,
      waterLitres: waterEntries.find((w) => w.date === t)?.litres ?? 0,
      sleepHours: sleepEntries.find((s) => s.date === t)?.hours ?? 0,
    };
  }, [workouts, meals, waterEntries, sleepEntries]);

  const getWeekSummary = useCallback((): DaySummary[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = daysAgo(6 - i);
      return {
        date: d,
        caloriesBurned: workouts.filter((w) => w.date === d).reduce((s, w) => s + w.calories, 0),
        mealsLogged: meals.filter((m) => m.date === d).length,
        waterLitres: waterEntries.find((w) => w.date === d)?.litres ?? 0,
        sleepHours: sleepEntries.find((s) => s.date === d)?.hours ?? 0,
      };
    });
  }, [workouts, meals, waterEntries, sleepEntries]);

  return (
    <AppContext.Provider
      value={{
        user,
        authToken,
        isAuthenticated: !!user && !!authToken,
        login,
        register,
        logout,
        setUser,
        setPaymentPending,
        checkPremiumStatus,
        coachProfile,
        workouts, addWorkout, removeWorkout,
        meals, addMeal, removeMeal,
        waterEntries, addWaterEntry, getTodayWater,
        sleepEntries, addSleepEntry,
        weightEntries, addWeightEntry,
        hasOnboarded, completeOnboarding,
        challengeStartDate, startChallenge, getChallengeDay,
        completedChallengeDays, markDayComplete,
        clients: DEMO_CLIENTS,
        getTodaySummary, getWeekSummary,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useGoals() {
  return defaultGoals;
}
