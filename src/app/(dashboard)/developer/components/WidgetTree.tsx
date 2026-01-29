"use client";

import { useState } from "react";
import { ChevronRight, LayoutTemplate, Type, Box, Columns, MousePointerClick, Image as ImageIcon } from "lucide-react";
import { FlutterWidget } from "../types";

interface WidgetTreeProps {
  widget: FlutterWidget;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function WidgetTree({ widget, depth = 0, selectedId, onSelect }: WidgetTreeProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!widget) return null;

  // --- 1. ROBUST CHILDREN EXTRACTION ---
  // We explicitly extract children based on widget type to ensure nothing is missed
  let children: FlutterWidget[] = [];

  if (widget.type === 'Scaffold') {
    // Scaffold has specific named slots
    if (widget.appBar) children.push(widget.appBar);
    if (widget.body) children.push(widget.body);
    if (widget.floatingActionButton) children.push(widget.floatingActionButton);
  } 
  else if ('children' in widget && Array.isArray(widget.children)) {
    // Multi-child (Row, Column, Stack)
    children = widget.children;
  } 
  else if ('child' in widget && widget.child) {
    // Single-child (Container, Center, SizedBox, Padding, Expanded)
    children = [widget.child];
  }

  const hasChildren = children.length > 0;
  const isSelected = widget.id === selectedId;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Optional: Get icon based on type
  const getIcon = () => {
    switch (widget.type) {
        case 'Scaffold': return <LayoutTemplate size={12} className="text-blue-500" />;
        case 'Text': return <Type size={12} className="text-zinc-500" />;
        case 'Button': return <MousePointerClick size={12} className="text-yellow-500" />;
        case 'Image': return <ImageIcon size={12} className="text-pink-500" />;
        case 'Row': 
        case 'Column': return <Columns size={12} className={widget.type === 'Column' ? 'rotate-90 text-green-500' : 'text-green-500'} />;
        default: return <Box size={12} className="text-zinc-600" />;
    }
  };

  return (
    <div className="select-none font-mono">
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(widget.id);
        }}
        className={`
          flex items-center gap-2 text-[11px] py-1.5 px-3 cursor-pointer transition-colors border-l-2
          ${isSelected 
            ? 'bg-blue-500/20 text-blue-400 border-blue-500' 
            : 'border-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-200'}
        `}
        style={{ paddingLeft: (depth * 14) + 12 }}
      >
        {/* Toggle Chevron */}
        <div 
          onClick={hasChildren ? handleToggle : undefined}
          className={`
            transition-transform duration-200 flex items-center justify-center w-3 h-3
            ${hasChildren ? 'opacity-100 hover:bg-white/10 rounded cursor-pointer' : 'opacity-0 pointer-events-none'}
            ${isOpen ? 'rotate-90' : 'rotate-0'}
          `}
        >
          <ChevronRight size={10} />
        </div>

        {/* Icon */}
        <div className="opacity-80">{getIcon()}</div>

        {/* Widget Label */}
        <span className={isSelected ? "font-bold" : "font-normal"}>{widget.type}</span>
        
        {/* Helper Text (ID) */}
        <span className="ml-auto text-[9px] opacity-30 truncate max-w-[60px] font-sans">
          {widget.id.slice(-4)}
        </span>
      </div>
      
      {/* Children Rendering */}
      {hasChildren && isOpen && (
        <div className="flex flex-col">
          {children.map((c) => (
            <WidgetTree 
              key={c.id} 
              widget={c} 
              depth={depth + 1} 
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}