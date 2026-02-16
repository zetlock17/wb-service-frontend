const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const isSecureContext = () => window.location.protocol === "https:";

const setCookie = (name: string, value: string, options?: { maxAgeSec?: number; secure?: boolean }) => {
  const encodedValue = encodeURIComponent(value);
  const maxAge = typeof options?.maxAgeSec === "number" ? `; Max-Age=${options.maxAgeSec}` : "";
  const secure = options?.secure ?? isSecureContext();
  const secureFlag = secure ? "; Secure" : "";

  const cookieString = `${name}=${encodedValue}${maxAge}; Path=/; SameSite=Lax${secureFlag}`;
  console.log('[Cookie] Setting:', name, '| value length:', value.length, '| maxAge:', options?.maxAgeSec, '| cookie:', cookieString.substring(0, 50) + '...');
  document.cookie = cookieString;
};

const getCookie = (name: string) => {
  const cookies = document.cookie.split("; ");
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) {
    console.log('[Cookie] Not found:', name);
    return null;
  }
  const value = decodeURIComponent(match.split("=")[1] || "");
  console.log('[Cookie] Found:', name, '| length:', value.length);
  return value;
};

export const setTokens = (params: {
  accessToken: string;
  refreshToken: string;
  accessMaxAgeSec?: number;
  refreshMaxAgeSec?: number;
}) => {
  console.log('[AuthTokens] Setting tokens, accessMaxAge:', params.accessMaxAgeSec);
  setCookie(ACCESS_TOKEN_KEY, params.accessToken, { maxAgeSec: params.accessMaxAgeSec });
  setCookie(REFRESH_TOKEN_KEY, params.refreshToken, { maxAgeSec: params.refreshMaxAgeSec });
};

export const getAccessToken = () => {
  const token = getCookie(ACCESS_TOKEN_KEY);
  console.log('[AuthTokens] Getting access token:', token ? `${token.substring(0, 20)}...` : 'null');
  return token;
};

export const getRefreshToken = () => {
  const token = getCookie(REFRESH_TOKEN_KEY);
  console.log('[AuthTokens] Getting refresh token:', token ? `${token.substring(0, 20)}...` : 'null');
  return token;
};

export const clearTokens = () => {
  console.log('[AuthTokens] Clearing tokens');
  setCookie(ACCESS_TOKEN_KEY, "", { maxAgeSec: 0 });
  setCookie(REFRESH_TOKEN_KEY, "", { maxAgeSec: 0 });
};
