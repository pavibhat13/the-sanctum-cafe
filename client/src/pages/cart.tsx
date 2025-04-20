import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import CartItem from '@/components/cart/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { ANALYTICS_EVENT } from '@/lib/constants';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PhoneAuthForm from '@/components/auth/PhoneAuthForm';

export default function Cart() {
  const { 
    items, 
    subtotal, 
    tax, 
    total, 
    orderType, 
    setOrderType,
    specialInstructions,
    setSpecialInstructions
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Track page view for analytics
  useEffect(() => {
    if (user) {
      const trackPageView = async () => {
        try {
          await apiRequest('POST', '/api/analytics', {
            eventType: ANALYTICS_EVENT.MENU_VIEW,
            userId: user.id,
            data: { page: 'cart' }
          });
        } catch (error) {
          console.error('Failed to track page view:', error);
        }
      };
      
      trackPageView();
    }
  }, [user]);
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    
    // Track checkout start event
    if (user) {
      const trackCheckoutStart = async () => {
        try {
          await apiRequest('POST', '/api/analytics', {
            eventType: ANALYTICS_EVENT.CHECKOUT_START,
            userId: user.id,
            data: { 
              cartItems: items.length,
              total: total
            }
          });
        } catch (error) {
          console.error('Failed to track checkout start:', error);
        }
      };
      
      trackCheckoutStart();
    }
    
    navigate('/checkout');
  };
  
  if (items.length === 0) {
    return (
      <MainLayout
        pageTitle="Your Cart"
        pageDescription="Review your items before checkout"
      >
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-6">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-300" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/menu">
              <Button className="bg-primary hover:bg-primary-dark">
                <ShoppingBag className="mr-2 h-4 w-4" /> Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout
      pageTitle="Your Cart"
      pageDescription="Review your items before checkout"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-4">
                  Cart Items ({items.length})
                </h2>
                <div className="space-y-1">
                  {items.map((item) => (
                    <CartItem
                      key={item.menuItem.id}
                      id={item.menuItem.id}
                      name={item.menuItem.name}
                      price={item.menuItem.price}
                      quantity={item.quantity}
                      imageUrl={item.menuItem.imageUrl}
                      specialRequests={item.specialRequests}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Order Type Selection */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-4">
                  Order Type
                </h2>
                <RadioGroup 
                  defaultValue={orderType} 
                  onValueChange={setOrderType}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="cursor-pointer">
                      Pickup at Café
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dine_in" id="dine_in" />
                    <Label htmlFor="dine_in" className="cursor-pointer">
                      Dine In
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="cursor-pointer">
                      Delivery
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            {/* Special Instructions */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-4">
                  Special Instructions
                </h2>
                <Textarea
                  placeholder="Any special instructions for your order?"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4 bg-gray-50 rounded-b-lg">
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark" 
                  onClick={handleCheckout}
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Need help? Call us at (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            You need to sign in before proceeding to checkout.
          </DialogDescription>
          <PhoneAuthForm onSuccess={() => {
            setIsLoginOpen(false);
            navigate('/checkout');
          }} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
