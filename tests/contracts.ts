import type { AuthUser, User, ProductRecord, Product, ReviewRecord, Review, OrderRecord, CreatedOrder, CustomerOrder, Order } from "../src/types";
import { authApi, productsApi, categoriesApi, ordersApi, reviewsApi, usersApi } from "../src/lib/api";

// Compile-only regression checks: mutations must not promise relations they omit.
export async function checkContracts() {
  const product: Product = await productsApi.get("id");
  const changed: ProductRecord = await productsApi.update("id", { stock: 2 });
  // @ts-expect-error Product mutations do not include category.
  const invalidProduct: Product = changed;
  const review: ReviewRecord = await reviewsApi.update("id", { rating: 5 });
  // @ts-expect-error Review mutations do not include user/product summaries.
  const invalidReview: Review = review;
  const session: AuthUser = (await authApi.login({ email: "a@b.com", password: "pw" })).user;
  // @ts-expect-error Auth users do not include database metadata.
  const invalidUser: User = session;
  const created: CreatedOrder = await ordersApi.create({ items: [{ productId: "id", quantity: 1 }] });
  // @ts-expect-error Order creation does not return user.
  const invalidOrder: Order = created;
  const customerOrder: CustomerOrder = await ordersApi.get("id");
  const scalarOrder: OrderRecord = await ordersApi.update("id", { status: "CANCELLED" });
  // @ts-expect-error Customer updates do not include orderItems.
  const invalidItems: CreatedOrder = scalarOrder;
  // @ts-expect-error Empty updates are rejected by the backend.
  await productsApi.update("id", {});
  // @ts-expect-error Role assignment is not supported by user creation.
  await usersApi.create({ name: "Name", email: "a@b.com", password: "password", role: "ADMIN" });
  // @ts-expect-error Category status does not include product-only OUT_OF_STOCK.
  await categoriesApi.update("id", { status: "OUT_OF_STOCK" });
  // @ts-expect-error Order prices are backend-owned.
  await ordersApi.create({ items: [], totalPrice: 10 });
  return { product, invalidProduct, invalidReview, invalidUser, invalidOrder, customerOrder, invalidItems };
}
