import { useState } from 'react';
import { Plus, Minus, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Textarea } from '@/components/ui/textarea';
import { MenuItem as MenuItemType } from '@shared/schema';

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({ item }: MenuItemProps) {
  const { addToCart } = useCart();
  const [showDetails, setShowDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(item, quantity, specialRequests || undefined);
    setQuantity(1);
    setSpecialRequests('');
    setShowDetails(false);
  };
  
  return (
    <>
      <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
        <div className="relative pb-[60%]">
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d'}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-heading font-semibold text-lg">{item.name}</h3>
            <span className="font-medium text-primary">${item.price.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.description}</p>
          <div className="flex justify-between items-center mt-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-primary border-primary hover:bg-primary hover:text-white"
              onClick={() => setShowDetails(true)}
            >
              <Info className="h-4 w-4 mr-1" /> Details
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => addToCart(item, 1)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="font-heading text-xl">{item.name}</DialogTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-md overflow-hidden">
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d'}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div>
              <DialogDescription className="text-base font-normal text-gray-700">
                {item.description}
              </DialogDescription>
              
              <div className="mt-4">
                <h4 className="font-medium mb-1">Ingredients:</h4>
                <div className="flex flex-wrap gap-1">
                  {item.ingredients && item.ingredients.map((ingredient, idx) => (
                    <Badge key={idx} variant="outline" className="bg-neutral-50">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-1">Price:</h4>
                <span className="text-xl font-semibold text-primary">${item.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Special Requests:</h4>
            <Textarea 
              placeholder="Any special requests? (allergies, preferences, etc.)"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={incrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                className="bg-primary hover:bg-primary-dark"
                onClick={handleAddToCart}
              >
                Add to Cart - ${(item.price * quantity).toFixed(2)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
