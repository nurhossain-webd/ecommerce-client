"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Category, Product, ProductStatus } from "@/lib/types";

type ProductForm = { name: string; description: string; price: string; stock: string; categoryId: string; status: ProductStatus };
const initialForm: ProductForm = { name: "", description: "", price: "", stock: "0", categoryId: "", status: "ACTIVE" };

function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [productData, categoryData] = await Promise.all([apiRequest<Product[]>("/api/products"), apiRequest<Category[]>("/api/categories")]);
      setProducts(productData); setCategories(categoryData);
      setForm((current) => ({ ...current, categoryId: current.categoryId || categoryData[0]?.id || "" }));
    } catch (caught) { setError(getErrorMessage(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    Promise.all([apiRequest<Product[]>("/api/products"), apiRequest<Category[]>("/api/categories")])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
        setForm((current) => ({ ...current, categoryId: current.categoryId || categoryData[0]?.id || "" }));
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    const body = { name: form.name, description: form.description || undefined, price: Number(form.price), stock: Number(form.stock), categoryId: form.categoryId, status: form.status };
    try {
      if (editingId) {
        await apiRequest(`/api/products/${editingId}`, { method: "PATCH", auth: true, body });
        setMessage("Product updated.");
      } else {
        await apiRequest("/api/products", { method: "POST", auth: true, body });
        setMessage("Product created.");
      }
      setEditingId(null); setForm({ ...initialForm, categoryId: categories[0]?.id || "" }); await load();
    } catch (caught) { setError(getErrorMessage(caught)); }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({ name: product.name, description: product.description || "", price: String(product.price), stock: String(product.stock), categoryId: product.categoryId, status: product.status });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try { await apiRequest(`/api/products/${product.id}`, { method: "DELETE", auth: true }); setProducts((current) => current.filter((item) => item.id !== product.id)); setMessage("Product deleted."); }
    catch (caught) { setError(getErrorMessage(caught)); }
  };
  const setField = (field: keyof ProductForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  return <><div className="page-heading"><h1>Manage Products</h1><p>Create, edit, and soft delete Products through ADMIN APIs.</p></div>
    <form onSubmit={submit} className="card mb-6 grid gap-4 p-5 md:grid-cols-2">
      <div className="field"><label>Name</label><input className="input" value={form.name} onChange={(event) => setField("name", event.target.value)} required /></div>
      <div className="field"><label>Category</label><select className="input" value={form.categoryId} onChange={(event) => setField("categoryId", event.target.value)} required><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
      <div className="field"><label>Price</label><input className="input" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setField("price", event.target.value)} required /></div>
      <div className="field"><label>Stock</label><input className="input" type="number" min="0" step="1" value={form.stock} onChange={(event) => setField("stock", event.target.value)} required /></div>
      <div className="field"><label>Status</label><select className="input" value={form.status} onChange={(event) => setField("status", event.target.value)}><option>ACTIVE</option><option>OUT_OF_STOCK</option><option>INACTIVE</option></select></div>
      <div className="field"><label>Description</label><input className="input" value={form.description} onChange={(event) => setField("description", event.target.value)} /></div>
      <div className="flex gap-2 md:col-span-2"><button className="button-primary">{editingId ? "Save changes" : "Create product"}</button>{editingId && <button type="button" className="button-secondary" onClick={() => { setEditingId(null); setForm({ ...initialForm, categoryId: categories[0]?.id || "" }); }}>Cancel</button>}</div>
    </form>
    {error && <div className="alert-error mb-4">{error}</div>}{message && <div className="alert-success mb-4">{message}</div>}
    {loading ? <div className="state-card">Loading products...</div> : products.length === 0 ? <div className="state-card">No products found.</div> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><div className="text-sm text-slate-500">{product.category?.name}</div></td><td>${product.price.toFixed(2)}</td><td>{product.stock}</td><td><span className="badge">{product.status}</span></td><td><div className="flex gap-2"><button className="button-secondary" onClick={() => startEdit(product)}>Edit</button><button className="button-danger" onClick={() => remove(product)}>Delete</button></div></td></tr>)}</tbody></table></div>}
  </>;
}
export default function AdminProductsPage() { return <ProtectedPage role="ADMIN"><ProductsManager /></ProtectedPage>; }
