'use client';

import { UserRole } from "@/utils/rbac";
import { updateRole } from "./actions";
import { useState, useTransition } from "react";
import { Shield, Loader2, Check } from "lucide-react";

export default function RoleSelector({ 
  userId, 
  currentRole, 
  disabled 
}: { 
  userId: string; 
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  async function handleRoleChange(newRole: UserRole) {
    if (newRole === currentRole) return;
    
    setSuccess(false);
    startTransition(async () => {
      await updateRole(userId, newRole);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    });
  }

  const roleColors = {
    admin: 'border-red-500/30 bg-red-500/5 text-red-400',
    developer: 'border-green-500/30 bg-green-500/5 text-green-400',
    moderator: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    user: 'border-border bg-background text-text-secondary',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <select
          value={currentRole}
          disabled={disabled || isPending}
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          className={`appearance-none pl-8 pr-10 py-1.5 rounded-lg text-xs font-bold border outline-none transition-all cursor-pointer disabled:cursor-not-allowed ${roleColors[currentRole]} focus:ring-2 focus:ring-primary/20`}
        >
          <option value="admin">ADMIN</option>
          <option value="developer">DEVELOPER</option>
          <option value="moderator">MODERATOR</option>
          <option value="user">USER</option>
        </select>
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : success ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Shield className="h-3.5 w-3.5 opacity-60" />
          )}
        </div>
        {!disabled && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        )}
      </div>
    </div>
  );
}
