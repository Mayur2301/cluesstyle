'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X, Upload, Type, Plus, Trash2, Copy,
  Save, Layers, Crop, AlignLeft, AlignCenter, AlignRight,
  Eye, Undo, Redo, Check,
  Image as ImageIcon, Bold, Italic,
  Filter, ChevronLeft,
  Package, Search, Smile,
  Hash, AlertCircle,
} from 'lucide-react';

// ─── Emoji data ────────────────────────────────────────────────────────────────
const emojis = [
  { char: '😀', name: 'Grinning Face' },
  { char: '😂', name: 'Face with Tears of Joy' },
  { char: '😍', name: 'Heart Eyes' },
  { char: '🥰', name: 'Smiling with Hearts' },
  { char: '😎', name: 'Cool Face' },
  { char: '🤔', name: 'Thinking Face' },
  { char: '😢', name: 'Crying Face' },
  { char: '🔥', name: 'Fire' },
  { char: '❤️', name: 'Red Heart' },
  { char: '⭐', name: 'Star' },
  { char: '🎨', name: 'Artist Palette' },
  { char: '⚽', name: 'Soccer Ball' },
  { char: '🏀', name: 'Basketball' },
  { char: '🎸', name: 'Guitar' },
];

// ─── Font options ──────────────────────────────────────────────────────────────
const fontOptions = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
];
const SIDEBAR_HEIGHT = 'h-[655px]'; // adjust as needed
// ─── Types ─────────────────────────────────────────────────────────────────────
type ShirtView = 'front' | 'back' | 'left' | 'right';
type SidebarTab = 'upload' | 'text' | 'art' | 'product' | 'names' | 'categories';

interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  availableViews: ShirtView[];
}

interface ProductItem {
  id: string;
  name: string;
  categoryId: string;
  images: { front: string; back?: string; left?: string; right?: string };
  previewColor: string;
  borderColor: string;
}

