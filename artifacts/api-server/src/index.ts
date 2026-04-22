import app from "./app";
import { logger } from "./lib/logger";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function ensureAdminUser() {
  try {
    const ADMIN_EMAIL = "christine.arinaitwe02@gmail.com";
    const ADMIN_PASSWORD = "CoreHer2024!";
    const ADMIN_NAME = "Christine Arinaitwe";

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, ADMIN_EMAIL));

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (existing) {
      await db
        .update(usersTable)
        .set({ role: "admin", passwordHash, isPremium: true })
        .where(eq(usersTable.email, ADMIN_EMAIL));
      logger.info("Admin user credentials synced");
    } else {
      function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
      }
      await db.insert(usersTable).values({
        id: generateId(),
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
        isPremium: true,
        paymentStatus: "approved",
        createdAt: new Date().toISOString(),
      });
      logger.info("Admin user created");
    }
  } catch (err) {
    logger.error({ err }, "Failed to ensure admin user");
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await ensureAdminUser();
});
