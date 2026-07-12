"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Alerts", "Approvals", "Bookings"];

  const notifications = [
    { id: 1, text: "Laptop AF-0014 assigned to Priya shah", time: "2m ago", colorClass: "bg-blue-400" },
    { id: 2, text: "Maintenance request AF-0055 approved", time: "18m ago", colorClass: "bg-white border-2 border-emerald-400" },
    { id: 3, text: "Booking confirmed : Room B2 : 2:00 to 3:00 PM", time: "1h ago", colorClass: "bg-blue-400" },
    { id: 4, text: "Transfer approved : AF-0033 to facilities dept", time: "3h ago", colorClass: "bg-rose-400" },
    { id: 5, text: "Overdue return : AF-0021 was due 3 days ago", time: "1d ago", colorClass: "bg-amber-400" },
    { id: 6, text: "audit discrepancy flagged : AF-0088 damaged", time: "2d ago", colorClass: "bg-rose-400" },
  ];

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/notifications" />
      
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        
        <div className="flex-1 flex flex-col px-6 lg:px-10 py-8 max-w-[1000px] mx-auto w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-h2 text-on-surface tracking-tight font-semibold truncate">Activity Logs & Notifications</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Stay updated with system activities, approvals, and alerts.</p>
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
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-white text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-outline-variant/10">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id} 
                    className="flex items-center justify-between gap-4 p-5 hover:bg-surface-container-lowest/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Color Indicator */}
                      <div className={`w-3 h-3 rounded-[3px] shrink-0 shadow-sm ${notif.colorClass}`}></div>
                      
                      {/* Notification Text */}
                      <p className="text-sm font-medium text-on-surface truncate group-hover:text-primary transition-colors">
                        {notif.text}
                      </p>
                    </div>
                    
                    {/* Timestamp */}
                    <span className="text-xs font-bold text-outline uppercase tracking-widest shrink-0">
                      {notif.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