interface DesignElement {
  id: string;
  type: 'text' | 'logo' | 'emoji' | 'number';
  content: string;
  // x / y are stored in IMAGE-RELATIVE coordinates (pixels from image top-left)
  x: number;
  y: number;
  scale: number;
  rotation: number;
  view: ShirtView;
  fontSize?: number;
  color?: string;
  imageUrl?: string;
  isBlackWhite?: boolean;
  opacity?: number;
  zIndex?: number;
  locked?: boolean;
  visible?: boolean;
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

interface SavedDesign {
  id: string;
  name: string;
  date: string;
  elements: DesignElement[];
  productId: string;
  categoryId: string;
  thumbnail: string;
}

// ─── Static data ───────────────────────────────────────────────────────────────
const productCategories: ProductCategory[] = [
//   { id: 't-shirt', name: 'T-Shirts', icon: '/cluesstyle-icons/t-shirt-icon.png', availableViews: ['front', 'back', 'left', 'right'] },
 // { id: 'bags', name: 'Bags', icon: '/cluesstyle-icons/bags-icon.png', availableViews: ['front'] },
//   { id: 'embroidery', name: 'Embroidery', icon: '/cluesstyle-icons/embriodery-icon.png', availableViews: ['front'] },
  { id: 'bottles', name: 'Bottles', icon: '/cluesstyle-icons/bottle-icon.png', availableViews: ['front'] },
//   { id: 'cups', name: 'Cups', icon: '/cluesstyle-icons/cups-icon.png', availableViews: ['front'] },
//   { id: 'hoodies', name: 'Hoodies', icon: '/cluesstyle-icons/hoodies-icon.png', availableViews: ['front', 'back', 'left', 'right'] },
//   { id: 'caps', name: 'Caps', icon: '/cluesstyle-icons/caps-icon.png', availableViews: ['front', 'back'] },
];

const productSets: ProductItem[] = [
  // T-Shirts
  { id: 'aqua', name: 'Aqua', categoryId: 't-shirt', images: { front: '/t-shirts/aqua-color-t-shirt-view/Front-Facing.png', back: '/t-shirts/aqua-color-t-shirt-view/Back-Facing.png', left: '/t-shirts/aqua-color-t-shirt-view/Left-Facing.png', right: '/t-shirts/aqua-color-t-shirt-view/Right-Facing.png' }, previewColor: 'bg-[#85d1e9]', borderColor: 'border-gray-300' },
  { id: 'turquoise-blue', name: 'Turquoise Blue', categoryId: 't-shirt', images: { front: '/t-shirts/turquoise-blue/front-facing.png', back: '/t-shirts/turquoise-blue/back-facing.png', left: '/t-shirts/turquoise-blue/left-facing.png', right: '/t-shirts/turquoise-blue/right-facing.png' }, previewColor: 'bg-teal-500', borderColor: 'border-teal-600' },
  { id: 'navy-blue', name: 'Navy Blue', categoryId: 't-shirt', images: { front: '/tshirts/navy-front.png', back: '/tshirts/navy-back.png', left: '/tshirts/navy-left.png', right: '/tshirts/navy-right.png' }, previewColor: 'bg-blue-900', borderColor: 'border-blue-800' },
  { id: 'sport-red', name: 'Sport Red', categoryId: 't-shirt', images: { front: '/tshirts/red-front.png', back: '/tshirts/red-back.png', left: '/tshirts/red-left.png', right: '/tshirts/red-right.png' }, previewColor: 'bg-red-600', borderColor: 'border-red-700' },
  // Bags
  { id: 'blue-bag', name: 'Blue Bag', categoryId: 'bags', images: { front: '/bags/blue-bag.png', back: '/bags/canvas-tote-back.png' }, previewColor: 'bg-[#335e89]', borderColor: 'border-[#335e89]' },
  { id: 'grey-bag', name: 'Gray Bag', categoryId: 'bags', images: { front: '/bags/grey-bag.png', back: '/bags/leather-bag-back.png' }, previewColor: 'bg-[#898888]', borderColor: 'border-[#898888]' },
  // Embroidery
  { id: 'embroidery-hoop', name: 'Embroidery Hoop', categoryId: 'embroidery', images: { front: '/embroidery/hoop-front.png' }, previewColor: 'bg-stone-200', borderColor: 'border-stone-400' },
  // Bottles
  { id: 'water-bottle', name: 'Water Bottle', categoryId: 'bottles', images: { front: '/bottles/black-bottle.png' }, previewColor: 'bg-[#000]', borderColor: 'border-[#000]' },
  { id: 'medical-bottle', name: 'Plastic Sports Bottle', categoryId: 'bottles', images: { front: '/bottles/plastic-black-bottle.png' }, previewColor: 'bg-[#4f4f51]', borderColor: 'border-[#4f4f51]' },
  { id: 'medicine-bottle', name: 'Medicine Bottle', categoryId: 'bottles', images: { front: '/bottles/medical-bottle.png' }, previewColor: 'bg-[#d8f3f4]', borderColor: 'border-[#0ABAB5]' },
    { id: 'white-bottle', name: 'White Sipper', categoryId: 'bottles', images: { front: '/bottles/white-bottle.png' }, previewColor: 'bg-[#ffff]', borderColor: 'border-[#ffff]' },
  // Cups
  { id: 'coffee-mug', name: 'Coffee Mug', categoryId: 'cups', images: { front: '/cups/mug-front.png' }, previewColor: 'bg-white', borderColor: 'border-gray-300' },
  { id: 'travel-mug', name: 'Travel Mug', categoryId: 'cups', images: { front: '/cups/travel-mug-front.png' }, previewColor: 'bg-slate-600', borderColor: 'border-slate-700' },
  // Hoodies
  { id: 'classic-hoodie', name: 'Classic Hoodie', categoryId: 'hoodies', images: { front: '/hoodies/hoodie-front.png', back: '/hoodies/hoodie-back.png', left: '/hoodies/hoodie-left.png', right: '/hoodies/hoodie-right.png' }, previewColor: 'bg-gray-800', borderColor: 'border-gray-700' },
  { id: 'zip-hoodie', name: 'Zip Hoodie', categoryId: 'hoodies', images: { front: '/hoodies/zip-hoodie-front.png', back: '/hoodies/zip-hoodie-back.png', left: '/hoodies/zip-hoodie-left.png', right: '/hoodies/zip-hoodie-right.png' }, previewColor: 'bg-blue-800', borderColor: 'border-blue-700' },
  // Caps
  { id: 'baseball-cap', name: 'Baseball Cap', categoryId: 'caps', images: { front: '/caps/baseball-cap-front.png', back: '/caps/baseball-cap-back.png' }, previewColor: 'bg-red-700', borderColor: 'border-red-800' },
  { id: 'trucker-cap', name: 'Trucker Cap', categoryId: 'caps', images: { front: '/caps/trucker-cap-front.png', back: '/caps/trucker-cap-back.png' }, previewColor: 'bg-blue-500', borderColor: 'border-blue-600' },
];

// ─── Print area definitions (% of image dimensions) ───────────────────────────
const getPrintAreaForProduct = (
  productId: string,
  view: ShirtView,
  isMobile: boolean,
  isTablet: boolean,
): { xMin: number; xMax: number; yMin: number; yMax: number } => {
  const product = productSets.find(p => p.id === productId);
  const category = product?.categoryId || 't-shirt';

  const areas: Record<string, Record<'desktop' | 'tablet' | 'mobile', Record<ShirtView, { xMin: number; xMax: number; yMin: number; yMax: number }>>> = {
    't-shirt': {
      desktop: {
        front: { xMin: 19, xMax: 78, yMin: 20, yMax: 80 },
        back:  { xMin: 28, xMax: 72, yMin: 20, yMax: 80 },
        left:  { xMin: 43, xMax: 57, yMin: 15, yMax: 38 },
        right: { xMin: 43, xMax: 57, yMin: 15, yMax: 38 },
      },
      tablet: {
        front: { xMin: 22, xMax: 78, yMin: 22, yMax: 78 },
        back:  { xMin: 22, xMax: 78, yMin: 22, yMax: 78 },
        left:  { xMin: 27, xMax: 73, yMin: 27, yMax: 73 },
        right: { xMin: 27, xMax: 73, yMin: 27, yMax: 73 },
      },
      mobile: {
        front: { xMin: 20, xMax: 80, yMin: 15, yMax: 85 },
        back:  { xMin: 20, xMax: 80, yMin: 15, yMax: 85 },
        left:  { xMin: 42, xMax: 65, yMin: 10, yMax: 35 },
        right: { xMin: 42, xMax: 65, yMin: 10, yMax: 35 },
      },
    },
    bags: {
      desktop: { front: { xMin: 25, xMax: 75, yMin: 25, yMax: 75 }, back: { xMin: 25, xMax: 75, yMin: 25, yMax: 75 }, left: { xMin: 40, xMax: 60, yMin: 25, yMax: 75 }, right: { xMin: 40, xMax: 60, yMin: 25, yMax: 75 } },
      tablet:  { front: { xMin: 20, xMax: 80, yMin: 20, yMax: 80 }, back: { xMin: 20, xMax: 80, yMin: 20, yMax: 80 }, left: { xMin: 35, xMax: 65, yMin: 20, yMax: 80 }, right: { xMin: 35, xMax: 65, yMin: 20, yMax: 80 } },
      mobile:  { front: { xMin: 15, xMax: 85, yMin: 15, yMax: 85 }, back: { xMin: 15, xMax: 85, yMin: 15, yMax: 85 }, left: { xMin: 30, xMax: 70, yMin: 15, yMax: 85 }, right: { xMin: 30, xMax: 70, yMin: 15, yMax: 85 } },
    },
    embroidery: {
      desktop: { front: { xMin: 30, xMax: 70, yMin: 30, yMax: 70 }, back: { xMin: 30, xMax: 70, yMin: 30, yMax: 70 }, left: { xMin: 35, xMax: 65, yMin: 30, yMax: 70 }, right: { xMin: 35, xMax: 65, yMin: 30, yMax: 70 } },
      tablet:  { front: { xMin: 25, xMax: 75, yMin: 25, yMax: 75 }, back: { xMin: 25, xMax: 75, yMin: 25, yMax: 75 }, left: { xMin: 30, xMax: 70, yMin: 25, yMax: 75 }, right: { xMin: 30, xMax: 70, yMin: 25, yMax: 75 } },
      mobile:  { front: { xMin: 20, xMax: 80, yMin: 20, yMax: 80 }, back: { xMin: 20, xMax: 80, yMin: 20, yMax: 80 }, left: { xMin: 25, xMax: 75, yMin: 20, yMax: 80 }, right: { xMin: 25, xMax: 75, yMin: 20, yMax: 80 } },
    },
    bottles: {
      desktop: { front: { xMin: 35, xMax: 65, yMin: 20, yMax: 80 }, back: { xMin: 35, xMax: 65, yMin: 20, yMax: 80 }, left: { xMin: 40, xMax: 60, yMin: 20, yMax: 80 }, right: { xMin: 40, xMax: 60, yMin: 20, yMax: 80 } },
      tablet:  { front: { xMin: 30, xMax: 70, yMin: 15, yMax: 85 }, back: { xMin: 30, xMax: 70, yMin: 15, yMax: 85 }, left: { xMin: 35, xMax: 65, yMin: 15, yMax: 85 }, right: { xMin: 35, xMax: 65, yMin: 15, yMax: 85 } },
      mobile:  { front: { xMin: 25, xMax: 75, yMin: 10, yMax: 90 }, back: { xMin: 25, xMax: 75, yMin: 10, yMax: 90 }, left: { xMin: 30, xMax: 70, yMin: 10, yMax: 90 }, right: { xMin: 30, xMax: 70, yMin: 10, yMax: 90 } },
    },
    cups: {
      desktop: { front: { xMin: 30, xMax: 70, yMin: 25, yMax: 75 }, back: { xMin: 30, xMax: 70, yMin: 25, yMax: 75 }, left: { xMin: 35, xMax: 65, yMin: 25, yMax: 75 }, right: { xMin: 35, xMax: 65, yMin: 25, yMax: 75 } },
      tablet:  { front: { xMin: 25, xMax: 75, yMin: 20, yMax: 80 }, back: { xMin: 25, xMax: 75, yMin: 20, yMax: 80 }, left: { xMin: 30, xMax: 70, yMin: 20, yMax: 80 }, right: { xMin: 30, xMax: 70, yMin: 20, yMax: 80 } },
      mobile:  { front: { xMin: 20, xMax: 80, yMin: 15, yMax: 85 }, back: { xMin: 20, xMax: 80, yMin: 15, yMax: 85 }, left: { xMin: 25, xMax: 75, yMin: 15, yMax: 85 }, right: { xMin: 25, xMax: 75, yMin: 15, yMax: 85 } },
    },
    hoodies: {
      desktop: { front: { xMin: 25, xMax: 75, yMin: 15, yMax: 85 }, back: { xMin: 25, xMax: 75, yMin: 15, yMax: 85 }, left: { xMin: 40, xMax: 60, yMin: 15, yMax: 40 }, right: { xMin: 40, xMax: 60, yMin: 15, yMax: 40 } },
      tablet:  { front: { xMin: 20, xMax: 80, yMin: 15, yMax: 85 }, back: { xMin: 20, xMax: 80, yMin: 15, yMax: 85 }, left: { xMin: 35, xMax: 65, yMin: 15, yMax: 45 }, right: { xMin: 35, xMax: 65, yMin: 15, yMax: 45 } },
      mobile:  { front: { xMin: 15, xMax: 85, yMin: 10, yMax: 90 }, back: { xMin: 15, xMax: 85, yMin: 10, yMax: 90 }, left: { xMin: 40, xMax: 60, yMin: 10, yMax: 35 }, right: { xMin: 40, xMax: 60, yMin: 10, yMax: 35 } },
    },
    caps: {
      desktop: { front: { xMin: 35, xMax: 65, yMin: 35, yMax: 65 }, back: { xMin: 35, xMax: 65, yMin: 35, yMax: 65 }, left: { xMin: 40, xMax: 60, yMin: 35, yMax: 65 }, right: { xMin: 40, xMax: 60, yMin: 35, yMax: 65 } },
      tablet:  { front: { xMin: 30, xMax: 70, yMin: 30, yMax: 70 }, back: { xMin: 30, xMax: 70, yMin: 30, yMax: 70 }, left: { xMin: 35, xMax: 65, yMin: 30, yMax: 70 }, right: { xMin: 35, xMax: 65, yMin: 30, yMax: 70 } },
      mobile:  { front: { xMin: 25, xMax: 75, yMin: 25, yMax: 75 }, back: { xMin: 25, xMax: 75, yMin: 25, yMax: 75 }, left: { xMin: 30, xMax: 70, yMin: 25, yMax: 75 }, right: { xMin: 30, xMax: 70, yMin: 25, yMax: 75 } },
    },
  };

  const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  const set = areas[category] ?? areas['t-shirt'];
  return set[device][view] ?? set.desktop.front;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Returns estimated pixel dimensions of an element. */
const getElementDimensions = (el: DesignElement): { width: number; height: number } => {
  if (el.type === 'text' || el.type === 'number') {
    const fs = el.fontSize ?? 32;
    return { width: Math.min(el.content.length * fs * 0.6, 300), height: fs * 1.5 };
  }
  if (el.type === 'emoji') return { width: 60, height: 60 };
  if (el.type === 'logo')  return { width: 100, height: 100 };
  return { width: 50, height: 50 };
};

/**
 * Clamps (x, y) so the element stays fully inside the print area.
 * x / y are in IMAGE-RELATIVE pixels.
 */
const constrainToPrintArea = (
  x: number, y: number,
  imgW: number, imgH: number,
  view: ShirtView,
  elemW: number, elemH: number,
  isMobile: boolean, isTablet: boolean,
  productId: string,
): { x: number; y: number } => {
  const area = getPrintAreaForProduct(productId, view, isMobile, isTablet);
  const minX = (area.xMin / 100) * imgW;
  const maxX = (area.xMax / 100) * imgW - elemW;
  const minY = (area.yMin / 100) * imgH;
  const maxY = (area.yMax / 100) * imgH - elemH;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const SidebarIcon = ({
  imageIcon, label, active, onClick, size = 40,
}: { imageIcon?: string; label: string; active: boolean; onClick: () => void; size?: number }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg transition-all duration-200 group ${
      active ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`}
  >
    {imageIcon && (
      <img
        src={imageIcon}
        alt={label}
        style={{ width: size, height: size }}
        className={`object-contain transition-opacity ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
      />
    )}
    <span className={`text-[11px] mt-1 font-medium ${active ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
      {label}
    </span>
  </button>
);

const ExpandablePanel = ({
  isOpen, onClose, title, children,
}: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <>
    <div
      className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div
      className={`fixed top-0 left-0 h-full w-[85vw] max-w-[500px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:w-[450px] lg:shadow-none lg:z-auto`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
        <button onClick={onClose} className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <button onClick={onClose} className="p-1 -mr-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={18} className="text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">{children}</div>
    </div>
  </>
);

const CategoriesPanel = ({
  selectedCategory, onSelectCategory, onSelectProduct, selectedProduct, productsInCategory,
}: {
  selectedCategory: string;
  onSelectCategory: (c: ProductCategory) => void;
  onSelectProduct: (p: ProductItem) => void;
  selectedProduct: ProductItem;
  productsInCategory: ProductItem[];
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Product Categories</h3>
      <div className="space-y-2">
        {productCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedCategory === cat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
          >
            <img src={cat.icon} alt={cat.name} className="w-8 h-8 object-contain" />
            <span className="text-sm font-medium text-gray-800 flex-1 text-left">{cat.name}</span>
            {selectedCategory === cat.id && <Check size={16} className="text-blue-600" />}
          </button>
        ))}
      </div>
    </div>
    {productsInCategory.length > 0 && (
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Available Products</h3>
        <div className="space-y-2">
          {productsInCategory.map(prod => (
            <button
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedProduct.id === prod.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
            >
              <div className={`w-10 h-10 rounded-lg ${prod.previewColor} ${prod.borderColor} border shadow-sm`} />
              <span className="text-sm font-medium text-gray-800 flex-1 text-left">{prod.name}</span>
              {selectedProduct.id === prod.id && <Check size={16} className="text-blue-600" />}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

const UploadPanel = ({ onUpload }: { onUpload: (f: File) => void }) => {
  const [dragActive, setDragActive] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const onDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type !== 'dragleave'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]); };
  return (
    <div className="space-y-6">
      <button onClick={() => ref.current?.click()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
        Browse Your Computer
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} className="hidden" />
      <div onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Drag & drop your image here</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10 MB</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Print Area Guide</h4>
        <p className="text-xs text-blue-700">Designs will be printed within the marked area. Elements placed outside will be constrained automatically.</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-blue-600"><AlertCircle size={12} /><span>Drag elements to reposition them.</span></div>
      </div>
    </div>
  );
};

const TextPanel = ({ onAddText }: { onAddText: (text: string, opts: any) => void }) => {
  const [text, setText] = useState('');
  const [selectedFont, setSelectedFont] = useState(fontOptions[0].value);
  const [textSize, setTextSize] = useState(32);
  const [textColor, setTextColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  return (
    <div className="space-y-6 pt-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Your Text</label>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enter your text here..." rows={3}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-base" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Font Style</label>
        <select value={selectedFont} onChange={e => setSelectedFont(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl">
          {fontOptions.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Font Size: {textSize}px</label>
        <input type="range" min="16" max="120" value={textSize} onChange={e => setTextSize(+e.target.value)} className="w-full" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Color</label>
          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-gray-200" />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Align</label>
          <div className="flex gap-1">
            {(['left','center','right'] as const).map(a => (
              <button key={a} onClick={() => setTextAlign(a)} className={`flex-1 py-2 rounded-lg ${textAlign === a ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                {a === 'left' ? <AlignLeft size={16} className="mx-auto" /> : a === 'center' ? <AlignCenter size={16} className="mx-auto" /> : <AlignRight size={16} className="mx-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setIsBold(!isBold)} className={`flex-1 py-2 rounded-xl transition ${isBold ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}><Bold size={16} className="inline mr-1" />Bold</button>
        <button onClick={() => setIsItalic(!isItalic)} className={`flex-1 py-2 rounded-xl transition ${isItalic ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}><Italic size={16} className="inline mr-1" />Italic</button>
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-2">Preview</p>
        <div style={{ fontFamily: selectedFont, fontSize: `${Math.min(textSize, 40)}px`, color: textColor, fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', textAlign }}
          className="p-2 bg-white rounded-lg min-h-[40px]">{text || 'Sample Text'}</div>
      </div>
      <button onClick={() => { if (text.trim()) onAddText(text, { fontFamily: selectedFont, fontSize: textSize, color: textColor, isBold, isItalic, textAlign }); setText(''); }}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">Add To Design</button>
    </div>
  );
};

const ArtworkPanel = ({ onAddEmoji, onAddNumber }: { onAddEmoji: (e: string) => void; onAddNumber: (n: string) => void }) => {
  const [activeCategory, setActiveCategory] = useState<'emoji' | 'number'>('emoji');
  const [numberValue, setNumberValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = emojis.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.char.includes(searchTerm));
  const jerseyNumbers = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','30','32','33','34','45','50','55','66','69','77','80','99'];
  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveCategory('emoji')} className={`flex-1 py-2 text-sm font-medium transition ${activeCategory === 'emoji' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          <Smile size={14} className="inline mr-1" />Emojis
        </button>
        <button onClick={() => setActiveCategory('number')} className={`flex-1 py-2 text-sm font-medium transition ${activeCategory === 'number' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          <Hash size={14} className="inline mr-1" />Numbers
        </button>
      </div>
      {activeCategory === 'emoji' && (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search emojis…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {filtered.map(em => (
              <button key={em.char} onClick={() => onAddEmoji(em.char)} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{em.char}</span>
                <span className="text-xs text-gray-500 truncate w-full text-center">{em.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {activeCategory === 'number' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input value={numberValue} onChange={e => setNumberValue(e.target.value)} placeholder="Custom number…"
              className="flex-1 p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onKeyDown={e => { if (e.key === 'Enter' && numberValue.trim()) { onAddNumber(numberValue.trim()); setNumberValue(''); } }} />
            <button onClick={() => { if (numberValue.trim()) { onAddNumber(numberValue.trim()); setNumberValue(''); } }} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Add</button>
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {jerseyNumbers.map(n => (
              <button key={n} onClick={() => onAddNumber(n)} className="aspect-square flex items-center justify-center bg-gray-50 rounded-xl hover:bg-blue-100 transition text-xl font-bold hover:scale-105" style={{ fontFamily: 'Impact, sans-serif' }}>{n}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NamesPanel = ({ onAddName }: { onAddName: (n: string) => void }) => {
  const [name, setName] = useState('');
  const [recentNames, setRecentNames] = useState<string[]>(['Sarah', 'Michael', 'Emma', 'James']);
  const add = () => { if (name.trim()) { onAddName(name.trim()); setRecentNames(p => [name.trim(), ...p.slice(0, 3)]); setName(''); } };
  return (
    <div className="space-y-6 pt-4">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter a name…"
        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
        onKeyDown={e => e.key === 'Enter' && add()} />
      <button onClick={add} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">Add Name To Design</button>
      {recentNames.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Names</h4>
          <div className="flex flex-wrap gap-2">
            {recentNames.map((n, i) => <button key={i} onClick={() => setName(n)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors">{n}</button>)}
          </div>
        </div>
      )}
    </div>
  );
};

/** Renders the dashed print-area box ON TOP of the product image.
 *  Uses the same % values as the constraint logic so they always match. */
const PrintAreaOverlay = ({ view, isMobile, isTablet, productId }: { view: ShirtView; isMobile: boolean; isTablet: boolean; productId: string }) => {
  const area = getPrintAreaForProduct(productId, view, isMobile, isTablet);
  const color = isMobile ? 'border-green-500 bg-green-500/5' : isTablet ? 'border-yellow-500 bg-yellow-500/5' : 'border-blue-500 bg-blue-500/5';
  const badge = isMobile ? 'bg-green-500' : isTablet ? 'bg-yellow-500' : 'bg-blue-500';
  const label = isMobile ? '📱 Print Area' : isTablet ? '📟 Print Area' : '🖥️ Print Area';
  return (
    <div className={`absolute pointer-events-none border-2 border-dashed rounded-lg ${color}`}
      style={{ left: `${area.xMin}%`, top: `${area.yMin}%`, width: `${area.xMax - area.xMin}%`, height: `${area.yMax - area.yMin}%` }}>
      <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded shadow-sm ${badge} text-white`}>{label}</div>
      {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map(pos => (
        <div key={pos} className={`absolute w-2 h-2 rounded-full ${badge.replace('bg-', 'bg-')} ${pos}`} />
      ))}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function CustomizedToolforBottle() {
  // ── state ──
  const [selectedView, setSelectedView]       = useState<ShirtView>('front');
  const defaultProduct = productSets.find(p => p.categoryId === 'bottles');

const [selectedProduct, setSelectedProduct] = useState(
  defaultProduct || productSets[0]
);
  const [selectedCategory, setSelectedCategory] = useState<string>('bottles');
  const [elements, setElements]               = useState<DesignElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging]           = useState(false);
  const [dragOffset, setDragOffset]           = useState({ x: 0, y: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false);
  const [uploading, setUploading]             = useState(false);
  const [zoom, setZoom]                       = useState(1);
  const [history, setHistory]                 = useState<DesignElement[][]>([]);
  const [historyIndex, setHistoryIndex]       = useState(-1);
  const [savedDesigns, setSavedDesigns]       = useState<SavedDesign[]>([]);
  const [designName, setDesignName]           = useState('');
  const [showSaveDialog, setShowSaveDialog]   = useState(false);
  const [editingElement, setEditingElement]   = useState<DesignElement | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [tempScale, setTempScale]             = useState(1);
  const [tempRotation, setTempRotation]       = useState(0);
  const [tempOpacity, setTempOpacity]         = useState(1);
  const [showPrintArea, setShowPrintArea]     = useState(true);
  const [isMobile, setIsMobile]               = useState(false);
  const [isTablet, setIsTablet]               = useState(false);
  const [activeTab, setActiveTab]             = useState<SidebarTab | null>(null);

  // ── Image rect relative to canvasRef (single source of truth for all coordinates) ──
  // offsetX/offsetY = image top-left corner relative to canvasRef top-left
  const [imgSize, setImgSize] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });

  // FAB
  const [fabPosition, setFabPosition]   = useState({ x: 0, y: 0 });
  const [isDraggingFab, setIsDraggingFab] = useState(false);
  const [fabDragOffset, setFabDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef      = useRef<HTMLDivElement>(null);
  const canvasImgRef   = useRef<HTMLImageElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const dblClickRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fabRef         = useRef<HTMLDivElement>(null);

  // ── device detection ──
  useEffect(() => {
    const check = () => { const w = window.innerWidth; setIsMobile(w < 768); setIsTablet(w >= 768 && w < 1024); };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── open categories panel on desktop by default ──
  useEffect(() => {
    if (!isMobile && !isTablet) setActiveTab('categories');
  }, [isMobile, isTablet]);

  // ── FAB initial position ──
  useEffect(() => {
    const saved = localStorage.getItem('fab-position');
    if (saved) setFabPosition(JSON.parse(saved));
    else setFabPosition({ x: window.innerWidth - 80, y: window.innerHeight - 100 });
  }, []);

  // ── load saved designs ──
  useEffect(() => {
    const s = localStorage.getItem('product-designs-customized-tool');
    if (s) setSavedDesigns(JSON.parse(s));
    const c = localStorage.getItem('current-design-customized-tool');
    if (c) setElements(JSON.parse(c));
  }, []);

  // ── measure image size + offset relative to canvasRef ──
  // Must re-run whenever activeTab changes (panel open/close shifts image position).
  const measureImage = () => {
    if (!canvasImgRef.current || !canvasRef.current) return;
    const imgRect    = canvasImgRef.current.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setImgSize({
      width:   imgRect.width,
      height:  imgRect.height,
      offsetX: imgRect.left - canvasRect.left,
      offsetY: imgRect.top  - canvasRect.top,
    });
  };

  useEffect(() => {
    // Delay slightly so the panel slide animation completes before measuring
    const id = setTimeout(measureImage, 320);
    return () => clearTimeout(id);
  }, [selectedProduct, selectedView, zoom, activeTab]);

  useEffect(() => {
    window.addEventListener('resize', measureImage);
    return () => window.removeEventListener('resize', measureImage);
  }, []);

  // ── re-constrain elements after image size changes ──
  useEffect(() => {
    if (imgSize.width === 0) return;
    let changed = false;
    const updated = elements.map(el => {
      const { width: ew, height: eh } = getElementDimensions(el);
      const c = constrainToPrintArea(el.x, el.y, imgSize.width, imgSize.height, el.view, ew, eh, isMobile, isTablet, selectedProduct.id);
      if (c.x !== el.x || c.y !== el.y) { changed = true; return { ...el, ...c }; }
      return el;
    });
    if (changed) { setElements(updated); pushHistory(updated); }
  }, [imgSize, isMobile, isTablet, selectedProduct]);

  // ── update selected view when product changes ──
  useEffect(() => {
    const cat = productCategories.find(c => c.id === selectedProduct.categoryId);
    const views = cat?.availableViews ?? ['front'];
    if (!views.includes(selectedView)) setSelectedView(views[0]);
  }, [selectedProduct]);

  // ── history ──
  const pushHistory = (els: DesignElement[]) => {
    const h = history.slice(0, historyIndex + 1);
    h.push(JSON.parse(JSON.stringify(els)));
    setHistory(h);
    setHistoryIndex(h.length - 1);
  };
  const undo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setElements(JSON.parse(JSON.stringify(history[historyIndex - 1]))); } };
  const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setElements(JSON.parse(JSON.stringify(history[historyIndex + 1]))); } };

  // ── helpers ──
  const getProductsByCategory = (cid: string) => productSets.filter(p => p.categoryId === cid);
  const getAvailableViews = (): ShirtView[] => {
    const cat = productCategories.find(c => c.id === selectedProduct.categoryId);
    return cat?.availableViews ?? ['front'];
  };

  /**
   * Returns a constrained center position (image-relative) for a new element.
   * Falls back gracefully if image hasn't been measured yet.
   */
  const getPlacementPosition = (elemW: number, elemH: number) => {
    if (imgSize.width === 0) return { x: 50, y: 50 };
    const area = getPrintAreaForProduct(selectedProduct.id, selectedView, isMobile, isTablet);
    const cx = ((area.xMin + area.xMax) / 2 / 100) * imgSize.width - elemW / 2;
    const cy = ((area.yMin + area.yMax) / 2 / 100) * imgSize.height - elemH / 2;
    return constrainToPrintArea(cx, cy, imgSize.width, imgSize.height, selectedView, elemW, elemH, isMobile, isTablet, selectedProduct.id);
  };

  const updateElementProperty = (id: string, prop: keyof DesignElement, value: any) => {
    const next = elements.map(el => el.id === id ? { ...el, [prop]: value } : el);
    setElements(next);
    pushHistory(next);
  };

  // ── add elements ──
  const addText = (content: string, opts?: any) => {
    if (!content.trim()) return;
    const fs = opts?.fontSize ?? 32;
    const { x, y } = getPlacementPosition(Math.min(content.length * fs * 0.6, 300), fs * 1.5);
    const el: DesignElement = {
      id: Date.now().toString(), type: 'text', content, x, y, scale: 1, rotation: 0,
      view: selectedView, fontSize: fs, color: opts?.color ?? '#000000',
      isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true,
      isBold: opts?.isBold ?? false, isItalic: opts?.isItalic ?? false,
      fontFamily: opts?.fontFamily ?? 'Arial, sans-serif', textAlign: opts?.textAlign ?? 'center',
    };
    const next = [...elements, el];
    setElements(next); setSelectedElementId(el.id); setActiveTab(null); pushHistory(next);
  };

  const addEmoji = (emoji: string) => {
    const { x, y } = getPlacementPosition(60, 60);
    const el: DesignElement = {
      id: Date.now().toString(), type: 'emoji', content: emoji, x, y, scale: 1, rotation: 0,
      view: selectedView, fontSize: 48, color: '#000000', isBlackWhite: false, opacity: 1,
      zIndex: elements.length, locked: false, visible: true, isBold: false, isItalic: false,
      fontFamily: 'Segoe UI Emoji, Apple Color Emoji, sans-serif',
    };
    const next = [...elements, el];
    setElements(next); setSelectedElementId(el.id); setActiveTab(null); pushHistory(next);
  };

  const addNumber = (number: string) => {
    const { x, y } = getPlacementPosition(80, 80);
    const el: DesignElement = {
      id: Date.now().toString(), type: 'number', content: number, x, y, scale: 1, rotation: 0,
      view: selectedView, fontSize: 64, color: '#FFFFFF', isBlackWhite: false, opacity: 1,
      zIndex: elements.length, locked: false, visible: true, isBold: true, isItalic: false,
      fontFamily: 'Impact, Arial Black, sans-serif', textAlign: 'center',
    };
    const next = [...elements, el];
    setElements(next); setSelectedElementId(el.id); setActiveTab(null); pushHistory(next);
  };

  const addName = (name: string) => {
    const w = Math.min(name.length * 25, 200);
    const { x, y } = getPlacementPosition(w, 50);
    const el: DesignElement = {
      id: Date.now().toString(), type: 'text', content: name.toUpperCase(), x, y, scale: 1, rotation: 0,
      view: selectedView, fontSize: 36, color: '#FFFFFF', isBlackWhite: false, opacity: 1,
      zIndex: elements.length, locked: false, visible: true, isBold: true, isItalic: false,
      fontFamily: 'Impact, Arial Black, sans-serif', textAlign: 'center',
    };
    const next = [...elements, el];
    setElements(next); setSelectedElementId(el.id); setActiveTab(null); pushHistory(next);
  };

  const uploadLogo = (file: File) => {
    setUploading(true);
    const url = URL.createObjectURL(file);
    // Give the image a moment to decode so we can get a size; default to 100×100
    const img = new Image();
    img.onload = () => {
      const aspect = img.width / img.height;
      const elemH = 100;
      const elemW = Math.round(elemH * aspect);
      const { x, y } = getPlacementPosition(elemW, elemH);
      const el: DesignElement = {
        id: Date.now().toString(), type: 'logo', content: url, x, y, scale: 1, rotation: 0,
        view: selectedView, imageUrl: url, isBlackWhite: false, opacity: 1,
        zIndex: elements.length, locked: false, visible: true,
      };
      const next = [...elements, el];
      setElements(next); setSelectedElementId(el.id); setActiveTab(null); pushHistory(next);
      setUploading(false);
    };
    img.onerror = () => {
      const { x, y } = getPlacementPosition(100, 100);
      const el: DesignElement = {
        id: Date.now().toString(), type: 'logo', content: url, x, y, scale: 1, rotation: 0,
        view: selectedView, imageUrl: url, isBlackWhite: false, opacity: 1,
        zIndex: elements.length, locked: false, visible: true,
      };
      const next = [...elements, el];
      setElements(next); setSelectedElementId(el.id); setActiveTab(null); pushHistory(next);
      setUploading(false);
    };
    img.src = url;
  };

  // ── element actions ──
  const removeElement = (id: string) => {
    const next = elements.filter(e => e.id !== id);
    setElements(next); if (selectedElementId === id) setSelectedElementId(null); pushHistory(next);
  };

  const duplicateElement = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const { width: ew, height: eh } = getElementDimensions(el);
    const c = constrainToPrintArea(el.x + 30, el.y + 30, imgSize.width, imgSize.height, el.view, ew, eh, isMobile, isTablet, selectedProduct.id);
    const next = [...elements, { ...el, id: Date.now().toString(), ...c }];
    setElements(next); setSelectedElementId(next[next.length - 1].id); pushHistory(next);
  };

  const bringToFront = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const next = [...elements.filter(e => e.id !== id), el];
    setElements(next); pushHistory(next);
  };

  const toggleBlackWhite = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (el) updateElementProperty(id, 'isBlackWhite', !el.isBlackWhite);
  };

  // ── double-click detection ──
  const handleDoubleClickDetection = (el: DesignElement) => {
    if (dblClickRef.current) {
      clearTimeout(dblClickRef.current); dblClickRef.current = null;
      setEditingElement(el); setTempScale(el.scale); setTempRotation(el.rotation); setTempOpacity(el.opacity ?? 1);
      setIsEditModalOpen(true);
    } else {
      dblClickRef.current = setTimeout(() => { dblClickRef.current = null; }, 250);
    }
  };

  // ── drag: mouse/touch down on an element ──
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    const el = elements.find(x => x.id === id);
    if (el?.locked) return;
    e.stopPropagation();
    setSelectedElementId(id);
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (canvasRef.current && el) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      // Convert cursor to canvasRef coords, subtract image offset, subtract element offset
      setDragOffset({
        x: (clientX - canvasRect.left) - imgSize.offsetX - el.x,
        y: (clientY - canvasRect.top)  - imgSize.offsetY - el.y,
      });
    }
  };

  // ── drag: move ──
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedElementId || !canvasRef.current) return;
    const el = elements.find(x => x.id === selectedElementId);
    if (!el || el.locked) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    // Convert cursor to canvasRef coords, subtract image offset, subtract drag offset
    // This gives us image-relative coordinates regardless of panel state
    let x = (clientX - canvasRect.left) - imgSize.offsetX - dragOffset.x;
    let y = (clientY - canvasRect.top)  - imgSize.offsetY - dragOffset.y;

