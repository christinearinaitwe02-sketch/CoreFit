export type ChallengeWorkoutType =
  | "walking"
  | "jogging"
  | "cardio"
  | "hiit"
  | "strength"
  | "yoga"
  | "rest";

export interface ChallengeDay {
  day: number;
  phase: 1 | 2 | 3;
  workoutType: ChallengeWorkoutType;
  duration: number;
  videoId?: string;
  motivation: string;
}

type DayBlueprint = [ChallengeWorkoutType, number, string?, string?];

const PHASE1_MOTIVATIONS = [
  "Every journey begins with a single step. You've taken yours.",
  "You showed up today — that's the hardest part. Well done.",
  "Small moves, done consistently, create massive change.",
  "Rest is not quitting. Rest is preparing to win.",
  "Your body is learning something new. Be patient with it.",
  "You are stronger than you think. Prove it today.",
  "Day by day you are building a new you. Keep building.",
  "Progress, not perfection. You're doing great.",
  "Momentum is building. Don't stop now.",
  "Your future self is cheering you on from the finish line.",
  "You came back again. That's what champions do.",
  "Halfway through the first phase. You're on fire.",
  "Each rep, each step, each breath — it all counts.",
  "You have energy you haven't discovered yet. Let's find it.",
  "The foundation you're building right now will hold you up forever.",
  "Discipline is choosing your future self over your present comfort.",
  "You are rewriting your story. Write it boldly.",
  "Every drop of sweat is a deposit in your health account.",
  "Your consistency is your superpower. Keep using it.",
  "Rest days refuel the engine. You'll need the power tomorrow.",
  "21 days in — habits are forming. This is real change.",
  "You are becoming the version of yourself you always imagined.",
  "Tough days build tough people. You're getting tougher.",
  "Almost at the end of Phase 1. Your body has already changed.",
  "You've outlasted doubt. The results are coming.",
  "Energy begets energy. The more you move, the more you gain.",
  "Phase 1 is almost done. Look how far you've come.",
  "You didn't give up on Day 5, Day 12, or Day 22. Don't stop now.",
  "Two more days and Phase 1 is yours. Push through.",
  "Phase 1 COMPLETE. You are stronger, fitter, and unstoppable.",
];

const PHASE2_MOTIVATIONS = [
  "Phase 2 begins. The work gets harder. So do you.",
  "Your body is ready for this challenge. Trust your training.",
  "Every session is a victory over the version of you that almost skipped.",
  "Rest is strategic. You're recovering to come back stronger.",
  "Day 34 — you are past the point most people quit. Keep going.",
  "Building is harder than starting. But you're already a builder.",
  "You earned this rest day. Recover well and come back ready.",
  "Midway through Phase 2. The transformation is visible now.",
  "Push a little harder today. Your body knows what to do.",
  "Strength is not just physical. You are building mental iron.",
  "The momentum you have right now is worth protecting. Don't break it.",
  "You run because you can. Many people wish they could. Remember that.",
  "Your lungs are getting stronger. Your heart is getting stronger. You are getting stronger.",
  "Rest day. But keep your mind active — visualise tomorrow's session.",
  "Day 45 — you've completed half the challenge. You are extraordinary.",
  "Every workout this week is a brick in the wall of your transformation.",
  "Soreness means growth. You're growing every single day.",
  "Your clothes are fitting differently. Your walk is different. You are different.",
  "You are not just losing weight. You are finding yourself.",
  "Day 50! Fifty days of showing up. That is warrior-level commitment.",
  "The gap between who you are and who you want to be is closing fast.",
  "Keep the pace. Results compound like interest — they are accelerating.",
  "Phase 2 is almost complete. What you've built here will last a lifetime.",
  "Your body has adapted. Now we push beyond those adaptations.",
  "Two more days of Phase 2. Finish it as strong as you started.",
  "You chose transformation over comfort every single day. That is rare.",
  "The last week of Phase 2. Leave nothing in the tank.",
  "Day 58 — you are elite. Very few people ever make it this far.",
  "One day until Phase 3. You have earned every single step forward.",
  "Phase 2 COMPLETE. You are a completely different person than Day 1.",
];

