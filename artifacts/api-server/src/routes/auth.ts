import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable, coachesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "corehr-jwt-secret-fallback";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function safeUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isPremium: u.isPremium,
    paymentStatus: u.paymentStatus,
  };
}

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Full name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const normalEmail = email.trim().toLowerCase();

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalEmail))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const coaches = await db
      .select()
      .from(coachesTable)
      .where(eq(coachesTable.email, normalEmail))
      .limit(1);

    const role = coaches.length > 0 ? "coach" : "client";
    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({
        id: generateId(),
        name: name.trim(),
        email: normalEmail,
        passwordHash,
        role,
        isPremium: false,
        paymentStatus: "none",
        createdAt: new Date().toISOString(),
      })
      .returning();

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "30d" });

    return res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalEmail = email.trim().toLowerCase();

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalEmail))
      .limit(1);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "30d" });

    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .limit(1);

    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({ user: safeUser(rows[0]) });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
