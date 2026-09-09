import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCurrency } from "../src/lib/utils/currency";
import { formatDate, formatDateTime } from "../src/lib/utils/dates";
import { getProductStockState, isProductPurchasable, getProductStockLabel } from "../src/lib/utils/stock";
import { getErrorMessage, getFieldErrors } from "../src/lib/api/errors";

test("currency uses the existing USD convention, supports overrides and handles invalid numbers", () => {
  assert.equal(formatCurrency(1234.5), "$1,234.50");
  assert.equal(formatCurrency(0), "$0.00");
  assert.equal(formatCurrency(12, { currency: "EUR" }), "€12.00");
  assert.equal(formatCurrency(NaN), "—");
  assert.equal(formatCurrency(Infinity), "—");
});

test("dates are deterministic, configurable and safe for missing/invalid values", () => {
  const value = "2026-09-09T23:30:00Z";
  assert.equal(formatDate(value), "Sep 9, 2026");
  assert.equal(formatDate(value, { timeZone: "Asia/Tokyo" }), "Sep 10, 2026");
  assert.equal(formatDateTime(value), new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)));
  for (const invalid of [null, undefined, "", "not-a-date", NaN]) assert.equal(formatDate(invalid), "—");
});

test("stock state prioritizes deleted/inactive status and handles zero, threshold and explicit out-of-stock", () => {
  const product = { stock: 6, status: "ACTIVE" as const, isDeleted: false };
  assert.equal(getProductStockState(product), "in-stock");
  assert.equal(isProductPurchasable(product), true);
  assert.equal(getProductStockState({ ...product, stock: 5 }), "low-stock");
  assert.equal(getProductStockLabel({ ...product, stock: 1 }), "Only 1 left");
  for (const stock of [0, -1, NaN]) assert.equal(isProductPurchasable({ ...product, stock }), false);
  assert.equal(getProductStockState({ ...product, status: "OUT_OF_STOCK" }), "out-of-stock");
  assert.equal(getProductStockState({ ...product, status: "INACTIVE" }), "unavailable");
  assert.equal(getProductStockState({ ...product, isDeleted: true }), "unavailable");
  assert.equal(getProductStockState(product, 10), "low-stock");
});

test("unexpected errors have a displayable fallback and no fabricated field errors", () => {
  assert.equal(getErrorMessage(new Error("Failed")), "Failed");
  assert.equal(typeof getErrorMessage(null), "string");
  assert.equal(Object.keys(getFieldErrors(null)).length, 0);
});