const PHASE3_MOTIVATIONS = [
  "Phase 3: Transform. This is where champions are made. You are ready.",
  "The final stretch. Everything you've built is about to shine.",
  "Day 62 — 28 days from the finish line. Every session counts double now.",
  "You rest so you can attack. Tomorrow you attack.",
  "You thought about quitting once. You didn't. That decision defines you.",
  "Your transformation is already happening. Keep accelerating it.",
  "10 weeks in. Your DNA is literally different. Science agrees.",
  "Rest today. Dream about Day 90. Then wake up and earn it.",
  "Day 69 — you are in the top 1% of people who attempt a 90-day challenge.",
  "This is the hardest phase. But you are the strongest you've ever been.",
  "The body achieves what the mind believes. Believe in your finish line.",
  "You've earned every bead of sweat. You've earned this transformation.",
  "Day 73 — 17 days to go. You can feel the finish line now.",
  "Rest is your weapon. Wield it wisely.",
  "Day 75 — three quarters done. The last quarter separates legends.",
  "Your belly is flatter. Your core is stronger. Your confidence is unshakeable.",
  "Push like Day 77 is Day 1. Fresh energy, veteran discipline.",
  "Every great story has a hard middle. You're writing your final chapter now.",
  "Day 79 — 11 days. You've come too far to slow down now.",
  "You didn't just work out today. You became a better version of yourself.",
  "10 days remain. Make each one count like it's your last chance.",
  "The version of you starting Day 1 would be speechless looking at you now.",
  "Day 83 — your body is a machine now. Run it at full power.",
  "One week left. Seven days to cement your transformation forever.",
  "Day 85 — five days. Five sessions between you and a new life.",
  "The final week. Everything you've sacrificed led to this. Don't waste it.",
  "Day 87 — three days. Your mind and body have never been more aligned.",
  "Two days to the finish line. You are not the same person who started.",
  "Day 89 — tomorrow is the day. Sleep well. Dream of crossing the finish line.",
  "Day 90. YOU DID IT. 90 days of courage, commitment, and transformation. You are CoreHer.",
];

const PHASE1_DAYS: DayBlueprint[] = [
  ["walking",  20, undefined,         PHASE1_MOTIVATIONS[0]],
  ["yoga",     20, "yoga-morning-flow",PHASE1_MOTIVATIONS[1]],
  ["walking",  25, undefined,         PHASE1_MOTIVATIONS[2]],
  ["rest",      0, undefined,         PHASE1_MOTIVATIONS[3]],
  ["cardio",   25, "cardio-low-impact",PHASE1_MOTIVATIONS[4]],
  ["yoga",     20, "yoga-relax-stretch",PHASE1_MOTIVATIONS[5]],
  ["walking",  25, undefined,         PHASE1_MOTIVATIONS[6]],
  ["cardio",   25, "cardio-low-impact",PHASE1_MOTIVATIONS[7]],
  ["walking",  25, undefined,         PHASE1_MOTIVATIONS[8]],
  ["yoga",     20, "yoga-morning-flow",PHASE1_MOTIVATIONS[9]],
  ["cardio",   25, "cardio-low-impact",PHASE1_MOTIVATIONS[10]],
  ["rest",      0, undefined,         PHASE1_MOTIVATIONS[11]],
  ["walking",  30, undefined,         PHASE1_MOTIVATIONS[12]],
  ["yoga",     20, "yoga-relax-stretch",PHASE1_MOTIVATIONS[13]],
  ["hiit",     20, "hiit-belly-blast",PHASE1_MOTIVATIONS[14]],
  ["walking",  30, undefined,         PHASE1_MOTIVATIONS[15]],
  ["cardio",   25, "cardio-low-impact",PHASE1_MOTIVATIONS[16]],
  ["yoga",     20, "yoga-morning-flow",PHASE1_MOTIVATIONS[17]],
  ["rest",      0, undefined,         PHASE1_MOTIVATIONS[18]],
  ["hiit",     20, "hiit-belly-blast",PHASE1_MOTIVATIONS[19]],
  ["walking",  30, undefined,         PHASE1_MOTIVATIONS[20]],
  ["cardio",   30, "cardio-low-impact",PHASE1_MOTIVATIONS[21]],
  ["hiit",     20, "hiit-belly-blast",PHASE1_MOTIVATIONS[22]],
  ["yoga",     20, "yoga-relax-stretch",PHASE1_MOTIVATIONS[23]],
  ["walking",  30, undefined,         PHASE1_MOTIVATIONS[24]],
  ["cardio",   30, "cardio-low-impact",PHASE1_MOTIVATIONS[25]],
  ["rest",      0, undefined,         PHASE1_MOTIVATIONS[26]],
  ["hiit",     20, "hiit-belly-blast",PHASE1_MOTIVATIONS[27]],
  ["walking",  30, undefined,         PHASE1_MOTIVATIONS[28]],
  ["yoga",     20, "yoga-morning-flow",PHASE1_MOTIVATIONS[29]],
];

