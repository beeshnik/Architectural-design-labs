import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '@/widgets/header';
import { QueryProvider } from '@/app/providers';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <Outlet />
        </main>
      </div>
    </QueryProvider>
  );
}
