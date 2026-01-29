"use client"; // Important since we use useState

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { FlutterWidget } from "../types";

interface WidgetTreeProps {
  widget: FlutterWidget;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function WidgetTree({ widget, depth = 0, selectedId, onSelect }: WidgetTreeProps) {
  // State to track if children are visible. Default to true (expanded).
  const [isOpen, setIsOpen] = useState(true);

  if (!widget) return null;

  // Strict Type Logic to determine children
  let children: FlutterWidget[] = [];
  if (widget.type === 'Row' || widget.type === 'Column') {
    children = widget.children;
  } else if ('child' in widget && widget.child) {
    children = [widget.child];
  }

  const hasChildren = children.length > 0;
  const isSelected = widget.id === selectedId;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering selection when just toggling
    setIsOpen(!isOpen);
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
        {/* Toggle Button / Chevron */}
        <div 
          onClick={hasChildren ? handleToggle : undefined}
          className={`
            transition-transform duration-200 flex items-center justify-center w-3 h-3
            ${hasChildren ? 'opacity-100 hover:bg-white/10 rounded' : 'opacity-0 pointer-events-none'}
            ${isOpen ? 'rotate-90' : 'rotate-0'}
          `}
        >
          <ChevronRight size={10} />
        </div>

        {/* Widget Label */}
        <span className={isSelected ? "font-bold" : "font-normal"}>{widget.type}</span>
        
        {/* Helper Text (e.g. for Text widgets) */}
        {widget.type === 'Text' && 'params' in widget && (
          <span className="ml-auto text-[9px] opacity-50 truncate max-w-[80px]">
            "{(widget.params as any).text}"
          </span>
        )}
      </div>
      
      {/* Children Rendering (Conditionally Hidden) */}
      {hasChildren && isOpen && (
        <div className="flex flex-col">
          {children.map((c, i) => (
            <WidgetTree 
              key={c.id || i} 
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