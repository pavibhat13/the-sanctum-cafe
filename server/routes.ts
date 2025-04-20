import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertMenuCategorySchema, 
  insertMenuItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertIngredientSchema, 
  insertAnalyticsSchema 
} from "@shared/schema";

// Generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${timestamp}${randomStr}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // AUTH ROUTES
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      
      let user = await storage.getUserByPhone(phone);
      
      if (!user) {
        // Create a new user if not found
        // Use specific phone number as admin for testing
        const isAdmin = phone === '8310810478';
        user = await storage.createUser({ phone, name: null, isAdmin });
      } else if (phone === '8310810478' && !user.isAdmin) {
        // If this is our test admin user but not marked as admin yet, update them
        // This is a workaround for development/testing purposes
        user = await storage.updateUser(user.id, { isAdmin: true }) || user;
        console.log('Updated user to admin:', user);
      }
      
      // Track login event
      await storage.addAnalytics({
        eventType: 'login',
        userId: user.id,
        data: { method: 'phone' }
      });
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  // USER ROUTES
  app.get('/api/user/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching user' });
    }
  });

  app.put('/api/user/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { name } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update the user in storage
      const updatedUser = await storage.updateUser(userId, { name });
      if (!updatedUser) {
        return res.status(500).json({ message: 'Failed to update user' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Server error updating user' });
    }
  });

  // MENU CATEGORY ROUTES
  app.get('/api/menu/categories', async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAllMenuCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching menu categories' });
    }
  });

  app.post('/api/menu/categories', async (req: Request, res: Response) => {
    try {
      const result = insertMenuCategorySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid menu category data', errors: result.error });
      }
      
      const category = await storage.createMenuCategory(result.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error creating menu category' });
    }
  });

  app.put('/api/menu/categories/:id', async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const result = insertMenuCategorySchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid menu category data', errors: result.error });
      }
      
      const category = await storage.updateMenuCategory(categoryId, result.data);
      
      if (!category) {
        return res.status(404).json({ message: 'Menu category not found' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error updating menu category' });
    }
  });

  app.delete('/api/menu/categories/:id', async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const success = await storage.deleteMenuCategory(categoryId);
      
      if (!success) {
        return res.status(404).json({ message: 'Menu category not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting menu category' });
    }
  });

  // MENU ITEM ROUTES
  app.get('/api/menu/items', async (_req: Request, res: Response) => {
    try {
      const items = await storage.getAllMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching menu items' });
    }
  });

  app.get('/api/menu/categories/:categoryId/items', async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const items = await storage.getMenuItemsByCategory(categoryId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching menu items by category' });
    }
  });

  app.get('/api/menu/items/:id', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getMenuItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching menu item' });
    }
  });

  app.post('/api/menu/items', async (req: Request, res: Response) => {
    try {
      const result = insertMenuItemSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid menu item data', errors: result.error });
      }
      
      const item = await storage.createMenuItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error creating menu item' });
    }
  });

  app.put('/api/menu/items/:id', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const result = insertMenuItemSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid menu item data', errors: result.error });
      }
      
      const item = await storage.updateMenuItem(itemId, result.data);
      
      if (!item) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error updating menu item' });
    }
  });

  app.delete('/api/menu/items/:id', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const success = await storage.deleteMenuItem(itemId);
      
      if (!success) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting menu item' });
    }
  });

  // ORDER ROUTES
  app.get('/api/orders', async (_req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching orders' });
    }
  });

  app.get('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const orderItems = await storage.getOrderItems(orderId);
      
      res.json({ order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching order' });
    }
  });

  app.get('/api/orders/number/:orderNumber', async (req: Request, res: Response) => {
    try {
      const orderNumber = req.params.orderNumber;
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const orderItems = await storage.getOrderItems(order.id);
      
      res.json({ order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching order by number' });
    }
  });

  app.get('/api/users/:userId/orders', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching user orders' });
    }
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      // Generate a unique order number
      const orderNumber = generateOrderNumber();
      const orderData = { ...req.body, orderNumber };
      
      const result = insertOrderSchema.safeParse(orderData);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid order data', errors: result.error });
      }
      
      const order = await storage.createOrder(result.data);
      
      // Process order items
      if (req.body.items && Array.isArray(req.body.items)) {
        const orderItems = req.body.items;
        
        for (const item of orderItems) {
          const orderItem = {
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            specialRequests: item.specialRequests
          };
          
          const itemResult = insertOrderItemSchema.safeParse(orderItem);
          
          if (itemResult.success) {
            await storage.addOrderItem(itemResult.data);
            
            // Update ingredient stock if applicable
            if (item.ingredients && Array.isArray(item.ingredients)) {
              for (const ingredientUpdate of item.ingredients) {
                await storage.updateIngredientStock(
                  ingredientUpdate.id, 
                  -ingredientUpdate.quantity
                );
              }
            }
          }
        }
      }
      
      // Track order creation event
      await storage.addAnalytics({
        eventType: 'order_created',
        userId: order.userId,
        data: { 
          orderId: order.id, 
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount
        }
      });
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error creating order' });
    }
  });

  app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      const validStatuses = ['new', 'cooking', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Track status change event
      await storage.addAnalytics({
        eventType: 'order_status_updated',
        userId: order.userId,
        data: { 
          orderId: order.id, 
          orderNumber: order.orderNumber,
          status: status
        }
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error updating order status' });
    }
  });

  app.patch('/api/orders/:id/payment', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { paymentStatus } = req.body;
      
      if (!paymentStatus) {
        return res.status(400).json({ message: 'Payment status is required' });
      }
      
      const validStatuses = ['pending', 'paid', 'failed'];
      if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status value' });
      }
      
      const order = await storage.updateOrderPaymentStatus(orderId, paymentStatus);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Track payment status change event
      await storage.addAnalytics({
        eventType: 'order_payment_updated',
        userId: order.userId,
        data: { 
          orderId: order.id, 
          orderNumber: order.orderNumber,
          paymentStatus: paymentStatus
        }
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error updating payment status' });
    }
  });

  // INGREDIENT ROUTES
  app.get('/api/ingredients', async (_req: Request, res: Response) => {
    try {
      const ingredients = await storage.getAllIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching ingredients' });
    }
  });

  app.get('/api/ingredients/low-stock', async (_req: Request, res: Response) => {
    try {
      const ingredients = await storage.getLowStockIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching low stock ingredients' });
    }
  });

  app.get('/api/ingredients/:id', async (req: Request, res: Response) => {
    try {
      const ingredientId = parseInt(req.params.id);
      const ingredient = await storage.getIngredient(ingredientId);
      
      if (!ingredient) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }
      
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching ingredient' });
    }
  });

  app.post('/api/ingredients', async (req: Request, res: Response) => {
    try {
      const result = insertIngredientSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid ingredient data', errors: result.error });
      }
      
      const ingredient = await storage.createIngredient(result.data);
      res.status(201).json(ingredient);
    } catch (error) {
      res.status(500).json({ message: 'Server error creating ingredient' });
    }
  });

  app.patch('/api/ingredients/:id/stock', async (req: Request, res: Response) => {
    try {
      const ingredientId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number') {
        return res.status(400).json({ message: 'Quantity must be a number' });
      }
      
      const ingredient = await storage.updateIngredientStock(ingredientId, quantity);
      
      if (!ingredient) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }
      
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ message: 'Server error updating ingredient stock' });
    }
  });

  // ANALYTICS ROUTES
  app.post('/api/analytics', async (req: Request, res: Response) => {
    try {
      const result = insertAnalyticsSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid analytics data', errors: result.error });
      }
      
      const analytics = await storage.addAnalytics(result.data);
      res.status(201).json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Server error recording analytics' });
    }
  });

  app.get('/api/analytics/:eventType', async (req: Request, res: Response) => {
    try {
      const { eventType } = req.params;
      const analytics = await storage.getAnalyticsByType(eventType);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching analytics' });
    }
  });

  return httpServer;
}
