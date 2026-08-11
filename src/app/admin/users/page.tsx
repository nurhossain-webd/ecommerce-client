"use client";
import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { User } from "@/lib/types";

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest<User[]>("/api/users", { auth: true }).then(setUsers).catch((caught) => setError(getErrorMessage(caught))).finally(() => setLoading(false)); }, []);
  return <><div className="page-heading"><h1>Users</h1><p>Active Users returned by the ADMIN-only endpoint.</p></div>
    {loading ? <div className="state-card">Loading users...</div> : error ? <div className="alert-error">{error}</div> : users.length === 0 ? <div className="state-card">No active users.</div> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td className="font-semibold">{user.name}</td><td>{user.email}</td><td><span className="badge">{user.role}</span></td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td></tr>)}</tbody></table></div>}
  </>;
}
export default function AdminUsersPage() { return <ProtectedPage role="ADMIN"><UsersContent /></ProtectedPage>; }
