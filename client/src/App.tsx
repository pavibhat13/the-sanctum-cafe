import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import NotFound from "@/pages/not-found";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";

// Customer pages
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import OrderTracking from "@/pages/order-tracking";
import OrderHistory from "@/pages/order-history";

// Admin pages
import AdminOrders from "@/pages/admin/orders";
import AdminInventory from "@/pages/admin/inventory";
import AdminMenuManagement from "@/pages/admin/menu-management";
import AdminAnalytics from "@/pages/admin/analytics";

function Router() {
  console.log("AdminProtectedRoute exists:", typeof AdminProtectedRoute === 'function');
  
  return (
    <Switch>
      {/* Customer-facing routes */}
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order/:orderNumber" component={OrderTracking} />
      <Route path="/order-history" component={OrderHistory} />
      
      {/* Admin routes - simplified for debugging */}
      <Route path="/admin/inventory">
        {() => {
          console.log("In /admin/inventory route handler");
          return (
            <div>
              {/* <h1>Admin Access Check</h1> */}
              <AdminProtectedRoute>
                <div>
                  {/* <h2>Admin Inventory Page</h2> */}
                  <AdminInventory />
                </div>
              </AdminProtectedRoute>
            </div>
          );
        }}
      </Route>
      
      <Route path="/admin">
        {() => {
          console.log("In /admin route handler");
          return (
            <AdminProtectedRoute>
              <AdminOrders />
            </AdminProtectedRoute>
          );
        }}
      </Route>
      
      <Route path="/admin/orders">
        {() => {
          console.log("In /admin/orders route handler");
          return (
            <AdminProtectedRoute>
              <AdminOrders />
            </AdminProtectedRoute>
          );
        }}
      </Route>
      
      <Route path="/admin/menu">
        {() => {
          console.log("In /admin/menu route handler");
          return (
            <AdminProtectedRoute>
              <AdminMenuManagement />
            </AdminProtectedRoute>
          );
        }}
      </Route>
      
      <Route path="/admin/analytics">
        {() => {
          console.log("In /admin/analytics route handler");
          return (
            <AdminProtectedRoute>
              <AdminAnalytics />
            </AdminProtectedRoute>
          );
        }}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
