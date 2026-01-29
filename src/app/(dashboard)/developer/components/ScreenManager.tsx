import React, { useState } from "react";
import { Smartphone, Trash2, AlertTriangle } from "lucide-react";
import { AppScreen } from "../types";

interface ScreenManagerProps {
  screens: AppScreen[];
  activeScreenId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function ScreenManager({ screens, activeScreenId, onSelect, onDelete }: ScreenManagerProps) {
  const [screenToDelete, setScreenToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setScreenToDelete(id);
  };

  const confirmDelete = () => {
    if (screenToDelete) {
      onDelete(screenToDelete);
      setScreenToDelete(null);
    }
  };

  return (
    <>
      {/* SCREEN LIST */}
      <div className="flex flex-col h-full relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {screens.map((screen) => (
            <div
              key={screen.id}
              onClick={() => onSelect(screen.id)}
              className={`
                group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-[12px] transition-all border select-none
                ${screen.id === activeScreenId 
                  ? "bg-blue-600/10 text-blue-400 border-blue-500/20" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border-transparent"}
              `}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Smartphone size={14} strokeWidth={2.5} className={screen.id === activeScreenId ? "text-blue-500" : "opacity-70"} />
                <span className="truncate font-medium font-inter">{screen.name}</span>
              </div>
              
              {/* Delete Trigger Icon */}
              {screens.length > 1 && (
                <button
                  onClick={(e) => handleDeleteClick(e, screen.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded transition-all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- KLAZ THEMED MODAL --- */}
      {screenToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop (Blur & Darken) */}
          <div 
            className="absolute inset-0 bg-[#0b0d10]/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setScreenToDelete(null)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-[340px] bg-[#1c1c1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden animation-scale-in ring-1 ring-white/5">
            
            {/* Header Area */}
            <div className="px-6 py-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 font-inter">Delete Screen</h3>
                <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed font-inter">
                  Are you sure you want to delete <span className="text-zinc-200 font-mono bg-white/5 px-1 py-0.5 rounded text-[11px]">
                    {screens.find(s => s.id === screenToDelete)?.name}
                  </span>?
                  <br/>This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center gap-3 px-6 py-4 bg-[#18181b] border-t border-white/5">
              <button
                onClick={() => setScreenToDelete(null)}
                className="flex-1 px-4 py-2 text-[11px] font-medium text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all shadow-lg shadow-red-900/20 active:scale-[0.98]"
              >
                Delete Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        .animation-scale-in {
          animation: scaleIn 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}