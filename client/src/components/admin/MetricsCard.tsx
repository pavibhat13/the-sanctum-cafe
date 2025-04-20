import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    positive: boolean;
  };
  icon?: React.ReactNode;
}

export default function MetricsCard({ title, value, subtitle, change, icon }: MetricsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {change && (
            <span className={`text-xs flex items-center ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
              {change.positive ? '+' : ''}{change.value}%
              {change.positive ? (
                <ArrowUp className="h-3 w-3 ml-0.5" />
              ) : (
                <ArrowDown className="h-3 w-3 ml-0.5" />
              )}
            </span>
          )}
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">{value}</span>
          {subtitle && <span className="ml-2 text-xs text-gray-500">{subtitle}</span>}
        </div>
        {icon && <div className="absolute top-3 right-3 text-gray-300">{icon}</div>}
      </CardContent>
    </Card>
  );
}
