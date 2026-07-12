"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { apiFetch } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  description: string | null;
  warranty_period_months: number | null;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Categories");
  const tabs = ["Categories", "General", "Security"];

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newWarranty, setNewWarranty] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === "Categories") {
      fetchCategories();
    }
  }, [activeTab]);

  async function fetchCategories() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/categories/");
      setCategories(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/categories/", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          description: newDesc || null,
          warranty_period_months: newWarranty ? parseInt(newWarranty) : null,
        }),
      });
      setShowAdd(false);
      setNewName(""); setNewDesc(""); setNewWarranty("");
      fetchCategories();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category?")) return;
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/settings" />
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        <div className="flex-1 flex flex-col px-6 lg:px-10 py-8 max-w-[1000px] mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-h2 text-on-surface tracking-tight font-semibold truncate">System Settings</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Configure asset categories and application preferences.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 flex-1 flex flex-col overflow-hidden">
            {/* Tabs Row */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center gap-2 overflow-x-auto custom-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap border ${
                    activeTab === tab
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-white text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Categories Content */}
            {activeTab === "Categories" && (
              <div className="flex-1 p-6 lg:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-on-surface">Asset Categories</h3>
                  <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Category
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="bg-error/10 text-error border border-error/20 p-4 rounded-xl text-sm font-semibold">
                    {error}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-outline">
                    <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">category</span>
                    <p className="text-sm font-semibold">No categories yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-lowest border-b border-outline-variant/10">
                        <tr>
                          {["Name", "Description", "Warranty (Months)", "Actions"].map((h) => (
                            <th key={h} className="py-4 px-5 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {categories.map((c) => (
                          <tr key={c.id} className="hover:bg-surface-container-low/30 transition-colors">
                            <td className="py-4 px-5 font-semibold text-on-surface">{c.name}</td>
                            <td className="py-4 px-5 text-sm text-on-surface-variant max-w-[300px] truncate">{c.description || "—"}</td>
                            <td className="py-4 px-5 text-sm text-on-surface-variant">{c.warranty_period_months || "—"}</td>
                            <td className="py-4 px-5">
                              <button onClick={() => handleDelete(c.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 text-outline hover:text-error transition-all">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Other Tabs Stub */}
            {activeTab !== "Categories" && (
              <div className="flex-1 p-6 lg:p-8 flex items-center justify-center">
                <p className="text-outline text-sm font-medium">{activeTab} settings coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Category Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Category Name <span className="text-error">*</span></label>
                  <input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Computing Hardware" className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Description</label>
                  <textarea rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description..." className="w-full p-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Default Warranty (Months)</label>
                  <input type="number" min="0" value={newWarranty} onChange={(e) => setNewWarranty(e.target.value)} placeholder="e.g. 12" className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">{submitting ? "Saving..." : "Save Category"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
