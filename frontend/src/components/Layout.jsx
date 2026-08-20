import {
  Bell,
  ClipboardList,
  FileStack,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/bills", label: "Bills", icon: Receipt },
  { to: "/documents", label: "Document Vault", icon: FileStack },
  { to: "/warranties", label: "Warranties", icon: ShieldCheck },
  { to: "/budgets", label: "Budget Planner", icon: Wallet },
  { to: "/activity", label: "Financial Timeline", icon: ClipboardList },
  { to: "/family", label: "Family Members", icon: Users },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8f4ea_0%,_#f1ebde_100%)] text-slate-800">
      <div className="flex items-center justify-between border-b border-paper-line bg-slate-950 px-4 py-3 text-white md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Home size={20} className="text-emerald-300" />
          <span className="font-display text-lg">BillNest</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-paper-line bg-slate-950 px-4 py-6 text-slate-100 md:flex md:fixed md:inset-y-0">
          <SidebarContent user={user} onLogout={handleLogout} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-slate-950/70" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 bg-slate-950 p-4 text-slate-100">
              <div className="mb-4 flex justify-end">
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>
              <SidebarContent user={user} onLogout={handleLogout} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 md:ml-72">
          <header className="sticky top-0 z-20 border-b border-paper-line bg-paper-card/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-dark">Connected household finance</p>
                <h2 className="font-display text-xl text-ink">Your home, organized.</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="hidden rounded-full border border-paper-line p-2 text-ink-soft sm:inline-flex" aria-label="Search">
                  <Search size={16} />
                </button>
                <div className="rounded-full border border-paper-line bg-white/70 px-3 py-2 text-sm text-ink-soft">
                  {user?.household_name || "Household"}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ user, onLogout, onNavigate }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Link to="/dashboard" className="mb-8 flex items-center gap-3 px-2" onClick={onNavigate}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-display text-xl leading-tight">BillNest</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Household OS</p>
          </div>
        </Link>

        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 font-display text-sm text-brand">
            {(user?.first_name || user?.username || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.first_name || user?.username}</p>
            <p className="truncate text-xs text-slate-400">{user?.household_name || "No household"}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-rose-200"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}
