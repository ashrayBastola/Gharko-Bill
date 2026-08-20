import React, { useState } from "react";

import api from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { Button, Field, inputClass, PageHeader } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/auth/me/", form);
      await refreshUser();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <PageHeader eyebrow="Account" title="Settings" description="Manage your personal profile." />

      <div className="max-w-md rounded-lg border border-paper-line bg-paper-card p-6 shadow-card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input className={inputClass} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </Field>
            <Field label="Last name">
              <input className={inputClass} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone number">
            <input className={inputClass} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          </Field>
          {saved && <p className="mb-3 text-sm text-ledger-green">Profile updated.</p>}
          <Button type="submit" variant="brass" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </form>
      </div>

      <div className="mt-6 max-w-md rounded-lg border border-paper-line bg-paper-card p-6 shadow-card">
        <p className="mb-1 text-sm font-medium text-ink-soft">Role</p>
        <p className="font-display text-lg capitalize text-ink">{user?.role}</p>
        <p className="mt-3 text-sm font-medium text-ink-soft">Household</p>
        <p className="font-display text-lg text-ink">{user?.household_name || "—"}</p>
      </div>
    </Layout>
  );
}
