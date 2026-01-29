'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { FlutterWidget, EdgeInsets, MainAxisAlignment, CrossAxisAlignment } from './types';

// --- UTILS ---
const resolveEdgeInsets = (p?: EdgeInsets): string => {
  if (!p) return '0px';
  if (Array.isArray(p)) return `${p[0]}px ${p[1]}px ${p[2]}px ${p[3]}px`; // [L, T, R, B]
  if (typeof p === 'string') {
      const parts = p.split(',').map(s => s.trim() + 'px');
      return parts.join(' ');
  }
  return `${p}px`;
};

const resolveBoxFit = (fit?: string): React.CSSProperties['objectFit'] => {
  switch (fit) {
    case 'cover': return 'cover';
    case 'contain': return 'contain';
    case 'fill': return 'fill';
    case 'none': return 'none';
    case 'scaleDown': return 'scale-down';
    // Map Flutter-specific logic to the closest CSS equivalent
    case 'fitWidth': return 'contain'; 
    case 'fitHeight': return 'contain';
    default: return 'cover';
  }
};

const resolveDimension = (val?: number | string): string => {
  if (val === 'double.infinity' || val === '100%') return '100%';
  if (typeof val === 'number') return `${val}px`;
  return 'auto';
};

const resolveMainAxis = (alignment?: MainAxisAlignment): string => {
  switch (alignment) {
    case 'center': return 'center';
    case 'end': return 'flex-end';
    case 'spaceBetween': return 'space-between';
    case 'spaceAround': return 'space-around';
    case 'spaceEvenly': return 'space-evenly';
    default: return 'flex-start';
  }
};

const resolveCrossAxis = (alignment?: CrossAxisAlignment): string => {
  switch (alignment) {
    case 'center': return 'center';
    case 'end': return 'flex-end';
    case 'stretch': return 'stretch';
    default: return 'flex-start';
  }
};

const DynamicIcon = ({ name, size, color }: { name: string, size: number, color?: string }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name.charAt(0).toUpperCase() + name.slice(1)]; // Ensure capital casing
  if (!IconComponent) return <div className="w-6 h-6 bg-red-500/20 rounded-full" />;
  return <IconComponent size={size} color={color} />;
};

// --- RENDERER PROPS ---
interface RendererProps {
  widget: FlutterWidget | null;
  selectedId?: string | null; 
  onSelect?: (id: string) => void;
}

