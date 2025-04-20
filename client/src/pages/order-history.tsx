import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Coffee, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import PhoneAuthForm from '@/components/auth/PhoneAuthForm';
import OrderCard from '@/components/orders/OrderCard';
import { Order } from '@shared/schema';
import { ORDER_STATUS } from '@/lib/constants';

export default function OrderHistory() {
  const { user, isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  
  const { data: orders, isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: user ? [`/api/users/${user.id}/orders`] : null,
    enabled: !!user,
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      // Show login prompt if not authenticated
      setIsLoginOpen(true);
    }
  }, [isAuthenticated]);
  
  const activeOrders = orders?.filter(order => 
    ['new', 'cooking', 'ready'].includes(order.status)
  ) || [];
  
  const completedOrders = orders?.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  ) || [];
  
  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
    refetch();
    toast({
      title: "Logged in successfully",
      description: "Now you can view your order history."
    });
  };
  
  if (!isAuthenticated) {
    return (
      <MainLayout
        pageTitle="Order History"
        pageDescription="Track your current and past orders"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              Sign in to View Orders
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view your order history and track your current orders.
            </p>
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent>
                <PhoneAuthForm onSuccess={handleLoginSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout
      pageTitle="Order History"
      pageDescription="Track your current and past orders"
    >
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="active" className="relative">
                Active Orders
                {activeOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Completed Orders</TabsTrigger>
            </TabsList>
            
            <Link href="/menu">
              <Button variant="outline" className="text-primary border-primary">
                <Coffee className="mr-2 h-4 w-4" /> Order More
              </Button>
            </Link>
          </div>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold mb-2">Error Loading Orders</h3>
                <p className="text-gray-600">We couldn't load your orders. Please try again later.</p>
                <Button onClick={() => refetch()} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : activeOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Coffee className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold mb-2">No Active Orders</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any active orders at the moment.
                </p>
                <Link href="/menu">
                  <Button className="bg-primary hover:bg-primary-dark">
                    Place an Order
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold mb-2">Error Loading Orders</h3>
                <p className="text-gray-600">We couldn't load your orders. Please try again later.</p>
                <Button onClick={() => refetch()} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : completedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Coffee className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold mb-2">No Order History</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any completed orders yet.
                </p>
                <Link href="/menu">
                  <Button className="bg-primary hover:bg-primary-dark">
                    Place Your First Order
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
