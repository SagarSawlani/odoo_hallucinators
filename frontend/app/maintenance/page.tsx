"use client";

import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

export default function MaintenancePage() {
  const columns = [
    {
      id: "pending",
      title: "Pending",
      cards: [
        { id: "AF-0062", title: "Projector bulb not turning on" }
      ]
    },
    {
      id: "approved",
      title: "Approved",
      cards: [
        { id: "AF-003", title: "ac unit noisy compressor" }
      ]
    },
    {
      id: "tech-assigned",
      title: "Technician assigned",
      cards: [
        { id: "AF-0078", title: "forklift", subtitle: "tech: R varma" }
      ]
    },
    {
      id: "in-progress",
      title: "In progress",
      cards: [
        { id: "AF-897", title: "Printer Jam", subtitle: "parts ordered" }
      ]
    },
    {
      id: "resolved",
      title: "Resolved",
      cards: [
        { id: "AF-873", title: "Chair repair", subtitle: "resolved 7 Jul", isResolved: true }
      ]
    }
  ];

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/maintenance" />
      
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        
        <div className="flex-1 flex flex-col px-6 lg:px-10 py-8 max-w-[1600px] mx-auto w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-h2 text-on-surface tracking-tight font-semibold truncate">Maintenance Management</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Approval workflow for asset repairs and maintenance requests.</p>
          </div>

          {/* Kanban Board Area */}
          <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
            
            {/* Columns Container (Horizontal scroll on small screens) */}
            <div className="flex-1 flex overflow-x-auto custom-scrollbar p-6 gap-6">
              {columns.map(column => (
                <div key={column.id} className="flex-1 min-w-[260px] max-w-[320px] flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">{column.title}</h3>
                    <span className="bg-surface-container-high text-on-surface-variant text-xs font-bold px-2 py-0.5 rounded-full">
                      {column.cards.length}
                    </span>
                  </div>
                  
                  {/* Column Body / Drop Zone */}
                  <div className="flex-1 bg-surface-container-low/30 rounded-xl p-3 border border-outline-variant/10 flex flex-col gap-3">
                    {column.cards.map((card, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-xl shadow-sm border cursor-grab hover:shadow-md hover:-translate-y-0.5 transition-all ${
                          card.isResolved 
                            ? "bg-emerald-50 border-emerald-200/60" 
                            : "bg-white border-outline-variant/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            card.isResolved ? "bg-emerald-100 text-emerald-800" : "bg-primary/10 text-primary"
                          }`}>
                            {card.id}
                          </span>
                          <button className="text-outline hover:text-on-surface transition-colors">
                            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                          </button>
                        </div>
                        <h4 className={`text-sm font-semibold mb-1 ${
                          card.isResolved ? "text-emerald-950" : "text-on-surface"
                        }`}>
                          {card.title}
                        </h4>
                        {card.subtitle && (
                          <p className={`text-xs font-medium ${
                            card.isResolved ? "text-emerald-700" : "text-on-surface-variant/80"
                          }`}>
                            {card.subtitle}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Informational Footer */}
            <div className="p-5 border-t border-outline-variant/10 bg-surface-container text-body-sm text-outline font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Approving a card moves the asset to 'Under Maintenance', resolving returns it to 'Available'.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
