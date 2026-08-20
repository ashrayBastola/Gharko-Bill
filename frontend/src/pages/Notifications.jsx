import { Bell, BellRing } from "lucide-react";
import React, { useEffect, useState } from "react";

import api from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { Button, EmptyState, PageHeader } from "../components/ui.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/notifications/").then(({ data }) => setItems(data.results || data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.post("/notifications/read-all/");
    load();
  };

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/read/`);
    load();
  };

  return (
    <Layout>
      <PageHeader
        eyebrow="Smart Notifications"
        title="Notifications"
        description="Every alert across bills, documents, warranties, and budgets."
        action={<Button variant="outline" onClick={markAllRead}>Mark all as read</Button>}
      />

      {loading && <p className="text-sm text-ink-faint">Loading notifications…</p>}

      {!loading && items.length === 0 && (
        <EmptyState icon={Bell} title="You're all caught up" description="New alerts will show up here." />
      )}

      <div className="rounded-lg border border-paper-line bg-paper-card shadow-card">
        {items.map((n, idx) => (
          <div
            key={n.id}
            onClick={() => !n.is_read && markRead(n.id)}
            className={`flex cursor-pointer items-start gap-3 px-5 py-4 ${idx !== items.length - 1 ? "border-b border-paper-line" : ""} ${!n.is_read ? "bg-brass/5" : ""}`}
          >
            <BellRing size={16} className={`mt-0.5 ${!n.is_read ? "text-brass" : "text-ink-faint"}`} />
            <div>
              <p className={`text-sm ${!n.is_read ? "font-semibold text-ink" : "text-ink-soft"}`}>{n.title}</p>
              <p className="text-sm text-ink-faint">{n.message}</p>
              <p className="mt-1 text-xs text-ink-faint">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
