import { FileStack, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

import api from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { Badge, Button, EmptyState, Field, inputClass, Modal, PageHeader } from "../components/ui.jsx";

const TYPE_LABELS = { id: "Citizenship / ID", insurance: "Insurance", license: "License", contract: "Contract", other: "Other" };

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => api.get("/documents/").then(({ data }) => setDocs(data.results || data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Document Vault"
        title="Secure documents"
        description="Citizenship, insurance, licenses, and contracts — kept safe and easy to find."
        action={<Button variant="brass" onClick={() => setShowAdd(true)}><Plus size={16} /> Add document</Button>}
      />

      {loading && <p className="text-sm text-ink-faint">Loading vault…</p>}

      {!loading && docs.length === 0 && (
        <EmptyState
          icon={FileStack}
          title="The vault is empty"
          description="Add your first document — a citizenship card, insurance policy, or license."
          action={<Button variant="brass" onClick={() => setShowAdd(true)}>Add document</Button>}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <div key={doc.id} className="rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <Badge>{TYPE_LABELS[doc.document_type]}</Badge>
              {doc.days_to_expiry !== null && (
                <Badge tone={doc.days_to_expiry < 30 ? "rust" : doc.days_to_expiry < 60 ? "amber" : "default"}>
                  {doc.days_to_expiry < 0 ? "Expired" : `${doc.days_to_expiry}d left`}
                </Badge>
              )}
            </div>
            <p className="font-display text-lg text-ink">{doc.title}</p>
            <p className="mt-1 text-xs text-ink-faint">
              Uploaded by {doc.uploaded_by_name} · {new Date(doc.created_at).toLocaleDateString()}
            </p>
            {doc.notes && <p className="mt-2 text-sm text-ink-soft">{doc.notes}</p>}
            <a
              href={doc.file}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium text-brass-dark hover:underline"
            >
              View file →
            </a>
          </div>
        ))}
      </div>

      <AddDocumentModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={load} />
    </Layout>
  );
}

function AddDocumentModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", document_type: "other", issued_date: "", expiry_date: "", notes: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => v && payload.append(k, v));
      if (file) payload.append("file", file);
      await api.post("/documents/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      onCreated();
      onClose();
      setForm({ title: "", document_type: "other", issued_date: "", expiry_date: "", notes: "" });
      setFile(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a document">
      <form onSubmit={handleSubmit}>
        <Field label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Citizenship Certificate" required />
        </Field>
        <Field label="Document type">
          <select className={inputClass} value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })}>
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Issued date">
            <input type="date" className={inputClass} value={form.issued_date} onChange={(e) => setForm({ ...form, issued_date: e.target.value })} />
          </Field>
          <Field label="Expiry date">
            <input type="date" className={inputClass} value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </Field>
        </div>
        <Field label="File">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" required />
        </Field>
        <Field label="Notes">
          <textarea rows={2} className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="brass" disabled={saving}>{saving ? "Saving…" : "Save document"}</Button>
        </div>
      </form>
    </Modal>
  );
}
