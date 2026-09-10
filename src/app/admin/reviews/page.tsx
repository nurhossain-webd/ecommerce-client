"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminDialog, AdminPageHeader, AdminToolbar, ConfirmDialog } from "@/components/admin/admin-ui";
import { ChartCard, DonutChart } from "@/components/admin/charts";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateCard } from "@/components/ui/state-card";
import { getDetailedErrorMessage as getErrorMessage, reviewsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils/dates";
import type { Review } from "@/lib/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<Review | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try { setReviews(await reviewsApi.list()); }
    catch (caught) { setError(getErrorMessage(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let cancelled = false;
    reviewsApi.list().then((data) => { if (!cancelled) setReviews(data); }).catch((caught) => { if (!cancelled) setError(getErrorMessage(caught)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => reviews.filter((review) => `${review.user.name} ${review.product.name} ${review.comment ?? ""}`.toLowerCase().includes(search.trim().toLowerCase())), [reviews, search]);
  const sentiment = [
    { label: "Positive (4–5)", value: reviews.filter((review) => review.rating >= 4).length, color: "#16a34a" },
    { label: "Neutral (3)", value: reviews.filter((review) => review.rating === 3).length, color: "#f59e0b" },
    { label: "Negative (1–2)", value: reviews.filter((review) => review.rating <= 2).length, color: "#e11d48" },
  ];
  const showEdit = (review: Review) => { setEditing(review); setRating(String(review.rating)); setComment(review.comment ?? ""); setError(""); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || !event.currentTarget.checkValidity() || saving) return event.currentTarget.reportValidity();
    setSaving(true); setError(""); setMessage("");
    try { await reviewsApi.update(editing.id, { rating: Number(rating), comment: comment.trim() }); setMessage("Review updated."); setEditing(null); await load(); }
    catch (caught) { setError(getErrorMessage(caught)); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleting) return;
    setSaving(true); setError("");
    try { await reviewsApi.remove(deleting.id); setReviews((items) => items.filter((item) => item.id !== deleting.id)); setMessage("Review soft deleted."); setDeleting(null); }
    catch (caught) { setError(getErrorMessage(caught)); }
    finally { setSaving(false); }
  };

  return <>
    <AdminPageHeader title="Reviews" description="Moderate customer ratings and comments using the existing review permissions." />
    {error && !editing && <Alert className="mb-5">{error}</Alert>}
    {message && <Alert variant="success" className="mb-5">{message}</Alert>}
    {!loading && <div className="mb-6 max-w-2xl"><ChartCard title="Review sentiment" description="Ratings grouped from legitimate customer review data."><DonutChart centerLabel="Reviews" data={sentiment} /></ChartCard></div>}
    <AdminToolbar><Input type="search" placeholder="Search customer, product, or comment" aria-label="Search reviews" value={search} onChange={(event) => setSearch(event.target.value)} className="sm:max-w-lg" />{search && <Button variant="ghost" onClick={() => setSearch("")}>Clear</Button>}</AdminToolbar>
    <p className="mb-3 text-xs text-muted">{filtered.length} reviews</p>
    {loading ? <StateCard loading>Loading reviews...</StateCard> : filtered.length === 0 ? <StateCard>No reviews match your search.</StateCard> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((review) => <tr key={review.id}><td className="font-medium text-ink">{review.product.name}</td><td>{review.user.name}</td><td><span className="whitespace-nowrap font-semibold text-amber-600" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}<span className="text-slate-200">{"★".repeat(5 - review.rating)}</span></span></td><td><span className="block max-w-xs text-sm text-muted">{review.comment || "No comment"}</span></td><td className="whitespace-nowrap">{formatDate(review.createdAt)}</td><td><div className="flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => showEdit(review)}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleting(review)}>Delete</Button></div></td></tr>)}</tbody></table></div>}
    <AdminDialog open={Boolean(editing)} title="Moderate review" description={editing ? `${editing.user.name} on ${editing.product.name}` : undefined} onClose={() => { if (!saving) setEditing(null); }}><form onSubmit={submit} className="grid gap-4"><div className="field"><label htmlFor="review-rating">Rating</label><select id="review-rating" className="input" value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}</select></div><div className="field"><label htmlFor="review-comment">Comment</label><textarea id="review-comment" className="input min-h-32 resize-y" maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} /></div>{error && <Alert>{error}</Alert>}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save review"}</Button></div></form></AdminDialog>
    <ConfirmDialog open={Boolean(deleting)} title="Delete review?" busy={saving} onCancel={() => setDeleting(null)} onConfirm={remove}>This will soft delete the review by <strong className="text-ink">{deleting?.user.name}</strong> from public results.</ConfirmDialog>
  </>;
}
