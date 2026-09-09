"use client";
import { ProductStock } from "@/components/products/product-stock";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { isProductPurchasable } from "@/lib/utils/stock";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { BuyProductButton } from "@/components/products/buy-product-button";
import { useAuth } from "@/context/auth-context";
import { productsApi, reviewsApi, getErrorMessage } from "@/lib/api";
import { getStoreImage } from "@/lib/store-images";
import type { Product, Review } from "@/lib/types";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([productsApi.get(id), reviewsApi.list()])
      .then(([productData, reviewData]) => {
        setProduct(productData);
        setReviews(reviewData.filter((review) => review.productId === id));
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!product || user?.role !== "USER") return;
    setReviewSubmitting(true);
    setReviewError("");
    setReviewMessage("");
    try {
      await reviewsApi.create({ productId: product.id, rating, comment: comment.trim() || undefined });
      const reviewData = await reviewsApi.list();
      setReviews(reviewData.filter((review) => review.productId === product.id));
      setRating(5);
      setComment("");
      setReviewMessage("Your review was published.");
    } catch (caught) {
      setReviewError(getErrorMessage(caught));
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <StateCard loading>Loading product details...</StateCard>;
  if (error) return <><Alert>{error}</Alert><Link className="button-secondary mt-4" href="/products">Back to products</Link></>;
  if (!product) return <StateCard>Product not found.</StateCard>;

  const available = isProductPurchasable(product);
  const averageRating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
  return <>
    <Link className="mb-5 inline-block text-sm font-bold text-indigo-700 hover:text-indigo-900" href="/products">&lt;- Back to products</Link>
    <article className="card grid overflow-hidden lg:grid-cols-2">
      <div className="relative min-h-[360px] bg-slate-100 lg:min-h-[560px]"><Image src={getStoreImage(`${product.name} ${product.category?.name ?? ""}`)} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <Link href={`/categories/${product.categoryId}`} className="badge w-fit hover:bg-indigo-200">{product.category?.name ?? "Product"}</Link>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{product.name}</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">{product.description || "No description is available for this product."}</p>
        <div className="my-7 border-y border-slate-200 py-5">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-slate-500">Price</p><p className="mt-1 text-3xl font-black text-indigo-700">{formatCurrency(product.price)}</p></div><div className="text-right"><p className={available ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>{product.status}</p><p className="mt-1"><ProductStock product={product} /></p></div></div>
        </div>
        <div className="flex flex-wrap gap-3"><BuyProductButton product={product} /><Link className="button-secondary" href="/products">Continue shopping</Link></div>
        <p className="mt-5 text-xs leading-5 text-slate-500">Price and availability are verified by the server when you confirm your order.</p>
      </div>
    </article>
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black text-slate-900">Customer reviews</h2><p className="mt-1 text-slate-500">Feedback from customers about this product.</p></div>{reviews.length > 0 && <div className="rounded-xl bg-amber-50 px-4 py-2 text-amber-800"><strong className="text-xl">{averageRating.toFixed(1)} / 5</strong><span className="ml-2 text-sm">({reviews.length} reviews)</span></div>}</div>
      {user?.role === "USER" ? <form className="card mb-5 p-5" onSubmit={submitReview}>
        <h3 className="text-lg font-black text-slate-900">Write a review</h3>
        <p className="mt-1 text-sm text-slate-500">Share your experience with this product.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="field"><label htmlFor="review-rating">Rating</label><select id="review-rating" className="input" value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></div>
          <div className="field"><label htmlFor="review-comment">Comment</label><textarea id="review-comment" className="input min-h-24 resize-y" maxLength={1000} placeholder="What did you like or dislike?" value={comment} onChange={(event) => setComment(event.target.value)} /></div>
        </div>
        {reviewError && <Alert className="mt-4">{reviewError}</Alert>}
        {reviewMessage && <Alert variant="success" className="mt-4">{reviewMessage}</Alert>}
        <button className="button-primary mt-4" disabled={reviewSubmitting}>{reviewSubmitting ? "Publishing..." : "Publish review"}</button>
      </form> : !user ? <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-5"><div><h3 className="font-bold text-slate-900">Purchased this product?</h3><p className="text-sm text-slate-500">Log in to share your review.</p></div><Link className="button-primary" href="/login">Login to review</Link></div> : null}
      {reviews.length === 0 ? <StateCard>This product has no reviews yet.</StateCard> : <div className="grid gap-4 md:grid-cols-2">{reviews.map((review) => <article key={review.id} className="card p-5"><div className="flex items-center justify-between gap-3"><strong className="text-slate-900">{review.user?.name ?? "Customer"}</strong><span className="font-black text-amber-500">{"*".repeat(review.rating)}<span className="text-slate-300">{"*".repeat(5 - review.rating)}</span></span></div><p className="mt-3 leading-6 text-slate-600">{review.comment || "No written comment."}</p><p className="mt-3 text-xs text-slate-400">{formatDate(review.createdAt)}</p></article>)}</div>}
    </section>
  </>;
}
