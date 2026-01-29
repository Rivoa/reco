import { checkRole } from "@/utils/rbac";
import { UserRole } from "@/utils/rbac";
import { createClient } from "@/utils/supabase/server";
import { Mail, Shield, UserPlus, Search, Filter, ShieldCheck, Code, Eye } from "lucide-react";
import RoleSelector from "./role-selector";

export default async function TeamPage() {
  const { profile } = await checkRole("admin");
  const supabase = await createClient();

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id, email, role, full_name") // Added full_name for a more professional feel
    .order("email");

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8 space-y-12">
      {/* 1. Standard Professional Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Personnel</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage administrative access and system permissions.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl">
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      {/* 2. Stats Grid - Midnight Navy Tint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Admins', count: 'admin', icon: ShieldCheck, color: 'text-blue-400' },
          { label: 'Developers', count: 'developer', icon: Code, color: 'text-emerald-400' },
          { label: 'Moderators', count: 'moderator', icon: Eye, color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0a0c10] border border-zinc-800/50 p-6 rounded-2xl flex items-center gap-5">
            <div className={`p-3 bg-zinc-900 rounded-xl ${stat.color}`}>
              <stat.icon size={22} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl font-medium text-zinc-100">
                {teamMembers?.filter(m => m.role === stat.count).length || 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. The Registry Table */}
      <div className="bg-[#0a0c10] border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl">
        {/* Table Controls */}
        <div className="p-6 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between gap-4 bg-zinc-900/20">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                    placeholder="Search records..." 
                    className="w-full pl-10 pr-4 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600"
                />
            </div>
            <button className="px-4 py-2 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 text-zinc-400 transition-colors">
                <Filter size={14} />
                Filter
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-black/40">
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">User Identity</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Access Level</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {teamMembers?.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-mono text-sm group-hover:border-zinc-600 transition-colors">
                            {member.email[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-200">{member.full_name || member.email}</span>
                            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter mt-0.5">{member.id}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <RoleSelector 
                      userId={member.id} 
                      currentRole={member.role as UserRole} 
                      disabled={member.id === profile.id}
                    />
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button className="text-zinc-500 hover:text-zinc-100 p-2 rounded-lg transition-colors">
                        <Mail size={16} />
                    </button>
                    <button 
                        disabled={member.id === profile.id}
                        className="text-zinc-500 hover:text-red-400 p-2 rounded-lg transition-colors disabled:opacity-20"
                    >
                        <Shield size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}