import { Outlet, NavLink } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-slate-100">
              Simple Client Portal
            </span>
          </NavLink>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-emerald-400" : "hover:text-emerald-300"
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                isActive ? "text-emerald-400" : "hover:text-emerald-300"
              }
            >
              Clients
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive ? "text-emerald-400" : "hover:text-emerald-300"
              }
            >
              Projects
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

