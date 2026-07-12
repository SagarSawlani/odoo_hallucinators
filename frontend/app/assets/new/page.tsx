"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterAssetPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const totalSteps = 5;
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Handle Submit
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/assets");
      }, 4000);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStepIcon = (step: number) => {
    if (step < currentStep) {
      return (
        <div className="w-8 h-8 rounded-full bg-primary-container/40 text-primary flex items-center justify-center mb-3 font-bold transition-all duration-300 text-sm">
          <span className="material-symbols-outlined text-[18px]">check</span>
        </div>
      );
    } else if (step === currentStep) {
      return (
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/20 font-bold transition-all duration-300 text-sm ring-4 ring-primary/10 scale-110">
          {step}
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center mb-3 transition-all duration-300 text-sm">
          {step}
        </div>
      );
    }
  };

  const renderStepLabel = (step: number, label: string) => {
    let className = "text-[11px] font-bold uppercase tracking-wider ";
    if (step < currentStep) {
      className += "text-on-surface-variant/40";
    } else if (step === currentStep) {
      className += "text-primary";
    } else {
      className += "text-on-surface-variant/60";
    }
    return <span className={className}>{label}</span>;
  };

  const renderStepLine = (step: number) => {
    return (
      <div className={`step-line mx-4 ${step < currentStep ? 'step-line-active' : 'bg-[#e1e2ed]'}`}></div>
    );
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* TopNavBar (Shell) */}
      <header className="docked sticky top-0 w-full h-16 glass-nav border-b border-outline-variant/30 z-50">
        <div className="flex items-center justify-between px-gutter w-full max-w-container_max mx-auto h-full">
          <div className="flex items-center gap-4">
            <Link href="/assets" className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </Link>
            <span className="font-h3 text-h3 font-bold text-primary tracking-tight">AssetFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-label-sm font-label-md text-on-surface-variant hidden md:block opacity-70">Draft: New Asset Registration</span>
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold ring-2 ring-surface">JD</div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-margin_mobile md:px-gutter py-16">
        {/* Stepper Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10 step-item">
              {renderStepIcon(1)}
              {renderStepLabel(1, 'Info')}
            </div>
            {renderStepLine(1)}
            {/* Step 2 */}
            <div className="flex flex-col items-center z-10 step-item">
              {renderStepIcon(2)}
              {renderStepLabel(2, 'Category')}
            </div>
            {renderStepLine(2)}
            {/* Step 3 */}
            <div className="flex flex-col items-center z-10 step-item">
              {renderStepIcon(3)}
              {renderStepLabel(3, 'Purchase')}
            </div>
            {renderStepLine(3)}
            {/* Step 4 */}
            <div className="flex flex-col items-center z-10 step-item">
              {renderStepIcon(4)}
              {renderStepLabel(4, 'Location')}
            </div>
            {renderStepLine(4)}
            {/* Step 5 */}
            <div className="flex flex-col items-center z-10 step-item">
              {renderStepIcon(5)}
              {renderStepLabel(5, 'Media')}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 md:p-12 min-h-[540px] flex flex-col">
          <form className="flex-grow" onSubmit={(e) => e.preventDefault()}>
            
            {/* Step 1 Content: Basic Info */}
            <div className={`step-content ${currentStep === 1 ? 'active' : ''}`}>
              <div className="mb-10">
                <h1 className="font-h2 text-h2 text-on-surface mb-3 tracking-tight">Basic Asset Information</h1>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed opacity-80">Start by identifying the core details of your new organizational asset to begin tracking.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Asset Name <span className="text-error">*</span></label>
                  <input type="text" className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none" placeholder="e.g. MacBook Pro 16-inch" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Asset Tag / Serial Number <span className="text-error">*</span></label>
                  <input type="text" className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none" placeholder="AF-2024-001" />
                </div>
                <div className="flex flex-col gap-2.5 md:col-span-2">
                  <label className="text-label-md font-semibold text-on-surface/80">Description</label>
                  <textarea rows={4} className="w-full p-4 rounded-xl border form-input-refined bg-surface/30 outline-none" placeholder="Enter a brief overview of the asset's purpose or condition..."></textarea>
                </div>
              </div>
            </div>

            {/* Step 2 Content: Category & Department */}
            <div className={`step-content ${currentStep === 2 ? 'active' : ''}`}>
              <div className="mb-10">
                <h1 className="font-h2 text-h2 text-on-surface mb-3 tracking-tight">Classification</h1>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed opacity-80">Define where this asset belongs within your organizational hierarchy.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Asset Category</label>
                  <select className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none pr-10">
                    <option>Hardware & IT</option>
                    <option>Furniture</option>
                    <option>Vehicles</option>
                    <option>Software Licenses</option>
                    <option>Machinery</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Department Assignment</label>
                  <select className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none pr-10">
                    <option>Product & Engineering</option>
                    <option>Marketing</option>
                    <option>Human Resources</option>
                    <option>Finance</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Criticality Level</label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="criticality" className="w-5 h-5 text-primary border-outline-variant focus:ring-primary/20" />
                      <span className="text-body-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">Low</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="criticality" defaultChecked className="w-5 h-5 text-primary border-outline-variant focus:ring-primary/20" />
                      <span className="text-body-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">Medium</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="criticality" className="w-5 h-5 text-primary border-outline-variant focus:ring-primary/20" />
                      <span className="text-body-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">High</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Content: Purchase Info */}
            <div className={`step-content ${currentStep === 3 ? 'active' : ''}`}>
              <div className="mb-10">
                <h1 className="font-h2 text-h2 text-on-surface mb-3 tracking-tight">Procurement Details</h1>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed opacity-80">Track the financial investment and sourcing for this asset.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Purchase Date</label>
                  <input type="date" className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Purchase Cost (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">$</span>
                    <input type="number" placeholder="0.00" className="w-full h-12 pl-10 pr-4 rounded-xl border form-input-refined bg-surface/30 outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 md:col-span-2">
                  <label className="text-label-md font-semibold text-on-surface/80">Vendor / Supplier</label>
                  <input type="text" placeholder="e.g. Apple Enterprise, Dell Inc." className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Warranty Expiry</label>
                  <input type="date" className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none" />
                </div>
              </div>
            </div>

            {/* Step 4 Content: Location */}
            <div className={`step-content ${currentStep === 4 ? 'active' : ''}`}>
              <div className="mb-10">
                <h1 className="font-h2 text-h2 text-on-surface mb-3 tracking-tight">Location & Deployment</h1>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed opacity-80">Specify the physical or digital location where the asset is currently deployed.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Primary Site</label>
                  <select className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none pr-10">
                    <option>Headquarters - NYC</option>
                    <option>West Coast Hub - SF</option>
                    <option>Remote / Employee Home</option>
                    <option>Cloud Infrastructure</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-label-md font-semibold text-on-surface/80">Specific Floor / Room</label>
                  <input type="text" placeholder="Floor 4, Suite 402" className="w-full h-12 px-4 rounded-xl border form-input-refined bg-surface/30 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <div className="w-full h-56 rounded-2xl border border-outline-variant/40 bg-surface overflow-hidden relative group shadow-inner">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkFYDDz522wg7Gp3Zzop8bUus-yr2WsW8DQD_diwCUBi6rcmkr6_OXcB6lo938rSZEVs4vTCfECf4qQEDV7hp_2QIgT9MI4reYcnKSwGMS-iLZ4mWPVyDlO-i8ho7pfJ4XDg7QoV8G2cuxnSKr7NLg094niTyXREjOPvxcu3j8lsGcgNtE1-kNeYq13kL8MAeQTnAevDR-daJ17jCqIS75xfxz9jOtN6AEL3Emq-61tPL-cou_nmdv')" }}></div>
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 bg-surface-container-lowest/95 backdrop-blur-md px-4 py-2.5 rounded-xl text-body-sm font-semibold border border-outline-variant/30 shadow-lg">
                      Interactive Map View Locked
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 Content: Documents */}
            <div className={`step-content ${currentStep === 5 ? 'active' : ''}`}>
              <div className="mb-10">
                <h1 className="font-h2 text-h2 text-on-surface mb-3 tracking-tight">Documentation & Media</h1>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed opacity-80">Upload supporting files such as invoices, manuals, or physical photos of the asset.</p>
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Upload Item */}
                  <div className="p-8 rounded-2xl border-2 border-dashed border-outline-variant/40 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">upload_file</span>
                    </div>
                    <div className="text-center">
                      <p className="text-label-md font-bold text-on-surface">Upload Warranty/Manual</p>
                      <p className="text-body-sm text-on-surface-variant/70 mt-1">PDF, DOCX up to 10MB</p>
                    </div>
                  </div>
                  {/* Upload Item */}
                  <div className="p-8 rounded-2xl border-2 border-dashed border-outline-variant/40 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                    </div>
                    <div className="text-center">
                      <p className="text-label-md font-bold text-on-surface">Asset Images</p>
                      <p className="text-body-sm text-on-surface-variant/70 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>
                {/* List of uploaded files (Mockup) */}
                <div className="mt-8 border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-low/30">
                  <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                    Queued Files (0)
                  </div>
                  <div className="p-10 text-center text-on-surface-variant/60 text-body-sm italic">
                    No files selected. Drag and drop files above to attach them to this asset.
                  </div>
                </div>
              </div>
            </div>
            
          </form>

          {/* Form Actions */}
          <div className="mt-12 pt-10 border-t border-outline-variant/20 flex items-center justify-between">
            <button 
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`flex items-center gap-2.5 px-6 h-12 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md transition-all ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-high hover:border-outline-variant'}`}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </button>
            <div className="flex items-center gap-6">
              <button className="text-on-surface-variant/60 font-semibold text-label-md hover:text-on-surface transition-colors">Save as Draft</button>
              <button 
                type="button"
                onClick={handleNext}
                className={`flex items-center gap-2.5 px-10 h-12 rounded-xl text-on-primary font-bold text-label-md hover:brightness-110 active:scale-[0.98] transition-all shadow-lg ${currentStep === totalSteps ? 'bg-secondary-container' : 'bg-primary shadow-primary/20'}`}
              >
                {currentStep === totalSteps ? 'Complete Registration' : 'Continue'}
                <span className="material-symbols-outlined text-sm">{currentStep === totalSteps ? 'inventory' : 'arrow_forward'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Success Notification */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 glass-toast text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-5 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-[100] border border-white/10 ${showToast ? 'translate-y-0' : 'translate-y-32'}`}>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined text-xl font-bold">check</span>
        </div>
        <div>
          <p className="font-bold text-lg tracking-tight">Asset Registered Successfully</p>
          <p className="text-sm text-white/70">The asset has been logged in the secure inventory system.</p>
        </div>
      </div>
    </div>
  );
}
