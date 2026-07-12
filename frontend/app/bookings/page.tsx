"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

export default function ResourceBookingPage() {
  const [resource, setResource] = useState("Conference room B2 - Tue, 7 Jul");

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/bookings" />
      
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        
        <div className="px-6 lg:px-10 py-8 max-w-[900px] mx-auto w-full flex-1 flex flex-col">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-h2 text-on-surface tracking-tight font-semibold truncate">Resource Booking</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Manage and reserve shared organizational assets.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-6 md:p-10 mb-10 flex-1 flex flex-col">
            
            {/* Resource Selection */}
            <div className="space-y-2.5 mb-10">
              <label className="text-label-md font-semibold text-on-surface/90">Resource & Date</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
                  meeting_room
                </span>
                <select 
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  className="w-full h-12 pl-12 pr-10 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                >
                  <option value="Conference room B2 - Tue, 7 Jul">Conference room B2 - Tue, 7 Jul</option>
                  <option value="Projector A - Wed, 8 Jul">Projector A - Wed, 8 Jul</option>
                  <option value="Company Vehicle - Thu, 9 Jul">Company Vehicle - Thu, 9 Jul</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Timeline View */}
            <div className="relative mb-10 pl-[60px] h-[480px]">
              {/* Hourly Grid Lines */}
              <div className="absolute inset-0 left-[60px] flex flex-col">
                {["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM"].map((time, i) => (
                  <div key={time} className="relative h-24 border-t border-outline-variant/20 w-full">
                    <span className="absolute -left-[60px] top-[-10px] text-xs font-bold text-outline uppercase tracking-wider w-[50px] text-right">
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bookings Container */}
              <div className="absolute inset-0 top-0 left-[60px] right-0">
                
                {/* Booked Slot (9:00 to 10:00 -> Top: 0, Height: 96px for 1 hour) */}
                <div 
                  className="absolute left-4 right-4 top-0 h-24 bg-primary/15 border border-primary/30 rounded-xl p-3 flex flex-col justify-center z-10 transition-all hover:bg-primary/20"
                >
                  <p className="text-sm font-bold text-primary truncate">Booked - Procurement Team - 9 to 10</p>
                </div>

                {/* Conflict Request Slot (9:30 to 10:30 -> Top: 48px, Height: 96px for 1 hour) */}
                <div 
                  className="absolute left-4 right-4 top-12 h-24 border-2 border-dashed border-error/60 bg-error/5 rounded-xl p-3 flex flex-col justify-end z-20 pointer-events-none"
                >
                  {/* The text label goes slightly below the box natively, but we can position it inside at the bottom */}
                  <p className="text-sm font-bold text-error truncate bg-white/80 p-1 rounded backdrop-blur-sm self-start">
                    Requested 9:30 to 10:30 - conflict - slot is unavailable
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto">
              <button className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-8 py-3 rounded-xl text-label-md font-bold hover:bg-emerald-200 hover:shadow-md transition-all active:scale-[0.98] w-full md:w-auto flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">event_available</span>
                Book a slot
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
