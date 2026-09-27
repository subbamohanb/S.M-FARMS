import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  business: mysqlEnum("business", ["agri", "dairy"]).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  priceInr: int("priceInr").notNull(),
  compareAtPriceInr: int("compareAtPriceInr"),
  offerLabel: varchar("offerLabel", { length: 100 }),
  pack: varchar("pack", { length: 80 }).notNull(),
  label: varchar("label", { length: 80 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  note: varchar("note", { length: 180 }).notNull(),
  isActive: int("isActive").default(1).notNull(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  reorderLevel: int("reorderLevel").default(5).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "cancelled"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["razorpay", "cod"]).default("razorpay").notNull(),
  fulfillmentStatus: mysqlEnum("fulfillmentStatus", ["pending", "processing", "packed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  amountInr: int("amountInr").notNull(),
  customerName: varchar("customerName", { length: 160 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 32 }),
  invoiceToken: varchar("invoiceToken", { length: 64 }).unique(),
  invoiceTokenExpiresAt: timestamp("invoiceTokenExpiresAt"),
  razorpayOrderId: varchar("razorpayOrderId", { length: 80 }),
  razorpayPaymentId: varchar("razorpayPaymentId", { length: 80 }),
  trackingNumber: varchar("trackingNumber", { length: 120 }),
  carrier: varchar("carrier", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 180 }).notNull(),
  unitPriceInr: int("unitPriceInr").notNull(),
  quantity: int("quantity").notNull(),
  lineTotalInr: int("lineTotalInr").notNull(),
});

export const pushTokens = mysqlTable("pushTokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 32 }),
  platform: mysqlEnum("platform", ["android", "ios", "web"]).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
