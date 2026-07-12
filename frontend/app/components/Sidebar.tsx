"use client";

import Link from 'next/link';

export default function Sidebar({ activePath = '/dashboard' }: { activePath?: string }) {
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Organization', icon: 'domain', path: '/organization' },
    { name: 'Assets', icon: 'inventory_2', path: '/assets' },
    { name: 'Transfers', icon: 'swap_horiz', path: '/transfers' },
    { name: 'Bookings', icon: 'event_available', path: '/bookings' },
    { name: 'Maintenance', icon: 'build', path: '/maintenance' },
    { name: 'Audit', icon: 'fact_check', path: '/audit' },
    { name: 'Reports', icon: 'analytics', path: '/reports' },
    { name: 'Notifications', icon: 'notifications', path: '/notifications' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[280px] glass-sidebar border-r border-outline-variant/30 flex-col z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg tracking-tight text-on-surface truncate">AssetFlow</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline truncate">Enterprise Suite</p>
            </div>
          </div>
          <nav className="space-y-1.5 custom-scrollbar overflow-y-auto max-h-[calc(100vh-250px)]">
            {navItems.map((item) => {
              const isActive = activePath === item.path || (item.path !== '/dashboard' && activePath.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={
                    isActive
                      ? "flex items-center gap-3 px-4 py-2.5 rounded-xl text-primary font-semibold bg-primary/5 transition-all duration-200"
                      : "flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high/50 transition-all duration-200 group"
                  }
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 ${!isActive ? 'group-hover:text-primary transition-colors' : ''}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-outline-variant/20 space-y-1.5">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high/50 transition-all duration-200 group">
            <span className="material-symbols-outlined text-[20px] group-hover:text-primary shrink-0">settings</span>
            <span className="text-sm truncate">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-nav flex justify-around p-3 border-t border-outline-variant/30 z-50">
        <Link href="/dashboard" className={`flex flex-col items-center p-2 ${activePath === '/dashboard' ? 'text-primary' : 'text-on-surface-variant/60'}`}>
          <span className="material-symbols-outlined text-[24px]" style={activePath === '/dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
          <span className="text-[9px] font-bold mt-1">Dashboard</span>
        </Link>
        <Link href="/assets" className={`flex flex-col items-center p-2 ${activePath.startsWith('/assets') ? 'text-primary' : 'text-on-surface-variant/60'}`}>
          <span className="material-symbols-outlined text-[24px]" style={activePath.startsWith('/assets') ? { fontVariationSettings: "'FILL' 1" } : {}}>inventory_2</span>
          <span className="text-[9px] font-bold mt-1">Assets</span>
        </Link>
        <Link href="/transfers" className={`flex flex-col items-center p-2 ${activePath.startsWith('/transfers') ? 'text-primary' : 'text-on-surface-variant/60'}`}>
          <span className="material-symbols-outlined text-[24px]" style={activePath.startsWith('/transfers') ? { fontVariationSettings: "'FILL' 1" } : {}}>swap_horiz</span>
          <span className="text-[9px] font-bold mt-1">Move</span>
        </Link>
        <Link href="/settings" className={`flex flex-col items-center p-2 ${activePath.startsWith('/settings') ? 'text-primary' : 'text-on-surface-variant/60'}`}>
          <span className="material-symbols-outlined text-[24px]" style={activePath.startsWith('/settings') ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
          <span className="text-[9px] font-bold mt-1">Settings</span>
        </Link>
      </nav>
    </>
  );
}
