/** JSON dates from Express/Prisma are ISO strings, never Date instances. */
export type ISODateString = string;

export type UserRole = "USER" | "ADMIN";
export type CategoryStatus = "ACTIVE" | "INACTIVE";
export type ProductStatus = "ACTIVE" | "OUT_OF_STOCK" | "INACTIVE";
export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

type RecordMetadata = {
  id: string;
  isDeleted: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

/** Login/register and admin order responses expose this smaller user shape. */
export type AuthUser = { id: string; name: string; email: string; role: UserRole };
/** User endpoints omit the password, but include all other scalar fields. */
export type User = AuthUser & RecordMetadata;
export type Category = RecordMetadata & { name: string; status: CategoryStatus };

/** Product mutations and order items have no category relation. Prices are numbers. */
export type ProductRecord = RecordMetadata & {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  categoryId: string;
};
export type Product = ProductRecord & { category: Category };

export type ReviewRecord = RecordMetadata & {
  rating: number;
  comment: string | null;
  productId: string;
  userId: string;
};
export type Review = ReviewRecord & {
  user: Pick<AuthUser, "id" | "name">;
  product: Pick<ProductRecord, "id" | "name">;
};

/** Customer PATCH/DELETE responses contain only these scalar fields. */
export type OrderRecord = RecordMetadata & {
  status: OrderStatus;
  totalPrice: number;
  userId: string;
};
export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  /** Unit price captured at order creation, independent of current product price. */
  price: number;
  product: ProductRecord;
};
export type CreatedOrder = OrderRecord & { orderItems: OrderItem[] };
export type Order = CreatedOrder & { user: AuthUser };
export type CustomerOrder = CreatedOrder & { user: User };
