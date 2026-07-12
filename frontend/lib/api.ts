const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token expired or invalid — redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `API error: ${res.status}`);
  }

  return res.json();
}
