import { useState, useRef, useCallback } from "react";

type ResizeDirection = "left" | "right";

interface ResizeState {
  active: ResizeDirection | null;
  startX: number;
  startWidth: number;
  currentWidth: number;
  rafId: number | null;
}

export function useResizableLayout(
  initialLeftWidth = 280,
  initialRightWidth = 400
) {
  // --- STATE (Used for initial render and final save) ---
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [rightWidth, setRightWidth] = useState(initialRightWidth);
  const [isResizing, setIsResizing] = useState<ResizeDirection | null>(null);

  // --- REFS (Used for real-time updates) ---
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);

  // --- DRAG STATE (Persistent ref to track values without re-rendering) ---
  const dragRef = useRef<ResizeState>({
    active: null,
    startX: 0,
    startWidth: 0,
    currentWidth: 0,
    rafId: null,
  });

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current.active) return;

    // Cancel previous frame if it hasn't run yet
    if (dragRef.current.rafId) cancelAnimationFrame(dragRef.current.rafId);

    // Schedule visual update
    dragRef.current.rafId = requestAnimationFrame(() => {
      const { startX, startWidth, active } = dragRef.current;
      const delta = e.clientX - startX;
      let newWidth = startWidth;

      if (active === "left") {
        newWidth = Math.max(200, Math.min(600, startWidth + delta));
        if (leftSidebarRef.current) {
          leftSidebarRef.current.style.width = `${newWidth}px`;
        }
      } else {
        newWidth = Math.max(300, Math.min(800, startWidth - delta));
        if (rightSidebarRef.current) {
          rightSidebarRef.current.style.width = `${newWidth}px`;
        }
      }

      dragRef.current.currentWidth = newWidth;
    });
  }, []);

  const stopResize = useCallback(() => {
    // 1. Cleanup Listeners
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", stopResize);
    if (dragRef.current.rafId) cancelAnimationFrame(dragRef.current.rafId);

    // 2. Reset Cursor
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // 3. Sync Final Width to React State (Triggers re-render)
    const { active, currentWidth } = dragRef.current;
    if (active === "left") setLeftWidth(currentWidth);
    if (active === "right") setRightWidth(currentWidth);

    // 4. Reset Flags
    dragRef.current.active = null;
    setIsResizing(null);
  }, [onMouseMove]);

  const startResize = (direction: ResizeDirection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Initialize Drag Data
    dragRef.current = {
      active: direction,
      startX: e.clientX,
      startWidth: direction === "left" ? leftWidth : rightWidth,
      currentWidth: direction === "left" ? leftWidth : rightWidth,
      rafId: null,
    };

    // 2. Set UI State
    setIsResizing(direction);

    // 3. Global Cursor
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    // 4. Add Listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopResize);
  };

  return {
    leftWidth,
    rightWidth,
    isResizing,
    leftSidebarRef,
    rightSidebarRef,
    startResize,
  };
}