// --- MAIN COMPONENT ---
export function FlutterRenderer({ widget, selectedId, onSelect }: RendererProps) {
  if (!widget) return null;

  // 1. CLICK HANDLER (Stops propagation so we select the specific child, not the parent)
  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.stopPropagation();
      onSelect(widget.id);
    }
  };

  // 2. SELECTION VISUALS
  const isSelected = widget.id === selectedId;
  const selectionStyle: React.CSSProperties = isSelected ? {
    outline: '2px solid #3b82f6',
    outlineOffset: '-2px',
    boxShadow: 'inset 0 0 0 2px rgba(59, 130, 246, 0.2)',
    zIndex: 50,
  } : {};

  // 3. WIDGET SWITCH
  switch (widget.type) {
    
    // --- LAYOUT STRUCTURES ---
    case 'Scaffold':
      // Scaffolds take up the full screen height usually
      return (
        <div 
          id={widget.id}
          onClick={handleClick}
          style={{ 
            ...selectionStyle,
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            width: '100%',
            backgroundColor: widget.params.backgroundColor || '#ffffff',
            position: 'relative'
          }}
        >
          {/* AppBar Slot */}
          {widget.appBar && (
            <div className="shrink-0 z-10">
              <FlutterRenderer widget={widget.appBar} selectedId={selectedId} onSelect={onSelect} />
            </div>
          )}
          
          {/* Body Slot */}
          <div className="flex-1 overflow-auto relative">
             {widget.body && <FlutterRenderer widget={widget.body} selectedId={selectedId} onSelect={onSelect} />}
          </div>

          {/* Floating Action Button Slot (Optional) */}
          {widget.floatingActionButton && (
             <div className="absolute bottom-4 right-4 z-20">
                <FlutterRenderer widget={widget.floatingActionButton} selectedId={selectedId} onSelect={onSelect} />
             </div>
          )}
        </div>
      );

    case 'AppBar':
      return (
        <header 
          id={widget.id}
          onClick={handleClick}
          style={{ 
            ...selectionStyle,
            height: '56px',
            backgroundColor: widget.params.backgroundColor || '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            color: widget.params.foregroundColor || '#ffffff',
            boxShadow: widget.params.elevation ? `0 ${widget.params.elevation}px ${widget.params.elevation * 2}px rgba(0,0,0,0.1)` : 'none'
          }}
        >
           <h1 style={{ fontSize: '20px', fontWeight: 500 }}>{widget.params.title}</h1>
        </header>
      );

    case 'Container':
      const { width, height, color, padding, margin, borderRadius, alignment, border, shadow } = widget.params;
      const isFlexContainer = !!alignment;
      return (
        <div
          id={widget.id}
          onClick={handleClick}
          style={{
            ...selectionStyle,
            position: 'relative',
            boxSizing: 'border-box',
            // Flex handling for alignment property
            display: isFlexContainer ? 'flex' : 'block',
            justifyContent: alignment === 'center' ? 'center' : undefined,
            alignItems: alignment === 'center' ? 'center' : undefined,
            // Dimensions
            width: resolveDimension(width),
            height: resolveDimension(height),
            // Appearance
            backgroundColor: color,
            padding: resolveEdgeInsets(padding),
            margin: resolveEdgeInsets(margin),
            borderRadius: borderRadius,
            border: border, // e.g., "1px solid red"
            boxShadow: shadow,
            overflow: borderRadius ? 'hidden' : undefined,
            minHeight: '20px', // Hitbox for empty containers
          }}
        >
          {widget.child && <FlutterRenderer widget={widget.child} selectedId={selectedId} onSelect={onSelect} />}
        </div>
      );

    case 'Center':
      return (
        <div 
          id={widget.id}
          onClick={handleClick}
          style={{ 
            ...selectionStyle, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            height: '100%' 
          }}
        >
           {widget.child && <FlutterRenderer widget={widget.child} selectedId={selectedId} onSelect={onSelect} />}
        </div>
      );

    case 'Padding':
      return (
        <div 
          id={widget.id}
          onClick={handleClick} 
          style={{ ...selectionStyle, padding: resolveEdgeInsets(widget.params.padding), boxSizing: 'border-box', width: '100%', height: '100%' }}
        >
           {widget.child && <FlutterRenderer widget={widget.child} selectedId={selectedId} onSelect={onSelect} />}
        </div>
      );

    case 'Column':
    case 'Row':
      const isCol = widget.type === 'Column';
      return (
        <div
          id={widget.id}
          onClick={handleClick}
          style={{
            ...selectionStyle,
            display: 'flex',
            flexDirection: isCol ? 'column' : 'row',
            justifyContent: resolveMainAxis(widget.params.mainAxisAlignment),
            alignItems: resolveCrossAxis(widget.params.crossAxisAlignment),
            gap: widget.params.spacing ? `${widget.params.spacing}px` : undefined,
            height: isCol ? (widget.params.mainAxisSize === 'min' ? 'auto' : '100%') : undefined,
            width: !isCol ? (widget.params.mainAxisSize === 'min' ? 'auto' : '100%') : undefined,
            minHeight: '20px',
            minWidth: '20px'
          }}
        >
          {widget.children?.map((child: FlutterWidget) => (
            <FlutterRenderer key={child.id} widget={child} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      );

    case 'Stack':
      return (
         <div
           id={widget.id}
           onClick={handleClick}
           style={{
             ...selectionStyle,
             position: 'relative',
             width: '100%',
             height: '100%'
           }}
         >
           {widget.children?.map((child: FlutterWidget) => (
             <FlutterRenderer key={child.id} widget={child} selectedId={selectedId} onSelect={onSelect} />
           ))}
         </div>
      );

    // --- BASIC ELEMENTS ---
    case 'Text':
      return (
        <p 
          id={widget.id}
          onClick={handleClick} 
          style={{ 
            ...selectionStyle,
            margin: 0,
            color: widget.params.color,
            fontSize: widget.params.fontSize,
            fontWeight: widget.params.fontWeight === 'bold' ? 700 : 400,
            textAlign: widget.params.textAlign,
            lineHeight: 1.5,
            cursor: 'default'
          }}
        >
          {widget.params.text || "Text"}
        </p>
      );

    case 'Button':
      return (
        <button
          id={widget.id}
          onClick={handleClick}
          style={{
            ...selectionStyle,
            backgroundColor: widget.params.color || '#3b82f6',
            color: widget.params.textColor || '#ffffff',
            padding: resolveEdgeInsets(widget.params.padding || '12, 24, 12, 24'),
            borderRadius: widget.params.borderRadius || '8px',
            border: 'none',
            fontSize: widget.params.fontSize || '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {widget.params.icon && <DynamicIcon name={widget.params.icon} size={16} />}
          {widget.params.label || "Button"}
        </button>
      );

    case 'Icon':
      return (
        <div id={widget.id} onClick={handleClick} style={{ ...selectionStyle, display: 'inline-flex' }}>
          <DynamicIcon 
            name={widget.params.icon || 'circle'} 
            size={widget.params.size || 24} 
            color={widget.params.color} 
          />
        </div>
      );

      case 'Image':
        return (
          <img 
            id={widget.id}
            onClick={handleClick}
            src={widget.params.src || 'https://via.placeholder.com/150'} 
            alt="asset"
            style={{
              ...selectionStyle,
              width: resolveDimension(widget.params.width),
              height: resolveDimension(widget.params.height),
              objectFit: resolveBoxFit(widget.params.fit), 
              borderRadius: widget.params.borderRadius,
              display: 'block'
            }}
          />
        );
      
    case 'SizedBox':
      return (
        <div 
          id={widget.id}
          onClick={handleClick} 
          style={{ 
            ...selectionStyle,
            width: resolveDimension(widget.params.width), 
            height: resolveDimension(widget.params.height),
            flexShrink: 0 
          }}
        >
          {widget.child && <FlutterRenderer widget={widget.child} selectedId={selectedId} onSelect={onSelect} />}
        </div>
      );

    case 'Expanded':
      return (
        <div style={{ flex: widget.params.flex || 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <FlutterRenderer widget={widget.child} selectedId={selectedId} onSelect={onSelect} />
        </div>
      );

    default:
      return <div style={{ color: 'red', fontSize: 10 }}>Unknown Widget: {widget.type}</div>;
  }
}