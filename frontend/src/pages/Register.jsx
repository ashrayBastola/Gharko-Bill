import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/auth/AuthShell.jsx";
import { Button, Field, inputClass } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    household_name: "",
    invite_code: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (mode === "create") delete payload.invite_code;
      else delete payload.household_name;
      await register(payload);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const firstError = data && Object.values(data)[0];
      setError(Array.isArray(firstError) ? firstError[0] : firstError || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Family member onboarding"
      title="Set up your household finance hub"
      description="Start fresh with a new household ledger or join an existing one using a secure invite code."
      helperPoints={[
        "Create a shared ledger for rent, utilities, and periodical bills",
        "Invite family members to collaborate without sharing passwords",
        "Stay on top of due dates, budgets, and document storage",
      ]}
      footer={
        <>
          Already have an account? <Link to="/login" className="font-medium text-ink">Sign in</Link>
        </>
      }
    >
      <div className="mb-6">
        <h2 className="font-display text-2xl text-ink">Create your account</h2>
        <p className="mt-1 text-sm text-ink-faint">Choose the experience that fits your household.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-paper p-1">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`rounded-full py-2 text-sm font-medium ${mode === "create" ? "bg-white text-ink shadow-sm" : "text-ink-faint"}`}
        >
          Create household
        </button>
        <button
          type="button"
          onClick={() => setMode("join")}
          className={`rounded-full py-2 text-sm font-medium ${mode === "join" ? "bg-white text-ink shadow-sm" : "text-ink-faint"}`}
        >
          Join with code
        </button>
      </div>

      {error && <div className="mb-4 rounded-2xl bg-ledger-rustSoft px-3 py-2 text-sm text-ledger-rust">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name">
            <input className={inputClass} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </Field>
          <Field label="Last name">
            <input className={inputClass} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </Field>
        </div>
        <Field label="Username">
          <input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </Field>
        <Field label="Email">
          <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`${inputClass} pr-10`}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {mode === "create" ? (
          <Field label="Household name">
            <input
              className={inputClass}
              placeholder="e.g. Bista Family"
              value={form.household_name}
              onChange={(e) => setForm({ ...form, household_name: e.target.value })}
              required={mode === "create"}
            />
          </Field>
        ) : (
          <Field label="Invite code">
            <input
              className={inputClass}
              placeholder="e.g. B4LUZPVY"
              value={form.invite_code}
              onChange={(e) => setForm({ ...form, invite_code: e.target.value.toUpperCase() })}
              required={mode === "join"}
            />
          </Field>
        )}

        <Button type="submit" variant="brass" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : mode === "create" ? "Create household" : "Join household"}
        </Button>
      </form>
    </AuthShell>
  );
}
