import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { getStoreImage } from "@/lib/store-images";
import { Icon } from "@/components/ui/icon";

export function CategoryCard({ category, productCount }: { category: Category; productCount: number }) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="group overflow-hidden rounded-2xl border border-line bg-white p-2.5 shadow-[0_2px_8px_rgb(25_25_40/0.025)] transition hover:-translate-y-0.5 hover:border-[#d5d0ed] hover:shadow-[0_10px_30px_rgb(40_32_75/0.08)]"
    >
      <div className="relative aspect-[5/3] overflow-hidden rounded-xl bg-surface">
        <Image
          src={getStoreImage(category.name)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.04] motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>
      <div className="flex items-center justify-between gap-4 px-2 pb-2 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-ink">{category.name}</h3>
          <p className="mt-1 text-xs text-muted">{productCount} {productCount === 1 ? "product" : "products"}</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
          <Icon name="arrow" className="size-4" />
        </span>
      </div>
    </Link>
  );
}
