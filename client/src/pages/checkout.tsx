import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ANALYTICS_EVENT, ORDER_STATUS, PAYMENT_STATUS } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CreditCard, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InsertOrder } from '@shared/schema';

const checkoutFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  scheduledFor: z.date().optional(),
  cardNumber: z.string().min(16, "Card number must be 16 digits"),
  expiryDate: z.string().min(5, "Expiry date is required"),
  cvv: z.string().min(3, "CVV must be 3 digits"),
  cardholderName: z.string().min(1, "Cardholder name is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { 
    items, 
    subtotal, 
    tax, 
    total, 
    orderType, 
    specialInstructions,
    clearCart 
  } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  
  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/cart');
    } else if (items.length === 0) {
      navigate('/menu');
    }
  }, [isAuthenticated, items.length, navigate]);
  
  // Form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: '',
      address: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    }
  });
  
  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) return;
    
    try {
      setIsSubmitting(true);
      
      // Generate a random letter for the order number
      const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const orderDate = new Date();
      
      // Create orderItems array
      const orderItems = items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        unitPrice: item.menuItem.price,
        specialRequests: item.specialRequests
      }));
      
      // Create order payload
      const orderPayload: InsertOrder = {
        userId: user?.id,
        orderNumber: `${randomLetter}${Math.floor(Math.random() * 1000)}`,
        status: ORDER_STATUS.NEW,
        orderType,
        totalAmount: total,
        paymentStatus: PAYMENT_STATUS.PAID,
        specialInstructions,
        scheduledFor: values.scheduledFor
      };
      
      // Submit order
      const orderResponse = await apiRequest('POST', '/api/orders', {
        ...orderPayload,
        items: orderItems
      });
      
      const orderData = await orderResponse.json();
      
      // Track checkout completion
      if (user) {
        try {
          await apiRequest('POST', '/api/analytics', {
            eventType: ANALYTICS_EVENT.CHECKOUT_COMPLETE,
            userId: user.id,
            data: { 
              orderId: orderData.id,
              orderNumber: orderData.orderNumber,
              totalAmount: total
            }
          });
        } catch (error) {
          console.error('Failed to track checkout completion:', error);
        }
      }
      
      // Clear the cart
      clearCart();
      
      // Invalidate orders query
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Navigate to order tracking page
      navigate(`/order/${orderData.orderNumber}`);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAuthenticated || items.length === 0) {
    return null;
  }
  
  return (
    <MainLayout 
      pageTitle="Checkout"
      pageDescription="Complete your order"
      hideNav={true}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-heading">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {orderType === 'delivery' && (
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter your full address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="scheduledFor"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Schedule for Later (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() ||
                                  date > new Date(new Date().setDate(new Date().getDate() + 7))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-heading font-semibold mb-4">Payment Information</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="1234 5678 9012 3456" 
                                  {...field} 
                                  onChange={(e) => {
                                    // Allow only digits and format with spaces
                                    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                    field.onChange(val);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="MM/YY" 
                                    {...field} 
                                    onChange={(e) => {
                                      // Format MM/YY
                                      const val = e.target.value.replace(/\D/g, '');
                                      if (val.length <= 2) {
                                        field.onChange(val);
                                      } else {
                                        field.onChange(val.substring(0, 2) + '/' + val.substring(2, 4));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="123" 
                                    type="password" 
                                    {...field} 
                                    onChange={(e) => {
                                      // Allow only digits and max 3 characters
                                      const val = e.target.value.replace(/\D/g, '').substring(0, 3);
                                      field.onChange(val);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="cardholderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Name on card" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Alert className="bg-neutral-50 border-neutral-200 mt-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>For Testing Purposes</AlertTitle>
                      <AlertDescription>
                        This is a demo application. No real payment processing is implemented.
                        Use any valid-looking credit card information.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary-dark"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>Processing Payment...</>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" /> Pay ${total.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-xl font-heading">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-0">
                <div className="space-y-4">
                  <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                    {items.map((item) => (
                      <div key={item.menuItem.id} className="flex justify-between text-sm pb-2 border-b">
                        <div className="flex-1">
                          <span className="font-medium">{item.quantity}×</span> {item.menuItem.name}
                        </div>
                        <div className="text-right ml-2">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="capitalize">{orderType.replace('_', ' ')} Order</span>
                    </div>
                    
                    {specialInstructions && (
                      <div>
                        <p className="text-gray-600 text-xs font-medium">Special Instructions:</p>
                        <p className="text-xs mt-1">{specialInstructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4 bg-gray-50">
                <div className="w-full text-center text-sm text-gray-500">
                  <p>Need help? Call us at (555) 123-4567</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
