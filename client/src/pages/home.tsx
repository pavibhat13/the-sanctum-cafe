import { useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import { MenuCategory, MenuItem } from '@shared/schema';
import { AMBIANCE_IMAGES } from '@/lib/constants';
import { Coffee, ArrowRight, Utensils, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { ANALYTICS_EVENT } from '@/lib/constants';

export default function Home() {
  const { user } = useAuth();
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ['/api/menu/categories'],
  });
  
  const { data: featuredItems, isLoading: isItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu/items'],
  });
  
  // Track page view for analytics
  useEffect(() => {
    if (user) {
      const trackPageView = async () => {
        try {
          await apiRequest('POST', '/api/analytics', {
            eventType: ANALYTICS_EVENT.MENU_VIEW,
            userId: user.id,
            data: { page: 'home' }
          });
        } catch (error) {
          console.error('Failed to track page view:', error);
        }
      };
      
      trackPageView();
    }
  }, [user]);
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[70vh] min-h-[500px]" style={{ backgroundImage: `url(${AMBIANCE_IMAGES[0]})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white p-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 animate-fadeIn">
              Welcome to The Sanctum Café
            </h1>
            <p className="text-xl mb-6 max-w-xl mx-auto text-white/90">
              A cozy corner where every cup tells a story and every bite feels like home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button size="lg" className="bg-primary hover:bg-primary-dark">
                  <Coffee className="mr-2 h-5 w-5" /> Browse Menu
                </Button>
              </Link>
              <Link href="/order-history">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  <Clock className="mr-2 h-5 w-5" /> Track Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Menu Items */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-primary mb-2">Featured Items</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our chef's recommended creations, crafted with the finest ingredients for an unforgettable experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isItemsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-9 w-28" />
                  </CardContent>
                </Card>
              ))
            ) : featuredItems && featuredItems.length > 0 ? (
              featuredItems.slice(0, 3).map((item) => (
                <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="relative h-48">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading font-semibold text-lg">{item.name}</h3>
                      <span className="font-medium text-primary">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <Link href="/menu">
                      <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No featured items available
              </div>
            )}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/menu">
              <Button className="bg-primary hover:bg-primary-dark">
                View Full Menu <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Menu Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-primary mb-2">Explore Our Menu</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From freshly brewed coffees to delicious meals, we have something for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isCategoriesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))
            ) : categories && categories.length > 0 ? (
              categories.map((category) => (
                <Link key={category.id} href={`/menu#category-${category.id}`}>
                  <div className="cursor-pointer group">
                    <div className="bg-neutral-50 rounded-lg p-6 h-full transition-colors group-hover:bg-neutral-100 border border-neutral-200">
                      <h3 className="text-xl font-heading font-semibold text-primary mb-2 group-hover:text-primary-dark">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Explore our {category.name.toLowerCase()} selection
                      </p>
                      <Button variant="ghost" className="text-primary p-0 hover:text-primary-dark hover:bg-transparent">
                        Browse Category <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No categories available
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-heading font-bold text-primary mb-4">
                Our Story
              </h2>
              <p className="text-gray-700 mb-6">
                The Sanctum Café was born out of a passion for quality coffee and food in a welcoming space. We started as a small corner shop and have grown into a beloved community gathering place.
              </p>
              <p className="text-gray-700 mb-6">
                At The Sanctum, we believe in using only the finest, freshest ingredients in our food and beverages. Our coffee beans are ethically sourced and freshly roasted, and our menu items are carefully crafted to provide a delightful experience.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <Coffee className="h-8 w-8 text-primary mr-2" />
                  <div>
                    <h4 className="font-medium">Premium Coffee</h4>
                    <p className="text-sm text-gray-600">Freshly roasted beans</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Utensils className="h-8 w-8 text-primary mr-2" />
                  <div>
                    <h4 className="font-medium">Delicious Food</h4>
                    <p className="text-sm text-gray-600">Fresh ingredients</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={AMBIANCE_IMAGES[1]}
                  alt="Café Interior"
                  className="rounded-lg shadow-md h-40 md:h-64 object-cover w-full"
                />
                <img
                  src={AMBIANCE_IMAGES[2]}
                  alt="Café Ambiance"
                  className="rounded-lg shadow-md h-40 md:h-64 object-cover w-full mt-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
            Ready to Order? Visit Our Menu!
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-6">
            Browse our full selection and place your order for pickup or delivery.
          </p>
          <Link href="/menu">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Order Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
