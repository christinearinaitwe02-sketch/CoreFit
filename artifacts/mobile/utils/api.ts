/**
 * Returns the API base URL for the current environment.
 *
 * - Development: EXPO_PUBLIC_API_URL is set by the dev workflow (e.g. https://dev.domain:8080)
 * - Production build: env var is empty, so we use window.location.origin which is the
 *   same domain as the deployed app. Replit routes /api/* to the API server automatically.
 */
export function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}
