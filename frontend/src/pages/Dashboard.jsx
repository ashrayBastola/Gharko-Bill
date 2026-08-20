import { AlertTriangle, ArrowRight, Bell, CheckCircle2, Clock3, FileStack, Plus, Receipt, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import api from "../api/client.js";
import { Badge, Button, EmptyState, PageHeader, StatCard } from "../components/ui.jsx";
import Layout from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const money = new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 });
const formatAmount = (value) => `Rs. ${money.format(Number(value || 0))}`;
const dueTone = (days) => (days < 14 ? "rust" : "amber");

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async ({ refresh = false } = {}) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/households/dashboard/");
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load the dashboard. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const budgetData = useMemo(() => (summary?.budgets || []).map((budget) => ({
    name: budget.category_detail?.name || "Overall",
    Budget: Number(budget.limit_amount || 0),
    Spent: Number(budget.spent_amount || 0),
  })), [summary]);
  const budgetHealth = useMemo(() => {
    const planned = budgetData.reduce((total, item) => total + item.Budget, 0);
    const spent = budgetData.reduce((total, item) => total + item.Spent, 0);
    return { planned, spent, percentage: planned ? Math.round((spent / planned) * 100) : 0, remaining: planned - spent };
  }, [budgetData]);
  const firstName = user?.first_name || user?.username || "there";
  const hasAlerts = (summary?.bills?.unpaid || 0) + (summary?.bills?.pending_verification || 0) > 0;

  return <Layout>
    <PageHeader eyebrow="Household overview" title={`Good to see you, ${firstName}`} description="A clear view of what needs attention, what is on track, and what comes next." action={<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => loadDashboard({ refresh: true })} disabled={refreshing}><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />{refreshing ? "Refreshing" : "Refresh"}</Button><Link to="/bills"><Button variant="brass"><Plus size={16} /> Add bill</Button></Link></div>} />
    {loading && <DashboardSkeleton />}
    {error && !loading && <EmptyState icon={AlertTriangle} title="Dashboard unavailable" description={error} action={<Button variant="brass" onClick={() => loadDashboard()}>Try again</Button>} />}
    {summary && !loading && !error && <>
      <section className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-4" aria-label="Bill summary">
        <MetricLink to="/bills" label="Unpaid bills" value={summary.bills.unpaid} icon={Receipt} tone="rust" helper="Needs payment" />
        <MetricLink to="/bills" label="To verify" value={summary.bills.pending_verification} icon={Clock3} tone="amber" helper="Proofs awaiting review" />
        <MetricLink to="/bills" label="Paid this cycle" value={summary.bills.paid} icon={CheckCircle2} tone="green" helper="Bills completed" />
        <MetricLink to="/bills" label="Total outstanding" value={formatAmount(summary.bills.total_due)} icon={Wallet} helper="Across unpaid bills" />
      </section>
      {hasAlerts && <section className="mb-7 flex flex-col gap-3 rounded-[22px] border border-ledger-amber/20 bg-ledger-amberSoft/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertTriangle size={20} className="mt-0.5 shrink-0 text-ledger-amber" /><div><p className="font-medium text-ink">Your attention is needed</p><p className="text-sm text-ink-soft">{summary.bills.unpaid > 0 && `${summary.bills.unpaid} unpaid bill${summary.bills.unpaid === 1 ? "" : "s"}`}{summary.bills.unpaid > 0 && summary.bills.pending_verification > 0 && " and "}{summary.bills.pending_verification > 0 && `${summary.bills.pending_verification} proof${summary.bills.pending_verification === 1 ? "" : "s"} to verify`}.</p></div></div><Link to="/bills" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brass-dark hover:underline">Review bills <ArrowRight size={15} /></Link></section>}
      <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2">
        <section className="rounded-[22px] border border-paper-line bg-paper-card p-5 shadow-card sm:p-6"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-xl text-ink">Budget performance</h2><p className="mt-1 text-sm text-ink-faint">Planned spending compared with verified payments this month.</p></div>{budgetData.length > 0 && <Badge tone={budgetHealth.percentage > 100 ? "rust" : budgetHealth.percentage > 80 ? "amber" : "green"}>{budgetHealth.percentage}% used</Badge>}</div>{budgetData.length === 0 ? <EmptyState title="Set your first budget" description="Add category limits to see your spending progress here." action={<Link to="/budgets"><Button variant="outline">Open Budget Planner</Button></Link>} /> : <><div className="mb-5 grid gap-3 rounded-2xl bg-paper p-4 sm:grid-cols-3"><BudgetFigure label="Monthly budget" value={formatAmount(budgetHealth.planned)} /><BudgetFigure label="Spent so far" value={formatAmount(budgetHealth.spent)} /><BudgetFigure label={budgetHealth.remaining < 0 ? "Over budget" : "Remaining"} value={formatAmount(Math.abs(budgetHealth.remaining))} warn={budgetHealth.remaining < 0} /></div><ResponsiveContainer width="100%" height={270}><BarChart data={budgetData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E4DBC8" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} /><Tooltip formatter={(value) => formatAmount(value)} cursor={{ fill: "#F5EFE3" }} /><Bar dataKey="Budget" fill="#E4C98F" radius={[5, 5, 0, 0]} maxBarSize={38} /><Bar dataKey="Spent" fill="#B08D57" radius={[5, 5, 0, 0]} maxBarSize={38} /></BarChart></ResponsiveContainer><Link to="/budgets" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brass-dark hover:underline">Manage budgets <ArrowRight size={15} /></Link></>}</section>
        <section className="rounded-[22px] border border-paper-line bg-paper-card p-5 shadow-card sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-xl text-ink">Recent activity</h2><p className="mt-1 text-sm text-ink-faint">The latest changes in your household.</p></div><Link to="/activity" className="text-sm font-semibold text-brass-dark hover:underline">View all</Link></div>{summary.recent_activity.length === 0 ? <p className="py-5 text-sm text-ink-faint">No activity yet. Add a bill or budget to begin your timeline.</p> : <ul className="divide-y divide-paper-line">{summary.recent_activity.map((item) => <li key={item.id} className="flex items-start justify-between gap-4 py-3.5 text-sm"><p className="text-ink-soft"><span className="font-semibold text-ink">{item.actor_name}</span> {item.verb}</p><time className="shrink-0 text-xs text-ink-faint" dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></li>)}</ul>}</section>
      </div><aside className="space-y-6"><DueList title="Expiring warranties" icon={ShieldCheck} items={summary.expiring_warranties} itemKey="product_name" to="/warranties" empty="No warranties expire in the next 60 days." /><DueList title="Expiring documents" icon={FileStack} items={summary.expiring_documents} itemKey="title" to="/documents" empty="No documents expire in the next 60 days." /><section className="rounded-[22px] border border-paper-line bg-slate-950 p-5 text-white shadow-card"><Bell size={19} className="mb-4 text-brand" /><h2 className="font-display text-lg">Stay in the loop</h2><p className="mt-2 text-sm text-slate-300">You have <span className="font-semibold text-white">{summary.unread_notifications}</span> unread notification{summary.unread_notifications === 1 ? "" : "s"}.</p><Link to="/notifications" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-white">Open notifications <ArrowRight size={15} /></Link></section></aside></div>
    </>}
  </Layout>;
}

