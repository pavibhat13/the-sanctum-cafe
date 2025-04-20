import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function InventoryAlert() {
  const { data: lowStockIngredients = [] } = useQuery({
    queryKey: ['/api/ingredients/low-stock']
  });
  
  if (!lowStockIngredients.length) return null;
  
  return (
    <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-800 font-medium">Low Inventory Alert</AlertTitle>
      <AlertDescription className="mt-1 text-amber-700">
        <span>{lowStockIngredients.length} {lowStockIngredients.length === 1 ? 'ingredient is' : 'ingredients are'} running low and {lowStockIngredients.length === 1 ? 'needs' : 'need'} to be restocked soon.</span>
        <div className="mt-2">
          <Link href="/admin/inventory">
            <Button 
              variant="outline" 
              size="sm"
              className="border-amber-300 bg-white hover:bg-amber-100 text-amber-700"
            >
              View Inventory
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}
