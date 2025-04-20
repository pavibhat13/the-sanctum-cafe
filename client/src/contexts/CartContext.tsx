import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@shared/schema';
import { ANALYTICS_EVENT } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './AuthContext';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialRequests?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem, quantity: number, specialRequests?: string) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  orderType: string;
  setOrderType: (type: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (instructions: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<string>('pickup');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('sanctum_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart.items || []);
        setOrderType(parsedCart.orderType || 'pickup');
        setSpecialInstructions(parsedCart.specialInstructions || '');
      } catch (e) {
        localStorage.removeItem('sanctum_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartData = {
      items,
      orderType,
      specialInstructions
    };
    localStorage.setItem('sanctum_cart', JSON.stringify(cartData));
  }, [items, orderType, specialInstructions]);

  const addToCart = (menuItem: MenuItem, quantity: number, specialRequests?: string) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.menuItem.id === menuItem.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          specialRequests: specialRequests || updatedItems[existingItemIndex].specialRequests
        };
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { menuItem, quantity, specialRequests }];
      }
    });
    
    toast({
      title: "Added to Cart",
      description: `${quantity} × ${menuItem.name} added to your cart.`,
    });

    // Track analytics event
    trackCartEvent(ANALYTICS_EVENT.CART_ADD, menuItem.id, quantity);
  };

  const removeFromCart = (itemId: number) => {
    const itemToRemove = items.find(item => item.menuItem.id === itemId);
    if (!itemToRemove) return;

    setItems(prevItems => prevItems.filter(item => item.menuItem.id !== itemId));
    
    toast({
      title: "Removed from Cart",
      description: `${itemToRemove.menuItem.name} removed from your cart.`,
    });

    // Track analytics event
    trackCartEvent(ANALYTICS_EVENT.CART_REMOVE, itemId, itemToRemove.quantity);
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.menuItem.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setSpecialInstructions('');
  };

  // Helper to track cart events
  const trackCartEvent = async (eventType: string, menuItemId: number, quantity: number) => {
    if (user) {
      try {
        await apiRequest('POST', '/api/analytics', {
          eventType,
          userId: user.id,
          data: { menuItemId, quantity }
        });
      } catch (error) {
        console.error('Failed to track cart event:', error);
      }
    }
  };

  // Calculate cart totals
  const subtotal = items.reduce(
    (sum, item) => sum + (item.menuItem.price * item.quantity), 
    0
  );
  
  const taxRate = 0.1; // 10% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      tax,
      total,
      orderType,
      setOrderType,
      specialInstructions,
      setSpecialInstructions
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
