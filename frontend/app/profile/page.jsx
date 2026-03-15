"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { getToken, updateAuthProfile } from "../../lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "" });
  const [role, setRole] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/users/me");
        setForm({ name: data.name || "", email: data.email || "" });
        setRole(data.role || "");
        setCreatedAt(data.createdAt || "");
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {};
      if (form.name?.trim()) payload.name = form.name.trim();
      if (form.email?.trim()) payload.email = form.email.trim();

      if (Object.keys(payload).length === 0) {
        setError("Provide at least one field to update");
        setSaving(false);
        return;
      }

      const { data } = await api.put("/api/users/me", payload);
      setForm({ name: data.name || "", email: data.email || "" });
      setRole(data.role || "");
      setCreatedAt(data.createdAt || "");
      updateAuthProfile(data);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container profile-card">
      <h2 style={{ marginTop: 0 }}>User Details</h2>
      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <form onSubmit={onSave}>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="profile-meta">
            <div><strong>Role:</strong> {role || "USER"}</div>
            <div><strong>Created:</strong> {createdAt ? new Date(createdAt).toLocaleString() : "-"}</div>
          </div>

          <button className="auth-btn" type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update Profile"}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      )}
    </div>
  );
}
