"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";

interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  category: string | null;
  serial_number: string | null;
  location: string | null;
  condition: string;
  status: string;
  is_bookable: number;
  criticality: string | null;
  department: string | null;
  holder: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  department_name: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Allocated: "bg-primary/5 text-primary ring-primary/10",
  UnderMaintenance: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Lost: "bg-error/10 text-error ring-error/20",
  Retired: "bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30",
  Disposed: "bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30",
  Reserved: "bg-secondary/10 text-secondary ring-secondary/20",
};
const STATUS_DOT: Record<string, string> = {
  Available: "bg-emerald-500",
  Allocated: "bg-primary",
  UnderMaintenance: "bg-amber-500",
  Lost: "bg-error",
  Retired: "bg-outline",
  Disposed: "bg-outline",
  Reserved: "bg-secondary",
};

export default function AssetDirectoryPage() {
  const { user: currentUser } = useCurrentUser();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");

  // Add asset modal
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newCondition, setNewCondition] = useState("Good");
  const [newLocation, setNewLocation] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newBookable, setNewBookable] = useState(false);
  const [newCriticality, setNewCriticality] = useState("Low");
  const [adding, setAdding] = useState(false);

  // Allocate modal
  const [showAllocate, setShowAllocate] = useState(false);
  const [allocatingAssetId, setAllocatingAssetId] = useState<number | null>(null);
  const [selEmployeeId, setSelEmployeeId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [allocating, setAllocating] = useState(false);

  // Bulk upload modal
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

  useEffect(() => {
    Promise.all([fetchAssets(), fetchCategories(), fetchEmployees()]);
  }, []);

  async function fetchAssets() {
    setLoading(true);
    setError("");
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/assets/`).then((r) => r.json());
      setAssets(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/categories/`).then((r) => r.json());
      setCategories(data);
    } catch {}
  }

  async function fetchEmployees() {
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/employees/`).then((r) => r.json());
      setEmployees(data);
    } catch {}
  }

  async function handleAllocate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) { alert("User not loaded yet."); return; }
    if (!allocatingAssetId || !selEmployeeId) return;
    setAllocating(true);
    try {
      await apiFetch("/allocations/", {
        method: "POST",
        body: JSON.stringify({
          asset_id: allocatingAssetId,
          employee_id: parseInt(selEmployeeId),
          allocated_by: currentUser.id,
          expected_return_date: expectedReturnDate || null,
        }),
      });
      setShowAllocate(false);
      setAllocatingAssetId(null); setSelEmployeeId(""); setExpectedReturnDate("");
      fetchAssets();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAllocating(false);
    }
  }

  async function handleAddAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryId) { alert("Please select a category"); return; }
    setAdding(true);
    try {
      await apiFetch("/assets/", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          category_id: parseInt(newCategoryId),
          condition: newCondition,
          location: newLocation || null,
          serial_number: newSerial || null,
          acquisition_cost: newCost ? parseFloat(newCost) : null,
          is_bookable: newBookable,
          criticality: newCriticality,
        }),
      });
      setShowAdd(false);
      setNewName(""); setNewCategoryId(""); setNewCondition("Good");
      setNewLocation(""); setNewSerial(""); setNewCost(""); setNewBookable(false);
      fetchAssets();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAdding(false);
    }
  }

  function handleDownloadTemplate() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/assets/bulk-upload/template`;
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkFile) return;
    setBulkUploading(true);
    setBulkResult(null);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/assets/bulk-upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }
      setBulkResult(data);
      if (data.success_count > 0) fetchAssets();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBulkUploading(false);
    }
  }

  async function handleDispose(assetId: number) {
    if (!confirm("Mark this asset as Disposed?")) return;
    try {
      await apiFetch(`/assets/${assetId}`, { method: "DELETE" });
      fetchAssets();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const filtered = assets.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterCategory && a.category !== filterCategory) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.asset_tag.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categoryNames = [...new Set(assets.map((a) => a.category).filter(Boolean))];

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/assets" />
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        <div className="px-6 lg:px-8 py-8 max-w-[1440px] mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div className="min-w-0">
              <h1 className="text-h1 text-on-surface tracking-tight font-semibold">Asset Directory</h1>
              <p className="text-body-md text-on-surface-variant mt-2">Central management for all registered organizational assets.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowBulkUpload(true); setBulkResult(null); setBulkFile(null); }}
                className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-label-md font-medium hover:bg-secondary/20 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Bulk Import
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-primary text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-label-md font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-md whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Register New Asset
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center gap-2 mb-8">
            <div className="flex items-center gap-2 px-3 py-2 border-r border-outline-variant/20 shrink-0">
              <span className="material-symbols-outlined text-outline text-[20px]">tune</span>
              <span className="text-label-md text-on-surface-variant font-medium whitespace-nowrap">Filter by</span>
            </div>
            <input
              type="text"
              placeholder="Search name or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 px-4 bg-surface-container-low/50 ring-1 ring-outline-variant/30 rounded-xl text-body-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none min-w-[180px]"
            />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-10 px-4 bg-surface-container-low/50 ring-1 ring-outline-variant/30 rounded-xl text-body-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none">
              <option value="">All Categories</option>
              {categoryNames.map((c) => <option key={c as string} value={c as string}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 px-4 bg-surface-container-low/50 ring-1 ring-outline-variant/30 rounded-xl text-body-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none">
              <option value="">All Statuses</option>
              {["Available","Allocated","Reserved","UnderMaintenance","Lost","Retired","Disposed"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="ml-auto flex items-center gap-2 pr-1 shrink-0">
              <button onClick={fetchAssets} className="h-10 w-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all">
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-outline">Loading assets...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex gap-3">
                  <span className="material-symbols-outlined text-error shrink-0">error</span>
                  <p className="text-sm font-medium text-error">{error}</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-outline">
                <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">inventory_2</span>
                <p className="text-sm font-semibold">No assets found</p>
                <p className="text-xs mt-1">Try adjusting your filters or register a new asset.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
                      {["Asset Tag", "Name", "Category", "Department", "Holder", "Status", "Location", ""].map((h) => (
                        <th key={h} className="py-5 px-4 text-label-sm text-outline uppercase tracking-wider font-bold text-[11px] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-container-low/30 transition-all group">
                        <td className="py-5 px-4">
                          <span className="text-body-sm font-semibold text-primary/80 px-2 py-1 bg-primary/5 rounded-md whitespace-nowrap">{row.asset_tag}</span>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-surface-container-high/50 rounded-xl flex items-center justify-center ring-1 ring-outline-variant/10 shrink-0">
                              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">inventory_2</span>
                            </div>
                            <span className="text-body-sm font-semibold text-on-surface whitespace-nowrap">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap">{row.category || "—"}</td>
                        <td className="py-5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap">{row.department || "—"}</td>
                        <td className="py-5 px-4">
                          {row.holder ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-primary rounded-full text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm shrink-0">
                                {row.holder.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                              </div>
                              <span className="text-body-sm text-on-surface font-medium whitespace-nowrap">{row.holder}</span>
                            </div>
                          ) : (
                            <span className="text-outline/60 italic text-body-sm">— Unassigned</span>
                          )}
                        </td>
                        <td className="py-5 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ring-1 ring-inset whitespace-nowrap ${STATUS_COLORS[row.status] || "bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${STATUS_DOT[row.status] || "bg-outline"}`}></span>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap">{row.location || "—"}</td>
                        <td className="py-5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {row.status === "Available" && (
                              <button
                                onClick={() => { setAllocatingAssetId(row.id); setShowAllocate(true); }}
                                title="Allocate asset"
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-outline hover:text-primary transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDispose(row.id)}
                              title="Dispose asset"
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 text-outline hover:text-error transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-body-sm text-outline font-medium">
                Showing <span className="text-on-surface font-bold">{filtered.length}</span> of <span className="text-on-surface font-bold">{assets.length}</span> assets
              </p>
            </div>
          </div>
        </div>

        {/* Add Asset Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Register New Asset</h3>
              <form onSubmit={handleAddAsset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-label-md font-semibold text-on-surface/90">Name <span className="text-error">*</span></label>
                  <input required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-semibold text-on-surface/90">Category <span className="text-error">*</span></label>
                  <select required value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                    <option value="">Select category...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-label-md font-semibold text-on-surface/90">Condition</label>
                    <select value={newCondition} onChange={(e) => setNewCondition(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                      {["Excellent","Good","Fair","Poor"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label-md font-semibold text-on-surface/90">Criticality</label>
                    <select value={newCriticality} onChange={(e) => setNewCriticality(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                      {["Low","Medium","High","Critical"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-semibold text-on-surface/90">Location</label>
                  <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-label-md font-semibold text-on-surface/90">Serial Number</label>
                    <input value={newSerial} onChange={(e) => setNewSerial(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label-md font-semibold text-on-surface/90">Cost (₹)</label>
                    <input type="number" value={newCost} onChange={(e) => setNewCost(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={newBookable} onChange={(e) => setNewBookable(e.target.checked)} className="w-4 h-4 rounded text-primary" />
                  <span className="text-sm font-medium text-on-surface">Bookable resource</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={adding} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">{adding ? "Registering..." : "Register"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Allocate Asset Modal */}
        {showAllocate && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAllocate(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Allocate Asset</h3>
              <form onSubmit={handleAllocate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-label-md font-semibold text-on-surface/90">Assign To <span className="text-error">*</span></label>
                  <select required value={selEmployeeId} onChange={(e) => setSelEmployeeId(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none">
                    <option value="">Select employee...</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}{emp.department_name ? ` — ${emp.department_name}` : ""}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-semibold text-on-surface/90">Expected Return Date</label>
                  <input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} className="w-full h-11 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAllocate(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={allocating} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">{allocating ? "Allocating..." : "Allocate"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowBulkUpload(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Bulk Import Assets</h3>
              
              {!bulkResult ? (
                <>
                  <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 mb-6">
                    <h4 className="font-semibold text-sm mb-2 text-on-surface">Instructions</h4>
                    <ul className="text-sm text-on-surface-variant list-disc pl-5 space-y-1">
                      <li>Download the template and fill in your asset data.</li>
                      <li>Do not modify the column headers.</li>
                      <li>Required fields: Asset Name, Category, Condition.</li>
                      <li>Condition must be: Excellent, Good, Fair, or Poor.</li>
                    </ul>
                    <button onClick={handleDownloadTemplate} type="button" className="mt-4 flex items-center gap-2 text-primary font-medium text-sm hover:underline">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Download Template (.xlsx)
                    </button>
                  </div>
                  
                  <form onSubmit={handleBulkUpload} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-label-md font-semibold text-on-surface/90">Select Excel File</label>
                      <input 
                        type="file" 
                        accept=".xlsx" 
                        required 
                        onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all border border-outline-variant/40 rounded-xl p-2 bg-surface/50" 
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setShowBulkUpload(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                      <button type="submit" disabled={bulkUploading || !bulkFile} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                        {bulkUploading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {bulkUploading ? "Uploading..." : "Start Import"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-1">{bulkResult.success_count}</div>
                      <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Imported</div>
                    </div>
                    <div className="flex-1 bg-error/10 border border-error/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-error mb-1">{bulkResult.failed_count}</div>
                      <div className="text-xs font-semibold text-error uppercase tracking-wide">Failed</div>
                    </div>
                  </div>
                  
                  {bulkResult.errors && bulkResult.errors.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm mb-3 text-on-surface">Error Details</h4>
                      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl max-h-[250px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-surface-container-low sticky top-0 border-b border-outline-variant/20">
                            <tr>
                              <th className="py-2 px-4 font-semibold text-on-surface-variant w-20">Row</th>
                              <th className="py-2 px-4 font-semibold text-on-surface-variant">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {bulkResult.errors.map((err: any, idx: number) => (
                              <tr key={idx} className="hover:bg-error/5">
                                <td className="py-2 px-4 font-medium">{err.row}</td>
                                <td className="py-2 px-4 text-error">{err.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={() => setShowBulkUpload(false)} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all">Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
