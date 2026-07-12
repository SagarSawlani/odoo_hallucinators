"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";

interface MaintenanceRequest {
  id: number;
  asset_id: number;
  reported_by: number;
  issue_description: string;
  priority: string;
  priority_reasons: string[];
  status: string;
  resolution_notes: string | null;
  created_at: string;
}

interface Asset {
  id: number;
  asset_tag: string;
  name: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-error/10 text-error",
};

const COLUMNS = [
  { id: "Pending", title: "Pending", color: "bg-amber-400" },
  { id: "Approved", title: "Approved", color: "bg-primary" },
  { id: "Rejected", title: "Rejected", color: "bg-error" },
  { id: "Resolved", title: "Resolved", color: "bg-emerald-500" },
];

export default function MaintenancePage() {
  const { user: currentUser } = useCurrentUser();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Report modal
  const [showReport, setShowReport] = useState(false);
  const [selAssetId, setSelAssetId] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [blocksWork, setBlocksWork] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Resolve modal
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  useEffect(() => {
    fetchMaintenance();
    fetchAssets();
  }, []);

  async function fetchMaintenance() {
    setLoading(true);
    setError("");
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/maintenance`).then((r) => r.json());
      setRequests(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAssets() {
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/assets/`).then((r) => r.json());
      setAssets(data);
    } catch {}
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) { alert("User not loaded yet."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/maintenance", {
        method: "POST",
        body: JSON.stringify({
          asset_id: parseInt(selAssetId),
          reported_by: currentUser.id,
          issue_description: issueDesc,
          blocks_work: blocksWork,
        }),
      });
      setShowReport(false);
      setSelAssetId(""); setIssueDesc(""); setBlocksWork(false);
      fetchMaintenance();
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
      await apiFetch(`/maintenance/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ approved_by: currentUser.id }),
      });
      fetchMaintenance();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  }

  async function handleReject(id: number) {
    if (!currentUser) { alert("User not loaded yet."); return; }
    setActionLoading(id);
    try {
      await apiFetch(`/maintenance/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ approved_by: currentUser.id, resolution_notes: null }),
      });
      fetchMaintenance();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvingId) return;
    setActionLoading(resolvingId);
    try {
      await apiFetch(`/maintenance/${resolvingId}/resolve`, {
        method: "POST",
        body: JSON.stringify({ resolution_notes: resolveNotes || null }),
      });
      setResolvingId(null); setResolveNotes("");
      fetchMaintenance();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  }

  const byStatus = (status: string) => requests.filter((r) => r.status === status);

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/maintenance" />
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        <div className="flex-1 flex flex-col px-6 lg:px-10 py-8 max-w-[1600px] mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-h2 text-on-surface tracking-tight font-semibold">Maintenance Management</h1>
              <p className="text-body-md text-on-surface-variant mt-1">Approval workflow for asset repairs and maintenance requests.</p>
            </div>
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Report Issue
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center flex-1 py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-outline">Loading maintenance requests...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex gap-3">
              <span className="material-symbols-outlined text-error shrink-0">error</span>
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
              <div className="flex-1 flex overflow-x-auto custom-scrollbar p-6 gap-6">
                {COLUMNS.map((col) => {
                  const colRequests = byStatus(col.id);
                  return (
                    <div key={col.id} className="flex-1 min-w-[260px] max-w-[320px] flex flex-col">
                      <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                          <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">{col.title}</h3>
                        </div>
                        <span className="bg-surface-container-high text-on-surface-variant text-xs font-bold px-2 py-0.5 rounded-full">{colRequests.length}</span>
                      </div>
                      <div className="flex-1 bg-surface-container-low/30 rounded-xl p-3 border border-outline-variant/10 flex flex-col gap-3">
                        {colRequests.length === 0 && (
                          <p className="text-xs text-center text-outline py-6 opacity-50">No requests</p>
                        )}
                        {colRequests.map((req) => (
                          <div
                            key={req.id}
                            className={`p-4 rounded-xl shadow-sm border ${col.id === "Resolved" ? "bg-emerald-50 border-emerald-200/60" : "bg-white border-outline-variant/30"}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${col.id === "Resolved" ? "bg-emerald-100 text-emerald-800" : "bg-primary/10 text-primary"}`}>
                                #{req.asset_id}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${PRIORITY_COLORS[req.priority] || ""}`}>
                                {req.priority}
                              </span>
                            </div>
                            <h4 className={`text-sm font-semibold mb-2 ${col.id === "Resolved" ? "text-emerald-950" : "text-on-surface"}`}>
                              {req.issue_description}
                            </h4>
                            {req.resolution_notes && (
                              <p className="text-xs text-emerald-700 mb-2">{req.resolution_notes}</p>
                            )}
                            {/* Actions */}
                            {col.id === "Pending" && (
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => handleApprove(req.id)} disabled={actionLoading === req.id} className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all disabled:opacity-50">
                                  {actionLoading === req.id ? "..." : "Approve"}
                                </button>
                                <button onClick={() => handleReject(req.id)} disabled={actionLoading === req.id} className="flex-1 py-1.5 rounded-lg bg-error/10 text-error border border-error/20 text-xs font-bold hover:bg-error/20 transition-all disabled:opacity-50">
                                  Reject
                                </button>
                              </div>
                            )}
                            {col.id === "Approved" && (
                              <button onClick={() => { setResolvingId(req.id); setResolveNotes(""); }} className="w-full mt-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary/20 transition-all">
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-5 border-t border-outline-variant/10 bg-surface-container text-body-sm text-outline font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Approving moves the asset to 'UnderMaintenance'. Resolving returns it to 'Available'.
              </div>
            </div>
          )}
        </div>

        {/* Report Issue Modal */}
        {showReport && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Report Maintenance Issue</h3>
              <form onSubmit={handleReport} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Asset <span className="text-error">*</span></label>
                  <select required value={selAssetId} onChange={(e) => setSelAssetId(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                    <option value="">Select asset...</option>
                    {assets.map((a) => <option key={a.id} value={a.id}>{a.asset_tag} — {a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Issue Description <span className="text-error">*</span></label>
                  <textarea required rows={4} value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} placeholder="Describe the problem..." className="w-full p-4 bg-white border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={blocksWork} onChange={(e) => setBlocksWork(e.target.checked)} className="w-4 h-4 rounded text-primary" />
                  <span className="text-sm font-medium text-on-surface">This issue blocks work (increases priority)</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">{submitting ? "Submitting..." : "Submit"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resolve Modal */}
        {resolvingId && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setResolvingId(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Mark as Resolved</h3>
              <form onSubmit={handleResolve} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Resolution Notes</label>
                  <textarea rows={3} value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} placeholder="What was done to fix the issue?" className="w-full p-4 bg-white border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setResolvingId(null)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={actionLoading === resolvingId} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50">{actionLoading === resolvingId ? "Resolving..." : "Mark Resolved"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
