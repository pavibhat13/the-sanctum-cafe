import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import MenuCategory from '@/components/menu/MenuCategory';
import { MenuCategory as MenuCategoryType } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { ANALYTICS_EVENT } from '@/lib/constants';

export default function Menu() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const { data: categories, isLoading } = useQuery<MenuCategoryType[]>({
    queryKey: ['/api/menu/categories'],
  });
  
  // Track page view for analytics
  useEffect(() => {
    if (user) {
      const trackPageView = async () => {
        try {
          await apiRequest('POST', '/api/analytics', {
            eventType: ANALYTICS_EVENT.MENU_VIEW,
            userId: user.id,
            data: { page: 'menu' }
          });
        } catch (error) {
          console.error('Failed to track page view:', error);
        }
      };
      
      trackPageView();
    }
  }, [user]);
  
  // Scroll to category section when tab is clicked
  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const yOffset = -100; // Header offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  
  return (
    <MainLayout
      pageTitle="Our Menu"
      pageDescription="Explore our carefully crafted selection of beverages and food items"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="sticky top-16 z-10 bg-white pb-4 pt-2 border-b shadow-sm">
          <Tabs value={activeCategory} onValueChange={scrollToCategory}>
            <TabsList className="w-full justify-start overflow-x-auto py-1">
              <TabsTrigger value="all">All Items</TabsTrigger>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TabsTrigger key={i} value={`loading-${i}`} disabled>
                    <Skeleton className="h-4 w-20" />
                  </TabsTrigger>
                ))
              ) : (
                categories?.map((category) => (
                  <TabsTrigger key={category.id} value={category.id.toString()}>
                    {category.name}
                  </TabsTrigger>
                ))
              )}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Menu Categories */}
        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-12">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-40 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-80 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            categories.map((category) => (
              <MenuCategory key={category.id} category={category} />
            ))
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl text-gray-500">No menu categories available</h3>
              <p className="text-gray-400 mt-2">Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
