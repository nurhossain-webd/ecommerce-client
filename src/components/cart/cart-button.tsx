"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useCart } from "@/context/cart-context";

export function CartButton() {
  const { itemCount, ready } = useCart();
  return (
    <Link href="/cart" className="cart-placeholder cursor-pointer hover:border-brand hover:text-brand" aria-label={`Shopping cart, ${ready ? itemCount : 0} items`}>
      <Icon name="cart" className="size-[21px]" />
      <span className="quantity-badge" aria-hidden="true">{ready && itemCount > 99 ? "99+" : ready ? itemCount : 0}</span>
    </Link>
  );
}
