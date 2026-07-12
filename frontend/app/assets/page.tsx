"use client";

import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import Link from "next/link";

export default function AssetDirectoryPage() {
  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/assets" />
      
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        
        <div className="px-6 lg:px-8 py-8 max-w-[1440px] mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div className="min-w-0">
              <nav className="flex items-center gap-2 text-outline text-label-sm mb-3">
                <span className="hover:text-primary transition-colors cursor-pointer">Assets</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-primary font-bold">Directory</span>
              </nav>
              <h1 className="text-h1 text-on-surface tracking-tight font-semibold">Asset Directory</h1>
              <p className="text-body-md text-on-surface-variant mt-2 max-w-xl">Central management for organization resources across global departments.</p>
            </div>
            <Link href="/assets/new" className="btn-tactile bg-primary text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-label-md font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-md whitespace-nowrap shrink-0">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Register New Asset
            </Link>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center gap-2 mb-8">
            <div className="flex items-center gap-2 px-3 py-2 border-r border-outline-variant/20 shrink-0">
              <span className="material-symbols-outlined text-outline text-[20px]">tune</span>
              <span className="text-label-md text-on-surface-variant font-medium whitespace-nowrap">Filter by</span>
            </div>
            <select className="h-10 px-4 pr-10 bg-surface-container-low/50 border-none ring-1 ring-outline-variant/30 rounded-xl text-body-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all min-w-[140px] outline-none">
              <option>All Categories</option>
              <option>Computing Hardware</option>
              <option>Mobile Devices</option>
              <option>Software</option>
            </select>
            <select className="h-10 px-4 pr-10 bg-surface-container-low/50 border-none ring-1 ring-outline-variant/30 rounded-xl text-body-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all min-w-[130px] outline-none">
              <option>Department</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Operations</option>
            </select>
            <select className="h-10 px-4 pr-10 bg-surface-container-low/50 border-none ring-1 ring-outline-variant/30 rounded-xl text-body-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all min-w-[110px] outline-none">
              <option>Status</option>
              <option>In Use</option>
              <option>Available</option>
              <option>Maintenance</option>
            </select>
            <div className="ml-auto flex items-center gap-2 pr-1 shrink-0">
              <button className="h-10 px-4 flex items-center gap-2 text-label-sm text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all border border-transparent hover:border-outline-variant/20 whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">file_download</span>
                Export
              </button>
              <button className="h-10 w-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all">
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
                    <th className="py-5 px-5 w-12 text-center">
                      <input type="checkbox" className="rounded-md text-primary focus:ring-primary/30 border-outline-variant h-4 w-4" />
                    </th>
                    {['Asset Tag', 'Name', 'Category', 'Department', 'Holder', 'Status', 'Location'].map(h => (
                      <th key={h} className="py-5 px-4 text-label-sm text-outline uppercase tracking-wider font-bold text-[11px] whitespace-nowrap">{h}</th>
                    ))}
                    <th className="py-5 px-5 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {[
                    { tag: '#AST-99042', name: 'MacBook Pro M2 Max 16"', icon: 'laptop_mac', cat: 'Computing', dept: 'Engineering', holder: 'Alex Rivera', holderInitials: 'AR', holderColor: 'bg-primary', status: 'In Use', statusColor: 'bg-secondary/10 text-secondary ring-secondary/20', loc: 'HQ - Room 402' },
                    { tag: '#AST-88219', name: 'Dell UltraSharp 32" 4K', icon: 'monitor', cat: 'Hardware', dept: 'Design', holder: null, holderInitials: null, holderColor: null, status: 'Available', statusColor: 'bg-emerald-500/10 text-emerald-600 ring-emerald-600/20', loc: 'Storage A-1' },
                    { tag: '#AST-77102', name: 'Xerox PrimeLink C9070', icon: 'print', cat: 'Infrastructure', dept: 'Operations', holder: 'Maria Zhang', holderInitials: 'MZ', holderColor: 'bg-tertiary', status: 'Maintenance', statusColor: 'bg-error/10 text-error ring-error/20', loc: 'Service Center' },
                  ].map((row) => (
                    <tr key={row.tag} className="hover:bg-surface-container-low/30 transition-all group">
                      <td className="py-5 px-5 text-center">
                        <input type="checkbox" className="rounded-md text-primary focus:ring-primary/30 border-outline-variant h-4 w-4" />
                      </td>
                      <td className="py-5 px-4">
                        <span className="text-body-sm font-semibold text-primary/80 px-2 py-1 bg-primary/5 rounded-md whitespace-nowrap">{row.tag}</span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-surface-container-high/50 rounded-xl flex items-center justify-center ring-1 ring-outline-variant/10 shrink-0">
                            <span className="material-symbols-outlined text-[22px] text-on-surface-variant">{row.icon}</span>
                          </div>
                          <span className="text-body-sm font-semibold text-on-surface whitespace-nowrap">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap">{row.cat}</td>
                      <td className="py-5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap">{row.dept}</td>
                      <td className="py-5 px-4">
                        {row.holder ? (
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 ${row.holderColor} rounded-full text-white flex items-center justify-center text-xs ring-2 ring-white shadow-sm shrink-0`}>{row.holderInitials}</div>
                            <span className="text-body-sm text-on-surface font-medium whitespace-nowrap">{row.holder}</span>
                          </div>
                        ) : (
                          <span className="text-outline/60 italic text-body-sm">— Unassigned</span>
                        )}
                      </td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${row.statusColor} ring-1 ring-inset whitespace-nowrap`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${row.status === 'In Use' ? 'bg-secondary' : row.status === 'Available' ? 'bg-emerald-500' : 'bg-error'}`}></span>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap">{row.loc}</td>
                      <td className="py-5 px-5 text-right">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all text-outline hover:text-primary">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-5 bg-surface-container-lowest border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-body-sm text-outline font-medium">
                Showing <span className="text-on-surface font-bold">1 - 3</span> of <span className="text-on-surface font-bold">1,248</span> assets
              </p>
              <div className="flex items-center gap-1.5">
                <button className="w-9 h-9 flex items-center justify-center border border-outline-variant/20 rounded-xl text-outline/40 cursor-not-allowed">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-xl text-label-sm shadow-sm font-bold">1</button>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-surface-container-high rounded-xl text-label-sm transition-colors">2</button>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-surface-container-high rounded-xl text-label-sm transition-colors">3</button>
                <span className="px-2 text-outline/30 font-bold">...</span>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-surface-container-high rounded-xl text-label-sm transition-colors">250</button>
                <button className="w-9 h-9 flex items-center justify-center border border-outline-variant/20 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto px-6 lg:px-8 py-6 flex flex-wrap justify-between items-center text-[10px] text-outline/60 uppercase tracking-widest border-t border-outline-variant/10 gap-2">
          <span>Last sync: 2 minutes ago</span>
          <div className="flex items-center gap-4">
            <span>AssetFlow v4.12.0</span>
            <span className="w-1 h-1 rounded-full bg-outline/20"></span>
            <span>Enterprise License</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
