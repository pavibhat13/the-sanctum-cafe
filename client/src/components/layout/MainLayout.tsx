import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { 
  ShoppingBag, 
  Coffee, 
  HomeIcon, 
  History, 
  User, 
  LogOut, 
  LogIn, 
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import PhoneAuthForm from '../auth/PhoneAuthForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface MainLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  hideNav?: boolean;
}

export default function MainLayout({ 
  children, 
  pageTitle = "The Sanctum Café", 
  pageDescription,
  hideNav = false
}: MainLayoutProps) {
  const [location] = useLocation();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon className="h-5 w-5" /> },
    { label: 'Menu', path: '/menu', icon: <Coffee className="h-5 w-5" /> },
    { 
      label: 'Cart', 
      path: '/cart', 
      icon: <ShoppingBag className="h-5 w-5" />,
      badge: totalItems > 0 ? totalItems : undefined
    },
    { 
      label: 'Orders', 
      path: '/order-history', 
      icon: <History className="h-5 w-5" />,
      requireAuth: true
    }
  ];
  
  const adminLink = isAdmin ? { 
    label: 'Admin', 
    path: '/admin', 
    icon: <span className="text-xs font-semibold">ADMIN</span> 
  } : null;
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
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
            <Link href="/">
              <a className="font-heading font-bold text-xl md:text-2xl cursor-pointer">
                The Sanctum Café
              </a>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {adminLink && (
              <Link href={adminLink.path}>
                <a className="hidden md:flex items-center px-3 py-1.5 bg-primary-dark rounded-md text-white hover:bg-opacity-90 text-sm">
                  {adminLink.icon}
                </a>
              </Link>
            )}
            
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-primary-dark">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-[260px] bg-primary text-white">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-primary-dark flex justify-between items-center">
                      <h2 className="font-heading font-semibold text-lg">Menu</h2>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-primary-dark"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <nav className="flex-1 overflow-auto py-2">
                      <ul className="space-y-1">
                        {navItems.map((item, idx) => {
                          // Skip items that require authentication if user is not authenticated
                          if (item.requireAuth && !isAuthenticated) return null;
                          
                          return (
                            <li key={idx}>
                              <Link href={item.path}>
                                <a 
                                  className={`flex items-center px-4 py-3 hover:bg-primary-dark ${
                                    location === item.path ? 'bg-primary-dark' : ''
                                  }`}
                                  onClick={closeMobileMenu}
                                >
                                  <span className="mr-3">{item.icon}</span>
                                  {item.label}
                                  {item.badge && (
                                    <Badge variant="secondary" className="ml-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </a>
                              </Link>
                            </li>
                          );
                        })}
                        
                        {adminLink && (
                          <li>
                            <Link href={adminLink.path}>
                              <a 
                                className="flex items-center px-4 py-3 hover:bg-primary-dark"
                                onClick={closeMobileMenu}
                              >
                                <span className="mr-3">{adminLink.icon}</span>
                                {adminLink.label}
                              </a>
                            </Link>
                          </li>
                        )}
                      </ul>
                    </nav>
                    <div className="p-4 border-t border-primary-dark">
                      {isAuthenticated ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 bg-primary-dark text-white">
                              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                            </Avatar>
                            <span className="ml-2 text-sm font-medium">{user?.name || 'Guest'}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              logout();
                              closeMobileMenu();
                            }}
                            className="text-white hover:bg-primary-dark"
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Logout
                          </Button>
                        </div>
                      ) : (
                        <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full bg-primary-dark hover:bg-opacity-80"
                              onClick={() => closeMobileMenu()}
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              Sign In
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <PhoneAuthForm onSuccess={() => setIsAuthOpen(false)} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {!hideNav && navItems.map((item, idx) => {
                if (item.requireAuth && !isAuthenticated) return null;
                
                return (
                  <Link key={idx} href={item.path}>
                    <a 
                      className={`flex items-center px-3 py-1.5 rounded-md text-white hover:bg-primary-dark relative ${
                        location === item.path ? 'bg-primary-dark' : ''
                      }`}
                    >
                      <span className="mr-1">{item.icon}</span>
                      <span className="hidden lg:inline">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                );
              })}
            </div>
            
            <div className="hidden md:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-primary-dark">
                      <Avatar className="h-7 w-7 bg-primary-dark">
                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 hidden lg:inline-block">{user?.name || 'Guest'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <History className="mr-2 h-4 w-4" />
                      <span>Order History</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href="/admin">
                            <a className="flex items-center w-full">
                              <span className="text-xs font-semibold mr-2">ADMIN</span>
                              Dashboard
                            </a>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost"
                      className="text-white hover:bg-primary-dark"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <PhoneAuthForm onSuccess={() => setIsAuthOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Page Title */}
      {(pageTitle || pageDescription) && (
        <div className="bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGNhZmV8ZW58MHx8MHx8&w=1400&q=80')] bg-cover bg-center">
          <div className="bg-black bg-opacity-50 py-6 md:py-12">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-2xl md:text-4xl font-heading font-bold text-white mb-2">
                {pageTitle}
              </h1>
              {pageDescription && (
                <p className="text-white/80 max-w-2xl mx-auto">
                  {pageDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-primary-dark text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-heading font-bold text-lg mb-3">The Sanctum Café</h3>
              <p className="text-white/70 text-sm">
                A cozy corner where every cup tells a story and every bite feels like home.
              </p>
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg mb-3">Hours</h3>
              <ul className="text-white/70 text-sm space-y-1">
                <li>Monday - Friday: 7am - 8pm</li>
                <li>Saturday: 8am - 9pm</li>
                <li>Sunday: 8am - 6pm</li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg mb-3">Contact</h3>
              <ul className="text-white/70 text-sm space-y-1">
                <li>123 Cafe Street, Coffeetown</li>
                <li>Phone: (555) 123-4567</li>
                <li>Email: hello@thesanctumcafe.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/20 text-center text-white/50 text-sm">
            &copy; {new Date().getFullYear()} The Sanctum Café. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
