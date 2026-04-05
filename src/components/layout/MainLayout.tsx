import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-x-hidden">
        <div className="min-h-screen p-4 lg:p-6 xl:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
