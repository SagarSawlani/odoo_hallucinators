"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";

interface Transfer {
  id: number;
  asset_tag: string;
  asset_name: string;
  from_employee: string | null;
  to_employee: string;
  requested_by: string;
  reason: string | null;
  status: string;
  requested_at: string;
  approved_at: string | null;
}

interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  status: string;
}

interface Employee {
  id: number;
  name: string;
  department_name: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Rejected: "bg-error/10 text-error ring-error/20",
};

export default function TransfersPage() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const { user: currentUser } = useCurrentUser();

  // List state
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Form state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selAssetId, setSelAssetId] = useState("");
  const [selEmployeeId, setSelEmployeeId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTransfers();
    fetchAssets();
    fetchEmployees();
  }, []);

  async function fetchTransfers() {
    setListLoading(true);
    setListError("");
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/transfers/`).then((r) => r.json());
      setTransfers(data);
    } catch (e: any) {
      setListError(e.message);
    } finally {
      setListLoading(false);
    }
  }

  async function fetchAssets() {
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/assets/`).then((r) => r.json());
      setAssets(data.filter((a: Asset) => a.status === "Allocated"));
    } catch {}
  }

  async function fetchEmployees() {
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/employees/`).then((r) => r.json());
      setEmployees(data);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) { alert("User not loaded yet. Please wait a moment."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/transfers/", {
        method: "POST",
        body: JSON.stringify({
          asset_id: parseInt(selAssetId),
          to_employee: parseInt(selEmployeeId),
          requested_by: currentUser.id,
          reason: reason || null,
        }),
      });
      setSelAssetId(""); setSelEmployeeId(""); setReason("");
      setActiveTab("list");
      fetchTransfers();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(id: number) {
    if (!currentUser) { alert("User not loaded yet."); return; }
    setActionLoading(id);
    try {
      await apiFetch(`/transfers/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ approved_by: currentUser.id }),
      });
      fetchTransfers();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: number) {
    if (!currentUser) { alert("User not loaded yet."); return; }
    setActionLoading(id);
    try {
      await apiFetch(`/transfers/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ approved_by: currentUser.id }),
      });
      fetchTransfers();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/transfers" />
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        <div className="px-6 lg:px-10 py-8 max-w-[1100px] mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-h2 text-on-surface tracking-tight font-semibold">Asset Transfers</h1>
              <p className="text-body-md text-on-surface-variant mt-1">Manage transfer requests between employees.</p>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === "new" ? "list" : "new")}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">{activeTab === "new" ? "list" : "add"}</span>
              {activeTab === "new" ? "View Requests" : "New Request"}
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
              ) : transfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-outline">
                  <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">swap_horiz</span>
                  <p className="text-sm font-semibold">No transfer requests yet</p>
                  <p className="text-xs mt-1">Click "New Request" to create one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
                      <tr>
                        {["Asset", "From", "To", "Requested By", "Reason", "Status", "Actions"].map((h) => (
                          <th key={h} className="py-5 px-5 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {transfers.map((tr) => (
                        <tr key={tr.id} className="hover:bg-surface-container-low/30 transition-all">
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">{tr.asset_tag}</span>
                            <p className="text-sm font-medium text-on-surface mt-0.5 max-w-[150px] truncate">{tr.asset_name}</p>
                          </td>
                          <td className="py-4 px-5 text-sm font-medium text-on-surface-variant whitespace-nowrap">{tr.from_employee || "—"}</td>
                          <td className="py-4 px-5 text-sm font-semibold text-on-surface whitespace-nowrap">{tr.to_employee}</td>
                          <td className="py-4 px-5 text-sm text-on-surface-variant whitespace-nowrap">{tr.requested_by}</td>
                          <td className="py-4 px-5 text-sm text-on-surface-variant max-w-[180px]">
                            <span className="truncate block">{tr.reason || "—"}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ring-1 whitespace-nowrap ${STATUS_COLORS[tr.status] || "bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30"}`}>
                              {tr.status}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            {tr.status === "Pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(tr.id)}
                                  disabled={actionLoading === tr.id}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
                                >
                                  {actionLoading === tr.id ? "..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleReject(tr.id)}
                                  disabled={actionLoading === tr.id}
                                  className="px-3 py-1.5 rounded-lg bg-error/10 text-error border border-error/20 text-xs font-bold hover:bg-error/20 transition-all disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
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
                Only Admin, Asset Manager, or Department Head can approve/reject transfers.
              </div>
            </div>
          )}

          {/* ---- NEW REQUEST TAB ---- */}
          {activeTab === "new" && (
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-8">
              <h3 className="text-lg font-bold text-on-surface mb-6">New Transfer Request</h3>
              <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Asset (Allocated only) <span className="text-error">*</span></label>
                  <select required value={selAssetId} onChange={(e) => setSelAssetId(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                    <option value="">Select asset...</option>
                    {assets.map((a) => <option key={a.id} value={a.id}>{a.asset_tag} — {a.name}</option>)}
                  </select>
                  {assets.length === 0 && <p className="text-xs text-outline">No allocated assets found. Only allocated assets can be transferred.</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Transfer To <span className="text-error">*</span></label>
                  <select required value={selEmployeeId} onChange={(e) => setSelEmployeeId(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                    <option value="">Select employee...</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}{emp.department_name ? ` — ${emp.department_name}` : ""}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Reason <span className="text-error">*</span></label>
                  <textarea required rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain the reason for this transfer..." className="w-full p-4 bg-white border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setActiveTab("list")} className="px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    {submitting ? "Submitting..." : "Submit Request"}
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
