import { ArrowRight, FileStack, Receipt, ShieldCheck, Wallet } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const MODULES = [
  { icon: Receipt, title: "Bill Management", desc: "Upload, categorize, and track every household bill in one ledger." },
  { icon: ShieldCheck, title: "Document Vault", desc: "Citizenship, insurance, and licenses — stored safely, never lost." },
  { icon: Wallet, title: "Budget Planner", desc: "Set monthly limits per category and watch spend against them." },
  { icon: FileStack, title: "Warranty Tracker", desc: "Never miss a return window or expiring coverage again." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl text-ink">BillNest</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink">
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper-card hover:bg-ink-soft"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 md:pt-16">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brass-dark">
              Household management, ledgered
            </p>
            <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
              One home. One place.
              <br />
              Every bill, document,
              <br />
              and rupee tracked.
            </h1>
            <p className="mt-5 max-w-md text-ink-soft">
              BillNest is the shared ledger for your household — bills, payment proofs, warranties,
              legal documents, and budgets, verified by the family and visible to everyone.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-md bg-brass px-5 py-3 text-sm font-medium text-paper-card hover:bg-brass-dark"
              >
                Create your household <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-paper-line px-5 py-3 text-sm font-medium text-ink hover:bg-paper-card"
              >
                I already have an account
              </Link>
            </div>
          </div>

          {/* Signature element: a stamped "ledger card" mockup */}
          <div className="relative">
            <div className="rounded-lg border border-paper-line bg-paper-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-lg text-ink">July Ledger</p>
                <span className="rounded-full bg-ledger-amberSoft px-3 py-1 text-xs font-medium text-ledger-amber">
                  3 due this week
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Electricity — NEA", amount: "Rs. 2,450", tone: "rust", status: "Overdue" },
                  { name: "Internet — WorldLink", amount: "Rs. 1,800", tone: "amber", status: "Pending" },
                  { name: "Water Supply", amount: "Rs. 650", tone: "green", status: "Paid" },
                ].map((row) => (
                  <div key={row.name} className="stitch flex items-center justify-between pb-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{row.name}</p>
                      <p className="text-xs text-ink-faint">{row.status}</p>
                    </div>
                    <p className="font-tabular text-sm text-ink">{row.amount}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 hidden h-24 w-24 items-center justify-center rounded-full border-2 border-brass/40 font-display text-xs uppercase tracking-widest text-brass-dark md:flex">
              Verified
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 font-display text-2xl text-ink">Ten modules. One dashboard.</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-paper-line bg-paper-card p-5">
              <Icon size={20} className="mb-3 text-brass" />
              <p className="mb-1 font-display text-base text-ink">{title}</p>
              <p className="text-sm text-ink-faint">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-paper-line py-8 text-center text-sm text-ink-faint">
        BillNest — built as a full-stack household management platform.
      </footer>
    </div>
  );
}
