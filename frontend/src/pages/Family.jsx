import { Copy, Trash2, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

import api from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { Badge, Button, PageHeader } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Family() {
  const { user } = useAuth();
  const [household, setHousehold] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = () => api.get("/households/me/").then(({ data }) => setHousehold(data));

  useEffect(() => {
    load();
  }, []);

  const copyInvite = () => {
    navigator.clipboard.writeText(household.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const removeMember = async (id) => {
    if (!confirm("Remove this member from the household?")) return;
    await api.delete(`/households/members/${id}/`);
    load();
  };

  if (!household) return null;

  return (
    <Layout>
      <PageHeader
        eyebrow="Family Members"
        title={household.name}
        description="Everyone with access to this household's bills, documents, and budgets."
      />

      <div className="mb-6 rounded-lg border border-paper-line bg-paper-card p-5 shadow-card">
        <p className="mb-1 text-sm font-medium text-ink-soft">Invite code</p>
        <div className="flex items-center gap-3">
          <span className="font-tabular rounded-md bg-paper px-3 py-1.5 text-lg tracking-widest text-ink">
            {household.invite_code}
          </span>
          <Button variant="outline" onClick={copyInvite}>
            <Copy size={14} /> {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-faint">Share this code so family members can join your household.</p>
      </div>

      <div className="rounded-lg border border-paper-line bg-paper-card shadow-card">
        {household.members.map((member, idx) => (
          <div
            key={member.id}
            className={`flex items-center justify-between px-5 py-4 ${idx !== household.members.length - 1 ? "border-b border-paper-line" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brass/15 font-display text-sm text-brass-dark">
                {(member.first_name || member.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  {member.first_name} {member.last_name} {member.id === user.id && "(you)"}
                </p>
                <p className="text-xs text-ink-faint">@{member.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={member.role === "admin" ? "amber" : "default"}>{member.role}</Badge>
              {user.role === "admin" && member.id !== user.id && (
                <button onClick={() => removeMember(member.id)} className="text-ink-faint hover:text-ledger-rust" title="Remove member">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
