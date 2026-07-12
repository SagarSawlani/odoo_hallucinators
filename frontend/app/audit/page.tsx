"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";

interface AuditCycle {
  id: number;
  title: string;
  department_id: number | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
}

interface AuditResult {
  id: number;
  audit_cycle_id: number;
  asset_id: number;
  auditor_id: number;
  result: string;
  remarks: string | null;
  verified_at: string;
}

interface Asset {
  id: number;
  asset_tag: string;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const RESULT_COLORS: Record<string, string> = {
  Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Missing: "bg-error/10 text-error border-error/20",
  Damaged: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AuditPage() {
  const { user: currentUser } = useCurrentUser();

  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<AuditCycle | null>(null);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // New cycle modal
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [cycleTitle, setCycleTitle] = useState("");
  const [cycleDeptId, setCycleDeptId] = useState("");
  const [cycleLocation, setCycleLocation] = useState("");
  const [cycleStart, setCycleStart] = useState("");
  const [cycleEnd, setCycleEnd] = useState("");
  const [creatingCycle, setCreatingCycle] = useState(false);

  // Verify modal
  const [showVerify, setShowVerify] = useState(false);
  const [verifyAssetId, setVerifyAssetId] = useState("");
  const [verifyResult, setVerifyResult] = useState("Verified");
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [closingCycle, setClosingCycle] = useState(false);

  useEffect(() => {
    fetchCycles();
    fetchAssets();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedCycle) fetchResults(selectedCycle.id);
  }, [selectedCycle]);

  async function fetchCycles() {
    setCyclesLoading(true);
    try {
      // No GET /audit/cycles endpoint — we store cycles after creation locally
      // We'll use the cycles we created. On refresh, show empty state to create.
      // Actually check if there's a cycles list route by trying GET /audit/cycles
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/audit/cycles`);
      if (resp.ok) {
        const data = await resp.json();
        setCycles(data);
      }
    } catch {} finally {
      setCyclesLoading(false);
    }
  }

  async function fetchResults(cycleId: number) {
    setResultsLoading(true);
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/audit/cycles/${cycleId}/results`).then((r) => r.json());
      setResults(data);
    } catch {} finally {
      setResultsLoading(false);
    }
  }

