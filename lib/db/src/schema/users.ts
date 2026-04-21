import { pgTable, text, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("client"),
  isPremium: boolean("is_premium").notNull().default(false),
  paymentStatus: text("payment_status").notNull().default("none"),
  createdAt: text("created_at").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: text("reset_token_expiry"),
  deletedAt: text("deleted_at"),
});

export type AppUser = typeof usersTable.$inferSelect;
export type NewAppUser = typeof usersTable.$inferInsert;
