import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Loader2, Clock, User, MapPin, FileText, DollarSign } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Order, OrderItem } from '@shared/schema';

interface OrderDetailsProps {
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetails({ orderNumber, isOpen, onClose }: OrderDetailsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/orders/number/${orderNumber}`],
    enabled: isOpen
  });
  
  if (!isOpen) return null;
  
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  };
  
  const getOrderTypeDisplay = (orderType: string) => {
    switch (orderType) {
      case 'pickup':
        return <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> Pickup</span>;
      case 'delivery':
        return <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> Delivery</span>;
      case 'dine_in':
        return <span className="flex items-center"><User className="h-4 w-4 mr-1" /> Dine-in</span>;
      default:
        return orderType;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center justify-between">
            <span>Order #{orderNumber}</span>
            {!isLoading && data && <OrderStatusBadge status={data.order.status} />}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">
            Failed to load order details. Please try again.
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" /> {formatDate(data.order.createdAt)}
                </p>
                <p className="text-sm flex items-center font-medium">
                  {getOrderTypeDisplay(data.order.orderType)}
                </p>
                {data.order.scheduledFor && (
                  <p className="text-sm flex items-center">
                    <span className="font-medium mr-1">Scheduled for:</span> 
                    {formatDate(data.order.scheduledFor)}
                  </p>
                )}
                <p className="text-sm flex items-center">
                  <span className="font-medium mr-1">Payment:</span> 
                  <span className={
                    data.order.paymentStatus === 'paid' ? 'text-green-600' : 
                    data.order.paymentStatus === 'failed' ? 'text-red-600' : 
                    'text-orange-600'
                  }>
                    {data.order.paymentStatus.charAt(0).toUpperCase() + data.order.paymentStatus.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-1" /> Order Items
              </h3>
              <div className="bg-neutral-50 rounded-md overflow-hidden">
                <div className="p-3 space-y-2">
                  {data.items.map((item: OrderItem & { menuItem?: { name: string } }) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium text-sm mr-2">{item.quantity}×</span>
                        <span>{item.menuItem?.name || `Item #${item.menuItemId}`}</span>
                      </div>
                      <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3 bg-neutral-100">
                  <div className="flex justify-between font-medium">
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" /> Total
                    </span>
                    <span>${data.order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {data.order.specialInstructions && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Special Instructions:</h3>
                <div className="bg-neutral-50 p-3 rounded-md text-sm">
                  {data.order.specialInstructions}
                </div>
              </div>
            )}
          </>
        ) : null}
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
