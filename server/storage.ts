import { 
  User, InsertUser, MenuItem, InsertMenuItem, MenuCategory, InsertMenuCategory,
  Order, InsertOrder, OrderItem, InsertOrderItem, Ingredient, InsertIngredient,
  Analytics, InsertAnalytics
} from "@shared/schema";

export interface IStorage {
  // USER OPERATIONS
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // MENU CATEGORY OPERATIONS
  getAllMenuCategories(): Promise<MenuCategory[]>;
  getMenuCategory(id: number): Promise<MenuCategory | undefined>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  updateMenuCategory(id: number, category: Partial<InsertMenuCategory>): Promise<MenuCategory | undefined>;
  deleteMenuCategory(id: number): Promise<boolean>;
  
  // MENU ITEM OPERATIONS
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
  // ORDER OPERATIONS
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order | undefined>;
  
  // ORDER ITEM OPERATIONS
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // INGREDIENT OPERATIONS
  getAllIngredients(): Promise<Ingredient[]>;
  getIngredient(id: number): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredientStock(id: number, quantity: number): Promise<Ingredient | undefined>;
  getLowStockIngredients(): Promise<Ingredient[]>;
  
  // ANALYTICS OPERATIONS
  addAnalytics(event: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByType(eventType: string): Promise<Analytics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private menuCategories: Map<number, MenuCategory>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private ingredients: Map<number, Ingredient>;
  private analytics: Map<number, Analytics>;
  
  private userId: number;
  private menuCategoryId: number;
  private menuItemId: number;
  private orderId: number;
  private orderItemId: number;
  private ingredientId: number;
  private analyticsId: number;

  constructor() {
    this.users = new Map();
    this.menuCategories = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.ingredients = new Map();
    this.analytics = new Map();
    
    this.userId = 1;
    this.menuCategoryId = 1;
    this.menuItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.ingredientId = 1;
    this.analyticsId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Add default admin user
    this.createUser({
      phone: "5551234567",
      name: "Admin User",
      isAdmin: true
    });
    
    // Create menu categories
    const coffeeCategory = this.createMenuCategory({
      name: "Coffee",
      displayOrder: 1
    });
    
    const foodCategory = this.createMenuCategory({
      name: "Food",
      displayOrder: 2
    });
    
    const drinkCategory = this.createMenuCategory({
      name: "Cold Drinks",
      displayOrder: 3
    });
    
    // Create ingredients
    const coffeeBean = this.createIngredient({
      name: "Coffee Beans",
      stock: 50,
      unit: "kg",
      lowStockThreshold: 10
    });
    
    const milk = this.createIngredient({
      name: "Milk",
      stock: 30,
      unit: "liter",
      lowStockThreshold: 8
    });
    
    const avocado = this.createIngredient({
      name: "Avocado",
      stock: 20,
      unit: "pieces",
      lowStockThreshold: 5
    });
    
    // Create menu items
    this.createMenuItem({
      name: "Cappuccino",
      description: "Espresso with steamed milk and foam",
      price: 5.50,
      categoryId: coffeeCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
      ingredients: ["Coffee Beans", "Milk"],
      available: true
    });
    
    this.createMenuItem({
      name: "Avocado Toast",
      description: "Toasted sourdough bread with avocado, cherry tomatoes, and microgreens",
      price: 12.00,
      categoryId: foodCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1603046891744-76e6300f82be",
      ingredients: ["Avocado", "Sourdough Bread", "Cherry Tomatoes", "Microgreens"],
      available: true
    });
    
    this.createMenuItem({
      name: "Fresh Orange Juice",
      description: "Freshly squeezed orange juice",
      price: 7.00,
      categoryId: drinkCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
      ingredients: ["Oranges"],
      available: true
    });
  }

  // USER OPERATIONS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const timestamp = new Date();
    const newUser: User = { ...user, id, createdAt: timestamp };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // MENU CATEGORY OPERATIONS
  async getAllMenuCategories(): Promise<MenuCategory[]> {
    return Array.from(this.menuCategories.values())
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getMenuCategory(id: number): Promise<MenuCategory | undefined> {
    return this.menuCategories.get(id);
  }

  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const id = this.menuCategoryId++;
    const newCategory: MenuCategory = { ...category, id };
    this.menuCategories.set(id, newCategory);
    return newCategory;
  }

  async updateMenuCategory(
    id: number, 
    category: Partial<InsertMenuCategory>
  ): Promise<MenuCategory | undefined> {
    const existingCategory = this.menuCategories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.menuCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteMenuCategory(id: number): Promise<boolean> {
    return this.menuCategories.delete(id);
  }

  // MENU ITEM OPERATIONS
  async getAllMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.categoryId === categoryId);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemId++;
    const newItem: MenuItem = { ...item, id };
    this.menuItems.set(id, newItem);
    return newItem;
  }

  async updateMenuItem(
    id: number, 
    item: Partial<InsertMenuItem>
  ): Promise<MenuItem | undefined> {
    const existingItem = this.menuItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  // ORDER OPERATIONS
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values())
      .find(order => order.orderNumber === orderNumber);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const timestamp = new Date();
    const newOrder: Order = { ...order, id, createdAt: timestamp };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, paymentStatus };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // ORDER ITEM OPERATIONS
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async addOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }

  // INGREDIENT OPERATIONS
  async getAllIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  async getIngredient(id: number): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const id = this.ingredientId++;
    const newIngredient: Ingredient = { ...ingredient, id };
    this.ingredients.set(id, newIngredient);
    return newIngredient;
  }

  async updateIngredientStock(id: number, quantity: number): Promise<Ingredient | undefined> {
    const existingIngredient = this.ingredients.get(id);
    if (!existingIngredient) return undefined;
    
    const updatedIngredient = { 
      ...existingIngredient, 
      stock: existingIngredient.stock + quantity 
    };
    this.ingredients.set(id, updatedIngredient);
    return updatedIngredient;
  }

  async getLowStockIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values())
      .filter(ing => ing.stock <= ing.lowStockThreshold);
  }

  // ANALYTICS OPERATIONS
  async addAnalytics(event: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsId++;
    const timestamp = new Date();
    const newEvent: Analytics = { ...event, id, timestamp };
    this.analytics.set(id, newEvent);
    return newEvent;
  }

  async getAnalyticsByType(eventType: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(event => event.eventType === eventType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const storage = new MemStorage();
