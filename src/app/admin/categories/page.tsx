"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Category, CategoryStatus } from "@/lib/types";

function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<CategoryStatus>("ACTIVE");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => apiRequest<Category[]>("/api/categories").then(setCategories).catch((caught) => setError(getErrorMessage(caught))).finally(() => setLoading(false)), []);
  useEffect(() => { load(); }, [load]);
  const create = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    try { await apiRequest("/api/categories", { method: "POST", auth: true, body: { name, status } }); setName(""); setStatus("ACTIVE"); setMessage("Category created."); await load(); }
    catch (caught) { setError(getErrorMessage(caught)); }
  };
  const update = async (category: Category) => {
    const nextName = window.prompt("Category name", category.name); if (!nextName) return;
    const nextStatus = window.prompt("Status: ACTIVE or INACTIVE", category.status) as CategoryStatus | null; if (!nextStatus) return;
    try { await apiRequest(`/api/categories/${category.id}`, { method: "PATCH", auth: true, body: { name: nextName, status: nextStatus } }); setMessage("Category updated."); await load(); }
    catch (caught) { setError(getErrorMessage(caught)); }
  };
  const remove = async (category: Category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    try { await apiRequest(`/api/categories/${category.id}`, { method: "DELETE", auth: true }); setCategories((current) => current.filter((item) => item.id !== category.id)); setMessage("Category deleted."); }
    catch (caught) { setError(getErrorMessage(caught)); }
  };
  return <><div className="page-heading"><h1>Manage Categories</h1><p>Changes are reflected immediately without a browser refresh.</p></div>
    <form onSubmit={create} className="card mb-6 grid gap-4 p-5 sm:grid-cols-[1fr_180px_auto] sm:items-end"><div className="field"><label>Name</label><input className="input" value={name} onChange={(event) => setName(event.target.value)} required /></div><div className="field"><label>Status</label><select className="input" value={status} onChange={(event) => setStatus(event.target.value as CategoryStatus)}><option>ACTIVE</option><option>INACTIVE</option></select></div><button className="button-primary">Create</button></form>
    {error && <div className="alert-error mb-4">{error}</div>}{message && <div className="alert-success mb-4">{message}</div>}
    {loading ? <div className="state-card">Loading...</div> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Status</th><th>Actions</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td className="font-semibold">{category.name}</td><td><span className="badge">{category.status}</span></td><td><div className="flex gap-2"><button onClick={() => update(category)} className="button-secondary">Edit</button><button onClick={() => remove(category)} className="button-danger">Delete</button></div></td></tr>)}</tbody></table></div>}
  </>;
}
export default function AdminCategoriesPage() { return <ProtectedPage role="ADMIN"><CategoriesManager /></ProtectedPage>; }
