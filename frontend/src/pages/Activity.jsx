import { ClipboardList } from "lucide-react";
import React, { useEffect, useState } from "react";

import api from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { EmptyState, PageHeader } from "../components/ui.jsx";

export default function Activity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/activity/")
      .then(({ data }) => setItems(data.results || data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Financial Timeline"
        title="Household activity"
        description="A chronological record of everything happening across every module."
      />

      {loading && <p className="text-sm text-ink-faint">Loading timeline…</p>}

      {!loading && items.length === 0 && (
        <EmptyState icon={ClipboardList} title="No activity yet" description="Actions across bills, documents, and budgets will appear here." />
      )}

      <div className="relative border-l border-paper-line pl-6">
        {items.map((item) => (
          <div key={item.id} className="relative mb-6">
            <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-brass bg-paper-card" />
            <p className="text-sm text-ink-soft">
              <span className="font-medium text-ink">{item.actor_name}</span> {item.verb}
              {item.target_repr && <span className="text-ink-faint"> — {item.target_repr}</span>}
            </p>
            <p className="text-xs text-ink-faint">{new Date(item.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
