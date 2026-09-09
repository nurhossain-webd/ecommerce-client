"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminDialog, AdminPageHeader, AdminToolbar, ConfirmDialog } from "@/components/admin/admin-ui";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateCard } from "@/components/ui/state-card";
import { categoriesApi, getDetailedErrorMessage as getErrorMessage, productsApi } from "@/lib/api";
import type { Category, CategoryStatus, Product } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<CategoryStatus>("ACTIVE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => { try { const [categoryData, productData] = await Promise.all([categoriesApi.list(), productsApi.list()]); setCategories(categoryData); setProducts(productData); } catch (caught) { setError(getErrorMessage(caught)); } finally { setLoading(false); } }, []);
  useEffect(() => {
    let cancelled = false;
    Promise.all([categoriesApi.list(), productsApi.list()]).then(([categoryData, productData]) => { if (!cancelled) { setCategories(categoryData); setProducts(productData); } }).catch((caught) => { if (!cancelled) setError(getErrorMessage(caught)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const counts = useMemo(() => products.reduce<Record<string, number>>((all, product) => ({ ...all, [product.categoryId]: (all[product.categoryId] ?? 0) + 1 }), {}), [products]);
  const filtered = categories.filter((category) => category.name.toLowerCase().includes(search.trim().toLowerCase()));
  const showCreate = () => { setEditing(null); setName(""); setStatus("ACTIVE"); setError(""); setOpen(true); };
  const showEdit = (category: Category) => { setEditing(category); setName(category.name); setStatus(category.status); setError(""); setOpen(true); };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!event.currentTarget.checkValidity() || saving) return event.currentTarget.reportValidity(); setSaving(true); setError(""); setMessage(""); try { if (editing) await categoriesApi.update(editing.id, { name: name.trim(), status }); else await categoriesApi.create({ name: name.trim(), status }); setMessage(editing ? "Category updated." : "Category created."); setOpen(false); await load(); } catch (caught) { setError(getErrorMessage(caught)); } finally { setSaving(false); } };
  const remove = async () => { if (!deleting) return; setSaving(true); setError(""); try { await categoriesApi.remove(deleting.id); setCategories((items) => items.filter((item) => item.id !== deleting.id)); setMessage("Category soft deleted."); setDeleting(null); } catch (caught) { setError(getErrorMessage(caught)); } finally { setSaving(false); } };
  return <><AdminPageHeader title="Categories" description="Organize the catalog and manage category availability." action={<Button onClick={showCreate}>Add category</Button>} />{error && !open && <Alert className="mb-5">{error}</Alert>}{message && <Alert variant="success" className="mb-5">{message}</Alert>}<AdminToolbar><Input type="search" placeholder="Search categories" aria-label="Search categories" value={search} onChange={(event) => setSearch(event.target.value)} className="sm:max-w-md" />{search && <Button variant="ghost" onClick={() => setSearch("")}>Clear</Button>}</AdminToolbar><p className="mb-3 text-xs text-muted">{filtered.length} categories</p>{loading ? <StateCard loading>Loading categories...</StateCard> : filtered.length === 0 ? <StateCard>No categories match your search.</StateCard> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Products</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((category) => <tr key={category.id}><td className="font-semibold text-ink">{category.name}</td><td>{counts[category.id] ?? 0}</td><td><Badge tone={category.status === "ACTIVE" ? "success" : "neutral"}>{category.status}</Badge></td><td><div className="flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => showEdit(category)}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleting(category)}>Delete</Button></div></td></tr>)}</tbody></table></div>}<AdminDialog open={open} title={editing ? "Edit category" : "Create category"} onClose={() => { if (!saving) setOpen(false); }}><form onSubmit={submit} className="grid gap-4"><div className="field"><label htmlFor="category-name">Name</label><Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required /></div><div className="field"><label htmlFor="category-status">Status</label><select id="category-status" className="input" value={status} onChange={(event) => setStatus(event.target.value as CategoryStatus)}><option>ACTIVE</option><option>INACTIVE</option></select></div>{error && <Alert>{error}</Alert>}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Create category"}</Button></div></form></AdminDialog><ConfirmDialog open={Boolean(deleting)} title="Delete category?" busy={saving} onCancel={() => setDeleting(null)} onConfirm={remove}>This will soft delete <strong className="text-ink">{deleting?.name}</strong>. The backend may reject deletion when database relationships prevent it.</ConfirmDialog></>;
}
