import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { getStoreImage } from "@/lib/store-images";
import { formatCurrency } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BuyProductButton } from "./buy-product-button";
import { ProductStock } from "./product-stock";

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const Heading = featured ? "h3" : "h2";
  return <article className="product-card group">
    <Link href={`/products/${product.id}`} className="product-image block" aria-label={`View ${product.name}`}>
      <Image src={getStoreImage(`${product.name} ${product.category.name}`)} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transform-none" />
    </Link>
    <div className="flex flex-1 flex-col p-3 pt-5 sm:p-4">
      <Badge tone="neutral">{product.category.name}</Badge>
      <Heading className="product-title mt-3"><Link href={`/products/${product.id}`} className="rounded hover:text-brand">{product.name}</Link></Heading>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{product.description || "Discover your next everyday favorite."}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5"><strong className="product-price">{formatCurrency(product.price)}</strong><ProductStock product={product} /></div>
      <div className="mt-5 flex gap-2 border-t border-line pt-4"><ButtonLink variant="secondary" href={`/products/${product.id}`} className="flex-1">Details</ButtonLink><BuyProductButton product={product} /></div>
    </div>
  </article>;
}
