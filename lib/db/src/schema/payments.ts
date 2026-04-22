import { pgTable, text, real } from "drizzle-orm/pg-core";

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  amount: real("amount").notNull(),
  transactionId: text("transaction_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
  approvedAt: text("approved_at"),
});

export type Payment = typeof paymentsTable.$inferSelect;
export type NewPayment = typeof paymentsTable.$inferInsert;
