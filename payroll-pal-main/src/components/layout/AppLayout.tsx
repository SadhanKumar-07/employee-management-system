import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopHeader } from './TopHeader';

export const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col relative w-full">
        <TopHeader />
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

