/**
 * Sessões Pro e Admin independentes (pares access + refresh por painel).
 * Chaves legadas `auth_token` / `refresh_token` são migradas uma vez.
 */

export const AUTH_SESSION = {
  pro: {
    access: "aumigopet_auth_access_pro",
    refresh: "aumigopet_auth_refresh_pro",
    user: "aumigopet_user",
  },
  admin: {
    access: "aumigopet_auth_access_admin",
    refresh: "aumigopet_auth_refresh_admin",
    user: "aumigopet_admin",
  },
  legacy: {
    access: "auth_token",
    refresh: "refresh_token",
  },
} as const;

export type AuthRealm = "pro" | "admin";

let legacyMigrated = false;

function migrateLegacyTokensOnce(): void {
  if (legacyMigrated || typeof window === "undefined") return;
  const legacyAccess = localStorage.getItem(AUTH_SESSION.legacy.access);
  const legacyRefresh = localStorage.getItem(AUTH_SESSION.legacy.refresh);

  if (!legacyAccess) {
    legacyMigrated = true;
    return;
  }

  const hasProA = localStorage.getItem(AUTH_SESSION.pro.access);
  const hasAdminA = localStorage.getItem(AUTH_SESSION.admin.access);
  if (hasProA || hasAdminA) {
    localStorage.removeItem(AUTH_SESSION.legacy.access);
    localStorage.removeItem(AUTH_SESSION.legacy.refresh);
    legacyMigrated = true;
    return;
  }

  const hasProU = localStorage.getItem(AUTH_SESSION.pro.user);
  const hasAdminU = localStorage.getItem(AUTH_SESSION.admin.user);

  if (hasProU) {
    localStorage.setItem(AUTH_SESSION.pro.access, legacyAccess);
    if (legacyRefresh)
      localStorage.setItem(AUTH_SESSION.pro.refresh, legacyRefresh);
  } else if (hasAdminU) {
    localStorage.setItem(AUTH_SESSION.admin.access, legacyAccess);
    if (legacyRefresh)
      localStorage.setItem(AUTH_SESSION.admin.refresh, legacyRefresh);
  }

  localStorage.removeItem(AUTH_SESSION.legacy.access);
  localStorage.removeItem(AUTH_SESSION.legacy.refresh);
  legacyMigrated = true;
}

/** Qual token usar nas requisições: rotas /admin/* → Admin; caso contrário → Pro. */
export function getPathAuthRealm(): AuthRealm {
  if (typeof window === "undefined") return "pro";
  return window.location.pathname.startsWith("/admin") ? "admin" : "pro";
}

export function normalizeToken(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim().replace(/^"+|"+$/g, "");
  return t || null;
}

export function getAccessTokenForRealm(realm: AuthRealm): string | null {
  migrateLegacyTokensOnce();
  const key =
    realm === "admin"
      ? AUTH_SESSION.admin.access
      : AUTH_SESSION.pro.access;
  return normalizeToken(localStorage.getItem(key));
}

export function getRefreshTokenForRealm(realm: AuthRealm): string | null {
  migrateLegacyTokensOnce();
  const key =
    realm === "admin"
      ? AUTH_SESSION.admin.refresh
      : AUTH_SESSION.pro.refresh;
  return normalizeToken(localStorage.getItem(key));
}

export function setTokensForRealm(
  realm: AuthRealm,
  access: string,
  refresh?: string | null,
): void {
  migrateLegacyTokensOnce();
  const s = realm === "admin" ? AUTH_SESSION.admin : AUTH_SESSION.pro;
  localStorage.setItem(s.access, access);
  if (refresh != null && refresh !== "")
    localStorage.setItem(s.refresh, refresh);
  localStorage.removeItem(AUTH_SESSION.legacy.access);
  localStorage.removeItem(AUTH_SESSION.legacy.refresh);
}

/** Remove access, refresh e objeto de utilizador desse painel. */
export function clearRealmSession(realm: AuthRealm): void {
  const s = realm === "admin" ? AUTH_SESSION.admin : AUTH_SESSION.pro;
  localStorage.removeItem(s.access);
  localStorage.removeItem(s.refresh);
  localStorage.removeItem(s.user);
}
