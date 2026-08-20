import { ArrowRight, CheckCircle2, Home, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import { Link } from "react-router-dom";

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  helperPoints = [],
  accentLabel = "Secure family finance",
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(47,111,237,0.14),_transparent_35%),linear-gradient(135deg,_#f8f4ea_0%,_#f1ebde_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[28px] border border-white/70 bg-slate-950/95 p-8 text-white shadow-[0_28px_80px_-24px_rgba(15,23,42,0.7)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_30%),linear-gradient(140deg,_rgba(47,111,237,0.8),_rgba(16,24,40,0.95))]" />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/85">
              <Home size={18} /> BillNest
            </Link>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-100/90">
              <ShieldCheck size={14} /> {accentLabel}
            </div>

            <h1 className="mt-6 font-display text-3xl leading-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
              {description}
            </p>

            <div className="mt-8 space-y-3">
              {helperPoints.length > 0 ? (
                helperPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100/90">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                    <span>{point}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100/90">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                    Track rent, utilities, groceries, and school fees in one secure place.
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100/90">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                    Share approvals, reminders, and document proofs without friction.
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-slate-200">
              <span className="rounded-full bg-white/10 px-3 py-1">Trusted by modern families</span>
              <ArrowRight size={16} className="text-emerald-300" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-[28px] border border-paper-line bg-paper-card p-6 shadow-card sm:p-8"
        >
          {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark">{eyebrow}</p>}
          <div className="mb-6">{children}</div>
          {footer && <div className="mt-6 border-t border-paper-line pt-4 text-sm text-ink-faint">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
