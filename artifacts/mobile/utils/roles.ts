/**
 * Role utilities for CoreHer Fitness.
 *
 * Elevated users (admin or coach) bypass premium gates and see the admin dashboard.
 */

export type UserRole = "client" | "coach" | "admin";

/** Returns true for admin or coach — both have elevated access. */
export function isElevated(role?: string | null): boolean {
  return role === "admin" || role === "coach";
}

/** Returns true specifically for the admin role. */
export function isAdmin(role?: string | null): boolean {
  return role === "admin";
}

/** Display label for a role. */
export function roleLabel(role?: string | null): string {
  if (role === "admin") return "Admin";
  if (role === "coach") return "Fitness Coach";
  return "Client";
}
