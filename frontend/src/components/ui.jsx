import { AlertCircle } from "lucide-react";
import React from "react";

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-[24px] border border-paper-line bg-paper-card/80 px-5 py-5 shadow-card md:flex-row md:items-end md:justify-between md:px-6">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "default", suffix }) {
  const toneMap = {
    default: "text-ink",
    green: "text-ledger-green",
    rust: "text-ledger-rust",
    amber: "text-ledger-amber",
  };
  return (
    <div className="rounded-[22px] border border-paper-line bg-paper-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-faint">{label}</p>
        {Icon && <Icon size={16} className="text-brand" />}
      </div>
      <p className={`font-tabular text-2xl font-semibold ${toneMap[tone]}`}>
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-ink-faint">{suffix}</span>}
      </p>
    </div>
  );
}

export function Badge({ children, tone = "default" }) {
  const toneMap = {
    default: "bg-paper-line text-ink-soft",
    green: "bg-ledger-greenSoft text-ledger-green",
    rust: "bg-ledger-rustSoft text-ledger-rust",
    amber: "bg-ledger-amberSoft text-ledger-amber",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon = AlertCircle, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-paper-line bg-paper-card px-6 py-14 text-center shadow-card">
      <Icon size={28} className="mb-3 text-brand" />
      <p className="font-display text-lg text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-faint">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-paper-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-slate-900 text-paper-card hover:bg-slate-700",
    brass: "bg-brand text-paper-card hover:bg-brand-dark",
    outline: "border border-paper-line text-ink hover:bg-paper",
    danger: "bg-ledger-rust text-paper-card hover:bg-ledger-rust/90",
    ghost: "text-ink-soft hover:bg-paper",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-paper-line bg-white/80 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
