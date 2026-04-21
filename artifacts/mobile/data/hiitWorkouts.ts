export type GuidedWorkoutCategory = "hiit" | "cardio" | "strength" | "jogging" | "yoga";

export interface GuidedWorkout {
  id: string;
  category: GuidedWorkoutCategory;
  title: string;
  duration: string;
  durationMinutes: number;
  videoUrl: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  calories: string;
  estimatedCalories: number;
  instructions: string[];
}

export const ALL_GUIDED_WORKOUTS: GuidedWorkout[] = [
  // ── HIIT ──────────────────────────────────────────────────────────────
  {
    id: "hiit-belly-blast",
    category: "hiit",
    title: "Belly Fat Blast HIIT",
    duration: "20 min",
    durationMinutes: 20,
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    level: "Beginner",
    calories: "180–220 kcal",
    estimatedCalories: 200,
    instructions: [
      "Warm up for 2 minutes with light marching in place",
      "Work at 20 seconds on, 10 seconds rest per move",
      "Complete 4 full rounds of the circuit",
      "Keep your core braced — imagine pulling your navel to your spine",
      "Land softly on every jump to protect your joints",
      "Cool down with 2 minutes of deep stretching",
    ],
  },
  {
    id: "hiit-core-fire",
    category: "hiit",
    title: "Core Fire — Abs & Obliques",
    duration: "15 min",
    durationMinutes: 15,
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    level: "Intermediate",
    calories: "140–170 kcal",
    estimatedCalories: 155,
    instructions: [
      "Start with a 90-second dynamic warm-up (arm circles + hip circles)",
      "Alternate between upper-abs and oblique-focused moves",
      "30 seconds work, 15 seconds rest per exercise",
      "Keep lower back pressed into the mat during floor moves",
      "Breathe out on the exertion phase of every rep",
      "Finish with a 90-second child's pose and cat-cow stretch",
    ],
  },
  {
    id: "hiit-full-body",
    category: "hiit",
    title: "Full Body Shred",
    duration: "30 min",
    durationMinutes: 30,
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    level: "Advanced",
    calories: "280–340 kcal",
    estimatedCalories: 310,
    instructions: [
      "Warm up for 3 minutes — jog in place, high knees, arm swings",
      "Work in 40-second blocks with 20 seconds rest",
      "Combine lower body, upper body, and core exercises each round",
      "Maintain proper form — reduce intensity before breaking form",
      "Hydrate between rounds as needed",
      "Cool down with 3 full minutes of static stretches",
    ],
  },

  // ── CARDIO ────────────────────────────────────────────────────────────
  {
    id: "cardio-low-impact",
    category: "cardio",
    title: "Low Impact Cardio",
    duration: "25 min",
    durationMinutes: 25,
    videoUrl: "https://www.youtube.com/watch?v=UBMk30rjy0o",
    level: "Beginner",
    calories: "160–200 kcal",
    estimatedCalories: 180,
    instructions: [
      "March in place for 2 minutes to raise your heart rate gently",
      "All moves are low-impact — keep at least one foot on the ground",
      "Pump your arms with each step to boost calorie burn",
      "Aim for a pace where you can still hold a short conversation",
      "Rest for 30 seconds if you feel dizzy or overly breathless",
      "Finish with 2 minutes of slow walking and calf stretches",
    ],
  },
  {
    id: "cardio-fat-burn",
    category: "cardio",
    title: "Fat Burn Cardio",
    duration: "35 min",
    durationMinutes: 35,
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    level: "Intermediate",
    calories: "260–320 kcal",
    estimatedCalories: 290,
    instructions: [
      "5-minute warm-up: slow marching → knee lifts → side steps",
      "Work in 3-minute cardio bursts followed by 1-minute active recovery",
      "Include moves like jumping jacks, skaters, and butt kicks",
      "Keep heart rate in the 60–75% maximum range for fat burning",
      "Sip water every 10 minutes to stay hydrated",
      "Cool down with 4 minutes of walking and full-body stretches",
    ],
  },

  // ── STRENGTH ──────────────────────────────────────────────────────────
  {
    id: "strength-full-body",
    category: "strength",
    title: "Full Body Strength (No Equipment)",
    duration: "30 min",
    durationMinutes: 30,
    videoUrl: "https://www.youtube.com/watch?v=UItWltVZZmE",
    level: "Intermediate",
    calories: "200–250 kcal",
    estimatedCalories: 225,
    instructions: [
      "Warm up with 5 minutes of light cardio and dynamic stretches",
      "Perform 3 sets of 12 reps for each exercise",
      "Rest 45–60 seconds between sets to allow muscle recovery",
      "Focus on slow, controlled movements — avoid momentum",
      "Engage your core on every single exercise",
      "Cool down with 3 minutes of static stretching targeting worked muscles",
    ],
  },
  {
    id: "strength-core",
    category: "strength",
    title: "Core Strength Workout",
    duration: "20 min",
    durationMinutes: 20,
    videoUrl: "https://www.youtube.com/watch?v=2pLT-olgUJs",
    level: "Beginner",
    calories: "120–150 kcal",
    estimatedCalories: 135,
    instructions: [
      "Begin with a 2-minute cat-cow and pelvic tilt warm-up",
      "Work through planks, dead bugs, bird dogs, and glute bridges",
      "Hold each isometric position for 20–30 seconds",
      "Keep your lower back neutral — never let it arch excessively",
      "Breathe steadily throughout; never hold your breath",
      "End with 90 seconds of child's pose to release tension",
    ],
  },

  // ── JOGGING ───────────────────────────────────────────────────────────
  {
    id: "jogging-beginner",
    category: "jogging",
    title: "Beginner Running Guide",
    duration: "20 min",
    durationMinutes: 20,
    videoUrl: "https://www.youtube.com/watch?v=_kGESn8ArrU",
    level: "Beginner",
    calories: "140–180 kcal",
    estimatedCalories: 160,
    instructions: [
      "Start with a 3-minute brisk walk to warm up your legs and joints",
      "Run for 1 minute, walk for 2 minutes — repeat 5 times",
      "Land midfoot, not on your heel, to reduce impact",
      "Keep shoulders relaxed and arms swinging forward (not across)",
      "Slow down rather than stop if you need a break",
      "Finish with a 3-minute cool-down walk and hip-flexor stretches",
    ],
  },
  {
    id: "jogging-warmup",
    category: "jogging",
    title: "Warm-Up Before Running",
    duration: "10 min",
    durationMinutes: 10,
    videoUrl: "https://www.youtube.com/watch?v=sfF4f-QGRn8",
    level: "Beginner",
    calories: "60–80 kcal",
    estimatedCalories: 70,
    instructions: [
      "Leg swings: 10 forward/back each leg to open hip flexors",
      "Ankle circles: 10 each direction to mobilise joints",
      "High knees: 30 seconds to activate your core and hip flexors",
      "Butt kicks: 30 seconds to warm up your hamstrings",
      "Slow 2-minute jog to bring heart rate up gradually",
      "Dynamic calf raises: 15 reps each side before your main run",
    ],
  },

  // ── YOGA ──────────────────────────────────────────────────────────────
  {
    id: "yoga-morning-flow",
    category: "yoga",
    title: "Morning Yoga Flow",
    duration: "20 min",
    durationMinutes: 20,
    videoUrl: "https://www.youtube.com/watch?v=v7AYKMP6rOE",
    level: "Beginner",
    calories: "60–80 kcal",
    estimatedCalories: 70,
    instructions: [
      "Begin in child's pose — breathe deeply for 5 full breaths",
      "Flow through cat-cow 8 times, syncing breath with movement",
      "Move into downward dog, pedalling heels to wake up the legs",
      "Sun salutation A × 3 rounds at a slow, mindful pace",
      "Hold warrior I and warrior II for 5 breaths each side",
      "Close with a 3-minute savasana — relax completely and breathe",
    ],
  },
  {
    id: "yoga-relax-stretch",
    category: "yoga",
    title: "Relax & Stretch Yoga",
    duration: "15 min",
    durationMinutes: 15,
    videoUrl: "https://www.youtube.com/watch?v=4pKly2JojMw",
    level: "Beginner",
    calories: "40–60 kcal",
    estimatedCalories: 50,
    instructions: [
      "Sit cross-legged, close your eyes, and take 5 slow deep breaths",
      "Seated forward fold: reach for your toes, hold 30 seconds",
      "Supine twist: knees to one side, look the opposite way — 30 s each",
      "Reclined butterfly: soles of feet together, knees fall open",
      "Figure-four stretch: cross one ankle over the opposite knee — 30 s",
      "End in savasana for 2–3 minutes, letting your body fully release",
    ],
  },
];

