"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

// Types
interface DepartmentUtilization {
  department: string;
  utilization: number;
  total_assets: number;
  allocated: number;
}

interface MaintenanceFrequency {
  period: string;
  count: number;
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
}

interface MostUsedAsset {
  id: number;
  asset_tag: string;
  name: string;
  booking_count: number;
  active_bookings: number;
}

interface IdleAsset {
  id: number;
  asset_tag: string;
  name: string;
  days_idle: number;
}

interface DueMaintenanceAsset {
  id: number;
  asset_tag: string;
  name: string;
  days_since_service: number;
  is_overdue: boolean;
  days_overdue: number;
}

interface NearingRetirementAsset {
  id: number;
  asset_tag: string;
  name: string;
  age_years: number;
}

interface ReportSummary {
  maintenance: {
    total: number;
    pending: number;
    approved: number;
    resolved: number;
    rejected: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  bookings: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  audit_results: {
    total: number;
    verified: number;
    missing: number;
    damaged: number;
  };
  asset_status: Record<string, number>;
  recent_activity: Array<{
    action: string;
    count: number;
    last_occurrence: string;
  }>;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("month");
  const [mounted, setMounted] = useState(false);
  
  // Data states
  const [utilization, setUtilization] = useState<DepartmentUtilization[]>([]);
  const [maintenanceFreq, setMaintenanceFreq] = useState<MaintenanceFrequency[]>([]);
  const [mostUsed, setMostUsed] = useState<MostUsedAsset[]>([]);
  const [idleAssets, setIdleAssets] = useState<IdleAsset[]>([]);
  const [dueMaintenance, setDueMaintenance] = useState<DueMaintenanceAsset[]>([]);
  const [nearingRetirement, setNearingRetirement] = useState<NearingRetirementAsset[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    setMounted(true);
    fetchAllReportData();
  }, [period]);

