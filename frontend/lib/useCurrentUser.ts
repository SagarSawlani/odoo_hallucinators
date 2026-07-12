import { useEffect, useState } from "react";

export interface CurrentUser {
  id: number;
  firebase_uid: string;
  name: string;
  email: string;
  role: string;
  department_name: string | null;
}

// Decode firebase_uid from JWT stored in localStorage
function getFirebaseUidFromToken(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = token.split(".")[1];
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return decoded.user_id || decoded.sub || decoded.uid || null;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("currentUser");
    if (cached) {
      setUser(JSON.parse(cached));
      setLoading(false);
      return;
    }

    const firebaseUid = getFirebaseUidFromToken();
    if (!firebaseUid) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/employees/`)
      .then((r) => r.json())
      .then((employees: any[]) => {
        const match = employees.find((e) => e.firebase_uid === firebaseUid);
        if (match) {
          sessionStorage.setItem("currentUser", JSON.stringify(match));
          setUser(match);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
