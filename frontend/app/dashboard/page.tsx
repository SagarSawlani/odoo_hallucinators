"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface DashboardSummary {
  total_assets: number;
  available: number;
  allocated: number;
  undermaintenance: number;
  lost: number;
  active_bookings: number;
  pending_maintenance: number;
  open_audit_cycles: number;
  recent_notifications: { id: number; message: string; created_at: string; is_read: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/dashboard/summary")
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data
    ? [
        { icon: "inventory_2", label: "Total", value: data.total_assets.toLocaleString(), iconBg: "bg-primary/5", iconColor: "text-primary" },
        { icon: "verified", label: "Available", value: data.available.toLocaleString(), iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
        { icon: "person_pin_circle", label: "Allocated", value: data.allocated.toLocaleString(), iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { icon: "build", label: "Maintenance", value: data.undermaintenance.toLocaleString(), iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        { icon: "search_off", label: "Lost", value: data.lost.toLocaleString(), iconBg: "bg-rose-50", iconColor: "text-rose-600" },
        { icon: "calendar_today", label: "Bookings", value: data.active_bookings.toLocaleString(), iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
        { icon: "pending_actions", label: "Pending", value: data.pending_maintenance.toLocaleString(), iconBg: "bg-purple-50", iconColor: "text-purple-600" },
      ]
    : [];

  return (
    <div className="bg-background text-on-background transition-colors duration-300">
      <Sidebar activePath="/dashboard" />

      {/* Main Content Area */}
      <main className="md:pl-[280px] min-h-screen overflow-x-hidden">
        <TopNav />

        {/* Dashboard Content */}
        <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-10">
          {/* Page Title & Quick Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-slide-in">
            <div className="min-w-0">
              <nav className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                <span>Ecosystem</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-outline">Live Dashboard</span>
              </nav>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight truncate">Enterprise Overview</h2>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/assets/new" className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Register Asset
              </Link>
              <button className="flex items-center gap-2 bg-white text-on-surface border border-outline-variant/30 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-all active:scale-[0.98] whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Manage
              </button>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-outline">Loading dashboard data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex gap-3">
              <span className="material-symbols-outlined text-error shrink-0">error</span>
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          )}

          {data && (
            <>
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 animate-slide-in stagger-1">
                {kpis.map((kpi) => (
                  <div key={kpi.label} className="bg-white p-5 rounded-2xl card-soft-shadow border border-outline-variant/10 card-hover transition-all">
                    <div className={`w-8 h-8 ${kpi.iconBg} ${kpi.iconColor} rounded-lg flex items-center justify-center mb-3`}>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                    </div>
                    <p className="text-outline text-[11px] font-bold uppercase tracking-wider mb-1 truncate">{kpi.label}</p>
                    <h4 className="text-2xl font-extrabold text-on-surface">{kpi.value}</h4>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 animate-slide-in stagger-2">
                {/* Chart: Asset Utilization */}
                <div className="lg:col-span-8 bg-white p-6 lg:p-8 rounded-2xl card-soft-shadow border border-outline-variant/10 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg lg:text-xl font-bold text-on-surface tracking-tight truncate">Asset Utilization</h3>
                      <p className="text-sm text-outline mt-1 truncate">Real-time aggregate across global departments</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                        <span className="w-2 h-2 rounded-full bg-primary"></span> Live Sync
                      </span>
                      <select className="bg-surface-container-low/50 border border-outline-variant/20 rounded-lg text-xs font-semibold px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none">
                        <option>Last 30 Days</option>
                        <option>Last 6 Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-56 lg:h-72 relative">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-full h-[1px] bg-outline-variant/10"></div>
                      ))}
                    </div>
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 800 288" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#004ac6" stopOpacity="0.15"></stop>
                          <stop offset="100%" stopColor="#004ac6" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                      <path d="M0,220 C100,200 150,210 200,205 C250,200 300,160 400,150 C500,140 600,110 700,95 C750,85 800,90 800,90 L800,288 L0,288 Z" fill="url(#chartGradient)"></path>
                      <path d="M0,220 C100,200 150,210 200,205 C250,200 300,160 400,150 C500,140 600,110 700,95 C750,85 800,90 800,90" fill="none" stroke="#004ac6" strokeLinecap="round" strokeWidth="3"></path>
                      <circle cx="400" cy="150" fill="#004ac6" r="5" stroke="#fff" strokeWidth="3"></circle>
                    </svg>
                  </div>
                  <div className="flex justify-between mt-4 px-1">
                    {["SEPT 01", "SEPT 08", "SEPT 15", "SEPT 22", "SEPT 30"].map((d, i) => (
                      <span key={d} className={`text-[9px] lg:text-[10px] font-bold ${i === 2 ? "text-primary" : "text-outline/50"}`}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Donut Chart: Dept Allocation */}
                <div className="lg:col-span-4 bg-white p-6 lg:p-8 rounded-2xl card-soft-shadow border border-outline-variant/10 flex flex-col overflow-hidden">
                  <h3 className="text-lg lg:text-xl font-bold text-on-surface tracking-tight mb-1 truncate">Asset Status Split</h3>
                  <p className="text-sm text-outline mb-8 truncate">Available vs Allocated vs Maintenance</p>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40 lg:w-56 lg:h-56 mb-8">
                      <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" fill="none" r="16" stroke="#f1f5f9" strokeWidth="4"></circle>
                        {(() => {
                          const total = data.total_assets || 1;
                          const avPct = Math.round((data.available / total) * 100);
                          const alPct = Math.round((data.allocated / total) * 100);
                          const mtPct = Math.round((data.undermaintenance / total) * 100);
                          return (
                            <>
                              <circle cx="18" cy="18" fill="none" r="16" stroke="#16a34a" strokeDasharray={`${avPct} ${100 - avPct}`} strokeLinecap="round" strokeWidth="4.5"></circle>
                              <circle cx="18" cy="18" fill="none" r="16" stroke="#004ac6" strokeDasharray={`${alPct} ${100 - alPct}`} strokeDashoffset={`-${avPct}`} strokeLinecap="round" strokeWidth="4.5"></circle>
                              <circle cx="18" cy="18" fill="none" r="16" stroke="#d97706" strokeDasharray={`${mtPct} ${100 - mtPct}`} strokeDashoffset={`-${avPct + alPct}`} strokeLinecap="round" strokeWidth="4.5"></circle>
                            </>
                          );
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl lg:text-3xl font-extrabold text-on-surface">{data.total_assets.toLocaleString()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-outline">Assets</span>
                      </div>
                    </div>
                    <div className="w-full space-y-3">
                      {[
                        { label: "Available", color: "bg-emerald-500", pct: `${data.total_assets ? Math.round((data.available / data.total_assets) * 100) : 0}%` },
                        { label: "Allocated", color: "bg-primary", pct: `${data.total_assets ? Math.round((data.allocated / data.total_assets) * 100) : 0}%` },
                        { label: "Maintenance", color: "bg-amber-500", pct: `${data.total_assets ? Math.round((data.undermaintenance / data.total_assets) * 100) : 0}%` },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm shrink-0`}></span>
                            <span className="font-medium text-on-surface truncate">{item.label}</span>
                          </div>
                          <span className="font-bold shrink-0 ml-2">{item.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Notifications + Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 animate-slide-in stagger-3">
                {/* Recent Notifications */}
                <div className="lg:col-span-5 bg-white p-6 lg:p-8 rounded-2xl card-soft-shadow border border-outline-variant/10 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg lg:text-xl font-bold text-on-surface tracking-tight truncate">Recent Notifications</h3>
                    <Link href="/notifications" className="text-primary font-bold text-xs hover:underline decoration-2 underline-offset-4 shrink-0 ml-2">View All</Link>
                  </div>
                  {data.recent_notifications.length === 0 ? (
                    <p className="text-sm text-outline text-center py-8">No recent notifications</p>
                  ) : (
                    <div className="space-y-4">
                      {data.recent_notifications.map((notif) => (
                        <div key={notif.id} className="flex gap-3 items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.is_read ? "bg-outline-variant" : "bg-primary"}`}></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-on-surface leading-relaxed truncate">{notif.message}</p>
                            <p className="text-[11px] font-medium text-outline mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Summary Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-2xl card-soft-shadow border border-outline-variant/10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
                    </div>
                    <p className="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Pending Maintenance</p>
                    <h4 className="text-3xl font-extrabold text-on-surface">{data.pending_maintenance}</h4>
                  </div>
                  <div className="bg-white p-6 rounded-2xl card-soft-shadow border border-outline-variant/10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                    </div>
                    <p className="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Active Bookings</p>
                    <h4 className="text-3xl font-extrabold text-on-surface">{data.active_bookings}</h4>
                  </div>
                  <div className="bg-white p-6 rounded-2xl card-soft-shadow border border-outline-variant/10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
                    </div>
                    <p className="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Open Audit Cycles</p>
                    <h4 className="text-3xl font-extrabold text-on-surface">{data.open_audit_cycles}</h4>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
