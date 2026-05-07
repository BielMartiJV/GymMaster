import { fetchApi } from "../../api";

const TOKEN_KEY = "gymmaster_token";

export function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export { fetchApi };
