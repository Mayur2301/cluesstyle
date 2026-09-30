// Shirt view types
export type ShirtViewCustomized = 'front' | 'back' | 'left' | 'right';

// Element types (based on your actual usage)
export type ElementType = 'text' | 'logo';

// Base element (shared fields)
type BaseElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  view: ShirtViewCustomized;
  visible?: boolean; // optional to avoid breaking existing code
};

// Text element
export type TextElement = BaseElement & {
  type: 'text';
  content: string;
  fontSize: number;
  color: string;
};

// Logo/Image element
export type LogoElement = BaseElement & {
  type: 'logo';
  imageUrl: string;
  content?: string; // optional (since you're also passing it)
};

// Final union
export type DesignElementCustomized = TextElement | LogoElement;