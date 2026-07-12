"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";

interface Booking {
  id: number;
  asset_id: number;
  booked_by: number;
  start_time: string;
  end_time: string;
  purpose: string | null;
  status: string;
  ended_early: number;
}

interface BookableAsset {
  id: number;
  asset_tag: string;
  name: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  Upcoming: "bg-primary/5 text-primary ring-primary/10",
  Ongoing: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Completed: "bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30",
  Cancelled: "bg-error/10 text-error ring-error/20",
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function ResourceBookingPage() {
  const { user: currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");

  // List
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);

  // Form
  const [bookableAssets, setBookableAssets] = useState<BookableAsset[]>([]);
  const [selAssetId, setSelAssetId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchBookableAssets();
  }, []);

  async function fetchBookings() {
    setListLoading(true);
    setListError("");
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/bookings`).then((r) => r.json());
      setBookings(data);
    } catch (e: any) {
      setListError(e.message);
    } finally {
      setListLoading(false);
    }
  }

  async function fetchBookableAssets() {
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/assets/`).then((r) => r.json());
      setBookableAssets(data.filter((a: any) => a.is_bookable));
    } catch {}
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) { alert("User not loaded yet."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          asset_id: parseInt(selAssetId),
          booked_by: currentUser.id,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          purpose: purpose || null,
        }),
      });
      setSelAssetId(""); setStartTime(""); setEndTime(""); setPurpose("");
      setActiveTab("list");
      fetchBookings();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: number, bookedBy: number) {
    if (!confirm("Cancel this booking?")) return;
    setCancelLoading(id);
    try {
      await apiFetch(`/bookings/${id}/cancel?requesting_user_id=${bookedBy}`, { method: "POST" });
      fetchBookings();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCancelLoading(null);
    }
  }

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/bookings" />
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        <div className="px-6 lg:px-10 py-8 max-w-[1100px] mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-h2 text-on-surface tracking-tight font-semibold">Resource Booking</h1>
              <p className="text-body-md text-on-surface-variant mt-1">Manage and reserve shared bookable assets.</p>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === "new" ? "list" : "new")}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">{activeTab === "new" ? "list" : "add"}</span>
              {activeTab === "new" ? "View Bookings" : "Book a Resource"}
            </button>
          </div>

          {/* ---- LIST TAB ---- */}
          {activeTab === "list" && (
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col flex-1">
              {listLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : listError ? (
                <div className="p-6">
                  <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex gap-3">
                    <span className="material-symbols-outlined text-error shrink-0">error</span>
                    <p className="text-sm font-medium text-error">{listError}</p>
                  </div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-outline">
                  <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">event_available</span>
                  <p className="text-sm font-semibold">No bookings yet</p>
                  <p className="text-xs mt-1">Click "Book a Resource" to create one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
                      <tr>
                        {["Asset ID", "Start", "End", "Purpose", "Status", "Action"].map((h) => (
                          <th key={h} className="py-5 px-5 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-container-low/30 transition-all">
                          <td className="py-4 px-5 text-sm font-semibold text-primary whitespace-nowrap">#{b.asset_id}</td>
                          <td className="py-4 px-5 text-sm text-on-surface-variant whitespace-nowrap">{fmt(b.start_time)}</td>
                          <td className="py-4 px-5 text-sm text-on-surface-variant whitespace-nowrap">{fmt(b.end_time)}</td>
                          <td className="py-4 px-5 text-sm text-on-surface-variant max-w-[200px]">
                            <span className="truncate block">{b.purpose || "—"}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ring-1 whitespace-nowrap ${STATUS_COLORS[b.status] || "bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30"}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            {(b.status === "Upcoming" || b.status === "Ongoing") && (
                              <button
                                onClick={() => handleCancel(b.id, b.booked_by)}
                                disabled={cancelLoading === b.id}
                                className="px-3 py-1.5 rounded-lg bg-error/10 text-error border border-error/20 text-xs font-bold hover:bg-error/20 transition-all disabled:opacity-50"
                              >
                                {cancelLoading === b.id ? "..." : "Cancel"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-auto p-5 border-t border-outline-variant/10 bg-surface-container-lowest text-body-sm text-outline font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Only bookable assets are eligible for reservation.
              </div>
            </div>
          )}

          {/* ---- NEW BOOKING TAB ---- */}
          {activeTab === "new" && (
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-8">
              <h3 className="text-lg font-bold text-on-surface mb-6">New Booking</h3>
              <form onSubmit={handleBook} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Bookable Asset <span className="text-error">*</span></label>
                  <select required value={selAssetId} onChange={(e) => setSelAssetId(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                    <option value="">Select asset...</option>
                    {bookableAssets.map((a) => <option key={a.id} value={a.id}>{a.asset_tag} — {a.name}</option>)}
                  </select>
                  {bookableAssets.length === 0 && <p className="text-xs text-outline">No bookable assets found. Mark an asset as bookable in the Assets page.</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-label-md font-semibold text-on-surface/90">Start Time <span className="text-error">*</span></label>
                    <input required type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md font-semibold text-on-surface/90">End Time <span className="text-error">*</span></label>
                    <input required type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Purpose</label>
                  <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Team standup, Client presentation..." className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setActiveTab("list")} className="px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
                    <span className="material-symbols-outlined text-[18px]">event_available</span>
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
