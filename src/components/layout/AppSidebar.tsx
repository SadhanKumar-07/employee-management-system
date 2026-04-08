import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  FileText, LogOut, ChevronLeft, ChevronRight, User,
  Briefcase, Star, ListTodo, UserCheck, Bell, ClipboardList, BarChart2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const hrLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/interviews', label: 'Interviews', icon: UserCheck },
  { to: '/onboarding', label: 'Onboarding', icon: ClipboardList },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/payroll', label: 'Payroll', icon: DollarSign },
];

const gmLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Briefcase },
  { to: '/gm-leaves', label: 'Leave Approvals', icon: CalendarDays },
  { to: '/gm-attendance', label: 'Attendance Report', icon: Clock },
  { to: '/gm-performance', label: 'Performance', icon: BarChart2 },
];

const pmLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'My Projects', icon: Briefcase },
  { to: '/pm-performance', label: 'Team Ratings', icon: Star },
  { to: '/pm-schedules', label: 'Schedules', icon: ListTodo },
];

const employeeLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'My Projects', icon: Briefcase },
  { to: '/my-attendance', label: 'My Attendance', icon: Clock },
  { to: '/my-leaves', label: 'My Leaves', icon: CalendarDays },
  { to: '/my-payslips', label: 'My Payslips', icon: FileText },
  { to: '/my-performance', label: 'My Performance', icon: Star },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const roleLabelMap: Record<string, string> = {
  hr_manager: 'HR Manager',
  gm: 'General Manager',
  project_manager: 'Project Manager',
  employee: 'Employee',
};

export const AppSidebar = () => {
  const { role, user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  let links = employeeLinks;
  if (role === 'hr_manager') links = hrLinks;
  else if (role === 'gm') links = gmLinks;
  else if (role === 'project_manager') links = pmLinks;

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-lg text-sidebar-primary-foreground tracking-tight">ERP Manager</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-4 h-4 text-sidebar-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-primary-foreground truncate">{user?.username}</p>
              <p className="text-xs text-sidebar-foreground">{roleLabelMap[role ?? ''] ?? role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};
