"use client";

import { useState, type FormEvent } from "react";
import type { Review } from "@/lib/types";
import { reviewsApi, getDetailedErrorMessage as getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { RatingStars } from "./rating-stars";
import { ConfirmDialog } from "@/components/ui/dialog";

export function ReviewCard({ review, canManage, onChanged }: { review: Review; canManage: boolean; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const update = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await reviewsApi.update(review.id, { rating, comment: comment.trim() });
      await onChanged();
      setEditing(false);
    } catch (caught) { setError(getErrorMessage(caught)); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true); setError("");
    try { await reviewsApi.remove(review.id); setConfirmingDelete(false); await onChanged(); }
    catch (caught) { setError(getErrorMessage(caught)); setBusy(false); }
  };

  return <article className="card p-5 sm:p-6">
    {editing ? <form onSubmit={update}>
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <label className="field"><span>Rating</span><select className="input" value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label>
        <label className="field"><span>Comment</span><textarea className="input min-h-24 resize-y" maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} /></label>
      </div>
      {error && <Alert className="mt-4">{error}</Alert>}
      <div className="mt-4 flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save review"}</Button><Button variant="secondary" disabled={busy} onClick={() => { setEditing(false); setRating(review.rating); setComment(review.comment ?? ""); setError(""); }}>Cancel</Button></div>
    </form> : <>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-ink">{review.user.name}</p><p className="mt-1 text-xs text-muted">{formatDate(review.createdAt)}</p></div><RatingStars rating={review.rating} /></div>
      <p className="mt-4 text-sm leading-7 text-muted">{review.comment || "No written comment."}</p>
      {error && <Alert className="mt-4">{error}</Alert>}
      {canManage && <div className="mt-5 flex gap-2 border-t border-line pt-4"><Button variant="ghost" size="sm" disabled={busy} onClick={() => setEditing(true)}>Edit</Button><Button variant="danger" size="sm" disabled={busy} onClick={() => setConfirmingDelete(true)}>Delete</Button></div>}
    </>}
    <ConfirmDialog open={confirmingDelete} title="Delete review?" busy={busy} onCancel={() => setConfirmingDelete(false)} onConfirm={remove}>This review will be removed from the product.</ConfirmDialog>
  </article>;
}
