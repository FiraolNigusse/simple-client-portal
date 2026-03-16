import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { Button } from "../components/ui/Button";

const NAV_ITEMS = [
  { 
    to: "/dashboard", 
    label: "Overview", 
    end: true, 
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  { 
    to: "/clients", 
    label: "Clients", 
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    to: "/projects", 
    label: "Projects", 
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )
  },
  { 
    to: "/invoices", 
    label: "Invoices", 
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    to: "/subscription", 
    label: "Billing", 
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    to: "/settings", 
    label: "Settings", 
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];


export function MainLayout() {
  const { signOut, user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  const currentPage = NAV_ITEMS.find(item => 
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-portal-text font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar (Desktop and Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar border-r border-white/5 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:flex md:translate-x-0 lg:w-72
      `}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/25">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-portal-text">AuroraDesk</span>
          </div>
          {/* Close button for mobile */}
          <button 
            className="rounded-lg p-1.5 text-portal-muted hover:bg-white/5 md:hidden"
            onClick={closeSidebar}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) => `
                group flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm font-semibold transition-all duration-300
                ${isActive 
                  ? "bg-gradient-to-r from-primary/20 to-accent/10 text-accent border border-accent/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                  : "text-portal-muted hover:bg-white/5 hover:text-portal-text"}
              `}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 border border-white/5 backdrop-blur-sm">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-accent border border-accent/10">
              {user?.email?.[0].toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-portal-text">{user?.email}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.1em] font-black text-portal-muted/60">
                {subscription?.plan_label || "Free"} Workspace
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-sidebar/80 px-4 md:px-8 backdrop-blur-xl aurora-glow z-50">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button 
              className="rounded-lg p-1.5 text-portal-muted hover:bg-white/5 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/20">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-sm md:text-lg font-black tracking-tight text-portal-text uppercase tracking-[0.05em]">{currentPage}</h1>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-2xl p-1.5 transition-all hover:bg-white/5"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-accent p-[1px]">
                <div className="h-full w-full rounded-[11px] bg-sidebar flex items-center justify-center text-xs font-bold text-portal-text">
                  {user?.email?.[0].toUpperCase() || "U"}
                </div>
              </div>
              <svg className="h-4 w-4 text-portal-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setProfileOpen(false)} 
                />
                <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-[20px] border border-white/10 bg-surface px-2 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl z-[70]">
                  <div className="px-4 py-4 border-b border-white/5">
                    <p className="text-[10px] uppercase tracking-[0.1em] font-black text-portal-muted mb-1">Authenticated</p>
                    <p className="truncate text-sm font-bold text-portal-text">{user?.email}</p>
                  </div>
                  <div className="p-1 space-y-1">
                    <NavLink
                      to="/subscription"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-portal-muted hover:bg-white/5 hover:text-portal-text rounded-[14px] transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Subscription
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-portal-error hover:bg-portal-error/5 rounded-[14px] transition-all"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-background p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
