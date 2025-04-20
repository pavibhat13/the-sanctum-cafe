import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, Plus, Search, Check, X, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Ingredient, insertIngredientSchema } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ingredientFormSchema = insertIngredientSchema.extend({
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number().min(1, "Threshold must be at least 1")
});

type IngredientFormValues = z.infer<typeof ingredientFormSchema>;

export default function AdminInventory() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: ingredients = [], isLoading } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
  });
  
  const { data: lowStockIngredients = [] } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients/low-stock'],
  });
  
  // Add new ingredient mutation
  const addIngredient = useMutation({
    mutationFn: async (data: IngredientFormValues) => {
      const response = await apiRequest('POST', '/api/ingredients', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients/low-stock'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Ingredient Added",
        description: "The ingredient has been added successfully.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Ingredient",
        description: "There was an error adding the ingredient. Please try again.",
        variant: "destructive",
      });
      console.error('Add error:', error);
    }
  });
  
  // Update ingredient stock mutation
  const updateStock = useMutation({
    mutationFn: async ({ ingredientId, quantity }: { ingredientId: number; quantity: number }) => {
      const response = await apiRequest('PATCH', `/api/ingredients/${ingredientId}/stock`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients/low-stock'] });
      setIsUpdateDialogOpen(false);
      setSelectedIngredient(null);
      toast({
        title: "Stock Updated",
        description: "The ingredient stock has been updated successfully.",
      });
      updateForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Stock",
        description: "There was an error updating the stock. Please try again.",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });
  
  // Add ingredient form
  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: '',
      stock: 0,
      unit: '',
      lowStockThreshold: 10
    }
  });
  
  // Update stock form
  const updateFormSchema = z.object({
    quantity: z.coerce.number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
  });
  
  const updateForm = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      quantity: 0
    }
  });
  
  const onSubmit = (values: IngredientFormValues) => {
    addIngredient.mutate(values);
  };
  
  const onUpdateSubmit = (values: z.infer<typeof updateFormSchema>) => {
    if (!selectedIngredient) return;
    updateStock.mutate({ ingredientId: selectedIngredient.id, quantity: values.quantity });
  };
  
  // Filter ingredients based on search query
  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <AdminLayout title="Inventory" subtitle="Manage and track your inventory">
      {/* Low Stock Alert */}
      {lowStockIngredients.length > 0 && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800 font-medium">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-amber-700">
            {lowStockIngredients.length} {lowStockIngredients.length === 1 ? 'ingredient is' : 'ingredients are'} running low and {lowStockIngredients.length === 1 ? 'needs' : 'need'} to be restocked soon.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Inventory Management Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-xl font-heading">Ingredients Inventory</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search ingredients"
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary-dark"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <Skeleton className="h-5 w-1/4" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIngredients.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell className="font-medium">{ingredient.name}</TableCell>
                      <TableCell>{ingredient.stock}</TableCell>
                      <TableCell>{ingredient.unit}</TableCell>
                      <TableCell>
                        {ingredient.stock <= ingredient.lowStockThreshold ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedIngredient(ingredient);
                            updateForm.setValue('quantity', 0);
                            setIsUpdateDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Update Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No ingredients found</h3>
              <p className="text-gray-500">
                {searchQuery ? "No ingredients match your search criteria." : "You don't have any ingredients in your inventory yet."}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Ingredient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">Add New Ingredient</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Coffee Beans" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. kg, liters, pieces" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark"
                  disabled={addIngredient.isPending}
                >
                  {addIngredient.isPending ? 'Adding...' : 'Add Ingredient'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Update Stock Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">
              Update Stock: {selectedIngredient?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedIngredient && (
            <div className="mb-4">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Current Stock:</span>
                <span className="font-medium">{selectedIngredient.stock} {selectedIngredient.unit}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Low Stock Threshold:</span>
                <span className="font-medium">{selectedIngredient.lowStockThreshold} {selectedIngredient.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={selectedIngredient.stock <= selectedIngredient.lowStockThreshold
                  ? "text-red-600 font-medium"
                  : "text-green-600 font-medium"
                }>
                  {selectedIngredient.stock <= selectedIngredient.lowStockThreshold
                    ? "Low Stock"
                    : "In Stock"
                  }
                </span>
              </div>
            </div>
          )}
          
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity to Add/Remove</FormLabel>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-r-none px-2"
                        onClick={() => updateForm.setValue('quantity', Math.max(field.value - 1, -selectedIngredient!.stock))}
                      >
                        -
                      </Button>
                      <FormControl>
                        <Input
                          type="number"
                          className="rounded-none text-center"
                          {...field}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            // Prevent stock from going below 0
                            if (isNaN(val) || val + selectedIngredient!.stock >= 0) {
                              field.onChange(e);
                            }
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-l-none px-2"
                        onClick={() => updateForm.setValue('quantity', field.value + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {field.value > 0 
                        ? `Adding ${field.value} ${selectedIngredient?.unit}` 
                        : field.value < 0 
                          ? `Removing ${Math.abs(field.value)} ${selectedIngredient?.unit}`
                          : 'No change'
                      }
                    </p>
                    <p className="text-sm font-medium mt-1">
                      New Stock: {selectedIngredient ? selectedIngredient.stock + field.value : 0} {selectedIngredient?.unit}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark"
                  disabled={updateStock.isPending || updateForm.getValues().quantity === 0}
                >
                  {updateStock.isPending ? 'Updating...' : 'Update Stock'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
