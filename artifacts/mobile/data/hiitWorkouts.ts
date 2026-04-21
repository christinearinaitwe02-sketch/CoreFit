export interface HiitWorkout {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  calories: string;
  instructions: string[];
}

export const HIIT_WORKOUTS: HiitWorkout[] = [
  {
    id: "hiit-belly-blast",
    title: "Belly Fat Blast HIIT",
    duration: "20 min",
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    level: "Beginner",
    calories: "180–220 kcal",
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
    title: "Core Fire — Abs & Obliques",
    duration: "15 min",
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    level: "Intermediate",
    calories: "140–170 kcal",
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
    title: "Full Body Shred",
    duration: "30 min",
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    level: "Advanced",
    calories: "280–340 kcal",
    instructions: [
      "Warm up for 3 minutes — jog in place, high knees, arm swings",
      "Work in 40-second blocks with 20 seconds rest",
      "Combine lower body, upper body, and core exercises each round",
      "Maintain proper form — reduce intensity before breaking form",
      "Hydrate between rounds as needed",
      "Cool down with 3 full minutes of static stretches",
    ],
  },
];
