"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { clearAuth, getRole, getToken, getUserName } from "../../lib/auth";

const emptyForm = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: ""
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [direction, setDirection] = useState("asc");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const role = getRole();
  const userName = getUserName();

  const fetchTasks = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: targetPage,
        size,
        sortBy,
        direction
      };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const { data } = await api.get("/api/tasks", { params });
      setTasks(data.content || []);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    fetchTasks(0);
  }, [router, statusFilter, priorityFilter, sortBy, direction]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/api/tasks/${editingId}`, form);
      } else {
        await api.post("/api/tasks", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchTasks(0);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
    });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      fetchTasks(page);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete task");
    }
  };

  const onComplete = async (id) => {
    try {
      await api.patch(`/api/tasks/${id}/complete`);
      fetchTasks(page);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to complete task");
    }
  };

  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0 }}>Task Management</h2>
          <small className="muted">
            Signed in as {userName || "User"} ({role || "USER"})
          </small>
        </div>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={onSave}>
        <h3>{editingId ? "Update Task" : "Create Task"}</h3>
        <div className="row">
          <div className="field">
            <label>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Due Date</label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="field" style={{ marginTop: 10 }}>
          <label>Description</label>
          <textarea
            rows={3}
            required
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <div className="field">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 12 }}>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <hr style={{ margin: "18px 0" }} />

      <h3>Task List</h3>
      <div className="row">
        <div className="field">
          <label>Status Filter</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">ALL</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>
        <div className="field">
          <label>Priority Filter</label>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">ALL</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
        <div className="field">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">dueDate</option>
            <option value="priority">priority</option>
          </select>
        </div>
        <div className="field">
          <label>Direction</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6}>No tasks found</td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.status}</td>
                  <td>{task.priority}</td>
                  <td>{task.dueDate}</td>
                  <td>
                    <div className="actions">
                      <button type="button" onClick={() => onEdit(task)}>Edit</button>
                      <button type="button" onClick={() => onComplete(task.id)} disabled={task.status === "DONE"}>
                        Complete
                      </button>
                      <button type="button" onClick={() => onDelete(task.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="actions" style={{ marginTop: 12 }}>
        <button type="button" onClick={() => fetchTasks(Math.max(page - 1, 0))} disabled={page <= 0}>
          Previous
        </button>
        <span className="muted">Page {page + 1} / {Math.max(totalPages, 1)}</span>
        <button
          type="button"
          onClick={() => fetchTasks(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          Next
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