  const fetchAllReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        utilRes,
        freqRes,
        mostUsedRes,
        idleRes,
        dueRes,
        retirementRes,
        summaryRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/reports/utilization-by-department`),
        fetch(`${API_BASE}/reports/maintenance-frequency?period=${period}`),
        fetch(`${API_BASE}/reports/most-used-assets?limit=10&days=30`),
        fetch(`${API_BASE}/reports/idle-assets?days=30`),
        fetch(`${API_BASE}/reports/assets-due-maintenance?days=30`),
        fetch(`${API_BASE}/reports/assets-nearing-retirement?years=5`),
        fetch(`${API_BASE}/reports/summary`),
      ]);

      if (!utilRes.ok) throw new Error("Failed to fetch utilization data");
      if (!freqRes.ok) throw new Error("Failed to fetch maintenance frequency");
      if (!mostUsedRes.ok) throw new Error("Failed to fetch most used assets");
      if (!idleRes.ok) throw new Error("Failed to fetch idle assets");
      if (!dueRes.ok) throw new Error("Failed to fetch due maintenance assets");
      if (!retirementRes.ok) throw new Error("Failed to fetch nearing retirement assets");
      if (!summaryRes.ok) throw new Error("Failed to fetch summary");

      const [utilData, freqData, mostUsedData, idleData, dueData, retirementData, summaryData] = 
        await Promise.all([
          utilRes.json(),
          freqRes.json(),
          mostUsedRes.json(),
          idleRes.json(),
          dueRes.json(),
          retirementRes.json(),
          summaryRes.json(),
        ]);

      setUtilization(utilData.departments || utilData || []);
      setMaintenanceFreq(freqData.data || freqData || []);
      setMostUsed(mostUsedData.assets || mostUsedData || []);
      setIdleAssets(idleData.assets || idleData || []);
      setDueMaintenance(dueData.assets || dueData || []);
      setNearingRetirement(retirementData.assets || retirementData || []);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report data");
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/export-summary`);
      if (!response.ok) throw new Error("Failed to export data");
      const data = await response.json();
      
      const headers = ["Type", "ID", "Name", "Status", "Date"];
      const rows = [
        headers.join(","),
        ...data.maintenance_requests.slice(0, 10).map((r: any) => 
          ["Maintenance", r.id, r.asset_name, r.status, r.created_at].join(",")
        ),
        ...data.bookings.slice(0, 10).map((r: any) => 
          ["Booking", r.id, r.asset_name, r.status, r.created_at].join(",")
        ),
      ];
      
      const csv = rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export report data");
    }
  };

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar activePath="/reports" />
        <main className="md:ml-[280px] flex flex-col min-h-screen">
          <TopNav />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reports...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar activePath="/reports" />
        <main className="md:ml-[280px] flex flex-col min-h-screen">
          <TopNav />
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading reports</h2>
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={fetchAllReportData}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const maxUtilization = utilization.length > 0 
    ? Math.max(...utilization.map(d => d.utilization)) 
    : 100;

  const totalAssets = summary ? Object.values(summary.asset_status).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar activePath="/reports" />
      
      <main className="md:ml-[280px] flex flex-col min-h-screen">
        <TopNav />
        
        <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Utilization, maintenance frequency, and asset lifecycle insights</p>
          </div>

          {/* Stats Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Open Maintenance</p>
                <p className="text-2xl font-bold text-amber-600">{summary.maintenance.pending}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-green-600">{summary.bookings.ongoing}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Lost Assets</p>
                <p className="text-2xl font-bold text-red-600">{summary.asset_status.Lost || 0}</p>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            <button 
              onClick={fetchAllReportData}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <span>📥</span> Export
            </button>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Utilization Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Utilization by Department</h3>
                <span className="text-xs text-gray-500">{utilization.length} dept(s)</span>
              </div>
              <div className="h-48 flex items-end gap-4 justify-between px-2 pb-2 border-b-2 border-gray-200">
                {utilization.length > 0 ? (
                  utilization.map((dept, i) => {
                    const height = Math.max((dept.utilization / maxUtilization) * 100, 5);
                    const color = dept.utilization > 80 ? 'bg-green-500' : 
                                  dept.utilization > 60 ? 'bg-blue-500' : 
                                  dept.utilization > 40 ? 'bg-yellow-500' : 'bg-red-400';
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div 
                          className={`w-full ${color} rounded-t-md transition-all duration-300 hover:opacity-80 cursor-pointer relative`}
                          style={{ height: `${height}%`, minHeight: '10px' }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {dept.department}: {dept.utilization}%
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 mt-2 truncate w-full text-center">{dept.department}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full text-center text-gray-500 py-8">No department data available</div>
                )}
              </div>
            </div>

            {/* Maintenance Line Chart - FIXED NaN issue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Maintenance Frequency</h3>
                <span className="text-xs text-gray-500">{maintenanceFreq.length} periods</span>
              </div>
              <div className="h-48 relative">
                {maintenanceFreq.length > 1 ? (
                  <div className="w-full h-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.5" />
                      <line x1="0" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="0.5" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.5" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.5" />
                      
                      {/* Line */}
                      {(() => {
                        const maxCount = Math.max(...maintenanceFreq.map(d => d.count), 1);
                        const points = maintenanceFreq.map((d, i) => {
                          const x = (i / (maintenanceFreq.length - 1)) * 100;
                          const y = 100 - ((d.count / maxCount) * 80 + 10);
                          return `${x},${y}`;
                        }).join(' ');
                        
                        return (
                          <>
                            <polyline
                              points={`0,90 ${points} 100,90`}
                              fill="rgba(59, 130, 246, 0.1)"
                              stroke="none"
                            />
                            <polyline
                              points={points}
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="drop-shadow-sm"
                            />
                            {maintenanceFreq.map((d, i) => {
                              const x = (i / (maintenanceFreq.length - 1)) * 100;
                              const y = 100 - ((d.count / maxCount) * 80 + 10);
                              // Ensure x and y are valid numbers
                              const cx = isNaN(x) ? 0 : x;
                              const cy = isNaN(y) ? 0 : y;
                              return (
                                <circle key={i} cx={cx} cy={cy} r="2.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      {maintenanceFreq.map((d, i) => (
                        <span key={i}>{d.period}</span>
                      ))}
                    </div>
                  </div>
                ) : maintenanceFreq.length === 1 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {maintenanceFreq[0]?.count || 0} maintenance request{maintenanceFreq[0]?.count !== 1 ? 's' : ''}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No maintenance data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Asset Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Most Used Assets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">⭐ Most Used Assets</h3>
              {mostUsed.length > 0 ? (
                <ul className="space-y-3">
                  {mostUsed.slice(0, 5).map((asset) => (
                    <li key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <span className="font-medium text-gray-900">{asset.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({asset.asset_tag})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-600">{asset.booking_count} bookings</span>
                        {asset.active_bookings > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {asset.active_bookings} active
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No asset usage data available</p>
              )}
            </div>

            {/* Idle Assets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">💤 Idle Assets</h3>
              {idleAssets.length > 0 ? (
                <ul className="space-y-3">
                  {idleAssets.slice(0, 5).map((asset) => (
                    <li key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <span className="font-medium text-gray-900">{asset.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({asset.asset_tag})</span>
                      </div>
                      <span className="text-sm text-amber-600 font-medium">{asset.days_idle}+ days idle</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No idle assets found</p>
              )}
            </div>
          </div>

          {/* Maintenance & Retirement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Due for Maintenance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">🔧 Due for Maintenance</h3>
              {dueMaintenance.length > 0 ? (
                <ul className="space-y-3">
                  {dueMaintenance.slice(0, 5).map((asset) => (
                    <li key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <span className="font-medium text-gray-900">{asset.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({asset.asset_tag})</span>
                      </div>
                      <span className={`text-sm font-medium ${asset.is_overdue ? 'text-red-600' : 'text-amber-600'}`}>
                        {asset.is_overdue 
                          ? `${asset.days_overdue} days overdue` 
                          : `due in ${Math.max(0, 30 - asset.days_since_service)} days`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No assets due for maintenance</p>
              )}
            </div>

            {/* Nearing Retirement */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">🔄 Nearing Retirement</h3>
              {nearingRetirement.length > 0 ? (
                <ul className="space-y-3">
                  {nearingRetirement.slice(0, 5).map((asset) => (
                    <li key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <span className="font-medium text-gray-900">{asset.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({asset.asset_tag})</span>
                      </div>
                      <span className={`text-sm font-medium ${asset.age_years >= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                        {asset.age_years} years old {asset.age_years >= 7 ? '⚠️' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No assets nearing retirement</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}