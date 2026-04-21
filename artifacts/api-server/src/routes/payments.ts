import { Router } from "express";
import { db, paymentsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

router.post("/payments", async (req, res) => {
  try {
    const { userId, fullName, phone, amount, transactionId } = req.body;
    if (!userId || !fullName || !phone || !amount || !transactionId) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const existing = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.transactionId, transactionId))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "This transaction ID has already been submitted." });
    }
    const payment = await db
      .insert(paymentsTable)
      .values({
        id: generateId(),
        userId,
        fullName,
        phone,
        amount: Number(amount),
        transactionId,
        status: "pending",
        createdAt: new Date().toISOString(),
      })
      .returning();
    return res.status(201).json({ success: true, payment: payment[0] });
  } catch (err) {
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.get("/payments", async (req, res) => {
  try {
    const payments = await db
      .select()
      .from(paymentsTable)
      .orderBy(desc(paymentsTable.createdAt));
    return res.json({ payments });
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

router.get("/payments/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.userId, userId))
      .orderBy(desc(paymentsTable.createdAt))
      .limit(1);
    if (payments.length === 0) {
      return res.json({ status: "none" });
    }
    return res.json({ status: payments[0].status, payment: payments[0] });
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

router.patch("/payments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "action must be approve or reject" });
    }
    const status = action === "approve" ? "approved" : "rejected";
    const updated = await db
      .update(paymentsTable)
      .set({
        status,
        approvedAt: action === "approve" ? new Date().toISOString() : undefined,
      })
      .where(eq(paymentsTable.id, id))
      .returning();
    if (updated.length === 0) {
      return res.status(404).json({ error: "Payment not found." });
    }
    if (action === "approve" && updated[0].userId) {
      await db
        .update(usersTable)
        .set({ isPremium: true, paymentStatus: "approved" })
        .where(eq(usersTable.id, updated[0].userId));
    }
    if (action === "reject" && updated[0].userId) {
      await db
        .update(usersTable)
        .set({ paymentStatus: "rejected" })
        .where(eq(usersTable.id, updated[0].userId));
    }
    return res.json({ success: true, payment: updated[0] });
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

export default router;
