import { CheckCircle2, Plus, Receipt, Upload, X, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import api from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { Badge, Button, EmptyState, Field, inputClass, Modal, PageHeader } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_TONE = {
  unpaid: "rust",
  overdue: "rust",
  pending_verification: "amber",
  paid: "green",
};

export default function Bills() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [proofTarget, setProofTarget] = useState(null);

  const loadBills = () => api.get("/bills/").then(({ data }) => setBills(data.results || data));

  useEffect(() => {
    Promise.all([loadBills(), api.get("/categories/").then(({ data }) => setCategories(data.results || data))]).finally(
      () => setLoading(false)
    );
  }, []);

  const handleVerify = async (proofId, decision) => {
    await api.post(`/bills/proofs/${proofId}/verify/`, { decision });
    loadBills();
  };

  return (
    <Layout>
      <PageHeader
        eyebrow="Bill Management"
        title="Household bills"
        description="Every bill, uploaded, verified, and tracked to a rupee."
        action={
          <Button variant="brass" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add bill
          </Button>
        }
      />

      {loading && <p className="text-sm text-ink-faint">Loading bills…</p>}

      {!loading && bills.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="No bills yet"
          description="Upload your first household bill to start tracking it."
          action={<Button variant="brass" onClick={() => setShowAdd(true)}>Add a bill</Button>}
        />
      )}

      <div className="space-y-4">
        {bills.map((bill) => (
          <div key={bill.id} className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-display text-lg text-ink">{bill.title}</p>
                  <Badge tone={STATUS_TONE[bill.status]}>{bill.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-ink-faint">
                  {bill.category_detail?.name || "Uncategorized"} · Due {bill.due_date} · Uploaded by{" "}
                  {bill.uploaded_by_name}
                </p>
                {bill.notes && <p className="mt-1 text-sm text-ink-soft">{bill.notes}</p>}
              </div>
              <p className="font-tabular text-xl font-semibold text-ink">Rs. {Number(bill.amount).toLocaleString()}</p>
            </div>

            {bill.payment_proofs.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-paper-line pt-4">
                {bill.payment_proofs.map((proof) => (
                  <div key={proof.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-ink-soft">
                      Paid Rs. {Number(proof.paid_amount).toLocaleString()} on {proof.paid_date} by{" "}
                      {proof.uploaded_by_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge tone={proof.status === "approved" ? "green" : proof.status === "rejected" ? "rust" : "amber"}>
                        {proof.status}
                      </Badge>
                      {user?.role === "admin" && proof.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerify(proof.id, "approve")}
                            className="text-ledger-green hover:opacity-70"
                            title="Approve"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => handleVerify(proof.id, "reject")}
                            className="text-ledger-rust hover:opacity-70"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {bill.status !== "paid" && (
              <div className="mt-4 border-t border-paper-line pt-3">
                <button
                  onClick={() => setProofTarget(bill)}
                  className="flex items-center gap-1.5 text-sm font-medium text-brass-dark hover:underline"
                >
                  <Upload size={14} /> Submit payment proof
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <AddBillModal open={showAdd} onClose={() => setShowAdd(false)} categories={categories} onCreated={loadBills} />
      <PaymentProofModal bill={proofTarget} onClose={() => setProofTarget(null)} onSubmitted={loadBills} />
    </Layout>
  );
}

function AddBillModal({ open, onClose, categories, onCreated }) {
  const [form, setForm] = useState({
    title: "", biller_name: "", category: "", amount: "", due_date: "", billing_period: "", notes: "",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => v && payload.append(k, v));
      if (file) payload.append("bill_file", file);
      await api.post("/bills/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      onCreated();
      onClose();
      setForm({ title: "", biller_name: "", category: "", amount: "", due_date: "", billing_period: "", notes: "" });
      setFile(null);
    } catch (err) {
      setError("Could not save this bill. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a new bill">
      {error && <div className="mb-4 rounded-md bg-ledger-rustSoft px-3 py-2 text-sm text-ledger-rust">{error}</div>}
      <form onSubmit={handleSubmit}>
        <Field label="Bill title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Electricity — June" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Biller name">
            <input className={inputClass} value={form.biller_name} onChange={(e) => setForm({ ...form, biller_name: e.target.value })} placeholder="e.g. NEA" />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (Rs.)">
            <input type="number" step="0.01" className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </Field>
          <Field label="Due date">
            <input type="date" className={inputClass} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
          </Field>
        </div>
        <Field label="Billing period">
          <input className={inputClass} value={form.billing_period} onChange={(e) => setForm({ ...form, billing_period: e.target.value })} placeholder="e.g. June 2026" />
        </Field>
        <Field label="Notes">
          <textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <Field label="Bill file (optional)">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="brass" disabled={saving}>{saving ? "Saving…" : "Save bill"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentProofModal({ bill, onClose, onSubmitted }) {
  const [form, setForm] = useState({ paid_amount: "", paid_date: "", notes: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (bill) setForm({ paid_amount: bill.amount, paid_date: "", notes: "" });
  }, [bill]);

  if (!bill) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("bill", bill.id);
      payload.append("paid_amount", form.paid_amount);
      payload.append("paid_date", form.paid_date);
      payload.append("notes", form.notes);
      if (file) payload.append("proof_file", file);
      await api.post("/bills/proofs/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      onSubmitted();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!bill} onClose={onClose} title={`Payment proof — ${bill.title}`}>
      <form onSubmit={handleSubmit}>
        <Field label="Amount paid (Rs.)">
          <input type="number" step="0.01" className={inputClass} value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} required />
        </Field>
        <Field label="Payment date">
          <input type="date" className={inputClass} value={form.paid_date} onChange={(e) => setForm({ ...form, paid_date: e.target.value })} required />
        </Field>
        <Field label="Proof (screenshot / receipt)">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" required />
        </Field>
        <Field label="Notes">
          <input className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}><X size={14} /> Cancel</Button>
          <Button type="submit" variant="brass" disabled={saving}>{saving ? "Submitting…" : "Submit proof"}</Button>
        </div>
      </form>
    </Modal>
  );
}
