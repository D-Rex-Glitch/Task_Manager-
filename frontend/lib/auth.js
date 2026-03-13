export const TOKEN_KEY = "tms_token";
export const ROLE_KEY = "tms_role";
export const EMAIL_KEY = "tms_email";
export const NAME_KEY = "tms_name";

export function setAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(ROLE_KEY, data.role);
  localStorage.setItem(EMAIL_KEY, data.email);
  localStorage.setItem(NAME_KEY, data.name);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(NAME_KEY);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}

export function getUserName() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}

export function getUserEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function updateAuthProfile(profile) {
  if (!profile) return;
  if (profile.name) {
    localStorage.setItem(NAME_KEY, profile.name);
  }
  if (profile.email) {
    localStorage.setItem(EMAIL_KEY, profile.email);
  }
  if (profile.role) {
    localStorage.setItem(ROLE_KEY, profile.role);
  }
}
