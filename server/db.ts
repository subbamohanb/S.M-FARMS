import { and, asc, desc, eq, gt, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, orderItems, orders, Product, products, pushTokens, users } from "../drizzle/schema";
import { ENV } from './_core/env';

const TRACKING_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getTrackingTokenExpiry() {
  return new Date(Date.now() + TRACKING_TOKEN_TTL_MS);
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByBusiness(business: "agri" | "dairy") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list products: database not available");
    return [];
  }

  return db
    .select()
    .from(products)
    .where(and(eq(products.business, business), eq(products.isActive, 1)))
    .orderBy(asc(products.id));
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list products: database not available");
    return [];
  }

  return db.select().from(products).where(eq(products.isActive, 1)).orderBy(asc(products.id));
}

export type PendingOrderItemInput = { productId: number; quantity: number };

export function buildOrderLines(items: PendingOrderItemInput[], catalog: Product[]) {
  if (items.length === 0) throw new Error("Cart cannot be empty");
  const normalized = items.map((item) => ({ productId: Number(item.productId), quantity: Math.floor(Number(item.quantity)) }));
  if (normalized.some((item) => !Number.isInteger(item.productId) || item.productId <= 0 || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99)) {
    throw new Error("Cart contains an invalid product quantity");
  }
  const quantityByProduct = new Map<number, number>();
  for (const item of normalized) {
    const quantity = (quantityByProduct.get(item.productId) ?? 0) + item.quantity;
    if (quantity > 99) throw new Error("A product quantity cannot exceed 99");
    quantityByProduct.set(item.productId, quantity);
  }
  const catalogById = new Map(catalog.filter((product) => product.isActive === 1).map((product) => [product.id, product]));
  return Array.from(quantityByProduct.entries()).map(([productId, quantity]) => {
    const product = catalogById.get(productId);
    if (!product) throw new Error("One or more products are unavailable");
    return { productId: product.id, productName: product.name, unitPriceInr: product.priceInr, quantity, lineTotalInr: product.priceInr * quantity };
  });
}

export async function getCustomerTransactionHistory(input: { orderId: number; contact: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rawContact = input.contact.trim();
  const email = rawContact.toLowerCase();
  const anchor = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.id, input.orderId), or(eq(orders.customerEmail, email), eq(orders.customerPhone, rawContact)))).limit(1);
  if (!anchor[0]) return [];
  const rows = await db.select({
    id: orders.id,
    status: orders.status,
    amountInr: orders.amountInr,
    razorpayPaymentId: orders.razorpayPaymentId,
    createdAt: orders.createdAt,
    updatedAt: orders.updatedAt,
  }).from(orders).where(or(eq(orders.customerEmail, email), eq(orders.customerPhone, rawContact))).orderBy(desc(orders.id)).limit(100);
  return rows.map((row) => ({ ...row, razorpayPaymentId: row.razorpayPaymentId ? `••••••${row.razorpayPaymentId.slice(-6)}` : null }));
}

export async function getOrderForTracking(input: { orderId: number; trackingToken: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select().from(orders).where(and(eq(orders.id, input.orderId), eq(orders.invoiceToken, input.trackingToken.trim()), gt(orders.invoiceTokenExpiresAt, new Date()))).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db.select({ productName: orderItems.productName, quantity: orderItems.quantity, lineTotalInr: orderItems.lineTotalInr }).from(orderItems).where(eq(orderItems.orderId, order.id));
  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    fulfillmentStatus: order.fulfillmentStatus,
    amountInr: order.amountInr,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    trackingTokenExpiresAt: order.invoiceTokenExpiresAt,
    items,
  };
}

export async function getAdminDashboardData() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [orderRows, productRows] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.id)).limit(100),
    db.select().from(products).orderBy(asc(products.business), asc(products.id)),
  ]);
  return { orders: orderRows, products: productRows };
}

