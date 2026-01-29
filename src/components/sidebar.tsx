'use client';

import { 
  Home, Settings, LogOut, 
  Users, Terminal, Database, Bell, 
  Menu, LayoutDashboard 
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { usePathname } from "next/navigation";

// --- REUSABLE TOOLTIP ---
const SidebarTooltip = ({ text, hidden }: { text: string, hidden?: boolean }) => {
  if (hidden) return null;
  return (
    <span className="
      absolute left-full top-1/2 -translate-y-1/2 ml-4 
      px-2.5 py-1.5 
      bg-zinc-900 text-zinc-100 text-xs font-medium 
      rounded-md shadow-xl border border-white/10 
      opacity-0 group-hover:opacity-100 
      transition-opacity duration-200 
      whitespace-nowrap pointer-events-none z-[9999]
    ">
      {text}
      <div className="absolute top-1/2 right-full -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-zinc-900" />
    </span>
  );
};

// --- RBAC CONFIGURATION ---
const navItems = [
  // Only Admins see the main Overview
  { 
    icon: LayoutDashboard, 
    label: "Overview", 
    href: "/overview", 
    roles: ["admin"] 
  },
  // Admins & Moderators see Content
  { 
    icon: Database, 
    label: "Content", 
    href: "/content", 
    roles: ["admin", "moderator"] 
  },
  // Admins see Personnel
  { 
    icon: Users, 
    label: "Team", 
    href: "/team", 
    roles: ["admin"] 
  },
  // Admins & Developers see Developer Tools
  { 
    icon: Terminal, 
    label: "Developer", 
    href: "/developer", 
    roles: ["admin", "developer"] 
  },
  // Only Admins see Settings
  { 
    icon: Settings, 
    label: "Settings", 
    href: "/settings", 
    roles: ["admin"] 
  },
];

export default function Sidebar({ role, userName }: { role: string; userName?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Normalize role to ensure matching works (e.g. "Admin" -> "admin")
  const userRole = role?.toLowerCase() || 'guest';

  // --- FILTERING LOGIC ---
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem("sidebar_collapsed");
    if (savedState !== null) setIsCollapsed(JSON.parse(savedState));
  }, []);

  const toggleSidebar = (newState: boolean) => {
    setIsCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", JSON.stringify(newState));
  };

  if (!isMounted) return <aside className="w-72 h-screen bg-[#0a0c10] border-r border-zinc-800/50" />;

  return (
    <aside
      className={`
        relative h-screen bg-[#0a0c10] border-r border-zinc-800/50 flex flex-col z-50
        transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] 
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Header */}
      <div className={`flex items-center h-20 border-b border-zinc-800/50 mb-4 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
        
        <div className={`flex items-center gap-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
          <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center shadow-lg shadow-white/5">
            <Terminal className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 whitespace-nowrap">Console</h1>
        </div>

        <button 
          onClick={() => toggleSidebar(!isCollapsed)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors z-20 group relative"
        >
          <Menu className="h-6 w-6" />
          <SidebarTooltip text={isCollapsed ? "Expand" : "Collapse"} hidden={!isCollapsed} />
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-3 space-y-1.5 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
        {filteredNavItems.map((item) => {
          
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => toggleSidebar(true)} 
              className={`
                relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-zinc-800 text-white shadow-md shadow-black/20' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                } 
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'text-blue-400' : 'group-hover:scale-110'}`} />
              
              {!isCollapsed && (
                <span className="text-sm font-semibold whitespace-nowrap transition-all duration-300 origin-left opacity-100 w-auto">
                  {item.label}
                </span>
              )}

              <SidebarTooltip text={item.label} hidden={!isCollapsed} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={`p-4 border-t border-zinc-800/50 space-y-4 bg-[#0a0c10] ${isCollapsed ? 'overflow-visible' : 'overflow-hidden'}`}>
        
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-500 hover:bg-white/5 transition-colors group relative ${isCollapsed ? 'justify-center' : ''}`}>
          <Bell className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="text-sm font-medium whitespace-nowrap">Notifications</span>
              <span className="ml-auto bg-blue-500 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full">4</span>
            </>
          )}
          <SidebarTooltip text="Notifications" hidden={!isCollapsed} />
        </button>

        <div className={`flex items-center gap-3 p-2 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group relative ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="relative shrink-0">
            <Image
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'User'}`}
              alt="User"
              width={40}
              height={40}
              className="rounded-xl border border-zinc-700 bg-zinc-800"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0c10] rounded-full" />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animation-fade-in">
              <p className="text-sm font-bold text-zinc-100 truncate">{userName || "User"}</p>
              <p className="text-xs text-zinc-500 capitalize">{userRole}</p>
            </div>
          )}
          
          {!isCollapsed ? (
            <form action="/signout" method="post" className="relative group/logout">
              <button type="submit" className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                <LogOut className="h-5 w-5" />
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-red-200 text-xs rounded opacity-0 group-hover/logout:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                Sign Out
              </span>
            </form>
          ) : (
            <SidebarTooltip text={`Signed in as ${userName || "User"}`} />
          )}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        .animation-fade-in { animation: fadeIn 0.3s forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </aside>
  );
}