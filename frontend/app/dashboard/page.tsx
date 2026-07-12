"use client";

import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import Link from "next/link";

export default function DashboardPage() {
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

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 animate-slide-in stagger-1">
            {[
              { icon: 'inventory_2', label: 'Total', value: '1,284', iconBg: 'bg-primary/5', iconColor: 'text-primary' },
              { icon: 'verified', label: 'Ready', value: '432', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
              { icon: 'person_pin_circle', label: 'In Use', value: '715', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
              { icon: 'build', label: 'Repair', value: '84', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
              { icon: 'sync_alt', label: 'Transit', value: '12', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
              { icon: 'calendar_today', label: 'Booked', value: '38', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
              { icon: 'keyboard_return', label: 'Returns', value: '06', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
            ].map((kpi) => (
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
                {['SEPT 01', 'SEPT 08', 'SEPT 15', 'SEPT 22', 'SEPT 30'].map((d, i) => (
                  <span key={d} className={`text-[9px] lg:text-[10px] font-bold ${i === 2 ? 'text-primary' : 'text-outline/50'}`}>{d}</span>
                ))}
              </div>
            </div>
            
            {/* Donut Chart: Dept Allocation */}
            <div className="lg:col-span-4 bg-white p-6 lg:p-8 rounded-2xl card-soft-shadow border border-outline-variant/10 flex flex-col overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold text-on-surface tracking-tight mb-1 truncate">Department Share</h3>
              <p className="text-sm text-outline mb-8 truncate">Resource split by operational units</p>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 lg:w-56 lg:h-56 mb-8">
                  <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#f1f5f9" strokeWidth="4"></circle>
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#004ac6" strokeDasharray="45 100" strokeLinecap="round" strokeWidth="4.5"></circle>
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#4648d4" strokeDasharray="25 100" strokeDashoffset="-45" strokeLinecap="round" strokeWidth="4.5"></circle>
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#943700" strokeDasharray="20 100" strokeDashoffset="-70" strokeLinecap="round" strokeWidth="4.5"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl lg:text-3xl font-extrabold text-on-surface">1.2k</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-outline">Assets</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {[
                    { label: 'IT & Ops', color: 'bg-primary', pct: '45%' },
                    { label: 'R&D Team', color: 'bg-secondary', pct: '25%' },
                    { label: 'Logistics', color: 'bg-tertiary', pct: '20%' },
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
          
          {/* Activity + Table Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 animate-slide-in stagger-3">
            {/* Activity Timeline */}
            <div className="lg:col-span-5 bg-white p-6 lg:p-8 rounded-2xl card-soft-shadow border border-outline-variant/10 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg lg:text-xl font-bold text-on-surface tracking-tight truncate">Recent Activity</h3>
                <button className="text-primary font-bold text-xs hover:underline decoration-2 underline-offset-4 shrink-0 ml-2">History</button>
              </div>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-outline-variant/20">
                {[
                  { icon: 'check', iconBg: 'bg-emerald-50 text-emerald-600', title: 'Maintenance Complete', desc: 'for Server Rack #82-X', time: 'Today, 09:42 AM • Mark J.', timeIcon: 'schedule' },
                  { icon: 'swap_horiz', iconBg: 'bg-blue-50 text-blue-600', title: 'Transfer Approved', desc: ': 12x MacBooks to Design', time: 'Yesterday, 04:15 PM • Sarah L.', timeIcon: 'schedule' },
                  { icon: 'priority_high', iconBg: 'bg-amber-50 text-amber-600', title: 'Critical Issue', desc: ': Cooling Failure in Center B', time: '2 days ago • Automated Alert', timeIcon: 'sensors' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`w-6 h-6 ${act.iconBg} rounded-full flex items-center justify-center z-10 ring-4 ring-white shrink-0`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{act.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-on-surface leading-relaxed">
                        <span className="font-bold">{act.title}</span>
                        <span className="break-words">{act.desc}</span>
                      </p>
                      <p className="text-[11px] font-medium text-outline mt-1.5 flex items-center gap-1 flex-wrap">
                        <span className="material-symbols-outlined text-[12px]">{act.timeIcon}</span>
                        <span className="truncate">{act.time}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Asset Review Table */}
            <div className="lg:col-span-7 bg-white rounded-2xl card-soft-shadow border border-outline-variant/10 overflow-hidden flex flex-col">
              <div className="p-6 lg:p-8 border-b border-outline-variant/10 flex items-center justify-between gap-2">
                <h3 className="text-lg lg:text-xl font-bold text-on-surface tracking-tight truncate">Critical Assets Review</h3>
                <div className="flex gap-1 shrink-0">
                  <button className="p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors">
                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  </button>
                  <button className="p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-surface-container-low/30">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Asset ID</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Product</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Assigned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {[
                      { id: '#AF-77291', name: 'MBP 16" M3', icon: 'laptop_mac', status: 'Healthy', statusColor: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10', assigned: 'James Wilson' },
                      { id: '#AF-88210', name: 'Nexus 9000', icon: 'router', status: 'In Review', statusColor: 'bg-amber-50 text-amber-700 ring-amber-600/10', assigned: 'Infra Team' },
                      { id: '#AF-11002', name: 'HP LaserJet', icon: 'print', status: 'Critical', statusColor: 'bg-rose-50 text-rose-700 ring-rose-600/10', assigned: '—' },
                    ].map((row) => (
                      <tr key={row.id} className="hover:bg-surface-container-low/40 transition-colors group">
                        <td className="px-6 py-4 text-sm font-bold text-primary whitespace-nowrap">{row.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-sm opacity-60">{row.icon}</span>
                            </div>
                            <p className="text-sm font-semibold text-on-surface whitespace-nowrap">{row.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${row.statusColor} ring-1 uppercase whitespace-nowrap`}>{row.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-on-surface-variant whitespace-nowrap">{row.assigned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 bg-surface-container-low/20 border-t border-outline-variant/10 flex items-center justify-between">
                <p className="text-[10px] font-bold text-outline/60 uppercase tracking-widest">Showing 3 of 1.2k</p>
                <div className="flex gap-3">
                  <button className="px-4 py-1.5 bg-white border border-outline-variant/20 rounded-lg text-xs font-bold shadow-sm opacity-50 cursor-not-allowed">Back</button>
                  <button className="px-4 py-1.5 bg-white border border-outline-variant/20 rounded-lg text-xs font-bold shadow-sm hover:bg-surface-container-low transition-colors">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
