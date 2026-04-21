import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "../lib/email.js";

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

    const role = "client";
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

    if (user.deletedAt) {
      const deletedDate = new Date(user.deletedAt);
      const recoveryDeadline = new Date(deletedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (new Date() < recoveryDeadline) {
        await db.update(usersTable).set({ deletedAt: null }).where(eq(usersTable.id, user.id));
      } else {
        return res.status(401).json({ error: "This account has been permanently deleted." });
      }
    }

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

router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required." });
    }

    const normalEmail = email.trim().toLowerCase();
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalEmail))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No account found with that email address." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const codeHash = await bcrypt.hash(code, 10);

    await db
      .update(usersTable)
      .set({ resetToken: codeHash, resetTokenExpiry: expiry })
      .where(eq(usersTable.email, normalEmail));

    try {
      await sendPasswordResetEmail(normalEmail, rows[0].name, code);
    } catch (emailErr) {
      console.error("forgot-password email send error", emailErr);
      return res.status(500).json({ error: "Failed to send reset email. Please try again." });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("forgot-password error", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.post("/auth/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email?.trim() || !code?.trim()) {
      return res.status(400).json({ error: "Email and code are required." });
    }

    const normalEmail = email.trim().toLowerCase();
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalEmail))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Account not found." });
    }

    const user = rows[0];

    if (!user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ error: "No reset code found. Please request a new one." });
    }

    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    }

    const codeMatch = await bcrypt.compare(code.trim(), user.resetToken);
    if (!codeMatch) {
      return res.status(400).json({ error: "Invalid reset code. Please check and try again." });
    }

    return res.json({ valid: true });
  } catch (err) {
    console.error("verify-reset-code error", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body as {
      email?: string;
      code?: string;
      newPassword?: string;
    };

    if (!email?.trim() || !code?.trim() || !newPassword?.trim()) {
      return res.status(400).json({ error: "Email, code and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const normalEmail = email.trim().toLowerCase();
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalEmail))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Account not found." });
    }

    const user = rows[0];

    if (!user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ error: "No reset code found. Please request a new one." });
    }

    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    }

    const codeMatch = await bcrypt.compare(code.trim(), user.resetToken);
    if (!codeMatch) {
      return res.status(400).json({ error: "Invalid reset code. Please check and try again." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(usersTable)
      .set({ passwordHash: newHash, resetToken: null, resetTokenExpiry: null })
      .where(eq(usersTable.email, normalEmail));

    return res.json({ success: true });
  } catch (err) {
    console.error("reset-password error", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.patch("/auth/change-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword?.trim() || !newPassword?.trim()) {
      return res.status(400).json({ error: "Current and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .limit(1);

    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(usersTable)
      .set({ passwordHash: newHash })
      .where(eq(usersTable.id, user.id));

    return res.json({ success: true });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
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

    const foundUser = rows[0];
    if (foundUser.deletedAt) {
      const deletedDate = new Date(foundUser.deletedAt);
      const recoveryDeadline = new Date(deletedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (new Date() < recoveryDeadline) {
        await db
          .update(usersTable)
          .set({ deletedAt: null })
          .where(eq(usersTable.id, foundUser.id));
      } else {
        return res.status(401).json({ error: "This account has been permanently deleted." });
      }
    }

    return res.json({ user: safeUser(rows[0]) });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.delete("/auth/account", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const { password } = req.body as { password?: string };
    if (!password?.trim()) {
      return res.status(400).json({ error: "Password is required to delete your account." });
    }

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Account not found." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    const deletedAt = new Date().toISOString();
    await db
      .update(usersTable)
      .set({ deletedAt })
      .where(eq(usersTable.id, user.id));

    return res.json({ success: true, deletedAt });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});

export default router;
