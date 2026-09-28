// src/lib/auth/tokenUtils.ts

/**
 * Checks whether a given JWT token is missing, invalid, or expired.
 * Includes a 30-second clock skew / pre-expiry buffer so requests
 * don't fail in-flight right as the token expires.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token || typeof token !== 'string') {
    return true;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    // Base64URL decode
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) {
      return false; // Token without expiration
    }

    // Exp is in seconds; compare against current time with 30s buffer
    const expiryMs = payload.exp * 1000;
    const nowMs = Date.now();
    return nowMs >= expiryMs - 30000;
  } catch (error) {
    console.error('Error decoding token expiration:', error);
    return true;
  }
}

/**
 * Clears stored user session data from localStorage.
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  } catch (err) {
    console.error('Error clearing auth session:', err);
  }
}

// Redirect lock to prevent multiple concurrent 401s from redirecting repeatedly
let isRedirecting = false;

/**
 * Gracefully handles session expiration: clears storage and redirects to /login.
 */
export function handleSessionExpired(callbackUrl?: string): void {
  if (typeof window === 'undefined') return;
  if (isRedirecting) return;
  isRedirecting = true;

  clearAuthSession();

  const currentPath = callbackUrl || window.location.pathname;
  const isLoginPage = currentPath.startsWith('/login');

  if (!isLoginPage) {
    const loginUrl = new URL('/login', window.location.origin);
    loginUrl.searchParams.set('sessionExpired', 'true');
    if (currentPath && currentPath !== '/') {
      loginUrl.searchParams.set('callbackUrl', currentPath);
    }
    window.location.href = loginUrl.toString();
  } else {
    isRedirecting = false;
  }
}