  async function fetchAssets() {
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/assets/`).then((r) => r.json());
      setAssets(data);
    } catch {}
  }

  async function fetchDepartments() {
    try {
      const data = await apiFetch("/departments/");
      setDepartments(data);
    } catch {}
  }

  async function handleCreateCycle(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) { alert("User not loaded."); return; }
    setCreatingCycle(true);
    try {
      const resp = await apiFetch("/audit/cycles", {
        method: "POST",
        body: JSON.stringify({
          title: cycleTitle,
          department_id: cycleDeptId ? parseInt(cycleDeptId) : null,
          location: cycleLocation || null,
          start_date: cycleStart || null,
          end_date: cycleEnd || null,
          created_by: currentUser.id,
        }),
      });
      const newCycle: AuditCycle = {
        id: resp.id,
        title: cycleTitle,
        department_id: cycleDeptId ? parseInt(cycleDeptId) : null,
        location: cycleLocation || null,
        start_date: cycleStart || null,
        end_date: cycleEnd || null,
        status: "Open",
        created_at: new Date().toISOString(),
      };
      setCycles((prev) => [newCycle, ...prev]);
      setSelectedCycle(newCycle);
      setShowNewCycle(false);
      setCycleTitle(""); setCycleDeptId(""); setCycleLocation(""); setCycleStart(""); setCycleEnd("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCreatingCycle(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !selectedCycle) return;
    setVerifying(true);
    try {
      await apiFetch(`/audit/cycles/${selectedCycle.id}/verify`, {
        method: "POST",
        body: JSON.stringify({
          asset_id: parseInt(verifyAssetId),
          auditor_id: currentUser.id,
          result: verifyResult,
          remarks: verifyRemarks || null,
        }),
      });
      setShowVerify(false);
      setVerifyAssetId(""); setVerifyResult("Verified"); setVerifyRemarks("");
      fetchResults(selectedCycle.id);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setVerifying(false);
    }
  }

  async function handleCloseCycle() {
    if (!currentUser || !selectedCycle) return;
    if (!confirm("Close this audit cycle? This cannot be undone.")) return;
    setClosingCycle(true);
    try {
      await apiFetch(`/audit/cycles/${selectedCycle.id}/close?closed_by=${currentUser.id}`, { method: "POST" });
      setCycles((prev) => prev.map((c) => c.id === selectedCycle.id ? { ...c, status: "Closed" } : c));
      setSelectedCycle((prev) => prev ? { ...prev, status: "Closed" } : prev);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setClosingCycle(false);
    }
  }

  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const missing = results.filter((r) => r.result === "Missing").length;
  const damaged = results.filter((r) => r.result === "Damaged").length;

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/audit" />
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        <div className="flex-1 flex flex-col px-6 lg:px-10 py-8 max-w-[1200px] mx-auto w-full gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-h2 text-on-surface tracking-tight font-semibold">Asset Audit</h1>
              <p className="text-body-md text-on-surface-variant mt-1">Manage audit cycles, verify assets, and track discrepancies.</p>
            </div>
            <button
              onClick={() => setShowNewCycle(true)}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Audit Cycle
            </button>
          </div>

          <div className="flex gap-8 flex-col lg:flex-row">
            {/* Cycle Sidebar */}
            <div className="lg:w-72 shrink-0">
              <h3 className="text-sm font-bold text-outline uppercase tracking-wider mb-3">Audit Cycles</h3>
              <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                {cyclesLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : cycles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-outline px-4 text-center">
                    <span className="material-symbols-outlined text-[36px] mb-2 opacity-30">fact_check</span>
                    <p className="text-xs font-semibold">No audit cycles yet</p>
                    <p className="text-xs mt-1 opacity-70">Click "New Audit Cycle" to get started.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-outline-variant/10">
                    {cycles.map((cycle) => (
                      <li
                        key={cycle.id}
                        onClick={() => setSelectedCycle(cycle)}
                        className={`px-4 py-4 cursor-pointer transition-all hover:bg-surface-container-low/30 ${selectedCycle?.id === cycle.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                      >
                        <p className="text-sm font-semibold text-on-surface truncate">{cycle.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cycle.status === "Open" ? "bg-emerald-100 text-emerald-700" : "bg-outline-variant/20 text-outline"}`}>
                            {cycle.status}
                          </span>
                          {cycle.start_date && <span className="text-[11px] text-outline">{cycle.start_date}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Main Panel */}
            <div className="flex-1 min-w-0">
              {!selectedCycle ? (
                <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-outline-variant/20 shadow-sm py-20 text-outline">
                  <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">fact_check</span>
                  <p className="text-sm font-semibold">Select an audit cycle</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 flex flex-col gap-6">
                  {/* Cycle Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-container-high/40 rounded-xl border border-outline-variant/20">
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{selectedCycle.title}</h3>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        {selectedCycle.location && <span>{selectedCycle.location} · </span>}
                        {selectedCycle.start_date} {selectedCycle.end_date ? `→ ${selectedCycle.end_date}` : ""}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${selectedCycle.status === "Open" ? "bg-emerald-100 text-emerald-700" : "bg-outline-variant/20 text-outline"}`}>
                      {selectedCycle.status}
                    </span>
                  </div>

                  {/* Stats */}
                  {results.length > 0 && (missing > 0 || damaged > 0) && (
                    <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3">
                      <span className="material-symbols-outlined text-amber-700 shrink-0">warning</span>
                      <p className="text-sm font-bold text-amber-900">
                        {missing > 0 && `${missing} missing`}{missing > 0 && damaged > 0 ? ", " : ""}{damaged > 0 && `${damaged} damaged`} assets flagged — discrepancy report generated automatically.
                      </p>
                    </div>
                  )}

                  {/* Results Table */}
                  <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 bg-surface-container-lowest/50">
                      <h4 className="text-sm font-bold text-on-surface">Verification Checklist ({results.length} entries)</h4>
                      {selectedCycle.status === "Open" && (
                        <button onClick={() => setShowVerify(true)} className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all">
                          <span className="material-symbols-outlined text-[16px]">add_task</span>
                          Verify Asset
                        </button>
                      )}
                    </div>
                    {resultsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    ) : results.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-outline">
                        <p className="text-sm font-semibold">No assets verified yet</p>
                        <p className="text-xs mt-1">Click "Verify Asset" to add a result.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead className="bg-surface-container-lowest border-b border-outline-variant/10">
                            <tr>
                              {["Asset", "Result", "Remarks", "Verified At"].map((h) => (
                                <th key={h} className="py-4 px-5 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {results.map((r) => {
                              const asset = assetMap.get(r.asset_id);
                              return (
                                <tr key={r.id} className="hover:bg-surface-container-low/30 transition-colors">
                                  <td className="py-4 px-5 whitespace-nowrap">
                                    <span className="font-bold text-primary text-sm">{asset?.asset_tag || `#${r.asset_id}`}</span>
                                    {asset && <p className="text-xs text-on-surface-variant mt-0.5">{asset.name}</p>}
                                  </td>
                                  <td className="py-4 px-5">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${RESULT_COLORS[r.result] || ""}`}>
                                      {r.result}
                                    </span>
                                  </td>
                                  <td className="py-4 px-5 text-sm text-on-surface-variant max-w-[200px]">
                                    <span className="truncate block">{r.remarks || "—"}</span>
                                  </td>
                                  <td className="py-4 px-5 text-sm text-on-surface-variant whitespace-nowrap">
                                    {new Date(r.verified_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {selectedCycle.status === "Open" && (
                    <div className="flex justify-end">
                      <button onClick={handleCloseCycle} disabled={closingCycle} className="flex items-center gap-2 bg-teal-50 text-teal-800 border border-teal-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-100 transition-all disabled:opacity-50">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        {closingCycle ? "Closing..." : "Close Audit Cycle"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Cycle Modal */}
        {showNewCycle && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowNewCycle(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Create Audit Cycle</h3>
              <form onSubmit={handleCreateCycle} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Title <span className="text-error">*</span></label>
                  <input required value={cycleTitle} onChange={(e) => setCycleTitle(e.target.value)} placeholder="e.g. Q3 Audit: Engineering" className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Department</label>
                  <select value={cycleDeptId} onChange={(e) => setCycleDeptId(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                    <option value="">No specific department</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Location</label>
                  <input value={cycleLocation} onChange={(e) => setCycleLocation(e.target.value)} placeholder="e.g. HQ Floor 2" className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-label-md font-semibold text-on-surface/90">Start Date</label>
                    <input type="date" value={cycleStart} onChange={(e) => setCycleStart(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md font-semibold text-on-surface/90">End Date</label>
                    <input type="date" value={cycleEnd} onChange={(e) => setCycleEnd(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowNewCycle(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={creatingCycle} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">{creatingCycle ? "Creating..." : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Verify Asset Modal */}
        {showVerify && selectedCycle && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowVerify(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Verify Asset</h3>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Asset <span className="text-error">*</span></label>
                  <select required value={verifyAssetId} onChange={(e) => setVerifyAssetId(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                    <option value="">Select asset...</option>
                    {assets.map((a) => <option key={a.id} value={a.id}>{a.asset_tag} — {a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Result <span className="text-error">*</span></label>
                  <div className="flex gap-3">
                    {["Verified", "Missing", "Damaged"].map((r) => (
                      <button
                        key={r} type="button" onClick={() => setVerifyResult(r)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${verifyResult === r
                          ? r === "Verified" ? "bg-emerald-600 text-white border-emerald-600" : r === "Missing" ? "bg-error text-white border-error" : "bg-amber-500 text-white border-amber-500"
                          : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Remarks</label>
                  <input value={verifyRemarks} onChange={(e) => setVerifyRemarks(e.target.value)} placeholder="Optional notes..." className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowVerify(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={verifying} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">{verifying ? "Saving..." : "Save Result"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
