import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const TopHeader = () => {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-30 w-full bg-background border-b border-border px-6 h-16 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground hidden sm:block">
          Welcome back, {user?.username || 'User'}!
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors" title="Notifications">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
        </button>
      </div>
    </header>
  );
};
