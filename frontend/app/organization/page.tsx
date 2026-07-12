"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { apiFetch } from "@/lib/api";

interface Department {
  id: number;
  name: string;
  code: string | null;
  parent_department_id: number | null;
  head_id: number | null;
  head_name: string | null;
  status: string;
  created_at: string;
}

interface Employee {
  id: number;
  firebase_uid: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  department_name: string | null;
  created_at: string;
}

export default function OrganizationSetupPage() {
  const [activeTab, setActiveTab] = useState<"Departments" | "Employee">("Departments");

  // Department state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [deptError, setDeptError] = useState("");

  // Employee state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState("");
  const [empLoaded, setEmpLoaded] = useState(false);

  // Add department modal state
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [addingDept, setAddingDept] = useState(false);

  // Add employee modal state
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpPhone, setNewEmpPhone] = useState("");
  const [newEmpDeptId, setNewEmpDeptId] = useState("");
  const [addingEmp, setAddingEmp] = useState(false);

  const tabs: ("Departments" | "Employee")[] = ["Departments", "Employee"];

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch employees when switching to Employee tab
  useEffect(() => {
    if (activeTab === "Employee" && !empLoaded) {
      fetchEmployees();
    }
  }, [activeTab, empLoaded]);

  async function fetchDepartments() {
    setDeptLoading(true);
    setDeptError("");
    try {
      const data = await apiFetch("/departments/");
      setDepartments(data);
    } catch (err: any) {
      setDeptError(err.message);
    } finally {
      setDeptLoading(false);
    }
  }

  async function fetchEmployees() {
    setEmpLoading(true);
    setEmpError("");
    try {
      const data = await apiFetch("/employees/");
      setEmployees(data);
      setEmpLoaded(true);
    } catch (err: any) {
      setEmpError(err.message);
    } finally {
      setEmpLoading(false);
    }
  }

  async function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault();
    setAddingDept(true);
    try {
      await apiFetch("/departments/", {
        method: "POST",
        body: JSON.stringify({ name: newDeptName, code: newDeptCode || null }),
      });
      setShowAddDept(false);
      setNewDeptName("");
      setNewDeptCode("");
      fetchDepartments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingDept(false);
    }
  }

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setAddingEmp(true);
    try {
      await apiFetch("/employees/", {
        method: "POST",
        body: JSON.stringify({
          name: newEmpName,
          email: newEmpEmail,
          phone: newEmpPhone || null,
          department_id: newEmpDeptId ? parseInt(newEmpDeptId) : null,
        }),
      });
      setShowAddEmp(false);
      setNewEmpName("");
      setNewEmpEmail("");
      setNewEmpPhone("");
      setNewEmpDeptId("");
      fetchEmployees();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingEmp(false);
    }
  }

  // Build parent department lookup for display
  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

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
              <p className="text-body-md text-on-surface-variant mt-1">Manage departments and employees (Admin only).</p>
            </div>
          </div>

          {/* Controls Bar: Tabs and Add Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="flex bg-surface-container-low p-1 rounded-xl ring-1 ring-outline-variant/30 shrink-0 overflow-x-auto custom-scrollbar max-w-full">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                  }`}
                >
                  {tab === "Employee" ? "Employees" : tab}
                </button>
              ))}
            </div>

            {/* Add Button */}
            <button
              onClick={() => (activeTab === "Departments" ? setShowAddDept(true) : setShowAddEmp(true))}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add {activeTab === "Departments" ? "Department" : "Employee"}
            </button>
          </div>

          {/* ==================== DEPARTMENTS TAB ==================== */}
          {activeTab === "Departments" && (
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col flex-1">
              {deptLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-outline">Loading departments...</p>
                  </div>
                </div>
              ) : deptError ? (
                <div className="p-6">
                  <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex gap-3">
                    <span className="material-symbols-outlined text-error shrink-0">error</span>
                    <p className="text-sm font-medium text-error">{deptError}</p>
                  </div>
                </div>
              ) : departments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-outline">
                  <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">domain</span>
                  <p className="text-sm font-semibold">No departments found</p>
                  <p className="text-xs mt-1">Click "Add Department" to create one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
                      <tr>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Department</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Code</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Head</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Parent Dept</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {departments.map((dept) => (
                        <tr key={dept.id} className="hover:bg-surface-container-low/30 transition-all group">
                          <td className="py-5 px-6 text-sm font-semibold text-on-surface whitespace-nowrap">{dept.name}</td>
                          <td className="py-5 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">{dept.code || "—"}</td>
                          <td className="py-5 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">{dept.head_name || "—"}</td>
                          <td className="py-5 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">
                            {dept.parent_department_id ? deptMap.get(dept.parent_department_id) || "—" : "—"}
                          </td>
                          <td className="py-5 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ring-1 whitespace-nowrap ${
                                dept.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                  : "bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dept.status === "Active" ? "bg-emerald-500" : "bg-outline"}`}></span>
                              {dept.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Informational Footer */}
              <div className="mt-auto p-6 border-t border-outline-variant/10 bg-surface-container-lowest text-body-sm text-outline font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Departments drive the employee and asset allocation picklists.
              </div>
            </div>
          )}

          {/* ==================== EMPLOYEES TAB ==================== */}
          {activeTab === "Employee" && (
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col flex-1">
              {empLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-outline">Loading employees...</p>
                  </div>
                </div>
              ) : empError ? (
                <div className="p-6">
                  <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex gap-3">
                    <span className="material-symbols-outlined text-error shrink-0">error</span>
                    <p className="text-sm font-medium text-error">{empError}</p>
                  </div>
                </div>
              ) : employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-outline">
                  <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">people</span>
                  <p className="text-sm font-semibold">No employees found</p>
                  <p className="text-xs mt-1">Click "Add Employee" to create one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
                      <tr>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Name</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Email</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Phone</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Department</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Role</th>
                        <th className="py-5 px-6 text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-surface-container-low/30 transition-all group">
                          <td className="py-5 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                {emp.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <span className="text-sm font-semibold text-on-surface">{emp.name}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">{emp.email}</td>
                          <td className="py-5 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">{emp.phone || "—"}</td>
                          <td className="py-5 px-6 text-sm font-medium text-on-surface-variant whitespace-nowrap">{emp.department_name || "—"}</td>
                          <td className="py-5 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-primary/5 text-primary ring-1 ring-primary/10 whitespace-nowrap">
                              {emp.role}
                            </span>
                          </td>
                          <td className="py-5 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ring-1 whitespace-nowrap ${
                                emp.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                  : "bg-outline-variant/20 text-on-surface-variant ring-outline-variant/30"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${emp.status === "Active" ? "bg-emerald-500" : "bg-outline"}`}></span>
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-auto p-6 border-t border-outline-variant/10 bg-surface-container-lowest text-body-sm text-outline font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Showing {employees.length} employee{employees.length !== 1 ? "s" : ""} total.
              </div>
            </div>
          )}
        </div>

        {/* ==================== ADD DEPARTMENT MODAL ==================== */}
        {showAddDept && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAddDept(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Add Department</h3>
              <form onSubmit={handleAddDepartment} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Name <span className="text-error">*</span></label>
                  <input
                    type="text"
                    required
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Code</label>
                  <input
                    type="text"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddDept(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={addingDept} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                    {addingDept ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== ADD EMPLOYEE MODAL ==================== */}
        {showAddEmp && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAddEmp(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Add Employee</h3>
              <form onSubmit={handleAddEmployee} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Name <span className="text-error">*</span></label>
                  <input type="text" required value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Email <span className="text-error">*</span></label>
                  <input type="email" required value={newEmpEmail} onChange={(e) => setNewEmpEmail(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Phone</label>
                  <input type="tel" value={newEmpPhone} onChange={(e) => setNewEmpPhone(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface/90">Department</label>
                  <select value={newEmpDeptId} onChange={(e) => setNewEmpDeptId(e.target.value)} className="w-full h-12 px-4 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none">
                    <option value="">No Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddEmp(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={addingEmp} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                    {addingEmp ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
