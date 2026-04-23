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

export type UserRole = "client" | "coach" | "admin";

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
  isPremium?: boolean;
  paymentStatus?: string;
  weight?: number;
  notes?: string;
}

export interface DaySummary {
  date: string;
  caloriesBurned: number;
  caloriesConsumed: number;
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
  updateProfile: (name: string, email?: string) => Promise<AuthResult>;
  setPaymentPending: () => void;
  checkPremiumStatus: () => Promise<void>;
  coachProfile: CoachProfile;

  workouts: WorkoutEntry[];
  addWorkout: (workout: Omit<WorkoutEntry, "id">) => Promise<void>;
  removeWorkout: (id: string) => Promise<void>;

  meals: MealEntry[];
  addMeal: (meal: Omit<MealEntry, "id">) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;

  waterEntries: WaterEntry[];
  addWaterEntry: (date: string, litres: number) => Promise<void>;
  getTodayWater: () => number;

  sleepEntries: SleepEntry[];
  addSleepEntry: (entry: Omit<SleepEntry, "id">) => Promise<void>;

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
  clientsLoading: boolean;
  clientsError: string | null;
  refreshClients: () => Promise<void>;

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

function localKeys(uid: string) {
  return {
    weight: `${uid}_weightEntries`,
    onboarded: `${uid}_hasOnboarded`,
    challengeStart: `${uid}_challengeStartDate`,
    completedDays: `${uid}_completedChallengeDays`,
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(null);
  const [completedChallengeDays, setCompletedChallengeDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coachProfile, setCoachProfile] = useState<CoachProfile>(DEFAULT_COACH);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  useEffect(() => {
    loadData();
    fetchCoachProfile();
  }, []);

  // ── helpers ────────────────────────────────────────────────────────────────

  function authHeaders() {
    return { Authorization: `Bearer ${tokenRef.current}`, "Content-Type": "application/json" };
  }

  async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api${path}`, {
        ...options,
        headers: { ...authHeaders(), ...(options?.headers ?? {}) },
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  // ── load API activity data ─────────────────────────────────────────────────

  const fetchActivityData = useCallback(async () => {
    const [w, m, wa, sl] = await Promise.all([
      apiFetch<{ workouts: WorkoutEntry[] }>("/workouts"),
      apiFetch<{ meals: MealEntry[] }>("/meals"),
      apiFetch<{ waterEntries: WaterEntry[] }>("/water"),
      apiFetch<{ sleepEntries: SleepEntry[] }>("/sleep"),
    ]);
    if (w?.workouts) setWorkouts(w.workouts);
    if (m?.meals) setMeals(m.meals);
    if (wa?.waterEntries) setWaterEntries(wa.waterEntries);
    if (sl?.sleepEntries) setSleepEntries(sl.sleepEntries);
  }, []);

  // ── load local-only data (weight, prefs) ──────────────────────────────────

  const loadLocalData = useCallback(async (uid: string) => {
    try {
      const k = localKeys(uid);
      const pairs = await AsyncStorage.multiGet([k.weight, k.onboarded, k.challengeStart, k.completedDays]);
      const map = Object.fromEntries(pairs.map(([key, val]) => [key, val]));
      setWeightEntries(map[k.weight] ? JSON.parse(map[k.weight]!) : []);
      setHasOnboarded(map[k.onboarded] === "true");
      setChallengeStartDate(map[k.challengeStart] ?? null);
      setCompletedChallengeDays(map[k.completedDays] ? JSON.parse(map[k.completedDays]!) : []);
    } catch {
      // leave defaults
    }
  }, []);

  const clearUserData = useCallback(() => {
    setWorkouts([]);
    setMeals([]);
    setWaterEntries([]);
    setSleepEntries([]);
    setWeightEntries([]);
    setHasOnboarded(false);
    setChallengeStartDate(null);
    setCompletedChallengeDays([]);
    setClients([]);
    setClientsLoading(false);
    setClientsError(null);
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        tokenRef.current = token;
        const uid = await restoreSession(token);
        if (uid) {
          userIdRef.current = uid;
          await Promise.all([loadLocalData(uid), fetchActivityData(), fetchClients()]);
        } else {
          tokenRef.current = null;
          await AsyncStorage.removeItem("authToken");
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const restoreSession = async (token: string): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.user) {
        setUserState(data.user as User);
        setAuthToken(token);
        return data.user.id as string;
      }
      return null;
    } catch {
      return null;
    }
  };

  // ── auth ──────────────────────────────────────────────────────────────────

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
        const loggedInUser = data.user as User;
        clearUserData();
        setUserState(loggedInUser);
        setAuthToken(data.token);
        tokenRef.current = data.token;
        userIdRef.current = loggedInUser.id;
        await AsyncStorage.setItem("authToken", data.token);
        await Promise.all([loadLocalData(loggedInUser.id), fetchActivityData(), fetchClients()]);
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Check your connection." };
      }
    },
    [API_BASE_URL, clearUserData, loadLocalData, fetchActivityData, fetchClients]
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
        const newUser = data.user as User;
        clearUserData();
        setUserState(newUser);
        setAuthToken(data.token);
        tokenRef.current = data.token;
        userIdRef.current = newUser.id;
        await AsyncStorage.setItem("authToken", data.token);
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Check your connection." };
      }
    },
    [API_BASE_URL, clearUserData]
  );

  const logout = useCallback(async () => {
    const uid = userIdRef.current;
    userIdRef.current = null;
    tokenRef.current = null;
    setUserState(null);
    setAuthToken(null);
    clearUserData();
    const keysToRemove = ["authToken"];
    if (uid) {
      const k = localKeys(uid);
      keysToRemove.push(k.onboarded, k.challengeStart);
    }
    await AsyncStorage.multiRemove(keysToRemove);
  }, [clearUserData]);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const setPaymentPending = useCallback(() => {
    setUserState((prev) => {
      if (!prev) return prev;
      return { ...prev, paymentStatus: "pending" as const };
    });
  }, []);

  const updateProfile = useCallback(async (name: string, email?: string): Promise<AuthResult> => {
    try {
      const body: Record<string, string> = { name };
      if (email) body.email = email;
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error ?? "Failed to update profile." };
      setUserState(data.user as User);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, [API_BASE_URL]);

  const fetchClients = useCallback(async () => {
    if (!tokenRef.current) return;
    setClientsLoading(true);
    setClientsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/clients`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
        cache: "no-store",
      });
      if (res.status === 403) {
        // Not an admin/coach — silently skip
        setClientsLoading(false);
        return;
      }
      if (!res.ok) {
        setClientsError("Could not load clients. Pull to refresh.");
        setClientsLoading(false);
        return;
      }
      const data = await res.json();
      setClients(Array.isArray(data?.clients) ? (data.clients as Client[]) : []);
    } catch {
      setClientsError("Network error. Pull to refresh.");
    } finally {
      setClientsLoading(false);
    }
  }, [API_BASE_URL]);

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
        if (tokenRef.current) {
          fetchActivityData();
          fetchClients();
        }
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [checkPremiumStatus, fetchActivityData, fetchClients]);

  // ── workouts ──────────────────────────────────────────────────────────────

  const addWorkout = useCallback(async (workout: Omit<WorkoutEntry, "id">) => {
    const tempId = generateId();
    const optimistic: WorkoutEntry = { ...workout, id: tempId };
    setWorkouts((prev) => [optimistic, ...prev]);
    const data = await apiFetch<{ workout: WorkoutEntry }>("/workouts", {
      method: "POST",
      body: JSON.stringify(workout),
    });
    if (data?.workout) {
      setWorkouts((prev) => prev.map((w) => w.id === tempId ? data.workout : w));
    }
  }, []);

  const removeWorkout = useCallback(async (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    await apiFetch(`/workouts/${id}`, { method: "DELETE" });
  }, []);

  // ── meals ─────────────────────────────────────────────────────────────────

  const addMeal = useCallback(async (meal: Omit<MealEntry, "id">) => {
    const tempId = generateId();
    const optimistic: MealEntry = { ...meal, id: tempId };
    setMeals((prev) => [optimistic, ...prev]);
    const data = await apiFetch<{ meal: MealEntry }>("/meals", {
      method: "POST",
      body: JSON.stringify(meal),
    });
    if (data?.meal) {
      setMeals((prev) => prev.map((m) => m.id === tempId ? data.meal : m));
    }
  }, []);

  const removeMeal = useCallback(async (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    await apiFetch(`/meals/${id}`, { method: "DELETE" });
  }, []);

  // ── water ─────────────────────────────────────────────────────────────────

  const addWaterEntry = useCallback(async (date: string, litres: number) => {
    // Optimistic: accumulate locally
    setWaterEntries((prev) => {
      const existing = prev.find((w) => w.date === date);
      if (existing) {
        const newTotal = Math.round((existing.litres + litres) * 100) / 100;
        return prev.map((w) => w.date === date ? { ...w, litres: newTotal } : w);
      }
      return [{ id: generateId(), date, litres }, ...prev];
    });
    // Persist — server accumulates the same way
    const data = await apiFetch<{ waterEntry: WaterEntry }>("/water", {
      method: "POST",
      body: JSON.stringify({ date, litres }),
    });
    // Reconcile with server value
    if (data?.waterEntry) {
      setWaterEntries((prev) =>
        prev.map((w) => w.date === date ? { ...data.waterEntry } : w)
      );
    }
  }, []);

  const getTodayWater = useCallback(() => {
    const entry = waterEntries.find((w) => w.date === today());
    return entry?.litres ?? 0;
  }, [waterEntries]);

  // ── sleep ─────────────────────────────────────────────────────────────────

  const addSleepEntry = useCallback(async (entry: Omit<SleepEntry, "id">) => {
    // Optimistic: upsert locally
    setSleepEntries((prev) => {
      const existing = prev.find((s) => s.date === entry.date);
      if (existing) {
        return prev.map((s) => s.date === entry.date ? { ...s, ...entry } : s);
      }
      return [{ ...entry, id: generateId() }, ...prev];
    });
    const data = await apiFetch<{ sleepEntry: SleepEntry }>("/sleep", {
      method: "POST",
      body: JSON.stringify(entry),
    });
    if (data?.sleepEntry) {
      setSleepEntries((prev) =>
        prev.map((s) => s.date === entry.date ? { ...data.sleepEntry } : s)
      );
    }
  }, []);

  // ── weight (local-only — used for personal progress chart) ────────────────

  const addWeightEntry = useCallback(
    async (kg: number) => {
      const uid = userIdRef.current;
      if (!uid) return;
      const t = today();
      const existing = weightEntries.find((w) => w.date === t);
      let updated: WeightEntry[];
      if (existing) {
        updated = weightEntries.map((w) => (w.date === t ? { ...w, kg } : w));
      } else {
        updated = [...weightEntries, { date: t, kg }];
      }
      setWeightEntries(updated);
      await AsyncStorage.setItem(localKeys(uid).weight, JSON.stringify(updated));
    },
    [weightEntries]
  );

  // ── onboarding / challenge ─────────────────────────────────────────────────

  const completeOnboarding = useCallback(async () => {
    const uid = userIdRef.current;
    setHasOnboarded(true);
    if (uid) await AsyncStorage.setItem(localKeys(uid).onboarded, "true");
  }, []);

  const startChallenge = useCallback(async () => {
    const uid = userIdRef.current;
    const t = today();
    setChallengeStartDate(t);
    if (uid) await AsyncStorage.setItem(localKeys(uid).challengeStart, t);
  }, []);

  const markDayComplete = useCallback(
    async (day: number) => {
      const uid = userIdRef.current;
      if (completedChallengeDays.includes(day)) return;
      const updated = [...completedChallengeDays, day];
      setCompletedChallengeDays(updated);
      if (uid) await AsyncStorage.setItem(localKeys(uid).completedDays, JSON.stringify(updated));
    },
    [completedChallengeDays]
  );

  const getChallengeDay = useCallback(() => {
    if (!challengeStartDate) return 0;
    const start = new Date(challengeStartDate + "T00:00:00").getTime();
    const now = new Date(today() + "T00:00:00").getTime();
    return Math.min(90, Math.max(1, Math.floor((now - start) / 86400000) + 1));
  }, [challengeStartDate]);

  // ── summaries ─────────────────────────────────────────────────────────────

  const getTodaySummary = useCallback((): DaySummary => {
    const t = today();
    const todayMeals = meals.filter((m) => m.date === t);
    return {
      date: t,
      caloriesBurned: workouts.filter((w) => w.date === t).reduce((s, w) => s + w.calories, 0),
      caloriesConsumed: todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0),
      mealsLogged: todayMeals.length,
      waterLitres: waterEntries.find((w) => w.date === t)?.litres ?? 0,
      sleepHours: sleepEntries.find((s) => s.date === t)?.hours ?? 0,
    };
  }, [workouts, meals, waterEntries, sleepEntries]);

  const getWeekSummary = useCallback((): DaySummary[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = daysAgo(6 - i);
      const dayMeals = meals.filter((m) => m.date === d);
      return {
        date: d,
        caloriesBurned: workouts.filter((w) => w.date === d).reduce((s, w) => s + w.calories, 0),
        caloriesConsumed: dayMeals.reduce((s, m) => s + (m.calories ?? 0), 0),
        mealsLogged: dayMeals.length,
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
        updateProfile,
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
        clients,
        clientsLoading,
        clientsError,
        refreshClients: fetchClients,
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
