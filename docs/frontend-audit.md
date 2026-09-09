# Step 1: frontend architecture and backend coverage

Audited the full tracked frontend source, configuration, styles and assets, plus all six Express routers, service implementations, validation schemas, authentication/authorization/error middleware and Prisma models. No backend changes were needed. This step preserves the existing pages, direct orders and Buy now flow; it adds no cart or dependencies.

## Current architecture

- Next.js 16 App Router, React 19, strict TypeScript and Tailwind 4. Root and admin layouts are server components; all route pages currently fetch from client components using effects and local state.
- Root layout provides `AuthProvider`, header and footer. Auth persists a JWT and a small user object in local storage. Authenticated requests attach Bearer tokens. Protected-request 401 responses clear the session and redirect; login failures and forbidden responses do not log the user out.
- Admin layout owns the ADMIN access guard. Redundant page-level admin guards were removed. These client guards control presentation; the Express middleware enforces authorization and checks that the user remains active.
- CSS already supplies shared button, card, input, table, alert and badge styles. Preserve this design foundation when improving pages.
- Products/categories/reviews are fetched as complete arrays. Category products and product reviews are filtered in the browser. Featured products are the first six ACTIVE products; there is no backend featured flag.
- `/products` already has quantity selection and direct multi-item order creation. Buy now creates a one-item order. These are existing behaviors, not a newly implemented cart.
- Admin overview counts users/products/categories and stock quantities <= 5 in the browser. Product/category CRUD, user listing and order status management already work.

## Structure after this step

```text
src/
  app/                       Existing routes and page composition
  context/auth-context.tsx   Session state and redirects
  types/
    entities.ts              Exact JSON entity/relation shapes and status types
    requests.ts              Allowed create/update payloads
    api.ts                   Discriminated success/failure envelopes
    index.ts
  lib/
    types.ts                 Compatibility export for existing imports
    api/
      client.ts              Shared JSON fetch transport
      errors.ts              ApiError, display messages and field errors
      options.ts             Per-request signal/token/headers/cache options
      auth.ts                Typed endpoint methods
      products.ts
      categories.ts
      orders.ts
      reviews.ts
      users.ts
      index.ts
    utils/
      currency.ts
      dates.ts
      stock.ts
    store-images.ts          Existing illustrative image fallback
  components/
    ui/                      Alert and StateCard
    products/                ProductCard, ProductStock, BuyProductButton
    orders/                  OrderItems
    admin/                   AdminShell
    auth/                    ProtectedPage
    layout/                  Header and Footer
    cart/                    README reservation only; no implementation
tests/                       Transport, utility and compile-time contract tests
```

`ProductCard` is shared by home and category detail; `ProductStock` also serves catalog/detail pages. `OrderItems` shares customer/admin rendering and uses the order's captured unit prices, never the current product price. Alert and loading/empty components retain existing styles and add accessible status roles.

## API usage and boundaries

All current callers now use resource methods, which own their request/response contracts and authentication requirements:

```ts
import { productsApi, ordersApi, getErrorMessage, getFieldErrors, isAbortError } from "@/lib/api";

const controller = new AbortController();
const products = await productsApi.list({ signal: controller.signal });
const order = await ordersApi.create({
  items: [{ productId: products[0].id, quantity: 1 }],
});

// In a future form's catch block:
// if (!isAbortError(error)) {
//   setError(getErrorMessage(error));
//   setFieldErrors(getFieldErrors(error));
// }
```

Only call order creation after checking that a product exists and validating the chosen quantity. The snippet illustrates API signatures; it is not a checkout implementation.

- `NEXT_PUBLIC_API_URL` remains the API origin/base, defaulting to `http://localhost:5001`; trailing slashes are normalized. No credentials are embedded in code.
- Transport serializes JSON bodies, merges headers, unwraps `{ success, message, data }`, checks the envelope and handles malformed/non-JSON responses. Domain data is statically typed, not runtime schema-validated. No validation library or generated Prisma dependency was added to the browser.
- `ApiError` carries HTTP status (0 for connection failures) and validated field/message entries. `getFieldErrors` strips `body.`, `params.` or `query.` while retaining nested paths such as `items.0.quantity`; first messages win.
- Fetch and response-reading aborts remain cancellation errors. Callers can supply an AbortSignal. Existing page effects have not all been converted to abort on navigation; that is follow-up work.
- Explicit tokens are scoped to individual requests for server callers. There is no module-global token. Authenticated requests use `no-store`, even if a caller requests caching. Browser session-based protected 401s trigger the existing logout event; explicit-token requests do not mutate the browser session.
- The low-level `apiRequest<T, TBody>` remains available for future endpoints and query serialization. Current list wrappers intentionally expose no search/filter/pagination options because the backend ignores them. Empty 204 responses can be consumed as `void`; current resource DELETE routes return the soft-deleted record.
- Mutations are never retried automatically, avoiding duplicate orders/reviews after uncertain network outcomes.

