"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { setAuth } from "../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/register", form);
      setAuth(data);
      router.push("/tasks");
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 12, width: "100%" }}>
          {loading ? "Please wait..." : "Register"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="muted">
        Already have an account? <Link href="/login">Login here</Link>
      </p>
    </div>
  );
}
