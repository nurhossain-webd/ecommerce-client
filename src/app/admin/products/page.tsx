"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminDialog, AdminPageHeader, AdminToolbar, ConfirmDialog } from "@/components/admin/admin-ui";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateCard } from "@/components/ui/state-card";
import { categoriesApi, getDetailedErrorMessage as getErrorMessage, productsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils/currency";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils/stock";
import type { Category, Product, ProductStatus } from "@/lib/types";

type Form = { name: string; description: string; price: string; stock: string; categoryId: string; status: ProductStatus };
const blank: Form = { name: "", description: "", price: "", stock: "0", categoryId: "", status: "ACTIVE" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  const load = useCallback(async () => {
    try {
      const [productData, categoryData] = await Promise.all([productsApi.list(), categoriesApi.list()]);
      setProducts(productData); setCategories(categoryData);
    } catch (caught) { setError(getErrorMessage(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let cancelled = false;
    Promise.all([productsApi.list(), categoriesApi.list()]).then(([productData, categoryData]) => { if (!cancelled) { setProducts(productData); setCategories(categoryData); } }).catch((caught) => { if (!cancelled) setError(getErrorMessage(caught)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => products.filter((product) => {
    const query = search.trim().toLowerCase();
    return (!query || `${product.name} ${product.description ?? ""}`.toLowerCase().includes(query)) && (categoryFilter === "ALL" || product.categoryId === categoryFilter) && (statusFilter === "ALL" || product.status === statusFilter) && (stockFilter === "ALL" || (stockFilter === "LOW" ? product.stock <= LOW_STOCK_THRESHOLD : product.stock > LOW_STOCK_THRESHOLD));
  }), [categoryFilter, products, search, statusFilter, stockFilter]);

  const openCreate = () => { setEditing(null); setForm({ ...blank, categoryId: categories[0]?.id ?? "" }); setError(""); setDialogOpen(true); };
  const openEdit = (product: Product) => { setEditing(product); setForm({ name: product.name, description: product.description ?? "", price: String(product.price), stock: String(product.stock), categoryId: product.categoryId, status: product.status }); setError(""); setDialogOpen(true); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!event.currentTarget.checkValidity() || saving) return event.currentTarget.reportValidity();
    setSaving(true); setError(""); setMessage("");
    const body = { name: form.name.trim(), description: form.description.trim() || undefined, price: Number(form.price), stock: Number(form.stock), categoryId: form.categoryId, status: form.status };
    try { if (editing) await productsApi.update(editing.id, body); else await productsApi.create(body); setMessage(editing ? "Product updated." : "Product created."); setDialogOpen(false); await load(); }
    catch (caught) { setError(getErrorMessage(caught)); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleting) return; setSaving(true); setError(""); setMessage("");
    try { await productsApi.remove(deleting.id); setProducts((items) => items.filter((item) => item.id !== deleting.id)); setMessage("Product soft deleted."); setDeleting(null); }
    catch (caught) { setError(getErrorMessage(caught)); }
    finally { setSaving(false); }
  };
  const setField = (key: keyof Form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return <><AdminPageHeader title="Products" description="Create, search, edit, and soft delete the products available through the catalog API." action={<Button onClick={openCreate} disabled={!categories.length}>Add product</Button>} />{error && !dialogOpen && <Alert className="mb-5">{error}</Alert>}{message && <Alert variant="success" className="mb-5">{message}</Alert>}<AdminToolbar><Input type="search" placeholder="Search name or description" value={search} onChange={(event) => setSearch(event.target.value)} className="sm:flex-1" aria-label="Search products" /><select className="input sm:max-w-48" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category"><option value="ALL">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><select className="input sm:max-w-44" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="ALL">All statuses</option><option>ACTIVE</option><option>OUT_OF_STOCK</option><option>INACTIVE</option></select><select className="input sm:max-w-40" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} aria-label="Filter by stock"><option value="ALL">All stock</option><option value="LOW">Low stock</option><option value="HEALTHY">Above threshold</option></select>{(search || categoryFilter !== "ALL" || statusFilter !== "ALL" || stockFilter !== "ALL") && <Button variant="ghost" onClick={() => { setSearch(""); setCategoryFilter("ALL"); setStatusFilter("ALL"); setStockFilter("ALL"); }}>Clear</Button>}</AdminToolbar><p className="mb-3 text-xs text-muted">{filtered.length} of {products.length} products</p>{loading ? <StateCard loading>Loading products...</StateCard> : filtered.length === 0 ? <StateCard>No products match these filters.</StateCard> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><strong className="text-ink">{product.name}</strong><span className="mt-1 block max-w-xs truncate text-xs text-muted">{product.description || "No description"}</span></td><td>{product.category.name}</td><td className="font-medium">{formatCurrency(product.price)}</td><td><span className={product.stock <= LOW_STOCK_THRESHOLD ? "font-semibold text-amber-700" : ""}>{product.stock}</span></td><td><Badge tone={product.status === "ACTIVE" ? "success" : product.status === "OUT_OF_STOCK" ? "warning" : "neutral"}>{product.status.replaceAll("_", " ")}</Badge></td><td><div className="flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => openEdit(product)}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleting(product)}>Delete</Button></div></td></tr>)}</tbody></table></div>}
    <AdminDialog open={dialogOpen} title={editing ? "Edit product" : "Create product"} description="Fields use the same validation limits as the product API." onClose={() => { if (!saving) setDialogOpen(false); }}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><div className="field sm:col-span-2"><label htmlFor="product-name">Name</label><Input id="product-name" value={form.name} maxLength={200} required onChange={(e) => setField("name", e.target.value)} /></div><div className="field sm:col-span-2"><label htmlFor="product-description">Description</label><textarea id="product-description" className="input min-h-24 resize-y" value={form.description} maxLength={2000} onChange={(e) => setField("description", e.target.value)} /></div><div className="field"><label htmlFor="product-price">Price</label><Input id="product-price" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setField("price", e.target.value)} /></div><div className="field"><label htmlFor="product-stock">Stock</label><Input id="product-stock" type="number" min="0" step="1" required value={form.stock} onChange={(e) => setField("stock", e.target.value)} /></div><div className="field"><label htmlFor="product-category">Category</label><select id="product-category" className="input" required value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><div className="field"><label htmlFor="product-status">Status</label><select id="product-status" className="input" value={form.status} onChange={(e) => setField("status", e.target.value)}><option>ACTIVE</option><option>OUT_OF_STOCK</option><option>INACTIVE</option></select></div>{error && <Alert className="sm:col-span-2">{error}</Alert>}<div className="flex justify-end gap-3 sm:col-span-2"><Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Create product"}</Button></div></form></AdminDialog>
    <ConfirmDialog open={Boolean(deleting)} title="Delete product?" busy={saving} onCancel={() => setDeleting(null)} onConfirm={remove}>This will soft delete <strong className="text-ink">{deleting?.name}</strong> and remove it from active catalog results.</ConfirmDialog>
  </>;
}
