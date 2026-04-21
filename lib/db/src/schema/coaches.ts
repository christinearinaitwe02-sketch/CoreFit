import { pgTable, text, boolean } from "drizzle-orm/pg-core";

export const coachesTable = pgTable("coaches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull().default("coach"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export type Coach = typeof coachesTable.$inferSelect;
export type NewCoach = typeof coachesTable.$inferInsert;
