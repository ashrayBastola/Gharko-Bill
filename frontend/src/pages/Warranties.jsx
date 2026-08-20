import { Plus, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";

import api from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { Badge, Button, EmptyState, Field, inputClass, Modal, PageHeader } from "../components/ui.jsx";

export default function Warranties() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => api.get("/warranties/").then(({ data }) => setWarranties(data.results || data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Warranty Tracker"
        title="Appliances & purchases"
        description="Track warranty coverage so you never miss a claim window."
        action={<Button variant="brass" onClick={() => setShowAdd(true)}><Plus size={16} /> Add warranty</Button>}
      />

      {loading && <p className="text-sm text-ink-faint">Loading warranties…</p>}

      {!loading && warranties.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title="No warranties tracked yet"
          description="Add a purchase to start tracking its warranty period."
          action={<Button variant="brass" onClick={() => setShowAdd(true)}>Add warranty</Button>}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {warranties.map((w) => (
          <div key={w.id} className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <Badge tone={w.is_expired ? "rust" : w.days_to_expiry < 30 ? "amber" : "green"}>
                {w.is_expired ? "Expired" : `${w.days_to_expiry}d left`}
              </Badge>
            </div>
            <p className="font-display text-lg text-ink">{w.product_name}</p>
            <p className="text-sm text-ink-faint">{w.brand}</p>
            <p className="mt-2 text-xs text-ink-faint">
              Purchased {w.purchase_date} · Expires {w.warranty_expiry}
            </p>
            {w.notes && <p className="mt-2 text-sm text-ink-soft">{w.notes}</p>}
            {w.receipt_file && (
              <a href={w.receipt_file} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-brass-dark hover:underline">
                View receipt →
              </a>
            )}
          </div>
        ))}
      </div>

      <AddWarrantyModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={load} />
    </Layout>
  );
}

function AddWarrantyModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ product_name: "", brand: "", purchase_date: "", warranty_expiry: "", notes: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => v && payload.append(k, v));
      if (file) payload.append("receipt_file", file);
      await api.post("/warranties/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      onCreated();
      onClose();
      setForm({ product_name: "", brand: "", purchase_date: "", warranty_expiry: "", notes: "" });
      setFile(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a warranty">
      <form onSubmit={handleSubmit}>
        <Field label="Product name">
          <input className={inputClass} value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Refrigerator" required />
        </Field>
        <Field label="Brand">
          <input className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase date">
            <input type="date" className={inputClass} value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} required />
          </Field>
          <Field label="Warranty expiry">
            <input type="date" className={inputClass} value={form.warranty_expiry} onChange={(e) => setForm({ ...form, warranty_expiry: e.target.value })} required />
          </Field>
        </div>
        <Field label="Receipt (optional)">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
        </Field>
        <Field label="Notes">
          <textarea rows={2} className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="brass" disabled={saving}>{saving ? "Saving…" : "Save warranty"}</Button>
        </div>
      </form>
    </Modal>
  );
}
