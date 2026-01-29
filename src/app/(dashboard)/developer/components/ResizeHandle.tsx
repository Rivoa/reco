import React from "react";

interface ResizeHandleProps {
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  position: "left" | "right";
}

export function ResizeHandle({ isResizing, onMouseDown, position }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`
        absolute top-0 w-3 h-full cursor-col-resize z-50 flex justify-center group transition-colors
        ${position === "left" ? "right-[-6px]" : "left-[-6px]"}
        ${isResizing ? "bg-blue-600/20" : "hover:bg-blue-500/10"}
      `}
    >
      <div 
        className={`w-[1px] h-full bg-white/5 group-hover:bg-blue-500 transition-colors 
        ${isResizing ? "bg-blue-500" : ""}`} 
      />
    </div>
  );
}