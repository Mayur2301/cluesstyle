// PATH: app/admin/admins/page.tsx
"use client";

import { useEffect, useState } from "react";

interface AdminRow {
  id: number;
  name: string;
  email: string;
  role: "admin" | "superadmin";
  created_at: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadAdmins() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok) setAdmins(data.admins ?? []);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Could not create admin.");
        return;
      }
      setSuccess(`${name} was added as ${role}.`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("admin");
      loadAdmins();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-4">Admins</h1>
        {loadingList ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {admins.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-gray-900">{a.name}</div>
                  <div className="text-gray-500">{a.email}</div>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
                  {a.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Add a new admin</h2>
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Temporary password</label>
            <input
              type="password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
            <p className="text-xs text-gray-400 mt-1">At least 10 characters. Share it with them out-of-band.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "superadmin")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            >
              <option value="admin">admin</option>
              <option value="superadmin">superadmin</option>
            </select>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
          >
            {submitting ? "Adding…" : "Add admin"}
          </button>
        </form>
      </div>
    </div>
  );
}