### Response differences that the original types hid

| Endpoint response | Exact frontend shape |
| --- | --- |
| Auth login/register | `AuthSession`: token and `AuthUser` with id/name/email/role only |
| Users CRUD | `User`, including timestamps and isDeleted, excluding password |
| Categories CRUD | `Category` scalars; no products relation |
| Products GET list/detail | `Product`: scalar record plus required category |
| Products POST/PATCH/DELETE | `ProductRecord`: no category relation |
| Reviews GET list/detail | `Review`: record plus user and product id/name summaries |
| Reviews POST/PATCH/DELETE | `ReviewRecord`: no relations |
| Customer orders GET list/detail | `CustomerOrder`: full safe user plus items and scalar products |
| Orders POST | `CreatedOrder`: items/products, no user relation |
| Customer orders PATCH/DELETE | `OrderRecord`: no items or user |
| Admin orders GET/PATCH status | `Order`: items/products and small `AuthUser` summary |

Nullable descriptions/comments are explicit, timestamps are JSON strings, missing `isDeleted`/`orderId` fields are represented, and relation fields are required only where the service includes them. PATCH types require at least one allowed field. Numeric ranges, UUIDs, item uniqueness and other runtime constraints remain backend-enforced.

## Complete backend capability comparison

All paths below start with `/api`. “Unused” means no current UI invokes the route; typed methods now exist for every resource route.

| Area and routes | Backend authorization/behavior | Current frontend coverage |
| --- | --- | --- |
| POST `/auth/login`, `/auth/register` | Public; registration creates USER, returns JWT session; JWT lasts 7 days | Used by login/register; logout is local only |
| GET `/products`, `/products/:id` | Public; excludes soft-deleted products; includes category | Used by home/catalog/category/detail/admin |
| POST `/products`, PATCH/DELETE `/products/:id` | ADMIN; create/update or soft delete | Used by product manager |
| GET `/categories`, `/categories/:id` | Public; excludes soft-deleted categories | Used by storefront/category detail/admin |
| POST `/categories`, PATCH/DELETE `/categories/:id` | ADMIN; create/update or soft delete | Used by category manager |
| GET `/reviews` | Public; includes user/product summaries | Used by product detail, then filtered locally |
| GET `/reviews/:id` | Public single review | Unused |
| POST `/reviews` | USER only; identity taken from JWT | Used by product review form |
| PATCH/DELETE `/reviews/:id` | Review owner or ADMIN; edit rating/comment or soft delete | Unused: no owner editing/deletion or admin moderation UI |
| GET `/orders` | Authenticated; current user's non-deleted orders | Used by My Orders |
| GET `/orders/:id` | Authenticated order owner | Unused: no individual order route/view |
| POST `/orders` | Authenticated; transaction validates unique product IDs, active/non-deleted products, positive integer quantities and stock; captures prices and decrements stock atomically | Used by direct multi-item ordering and Buy now |
| PATCH `/orders/:id` | Authenticated owner; accepts any of the five statuses | Unused |
| DELETE `/orders/:id` | Authenticated owner; soft delete | Unused |
| GET `/orders/admin/all` | ADMIN; all non-deleted orders, newest first | Used by admin orders |
| PATCH `/orders/admin/:id/status` | ADMIN; updates status, returns full admin order shape | Used by admin orders |
| GET `/users` | ADMIN; non-deleted users, no passwords | Used by admin users and overview |
| GET `/users/:id` | ADMIN; safe single user | Unused |
| POST `/users` | ADMIN; creates USER (role field is rejected) | Unused |
| PATCH `/users/:id` | ADMIN; name/email only | Unused |
| DELETE `/users/:id` | ADMIN; soft delete; later authenticated requests for that user return 401 | Unused |

