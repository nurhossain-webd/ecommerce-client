import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { apiRequest, ApiError, authApi, productsApi, ordersApi, reviewsApi, getErrorMessage, getFieldErrors } from "../src/lib/api";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
afterEach(() => {
  mock.restoreAll();
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

function browserSession(token: string | null) {
  const events: string[] = [];
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    localStorage: { getItem: () => token },
    dispatchEvent: (event: Event) => { events.push(event.type); return true; },
  } });
  return events;
}

function respond(payload: unknown, status = 200) {
  return mock.method(globalThis, "fetch", async () => Response.json(payload, { status }));
}

test("unwraps list data, merges headers and serializes query values without dropping zero/false", async () => {
  const fetchMock = respond({ success: true, message: "OK", data: [] });
  assert.deepEqual(await apiRequest("/api/products?existing=yes", {
    headers: { "X-Request-ID": "test" }, query: { q: "a & b", page: 0, active: false, absent: undefined, tags: ["a", "b"] },
  }), []);
  const [url, options] = fetchMock.mock.calls[0].arguments as unknown as [URL, RequestInit];
  assert.equal(url.searchParams.get("q"), "a & b");
  assert.equal(url.searchParams.get("page"), "0");
  assert.equal(url.searchParams.get("active"), "false");
  assert.equal(url.searchParams.get("existing"), "yes");
  assert.equal(url.searchParams.has("absent"), false);
  assert.deepEqual(url.searchParams.getAll("tags"), ["a", "b"]);
  const headers = new Headers(options.headers);
  assert.equal(headers.get("X-Request-ID"), "test");
  assert.equal(headers.get("Accept"), "application/json");
  assert.equal(headers.has("Authorization"), false);
  assert.equal(headers.has("Content-Type"), false);
});

test("order creation sends only items and authenticates with the stored session", async () => {
  browserSession("customer-token");
  const fetchMock = respond({ success: true, message: "Created", data: { id: "order", orderItems: [] } });
  const items = [{ productId: "product", quantity: 2 }];
  await ordersApi.create({ items });
  const [url, options] = fetchMock.mock.calls[0].arguments as unknown as [URL, RequestInit];
  assert.equal(url.pathname, "/api/orders");
  assert.equal(options.method, "POST");
  assert.deepEqual(JSON.parse(options.body as string), { items });
  assert.equal(new Headers(options.headers).get("Authorization"), "Bearer customer-token");
  assert.equal(new Headers(options.headers).get("Content-Type"), "application/json");
  assert.equal(options.cache, "no-store");
});

test("server tokens are per request and authenticated responses cannot opt into a shared cache", async () => {
  const fetchMock = respond({ success: true, message: "OK", data: [] });
  await Promise.all([ordersApi.list({ token: "one", cache: "force-cache" }), ordersApi.list({ token: "two" })]);
  const requests = fetchMock.mock.calls.map((call) => (call.arguments as unknown as [URL, RequestInit])[1]);
  assert.deepEqual(requests.map((request) => new Headers(request.headers).get("Authorization")), ["Bearer one", "Bearer two"]);
  assert.ok(requests.every((request) => request.cache === "no-store"));
});

test("missing session fails before fetch, both in browser and server contexts", async () => {
  const fetchMock = respond({});
  await assert.rejects(ordersApi.list(), { status: 401 });
  browserSession(null);
  await assert.rejects(ordersApi.list(), { status: 401 });
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("protected 401 emits logout even for non-JSON; login failure and 403 do not", async () => {
  const events = browserSession("expired");
  mock.method(globalThis, "fetch", async () => new Response("Unauthorized", { status: 401 }));
  await assert.rejects(ordersApi.list(), { status: 401 });
  assert.deepEqual(events, ["auth:unauthorized"]);
  events.length = 0;
  await assert.rejects(authApi.login({ email: "user@example.com", password: "wrong" }), { status: 401 });
  assert.deepEqual(events, []);
  mock.restoreAll();
  respond({ success: false, message: "Forbidden" }, 403);
  await assert.rejects(ordersApi.list(), { status: 403 });
  assert.deepEqual(events, []);
});

test("preserves validation messages and nested form field errors", async () => {
  respond({ success: false, message: "Validation failed", errors: [
    { field: "body.items.0.quantity", message: "Must be an integer" },
    { field: "body.items.0.quantity", message: "Must be positive" },
    null,
    { field: 12, message: false },
  ] }, 400);
  await assert.rejects(apiRequest("/api/orders"), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 400);
    assert.equal(getErrorMessage(error), "Must be an integer");
    assert.equal(getFieldErrors(error)["items.0.quantity"], "Must be an integer");
    assert.equal(error.errors?.length, 2);
    return true;
  });
});

test("rejects malformed success envelopes instead of silently returning undefined", async () => {
  for (const payload of [null, [], {}, { data: [] }, { success: true, message: "OK" }]) {
    respond(payload);
    await assert.rejects(productsApi.list(), { name: "ApiError", status: 200 });
    mock.restoreAll();
  }
  respond({ success: false, message: "Failed despite HTTP 200" });
  await assert.rejects(productsApi.list(), { message: "Failed despite HTTP 200" });
});

test("non-JSON success and server failures retain their HTTP status", async () => {
  for (const status of [200, 502]) {
    mock.method(globalThis, "fetch", async () => new Response("<html>Proxy</html>", { status }));
    await assert.rejects(productsApi.list(), { name: "ApiError", status });
    mock.restoreAll();
  }
});

test("network failures become displayable errors; aborts remain cancellations", async () => {
  mock.method(globalThis, "fetch", async () => { throw new TypeError("fetch failed"); });
  await assert.rejects(productsApi.list(), { name: "ApiError", status: 0 });
  mock.restoreAll();
  const abort = new DOMException("Cancelled", "AbortError");
  mock.method(globalThis, "fetch", async () => { throw abort; });
  await assert.rejects(productsApi.list(), (error) => error === abort);
  mock.restoreAll();
  const response = Response.json({});
  mock.method(response, "json", async () => { throw abort; });
  mock.method(globalThis, "fetch", async () => response);
  await assert.rejects(productsApi.list(), (error) => error === abort);
});

test("supports empty responses and preserves scalar DELETE responses", async () => {
  mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));
  assert.equal(await apiRequest<void>("/api/example"), undefined);
  mock.restoreAll();
  const fetchMock = respond({ success: true, message: "Deleted", data: { id: "review", isDeleted: true } });
  const result = await reviewsApi.remove("id/with slash", { token: "owner" });
  assert.equal(result.isDeleted, true);
  const [url, options] = fetchMock.mock.calls[0].arguments as unknown as [URL, RequestInit];
  assert.equal(url.pathname, "/api/reviews/id%2Fwith%20slash");
  assert.equal(options.method, "DELETE");
});

test("admin status changes use their dedicated endpoint", async () => {
  const fetchMock = respond({ success: true, message: "Updated", data: {} });
  await ordersApi.updateStatus("order-id", { status: "SHIPPED" }, { token: "admin" });
  const [url, options] = fetchMock.mock.calls[0].arguments as unknown as [URL, RequestInit];
  assert.equal(url.pathname, "/api/orders/admin/order-id/status");
  assert.equal(options.method, "PATCH");
  assert.deepEqual(JSON.parse(options.body as string), { status: "SHIPPED" });
});
