"use client";

import React, { useState, useRef, useEffect } from "react";
import { Minus, Plus, Scan } from "lucide-react";
import { FlutterRenderer } from "../renderer";
import { DeviceConfig, FlutterWidget } from "../types";

interface CanvasProps {
  layout: FlutterWidget;
  device: DeviceConfig;
  zoom: number;
  setZoom: (z: number) => void;
  isResizing: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function Canvas({ layout, device, zoom, setZoom, isResizing, selectedId, onSelect }: CanvasProps) {
  // --- PAN STATE ---
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // --- PAN HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    // Start panning if clicking the background
    if ((e.target as HTMLElement).getAttribute("data-pan-surface")) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = "grabbing";
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      document.body.style.cursor = "";
    };

    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning]);

  // --- WHEEL ZOOM ---
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const newZoom = Math.min(3, Math.max(0.1, zoom + delta));
      setZoom(newZoom);
    } else {
      setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleRecenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(0.85);
  };

  return (
    <main 
      ref={containerRef}
      className="flex-1 min-w-0 bg-[#0b0d10] relative flex overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      data-pan-surface="true"
    >
      
      {/* FLOATING CONTROLS */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#1a1d24]/90 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-2xl transition-transform hover:scale-105">
         <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"><Minus size={14} /></button>
         <div className="flex items-center gap-3 px-2 border-l border-r border-white/10 h-4">
            <span className="text-[11px] font-mono text-zinc-300 min-w-[3ch] text-center">{Math.round(zoom * 100)}%</span>
         </div>
         <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"><Plus size={14} /></button>
         <button onClick={handleRecenter} className="ml-1 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/20 transition-all" title="Reset View"><Scan size={14} /></button>
      </div>

      {/* STAGE CONTAINER */}
      <div 
        className="flex-1 w-full h-full flex items-center justify-center"
        style={{
          // Only transform the CONTENT
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isPanning || isResizing ? 'none' : 'transform 0.1s cubic-bezier(0.2,0,0,1)',
        }}
        data-pan-surface="true"
      >
        <div
          onMouseDown={(e) => e.stopPropagation()} 
          style={{ width: device.width, height: device.height }}
          className="bg-white border-[8px] border-[#1c1c1e] rounded-[3rem] shadow-2xl relative shrink-0 ring-1 ring-white/10"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-7 bg-[#1c1c1e] rounded-b-2xl z-50 pointer-events-none" />
          <div className="h-full w-full overflow-hidden bg-white rounded-[2.5rem]">
            <FlutterRenderer widget={layout} selectedId={selectedId} onSelect={onSelect} />
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 right-6 pointer-events-none opacity-40 text-[10px] text-zinc-500 font-mono">
        Scroll to Pan • Ctrl+Scroll to Zoom
      </div>
    </main>
  );
}