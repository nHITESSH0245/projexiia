
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  className?: string;
}

export function Layout({ children, hideHeader = false, className }: LayoutProps) {
  const location = useLocation();

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <Header />}
      <main
        className={cn(
          "flex-1 pt-16", // Add padding for the fixed header
          !hideHeader && "pt-16", // Add padding for header
          className
        )}
      >
        <div className="w-full mx-auto animate-fade-in">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
