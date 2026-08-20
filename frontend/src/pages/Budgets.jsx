import { Plus, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";

import api from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { Badge, Button, EmptyState, Field, inputClass, Modal, PageHeader } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => api.get("/budgets/").then(({ data }) => setBudgets(data.results || data));

  useEffect(() => {
    Promise.all([load(), api.get("/categories/").then(({ data }) => setCategories(data.results || data))]).finally(
      () => setLoading(false)
    );
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Monthly Budget Planner"
        title="Budgets"
        description="Set spending limits per category and track budget vs actual in real time."
        action={
          user?.role === "admin" && (
            <Button variant="brass" onClick={() => setShowAdd(true)}><Plus size={16} /> Set budget</Button>
          )
        }
      />

      {loading && <p className="text-sm text-ink-faint">Loading budgets…</p>}

      {!loading && budgets.length === 0 && (
        <EmptyState
          icon={Wallet}
          title="No budgets set"
          description={
            user?.role === "admin"
              ? "Set your first monthly budget to start tracking spend against it."
              : "Ask your household admin to set a monthly budget."
          }
          action={user?.role === "admin" && <Button variant="brass" onClick={() => setShowAdd(true)}>Set budget</Button>}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((b) => {
          const pct = b.percent_used;
          const over = pct > 100;
          return (
            <div key={b.id} className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-lg text-ink">{b.category_detail?.name || "Overall"}</p>
                <Badge tone={over ? "rust" : pct > 80 ? "amber" : "green"}>{pct}%</Badge>
              </div>
              <p className="text-xs text-ink-faint">{new Date(b.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-paper-line">
                <div
                  className={`h-full ${over ? "bg-ledger-rust" : "bg-brass"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="mt-3 font-tabular text-sm text-ink-soft">
                Rs. {Number(b.spent_amount).toLocaleString()} / Rs. {Number(b.limit_amount).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <SetBudgetModal open={showAdd} onClose={() => setShowAdd(false)} categories={categories} onCreated={load} />
    </Layout>
  );
}

function SetBudgetModal({ open, onClose, categories, onCreated }) {
  const [form, setForm] = useState({ category: "", month: currentMonthValue(), limit_amount: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/budgets/", { ...form, category: form.category || null });
      onCreated();
      onClose();
      setForm({ category: "", month: currentMonthValue(), limit_amount: "" });
    } catch {
      setError("Could not save this budget. A budget for this category and month may already exist.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Set a monthly budget">
      {error && <div className="mb-4 rounded-md bg-ledger-rustSoft px-3 py-2 text-sm text-ledger-rust">{error}</div>}
      <form onSubmit={handleSubmit}>
        <Field label="Category" hint="Leave blank for an overall household budget.">
          <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Overall household budget</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Month">
          <input type="date" className={inputClass} value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
        </Field>
        <Field label="Limit amount (Rs.)">
          <input type="number" step="0.01" className={inputClass} value={form.limit_amount} onChange={(e) => setForm({ ...form, limit_amount: e.target.value })} required />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="brass" disabled={saving}>{saving ? "Saving…" : "Save budget"}</Button>
        </div>
      </form>
    </Modal>
  );
}
