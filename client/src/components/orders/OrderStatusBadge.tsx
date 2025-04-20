import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  status: string;
  size?: 'default' | 'sm';
}

export default function OrderStatusBadge({ status, size = 'default' }: OrderStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'new':
        return {
          label: 'New',
          color: 'bg-blue-500 hover:bg-blue-600 text-white',
          lightBg: 'bg-blue-50 text-blue-800'
        };
      case 'cooking':
        return {
          label: 'Cooking',
          color: 'bg-orange-500 hover:bg-orange-600 text-white',
          lightBg: 'bg-orange-50 text-orange-800'
        };
      case 'ready':
        return {
          label: 'Ready',
          color: 'bg-green-500 hover:bg-green-600 text-white',
          lightBg: 'bg-green-50 text-green-800'
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-gray-500 hover:bg-gray-600 text-white',
          lightBg: 'bg-gray-50 text-gray-800'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-red-500 hover:bg-red-600 text-white',
          lightBg: 'bg-red-50 text-red-800'
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: 'bg-gray-500 hover:bg-gray-600 text-white',
          lightBg: 'bg-gray-50 text-gray-800'
        };
    }
  };
  
  const config = getStatusConfig();
  const bgClass = size === 'sm' ? config.lightBg : config.color;
  const textClass = size === 'sm' ? '' : '';
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1';
  
  return (
    <Badge className={`${bgClass} ${textClass} ${paddingClass} font-medium`}>
      {config.label}
    </Badge>
  );
}
