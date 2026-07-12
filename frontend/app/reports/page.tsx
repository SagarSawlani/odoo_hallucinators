"use client";

import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

export default function ReportsPage() {
  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/reports" />
      
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        
        <div className="flex-1 flex flex-col px-6 lg:px-10 py-8 max-w-[1200px] mx-auto w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-h2 text-on-surface tracking-tight font-semibold truncate">Reports & Analytics</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Utilization, maintenance frequency, and asset lifecycle insights.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-6 md:p-10 flex-1 flex flex-col gap-10">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Utilization Bar Chart */}
              <div className="bg-primary-fixed-dim/20 border border-primary-fixed-dim/40 rounded-2xl p-6 relative overflow-hidden group">
                <h3 className="text-sm font-bold text-on-surface mb-6 uppercase tracking-wider">Utilization by department</h3>
                <div className="h-40 flex items-end gap-3 md:gap-5 justify-between px-2 pb-2 relative z-10 border-b-2 border-primary-fixed-dim/50">
                  {[40, 70, 95, 55, 45, 80].map((height, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-amber-100/90 border-2 border-amber-300 rounded-t-md hover:bg-amber-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer" 
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Maintenance Line Chart */}
              <div className="bg-primary-fixed-dim/20 border border-primary-fixed-dim/40 rounded-2xl p-6 relative overflow-hidden group">
                <h3 className="text-sm font-bold text-on-surface mb-6 uppercase tracking-wider">Maintenance Frequency</h3>
                <div className="h-40 relative z-10 border-b-2 border-primary-fixed-dim/50">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                      d="M 0,80 L 15,50 L 30,55 L 45,30 L 55,45 L 70,15 L 90,10" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="drop-shadow-sm"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Asset Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Most Used Assets */}
              <div>
                <h3 className="text-h3 font-bold text-on-surface mb-5">Most used assets</h3>
                <ul className="space-y-4">
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-on-surface-variant font-medium">
                    <span className="font-semibold text-on-surface min-w-[140px] shrink-0 truncate">Room B2:</span>
                    <span className="truncate">34 bookings this month</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-on-surface-variant font-medium">
                    <span className="font-semibold text-on-surface min-w-[140px] shrink-0 truncate">Van AF-343:</span>
                    <span className="truncate">21 trips this month</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-on-surface-variant font-medium">
                    <span className="font-semibold text-on-surface min-w-[140px] shrink-0 truncate">Projector AF-335:</span>
                    <span className="truncate">18 uses</span>
                  </li>
                </ul>
              </div>

              {/* Idle Assets */}
              <div>
                <h3 className="text-h3 font-bold text-on-surface mb-5">Idle assets</h3>
                <ul className="space-y-4">
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-on-surface-variant font-medium">
                    <span className="font-semibold text-on-surface min-w-[140px] shrink-0 truncate">Camera AF-0301:</span>
                    <span className="truncate">unused 60+ days</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-on-surface-variant font-medium">
                    <span className="font-semibold text-on-surface min-w-[140px] shrink-0 truncate">Chair AF-0410:</span>
                    <span className="truncate">unused 45 days</span>
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-outline-variant/20 my-2" />

            {/* Maintenance & Retirement */}
            <div>
              <h3 className="text-h3 font-bold text-on-surface mb-5">Assets due for maintenance / nearing retirement</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-on-surface-variant font-medium">
                  <span className="font-semibold text-on-surface min-w-[140px] shrink-0 truncate">Forklift AF-0087:</span>
                  <span className="truncate">service due in 5 days</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-on-surface-variant font-medium">
                  <span className="font-semibold text-on-surface min-w-[140px] shrink-0 truncate">Laptop AF-0020:</span>
                  <span className="truncate">4 years old : nearing retirement</span>
                </li>
              </ul>

              {/* Action Button */}
              <button className="bg-rose-50 text-rose-800 border border-rose-200 px-8 py-3 rounded-xl text-sm font-bold hover:bg-rose-100 hover:shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export report
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
