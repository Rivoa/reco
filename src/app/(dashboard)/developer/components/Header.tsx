"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  Loader2, 
  Cloud, 
  ChevronDown, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Check 
} from "lucide-react"; 
import { DeviceConfig } from "../types";

interface HeaderProps {
  activeDevice: DeviceConfig;
  setActiveDevice: (device: DeviceConfig) => void;
  devices: DeviceConfig[];
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

// Helper to determine icon based on width
const getDeviceIcon = (width: number) => {
  if (width < 600) return <Smartphone size={14} />;
  if (width < 1024) return <Tablet size={14} />;
  return <Monitor size={14} />;
};

// Helper to categorize devices for the dropdown
const getDeviceCategory = (width: number) => {
  if (width < 600) return "Mobile";
  if (width < 1024) return "Tablet";
  return "Desktop";
};

export function Header({ activeDevice, setActiveDevice, devices, onSave, isSaving, hasUnsavedChanges }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Group devices by category
  const groupedDevices = devices.reduce((acc, device) => {
    const category = getDeviceCategory(device.width);
    if (!acc[category]) acc[category] = [];
    acc[category].push(device);
    return acc;
  }, {} as Record<string, DeviceConfig[]>);

  // Sort keys to ensure order: Mobile -> Tablet -> Desktop
  const categoryOrder = ["Mobile", "Tablet", "Desktop"];

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-[#0f1117] z-30 select-none relative">
      
      {/* Click backdrop to close dropdown */}
      {isDropdownOpen && (
        <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setIsDropdownOpen(false)} />
      )}

      {/* LEFT: Branding */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600/10 p-1.5 rounded-lg border border-blue-500/10">
           <Cpu className="text-blue-500" size={16} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] tracking-[0.2em] font-bold text-zinc-100 leading-none">KLAZ</span>
          <span className="text-[9px] text-zinc-600 font-mono mt-0.5">BETA</span>
        </div>
      </div>
      
      {/* RIGHT: Toolbar */}
      <div className="flex items-center gap-4">
        
        {/* DEVICE DROPDOWN */}
        <div className="relative z-20">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-md transition-colors group"
          >
            <span className="text-zinc-400 group-hover:text-zinc-300">
              {getDeviceIcon(activeDevice.width)}
            </span>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[11px] font-medium text-zinc-200">{activeDevice.name}</span>
              <span className="text-[9px] text-zinc-600 font-mono">{activeDevice.width} × {activeDevice.height}</span>
            </div>
            <ChevronDown size={12} className={`text-zinc-500 transition-transform ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-[#13151b] border border-white/10 rounded-lg shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              
              {categoryOrder.map(category => {
                if (!groupedDevices[category]) return null;
                return (
                  <div key={category}>
                    <div className="px-3 py-1.5 text-[9px] font-bold text-zinc-600 tracking-wider bg-zinc-900/30 uppercase mt-1 first:mt-0">
                      {category}
                    </div>
                    {groupedDevices[category].map(d => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setActiveDevice(d);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors ${
                          activeDevice.id === d.id ? "bg-blue-500/10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`${activeDevice.id === d.id ? "text-blue-400" : "text-zinc-500"}`}>
                            {getDeviceIcon(d.width)}
                          </span>
                          <div>
                            <div className={`text-[11px] ${activeDevice.id === d.id ? "text-blue-100 font-medium" : "text-zinc-300"}`}>
                              {d.name}
                            </div>
                            <div className="text-[9px] text-zinc-600 font-mono">
                              {d.width} × {d.height}
                            </div>
                          </div>
                        </div>
                        {activeDevice.id === d.id && <Check size={12} className="text-blue-500" />}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-white/10" />

        {/* SAVE BUTTON */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="hidden sm:inline text-[10px] text-zinc-500 font-mono animate-pulse mr-2">
              Unsaved
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
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" 
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"}
            `}
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