function MetricLink({ to, label, value, icon, tone, helper }) { return <Link to={to} className="rounded-[22px] transition-transform hover:-translate-y-0.5 focus:outline-none"><StatCard label={label} value={value} icon={icon} tone={tone} /><p className="-mt-6 px-5 pb-4 text-xs text-ink-faint">{helper}</p></Link>; }
function BudgetFigure({ label, value, warn }) { return <div><p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">{label}</p><p className={`mt-1 font-tabular text-lg font-semibold ${warn ? "text-ledger-rust" : "text-ink"}`}>{value}</p></div>; }
function DueList({ title, icon: Icon, items, itemKey, to, empty }) { return <section className="rounded-[22px] border border-paper-line bg-paper-card p-5 shadow-card"><div className="mb-4 flex items-center gap-2"><Icon size={18} className="text-brass" /><h2 className="font-display text-lg text-ink">{title}</h2></div>{items.length === 0 ? <p className="text-sm leading-6 text-ink-faint">{empty}</p> : <><ul className="space-y-3">{items.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-ink-soft">{item[itemKey]}</span><Badge tone={dueTone(item.days_to_expiry)}>{item.days_to_expiry}d left</Badge></li>)}</ul><Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brass-dark hover:underline">View all <ArrowRight size={14} /></Link></>}</section>; }
function DashboardSkeleton() { return <div className="animate-pulse"><div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 rounded-[22px] bg-paper-card" />)}</div><div className="grid gap-6 lg:grid-cols-3"><div className="h-[430px] rounded-[22px] bg-paper-card lg:col-span-2" /><div className="h-72 rounded-[22px] bg-paper-card" /></div></div>; }