Outside `/api`, GET `/` is an operational liveness check returning success/message without data. It is not used by the storefront and is not a resource API wrapper.

### Validation and behavior to respect in future forms

- All `:id` route parameters must be UUIDs. Request schemas are strict: extra fields fail. Empty product/category/review/user PATCH bodies fail. Error fields include location prefixes.
- Names: user 2–100 characters, category 1–100, product 1–200; values are trimmed. Emails must be valid and are lowercased. Registration/admin-created passwords are 8–72 characters; login requires a non-empty password.
- Product description: optional string, maximum 2000; price >= 0; stock integer >= 0. Create defaults stock to 0/status to ACTIVE. Category ID is required. Update cannot send null to clear description; an empty string is accepted.
- Category status: ACTIVE or INACTIVE. Product status: ACTIVE, OUT_OF_STOCK or INACTIVE. Public lists include inactive records; they only filter `isDeleted`.
- Reviews: integer rating 1–5, optional comment up to 1000 characters; update cannot reassign product/user. The service does not enforce a verified purchase or one-review-per-customer rule.
- Orders: at least one unique product line, positive integer quantity, no client userId/prices/totals. Stock and prices are authoritative at creation. Category status is not checked when ordering.
- Order statuses: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED. There is no transition graph. Customer PATCH accepts fulfillment statuses too. Status cancellation and soft deletion do **not** restore stock. Do not present these as a complete cancellation/refund workflow without first agreeing on business rules.
- Prisma unique/foreign-key conflicts return 409; missing records return 404; validation returns 400; unauthorized/forbidden return 401/403; unexpected failures return 500.

## Shared utility conventions

- `formatCurrency`: Intl formatting, default en-US/USD to preserve existing dollar prices, optional locale/currency, `—` for non-finite values. Currency is a frontend convention because the backend stores only numeric prices.
- `formatDate`/`formatDateTime`: en-US, UTC by default for deterministic rendering, optional locale/timezone/style; `—` for absent or invalid values. Pass an explicit user/store timezone when that preference is introduced.
- Stock state: deleted/inactive → unavailable; OUT_OF_STOCK or quantity <= 0 → out of stock; 1–5 → low stock; otherwise in stock. A positive quantity alone does not make inactive/deleted products purchasable. The server still rechecks every order.

## Reuse opportunities remaining

- Extend `ProductCard` to accommodate the catalog's existing quantity controls and action slot when improving catalog UX; home/category cards are already shared.
- Extract category cards from home/category listing with explicit count/status slots.
- Share labeled form fields, buttons, status badges and accessible dialogs when those pages are polished. Native prompt/confirm category editing and purchase dialog focus management need attention.
- Move product reviews into review list/form components, then add owner actions using the typed API. Share rating display with catalog cards if needed.
- Share order summary/header/status rendering between customer and admin views; item rendering is already extracted.
- Standardize fetch lifecycle handling (abort/stale results, retry, loading, independent errors), forms and mutation pending states. Avoid adding a generic hook/state library before the actual page requirements are established.

## Known gaps versus unavailable backend features

Frontend gaps: catalog search/filter/sort UI, deliberate handling of inactive categories/products, stale inventory after Buy now on home/category/detail, per-field validation display, consistent pending states, richer order details, review management, user CRUD, accessible edit/confirmation dialogs and customer-facing copy. Cached local-storage user data is only a UI hint; there is no `/me` endpoint for session hydration. Existing illustrative Unsplash images are selected by keywords, not actual product records. Buy now currently says “Order confirmed” although creation defaults to PENDING; Step 2 should align this copy with the returned status.

Backend features that do **not** exist: search/filter/pagination endpoints or metadata; product image/upload/gallery fields; variants/SKUs; currency/tax/discount/promotion fields; wishlist/cart persistence; addresses/shipping/tracking; payments/refunds; aggregate rating/analytics endpoints; email verification/password reset/password change; refresh tokens, `/me`, or server logout/revocation. Do not describe these as unused implemented capabilities or build UI that falsely claims they work.

## Recommended Step 2

Focus on the storefront catalog and product details using this foundation: reuse the catalog/category cards, add client-side search/category/availability/price filters and sorting with URL state, define storefront visibility rules, improve loading/error/empty states, refresh stock after purchases, polish mobile layouts and customer-facing copy, and extract the review section. Keep the current backend and direct-order behavior. Clearly treat imagery as illustrative until real image fields exist. Cart should remain a separate explicitly scoped step.

