// ============================================================================
// 1. CORE PRIMITIVES (Reused across widgets)
// ============================================================================

export type Color = string; // Hex "#RRGGBB" or "#RRGGBBAA"
export type MainAxisAlignment = 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
export type CrossAxisAlignment = 'start' | 'center' | 'end' | 'stretch';
export type BoxFit = 'cover' | 'contain' | 'fill' | 'fitWidth' | 'fitHeight' | 'none';
export type EdgeInsets = number | [number, number, number, number]; // All or [T, R, B, L]

// ============================================================================
// 2. WIDGET-SPECIFIC PARAMS
// ============================================================================

export interface ContainerParams {
  width?: number | 'double.infinity';
  height?: number | 'double.infinity';
  color?: Color;
  padding?: EdgeInsets;
  margin?: EdgeInsets;
  borderRadius?: number;
  alignment?: 'center' | 'topLeft' | 'bottomRight'; // etc
}

export interface FlexParams {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  gap?: number; // Flutter commonly uses gap now instead of SizedBox spacers
}

export interface TextParams {
  text: string; // Required
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'w300' | 'w400' | 'w500' | 'w600' | 'w700';
  color?: Color;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface ImageParams {
  src: string; // Renamed from imageUrl for clarity, or keep imageUrl
  width?: number;
  height?: number;
  fit?: BoxFit;
  borderRadius?: number;
}

export interface IconParams {
  iconName: string; // e.g. "home", "settings" (Map to Lucide or Material)
  size?: number;
  color?: Color;
}

// ============================================================================
// 3. THE DISCRIMINATED WIDGET UNION
// ============================================================================

/* We split widgets into categories based on their children structure.
   This prevents adding children to a Text widget, or multiple children to a Container.
*/

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
  child?: FlutterWidget; // Singular 'child'
}

export interface PaddingWidget {
  id: string;
  type: 'Padding';
  params: { padding: EdgeInsets };
  child?: FlutterWidget;
}

export interface SizedBoxWidget {
  id: string;
  type: 'SizedBox';
  params: { width?: number; height?: number };
  child?: FlutterWidget;
}

export interface ExpandedWidget {
  id: string;
  type: 'Expanded';
  params: { flex?: number };
  child: FlutterWidget; // Expanded MUST have a child
}

// --- MULTI CHILD WIDGETS ---
export interface FlexWidget {
  id: string;
  type: 'Column' | 'Row';
  params: FlexParams;
  children: FlutterWidget[]; // Plural 'children'
}

// --- THE MASTER UNION TYPE ---
export type FlutterWidget = 
  | TextWidget
  | ImageWidget
  | IconWidget
  | SpacerWidget
  | ContainerWidget
  | PaddingWidget
  | SizedBoxWidget
  | ExpandedWidget
  | FlexWidget;

// Helper to extract the specific string types if needed
export type FlutterWidgetType = FlutterWidget['type'];

// ============================================================================
// 4. APP & DEVICE CONFIG
// ============================================================================

export interface DeviceConfig {
  id: string; // Added ID as requested
  name: string;
  width: number;
  height: number;
  pixelRatio?: number; // Useful for accurate font rendering
}

export const DEVICES: DeviceConfig[] = [
  { id: 'iphone-15', name: 'iPhone 15', width: 393, height: 852, pixelRatio: 3.0 },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, pixelRatio: 2.6 },
  { id: 'ipad-pro', name: 'iPad Pro', width: 834, height: 1194, pixelRatio: 2.0 },
];

export interface AppScreen {
  id: string;
  name: string;
  layout: FlutterWidget;
}