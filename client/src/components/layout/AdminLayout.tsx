import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Coffee, 
  ShoppingBasket, 
  Package, 
  BarChart4, 
  Settings,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if admin
  useEffect(() => {
    // Only redirect if we have loaded the user data and they're not an admin
    if (user !== null && !user.isAdmin) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);
  
  // Get low stock count for badge
  const { data: lowStockIngredients = [] } = useQuery<any[]>({
    queryKey: ['/api/ingredients/low-stock'],
    enabled: !!user?.isAdmin
  });
  
  const navItems = [
    { label: 'Orders', path: '/admin/orders', icon: <ShoppingBasket className="h-5 w-5" /> },
    { 
      label: 'Inventory', 
      path: '/admin/inventory', 
      icon: <Package className="h-5 w-5" />,
      badge: lowStockIngredients.length || undefined
    },
    { label: 'Menu', path: '/admin/menu', icon: <Coffee className="h-5 w-5" /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart4 className="h-5 w-5" /> }
  ];
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-primary shadow-md text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin">
              <a className="font-heading font-bold text-xl md:text-2xl cursor-pointer flex items-center">
                <span className="hidden md:inline">The Sanctum Café</span>
                <span className="md:hidden">Admin</span>
                <Badge variant="outline" className="ml-2 text-xs font-normal">Admin</Badge>
              </a>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary-dark relative">
              <Bell className="h-5 w-5" />
              {lowStockIngredients.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-primary-dark"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <MenuIcon className="h-6 w-6" />
              </Button>
            </div>
            
            {/* User Menu */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-primary-dark">
                    <Avatar className="h-7 w-7 bg-primary-dark">
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 hidden md:inline-block">{user?.name || 'Admin'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/">
                      <a className="flex items-center w-full">
                        <Coffee className="mr-2 h-4 w-4" />
                        Customer View
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[260px] bg-white">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-heading font-semibold text-lg text-primary">Admin Menu</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-auto py-2">
              <ul className="space-y-1">
                {navItems.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.path}>
                      <a 
                        className={`flex items-center px-4 py-3 ${
                          location === item.path 
                            ? 'bg-neutral-100 text-primary font-medium' 
                            : 'text-gray-700 hover:bg-neutral-50'
                        }`}
                        onClick={closeMobileMenu}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                        {item.badge && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t">
              <Link href="/">
                <a 
                  className="flex items-center text-primary hover:underline"
                  onClick={closeMobileMenu}
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Switch to Customer View
                </a>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="w-16 lg:w-64 hidden md:block bg-white shadow-lg">
          <nav className="py-4 lg:py-6">
            <ul>
              {navItems.map((item, idx) => (
                <li key={idx} className="mb-1">
                  <Link href={item.path}>
                    <a className={`flex items-center px-3 py-3 lg:px-6 rounded-r-full ${
                      location === item.path 
                        ? 'bg-neutral-100 text-primary font-medium' 
                        : 'text-gray-700 hover:bg-neutral-50'
                    }`}>
                      <span className="text-xl">{item.icon}</span>
                      <span className="ml-3 hidden lg:inline">{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto hidden lg:flex">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            
            <Separator className="my-6" />
            
            <ul>
              <li className="mb-1">
                <Link href="/">
                  <a className="flex items-center px-3 py-3 lg:px-6 text-gray-700 hover:bg-neutral-50 rounded-r-full">
                    <span className="text-xl"><Coffee className="h-5 w-5" /></span>
                    <span className="ml-3 hidden lg:inline">Customer View</span>
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">{title}</h1>
              {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          
          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
