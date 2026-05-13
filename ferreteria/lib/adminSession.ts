const SESSION_KEY = "ferreteria_admin_session";

export function isAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function saveAdminSession(): void {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  return username.trim() === "admin" && password === "ferreteria2024";
}
