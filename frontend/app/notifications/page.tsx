"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string | null;
  type: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  booking_created: "bg-primary",
  maintenance_approved: "bg-emerald-500",
  maintenance_resolved: "bg-teal-500",
  audit_missing: "bg-error",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUnread, setShowUnread] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError("");
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/notifications/?limit=100`).then((r) => r.json());
      setNotifications(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  }

  async function handleDelete(id: number) {
    setDeleteLoading(id);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {} finally {
      setDeleteLoading(null);
    }
  }

  const displayed = showUnread ? notifications.filter((n) => !n.is_read) : notifications;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/notifications" />
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        <div className="flex-1 flex flex-col px-6 lg:px-10 py-8 max-w-[900px] mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-h2 text-on-surface tracking-tight font-semibold flex items-center gap-3">
                Activity & Notifications
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-error text-white text-xs font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">Stay updated with system activities, approvals, and alerts.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnread(!showUnread)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${showUnread ? "bg-primary text-on-primary border-primary" : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"}`}
              >
                {showUnread ? "Show All" : `Unread (${unreadCount})`}
              </button>
              <button onClick={fetchNotifications} className="h-10 w-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all">
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center flex-1 py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-outline">Loading notifications...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex gap-3">
                  <span className="material-symbols-outlined text-error shrink-0">error</span>
                  <p className="text-sm font-medium text-error">{error}</p>
                </div>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-20 text-outline">
                <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">notifications_off</span>
                <p className="text-sm font-semibold">{showUnread ? "No unread notifications" : "No notifications yet"}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-outline-variant/10">
                  {displayed.map((notif) => (
                    <li
                      key={notif.id}
                      onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                      className={`flex items-start justify-between gap-4 p-5 transition-colors cursor-pointer group ${notif.is_read ? "hover:bg-surface-container-lowest/50" : "bg-primary/[0.02] hover:bg-primary/[0.04]"}`}
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Color dot */}
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${notif.is_read ? "bg-outline-variant" : TYPE_COLORS[notif.type || ""] || "bg-primary"}`}></div>

                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${notif.is_read ? "text-on-surface-variant" : "text-on-surface"}`}>
                            {notif.title}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-outline mt-0.5 truncate">{notif.message}</p>
                          )}
                          <p className="text-[11px] font-bold text-outline/60 uppercase tracking-widest mt-1">
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                          disabled={deleteLoading === notif.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 text-outline hover:text-error transition-all opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {deleteLoading === notif.id ? "hourglass_empty" : "close"}
                          </span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-5 border-t border-outline-variant/10 bg-surface-container-lowest text-body-sm text-outline font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Click a notification to mark it as read. Total: {notifications.length}
              </div>
              {unreadCount > 0 && (
                <span className="text-xs text-primary font-semibold">{unreadCount} unread</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
