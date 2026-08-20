import { AlertTriangle, Bell, CheckCircle2, Clock, FileStack, Receipt, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import api from "../api/client.js";
import { Badge, EmptyState, PageHeader, StatCard } from "../components/ui.jsx";
import Layout from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/households/dashboard/")
      .then(({ data }) => setSummary(data))
      .catch((err) => setError(err.response?.data?.detail || "Could not load the dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Household overview"
        title={`Good to see you, ${user?.first_name || user?.username}`}
        description="Everything happening across bills, budgets, documents, and warranties — in one view."
      />

      {loading && <p className="text-sm text-ink-faint">Loading your ledger…</p>}

      {error && !loading && (
        <EmptyState
          icon={AlertTriangle}
          title="No household yet"
          description={error}
          action={
            <Link to="/settings" className="text-sm font-medium text-brass-dark hover:underline">
              Go to settings
            </Link>
          }
        />
      )}

      {summary && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Unpaid Bills" value={summary.bills.unpaid} icon={Receipt} tone="rust" />
            <StatCard label="Pending Verification" value={summary.bills.pending_verification} icon={Clock} tone="amber" />
            <StatCard label="Paid This Cycle" value={summary.bills.paid} icon={CheckCircle2} tone="green" />
            <StatCard
              label="Total Due"
              value={`Rs. ${Number(summary.bills.total_due).toLocaleString()}`}
              icon={Receipt}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
                <h2 className="mb-4 font-display text-lg text-ink">Budget vs Actual — this month</h2>
                {summary.budgets.length === 0 ? (
                  <EmptyState
                    title="No budget set yet"
                    description="Set a monthly limit per category to start tracking budget vs actual."
                    action={
                      <Link to="/budgets" className="text-sm font-medium text-brass-dark hover:underline">
                        Go to Budget Planner
                      </Link>
                    }
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={summary.budgets.map((b) => ({
                        name: b.category_detail?.name || "Overall",
                        Budget: Number(b.limit_amount),
                        Spent: Number(b.spent_amount),
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DBC8" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#3C4A5E" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#3C4A5E" }} />
                      <Tooltip />
                      <Bar dataKey="Budget" fill="#E4C98F" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill="#B08D57" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
                <h2 className="mb-4 font-display text-lg text-ink">Recent activity</h2>
                {summary.recent_activity.length === 0 ? (
                  <p className="text-sm text-ink-faint">Nothing has happened yet — upload your first bill.</p>
                ) : (
                  <ul className="space-y-3">
                    {summary.recent_activity.map((item) => (
                      <li key={item.id} className="stitch flex items-center justify-between pb-3 text-sm">
                        <span className="text-ink-soft">
                          <span className="font-medium text-ink">{item.actor_name}</span> {item.verb}
                        </span>
                        <span className="text-xs text-ink-faint">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-ink">
                  <ShieldCheck size={18} className="text-brass" /> Expiring warranties
                </h2>
                {summary.expiring_warranties.length === 0 ? (
                  <p className="text-sm text-ink-faint">No warranties expiring in the next 60 days.</p>
                ) : (
                  <ul className="space-y-2">
                    {summary.expiring_warranties.map((w) => (
                      <li key={w.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink-soft">{w.product_name}</span>
                        <Badge tone={w.days_to_expiry < 14 ? "rust" : "amber"}>{w.days_to_expiry}d left</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-ink">
                  <FileStack size={18} className="text-brass" /> Expiring documents
                </h2>
                {summary.expiring_documents.length === 0 ? (
                  <p className="text-sm text-ink-faint">No documents expiring in the next 60 days.</p>
                ) : (
                  <ul className="space-y-2">
                    {summary.expiring_documents.map((d) => (
                      <li key={d.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink-soft">{d.title}</span>
                        <Badge tone={d.days_to_expiry < 14 ? "rust" : "amber"}>{d.days_to_expiry}d left</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
                <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-ink">
                  <Bell size={18} className="text-brass" /> Notifications
                </h2>
                <p className="text-sm text-ink-soft">
                  You have <span className="font-semibold">{summary.unread_notifications}</span> unread
                  notifications.
                </p>
                <Link to="/notifications" className="mt-2 inline-block text-sm font-medium text-brass-dark hover:underline">
                  View all →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
