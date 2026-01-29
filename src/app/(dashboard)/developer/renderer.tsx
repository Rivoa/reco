'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { FlutterWidget, EdgeInsets, MainAxisAlignment, CrossAxisAlignment } from './types';

// --- UTILS (Keep existing) ---
const resolveEdgeInsets = (p?: EdgeInsets): string => {
  if (!p) return '0px';
  if (Array.isArray(p)) return `${p[0]}px ${p[1]}px ${p[2]}px ${p[3]}px`;
  return `${p}px`;
};

const resolveDimension = (val?: number | 'double.infinity'): string => {
  if (val === 'double.infinity') return '100%';
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

const resolveBoxFit = (fit?: string): React.CSSProperties['objectFit'] => {
  switch (fit) {
    case 'cover': return 'cover';
    case 'contain': return 'contain';
    case 'fill': return 'fill';
    case 'none': return 'none';
    case 'fitWidth': return 'contain';
    case 'fitHeight': return 'contain';
    default: return 'cover';
  }
};

const DynamicIcon = ({ name, size, color }: { name: string, size: number, color?: string }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name];
  if (!IconComponent) return <div className="w-6 h-6 bg-red-500/20 rounded-full" />;
  return <IconComponent size={size} color={color} />;
};

// --- RENDERER INTERFACE ---
// FIX: We explicitly allow 'null' here to match the Canvas state
interface RendererProps {
  widget: FlutterWidget | null;
  selectedId?: string | null; 
  onSelect?: (id: string) => void;
}

// --- MAIN COMPONENT ---
export function FlutterRenderer({ widget, selectedId, onSelect }: RendererProps) {
  if (!widget) return null;

  // 1. CLICK HANDLER
  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.stopPropagation(); // Prevent parent containers from stealing the click
      onSelect(widget.id);
    }
  };

  // 2. SELECTION STYLE
  const isSelected = widget.id === selectedId;
  const selectionStyle: React.CSSProperties = isSelected ? {
    outline: '2px solid #3b82f6',
    outlineOffset: '-2px',
    boxShadow: 'inset 0 0 0 2px rgba(59, 130, 246, 0.2)',
    zIndex: 10,
  } : {};

  // 3. WIDGET SWITCH
  switch (widget.type) {
    case 'Container':
      const { width, height, color, padding, margin, borderRadius, alignment } = widget.params;
      const isAligned = !!alignment;
      return (
        <div
          id={widget.id}
          onClick={handleClick}
          style={{
            ...selectionStyle,
            position: 'relative',
            boxSizing: 'border-box',
            display: isAligned ? 'flex' : 'block',
            justifyContent: alignment === 'center' ? 'center' : undefined,
            alignItems: alignment === 'center' ? 'center' : undefined,
            width: resolveDimension(width),
            height: resolveDimension(height),
            backgroundColor: color,
            padding: resolveEdgeInsets(padding),
            margin: resolveEdgeInsets(margin),
            borderRadius: borderRadius,
            overflow: borderRadius ? 'hidden' : undefined,
            minHeight: '1px', // Ensure empty containers are clickable
          }}
        >
          {widget.child && <FlutterRenderer widget={widget.child} selectedId={selectedId} onSelect={onSelect} />}
        </div>
      );

    case 'Padding':
      return (
        <div onClick={handleClick} style={{ ...selectionStyle, padding: resolveEdgeInsets(widget.params.padding), boxSizing: 'border-box' }}>
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
            gap: widget.params.gap ? `${widget.params.gap}px` : undefined,
            height: isCol ? '100%' : undefined,
            width: !isCol ? '100%' : undefined,
            minHeight: '20px', // Allow selection of empty rows/cols
          }}
        >
          {widget.children.map((child) => (
            <FlutterRenderer key={child.id} widget={child} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      );

    case 'Text':
      return (
        <span onClick={handleClick} style={{ 
          ...selectionStyle,
          color: widget.params.color,
          fontSize: widget.params.fontSize,
          fontWeight: widget.params.fontWeight === 'bold' ? 700 : 400,
          textAlign: widget.params.textAlign,
          display: 'block',
          cursor: 'default'
        }}>
          {widget.params.text}
        </span>
      );

    case 'Image':
      return (
        <img 
          onClick={handleClick}
          src={widget.params.src} 
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

    case 'Icon':
      return (
        <div onClick={handleClick} style={{ ...selectionStyle, display: 'inline-flex' }}>
          <DynamicIcon 
            name={widget.params.iconName} 
            size={widget.params.size || 24} 
            color={widget.params.color} 
          />
        </div>
      );
      
    case 'SizedBox':
      return (
        <div onClick={handleClick} style={{ 
          ...selectionStyle,
          width: resolveDimension(widget.params.width), 
          height: resolveDimension(widget.params.height),
          flexShrink: 0 
        }}>
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
      return null;
  }
}