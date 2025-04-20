import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, EyeIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Order, OrderItem } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import InventoryAlert from '@/components/admin/InventoryAlert';
import MetricsCard from '@/components/admin/MetricsCard';
import OrderDetails from '@/components/orders/OrderDetails';

export default function AdminOrders() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 15000, // Refetch every 15 seconds
  });
  
  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });
  
  // Filter orders based on tab
  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    return order.status === selectedTab;
  });
  
  // Count orders by status
  const orderCounts = {
    all: orders.length,
    new: orders.filter(order => order.status === 'new').length,
    cooking: orders.filter(order => order.status === 'cooking').length,
    ready: orders.filter(order => order.status === 'ready').length,
    completed: orders.filter(order => order.status === 'completed').length,
  };
  
  // Order metrics
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  });
  
  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0;
  
  // Handle order status updates
  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };
  
  return (
    <AdminLayout title="Orders" subtitle="Manage your incoming and active orders">
      {/* Inventory Alert */}
      <InventoryAlert />
      
      {/* Performance Metrics */}
      <div className="mt-6">
        <h2 className="text-xl font-heading font-bold text-primary mb-4">Today's Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Orders"
            value={todayOrders.length}
            subtitle="orders today"
            change={{ value: 12, positive: true }}
          />
          <MetricsCard
            title="Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            subtitle="today"
            change={{ value: 8, positive: true }}
          />
          <MetricsCard
            title="Avg Order Value"
            value={`$${avgOrderValue.toFixed(2)}`}
            subtitle="per order"
            change={{ value: 3, positive: true }}
          />
          <MetricsCard
            title="Avg Prep Time"
            value="12min"
            subtitle="per order"
            change={{ value: 2, positive: false }}
          />
        </div>
      </div>
      
      {/* Order Tabs */}
      <div className="mb-6 mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full justify-start overflow-x-auto py-1 px-1 bg-white border-b">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              All Orders
              <Badge variant="secondary" className="ml-2">{orderCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              New
              <Badge variant="secondary" className="ml-2">{orderCounts.new}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cooking" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Cooking
              <Badge variant="secondary" className="ml-2">{orderCounts.cooking}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ready" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Ready
              <Badge variant="secondary" className="ml-2">{orderCounts.ready}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">
              Completed
              <Badge variant="secondary" className="ml-2">{orderCounts.completed}</Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* Filter and New Order buttons */}
          <div className="flex items-center space-x-3 p-3 border-b">
            <Button variant="outline" className="text-gray-600 border-gray-300">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button className="bg-primary text-white hover:bg-primary-dark">
              + New Order
            </Button>
          </div>
          
          <TabsContent value={selectedTab} className="p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className={`overflow-hidden border-l-4 ${
                    order.status === 'new' ? 'border-blue-500' : 
                    order.status === 'cooking' ? 'border-orange-500' : 
                    order.status === 'ready' ? 'border-green-500' : 
                    'border-gray-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-heading font-semibold">#{order.orderNumber}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'cooking' ? 'bg-orange-100 text-orange-800' : 
                          order.status === 'ready' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Customer:</span>
                          <span>{order.userId ? `User #${order.userId}` : 'Guest'}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Type:</span>
                          <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Total:</span>
                          <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex space-x-2">
                          {order.status === 'new' && (
                            <Button 
                              className="flex-1 py-2 bg-primary text-white hover:bg-primary-dark text-sm font-medium"
                              onClick={() => handleUpdateStatus(order.id, 'cooking')}
                              disabled={updateOrderStatus.isPending}
                            >
                              Accept
                            </Button>
                          )}
                          
                          {order.status === 'cooking' && (
                            <Button 
                              className="flex-1 py-2 bg-green-500 text-white hover:bg-green-600 text-sm font-medium"
                              onClick={() => handleUpdateStatus(order.id, 'ready')}
                              disabled={updateOrderStatus.isPending}
                            >
                              Mark Ready
                            </Button>
                          )}
                          
                          {order.status === 'ready' && (
                            <Button 
                              className="flex-1 py-2 bg-gray-500 text-white hover:bg-gray-600 text-sm font-medium"
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              disabled={updateOrderStatus.isPending}
                            >
                              Complete
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setSelectedOrder(order.orderNumber)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <h3 className="text-xl font-heading font-semibold mb-2">No Orders Found</h3>
                <p className="text-gray-600">
                  {selectedTab === 'all' 
                    ? "There are no orders in the system yet." 
                    : `There are no orders with "${selectedTab}" status.`}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <OrderDetails 
          orderNumber={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </AdminLayout>
  );
}