    const { width: ew, height: eh } = getElementDimensions(el);

    if (imgSize.width > 0) {
      const c = constrainToPrintArea(x, y, imgSize.width, imgSize.height, el.view, ew, eh, isMobile, isTablet, selectedProduct.id);
      x = c.x; y = c.y;
    }

    setElements(prev => prev.map(item => item.id === selectedElementId ? { ...item, x, y } : item));
  };

  const handleMouseUp = () => { if (isDragging) { setIsDragging(false); pushHistory(elements); } };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, elements, selectedElementId, imgSize, isMobile, isTablet, selectedProduct]);

  // ── FAB drag ──
  const handleFabMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingFab(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const r = fabRef.current?.getBoundingClientRect();
    if (r) setFabDragOffset({ x: clientX - r.left, y: clientY - r.top });
  };
  useEffect(() => {
    if (!isDraggingFab) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setFabPosition({ x: Math.max(0, Math.min(cx - fabDragOffset.x, window.innerWidth - 56)), y: Math.max(0, Math.min(cy - fabDragOffset.y, window.innerHeight - 56)) });
    };
    const onUp = () => { setIsDraggingFab(false); localStorage.setItem('fab-position', JSON.stringify(fabPosition)); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove); window.addEventListener('touchend', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
  }, [isDraggingFab, fabDragOffset]);

  // ── save / load ──
  const saveDesign = () => {
    if (!designName.trim()) { alert('Please enter a design name'); return; }
    const d: SavedDesign = { id: Date.now().toString(), name: designName, date: new Date().toLocaleString(), elements, productId: selectedProduct.id, categoryId: selectedCategory, thumbnail: selectedProduct.images.front };
    const next = [...savedDesigns, d];
    setSavedDesigns(next);
    localStorage.setItem('product-designs-customized-tool', JSON.stringify(next));
    localStorage.setItem('current-design-customized-tool', JSON.stringify(elements));
    setShowSaveDialog(false); setDesignName(''); alert('Design saved!');
  };
  const loadDesign = (d: SavedDesign) => {
    setElements(d.elements);
    const prod = productSets.find(p => p.id === d.productId);
    if (prod) { setSelectedProduct(prod); setSelectedCategory(prod.categoryId); }
    setIsSavedDesignsOpen(false); pushHistory(d.elements);
  };

  // ── edit modal handlers ──
  const handleScaleChange   = (v: number) => { setTempScale(v);    if (editingElement) updateElementProperty(editingElement.id, 'scale',   v); };
  const handleRotationChange= (v: number) => { setTempRotation(v); if (editingElement) updateElementProperty(editingElement.id, 'rotation',v); };
  const handleOpacityChange = (v: number) => { setTempOpacity(v);  if (editingElement) updateElementProperty(editingElement.id, 'opacity', v); };

  // ── derived ──
  const currentViewElements = elements.filter(el => el.view === selectedView && el.visible);
  const availableViews      = getAvailableViews();

  const renderPanelContent = () => {
    switch (activeTab) {
      case 'categories': return (
        <CategoriesPanel selectedCategory={selectedCategory}
          onSelectCategory={cat => { setSelectedCategory(cat.id); const p = getProductsByCategory(cat.id); if (p.length) setSelectedProduct(p[0]); }}
          onSelectProduct={setSelectedProduct} selectedProduct={selectedProduct}
          productsInCategory={getProductsByCategory(selectedCategory)} />
      );
      case 'upload':  return <UploadPanel onUpload={uploadLogo} />;
      case 'text':    return <TextPanel onAddText={addText} />;
      case 'art':     return <ArtworkPanel onAddEmoji={addEmoji} onAddNumber={addNumber} />;
      case 'names':   return <NamesPanel onAddName={addName} />;
      default: return null;
    }
  };
 //   const getPanelTitle = () => ({ categories: 'Product Categories', upload: 'Upload Image', text: 'Add Text', art: 'Artwork Library', names: 'Add Names' }[activeTab ?? ''] ?? '');

