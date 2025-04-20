import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { format, subDays, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { Analytics } from '@shared/schema';
import { ANALYTICS_EVENT } from '@/lib/constants';

// Colors for charts
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export default function AdminAnalytics() {
  // Fetch analytics data
  const { data: cartAddEvents = [], isLoading: isCartAddLoading } = useQuery<Analytics[]>({
    queryKey: [`/api/analytics/${ANALYTICS_EVENT.CART_ADD}`],
  });
  
  const { data: checkoutStartEvents = [], isLoading: isCheckoutStartLoading } = useQuery<Analytics[]>({
    queryKey: [`/api/analytics/${ANALYTICS_EVENT.CHECKOUT_START}`],
  });
  
  const { data: checkoutCompleteEvents = [], isLoading: isCheckoutCompleteLoading } = useQuery<Analytics[]>({
    queryKey: [`/api/analytics/${ANALYTICS_EVENT.CHECKOUT_COMPLETE}`],
  });
  
  const { data: menuViewEvents = [], isLoading: isMenuViewLoading } = useQuery<Analytics[]>({
    queryKey: [`/api/analytics/${ANALYTICS_EVENT.MENU_VIEW}`],
  });
  
  const { data: itemViewEvents = [], isLoading: isItemViewLoading } = useQuery<Analytics[]>({
    queryKey: [`/api/analytics/${ANALYTICS_EVENT.ITEM_VIEW}`],
  });

  const isLoading = 
    isCartAddLoading || 
    isCheckoutStartLoading || 
    isCheckoutCompleteLoading || 
    isMenuViewLoading ||
    isItemViewLoading;

  // Calculate conversion rates
  const conversionRates = useMemo(() => {
    if (isLoading) return null;
    
    const cartAdds = cartAddEvents.length;
    const checkoutStarts = checkoutStartEvents.length;
    const checkoutCompletes = checkoutCompleteEvents.length;
    
    // Avoid division by zero
    const cartToCheckout = cartAdds ? ((checkoutStarts / cartAdds) * 100).toFixed(1) : '0';
    const checkoutToComplete = checkoutStarts ? ((checkoutCompletes / checkoutStarts) * 100).toFixed(1) : '0';
    const overallConversion = cartAdds ? ((checkoutCompletes / cartAdds) * 100).toFixed(1) : '0';
    
    return {
      cartToCheckout,
      checkoutToComplete,
      overallConversion
    };
  }, [cartAddEvents, checkoutStartEvents, checkoutCompleteEvents, isLoading]);

  // Calculate revenue data
  const revenueData = useMemo(() => {
    if (isLoading) return [];
    
    // Group orders by day for the last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM dd');
      
      // Get orders for this day
      const ordersForDay = checkoutCompleteEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      
      // Calculate total revenue for the day
      const revenue = ordersForDay.reduce((sum, event) => {
        return sum + (event.data?.totalAmount || 0);
      }, 0);
      
      return {
        date: dateStr,
        revenue: Number(revenue.toFixed(2)),
        orders: ordersForDay.length
      };
    }).reverse();
    
    return last7Days;
  }, [checkoutCompleteEvents, isLoading]);

  // Calculate funnel data
  const funnelData = useMemo(() => {
    if (isLoading) return [];
    
    const menuViews = menuViewEvents.length;
    const itemViews = itemViewEvents.length;
    const cartAdds = cartAddEvents.length;
    const checkoutStarts = checkoutStartEvents.length;
    const checkoutCompletes = checkoutCompleteEvents.length;
    
    return [
      { name: 'Menu Views', value: menuViews },
      { name: 'Item Views', value: itemViews },
      { name: 'Cart Additions', value: cartAdds },
      { name: 'Checkout Started', value: checkoutStarts },
      { name: 'Orders Completed', value: checkoutCompletes }
    ];
  }, [
    menuViewEvents, 
    itemViewEvents, 
    cartAddEvents, 
    checkoutStartEvents, 
    checkoutCompleteEvents, 
    isLoading
  ]);

  // Calculate order type distribution
  const orderTypeData = useMemo(() => {
    if (isLoading) return [];
    
    const orderTypes: Record<string, number> = {};
    
    checkoutCompleteEvents.forEach(event => {
      if (event.data?.orderType) {
        const type = String(event.data.orderType);
        orderTypes[type] = (orderTypes[type] || 0) + 1;
      }
    });
    
    return Object.entries(orderTypes).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value
    }));
  }, [checkoutCompleteEvents, isLoading]);

  // Get period analytics
  const getPeriodAnalytics = (period: 'today' | 'week' | 'month') => {
    if (isLoading) return { orders: 0, revenue: 0, avgOrderValue: 0 };
    
    const filteredEvents = checkoutCompleteEvents.filter(event => {
      const date = new Date(event.timestamp);
      if (period === 'today') return isToday(date);
      if (period === 'week') return isThisWeek(date);
      if (period === 'month') return isThisMonth(date);
      return false;
    });
    
    const orders = filteredEvents.length;
    const revenue = filteredEvents.reduce((sum, event) => sum + (event.data?.totalAmount || 0), 0);
    const avgOrderValue = orders ? (revenue / orders) : 0;
    
    return {
      orders,
      revenue: revenue.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2)
    };
  };

  const todayStats = getPeriodAnalytics('today');
  const weekStats = getPeriodAnalytics('week');
  const monthStats = getPeriodAnalytics('month');

  return (
    <AdminLayout 
      title="Analytics" 
      subtitle="Track customer behavior and business performance"
    >
      {/* Performance Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-heading">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today">
            <TabsList className="mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : (
                  <>
                    <StatCard 
                      title="Orders" 
                      value={todayStats.orders.toString()} 
                      change={{ value: 5, positive: true }}
                    />
                    <StatCard 
                      title="Revenue" 
                      value={`$${todayStats.revenue}`} 
                      change={{ value: 12, positive: true }}
                    />
                    <StatCard 
                      title="Avg. Order Value" 
                      value={`$${todayStats.avgOrderValue}`} 
                      change={{ value: 3, positive: true }}
                    />
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="week">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : (
                  <>
                    <StatCard 
                      title="Orders" 
                      value={weekStats.orders.toString()} 
                      change={{ value: 8, positive: true }}
                    />
                    <StatCard 
                      title="Revenue" 
                      value={`$${weekStats.revenue}`} 
                      change={{ value: 15, positive: true }}
                    />
                    <StatCard 
                      title="Avg. Order Value" 
                      value={`$${weekStats.avgOrderValue}`} 
                      change={{ value: 2, positive: false }}
                    />
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="month">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : (
                  <>
                    <StatCard 
                      title="Orders" 
                      value={monthStats.orders.toString()} 
                      change={{ value: 18, positive: true }}
                    />
                    <StatCard 
                      title="Revenue" 
                      value={`$${monthStats.revenue}`} 
                      change={{ value: 22, positive: true }}
                    />
                    <StatCard 
                      title="Avg. Order Value" 
                      value={`$${monthStats.avgOrderValue}`} 
                      change={{ value: 5, positive: true }}
                    />
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-heading">Revenue (Last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `${value} orders`}
                  />
                  <Tooltip 
                    formatter={(value, name) => 
                      name === 'revenue' ? `$${value}` : `${value} orders`
                    }
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue" 
                    stroke="var(--chart-1)" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    name="Orders" 
                    stroke="var(--chart-2)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-heading">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="var(--chart-3)"
                    label={{ position: 'right', fill: '#666', fontSize: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-heading">Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Cart to Checkout</span>
                    <span className="text-sm font-medium text-green-600">{conversionRates?.cartToCheckout}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${conversionRates?.cartToCheckout}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Checkout to Complete</span>
                    <span className="text-sm font-medium text-blue-600">{conversionRates?.checkoutToComplete}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${conversionRates?.checkoutToComplete}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Overall Conversion</span>
                    <span className="text-sm font-medium text-primary">{conversionRates?.overallConversion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${conversionRates?.overallConversion}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Order Types */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-heading">Order Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={orderTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    positive: boolean;
  };
}

function StatCard({ title, value, change }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {change && (
          <span className={`text-xs flex items-center ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive ? '+' : ''}{change.value}%
            <svg
              className={`h-3 w-3 ml-0.5 ${change.positive ? 'rotate-0' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </span>
        )}
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold">{value}</span>
      </div>
    </div>
  );
}
