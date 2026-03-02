import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '@/shared/lib';
import { TrendingUp, BookOpen, Cpu, BarChart3 } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Сделки',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    to: '/journals',
    label: 'Журналы',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    to: '/algorithms',
    label: 'Алгоритмы',
    icon: <Cpu className="h-4 w-4" />,
  },
];

export function Header() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline">Trading Journal</span>
        </div>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                currentPath === item.to
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
