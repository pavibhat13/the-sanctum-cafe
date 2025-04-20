import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Search, Eye, Coffee, Sandwich } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { 
  MenuItem, 
  insertMenuItemSchema, 
  MenuCategory, 
  insertMenuCategorySchema,
  Ingredient
} from '@shared/schema';
import { FOOD_IMAGES } from '@/lib/constants';

const menuItemFormSchema = insertMenuItemSchema.extend({
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  categoryId: z.coerce.number({ required_error: "Category is required" }),
  ingredients: z.array(z.string()).optional()
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

const categoryFormSchema = insertMenuCategorySchema.extend({
  displayOrder: z.coerce.number().min(0, "Display order cannot be negative")
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function MenuManagement() {
  const [activeTab, setActiveTab] = useState('items');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  
  // Fetch menu items
  const { data: menuItems = [], isLoading: isItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu/items'],
  });
  
  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ['/api/menu/categories'],
  });
  
  // Fetch ingredients for selection
  const { data: ingredients = [] } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
  });
  
  // Add/update menu item mutation
  const mutateMenuItem = useMutation({
    mutationFn: async ({ item, isEdit }: { item: MenuItemFormValues; isEdit: boolean }) => {
      const url = isEdit ? `/api/menu/items/${selectedItem?.id}` : '/api/menu/items';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await apiRequest(method, url, item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu/items'] });
      setIsItemDialogOpen(false);
      setSelectedItem(null);
      setIsEditMode(false);
      toast({
        title: isEditMode ? "Menu Item Updated" : "Menu Item Added",
        description: isEditMode 
          ? "The menu item has been updated successfully." 
          : "The menu item has been added successfully.",
      });
      itemForm.reset();
    },
    onError: (error) => {
      toast({
        title: isEditMode ? "Failed to Update Menu Item" : "Failed to Add Menu Item",
        description: "There was an error. Please try again.",
        variant: "destructive",
      });
      console.error('Mutation error:', error);
    }
  });
  
  // Add/update category mutation
  const mutateCategory = useMutation({
    mutationFn: async (category: CategoryFormValues) => {
      const response = await apiRequest('POST', '/api/menu/categories', category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu/categories'] });
      setIsCategoryDialogOpen(false);
      toast({
        title: "Category Added",
        description: "The category has been added successfully.",
      });
      categoryForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Category",
        description: "There was an error adding the category. Please try again.",
        variant: "destructive",
      });
      console.error('Category error:', error);
    }
  });
  
  // Menu item form
  const itemForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      categoryId: undefined,
      imageUrl: '',
      ingredients: [],
      available: true
    }
  });
  
  // Category form
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      displayOrder: 0
    }
  });
  
  const onItemSubmit = (values: MenuItemFormValues) => {
    mutateMenuItem.mutate({ item: values, isEdit });
  };
  
  const onCategorySubmit = (values: CategoryFormValues) => {
    mutateCategory.mutate(values);
  };
  
  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsEditMode(true);
    
    itemForm.reset({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      ingredients: item.ingredients || [],
      available: item.available
    });
    
    setIsItemDialogOpen(true);
  };
  
  const handleAddItem = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    itemForm.reset({
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id,
      imageUrl: '',
      ingredients: [],
      available: true
    });
    setIsItemDialogOpen(true);
  };
  
  // Filter menu items based on search query
  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Get category name by id
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };
  
  return (
    <AdminLayout title="Menu Management" subtitle="Manage your menu items and categories">
      <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 mb-6">
          <TabsList>
            <TabsTrigger value="items" className="px-4">
              <Coffee className="h-4 w-4 mr-2" /> Menu Items
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-4">
              <Sandwich className="h-4 w-4 mr-2" /> Categories
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {activeTab === 'items' && (
              <>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search menu items"
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddItem}
                  className="bg-primary hover:bg-primary-dark whitespace-nowrap"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </>
            )}
            
            {activeTab === 'categories' && (
              <Button 
                onClick={() => setIsCategoryDialogOpen(true)}
                className="bg-primary hover:bg-primary-dark"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            )}
          </div>
        </div>
        
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-heading">Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              {isItemsLoading || isCategoriesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-lg" />
                  ))}
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative h-40">
                        <img
                          src={item.imageUrl || FOOD_IMAGES[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {!item.available && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <Badge variant="outline" className="bg-white text-red-600 px-3 py-1">
                              Unavailable
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-heading font-semibold">{item.name}</h3>
                            <p className="text-xs text-gray-500">
                              {getCategoryName(item.categoryId)}
                            </p>
                          </div>
                          <span className="font-medium text-primary">${item.price.toFixed(2)}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {item.description || 'No description available'}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {item.ingredients ? `${item.ingredients.length} ingredients` : 'No ingredients'}
                          </Badge>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="p-1 h-8 w-8"
                              onClick={() => {}}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="p-1 h-8 w-8"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No menu items found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? "No items match your search criteria." : "You don't have any menu items yet."}
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
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-heading">Menu Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {isCategoriesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <div className="space-y-3">
                  {categories
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((category) => (
                      <div 
                        key={category.id} 
                        className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-xs text-gray-500">Display Order: {category.displayOrder}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {menuItems.filter(item => item.categoryId === category.id).length} items
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="p-1 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
                  <p className="text-gray-500">
                    You don't have any menu categories yet. Add one to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Menu Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">
              {isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Cappuccino" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={itemForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={itemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the menu item..." 
                        {...field} 
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={itemForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={itemForm.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-neutral-50 min-h-20">
                        {field.value && field.value.length > 0 ? (
                          field.value.map((ingredient, idx) => (
                            <Badge key={idx} variant="secondary" className="px-2 py-1">
                              {ingredient}
                              <button
                                type="button"
                                className="ml-1 text-gray-500 hover:text-gray-800"
                                onClick={() => {
                                  const newIngredients = [...field.value!];
                                  newIngredients.splice(idx, 1);
                                  field.onChange(newIngredients);
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm p-2">No ingredients selected</div>
                        )}
                      </div>
                      
                      <Select 
                        onValueChange={(value) => {
                          if (!field.value || !field.value.includes(value)) {
                            field.onChange([...(field.value || []), value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add an ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ingredient) => (
                            <SelectItem 
                              key={ingredient.id} 
                              value={ingredient.name}
                              disabled={field.value?.includes(ingredient.name)}
                            >
                              {ingredient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={itemForm.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Available</FormLabel>
                      <p className="text-sm text-gray-500">
                        Mark this item as available for ordering
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsItemDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark"
                  disabled={mutateMenuItem.isPending}
                >
                  {mutateMenuItem.isPending 
                    ? (isEditMode ? 'Updating...' : 'Adding...') 
                    : (isEditMode ? 'Update Item' : 'Add Item')
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">Add New Category</DialogTitle>
          </DialogHeader>
          
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Coffee, Desserts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={categoryForm.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        placeholder="Lower numbers appear first"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark"
                  disabled={mutateCategory.isPending}
                >
                  {mutateCategory.isPending ? 'Adding...' : 'Add Category'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