const titles: Record<SidebarTab, string> = {
  categories: 'Product Categories',
  product: 'Products',
  upload: 'Upload Image',
  text: 'Add Text',
  art: 'Artwork Library',
  names: 'Add Names',
};

const getPanelTitle = () => activeTab ? titles[activeTab] : '';


  const sidebarIcons = [
    { id: 'categories' as SidebarTab, imageIcon: '/cluesstyle-white-icons/product-icon.png',   label: 'Products'  },
    { id: 'upload'     as SidebarTab, imageIcon: '/cluesstyle-white-icons/upload-cion.png',     label: 'Upload'    },
    { id: 'text'       as SidebarTab, imageIcon: '/cluesstyle-white-icons/add-text-icon.png',   label: 'Add Text'  },
    { id: 'art'        as SidebarTab, imageIcon: '/cluesstyle-white-icons/art-work-icon.png',   label: 'Add Art'   },
    { id: 'names'      as SidebarTab, imageIcon: '/cluesstyle-white-icons/name-space-icon.png', label: 'Add Names' },
  ];

  // ── render ──
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cluesstyle Product Designer
            </h1>
            <div className="hidden lg:flex gap-2">
              <button onClick={undo}  className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Undo"><Undo  size={18} /></button>
              <button onClick={redo}  className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Redo"><Redo  size={18} /></button>
              <button onClick={() => setShowPrintArea(v => !v)}
                className={`p-2 rounded-lg transition-colors ${showPrintArea ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`} title="Toggle Print Area">
                <Crop size={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSavedDesignsOpen(true)} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Layers size={18} className="inline mr-1" /><span className="hidden sm:inline">My Designs</span>
            </button>
            <button onClick={() => setShowSaveDialog(true)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Save size={18} className="inline mr-1" /><span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left icon sidebar */}
        <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-40">
  
  <div className="flex items-center gap-4">
    
    {/* Sidebar */}
    <div className={`flex flex-col w-[110px] ${SIDEBAR_HEIGHT} bg-[#155d8c] rounded-xl shadow-lg overflow-hidden`}>
      <div className="flex flex-col items-center py-4 gap-3 overflow-y-auto">
        {sidebarIcons.map(icon => (
          <SidebarIcon
            key={icon.id}
            imageIcon={icon.imageIcon}
            label={icon.label}
            active={activeTab === icon.id}
            size={70}
            onClick={() =>
              setActiveTab(activeTab === icon.id ? null : icon.id)
            }
          />
        ))}
      </div>
    </div>

    {/* Expandable Panel */}
    {activeTab && (
      <div className={`w-[450px] ${SIDEBAR_HEIGHT} bg-white rounded-xl shadow-xl border overflow-hidden flex flex-col`}>
        
        {/* Header */}
        <div className="px-4 py-3 border-b font-semibold">
          {getPanelTitle()}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderPanelContent()}
        </div>

      </div>
    )}

  </div>
