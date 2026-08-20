import { Home } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <p className="font-display text-6xl text-brass">404</p>
      <h1 className="mt-2 font-display text-2xl text-ink">This page isn't in the ledger</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-faint">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper-card hover:bg-ink-soft">
        <Home size={16} /> Back to dashboard
      </Link>
    </div>
  );
}