Follow with order detail views, owner review editing/deletion, admin review moderation and user management. Before exposing customer cancellation/deletion, resolve transition and stock-restoration semantics with the backend owner.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` from `ecommerce-client`. Tests use the installed TypeScript compiler and Node's built-in runner, compile into a temporary directory and remove the output. Transport tests mock fetch and sessions, so they exercise contracts without creating records or requiring a live database. A browser/backend end-to-end pass remains separate from these automated checks.

## Verification results for this change

- `npm run typecheck`: passed.
- `npm run lint`: passed with no warnings/errors.
- `npm test`: all 15 tests passed; compile-only contract assertions also passed.
- `npm run build`: attempted; the sandbox first blocked the existing Google Fonts download, then Turbopack failed because its internal CSS worker could not bind a port (Operation not permitted).
- `npm run build -- --webpack`: passed with network access, including compilation, TypeScript, all 14 static pages and build traces. The normal build script and font setup were preserved.
- `git diff --check`: passed. Backend working tree remains unchanged. No live browser/database end-to-end checks were performed.

## Files changed

All paths below are relative to `ecommerce-client`. Original component locations were moved into feature folders; `src/lib/api.ts` was replaced by the API directory. No dependency versions, lockfile, styles or backend files changed.

- Updated: `README.md`
- Added: `docs/frontend-audit.md`
- Updated: `package.json`
- Added: `scripts/test.mjs`
- Updated: `src/app/admin/categories/page.tsx`
- Updated: `src/app/admin/layout.tsx`
- Updated: `src/app/admin/orders/page.tsx`
- Updated: `src/app/admin/page.tsx`
- Updated: `src/app/admin/products/page.tsx`
- Updated: `src/app/admin/users/page.tsx`
- Updated: `src/app/categories/[id]/page.tsx`
- Updated: `src/app/categories/page.tsx`
- Updated: `src/app/layout.tsx`
- Updated: `src/app/login/page.tsx`
- Updated: `src/app/orders/page.tsx`
- Updated: `src/app/page.tsx`
- Updated: `src/app/products/[id]/page.tsx`
- Updated: `src/app/products/page.tsx`
- Updated: `src/app/register/page.tsx`
- Removed/moved: `src/components/admin-shell.tsx`
- Added: `src/components/admin/admin-shell.tsx`
- Added: `src/components/auth/protected-page.tsx`
- Removed/moved: `src/components/buy-product-button.tsx`
- Added: `src/components/cart/README.md`
- Removed/moved: `src/components/footer.tsx`
- Removed/moved: `src/components/header.tsx`
- Added: `src/components/layout/footer.tsx`
- Added: `src/components/layout/header.tsx`
- Added: `src/components/orders/order-items.tsx`
- Added: `src/components/products/buy-product-button.tsx`
- Added: `src/components/products/product-card.tsx`
- Added: `src/components/products/product-stock.tsx`
- Removed/moved: `src/components/protected-page.tsx`
- Added: `src/components/ui/alert.tsx`
- Added: `src/components/ui/state-card.tsx`
- Updated: `src/context/auth-context.tsx`
- Removed/moved: `src/lib/api.ts`
- Added: `src/lib/api/auth.ts`
- Added: `src/lib/api/categories.ts`
- Added: `src/lib/api/client.ts`
- Added: `src/lib/api/errors.ts`
- Added: `src/lib/api/index.ts`
- Added: `src/lib/api/options.ts`
- Added: `src/lib/api/orders.ts`
- Added: `src/lib/api/products.ts`
- Added: `src/lib/api/reviews.ts`
- Added: `src/lib/api/users.ts`
- Updated: `src/lib/types.ts`
- Added: `src/lib/utils/currency.ts`
- Added: `src/lib/utils/dates.ts`
- Added: `src/lib/utils/stock.ts`
- Added: `src/types/api.ts`
- Added: `src/types/entities.ts`
- Added: `src/types/index.ts`
- Added: `src/types/requests.ts`
- Added: `tests/api.test.ts`
- Added: `tests/contracts.ts`
- Added: `tests/tsconfig.json`
- Added: `tests/utils.test.ts`
