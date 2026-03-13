"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { getRole, getToken } from "../../lib/auth";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/users");
      setUsers((data || []).map((item) => ({ ...item, draftName: item.name, draftEmail: item.email, draftRole: item.role })));
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    if (getRole() !== "ADMIN") {
      router.replace("/tasks");
      return;
    }
    fetchUsers();
  }, [router]);

  const onFieldChange = (id, field, value) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, [field]: value } : user)));
  };

  const onUpdate = async (user) => {
    setSavingId(user.id);
    setError("");
    try {
      const payload = {};
      if (user.draftName?.trim() && user.draftName.trim() !== user.name) payload.name = user.draftName.trim();
      if (user.draftEmail?.trim() && user.draftEmail.trim() !== user.email) payload.email = user.draftEmail.trim();
      if (user.draftRole && user.draftRole !== user.role) payload.role = user.draftRole;

      await api.put(`/api/users/${user.id}`, payload);
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update user");
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this user account?")) return;
    setSavingId(id);
    setError("");
    try {
      await api.delete(`/api/users/${id}`);
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete user");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginTop: 0 }}>User Management</h2>
      <p className="muted">Admins can update user details, assign roles, and delete accounts.</p>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6}>No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <input
                      value={user.draftName || ""}
                      onChange={(e) => onFieldChange(user.id, "draftName", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={user.draftEmail || ""}
                      onChange={(e) => onFieldChange(user.id, "draftEmail", e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={user.draftRole || "USER"}
                      onChange={(e) => onFieldChange(user.id, "draftRole", e.target.value)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</td>
                  <td>
                    <div className="actions">
                      <button type="button" onClick={() => onUpdate(user)} disabled={savingId === user.id}>Update</button>
                      <button type="button" onClick={() => onDelete(user.id)} disabled={savingId === user.id}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