</div>

        {/* ── Canvas ── */}
        <div className="flex-1 overflow-hidden flex items-center justify-center">
  <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
    
    <div className="relative max-w-full max-h-full overflow-hidden">
      
      <div
        ref={canvasRef}
        className="relative mx-auto lg:ml-auto lg:mr-0 lg:w-[75%]"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
        }}
      >
                {/* Product image — the coordinate origin for all elements */}
                <img
                  ref={canvasImgRef}
                  src={selectedProduct.images[selectedView]}
                  alt={`${selectedProduct.name} ${selectedView}`}
                  onLoad={measureImage}
                  draggable={false}
                  className={`pointer-events-none select-none block mx-auto ${isMobile ? 'w-[95%]' : isTablet ? 'w-[85%]' : 'w-[70%]'}`}
                  style={{ height: 'auto', objectFit: 'contain' }}
                />

                {/* Print-area overlay — uses imgSize.offsetX/Y so it stays aligned when panel opens/closes */}
                {showPrintArea && imgSize.width > 0 && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left:   imgSize.offsetX,
                      top:    imgSize.offsetY,
                      width:  imgSize.width,
                      height: imgSize.height,
                    }}
                  >
                    <PrintAreaOverlay view={selectedView} isMobile={isMobile} isTablet={isTablet} productId={selectedProduct.id} />
                  </div>
                )}

                {/* Elements layer — uses imgSize.offsetX/Y so it stays aligned when panel opens/closes */}
                {imgSize.width > 0 && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left:   imgSize.offsetX,
                      top:    imgSize.offsetY,
                      width:  imgSize.width,
                      height: imgSize.height,
                    }}
                  >
                    {currentViewElements.map(el => (
                      <div
                        key={el.id}
                        onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, el.id); }}
                        onTouchStart={e => { e.stopPropagation(); handleMouseDown(e, el.id); }}
                        onClick={() => handleDoubleClickDetection(el)}
                        className={`absolute pointer-events-auto cursor-move select-none ${selectedElementId === el.id ? 'ring-2 ring-blue-500 ring-offset-1 rounded' : ''} ${el.locked ? 'cursor-not-allowed' : ''}`}
                        style={{
                          left:    0,
                          top:     0,
                          transform: `translate(${el.x}px, ${el.y}px) scale(${el.scale}) rotate(${el.rotation}deg)`,
                          transformOrigin: '0 0',
                          opacity: el.opacity,
                          filter:  el.isBlackWhite ? 'grayscale(100%)' : 'none',
                          zIndex:  el.zIndex,
                        }}
                      >
                        {(el.type === 'text' || el.type === 'number') && (
                          <div style={{
                            fontSize:   `${el.fontSize}px`,
                            color:      el.color,
                            fontWeight: el.isBold ? 'bold' : 'normal',
                            fontStyle:  el.isItalic ? 'italic' : 'normal',
                            fontFamily: el.fontFamily,
                            whiteSpace: 'nowrap',
                            textAlign:  el.textAlign,
                            textShadow: el.type === 'number' && el.color === '#FFFFFF' ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
                          }}>{el.content}</div>
                        )}
                        {el.type === 'emoji' && (
                          <div style={{ fontSize: `${el.fontSize}px`, fontFamily: el.fontFamily }}>{el.content}</div>
                        )}
                        {el.type === 'logo' && (
                          <img src={el.imageUrl} alt="Logo" draggable={false}
                            style={{ maxWidth: '100px', maxHeight: '100px', display: 'block' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right quick-views panel */}
        <div className="hidden lg:block w-56 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Current Product</h3>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-lg ${selectedProduct.previewColor} ${selectedProduct.borderColor} border shadow-sm`} />
                <span className="text-sm font-medium">{selectedProduct.name}</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Quick Views</h3>
            <div className="space-y-3">
              {availableViews.map(view => (
                <button key={view} onClick={() => setSelectedView(view)}
                  className={`w-full p-2 rounded-xl transition-all ${selectedView === view ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}>
                  <div className="relative">
                    <img src={selectedProduct.images[view]} alt={view} className="w-full h-auto rounded-lg" />
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize">{view}</div>
                  </div>
                  {elements.filter(el => el.view === view && el.visible).length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">{elements.filter(el => el.view === view && el.visible).length} element(s)</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile FAB ── */}
      <div
  ref={fabRef}
  className="lg:hidden fixed z-[999] cursor-move"
  style={{
    left: fabPosition.x,
    top: fabPosition.y,
    transition: isDraggingFab ? 'none' : 'all 0.1s ease'
  }}
>
  <button
    onClick={(e) => {
      e.stopPropagation();
      setIsMobileMenuOpen(v => !v);
    }}

    // ✅ Desktop drag (unchanged)
    onMouseDown={handleFabMouseDown}

    // ✅ Mobile fix (delayed drag)
    onTouchStart={(e) => {
      const timeout = setTimeout(() => {
        handleFabMouseDown(e);
      }, 150); // long press = drag

      const cancel = () => clearTimeout(timeout);

      window.addEventListener('touchend', cancel, { once: true });
      window.addEventListener('touchmove', cancel, { once: true });
    }}

    className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all"
  >
    {isMobileMenuOpen ? <X size={24} /> : <Plus size={24} />}
  </button>
</div>

      {/* Mobile floating menu */}
      {isMobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="lg:hidden fixed z-[999] flex flex-col gap-3" style={{ left: fabPosition.x - 10, top: fabPosition.y - 70, transform: 'translateX(-50%)' }}>
            {[
              {
                icon: <Eye size={20} />,
                action: () => {
                  setShowMobilePreview(true);
                  setTimeout(() => setIsMobileMenuOpen(false), 120);
                },
                cls: 'bg-white text-gray-700'
              },
              {
                icon: <Package size={20} />,
                action: () => {
                  setActiveTab('categories');
                  setTimeout(() => setIsMobileMenuOpen(false), 120);
                },
                cls: 'bg-white text-gray-700'
              },
              {
                icon: <Save size={20} />,
                action: () => {
                  setShowSaveDialog(true);
                  setTimeout(() => setIsMobileMenuOpen(false), 120);
                },
                cls: 'bg-white text-gray-700'
              },
              {
                icon: <ImageIcon size={20} />,
                action: () => {
                  setActiveTab('upload');
                  setTimeout(() => setIsMobileMenuOpen(false), 120);
                },
                cls: 'bg-white text-gray-700'
              },
              {
                icon: <Type size={20} />,
                action: () => {
                  setActiveTab('text');
                  setTimeout(() => setIsMobileMenuOpen(false), 120);
                },
                cls: 'bg-green-600 text-white'
              }
            ].map(({ icon, action, cls }, i) => (
              <button key={i} onClick={action} className={`w-12 h-12 ${cls} rounded-full shadow-lg flex items-center justify-center hover:opacity-90`}>{icon}</button>
            ))}
          </div>
        </>
      )}

      {/* Mobile preview drawer */}
      {showMobilePreview && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg rounded-t-xl z-40">
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Quick Views</h3>
              <button onClick={() => setShowMobilePreview(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableViews.map(v => (
                <button key={v} onClick={() => { setSelectedView(v); setShowMobilePreview(false); }} className="text-center">
                  <img src={selectedProduct.images[v]} alt={v} className="w-full rounded-lg" />
                  <span className="text-xs capitalize mt-1">{v}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} className="hidden" />
{isMobile && activeTab && (
  <div className="fixed inset-0 z-[2000] bg-white overflow-y-auto">
    
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="font-semibold">{getPanelTitle()}</h2>
      <button onClick={() => setActiveTab(null)}>
        <X size={20} />
      </button>
    </div>

    {/* Content */}
    <div className="p-4">
      {renderPanelContent()}
    </div>

  </div>
)}

      {/* ── Edit Modal ── */}
      {isEditModalOpen && editingElement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold">Edit {editingElement.type.charAt(0).toUpperCase() + editingElement.type.slice(1)}</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              {(editingElement.type === 'text' || editingElement.type === 'number') && (
                <>
                  <div><label className="text-sm font-medium">Content</label>
                    <input value={editingElement.content} onChange={e => updateElementProperty(editingElement.id, 'content', e.target.value)} className="w-full p-2 border rounded-lg mt-1" /></div>
                  <div><label className="text-sm font-medium">Color</label>
                    <input type="color" value={editingElement.color} onChange={e => updateElementProperty(editingElement.id, 'color', e.target.value)} className="w-full h-10 rounded mt-1 cursor-pointer" /></div>
                  <div><label className="text-sm font-medium">Font Size: {editingElement.fontSize}px</label>
                    <input type="range" min="12" max="120" value={editingElement.fontSize} onChange={e => updateElementProperty(editingElement.id, 'fontSize', +e.target.value)} className="w-full mt-1" /></div>
                  <div><label className="text-sm font-medium">Font Family</label>
                    <select value={editingElement.fontFamily} onChange={e => updateElementProperty(editingElement.id, 'fontFamily', e.target.value)} className="w-full p-2 border rounded-lg mt-1">
                      {fontOptions.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                    </select></div>
                  <div className="flex gap-2">
                    <button onClick={() => updateElementProperty(editingElement.id, 'isBold',   !editingElement.isBold)}   className={`flex-1 py-2 rounded ${editingElement.isBold   ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><Bold   size={16} className="inline mr-1" />Bold</button>
                    <button onClick={() => updateElementProperty(editingElement.id, 'isItalic', !editingElement.isItalic)} className={`flex-1 py-2 rounded ${editingElement.isItalic ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><Italic size={16} className="inline mr-1" />Italic</button>
                  </div>
                </>
              )}
              <div><label className="text-sm font-medium">Scale: {tempScale.toFixed(1)}x</label>
                <input type="range" min="0.3" max="3" step="0.1" value={tempScale} onChange={e => handleScaleChange(+e.target.value)} className="w-full mt-1" /></div>
              <div><label className="text-sm font-medium">Rotation: {tempRotation}°</label>
                <input type="range" min="0" max="360" value={tempRotation} onChange={e => handleRotationChange(+e.target.value)} className="w-full mt-1" /></div>
              <div><label className="text-sm font-medium">Opacity: {Math.round(tempOpacity * 100)}%</label>
                <input type="range" min="0" max="1" step="0.01" value={tempOpacity} onChange={e => handleOpacityChange(+e.target.value)} className="w-full mt-1" /></div>
              <div className="flex gap-2">
                <button onClick={() => toggleBlackWhite(editingElement.id)} className={`flex-1 py-2 rounded ${editingElement.isBlackWhite ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}><Filter size={16} className="inline mr-1" />B&amp;W</button>
                <button onClick={() => bringToFront(editingElement.id)}     className="flex-1 py-2 bg-indigo-600 text-white rounded">Bring Front</button>
                <button onClick={() => { duplicateElement(editingElement.id); setIsEditModalOpen(false); }} className="flex-1 py-2 bg-yellow-600 text-white rounded"><Copy size={16} className="inline mr-1" />Dupe</button>
              </div>
              <button onClick={() => { removeElement(editingElement.id); setIsEditModalOpen(false); }} className="w-full py-2 bg-red-600 text-white rounded">
                <Trash2 size={16} className="inline mr-1" />Delete
              </button>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button onClick={() => setIsEditModalOpen(false)} className="w-full py-2 bg-blue-600 text-white rounded-lg">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save Dialog ── */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b p-4"><h2 className="text-lg font-bold">Save Your Design</h2></div>
            <div className="p-4">
              <input value={designName} onChange={e => setDesignName(e.target.value)} placeholder="Design name…" className="w-full p-2 border rounded-lg mb-4" autoFocus />
              <div className="flex gap-2">
                <button onClick={() => setShowSaveDialog(false)} className="flex-1 py-2 bg-gray-200 rounded">Cancel</button>
                <button onClick={saveDesign} className="flex-1 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved Designs Modal ── */}
      {isSavedDesignsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold">My Saved Designs</h2>
              <button onClick={() => setIsSavedDesignsOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-4">
              {savedDesigns.length === 0
                ? <p className="text-center text-gray-500 py-8">No saved designs yet</p>
                : (
                  <div className="space-y-2">
                    {savedDesigns.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div><p className="font-medium">{d.name}</p><p className="text-xs text-gray-500">{d.date}</p></div>
                        <div className="flex gap-2">
                          <button onClick={() => loadDesign(d)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Load</button>
                          <button onClick={() => { const u = savedDesigns.filter(x => x.id !== d.id); setSavedDesigns(u); localStorage.setItem('product-designs-customized-tool', JSON.stringify(u)); }} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        @media (max-width: 768px) {
          .h-screen { height: 100vh; height: -webkit-fill-available; }
          .flex-1 { min-height: 0; }
          input, textarea, select { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
}