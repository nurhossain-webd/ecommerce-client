"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { onSearch?: () => void };

export function SearchField(props: Props) {
  return <Suspense fallback={<Skeleton className="h-12 w-full" />}><SearchFromUrl {...props} /></Suspense>;
}

function SearchFromUrl(props: Props) {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  return <SearchForm key={query} initialQuery={query} {...props} />;
}

function SearchForm({ initialQuery, onSearch }: Props & { initialQuery: string }) {
  const id = useId();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    onSearch?.();
    router.push(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
  };

  return <form role="search" onSubmit={search} className="group flex h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface/70 pl-4 pr-1.5 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
    <Icon name="search" className="size-[19px] shrink-0 text-muted" />
    <label htmlFor={id} className="sr-only">Search products</label>
    <input id={id} name="q" type="search" autoComplete="off" enterKeyHint="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your next favorite find" className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted focus-visible:outline-none" />
    <button type="submit" aria-label="Submit product search" className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand shadow-sm hover:bg-brand hover:text-white"><Icon name="arrow" className="size-[18px]" /></button>
  </form>;
}
