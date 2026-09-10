"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { productsApi, reviewsApi, ordersApi, getDetailedErrorMessage as getErrorMessage } from "@/lib/api";
import { getStoreImage } from "@/lib/store-images";
import { formatCurrency } from "@/lib/utils/currency";
import { isProductPurchasable } from "@/lib/utils/stock";
import type { Product, Review } from "@/lib/types";
import { ProductStock } from "@/components/products/product-stock";
import { ReviewCard } from "@/components/reviews/review-card";
import { RatingStars } from "@/components/reviews/rating-stars";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addProduct } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [buying, setBuying] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    const data = await reviewsApi.list();
    setReviews(data.filter((review) => review.productId === id));
  }, [id]);

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
    setReviewSubmitting(true); setReviewError(""); setNotice("");
    try {
      await reviewsApi.create({ productId: product.id, rating, comment: comment.trim() || undefined });
      await loadReviews();
      setRating(5); setComment(""); setNotice("Your review was published.");
    } catch (caught) { setReviewError(getErrorMessage(caught)); }
    finally { setReviewSubmitting(false); }
  };

  const buyNow = async () => {
    if (!product) return;
    setError(""); setNotice("");
    if (!user) { router.push("/login"); return; }
    if (user.role !== "USER") { setError("Purchasing is available to customer accounts."); return; }
    setBuying(true);
    try {
      await ordersApi.create({ items: [{ productId: product.id, quantity }] });
      router.push("/orders");
    } catch (caught) { setError(getErrorMessage(caught)); }
    finally { setBuying(false); }
  };

  if (loading) return <div className="grid gap-8 lg:grid-cols-2" role="status" aria-label="Loading product"><Skeleton className="aspect-square" /><div className="space-y-5 py-6"><Skeleton className="h-5 w-24" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-5 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-12 w-56" /></div></div>;
  if (error && !product) return <><Alert>{error}</Alert><ButtonLink variant="secondary" className="mt-4" href="/products">Back to products</ButtonLink></>;
  if (!product) return <EmptyState title="Product not found">This product is no longer available in the catalog.</EmptyState>;

  const available = isProductPurchasable(product);
  const averageRating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
  const validQuantity = available && Number.isInteger(quantity) && quantity >= 1 && quantity <= product.stock;

  return <>
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted"><Link href="/" className="hover:text-brand">Home</Link><span>/</span><Link href="/products" className="hover:text-brand">Products</Link><span>/</span><span aria-current="page" className="max-w-52 truncate text-ink">{product.name}</span></nav>
    {error && <Alert className="mb-6">{error}</Alert>}
    {notice && <Alert variant="success" className="mb-6">{notice}</Alert>}

    <article className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,.92fr)] lg:gap-12">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface"><Image src={getStoreImage(`${product.name} ${product.category.name}`)} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>
      <div className="flex flex-col justify-center py-2 lg:py-8">
        <Badge tone="neutral">{product.category.name}</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">{product.name}</h1>
        {reviews.length > 0 && <div className="mt-4 flex items-center gap-2 text-sm text-muted"><RatingStars rating={averageRating} /><strong className="font-semibold text-ink">{averageRating.toFixed(1)}</strong><a href="#reviews" className="hover:text-brand">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</a></div>}
        <p className="mt-6 text-base leading-8 text-muted">{product.description || "No description is available for this product."}</p>
        <div className="my-7 flex flex-wrap items-center justify-between gap-4 border-y border-line py-5"><p className="text-3xl font-semibold tracking-tight text-ink">{formatCurrency(product.price)}</p><ProductStock product={product} /></div>
        {user?.role === "ADMIN" ? <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">You are viewing this product as an administrator. Purchasing tools are available to customer accounts.</div> : <><div className="field max-w-32"><label htmlFor="product-quantity">Quantity</label><Input id="product-quantity" type="number" min="1" max={product.stock} disabled={!available} value={quantity} onChange={(event) => setQuantity(Math.min(product.stock, Math.max(1, Math.floor(Number(event.target.value)) || 1)))} /></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button variant="secondary" disabled={!validQuantity} onClick={() => { addProduct(product, quantity); setNotice("Your cart was updated."); }}><Icon name="cart" className="size-4" />Add to cart</Button><Button disabled={!validQuantity || buying} onClick={buyNow}>{buying ? "Placing order..." : "Buy now"}</Button></div><p className="mt-4 text-xs leading-5 text-muted">Displayed prices are estimates. Current price and stock are verified by the server when an order is placed.</p></>}
      </div>
    </article>

    <section id="reviews" className="mt-16 scroll-mt-40 sm:mt-20">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2">Real customer feedback</p><h2 className="text-3xl font-semibold tracking-tight text-ink">Customer reviews</h2></div><div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3"><RatingStars rating={averageRating} /><div><strong className="text-lg text-ink">{reviews.length ? averageRating.toFixed(1) : "—"}</strong><p className="text-[11px] text-muted">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p></div></div></div>

      {user?.role === "USER" ? <form className="card mb-6 p-5 sm:p-6" onSubmit={submitReview}><h3 className="text-lg font-semibold text-ink">Write a review</h3><p className="mt-1 text-sm text-muted">Share your experience with this product.</p><div className="mt-5 grid gap-4 sm:grid-cols-[150px_1fr]"><label className="field"><span>Rating</span><select className="input" value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className="field"><span>Comment</span><textarea className="input min-h-28 resize-y" maxLength={1000} value={comment} placeholder="What would you like other customers to know?" onChange={(event) => setComment(event.target.value)} /></label></div>{reviewError && <Alert className="mt-4">{reviewError}</Alert>}<Button type="submit" className="mt-5" disabled={reviewSubmitting}>{reviewSubmitting ? "Publishing..." : "Publish review"}</Button></form> : !user ? <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 p-5"><div><h3 className="font-semibold text-ink">Want to share your experience?</h3><p className="mt-1 text-sm text-muted">Log in with a customer account to write a review.</p></div><ButtonLink href="/login">Log in to review</ButtonLink></div> : <p className="mb-6 text-sm text-muted">Administrators can moderate existing reviews below.</p>}

      {reviews.length === 0 ? <EmptyState icon="sparkles" title="No reviews yet">Be the first customer to share an experience with this product.</EmptyState> : <div className="grid gap-4 md:grid-cols-2">{reviews.map((review) => <ReviewCard key={review.id} review={review} canManage={user?.role === "ADMIN" || user?.id === review.userId} onChanged={loadReviews} />)}</div>}
    </section>
  </>;
}
