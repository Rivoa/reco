"use client";

import React from "react";
import { Cpu, Save, Loader2, Cloud } from "lucide-react"; 
import { DeviceConfig } from "../types";

interface HeaderProps {
  activeDevice: DeviceConfig;
  setActiveDevice: (device: DeviceConfig) => void;
  devices: DeviceConfig[];
  onSave: () => void;       // Renamed from onRun
  isSaving: boolean;
  hasUnsavedChanges: boolean; // Visual cue
}

export function Header({ activeDevice, setActiveDevice, devices, onSave, isSaving, hasUnsavedChanges }: HeaderProps) {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-[#0f1117] z-20 select-none">
      
      {/* LEFT: Branding */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600/10 p-1.5 rounded-lg border border-blue-500/10">
           <Cpu className="text-blue-500" size={16} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] tracking-[0.2em] font-bold text-zinc-100 leading-none">KLAZ</span>
          <span className="text-[9px] text-zinc-600 font-mono mt-0.5">v2.3.0</span>
        </div>
      </div>
      
      {/* RIGHT: Toolbar */}
      <div className="flex items-center gap-4">
        
        {/* Device Selector */}
        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
          {devices.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDevice(d)}
              className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${
                activeDevice.id === d.id 
                  ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-4 bg-white/10" />

        {/* SAVE BUTTON */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-[10px] text-zinc-500 font-mono animate-pulse mr-2">
              Unsaved Changes
            </span>
          )}
          
          <button 
            onClick={onSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md transition-all shadow-lg active:translate-y-0.5 border border-white/5
              ${isSaving 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : hasUnsavedChanges 
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" // Highlight when changes exist
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"}
            `}
            title="Save to Cloud (Cmd+S)"
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Cloud size={12} fill={hasUnsavedChanges ? "currentColor" : "none"} />
            )}
            <span className="text-[10px] font-semibold tracking-wide">
              {isSaving ? "SYNCING..." : "SAVE"}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}