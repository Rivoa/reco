"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Moon, 
  Monitor, 
  Laptop,
  Check,
  Loader2,
  Calendar,
  AlertTriangle, // Critical
  Bug,           // Bugs
  Zap,           // Performance
  Rocket,        // Deployments
  Lock,          // Security
  Mail
} from "lucide-react";
import { createClient } from "@/utils/supabase/client"; 
import { toast } from "sonner"; 

// --- TYPES ---
type SettingsTab = 'profile' | 'appearance' | 'account' | 'notifications';

// 1. Expanded Notification Preferences
interface NotificationPrefs {
  critical_errors: boolean;
  security_alerts: boolean;
  bug_reports: boolean;       // New
  performance_alerts: boolean; // New
  deployments: boolean;        // New
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  notification_prefs: NotificationPrefs;
}

interface LocalPreferences {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  editorFontSize: number;
}

const DEFAULT_PREFS: LocalPreferences = {
  theme: 'dark',
  accentColor: 'blue',
  editorFontSize: 13
};

// 2. Updated Defaults
const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  critical_errors: true,
  security_alerts: true,
  bug_reports: true,
  performance_alerts: false,
  deployments: false,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<LocalPreferences>(DEFAULT_PREFS);
  
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at, notification_prefs')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Merge DB data with defaults to ensure new fields exist for old users
        setProfile({
          id: data.id,
          email: data.email,
          full_name: data.full_name || "",
          role: data.role || "user",
          created_at: data.created_at,
          notification_prefs: { ...DEFAULT_NOTIFICATIONS, ...data.notification_prefs }
        });

        const savedPrefs = localStorage.getItem('klaz_preferences');
        if (savedPrefs) setPreferences(JSON.parse(savedPrefs));

      } catch (e) {
        console.error("Load Error:", e);
        toast.error("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [supabase]);

  // --- HANDLERS ---
  const updateProfileField = (value: string) => {
    if (!profile) return;
    setProfile({ ...profile, full_name: value });
  };

  const updateNotificationPref = (key: keyof NotificationPrefs, value: boolean) => {
    if (!profile) return;
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        notification_prefs: {
          ...prev.notification_prefs,
          [key]: value
        }
      };
    });
  };

  const updatePreference = (field: keyof LocalPreferences, value: any) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [field]: value };
      localStorage.setItem('klaz_preferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: profile.full_name,
          notification_prefs: profile.notification_prefs 
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleColorClass = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'bg-red-600 shadow-red-900/20';
    if (r.includes('dev')) return 'bg-blue-600 shadow-blue-900/20';
    if (r.includes('mod')) return 'bg-purple-600 shadow-purple-900/20';
    return 'bg-zinc-600'; 
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0b0d10] text-zinc-500 gap-2">
        <Loader2 className="animate-spin" /> Loading...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex h-full w-full bg-[#0b0d10] text-zinc-300 font-inter overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-[#0f1117] flex flex-col pt-6 pb-4">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage your account</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />} label="My Profile" />
          <NavButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon={<Monitor size={18} />} label="Appearance" />
          <NavButton active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<Shield size={18} />} label="Security" />
          <NavButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell size={18} />} label="Notifications" />
        </nav>
        
        <div className="px-6 mt-auto">
           <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase shadow-lg ${getRoleColorClass(profile.role)}`}>
                {profile.full_name?.charAt(0) || profile.email.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                 <span className="text-xs font-medium text-white truncate">{profile.full_name || "User"}</span>
                 <span className="text-[10px] text-zinc-500 truncate capitalize">{profile.role}</span>
              </div>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-3xl mx-auto py-12 px-8">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animation-fade-in">
              <SectionHeader title="Public Profile" description="This information is displayed publicly." />
              
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl ${getRoleColorClass(profile.role)}`}>
                    {profile.full_name?.charAt(0).toUpperCase() || "?"}
                 </div>
                 
                 <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-white">{profile.full_name || "Anonymous"}</h3>
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${getRoleColorClass(profile.role).split(' ')[0]}`}>
                         {profile.role}
                       </span>
                       <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                         <Calendar size={10} /> Joined {new Date(profile.created_at).toLocaleDateString()}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="grid gap-6 max-w-xl">
                 <InputGroup label="Full Name">
                    <input 
                      type="text" 
                      value={profile.full_name} 
                      onChange={(e) => updateProfileField(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                 </InputGroup>

                 <InputGroup label="Email Address">
                    <input 
                      type="email" 
                      value={profile.email} 
                      disabled 
                      className="w-full bg-[#1c1c1e]/50 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                    />
                 </InputGroup>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
             <div className="space-y-8 animation-fade-in">
                <SectionHeader title="Appearance" description="Customize your workspace." />
                
                <div className="grid gap-6">
                   <div className="flex flex-col gap-3">
                      <label className="text-sm font-medium text-zinc-300">Theme</label>
                      <div className="grid grid-cols-3 gap-4 max-w-md">
                         <ThemeCard active={preferences.theme === 'dark'} onClick={() => updatePreference('theme', 'dark')} icon={<Moon size={20} />} label="Dark" />
                         <ThemeCard active={preferences.theme === 'light'} onClick={() => updatePreference('theme', 'light')} icon={<SettingsIcon size={20} />} label="Light" />
                         <ThemeCard active={preferences.theme === 'system'} onClick={() => updatePreference('theme', 'system')} icon={<Laptop size={20} />} label="System" />
                      </div>
                   </div>

                   <div className="flex flex-col gap-3">
                      <label className="text-sm font-medium text-zinc-300">Accent Color</label>
                      <div className="flex items-center gap-3">
                         {['blue', 'purple', 'green', 'orange', 'red'].map(color => (
                            <button
                              key={color}
                              onClick={() => updatePreference('accentColor', color)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${preferences.accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0b0d10]' : 'opacity-60 hover:opacity-100'}`}
                              style={{ backgroundColor: getColorHex(color) }}
                            >
                               {preferences.accentColor === color && <Check size={14} className="text-white drop-shadow-md" />}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
             <div className="space-y-8 animation-fade-in">
                <SectionHeader title="Security" description="Manage your account security." />
                <div className="grid gap-6 max-w-xl">
                   <div className="border-t border-white/5 pt-6">
                      <h3 className="text-sm font-bold text-zinc-200 mb-4">Password</h3>
                      <button className="px-4 py-2 bg-[#1c1c1e] border border-white/10 hover:bg-white/5 text-zinc-300 text-xs font-bold rounded-md transition-colors">
                         Reset Password via Email
                      </button>
                   </div>
                   <div className="border-t border-red-500/10 pt-6">
                      <h3 className="text-sm font-bold text-red-400 mb-2">Danger Zone</h3>
                      <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-md transition-colors">
                         Delete Account
                      </button>
                   </div>
                </div>
             </div>
          )}

          {/* NOTIFICATIONS TAB (UPDATED) */}
          {activeTab === 'notifications' && (
             <div className="space-y-8 animation-fade-in">
               <SectionHeader title="Email Notifications" description="Select which events you want to be notified about via email." />
               
               <div className="grid gap-2 max-w-xl">
                 
                 {/* 1. Critical */}
                 <Toggle 
                   label="Critical System Errors"
                   description="Alerts for server crashes, database outages, or fatal exceptions."
                   checked={profile.notification_prefs.critical_errors}
                   onChange={(val) => updateNotificationPref('critical_errors', val)}
                   icon={<AlertTriangle size={18} className="text-red-500" />}
                 />
                 
                 <div className="h-[1px] bg-white/5 my-2" />

                 {/* 2. Security */}
                 <Toggle 
                   label="Security & Access"
                   description="Suspicious login attempts, password resets, or permission changes."
                   checked={profile.notification_prefs.security_alerts}
                   onChange={(val) => updateNotificationPref('security_alerts', val)}
                   icon={<Lock size={18} className="text-orange-500" />}
                 />

                 <div className="h-[1px] bg-white/5 my-2" />

                 {/* 3. Bugs */}
                 <Toggle 
                   label="Bug Reports"
                   description="New bug reports submitted by users or automated testing pipelines."
                   checked={profile.notification_prefs.bug_reports}
                   onChange={(val) => updateNotificationPref('bug_reports', val)}
                   icon={<Bug size={18} className="text-rose-400" />}
                 />

                 <div className="h-[1px] bg-white/5 my-2" />

                 {/* 4. Performance */}
                 <Toggle 
                   label="Performance Alerts"
                   description="High latency, memory usage spikes, or API rate limiting warnings."
                   checked={profile.notification_prefs.performance_alerts}
                   onChange={(val) => updateNotificationPref('performance_alerts', val)}
                   icon={<Zap size={18} className="text-yellow-400" />}
                 />

                 <div className="h-[1px] bg-white/5 my-2" />

                 {/* 5. Deployments */}
                 <Toggle 
                   label="Deployment Status"
                   description="Notifications for successful builds or deployment failures."
                   checked={profile.notification_prefs.deployments}
                   onChange={(val) => updateNotificationPref('deployments', val)}
                   icon={<Rocket size={18} className="text-blue-500" />}
                 />

               </div>
               
               <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex gap-3 items-start mt-6">
                  <Mail size={16} className="shrink-0 mt-0.5" />
                  <span>Emails will be sent to <strong>{profile.email}</strong>. To change this, please contact support.</span>
               </div>
             </div>
          )}

          {/* SAVE BUTTON */}
          {(activeTab === 'profile' || activeTab === 'notifications') && (
            <div className="fixed bottom-8 right-12 z-50">
               <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-full shadow-2xl shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
               </button>
            </div>
          )}

        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        .animation-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 font-medium ${active ? "bg-blue-600/10 text-blue-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"}`}>{icon}<span>{label}</span></button>;
}
function SectionHeader({ title, description }: { title: string, description: string }) {
  return <div className="border-b border-white/5 pb-6 mb-6"><h2 className="text-2xl font-bold text-white mb-2">{title}</h2><p className="text-zinc-500 text-sm leading-relaxed max-w-lg">{description}</p></div>;
}
function InputGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return <div className="flex flex-col gap-2"><label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</label>{children}</div>;
}
function ThemeCard({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return <button onClick={onClick} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${active ? "bg-blue-600/10 border-blue-500 text-blue-400 ring-1 ring-blue-500/20" : "bg-[#1c1c1e] border-white/5 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"}`}>{icon}<span className="text-xs font-bold">{label}</span></button>;
}
function getColorHex(name: string) {
  switch (name) {
    case 'blue': return '#3b82f6';
    case 'purple': return '#a855f7';
    case 'green': return '#22c55e';
    case 'orange': return '#f97316';
    case 'red': return '#dc2626';
    default: return '#3b82f6';
  }
}

function Toggle({ label, description, checked, onChange, icon }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 hover:bg-white/[0.02] px-2 rounded-lg transition-colors -mx-2">
      <div className="flex items-start gap-4">
         {icon && <div className="mt-1 opacity-80">{icon}</div>}
         <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-zinc-200">{label}</span>
            <span className="text-xs text-zinc-500 leading-snug max-w-xs">{description}</span>
         </div>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-blue-600' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}