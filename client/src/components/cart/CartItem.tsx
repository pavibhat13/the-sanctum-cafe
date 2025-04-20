import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  specialRequests?: string;
}

export default function CartItem({
  id,
  name,
  price,
  quantity,
  imageUrl,
  specialRequests
}: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  
  const handleIncrement = () => {
    updateQuantity(id, quantity + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      removeFromCart(id);
    }
  };
  
  return (
    <div className="flex items-start gap-3 py-4 border-b">
      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
        <img 
          src={imageUrl || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d'} 
          alt={name} 
          className="h-full w-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="font-medium text-gray-900 truncate">{name}</h3>
          <span className="font-medium text-primary">${(price * quantity).toFixed(2)}</span>
        </div>
        
        {specialRequests && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{specialRequests}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-full"
              onClick={handleDecrement}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="mx-2 min-w-[20px] text-center">{quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-full"
              onClick={handleIncrement}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 p-1 h-auto"
            onClick={() => removeFromCart(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
