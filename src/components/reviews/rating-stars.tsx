export function RatingStars({ rating, label = `${rating} out of 5 stars` }: { rating: number; label?: string }) {
  const rounded = Math.round(rating);
  return <span aria-label={label} className="inline-flex gap-0.5 text-amber-500">{[1, 2, 3, 4, 5].map((star) => <span key={star} aria-hidden="true" className={star <= rounded ? "" : "text-slate-300"}>★</span>)}</span>;
}
