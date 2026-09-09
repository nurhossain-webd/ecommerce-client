"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AdminDialog, AdminPageHeader, AdminToolbar, ConfirmDialog } from "@/components/admin/admin-ui";
import { PasswordField } from "@/components/auth/password-field";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateCard } from "@/components/ui/state-card";
import { useAuth } from "@/context/auth-context";
import { getDetailedErrorMessage as getErrorMessage, usersApi } from "@/lib/api";
import { formatDate } from "@/lib/utils/dates";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => { try { setUsers(await usersApi.list()); } catch (caught) { setError(getErrorMessage(caught)); } finally { setLoading(false); } }, []);
  useEffect(() => {
    let cancelled = false;
    usersApi.list().then((data) => { if (!cancelled) setUsers(data); }).catch((caught) => { if (!cancelled) setError(getErrorMessage(caught)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const filtered = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.trim().toLowerCase()));
  const showCreate = () => { setEditing(null); setName(""); setEmail(""); setPassword(""); setError(""); setOpen(true); };
  const showEdit = (user: User) => { setEditing(user); setName(user.name); setEmail(user.email); setPassword(""); setError(""); setOpen(true); };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!event.currentTarget.checkValidity() || saving) return event.currentTarget.reportValidity(); setSaving(true); setError(""); setMessage(""); try { if (editing) await usersApi.update(editing.id, { name: name.trim(), email: email.trim() }); else await usersApi.create({ name: name.trim(), email: email.trim(), password }); setMessage(editing ? "User updated." : "Customer account created."); setOpen(false); await load(); } catch (caught) { setError(getErrorMessage(caught)); } finally { setSaving(false); } };
  const remove = async () => { if (!deleting) return; setSaving(true); setError(""); try { await usersApi.remove(deleting.id); setUsers((items) => items.filter((item) => item.id !== deleting.id)); setMessage("User soft deleted."); setDeleting(null); } catch (caught) { setError(getErrorMessage(caught)); } finally { setSaving(false); } };
  return <><AdminPageHeader title="Users" description="Create customer accounts and manage the name and email fields supported by the backend." action={<Button onClick={showCreate}>Add user</Button>} />{error && !open && <Alert className="mb-5">{error}</Alert>}{message && <Alert variant="success" className="mb-5">{message}</Alert>}<AdminToolbar><Input type="search" placeholder="Search name or email" aria-label="Search users" value={search} onChange={(event) => setSearch(event.target.value)} className="sm:max-w-md" />{search && <Button variant="ghost" onClick={() => setSearch("")}>Clear</Button>}</AdminToolbar><p className="mb-3 text-xs text-muted">{filtered.length} active users</p>{loading ? <StateCard loading>Loading users...</StateCard> : filtered.length === 0 ? <StateCard>No users match your search.</StateCard> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Created</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><strong className="text-ink">{user.name}</strong>{user.id === currentUser?.id && <span className="ml-2 text-xs text-muted">You</span>}</td><td>{user.email}</td><td><Badge tone={user.role === "ADMIN" ? "brand" : "neutral"}>{user.role}</Badge></td><td>{formatDate(user.createdAt)}</td><td><div className="flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => showEdit(user)}>Edit</Button><Button size="sm" variant="danger" disabled={user.id === currentUser?.id} title={user.id === currentUser?.id ? "You cannot delete your current session" : undefined} onClick={() => setDeleting(user)}>Delete</Button></div></td></tr>)}</tbody></table></div>}<AdminDialog open={open} title={editing ? "Edit user" : "Create customer"} description={editing ? "Role changes are not supported by the backend." : "The user API creates accounts with the USER role."} onClose={() => { if (!saving) setOpen(false); }}><form onSubmit={submit} className="grid gap-4"><div className="field"><label htmlFor="user-name">Name</label><Input id="user-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required /></div><div className="field"><label htmlFor="user-email">Email</label><Input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>{!editing && <div className="field"><label htmlFor="user-password">Temporary password</label><PasswordField id="user-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} required autoComplete="new-password" /></div>}{editing && <div className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">Role: <strong className="text-ink">{editing.role}</strong></div>}{error && <Alert>{error}</Alert>}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Create user"}</Button></div></form></AdminDialog><ConfirmDialog open={Boolean(deleting)} title="Delete user?" busy={saving} onCancel={() => setDeleting(null)} onConfirm={remove}>This will soft delete <strong className="text-ink">{deleting?.name}</strong> and remove the account from active user results.</ConfirmDialog></>;
}
