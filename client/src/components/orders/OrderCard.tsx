import { Clock, ArrowRight, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Order } from '@shared/schema';
import OrderStatusBadge from './OrderStatusBadge';
import { useState } from 'react';
import OrderDetails from './OrderDetails';

interface OrderCardProps {
  order: Order;
  isAdmin?: boolean;
  onUpdateStatus?: (orderId: number, status: string) => Promise<void>;
}

export default function OrderCard({ order, isAdmin = false, onUpdateStatus }: OrderCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, h:mm a');
  };
  
  const getOrderTypeIcon = () => {
    switch (order.orderType) {
      case 'pickup':
        return <span className="flex items-center text-orange-600"><MapPin className="h-4 w-4 mr-1" /> Pickup</span>;
      case 'delivery':
        return <span className="flex items-center text-blue-600"><ArrowRight className="h-4 w-4 mr-1" /> Delivery</span>;
      case 'dine_in':
        return <span className="flex items-center text-green-600"><User className="h-4 w-4 mr-1" /> Dine-in</span>;
      default:
        return null;
    }
  };
  
  const getNextStatus = () => {
    switch (order.status) {
      case 'new':
        return { value: 'cooking', label: 'Start Cooking' };
      case 'cooking':
        return { value: 'ready', label: 'Mark Ready' };
      case 'ready':
        return { value: 'completed', label: 'Complete Order' };
      default:
        return null;
    }
  };
  
  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus || !onUpdateStatus) return;
    
    try {
      setIsUpdating(true);
      await onUpdateStatus(order.id, nextStatus.value);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const nextStatus = getNextStatus();
  
  return (
    <>
      <Card className={`overflow-hidden border-l-4 ${
        order.status === 'new' ? 'border-blue-500' : 
        order.status === 'cooking' ? 'border-orange-500' : 
        order.status === 'ready' ? 'border-green-500' : 
        'border-gray-500'
      }`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-heading font-semibold">#{order.orderNumber}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" /> {formatDate(order.createdAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          
          <div className="space-y-1 text-sm mb-4">
            {!isAdmin && (
              <div className="flex justify-between">
                <span className="font-medium">Order Number:</span>
                <span>{order.orderNumber}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span>{getOrderTypeIcon()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Payment:</span>
              <span className={`
                ${order.paymentStatus === 'paid' ? 'text-green-600' : 
                  order.paymentStatus === 'failed' ? 'text-red-600' : 'text-orange-600'}
              `}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="border-t pt-3 flex">
            {isAdmin && nextStatus ? (
              <Button 
                className="flex-1 py-2 bg-primary text-white hover:bg-primary-dark text-sm font-medium"
                onClick={handleStatusUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? 'Processing...' : nextStatus.label}
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => setIsDetailsOpen(true)}
              >
                Order Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <OrderDetails 
        orderNumber={order.orderNumber}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
