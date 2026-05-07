const rawBaseUrl = import.meta.env.VITE_API_URL || "";

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export function apiUrl(url: string) {
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}/api${cleanUrl}`;
}

export function fetchApi(url: string, options?: RequestInit) {
  return fetch(apiUrl(url), options);
}
