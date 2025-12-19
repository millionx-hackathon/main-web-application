"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  Phone,
  Calculator,
  Target,
  FileText,
  BarChart3,
  Home,
  Lightbulb,
  TrendingUp,
  LineChart,
  Settings,
  Files,
  Search,
  User,
  ChevronRight,
  Menu,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Voice AI Call",
    href: "/dashboard/voice-ai",
    icon: Phone,
  },
  {
    title: "Math Solver",
    href: "/dashboard/math-solver",
    icon: Calculator,
  },
  {
    title: "Adaptive Practice",
    href: "/dashboard/practice",
    icon: Target,
  },
];

const strategyItems: NavItem[] = [
  {
    title: "Book Reader",
    href: "/dashboard/book-reader",
    icon: FileText,
  },
  {
    title: "Mock Quiz",
    href: "/dashboard/mock-quiz",
    icon: Lightbulb,
  },
  {
    title: "Study Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
  },
  {
    title: "Progress Tracking",
    href: "/dashboard/progress",
    icon: LineChart,
  },
];

const knowledgeItems: NavItem[] = [
  {
    title: "Resources",
    href: "/dashboard/resources",
    icon: Files,
  },
];

const searchItems: NavItem[] = [
  {
    title: "Find Topics",
    href: "/dashboard/search",
    icon: Search,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

interface CollapsibleSectionProps {
  title: string;
  items: NavItem[];
  isCollapsed: boolean;
}

function CollapsibleSection({ title, items, isCollapsed }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const pathname = usePathname();

  return (
    <div className="mb-6">
      {!isCollapsed && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
        >
          <span>{title}</span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-90"
            )}
          />
        </button>
      )}
      {(isOpen || isCollapsed) && (
        <div className="space-y-1 mt-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-[280px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Shikkha AI</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "p-2 rounded-lg hover:bg-gray-100 transition-colors",
                isCollapsed && "mx-auto"
              )}
            >
              <PanelLeft className={cn("h-5 w-5 text-gray-600 transition-transform", isCollapsed && "rotate-180")} />
            </button>
          </div>

          {/* User Section */}
          <div className={cn("p-4 border-b border-gray-200", isCollapsed && "flex justify-center")}>
            <div className="flex items-center space-x-3">
              <UserButton afterSignOutUrl="/" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">My Account</p>
                  <p className="text-xs text-gray-500 truncate">Student Dashboard</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <CollapsibleSection
              title="Personal Brand"
              items={navigationItems}
              isCollapsed={isCollapsed}
            />
            <CollapsibleSection
              title="Strategy & Assets"
              items={strategyItems}
              isCollapsed={isCollapsed}
            />
            <CollapsibleSection
              title="Knowledge"
              items={knowledgeItems}
              isCollapsed={isCollapsed}
            />
            <CollapsibleSection
              title="Search"
              items={searchItems}
              isCollapsed={isCollapsed}
            />
          </nav>

          {/* Settings */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors",
                pathname === "/dashboard/settings" && "bg-blue-50 text-blue-600",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? "Settings" : undefined}
            >
              <Settings className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