export async function updateAdminOrder(input: {
  orderId: number;
  status?: "pending" | "paid" | "failed" | "cancelled";
  fulfillmentStatus?: "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string | null;
  carrier?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(orders).set({
    ...(input.status ? { status: input.status } : {}),
    ...(input.fulfillmentStatus ? { fulfillmentStatus: input.fulfillmentStatus } : {}),
    ...(input.trackingNumber !== undefined ? { trackingNumber: input.trackingNumber } : {}),
    ...(input.carrier !== undefined ? { carrier: input.carrier } : {}),
  }).where(eq(orders.id, input.orderId));
  const updated = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  return updated[0];
}

export async function updateAdminProductInventory(input: { productId: number; stockQuantity: number; reorderLevel: number; isActive?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (!Number.isInteger(input.stockQuantity) || input.stockQuantity < 0 || !Number.isInteger(input.reorderLevel) || input.reorderLevel < 0) {
    throw new Error("Inventory values must be non-negative whole numbers");
  }
  await db.update(products).set({ stockQuantity: input.stockQuantity, reorderLevel: input.reorderLevel, ...(input.isActive === undefined ? {} : { isActive: input.isActive ? 1 : 0 }) }).where(eq(products.id, input.productId));
  const updated = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
  return updated[0];
}

export async function markOrderPaid(orderId: number, razorpayPaymentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(orders).set({ status: "paid", razorpayPaymentId }).where(eq(orders.id, orderId));
  return db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
}

export async function getCodInvoice(input: { orderId: number; invoiceToken: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select({ id: orders.id, status: orders.status, paymentMethod: orders.paymentMethod, fulfillmentStatus: orders.fulfillmentStatus, amountInr: orders.amountInr, customerName: orders.customerName, createdAt: orders.createdAt, invoiceTokenExpiresAt: orders.invoiceTokenExpiresAt }).from(orders).where(and(eq(orders.id, input.orderId), eq(orders.invoiceToken, input.invoiceToken), eq(orders.paymentMethod, "cod"), gt(orders.invoiceTokenExpiresAt, new Date()))).limit(1);
  const order = rows[0];
  if (!order || order.status === "cancelled") return null;
  const items = await db.select({ productName: orderItems.productName, unitPriceInr: orderItems.unitPriceInr, quantity: orderItems.quantity, lineTotalInr: orderItems.lineTotalInr }).from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function regenerateTrackingToken(input: { orderId: number; trackingToken: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const current = await db.select({ id: orders.id, invoiceToken: orders.invoiceToken, invoiceTokenExpiresAt: orders.invoiceTokenExpiresAt }).from(orders).where(and(eq(orders.id, input.orderId), eq(orders.invoiceToken, input.trackingToken.trim()), gt(orders.invoiceTokenExpiresAt, new Date()))).limit(1);
  if (!current[0]) return null;
  const invoiceToken = nanoid(32);
  const invoiceTokenExpiresAt = getTrackingTokenExpiry();
  await db.update(orders).set({ invoiceToken, invoiceTokenExpiresAt }).where(eq(orders.id, input.orderId));
  return { orderId: input.orderId, invoiceToken, invoiceTokenExpiresAt };
}

export async function attachRazorpayOrderId(orderId: number, razorpayOrderId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(orders).set({ razorpayOrderId }).where(eq(orders.id, orderId));
}

export async function registerPushToken(input: { token: string; platform: "android" | "ios" | "web"; customerEmail?: string; customerPhone?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const token = input.token.trim();
  if (!token || token.length > 255) throw new Error("Invalid push token");
  await db.insert(pushTokens).values({
    token,
    platform: input.platform,
    customerEmail: input.customerEmail?.trim().toLowerCase() || null,
    customerPhone: input.customerPhone?.trim() || null,
    isActive: 1,
  }).onDuplicateKeyUpdate({
    set: {
      platform: input.platform,
      customerEmail: input.customerEmail?.trim().toLowerCase() || null,
      customerPhone: input.customerPhone?.trim() || null,
      isActive: 1,
      updatedAt: new Date(),
    },
  });
  return { registered: true };
}

export async function deactivatePushToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(pushTokens).set({ isActive: 0, updatedAt: new Date() }).where(eq(pushTokens.token, token.trim()));
  return { deactivated: true };
}

export async function getActivePushTokensForOrder(order: { customerEmail?: string | null; customerPhone?: string | null }) {
  const db = await getDb();
  if (!db) return [];
  const identityFilters = [];
  if (order.customerEmail) identityFilters.push(eq(pushTokens.customerEmail, order.customerEmail.trim().toLowerCase()));
  if (order.customerPhone) identityFilters.push(eq(pushTokens.customerPhone, order.customerPhone.trim()));
  if (identityFilters.length === 0) return [];
  return db.select({ token: pushTokens.token }).from(pushTokens).where(and(eq(pushTokens.isActive, 1), or(...identityFilters)));
}

export async function createPendingOrder(input: {
  items: PendingOrderItemInput[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: "razorpay" | "cod";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (input.items.length === 0) throw new Error("Cart cannot be empty");

  const catalog = await db.select().from(products).where(and(eq(products.isActive, 1)));
  const lines = buildOrderLines(input.items, catalog);

  const amountInr = lines.reduce((total, line) => total + line.lineTotalInr, 0);
  const result = await db.insert(orders).values({
    status: "pending",
    paymentMethod: input.paymentMethod ?? "razorpay",
    amountInr,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    invoiceToken: nanoid(32),
    invoiceTokenExpiresAt: getTrackingTokenExpiry(),
  });
  const orderId = Number(result[0].insertId);
  await db.insert(orderItems).values(lines.map((line) => ({ ...line, orderId })));
  const persisted = (await db.select({ invoiceToken: orders.invoiceToken, invoiceTokenExpiresAt: orders.invoiceTokenExpiresAt }).from(orders).where(eq(orders.id, orderId)).limit(1))[0];
  return { orderId, amountInr, items: lines, invoiceToken: persisted?.invoiceToken ?? "", invoiceTokenExpiresAt: persisted?.invoiceTokenExpiresAt ?? getTrackingTokenExpiry() };
}
