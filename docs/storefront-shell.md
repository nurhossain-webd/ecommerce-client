# Shared storefront UI

This step adapts the references' generous spacing, compact navigation, pale surfaces, restrained violet accent and image-led cards to ShopStack. It uses the project's existing photos, routes, APIs and Tailwind 4 setup. It introduces no packages, copied reference assets or backend changes.

## Shell

- Original stacked ShopStack mark, 1240px shared container and consistent mobile gutters.
- Sticky header with Home, Products, Categories, authenticated Orders, ADMIN-only Admin, login/register and a signed-in account disclosure with logout.
- Mobile navigation uses native links, disclosure semantics, outside/focus dismissal, Escape and focus return. A skip link targets the main content. Active links use `aria-current`.
- Search submits to `/products?q=...`, filters the already-loaded catalog by name/description/category, and stays in sync with browser navigation. It adds no search endpoint and preserves product selection and ordering logic.
- The cart icon displays a disabled 0 badge with a “coming soon” label. It has no state, storage, checkout or link to a nonexistent cart route. Existing Buy now/direct ordering remains available.
- Footer includes brand, shop, account and real active category links, with a graceful all-categories fallback if the API is unavailable.

## Reusable design primitives

`src/components/ui` provides `Button`, `ButtonLink`, `Card`, `Input`, `Badge`, `Icon`, `Alert`, `Skeleton`, `CatalogSkeleton`, `EmptyState`, `StateCard` and `SectionHeading`.

Visual tokens and compatibility classes live in `src/app/globals.css`, using Tailwind's theme and component layers. Existing button/card/input/badge/table classes inherit the same visual system, so older routes remain consistent. Use primitive props for variants, and layout utilities for composition:

```tsx
<Button variant="secondary">Continue shopping</Button>
<ButtonLink href="/products">Explore products</ButtonLink>
<Input id="email" type="email" required />
<Badge tone="success">In stock</Badge>
```

Use `type="submit"` for form submission; `Button` defaults to `type="button"`. Keep native labels and validation attributes when composing fields. Interactive elements retain visible keyboard focus and loading skeletons respect reduced-motion preferences.

The home/category product card, stock label and existing account/purchase forms adopt these primitives. The catalog keeps its existing quantity controls. Home section headings and promotional copy were lightly updated to fit the shell. Purchase success copy says “Order placed” without asserting the backend has confirmed fulfillment.

## Main files in this step

- `src/app/globals.css`, `src/app/layout.tsx`, `src/app/loading.tsx`
- `src/components/layout/{brand,header,search-field,account-menu,footer}.tsx`
- `src/components/cart/cart-button.tsx` and `README.md`
- `src/components/ui/{button,card,input,badge,icon,alert,skeleton,empty-state,state-card,section-heading}.tsx`
- `src/hooks/use-disclosure.ts`, `src/lib/utils/cn.ts`
- `src/components/products/{product-card,product-stock,buy-product-button}.tsx`
- `src/app/{page,products/page,login/page,register/page}.tsx`

## Verification

TypeScript, lint, the production build, and all 15 existing API/utility regression tests pass. A temporary isolated headless browser was used because the connected browser was unavailable. DOM and screenshot checks covered the live storefront at desktop and 320px/390px mobile sizes, navigation opening/Escape dismissal, Enter/button search submission, matching/empty results, logged-out Admin visibility, disabled cart, login layout and footer. No records were created or changed. Authenticated menus were reviewed in code; real account login/order mutations were not exercised during this visual step.