export function getWorkoutsByCategory(category: GuidedWorkoutCategory): GuidedWorkout[] {
  return ALL_GUIDED_WORKOUTS.filter((w) => w.category === category);
}

export function findWorkoutById(id: string): GuidedWorkout | undefined {
  return ALL_GUIDED_WORKOUTS.find((w) => w.id === id);
}

export const CATEGORY_LABEL: Record<GuidedWorkoutCategory, string> = {
  hiit:     "HIIT",
  cardio:   "Cardio",
  strength: "Strength",
  jogging:  "Jogging",
  yoga:     "Yoga",
};

export const CATEGORY_ICON: Record<GuidedWorkoutCategory, string> = {
  hiit:     "trending-up",
  cardio:   "heart",
  strength: "zap",
  jogging:  "activity",
  yoga:     "wind",
};

export const CATEGORY_COLOR: Record<GuidedWorkoutCategory, string> = {
  hiit:     "#FF8FAB",
  cardio:   "#FF6B6B",
  strength: "#9B5DE5",
  jogging:  "#FF8C42",
  yoga:     "#38BDF8",
};

export const GUIDED_CATEGORIES: GuidedWorkoutCategory[] = [
  "hiit", "cardio", "strength", "jogging", "yoga",
];

export type { GuidedWorkout as HiitWorkout };
export const HIIT_WORKOUTS = getWorkoutsByCategory("hiit");
