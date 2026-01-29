// ============================================================================
// 1. CORE PRIMITIVES
// ============================================================================

export type Color = string; // Hex "#RRGGBB" or "#RRGGBBAA"
export type MainAxisAlignment = 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
export type CrossAxisAlignment = 'start' | 'center' | 'end' | 'stretch';
export type BoxFit = 'cover' | 'contain' | 'fill' | 'fitWidth' | 'fitHeight' | 'none';
export type EdgeInsets = number | [number, number, number, number] | string; // 10, [10,20,10,20], or "10, 20"
export type MainAxisSize = 'min' | 'max';

// ============================================================================
// 2. WIDGET-SPECIFIC PARAMS
// ============================================================================

export interface ContainerParams {
  width?: number | string | 'double.infinity';
  height?: number | string | 'double.infinity';
  color?: Color;
  padding?: EdgeInsets;
  margin?: EdgeInsets;
  borderRadius?: number | string;
  alignment?: 'center' | 'topLeft' | 'bottomRight';
  border?: string; // "1px solid #000"
  shadow?: string;
}

export interface FlexParams {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  mainAxisSize?: MainAxisSize;
  spacing?: number; // Used for 'gap'
}

export interface TextParams {
  text: string;
  fontSize?: number | string;
  fontWeight?: 'normal' | 'bold' | 'w300' | 'w400' | 'w500' | 'w600' | 'w700';
  color?: Color;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface ButtonParams {
  label?: string;
  icon?: string;
  color?: Color;
  textColor?: Color;
  padding?: EdgeInsets;
  borderRadius?: number | string;
  fontSize?: number | string;
}

export interface ImageParams {
  src: string;
  width?: number | string;
  height?: number | string;
  fit?: BoxFit;
  borderRadius?: number | string;
}

export interface IconParams {
  icon?: string; // Lucide icon name
  size?: number;
  color?: Color;
}

export interface ScaffoldParams {
  backgroundColor?: Color;
}

export interface AppBarParams {
  title: string;
  backgroundColor?: Color;
  foregroundColor?: Color;
  elevation?: number;
}

// ============================================================================
// 3. WIDGET DEFINITIONS
// ============================================================================

// --- LEAF WIDGETS (No Children) ---
export interface TextWidget {
  id: string;
  type: 'Text';
  params: TextParams;
}

export interface ImageWidget {
  id: string;
  type: 'Image';
  params: ImageParams;
}

export interface IconWidget {
  id: string;
  type: 'Icon';
  params: IconParams;
}

export interface ButtonWidget {
  id: string;
  type: 'Button';
  params: ButtonParams;
  actions?: any[]; // For navigation actions
}

export interface SpacerWidget {
  id: string;
  type: 'Spacer';
  params: { flex?: number };
}

// --- SINGLE CHILD WIDGETS ---
export interface ContainerWidget {
  id: string;
  type: 'Container';
  params: ContainerParams;
  child?: FlutterWidget;
}

export interface PaddingWidget {
  id: string;
  type: 'Padding';
  params: { padding: EdgeInsets };
  child?: FlutterWidget;
}

export interface CenterWidget {
  id: string;
  type: 'Center';
  params?: {};
  child?: FlutterWidget;
}

export interface SizedBoxWidget {
  id: string;
  type: 'SizedBox';
  params: { width?: number | string; height?: number | string };
  child?: FlutterWidget;
}

export interface ExpandedWidget {
  id: string;
  type: 'Expanded';
  params: { flex?: number };
  child: FlutterWidget;
}

// --- MULTI CHILD WIDGETS ---
export interface FlexWidget {
  id: string;
  type: 'Column' | 'Row';
  params: FlexParams;
  children: FlutterWidget[];
}

export interface StackWidget {
  id: string;
  type: 'Stack';
  params?: {};
  children: FlutterWidget[];
}

// --- STRUCTURAL WIDGETS ---
export interface AppBarWidget {
  id: string;
  type: 'AppBar';
  params: AppBarParams;
}

export interface ScaffoldWidget {
  id: string;
  type: 'Scaffold';
  params: ScaffoldParams;
  appBar?: FlutterWidget; // Specifically expects 'AppBar' type logically
  body?: FlutterWidget;
  floatingActionButton?: FlutterWidget;
}

// ============================================================================
// 4. MASTER UNION TYPE
// ============================================================================

export type FlutterWidget = 
  | TextWidget
  | ImageWidget
  | IconWidget
  | ButtonWidget
  | SpacerWidget
  | ContainerWidget
  | PaddingWidget
  | CenterWidget
  | SizedBoxWidget
  | ExpandedWidget
  | FlexWidget
  | StackWidget
  | ScaffoldWidget
  | AppBarWidget;

export type FlutterWidgetType = FlutterWidget['type'];

// ============================================================================
// 5. APP & DEVICE CONFIG
// ============================================================================

export interface DeviceConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  pixelRatio?: number;
}

export const DEVICES: DeviceConfig[] = [
  { id: 'iphone-15', name: 'iPhone 15', width: 393, height: 852, pixelRatio: 3.0 },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, pixelRatio: 2.6 },
  { id: 'ipad-pro', name: 'iPad Pro', width: 834, height: 1194, pixelRatio: 2.0 },
];

export interface AppScreen {
  id: string;
  name: string;
  description?: string;
  layout: FlutterWidget;
  updated_at?: string;
}