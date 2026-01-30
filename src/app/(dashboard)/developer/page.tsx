"use client";

import React, { useState, useEffect } from "react";
import { AppScreen, DEVICES, FlutterWidget } from "./types";
import { ScreenService } from "@/services/screenService";

// Hooks
import { useResizableLayout } from "@/components/resize";

// Components
import { Header } from "./components/Header";
import { WidgetTree } from "./components/WidgetTree";
import { Canvas } from "./components/Canvas";
import { ResizeHandle } from "./components/ResizeHandle";
import { ScreenManager } from "./components/ScreenManager";
import { EditorPanel } from "./components/EditorPanel";
import { FileJson, Plus, Loader2, Code, PanelLeftClose, PanelRightClose, Layers } from "lucide-react";

const DEFAULT_LAYOUT: FlutterWidget = {
  id: "root",
  type: "Container",
  params: { color: "#FFFFFF", alignment: "center" },
  child: { id: "t1", type: "Text", params: { text: "Start Building...", fontSize: 20, color: "#9CA3AF" } }
};

export default function ArchitectIDE() {
  // --- RESIZE LOGIC (Extracted) ---
  const { 
    leftWidth, 
    rightWidth, 
    isResizing, 
    leftSidebarRef, 
    rightSidebarRef, 
    startResize 
  } = useResizableLayout(280, 400);

  // --- STATE ---
  const [screens, setScreens] = useState<AppScreen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeScreenId, setActiveScreenId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const activeScreen = screens.find(s => s.id === activeScreenId);

  // Editor State
  const [layout, setLayout] = useState<FlutterWidget>(DEFAULT_LAYOUT);
  const [json, setJson] = useState("{}"); 

  // UI State
  const [activeDevice, setActiveDevice] = useState(DEVICES[0]);
  const [zoom, setZoom] = useState(0.85);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  
  // Sidebar Visibility
  const [isScreensOpen, setIsScreensOpen] = useState(true);
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ScreenService.getScreens();
        if (data.length > 0) {
          setScreens(data);
          setActiveScreenId(data[0].id);
          setLayout(data[0].layout);
          setJson(JSON.stringify(data[0].layout, null, 2));
        } else {
          await handleAddScreen();
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  // --- SYNC LOGIC ---
  useEffect(() => {
    if (!activeScreen) return;
    setLayout(activeScreen.layout);
    setJson(JSON.stringify(activeScreen.layout, null, 2));
    setSelectedWidgetId(null);
    setHasUnsavedChanges(false);
  }, [activeScreenId]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(json);
      setLayout(parsed);
      setHasUnsavedChanges(true);
    } catch {}
  }, [json]);

  const handleSave = async () => {
    if (!activeScreenId) return;
    setIsSaving(true);
    try {
      const parsed = JSON.parse(json);
      await ScreenService.updateLayout(activeScreenId, parsed);
      setScreens(prev => prev.map(s => s.id === activeScreenId ? { ...s, layout: parsed } : s));
      setHasUnsavedChanges(false);
    } catch { alert("Invalid JSON"); } finally { setIsSaving(false); }
  };

  const handleAddScreen = async () => {
    const name = `Screen ${screens.length + 1}`;
    try {
      const newScreen = await ScreenService.createScreen(name, DEFAULT_LAYOUT);
      setScreens(prev => [...prev, newScreen]);
      setActiveScreenId(newScreen.id);
      setIsScreensOpen(true);
      setShowLeftSidebar(true);
    } catch {}
  };

  const handleDeleteScreen = async (id: string) => {
    if (screens.length <= 1) return;
    try {
      const newScreens = screens.filter(s => s.id !== id);
      setScreens(newScreens);
      if (activeScreenId === id) setActiveScreenId(newScreens[0].id);
      await ScreenService.deleteScreen(id);
    } catch {}
  };

  if (isLoading) return <div className="h-full w-full flex items-center justify-center bg-[#0b0d10] text-zinc-500 gap-2"><Loader2 className="animate-spin" /> Loading Architect...</div>;

  return (
    <div className="flex flex-col h-full w-full bg-[#0b0d10] text-zinc-300 font-inter overflow-hidden select-none">
      
      {/* Overlay for Dragging */}
      {isResizing && <div className="fixed inset-0 z-[9999] cursor-col-resize bg-transparent" />}

      <Header 
        activeDevice={activeDevice} 
        setActiveDevice={setActiveDevice} 
        devices={DEVICES} 
        onSave={handleSave} 
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- LEFT SIDEBAR --- */}
        <div 
          ref={leftSidebarRef} 
          className="flex shrink-0 transition-none ease-linear overflow-hidden relative border-r border-white/5 bg-[#0f1117]"
          style={{ width: showLeftSidebar ? leftWidth : 48 }}
        >
          {/* ACTIVITY BAR */}
          <nav className="w-12 shrink-0 bg-[#0b0d10] border-r border-white/5 flex flex-col items-center py-4 gap-4 z-20 h-full relative">
            <button 
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={`p-2 rounded-lg transition-colors ${showLeftSidebar ? 'bg-blue-600/10 text-blue-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
              <Layers size={20} />
            </button>

            
          </nav>

          {/* SIDEBAR CONTENT */}
          <div className="flex-1 flex flex-col min-w-[200px] relative"> 
            
            <div className="flex items-center justify-between h-9 px-3 bg-[#13151b] border-b border-white/5 shrink-0">
               <span className="text-[10px] font-bold tracking-[0.1em] text-zinc-500">EXPLORER</span>
               <button onClick={() => setShowLeftSidebar(false)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                 <PanelLeftClose size={14} />
               </button>
            </div>

            <div className={`flex flex-col border-b border-white/5 overflow-hidden transition-all duration-300 ${isScreensOpen ? (isLayersOpen ? 'flex-1' : 'flex-[1]') : 'flex-none h-9'}`}>
              <PanelHeader title="SCREENS" isOpen={isScreensOpen} onToggle={() => setIsScreensOpen(!isScreensOpen)} action={<Plus size={14} className="cursor-pointer hover:text-white" onClick={handleAddScreen} />} />
              {isScreensOpen && <ScreenManager screens={screens} activeScreenId={activeScreenId!} onSelect={setActiveScreenId} onAdd={handleAddScreen} onDelete={handleDeleteScreen} />}
            </div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isLayersOpen ? (isScreensOpen ? 'flex-[1.5]' : 'flex-1') : 'flex-none h-9'}`}>
               <PanelHeader title="LAYERS" isOpen={isLayersOpen} onToggle={() => setIsLayersOpen(!isLayersOpen)} />
               {isLayersOpen && <div className="flex-1 overflow-y-auto custom-scrollbar py-2"><WidgetTree widget={layout} selectedId={selectedWidgetId} onSelect={setSelectedWidgetId} /></div>}
            </div>
            
            {/* RESIZE HANDLE */}
            <ResizeHandle isResizing={isResizing === 'left'} onMouseDown={(e) => startResize("left", e)} position="left" />
          </div>
        </div>

        {/* --- CENTER CANVAS --- */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <Canvas 
            layout={layout}
            device={activeDevice}
            zoom={zoom}
            setZoom={setZoom}
            isResizing={!!isResizing} 
            selectedId={selectedWidgetId}
            onSelect={setSelectedWidgetId}
          />
          
          {!showRightSidebar && (
            <button 
              onClick={() => setShowRightSidebar(true)}
              className="absolute top-6 right-6 z-40 p-2.5 bg-[#1a1d24] text-zinc-400 hover:text-white border border-white/10 rounded-full shadow-xl hover:scale-110 transition-all group"
            >
              <Code size={18} />
            </button>
          )}
        </div>

        {/* --- RIGHT SIDEBAR --- */}
        <aside 
          ref={rightSidebarRef}
          className="flex flex-col shrink-0 bg-[#0f1117] border-l border-white/5 relative transition-none ease-linear"
          style={{ width: showRightSidebar ? rightWidth : 0, opacity: showRightSidebar ? 1 : 0 }}
        >
          <div className="w-full h-full flex flex-col min-w-[300px]">
            {/* RESIZE HANDLE */}
            <ResizeHandle isResizing={isResizing === 'right'} onMouseDown={(e) => startResize("right", e)} position="right" />
            
            <div className="h-9 px-3 flex items-center justify-between bg-[#13151b] border-b border-white/5 shrink-0 select-none">
              <div className="flex items-center gap-2 text-zinc-500">
                <FileJson size={14} />
                <span className="text-[10px] font-bold tracking-[0.1em]">PROPERTIES</span>
              </div>
              <button onClick={() => setShowRightSidebar(false)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                 <PanelRightClose size={14} />
              </button>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
              <EditorPanel 
                code={json} 
                onChange={(value) => setJson(value || "")} 
              />
            </div>
          </div>
        </aside>

      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 5px; border: 2px solid #0f1117; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}

// Sub-components kept as is...
interface PanelHeaderProps { title: string; icon?: React.ReactNode; action?: React.ReactNode; isOpen?: boolean; onToggle?: () => void; }
function PanelHeader({ title, icon, action, isOpen = true, onToggle }: PanelHeaderProps) {
   return (
    <div onClick={onToggle} className={`h-9 px-2 flex items-center justify-between bg-[#13151b] border-b border-white/5 shrink-0 select-none ${onToggle ? 'cursor-pointer hover:bg-white/5' : ''}`}>
      <div className="flex items-center gap-1">
         {/* @ts-ignore */}
         {onToggle && <div className={`transition-transform duration-200 text-zinc-500 ${isOpen ? 'rotate-90' : 'rotate-0'}`}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>}
         <span className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 ml-1">{title}</span>
      </div>
      <div className="flex items-center gap-2 text-zinc-500">
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
        {icon}
      </div>
    </div>
  );
}