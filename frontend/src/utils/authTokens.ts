const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const decodeBase64Url = (input: string) => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  return atob(padded);
};

const parseJwt = (token: string) => {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }
  try {
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
};

const isSecureContext = () => window.location.protocol === "https:";

const setCookie = (name: string, value: string, options?: { maxAgeSec?: number; secure?: boolean }) => {
  const encodedValue = encodeURIComponent(value);
  const maxAge = typeof options?.maxAgeSec === "number" ? `; Max-Age=${options.maxAgeSec}` : "";
  const secure = options?.secure ?? isSecureContext();
  const secureFlag = secure ? "; Secure" : "";

  const cookieString = `${name}=${encodedValue}${maxAge}; Path=/; SameSite=Lax${secureFlag}`;
  document.cookie = cookieString;
};

const getCookie = (name: string) => {
  const cookies = document.cookie.split("; ");
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.split("=")[1] || "");
};

export const setTokens = (params: {
  accessToken: string;
  refreshToken: string;
  accessMaxAgeSec?: number;
  refreshMaxAgeSec?: number;
}) => {
  setCookie(ACCESS_TOKEN_KEY, params.accessToken, { maxAgeSec: params.accessMaxAgeSec });
  setCookie(REFRESH_TOKEN_KEY, params.refreshToken, { maxAgeSec: params.refreshMaxAgeSec });
};

export const getAccessToken = () => getCookie(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => getCookie(REFRESH_TOKEN_KEY);

export const clearTokens = () => {
  setCookie(ACCESS_TOKEN_KEY, "", { maxAgeSec: 0 });
  setCookie(REFRESH_TOKEN_KEY, "", { maxAgeSec: 0 });
};

export const getRolesFromToken = (token?: string | null) => {
  if (!token) {
    return [] as string[];
  }

  const payload = parseJwt(token) as
    | {
        realm_access?: { roles?: string[] };
        resource_access?: Record<string, { roles?: string[] }>;
      }
    | null;

  if (!payload) {
    return [] as string[];
  }

  const roles: string[] = [];
  const realmRoles = payload.realm_access?.roles;
  if (Array.isArray(realmRoles)) {
    roles.push(...realmRoles);
  }

  const resourceAccess = payload.resource_access;
  if (resourceAccess && typeof resourceAccess === "object") {
    Object.values(resourceAccess).forEach((entry) => {
      if (entry?.roles && Array.isArray(entry.roles)) {
        roles.push(...entry.roles);
      }
    });
  }

  return Array.from(new Set(roles));
};
