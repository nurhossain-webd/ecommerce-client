import { Icon } from "@/components/ui/icon";

/** Presentation only until a cart feature is introduced; never links to a missing route. */
export function CartButton() {
  return <span title="Cart coming soon. You can still order with Buy now." className="relative inline-flex">
    <button type="button" disabled className="cart-placeholder" aria-label="Shopping cart, 0 items. Cart coming soon.">
      <Icon name="cart" className="size-[21px]" />
      <span className="quantity-badge" aria-hidden="true">0</span>
    </button>
  </span>;
}
