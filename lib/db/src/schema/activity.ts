import { pgTable, text, real, integer, unique } from "drizzle-orm/pg-core";

export const workoutsTable = pgTable("workouts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  calories: real("calories").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const mealsTable = pgTable("meals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  calories: real("calories"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const waterEntriesTable = pgTable(
  "water_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(),
    litres: real("litres").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [unique("water_user_date").on(t.userId, t.date)]
);

export const sleepEntriesTable = pgTable(
  "sleep_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(),
    hours: real("hours").notNull(),
    quality: text("quality"),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [unique("sleep_user_date").on(t.userId, t.date)]
);

export type Workout = typeof workoutsTable.$inferSelect;
export type Meal = typeof mealsTable.$inferSelect;
export type WaterEntry = typeof waterEntriesTable.$inferSelect;
export type SleepEntry = typeof sleepEntriesTable.$inferSelect;
