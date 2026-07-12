"use client";

import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

export default function AuditPage() {
  const auditData = [
    { id: "AF-003", name: "Dell laptop", location: "Desk E12", status: "Verified" },
    { id: "AF-9921", name: "Office chair", location: "Desk E14", status: "Missing" },
    { id: "AF-9838", name: "Monitor", location: "Desk E15", status: "Damaged" },
  ];

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/audit" />
      
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        
        <div className="flex-1 flex flex-col px-6 lg:px-10 py-8 max-w-[1000px] mx-auto w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-h2 text-on-surface tracking-tight font-semibold truncate">Asset Audit</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Audit cycles, checklists, and discrepancy reports.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-6 md:p-8 flex-1 flex flex-col gap-8">
            
            {/* Audit Info Banner */}
            <div className="bg-surface-container-high/40 border border-outline-variant/30 rounded-xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-1">Q3 Audit: Engineering Dept</h3>
                <p className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  1 - 15 Jul
                </p>
              </div>
              <div className="bg-white px-4 py-2.5 rounded-lg border border-outline-variant/20 shadow-sm shrink-0">
                <p className="text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Auditors</p>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white z-10">AR</div>
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white z-0">SI</div>
                  </div>
                  <span className="text-sm font-bold text-on-surface">A. Rao, S. Iqbal</span>
                </div>
              </div>
            </div>

            {/* Checklist Table */}
            <div className="border border-outline-variant/20 rounded-xl overflow-hidden flex flex-col">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-surface-container-lowest border-b border-outline-variant/20">
                    <tr>
                      <th className="py-4 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Asset</th>
                      <th className="py-4 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Expected Location</th>
                      <th className="py-4 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {auditData.map((item, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-bold text-primary mr-2">{item.id}</span>
                          <span className="font-semibold text-on-surface">{item.name}</span>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">
                          {item.location}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border w-24 ${
                            item.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            item.status === 'Missing' ? 'bg-error/10 text-error border-error/20' :
                            'bg-surface-container text-on-surface-variant border-outline-variant/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <hr className="border-outline-variant/20 my-2" />

            {/* Warning Banner */}
            <div className="bg-amber-100/50 border border-amber-300/50 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
              <span className="material-symbols-outlined text-amber-700 shrink-0">warning</span>
              <div className="min-w-0 flex items-center">
                <p className="text-sm font-bold text-amber-900 truncate">
                  2 assets flagged - discrepancy report generated automatically
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4">
              <button className="bg-teal-50 text-teal-800 border border-teal-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-100 hover:shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto">
                Close audit cycle
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