const PHASE2_DAYS: DayBlueprint[] = [
  ["strength", 30, "strength-core",   PHASE2_MOTIVATIONS[0]],
  ["cardio",   30, "cardio-low-impact",PHASE2_MOTIVATIONS[1]],
  ["jogging",  20, "jogging-beginner",PHASE2_MOTIVATIONS[2]],
  ["rest",      0, undefined,         PHASE2_MOTIVATIONS[3]],
  ["hiit",     20, "hiit-core-fire",  PHASE2_MOTIVATIONS[4]],
  ["strength", 30, "strength-core",   PHASE2_MOTIVATIONS[5]],
  ["yoga",     20, "yoga-relax-stretch",PHASE2_MOTIVATIONS[6]],
  ["cardio",   35, "cardio-fat-burn", PHASE2_MOTIVATIONS[7]],
  ["jogging",  20, "jogging-beginner",PHASE2_MOTIVATIONS[8]],
  ["strength", 30, "strength-full-body",PHASE2_MOTIVATIONS[9]],
  ["hiit",     20, "hiit-core-fire",  PHASE2_MOTIVATIONS[10]],
  ["rest",      0, undefined,         PHASE2_MOTIVATIONS[11]],
  ["jogging",  25, "jogging-beginner",PHASE2_MOTIVATIONS[12]],
  ["yoga",     20, "yoga-morning-flow",PHASE2_MOTIVATIONS[13]],
  ["hiit",     25, "hiit-core-fire",  PHASE2_MOTIVATIONS[14]],
  ["strength", 30, "strength-full-body",PHASE2_MOTIVATIONS[15]],
  ["cardio",   35, "cardio-fat-burn", PHASE2_MOTIVATIONS[16]],
  ["jogging",  25, "jogging-beginner",PHASE2_MOTIVATIONS[17]],
  ["rest",      0, undefined,         PHASE2_MOTIVATIONS[18]],
  ["hiit",     25, "hiit-core-fire",  PHASE2_MOTIVATIONS[19]],
  ["strength", 30, "strength-full-body",PHASE2_MOTIVATIONS[20]],
  ["cardio",   35, "cardio-fat-burn", PHASE2_MOTIVATIONS[21]],
  ["jogging",  25, "jogging-beginner",PHASE2_MOTIVATIONS[22]],
  ["yoga",     20, "yoga-relax-stretch",PHASE2_MOTIVATIONS[23]],
  ["hiit",     25, "hiit-core-fire",  PHASE2_MOTIVATIONS[24]],
  ["rest",      0, undefined,         PHASE2_MOTIVATIONS[25]],
  ["strength", 30, "strength-full-body",PHASE2_MOTIVATIONS[26]],
  ["cardio",   35, "cardio-fat-burn", PHASE2_MOTIVATIONS[27]],
  ["jogging",  25, "jogging-warmup",  PHASE2_MOTIVATIONS[28]],
  ["hiit",     25, "hiit-core-fire",  PHASE2_MOTIVATIONS[29]],
];

