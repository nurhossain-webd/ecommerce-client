"use client";
import { formatDate } from "@/lib/utils/dates";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";
import { useEffect, useState } from "react";
import { usersApi, getErrorMessage } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { usersApi.list().then(setUsers).catch((caught) => setError(getErrorMessage(caught))).finally(() => setLoading(false)); }, []);
  return <><div className="page-heading"><h1>Users</h1><p>Active Users returned by the ADMIN-only endpoint.</p></div>
    {loading ? <StateCard loading>Loading users...</StateCard> : error ? <Alert>{error}</Alert> : users.length === 0 ? <StateCard>No active users.</StateCard> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td className="font-semibold">{user.name}</td><td>{user.email}</td><td><span className="badge">{user.role}</span></td><td>{user.createdAt ? formatDate(user.createdAt) : "-"}</td></tr>)}</tbody></table></div>}
  </>;
}
