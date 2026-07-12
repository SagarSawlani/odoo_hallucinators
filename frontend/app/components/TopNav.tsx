export default function TopNav() {
  return (
    <header className="sticky top-0 h-[72px] glass-nav border-b border-outline-variant/20 z-40 flex items-center justify-between px-6 lg:px-10">
      <div className="flex items-center gap-4 flex-1 max-w-2xl min-w-0">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline/60 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search assets, teams, or serial numbers..."
            className="w-full h-10 bg-surface-container-low/40 border border-outline-variant/20 rounded-full pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 lg:gap-6 shrink-0 ml-4">
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-all">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant relative transition-all">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          </button>
        </div>
        <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
        <div className="flex items-center gap-3 cursor-pointer group hover:bg-surface-container-low p-1.5 rounded-xl transition-all">
          <div className="text-right hidden sm:block min-w-0">
            <p className="text-sm font-bold text-on-surface leading-none truncate">Alex Rivera</p>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-outline mt-1">Admin</p>
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-sm ring-2 ring-primary/5 group-hover:ring-primary/30 transition-all shrink-0">
            <div className="w-full h-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              AR
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
