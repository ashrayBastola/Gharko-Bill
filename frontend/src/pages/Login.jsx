import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/auth/AuthShell.jsx";
import { Button, Field, inputClass } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Family owner login"
      title="Welcome back to BillNest"
      description="Sign in to your secure family dashboard and keep every bill, document, and reminder in sync."
      helperPoints={[
        "Review unpaid utilities, rent, and school fees at a glance",
        "Upload payment proofs and store important documents securely",
        "Keep every family member aligned with real-time reminders",
      ]}
      footer={
        <>
          Forgot your password? <span className="font-medium text-ink">Contact your household admin</span>
        </>
      }
    >
      <div className="mb-6">
        <h2 className="font-display text-2xl text-ink">Sign in</h2>
        <p className="mt-1 text-sm text-ink-faint">Secure access for your household ledger.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-ledger-rustSoft px-3 py-2 text-sm text-ledger-rust">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Enter your email"
            required
          />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`${inputClass} pr-10`}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
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

        <div className="mb-5 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-soft">
            <input type="checkbox" className="rounded border-paper-line text-brand" />
            <span>Remember me</span>
          </label>
          <Link to="/register" className="font-medium text-brand-dark hover:underline">
            Create household
          </Link>
        </div>

        <Button type="submit" variant="brass" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Continue to dashboard"}
        </Button>
      </form>
    </AuthShell>
  );
}
