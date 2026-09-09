import type { AuthUser, CategoryStatus, OrderStatus, ProductStatus } from "./entities";

/** PATCH schemas reject empty bodies. Runtime bounds remain enforced by the API. */
type AtLeastOne<T> = { [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>> }[keyof T];

export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string };
export type AuthSession = { user: AuthUser; token: string };
export type CreateUserInput = RegisterInput;
export type UpdateUserInput = AtLeastOne<{ name: string; email: string }>;
export type CreateCategoryInput = { name: string; status?: CategoryStatus };
export type UpdateCategoryInput = AtLeastOne<CreateCategoryInput>;
export type CreateProductInput = {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId: string;
  status?: ProductStatus;
};
export type UpdateProductInput = AtLeastOne<CreateProductInput>;
export type CreateReviewInput = { productId: string; rating: number; comment?: string };
export type UpdateReviewInput = AtLeastOne<Pick<CreateReviewInput, "rating" | "comment">>;
/** Never send userId, prices or totals: the backend derives them. */
export type CreateOrderInput = { items: { productId: string; quantity: number }[] };
export type UpdateOrderInput = { status: OrderStatus };
