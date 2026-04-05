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
    <div className="flex min-h-screen bg-[#0F1115] text-[#FFFFFF] font-sans selection:bg-white/10">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0F1115] border-r border-white/[0.04] transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:flex md:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="flex h-14 items-center gap-3 px-6">
          <div className="h-6 w-6 rounded bg-white flex items-center justify-center text-black">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">Portal</span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors relative group
                ${isActive ? "text-white bg-white/[0.03]" : "text-[#8B93A1] hover:text-white hover:bg-white/[0.02]"}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-white rounded-r-full" />}
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#8B93A1] group-hover:text-white"}`} />
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar User */}
        <div className="border-t border-white/[0.04] p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded bg-white/[0.05] flex items-center justify-center text-xs font-semibold text-[#8B93A1]">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.email?.split('@')[0]}</p>
              <p className="truncate text-[10px] text-[#8B93A1] font-medium">Free Workspace</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.04] px-8 z-50">
          <div className="flex items-center gap-4">
            <button 
              className="p-1.5 text-[#8B93A1] md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className="text-sm font-semibold tracking-tight">{currentPage}</h1>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 group"
            >
              <div className="h-8 w-8 rounded bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-xs font-semibold text-[#8B93A1] group-hover:bg-white/[0.05] transition-colors">
                {user?.email?.[0].toUpperCase()}
              </div>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-white/[0.06] bg-[#151821] py-1.5 shadow-2xl z-[70]">
                  <div className="px-4 py-2 border-b border-white/[0.04] mb-1">
                    <p className="truncate text-xs font-semibold text-white">{user?.email}</p>
                    <p className="text-[10px] text-[#8B93A1]">Personal Account</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-400/5 rounded transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>

  );
}