const PHASE3_DAYS: DayBlueprint[] = [
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[0]],
  ["strength", 30, "strength-full-body",PHASE3_MOTIVATIONS[1]],
  ["jogging",  25, "jogging-beginner",PHASE3_MOTIVATIONS[2]],
  ["rest",      0, undefined,         PHASE3_MOTIVATIONS[3]],
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[4]],
  ["cardio",   35, "cardio-fat-burn", PHASE3_MOTIVATIONS[5]],
  ["yoga",     20, "yoga-morning-flow",PHASE3_MOTIVATIONS[6]],
  ["rest",      0, undefined,         PHASE3_MOTIVATIONS[7]],
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[8]],
  ["strength", 30, "strength-full-body",PHASE3_MOTIVATIONS[9]],
  ["cardio",   35, "cardio-fat-burn", PHASE3_MOTIVATIONS[10]],
  ["jogging",  30, "jogging-beginner",PHASE3_MOTIVATIONS[11]],
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[12]],
  ["rest",      0, undefined,         PHASE3_MOTIVATIONS[13]],
  ["strength", 30, "strength-full-body",PHASE3_MOTIVATIONS[14]],
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[15]],
  ["jogging",  30, "jogging-beginner",PHASE3_MOTIVATIONS[16]],
  ["cardio",   35, "cardio-fat-burn", PHASE3_MOTIVATIONS[17]],
  ["rest",      0, undefined,         PHASE3_MOTIVATIONS[18]],
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[19]],
  ["strength", 30, "strength-full-body",PHASE3_MOTIVATIONS[20]],
  ["cardio",   35, "cardio-fat-burn", PHASE3_MOTIVATIONS[21]],
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[22]],
  ["jogging",  30, "jogging-beginner",PHASE3_MOTIVATIONS[23]],
  ["rest",      0, undefined,         PHASE3_MOTIVATIONS[24]],
  ["strength", 30, "strength-full-body",PHASE3_MOTIVATIONS[25]],
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[26]],
  ["cardio",   35, "cardio-fat-burn", PHASE3_MOTIVATIONS[27]],
  ["jogging",  30, "jogging-beginner",PHASE3_MOTIVATIONS[28]],
  ["hiit",     30, "hiit-full-body",  PHASE3_MOTIVATIONS[29]],
];

function buildPhase(
  blueprints: DayBlueprint[],
  startDay: number,
  phase: 1 | 2 | 3
): ChallengeDay[] {
  return blueprints.map(([workoutType, duration, videoId, motivation], i) => ({
    day: startDay + i,
    phase,
    workoutType,
    duration,
    videoId,
    motivation: motivation ?? "",
  }));
}

export const CHALLENGE_DAYS: ChallengeDay[] = [
  ...buildPhase(PHASE1_DAYS, 1,  1),
  ...buildPhase(PHASE2_DAYS, 31, 2),
  ...buildPhase(PHASE3_DAYS, 61, 3),
];

export const PHASE_META = {
  1: { label: "Foundation", color: "#10B981", range: "Days 1–30",  description: "Build your base with walking, yoga, and light cardio" },
  2: { label: "Build",      color: "#FF8C42", range: "Days 31–60", description: "Add strength training, jogging, and intermediate HIIT" },
  3: { label: "Transform",  color: "#FF7F7F", range: "Days 61–90", description: "Peak performance — advanced HIIT and full-body power" },
} as const;

export const WORKOUT_ICON: Record<ChallengeWorkoutType, string> = {
  walking:  "navigation",
  jogging:  "activity",
  cardio:   "heart",
  hiit:     "trending-up",
  strength: "zap",
  yoga:     "wind",
  rest:     "moon",
};

export const WORKOUT_COLOR: Record<ChallengeWorkoutType, string> = {
  walking:  "#10B981",
  jogging:  "#FF8C42",
  cardio:   "#FF6B6B",
  hiit:     "#FF8FAB",
  strength: "#9B5DE5",
  yoga:     "#38BDF8",
  rest:     "#94A3B8",
};
