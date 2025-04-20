import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// USERS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  phone: true,
  name: true,
  isAdmin: true
});

// MENU CATEGORIES
export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayOrder: integer("display_order").notNull().default(0)
});

export const insertMenuCategorySchema = createInsertSchema(menuCategories).pick({
  name: true,
  displayOrder: true
});

// MENU ITEMS
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  categoryId: integer("category_id").notNull(),
  imageUrl: text("image_url"),
  ingredients: jsonb("ingredients").$type<string[]>(),
  available: boolean("available").default(true).notNull()
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  name: true,
  description: true,
  price: true,
  categoryId: true,
  imageUrl: true,
  ingredients: true,
  available: true
});

// INGREDIENTS
export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stock: integer("stock").notNull().default(0),
  unit: text("unit").notNull(),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10)
});

export const insertIngredientSchema = createInsertSchema(ingredients).pick({
  name: true,
  stock: true,
  unit: true,
  lowStockThreshold: true
});

// ORDERS
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  orderNumber: text("order_number").notNull(),
  status: text("status").notNull().default("new"),
  orderType: text("order_type").notNull(),
  totalAmount: real("total_amount").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  scheduledFor: timestamp("scheduled_for")
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  orderNumber: true,
  status: true,
  orderType: true,
  totalAmount: true,
  paymentStatus: true,
  specialInstructions: true,
  scheduledFor: true
});

// ORDER ITEMS
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  specialRequests: text("special_requests")
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  menuItemId: true,
  quantity: true,
  unitPrice: true,
  specialRequests: true
});

// ANALYTICS
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  userId: integer("user_id"),
  data: jsonb("data"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  eventType: true,
  userId: true,
  data: true
});

// Types for export
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
