// Order status options
export const ORDER_STATUS = {
  NEW: 'new',
  COOKING: 'cooking',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Order types
export const ORDER_TYPE = {
  DINE_IN: 'dine_in',
  PICKUP: 'pickup',
  DELIVERY: 'delivery'
};

// Payment status options
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
};

// Analytics event types
export const ANALYTICS_EVENT = {
  MENU_VIEW: 'menu_view',
  ITEM_VIEW: 'item_view',
  CART_ADD: 'cart_add',
  CART_REMOVE: 'cart_remove',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  ORDER_CREATED: 'order_created',
  ORDER_STATUS_UPDATED: 'order_status_updated',
  LOGIN: 'login'
};

// Status badge colors
export const STATUS_COLORS = {
  new: 'bg-blue-500',
  cooking: 'bg-orange-500',
  ready: 'bg-green-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500'
};

// Initial stock photos for food items
export const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d', // Cappuccino
  'https://images.unsplash.com/photo-1603046891744-76e6300f82be', // Avocado Toast
  'https://images.unsplash.com/photo-1600271886742-f049cd451bba', // Orange Juice
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187', // Pancakes
  'https://images.unsplash.com/photo-1493770348161-369560ae357d', // Breakfast Plate
  'https://images.unsplash.com/photo-1525629456444-17c646ae1177'  // Fruit Salad
];

// Cafe ambiance photos
export const AMBIANCE_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24', // Cafe Interior
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8', // Cozy Corner
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814'  // Counter View
];

// Tea & coffee images
export const DRINK_IMAGES = [
  'https://images.unsplash.com/photo-1559496417-e7f25cb247f3', // Latte Art
  'https://images.unsplash.com/photo-1557772611-722545a4a690', // Iced Coffee
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574', // Espresso Shot
  'https://images.unsplash.com/photo-1544849250-84ef5298443f'  // Hot Tea
];
