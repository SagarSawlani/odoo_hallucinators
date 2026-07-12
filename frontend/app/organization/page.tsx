"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import Link from "next/link";

export default function OrganizationSetupPage() {
  const [activeTab, setActiveTab] = useState("Departments");

  const tabs = ["Departments", "Categories", "Employee"];

  const departments = [
    { id: 1, name: "Engineering", head: "Aditi Rao", parent: "--", status: "Active" },
    { id: 2, name: "Facilities", head: "Rohan Mehta", parent: "--", status: "Active" },
    { id: 3, name: "Field ops (east)", head: "Sana Iqbal", parent: "Field Ops", status: "Inactive" },
  ];

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/organization" />
      
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        
        <div className="px-6 lg:px-10 py-8 max-w-[1200px] mx-auto w-full flex-1 flex flex-col">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="min-w-0">
              <h1 className="text-h2 text-on-surface tracking-tight font-semibold truncate">Organization Setup</h1>
              <p className="text-body-md text-on-surface-variant mt-1">Manage departments, categories, and employees (Admin only).</p>
            </div>
          </div>

          {/* Controls Bar: Tabs and Add Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="flex bg-surface-container-low p-1 rounded-xl ring-1 ring-outline-variant/30 shrink-0 overflow-x-auto custom-scrollbar max-w-full">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Add Button */}
            <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 transition-all active:scale-[0.98] whitespace-nowrap shrink-0">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add New
            </button>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
                  <tr>
                    <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Department</th>
                    <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Head</th>
                    <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Parent Dept</th>
                    <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Status</th>
                    <th className="py-5 px-6 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-surface-container-low/30 transition-all group">
                      <td className="py-5 px-6 text-sm font-semibold text-on-surface whitespace-nowrap">{dept.name}</td>
                      <td className="py-5 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">{dept.head}</td>
                      <td className="py-5 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">{dept.parent}</td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ring-1 whitespace-nowrap ${
                          dept.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                            : 'bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            dept.status === 'Active' ? 'bg-emerald-500' : 'bg-outline'
                          }`}></span>
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all text-outline hover:text-primary">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Informational Footer */}
            <div className="mt-auto p-6 border-t border-outline-variant/10 bg-surface-container-lowest text-body-sm text-outline font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Editing a department here also drives the picklist in Screen 4 & 5
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
