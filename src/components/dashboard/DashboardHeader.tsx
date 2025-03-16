
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function DashboardHeader({ 
  title, 
  description, 
  children,
  className 
}: DashboardHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row items-start md:items-center justify-between py-4 md:py-6",
      className
    )}>
      <div className="space-y-0.5 mb-4 md:mb-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
