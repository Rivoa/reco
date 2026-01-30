'use client';

import { 
  Settings, LogOut, Users, Terminal, Database, 
  Bell, Menu, LayoutDashboard 
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link"; 
import { usePathname } from "next/navigation";

// --- REUSABLE TOOLTIP ---
const SidebarTooltip = ({ text, hidden }: { text: string, hidden?: boolean }) => {
  if (hidden) return null;
  return (
    <div className="
      absolute left-full top-1/2 -translate-y-1/2 ml-3
      px-2.5 py-1.5 
      bg-[#0a0c10] text-zinc-100 text-xs font-medium 
      rounded-md border border-zinc-800 shadow-xl shadow-black/50
      whitespace-nowrap z-[999] opacity-0 group-hover:opacity-100 
      transition-opacity duration-200 pointer-events-none
    ">
      {text}
      {/* Tiny arrow pointing left */}
      <div className="absolute top-1/2 right-full -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-[#0a0c10]" />
    </div>
  );
};

// --- CONFIGURATION ---
const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/overview", roles: ["admin"] },
  { icon: Database, label: "Content", href: "/content", roles: ["admin", "moderator"] },
  { icon: Users, label: "Team", href: "/team", roles: ["admin"] },
  { icon: Terminal, label: "Developer", href: "/developer", roles: ["admin", "developer"] },
  { icon: Settings, label: "Settings", href: "/settings", roles: ["admin", "developer", "userg"] },
];

// --- HELPER: ROLE COLORS ---
const getRoleStyles = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin': return 'bg-rose-500/10 text-rose-500 border-rose-500/20'; 
    case 'developer': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'; 
    case 'moderator': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'; 
    default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-800'; 
  }
};

export default function Sidebar({ role, userName }: { role: string; userName?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const userRole = role?.toLowerCase() || 'guest';
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));
  const userInitials = (userName || "U").slice(0, 2).toUpperCase();

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
        ${isCollapsed ? "w-[60px]" : "w-72"}
      `}
    >
      {/* --- HEADER --- */}
      <div className={`
        shrink-0 flex items-center h-16 border-b border-zinc-800/50 mb-2 
        transition-all duration-300
        ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'}
      `}>
        {/* Title Container with Width Transition */}
        <div className={`
          flex items-center gap-3 overflow-hidden transition-all duration-300
          ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
        `}>
          <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
            <Terminal className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 whitespace-nowrap">Console</h1>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => toggleSidebar(!isCollapsed)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className={`
        flex-1 px-3 space-y-2 py-2
        /* FIX: Visible overflow when collapsed allows tooltips. Hidden when expanded prevents horizontal scroll. */
        ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden no-scrollbar'}
      `}>
        {filteredNavItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => isCollapsed && toggleSidebar(false)} 
              className={`
                group flex items-center relative transition-all duration-300 ease-in-out
                h-10 
                ${isCollapsed ? 'justify-center w-10 mx-auto px-0' : 'w-full px-3 justify-start'}
                ${isActive 
                  ? 'bg-zinc-800 text-white shadow-md shadow-black/20' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                }
                ${isCollapsed ? 'rounded-lg' : 'rounded-xl'}
              `}
            >
              <item.icon className={`
                shrink-0 transition-transform duration-300
                ${isCollapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]'} 
                ${isActive ? 'text-blue-400' : 'group-hover:scale-105'}
              `} />
              
              {/* SMOOTH TEXT TRANSITION: Uses width instead of hidden/block */}
              <div className={`
                overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
              `}>
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </div>

              {/* Tooltip visible only when collapsed */}
              <SidebarTooltip text={item.label} hidden={!isCollapsed} />
            </Link>
          );
        })}
      </nav>

      {/* --- FOOTER --- */}
      <div className={`
        shrink-0 border-t border-zinc-800/50 bg-[#0a0c10] space-y-3
        transition-all duration-300
        ${isCollapsed ? 'p-2 flex flex-col items-center pb-4' : 'p-4'}
      `}>
        
        {/* Notifications */}
        <button className={`
          flex items-center text-zinc-500 hover:bg-white/5 transition-all duration-300 rounded-lg group relative
          ${isCollapsed ? 'justify-center w-10 h-10' : 'w-full px-3 py-2 gap-3'}
        `}>
          <Bell className="h-5 w-5 shrink-0" />
          
          <div className={`
            overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out flex flex-1 items-center
            ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
          `}>
            <span className="text-sm font-medium">Notifications</span>
            <span className="ml-auto bg-blue-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full">4</span>
          </div>

          {isCollapsed && <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border border-[#0a0c10]" />}
          <SidebarTooltip text="Notifications" hidden={!isCollapsed} />
        </button>

        {/* User Profile */}
        <div className={`
          flex items-center group relative transition-all duration-300
          ${isCollapsed ? 'justify-center w-full' : 'gap-3'}
        `}>
          <div className={`
            shrink-0 flex items-center justify-center font-bold border
            rounded-lg transition-all duration-300
            ${getRoleStyles(userRole)}
            ${isCollapsed ? 'w-9 h-9 text-[10px]' : 'w-10 h-10 text-xs'}
          `}>
            {userInitials}
          </div>
          
          <div className={`
            overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out flex-1 min-w-0
            ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
          `}>
            <p className="text-sm font-bold text-zinc-100 truncate">{userName || "User"}</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">{userRole}</p>
          </div>
          
          {/* Logout Button */}
          <div className={`
             transition-all duration-300 overflow-hidden
             ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block ml-auto'}
          `}>
            <form action="/signout" method="post">
              <button type="submit" className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
          
          <SidebarTooltip text={`Signed in as ${userName}`} hidden={!isCollapsed} />
        </div>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </aside>
  );
}