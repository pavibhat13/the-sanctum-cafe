import { useQuery } from '@tanstack/react-query';
import MenuItem from './MenuItem';
import { Skeleton } from '@/components/ui/skeleton';
import { MenuCategory as MenuCategoryType, MenuItem as MenuItemType } from '@shared/schema';

interface MenuCategoryProps {
  category: MenuCategoryType;
}

export default function MenuCategory({ category }: MenuCategoryProps) {
  const { data: items, isLoading } = useQuery<MenuItemType[]>({
    queryKey: [`/api/menu/categories/${category.id}/items`],
  });
  
  return (
    <div id={`category-${category.id}`} className="py-6">
      <h2 className="text-2xl font-heading font-semibold text-primary mb-6 border-b pb-2">
        {category.name}
      </h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.filter(item => item.available).map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No items available in this category
        </div>
      )}
    </div>
  );
}
