import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, Clock, Coffee, Home, Mail, Phone, Truck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { Order, OrderItem } from '@shared/schema';

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const [progressValue, setProgressValue] = useState(0);
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/orders/number/${orderNumber}`],
    refetchInterval: 10000, // Refetch every 10 seconds to get status updates
  });
  
  useEffect(() => {
    if (data?.order) {
      const { status } = data.order;
      if (status === 'new') setProgressValue(25);
      else if (status === 'cooking') setProgressValue(50);
      else if (status === 'ready') setProgressValue(75);
      else if (status === 'completed') setProgressValue(100);
    }
  }, [data]);
  
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'new':
        return 1;
      case 'cooking':
        return 2;
      case 'ready':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };
  
  const getEstimatedTime = (status: string) => {
    switch (status) {
      case 'new':
        return '15-20 minutes';
      case 'cooking':
        return '10-15 minutes';
      case 'ready':
        return 'Ready for pickup!';
      case 'completed':
        return 'Order completed';
      default:
        return 'Calculating...';
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout pageTitle="Order Tracking">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-24 w-full mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (error || !data) {
    return (
      <MainLayout pageTitle="Order Tracking">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <Card>
              <CardContent className="pt-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
                  Order Not Found
                </h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find an order with the number {orderNumber}.
                  Please check if the order number is correct.
                </p>
                <Link href="/menu">
                  <Button className="bg-primary hover:bg-primary-dark">
                    <Coffee className="mr-2 h-4 w-4" /> Go to Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const { order, items } = data;
  const statusStep = getStatusStep(order.status);
  
  return (
    <MainLayout pageTitle="Order Tracking">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-800">
                    Order #{order.orderNumber}
                  </h2>
                  <p className="text-gray-500">
                    Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')} at {format(new Date(order.createdAt), 'h:mm a')}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              
              <div className="mb-8">
                <p className="text-gray-700 mb-2">Estimated time: <span className="font-medium">{getEstimatedTime(order.status)}</span></p>
                <Progress value={progressValue} className="h-2" />
                
                <div className="grid grid-cols-4 gap-1 mt-2 text-xs">
                  <div className={`text-center ${statusStep >= 1 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                    Received
                  </div>
                  <div className={`text-center ${statusStep >= 2 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                    Preparing
                  </div>
                  <div className={`text-center ${statusStep >= 3 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                    Ready
                  </div>
                  <div className={`text-center ${statusStep >= 4 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                    Completed
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading font-semibold text-gray-800 mb-3">
                    Order Details
                  </h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Order Type:</span>
                        <span className="font-medium capitalize">{order.orderType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`font-medium ${
                          order.paymentStatus === 'paid' ? 'text-green-600' :
                          order.paymentStatus === 'failed' ? 'text-red-600' : 'text-orange-500'
                        }`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                      {order.scheduledFor && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Scheduled For:</span>
                          <span className="font-medium">
                            {format(new Date(order.scheduledFor), 'MMMM d, h:mm a')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {order.specialInstructions && (
                    <div className="mt-4">
                      <h3 className="font-heading font-semibold text-gray-800 mb-2">
                        Special Instructions
                      </h3>
                      <div className="bg-neutral-50 rounded-lg p-4 text-sm">
                        {order.specialInstructions}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-heading font-semibold text-gray-800 mb-3">
                    Order Items
                  </h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="space-y-3 mb-3">
                      {items.map((item: OrderItem & { menuItem?: { name: string } }) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium">{item.quantity}×</span> {item.menuItem?.name || `Item #${item.menuItemId}`}
                            {item.specialRequests && (
                              <p className="text-xs text-gray-500 mt-0.5">{item.specialRequests}</p>
                            )}
                          </div>
                          <div className="text-right ml-2 font-medium">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-4 items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> Track your order status in real-time
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/menu">
                  <Button variant="outline">Order More</Button>
                </Link>
                <Link href="/order-history">
                  <Button className="bg-primary hover:bg-primary-dark">
                    <Check className="mr-2 h-4 w-4" /> My Orders
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center">
                <Phone className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h3 className="font-heading font-semibold text-sm">Phone</h3>
                  <p className="text-sm text-gray-600">(555) 123-4567</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center">
                <Mail className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h3 className="font-heading font-semibold text-sm">Email</h3>
                  <p className="text-sm text-gray-600">hello@thesanctumcafe.com</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center">
                <Home className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h3 className="font-heading font-semibold text-sm">Location</h3>
                  <p className="text-sm text-gray-600">123 Cafe Street, Coffeetown</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
