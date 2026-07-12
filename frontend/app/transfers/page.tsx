"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

export default function TransfersPage() {
  const [assetId, setAssetId] = useState("AF-0114 - Dell laptop");
  const [transferTo, setTransferTo] = useState("");
  const [reason, setReason] = useState("");

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Transfer request submitted!");
  };

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar activePath="/transfers" />
      
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-x-hidden">
        <TopNav />
        
        <div className="px-6 lg:px-10 py-8 max-w-[900px] mx-auto w-full flex-1 flex flex-col">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-h2 text-on-surface tracking-tight font-semibold truncate">Asset Allocation & Transfer</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Manage asset assignments and request transfers between employees.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-6 md:p-10 mb-10">
            <form onSubmit={handleTransfer} className="space-y-8">
              
              {/* Asset Selection */}
              <div className="space-y-2.5">
                <label className="text-label-md font-semibold text-on-surface/90">Asset</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
                    laptop_mac
                  </span>
                  <select 
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full h-12 pl-12 pr-10 bg-surface/50 border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                  >
                    <option value="AF-0114 - Dell laptop">AF-0114 - Dell laptop</option>
                    <option value="AF-0229 - MacBook Pro">AF-0229 - MacBook Pro</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Error / Warning Banner */}
              <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <span className="material-symbols-outlined text-error shrink-0 mt-0.5">error</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-error truncate">Already Allocated to Priya Shah (Engineering)</p>
                  <p className="text-sm text-error/80 mt-0.5 break-words">Direct re-allocation is blocked - submit a transfer request below.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20">
                <h3 className="text-h3 font-semibold text-on-surface mb-6">Transfer Request</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* From */}
                  <div className="space-y-2.5">
                    <label className="text-label-md font-semibold text-on-surface/90">From</label>
                    <input 
                      type="text" 
                      value="Priya Shah" 
                      disabled
                      className="w-full h-12 px-4 bg-surface-container-high/50 border border-outline-variant/20 rounded-xl text-on-surface-variant/80 font-medium cursor-not-allowed outline-none"
                    />
                  </div>

                  {/* To */}
                  <div className="space-y-2.5">
                    <label className="text-label-md font-semibold text-on-surface/90">To <span className="text-error">*</span></label>
                    <div className="relative">
                      <select 
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        required
                        className="w-full h-12 pl-4 pr-10 bg-white border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                      >
                        <option value="" disabled>Select Employee...</option>
                        <option value="Alex Rivera">Alex Rivera</option>
                        <option value="Rohan Mehta">Rohan Mehta</option>
                        <option value="Sana Iqbal">Sana Iqbal</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2.5 mb-8">
                  <label className="text-label-md font-semibold text-on-surface/90">Reason <span className="text-error">*</span></label>
                  <textarea 
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Provide a brief explanation for this transfer..."
                    className="w-full p-4 bg-white border border-outline-variant/40 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  ></textarea>
                </div>

                {/* Submit */}
                <div>
                  <button 
                    type="submit" 
                    className="bg-primary text-on-primary px-8 py-3 rounded-xl text-label-md font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-2 w-full md:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Submit Request
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Allocation History */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-10 border border-outline-variant/20 shadow-sm">
            <h3 className="text-h3 font-semibold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">history</span>
              Allocation History
            </h3>
            
            <div className="relative pl-6 border-l-2 border-outline-variant/20 space-y-8">
              
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-white"></div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                  <span className="text-label-sm font-bold text-outline/80 w-20 shrink-0 uppercase tracking-wider">Mar 12</span>
                  <div className="bg-white p-3 rounded-xl border border-outline-variant/20 shadow-sm flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">Allocated to <span className="font-bold text-primary">Priya Shah</span> - Engineering</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-outline-variant ring-4 ring-white"></div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                  <span className="text-label-sm font-bold text-outline/80 w-20 shrink-0 uppercase tracking-wider">Jan 04</span>
                  <div className="bg-white p-3 rounded-xl border border-outline-variant/20 shadow-sm flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">Returned by <span className="font-bold">Arjun Nair</span> - condition: <span className="text-emerald-600 font-semibold">good</span></p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
