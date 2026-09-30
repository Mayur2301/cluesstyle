'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Upload, Type, Trash2, Copy,
  Save, Layers, Crop,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo,
  Image as ImageIcon, Bold, Italic,
  Filter, Search, Smile,
  Hash, AlertCircle, Menu, ChevronDown, ChevronUp,
  Check, Eye, ChevronLeft, ChevronRight, Info,
  Sparkles, Clock, Star, Grid,
} from 'lucide-react';

const emojis = [
  { char: '😀', name: 'Grinning Face' }, { char: '😂', name: 'Face with Tears of Joy' },
  { char: '😍', name: 'Heart Eyes' },    { char: '🥰', name: 'Smiling with Hearts' },
  { char: '😎', name: 'Cool Face' },     { char: '🤔', name: 'Thinking Face' },
  { char: '😢', name: 'Crying Face' },   { char: '🔥', name: 'Fire' },
  { char: '❤️', name: 'Red Heart' },     { char: '⭐', name: 'Star' },
  { char: '🎨', name: 'Artist Palette' },{ char: '⚽', name: 'Soccer Ball' },
  { char: '🏀', name: 'Basketball' },    { char: '🎸', name: 'Guitar' },
];

const artCategories = [
  {
    id: 'jersey',
    label: 'Jersey',
    icon: '👕',
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    activeBg: 'bg-blue-600',
    designs: [
      { id: 'j1', name: 'Ferrari',        src: '/our-designs/jersey/ferrari.jpg',    year: 2026, tag: 'new'    },
      { id: 'j2', name: 'Jersey Classic', src: '/our-designs/jersey/jersey-02.png',  year: 2024, tag: 'latest' },
      { id: 'j3', name: 'Jersey Sport',   src: '/our-designs/jersey/jersey-03.png',  year: 2023, tag: null     },
      { id: 'j4', name: 'Jersey Pro',     src: '/our-designs/jersey/jersey-04.png',  year: 2023, tag: null     },
      { id: 'j5', name: 'Jersey Elite',   src: '/our-designs/jersey/jersey-05.png',  year: 2022, tag: null     },
      { id: 'j6', name: 'Jersey Team',    src: '/our-designs/jersey/jersey-06.png',  year: 2024, tag: 'new'    },
    ],
  },
  {
    id: 'tshirt',
    label: 'T-Shirt',
    icon: '🎽',
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    activeBg: 'bg-purple-600',
    designs: [
      { id: 't1', name: 'Tee Graphic',  src: '/our-designs/tshirt/tshirt-01.png', year: 2024, tag: 'latest' },
      { id: 't2', name: 'Tee Street',   src: '/our-designs/tshirt/tshirt-02.png', year: 2024, tag: 'new'    },
      { id: 't3', name: 'Tee Minimal',  src: '/our-designs/tshirt/tshirt-03.png', year: 2023, tag: null     },
      { id: 't4', name: 'Tee Bold',     src: '/our-designs/tshirt/tshirt-04.png', year: 2023, tag: null     },
      { id: 't5', name: 'Tee Abstract', src: '/our-designs/tshirt/tshirt-05.png', year: 2022, tag: null     },
      { id: 't6', name: 'Tee Retro',    src: '/our-designs/tshirt/tshirt-06.png', year: 2024, tag: 'new'    },
    ],
  },
  {
    id: 'cap',
    label: 'Cap',
    icon: '🧢',
    color: 'from-cyan-500 to-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    activeBg: 'bg-cyan-600',
    designs: [
      { id: 'c1', name: 'Cap Classic',  src: '/our-designs/cap/cap-01.png', year: 2024, tag: 'latest' },
      { id: 'c2', name: 'Cap Street',   src: '/our-designs/cap/cap-02.png', year: 2024, tag: 'new'    },
      { id: 'c3', name: 'Cap Sport',    src: '/our-designs/cap/cap-03.png', year: 2023, tag: null     },
    ],
  },
  {
    id: 'bag',
    label: 'Tote Bag',
    icon: '👜',
    color: 'from-amber-500 to-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    activeBg: 'bg-amber-600',
    designs: [
      { id: 'b1', name: 'Bag Natural',  src: '/our-designs/bag/bag-01.png', year: 2024, tag: 'latest' },
      { id: 'b2', name: 'Bag Urban',    src: '/our-designs/bag/bag-02.png', year: 2024, tag: 'new'    },
      { id: 'b3', name: 'Bag Graphic',  src: '/our-designs/bag/bag-03.png', year: 2023, tag: null     },
    ],
  },
];

const artworkImages = [
  { id: 'art1', name: 'Star Badge',  src: '/artwork/star-badge.png',  thumb: '/artwork/star-badge.png'  },
  { id: 'art2', name: 'Flame',       src: '/artwork/flame.png',       thumb: '/artwork/flame.png'       },
  { id: 'art3', name: 'Crown',       src: '/artwork/crown.png',       thumb: '/artwork/crown.png'       },
  { id: 'art4', name: 'Lightning',   src: '/artwork/lightning.png',   thumb: '/artwork/lightning.png'   },
  { id: 'art5', name: 'Shield',      src: '/artwork/shield.png',      thumb: '/artwork/shield.png'      },
  { id: 'art6', name: 'Diamond',     src: '/artwork/diamond.png',     thumb: '/artwork/diamond.png'     },
  { id: 'art7', name: 'Skull',       src: '/artwork/skull.png',       thumb: '/artwork/skull.png'       },
  { id: 'art8', name: 'Wings',       src: '/artwork/wings.png',       thumb: '/artwork/wings.png'       },
];

const fontOptions = [
  { name: 'Arial',           value: 'Arial, sans-serif' },
  { name: 'Helvetica',       value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia',         value: 'Georgia, serif' },
  { name: 'Verdana',         value: 'Verdana, sans-serif' },
  { name: 'Courier New',     value: 'Courier New, monospace' },
  { name: 'Impact',          value: 'Impact, sans-serif' },
  { name: 'Comic Sans MS',   value: 'Comic Sans MS, cursive' },
];

type ProductView     = 'front' | 'back' | 'left' | 'right' | 'top';
type SidebarTab      = 'upload' | 'text' | 'art' | 'product' | 'names' | 'categories';
type PrintingMethod  = 'dtf' | 'dtg' | 'embroider' | 'uv' | 'waterbase';
type ArtFilter       = 'all' | 'latest' | 'new' | '2024' | '2023' | '2022';

interface UploadedImage  { id: string; name: string; url: string; thumb: string; }
interface ProductCategory { id: string; name: string; icon: string; availableViews: ProductView[]; description: string; productType: string; }
interface PrintingMethodType { id: PrintingMethod; name: string; icon: string; description: string; priceMultiplier: number; minOrder: number; }
interface ProductItem {
  id: string; name: string; categoryId: string;
  images: Partial<Record<ProductView, string>>;
  previewColor: string; borderColor: string;
  material?: string; sizes?: string[];
  features?: string[]; careInstructions?: string[];
  specs?: Record<string, string>;
}
interface DesignElement { id: string; type: 'text' | 'logo' | 'emoji' | 'number' | 'artwork'; content: string; x: number; y: number; scale: number; rotation: number; view: ProductView; productId: string; fontSize?: number; color?: string; imageUrl?: string; isBlackWhite?: boolean; opacity?: number; zIndex?: number; locked?: boolean; visible?: boolean; isBold?: boolean; isItalic?: boolean; fontFamily?: string; textAlign?: 'left' | 'center' | 'right'; width?: number; height?: number; }
interface SavedDesign { id: string; name: string; date: string; elements: DesignElement[]; productId: string; categoryId: string; printingMethod?: PrintingMethod; thumbnail: string; }

// ─── Product Type Categories ──────────────────────────────────────────────────
const productCategories: ProductCategory[] = [
  { id: 'cap-snapback',   name: 'Snapback Cap',  icon: '/new-icons/cap-snapback.png',  availableViews: ['front','back','left','right'], description: 'Flat brim snapback', productType: 'cap'     },
  { id: 'cap-dad',        name: 'Dad Cap',        icon: '/new-icons/cap-dad.png',       availableViews: ['front','back','left','right'], description: 'Curved brim cap',    productType: 'cap'     },
  { id: 'cap-trucker',    name: 'Trucker Cap',    icon: '/new-icons/cap-trucker.png',   availableViews: ['front','back','left','right'], description: 'Mesh back trucker',  productType: 'cap'     },
  { id: 'bottle-classic', name: 'Classic Bottle', icon: '/new-icons/bottle-classic.png',availableViews: ['front','top'],                description: '500ml water bottle', productType: 'bottle'  },
  { id: 'bottle-tumbler', name: 'Tumbler',        icon: '/new-icons/bottle-tumbler.png',availableViews: ['front','top'],                description: 'Insulated tumbler',  productType: 'bottle'  },
  { id: 'tote-standard',  name: 'Standard Tote',  icon: '/new-icons/tote-standard.png', availableViews: ['front','back','left','right'], description: 'Canvas tote bag',    productType: 'tote'    },
  { id: 'tote-large',     name: 'Large Tote',     icon: '/new-icons/tote-large.png',    availableViews: ['front','back','left','right'], description: 'Heavy canvas tote',  productType: 'tote'    },
  { id: 'pin-round',      name: 'Round Pin',      icon: '/new-icons/pin-round.png',     availableViews: ['front','back'],               description: '38mm round badge',   productType: 'pin'     },
  { id: 'pin-square',     name: 'Square Pin',     icon: '/new-icons/pin-square.png',    availableViews: ['front','back'],               description: '40mm square badge',  productType: 'pin'     },
  { id: 'pin-custom',     name: 'Custom Shape',   icon: '/new-icons/pin-custom.png',    availableViews: ['front','back'],               description: 'Custom shaped badge', productType: 'pin'    },
];

// ─── Product Sets ─────────────────────────────────────────────────────────────
const productSets: ProductItem[] = [
  // ── Caps ──
  {
    id: 'cap-black',
    name: 'Green Snapback',
    categoryId: 'cap-snapback',
    images: {
      front: '/multi-product/cap/green-cap/front-facing.jpg',
      back:  '/multi-product/cap/green-cap/back-facing.jpg',
      left:  '/products/caps/snapback-black/left.png',
      right: '/products/caps/snapback-black/right.png',
    },
    previewColor: 'bg-[#008000]', borderColor: 'border-green',
    material: 'Cotton Twill',
    sizes: ['One Size'],
    specs: { Material: 'Cotton Twill', Closure: 'Snapback', Profile: 'High', Brim: 'Flat', Panels: '6' },
    features: ['Structured high profile', 'Flat brim', 'Snapback closure', 'Embroidery-ready front panel'],
    careInstructions: ['Spot clean only', 'Do not machine wash', 'Air dry', 'Do not iron brim'],
  },
  {
    id: 'cap-white',
    name: 'White Snapback',
    categoryId: 'cap-snapback',
    images: {
      front: '/products/caps/snapback-white/front.png',
      back:  '/products/caps/snapback-white/back.png',
      left:  '/products/caps/snapback-white/left.png',
      right: '/products/caps/snapback-white/right.png',
    },
    previewColor: 'bg-white', borderColor: 'border-gray-300',
    material: 'Cotton Twill',
    sizes: ['One Size'],
    specs: { Material: 'Cotton Twill', Closure: 'Snapback', Profile: 'High', Brim: 'Flat', Panels: '6' },
    features: ['Clean white finish', 'Flat brim', 'Snapback closure'],
    careInstructions: ['Spot clean only', 'Air dry'],
  },
  {
    id: 'cap-navy',
    name: 'Navy Dad Cap',
    categoryId: 'cap-dad',
    images: {
      front: '/products/caps/dad-navy/front.png',
      back:  '/products/caps/dad-navy/back.png',
      left:  '/products/caps/dad-navy/left.png',
      right: '/products/caps/dad-navy/right.png',
    },
    previewColor: 'bg-blue-900', borderColor: 'border-blue-800',
    material: '100% Cotton',
    sizes: ['One Size Adjustable'],
    specs: { Material: '100% Cotton', Closure: 'Velcro', Profile: 'Low', Brim: 'Curved', Panels: '5' },
    features: ['Unstructured low profile', 'Pre-curved brim', 'Velcro closure', 'Soft cotton feel'],
    careInstructions: ['Hand wash cold', 'Air dry', 'Reshape while damp'],
  },
  {
    id: 'cap-khaki',
    name: 'Khaki Trucker',
    categoryId: 'cap-trucker',
    images: {
      front: '/products/caps/trucker-khaki/front.png',
      back:  '/products/caps/trucker-khaki/back.png',
      left:  '/products/caps/trucker-khaki/left.png',
      right: '/products/caps/trucker-khaki/right.png',
    },
    previewColor: 'bg-yellow-100', borderColor: 'border-yellow-300',
    material: 'Cotton / Mesh',
    sizes: ['One Size Adjustable'],
    specs: { Material: 'Cotton + Mesh', Closure: 'Snapback', Profile: 'Mid', Brim: 'Curved', Panels: '5' },
    features: ['Mesh back panels', 'Breathable design', 'Foam front panel', 'Snapback closure'],
    careInstructions: ['Spot clean only', 'Air dry flat'],
  },

  // ── Bottles ──
  {
    id: 'bottle-silver',
    name: 'Silver Classic Bottle',
    categoryId: 'bottle-classic',
    images: {
      front: '/products/bottles/classic-silver/front.png',
      top:   '/products/bottles/classic-silver/top.png',
    },
    previewColor: 'bg-gray-300', borderColor: 'border-gray-400',
    material: 'Stainless Steel',
    sizes: ['500ml'],
    specs: { Capacity: '500ml', Material: 'Stainless Steel', Lid: 'Screw Cap', Insulation: 'Single Wall', Height: '22cm' },
    features: ['Food-grade stainless steel', 'BPA-free', 'Wide mouth opening', 'Laser engraving compatible'],
    careInstructions: ['Hand wash recommended', 'Do not microwave', 'Do not dishwash lid'],
  },
  {
    id: 'bottle-black',
    name: 'Matte Black Bottle',
    categoryId: 'bottle-classic',
    images: {
      front: '/products/bottles/classic-black/front.png',
      top:   '/products/bottles/classic-black/top.png',
    },
    previewColor: 'bg-gray-900', borderColor: 'border-gray-700',
    material: 'Stainless Steel',
    sizes: ['500ml'],
    specs: { Capacity: '500ml', Material: 'Stainless Steel', Lid: 'Screw Cap', Finish: 'Matte', Height: '22cm' },
    features: ['Matte powder coat finish', 'BPA-free', 'Scratch resistant', 'Print-ready surface'],
    careInstructions: ['Hand wash only', 'Avoid abrasive cleaners'],
  },
  {
    id: 'tumbler-white',
    name: 'White Tumbler',
    categoryId: 'bottle-tumbler',
    images: {
      front: '/products/bottles/tumbler-white/front.png',
      top:   '/products/bottles/tumbler-white/top.png',
    },
    previewColor: 'bg-white', borderColor: 'border-gray-300',
    material: 'Double-Wall Stainless',
    sizes: ['350ml', '500ml'],
    specs: { Capacity: '350–500ml', Material: 'Double-Wall SS', Insulation: '12hr hot / 24hr cold', Lid: 'Slide Cap', Height: '19cm' },
    features: ['Double-wall vacuum insulation', 'Keeps drinks hot 12h / cold 24h', 'Non-slip base', 'Wide print area'],
    careInstructions: ['Hand wash only', 'Do not freeze', 'Do not microwave'],
  },

  // ── Tote Bags ──
  {
    id: 'tote-natural',
    name: 'Natural Canvas Tote',
    categoryId: 'tote-standard',
    images: {
      front: '/products/totes/standard-natural/front.png',
      back:  '/products/totes/standard-natural/back.png',
      left:  '/products/totes/standard-natural/left.png',
      right: '/products/totes/standard-natural/right.png',
    },
    previewColor: 'bg-yellow-50', borderColor: 'border-yellow-300',
    material: '100% Cotton Canvas',
    sizes: ['38cm × 42cm'],
    specs: { Material: '100% Cotton Canvas', Weight: '280g', Handles: 'Cotton Webbing', Handle_Length: '28cm', Gusset: 'No' },
    features: ['Natural undyed canvas', 'Long-lasting cotton handles', 'Flat bottom', 'Screen print compatible'],
    careInstructions: ['Machine wash cold', 'Tumble dry low', 'Iron on cotton setting'],
  },
  {
    id: 'tote-black',
    name: 'Black Canvas Tote',
    categoryId: 'tote-standard',
    images: {
      front: '/products/totes/standard-black/front.png',
      back:  '/products/totes/standard-black/back.png',
      left:  '/products/totes/standard-black/left.png',
      right: '/products/totes/standard-black/right.png',
    },
    previewColor: 'bg-gray-900', borderColor: 'border-gray-700',
    material: '100% Cotton Canvas',
    sizes: ['38cm × 42cm'],
    specs: { Material: '100% Cotton Canvas', Weight: '280g', Handles: 'Cotton Webbing', Dye: 'Reactive Dyed' },
    features: ['Rich black dye', 'UV-resistant print surface', 'Double-stitched seams'],
    careInstructions: ['Machine wash cold', 'Wash dark colors separately', 'Tumble dry low'],
  },
  {
    id: 'tote-large-natural',
    name: 'Large Natural Tote',
    categoryId: 'tote-large',
    images: {
      front: '/products/totes/large-natural/front.png',
      back:  '/products/totes/large-natural/back.png',
      left:  '/products/totes/large-natural/left.png',
      right: '/products/totes/large-natural/right.png',
    },
    previewColor: 'bg-amber-50', borderColor: 'border-amber-200',
    material: 'Heavy Cotton Canvas',
    sizes: ['42cm × 48cm'],
    specs: { Material: 'Heavy Cotton Canvas', Weight: '380g', Handles: 'Reinforced Webbing', Gusset: '8cm' },
    features: ['Heavy 380g canvas', 'Reinforced gusset', 'Extra-long handles', 'Grocery bag size'],
    careInstructions: ['Machine wash warm', 'Tumble dry medium', 'Iron as needed'],
  },

  // ── Pin Badges ──
  {
    id: 'pin-round-38',
    name: '38mm Round Pin',
    categoryId: 'pin-round',
    images: {
      front: '/products/pins/round-38/front.png',
      back:  '/products/pins/round-38/back.png',
    },
    previewColor: 'bg-gradient-to-br from-gray-100 to-gray-200', borderColor: 'border-gray-300',
    material: 'Tin Plate',
    sizes: ['38mm'],
    specs: { Diameter: '38mm', Material: 'Tin Plate', Closure: 'Safety Pin', Print: 'Full Colour', Finish: 'Gloss' },
    features: ['Full-colour printing', 'Durable gloss finish', 'Safety pin closure', 'Lightweight'],
    careInstructions: ['Keep dry', 'Do not submerge in water', 'Handle with care'],
  },
  {
    id: 'pin-round-58',
    name: '58mm Round Pin',
    categoryId: 'pin-round',
    images: {
      front: '/products/pins/round-58/front.png',
      back:  '/products/pins/round-58/back.png',
    },
    previewColor: 'bg-gradient-to-br from-blue-50 to-blue-100', borderColor: 'border-blue-200',
    material: 'Tin Plate',
    sizes: ['58mm'],
    specs: { Diameter: '58mm', Material: 'Tin Plate', Closure: 'Safety Pin', Print: 'Full Colour', Finish: 'Gloss' },
    features: ['Large display area', 'Vibrant full-colour print', 'Safety pin back', 'Mylar protective cover'],
    careInstructions: ['Keep dry', 'Store flat', 'Avoid scratching'],
  },
  {
    id: 'pin-square-40',
    name: '40mm Square Pin',
    categoryId: 'pin-square',
    images: {
      front: '/products/pins/square-40/front.png',
      back:  '/products/pins/square-40/back.png',
    },
    previewColor: 'bg-gradient-to-br from-purple-50 to-purple-100', borderColor: 'border-purple-200',
    material: 'Tin Plate',
    sizes: ['40mm × 40mm'],
    specs: { Size: '40mm × 40mm', Material: 'Tin Plate', Closure: 'Safety Pin', Shape: 'Square', Finish: 'Gloss' },
    features: ['Square format for bold designs', 'Full bleed print', 'Safety pin closure'],
    careInstructions: ['Keep dry', 'Do not bend'],
  },
  {
    id: 'pin-custom-shape',
    name: 'Custom Shape Pin',
    categoryId: 'pin-custom',
    images: {
      front: '/products/pins/custom/front.png',
      back:  '/products/pins/custom/back.png',
    },
    previewColor: 'bg-gradient-to-br from-green-50 to-emerald-100', borderColor: 'border-emerald-200',
    material: 'Tin Plate',
    sizes: ['Up to 60mm'],
    specs: { Size: 'Up to 60mm', Material: 'Tin Plate', Closure: 'Safety Pin', Shape: 'Custom Die-Cut', MOQ: '50 pieces' },
    features: ['Die-cut custom shape', 'Full-colour print', 'MOQ 50 pieces', 'Unique silhouette'],
    careInstructions: ['Keep dry', 'Store carefully'],
  },
];

// ─── Print Areas per product type ─────────────────────────────────────────────
const getPrintAreaForProduct = (productId: string, view: ProductView) => {
  const product  = productSets.find(p => p.id === productId);
  const category = productCategories.find(c => c.id === product?.categoryId);
  const type     = category?.productType ?? 'cap';

  type A = Record<string, { xMin: number; xMax: number; yMin: number; yMax: number }>;
  const areas: Record<string, A> = {
    cap: {
      front: { xMin: 22, xMax: 78, yMin: 22, yMax: 68 },
      back:  { xMin: 28, xMax: 72, yMin: 25, yMax: 70 },
      left:  { xMin: 30, xMax: 70, yMin: 25, yMax: 65 },
      right: { xMin: 30, xMax: 70, yMin: 25, yMax: 65 },
      top:   { xMin: 20, xMax: 80, yMin: 20, yMax: 80 },
    },
    bottle: {
      front: { xMin: 20, xMax: 80, yMin: 20, yMax: 80 },
      top:   { xMin: 25, xMax: 75, yMin: 25, yMax: 75 },
      back:  { xMin: 20, xMax: 80, yMin: 20, yMax: 80 },
      left:  { xMin: 25, xMax: 75, yMin: 20, yMax: 80 },
      right: { xMin: 25, xMax: 75, yMin: 20, yMax: 80 },
    },
    tote: {
      front: { xMin: 15, xMax: 85, yMin: 15, yMax: 78 },
      back:  { xMin: 15, xMax: 85, yMin: 15, yMax: 78 },
      left:  { xMin: 20, xMax: 80, yMin: 15, yMax: 75 },
      right: { xMin: 20, xMax: 80, yMin: 15, yMax: 75 },
      top:   { xMin: 20, xMax: 80, yMin: 20, yMax: 80 },
    },
    pin: {
      front: { xMin: 15, xMax: 85, yMin: 15, yMax: 85 },
      back:  { xMin: 20, xMax: 80, yMin: 20, yMax: 80 },
      left:  { xMin: 20, xMax: 80, yMin: 20, yMax: 80 },
      right: { xMin: 20, xMax: 80, yMin: 20, yMax: 80 },
      top:   { xMin: 20, xMax: 80, yMin: 20, yMax: 80 },
    },
  };

  const typeAreas = areas[type] ?? areas['cap'];
  return (typeAreas[view] ?? typeAreas['front']) as { xMin: number; xMax: number; yMin: number; yMax: number };
};

const printingMethods: PrintingMethodType[] = [
  { id: 'dtf',       name: 'DTF Printing',     icon: '/cluesstyle-icons/dtf-icon.png',        description: 'Direct to Film',      priceMultiplier: 1.0, minOrder: 1  },
  { id: 'dtg',       name: 'DTG Printing',     icon: '/cluesstyle-icons/dtg-icon.png',        description: 'Direct to Garment',   priceMultiplier: 1.2, minOrder: 1  },
  { id: 'embroider', name: 'Embroidery',       icon: '/cluesstyle-icons/embroidery-icon.png', description: 'Thread embroidery',   priceMultiplier: 2.0, minOrder: 10 },
  { id: 'uv',        name: 'UV Printing',      icon: '/cluesstyle-icons/uv-icon.png',         description: 'UV DTF – Vibrant',    priceMultiplier: 1.5, minOrder: 5  },
  { id: 'waterbase', name: 'Waterbase Screen', icon: '/cluesstyle-icons/waterbase-icon.png',  description: 'Eco-friendly screen', priceMultiplier: 1.8, minOrder: 50 },
];

// Product type groupings for display
const PRODUCT_TYPE_GROUPS = [
  { id: 'cap',    label: 'Caps',        icon: '🧢', color: 'from-cyan-500 to-blue-500'    },
  { id: 'bottle', label: 'Bottles',     icon: '🍶', color: 'from-gray-400 to-gray-600'    },
  { id: 'tote',   label: 'Tote Bags',   icon: '👜', color: 'from-amber-500 to-orange-500' },
  { id: 'pin',    label: 'Pin Badges',  icon: '📌', color: 'from-purple-500 to-pink-500'  },
];

// View pair layout (show 2 views side by side on desktop)
const VIEW_PAIRS_MAP: Record<string, [ProductView, ProductView][]> = {
  cap:    [['front', 'back'], ['left', 'right']],
  bottle: [['front', 'top']],
  tote:   [['front', 'back'], ['left', 'right']],
  pin:    [['front', 'back']],
};

const VIEW_TRANSLATE_X: Record<ProductView, string> = {
  front: 'translateX(290px)',
  back:  'translateX(260px)',
  left:  'translateX(290px)',
  right: 'translateX(260px)',
  top:   'translateX(275px)',
};

const LS_ELEMENTS = 'cst-product-elements-v1';
const LS_PRODUCT  = 'cst-product-id-v1';
const LS_CATEGORY = 'cst-product-cat-v1';
const LS_PRINTING = 'cst-product-printing-v1';
const LS_VIEW     = 'cst-product-view-v1';
const LS_DESIGNS  = 'cst-product-designs-v1';

const lsGet = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } };
const lsSet = (key: string, val: unknown) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const measureTextWidth = (content: string, fontSize: number, fontFamily: string, isBold: boolean, isItalic: boolean): number => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.font = `${isItalic ? 'italic' : 'normal'} ${isBold ? 'bold' : 'normal'} ${fontSize}px ${fontFamily}`;
    return ctx.measureText(content).width + 2;
  } catch {
    return Math.min(content.length * fontSize * 0.6 + 20, 400) * 1.15;
  }
};

const getElementDimensions = (el: DesignElement) => {
  if (el.width && el.height) return { width: el.width * el.scale, height: el.height * el.scale };
  if (el.type === 'text' || el.type === 'number') {
    const fs = el.fontSize ?? 32;
    const rawW = measureTextWidth(el.content, fs, el.fontFamily ?? 'Arial, sans-serif', el.isBold ?? false, el.isItalic ?? false);
    return { width: rawW * el.scale, height: fs * 1.5 * el.scale };
  }
  if (el.type === 'emoji') return { width: (el.fontSize ?? 48) * el.scale, height: (el.fontSize ?? 48) * el.scale };
  return { width: 100 * el.scale, height: 100 * el.scale };
};

const constrainToPrintArea = (x: number, y: number, imgW: number, imgH: number, view: ProductView, elemW: number, elemH: number, productId: string) => {
  if (imgW === 0 || imgH === 0) return { x, y };
  const area = getPrintAreaForProduct(productId, view);
  const xMin = (area.xMin / 100) * imgW, xMax = (area.xMax / 100) * imgW;
  const yMin = (area.yMin / 100) * imgH, yMax = (area.yMax / 100) * imgH;
  return {
    x: Math.max(xMin, Math.min(xMax - elemW, x)),
    y: Math.max(yMin, Math.min(yMax - elemH, y)),
  };
};

const getMaxScaleForElement = (el: DesignElement, imgW: number, imgH: number, productId: string) => {
  if (imgW === 0 || imgH === 0) return 5;
  const area  = getPrintAreaForProduct(productId, el.view);
  const areaW = ((area.xMax - area.xMin) / 100) * imgW;
  const areaH = ((area.yMax - area.yMin) / 100) * imgH;
  let bW = 100, bH = 100;
  if (el.width && el.height) { bW = el.width; bH = el.height; }
  else if (el.type === 'text' || el.type === 'number') {
    const fs = el.fontSize ?? 32;
    bW = measureTextWidth(el.content, fs, el.fontFamily ?? 'Arial, sans-serif', el.isBold ?? false, el.isItalic ?? false);
    bH = fs * 1.5;
  } else if (el.type === 'emoji') { bW = el.fontSize ?? 48; bH = el.fontSize ?? 48; }
  return Math.max(0.2, Math.min(areaW / bW, areaH / bH));
};

// ─── ArtDesignsModal ──────────────────────────────────────────────────────────
const ArtDesignsModal = ({ category, onClose, onAddArtwork }: { category: typeof artCategories[0]; onClose: () => void; onAddArtwork: (src: string, name: string) => void; }) => {
  const [filter, setFilter] = useState<ArtFilter>('all');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const filterOptions = [
    { id: 'all' as ArtFilter, label: 'All', icon: <Grid size={13} /> },
    { id: 'latest' as ArtFilter, label: 'Latest', icon: <Clock size={13} /> },
    { id: 'new' as ArtFilter, label: 'New', icon: <Sparkles size={13} /> },
    { id: '2024' as ArtFilter, label: '2024', icon: <Star size={13} /> },
    { id: '2023' as ArtFilter, label: '2023', icon: <Star size={13} /> },
  ];
  const filtered = category.designs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'latest') return d.tag === 'latest';
    if (filter === 'new') return d.tag === 'new';
    return d.year === parseInt(filter);
  });
  return (
    <div className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl" style={{ maxHeight: '88vh', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg" style={{ background: 'rgba(255,255,255,0.12)' }}>{category.icon}</div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{category.label} Designs</h2>
              <p className="text-gray-400 text-xs mt-0.5">{category.designs.length} designs available</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full transition" style={{ background: 'rgba(255,255,255,0.1)' }}><X size={18} className="text-white" /></button>
        </div>
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 space-y-3 bg-gray-50">
          <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${category.label} designs…`} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" /></div>
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {filterOptions.map(f => <button key={f.id} onClick={() => setFilter(f.id)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f.id ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{f.icon}{f.label}</button>)}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-3">🎨</div><p className="text-gray-500 font-medium">No designs found</p>
              <button onClick={() => { setFilter('all'); setSearch(''); }} className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(design => (
                <button key={design.id} onClick={() => { onAddArtwork(design.src, design.name); onClose(); }} onMouseEnter={() => setHoveredId(design.id)} onMouseLeave={() => setHoveredId(null)}
                  className="relative group flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 active:scale-95"
                  style={{ borderColor: hoveredId === design.id ? '#6366f1' : '#e5e7eb', boxShadow: hoveredId === design.id ? '0 8px 24px rgba(99,102,241,0.18)' : '0 1px 4px rgba(0,0,0,0.06)', background: hoveredId === design.id ? '#f5f3ff' : '#fafafa' }}>
                  {design.tag && <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide" style={{ background: design.tag === 'new' ? '#10b981' : '#f59e0b', color: 'white' }}>{design.tag === 'new' ? '✦ New' : '★ Latest'}</div>}
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-semibold">{design.year}</div>
                  <div className="w-full aspect-square flex items-center justify-center p-4 bg-white relative overflow-hidden">
                    <img src={design.src} alt={design.name} className="max-w-full max-h-full object-contain transition-transform duration-200" style={{ transform: hoveredId === design.id ? 'scale(1.08)' : 'scale(1)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200" style={{ background: 'rgba(99,102,241,0.85)', opacity: hoveredId === design.id ? 1 : 0 }}>
                      <div className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"><Check size={20} className="text-indigo-600" /></div><span className="text-white text-xs font-bold">Add to Design</span></div>
                    </div>
                  </div>
                  <div className="px-2 py-2 text-center"><p className="text-xs font-semibold text-gray-700 truncate leading-tight">{design.name}</p></div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0 bg-gray-50"><p className="text-center text-xs text-gray-400">{filtered.length} of {category.designs.length} designs shown · Click any to add</p></div>
      </div>
    </div>
  );
};

// ─── ProductSpecsModal ────────────────────────────────────────────────────────
const ProductSpecsModal = ({ product, selectedPrintingMethod, onClose }: { product: ProductItem; selectedPrintingMethod: PrintingMethod; onClose: () => void }) => {
  const method = printingMethods.find(m => m.id === selectedPrintingMethod);
  const category = productCategories.find(c => c.id === product.categoryId);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[1200] p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col overflow-hidden shadow-2xl" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-800 to-gray-900">
          <div><h2 className="text-white font-bold text-lg leading-tight">{product.name}</h2><p className="text-gray-400 text-xs capitalize mt-0.5">{category?.name} · {category?.productType}</p></div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"><X size={18} className="text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5" style={{ WebkitOverflowScrolling: 'touch' }}>
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-xl p-3">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide block">{k.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-gray-800 font-bold mt-0.5 block">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Key Features</h3>
              <div className="space-y-2">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 bg-blue-50 rounded-xl">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><Check size={11} color="white" /></div>
                    <span className="text-sm text-blue-800 font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {product.careInstructions && product.careInstructions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Care Instructions</h3>
              <div className="space-y-2">
                {product.careInstructions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5"><span className="text-base">{'🧺🚫💧🌡️🧴'.split('')[i % 5]}</span><span className="text-sm text-gray-700">{c}</span></div>
                ))}
              </div>
            </div>
          )}
          {method && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Selected Printing Method</h3>
              <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                <img src={method.icon} alt={method.name} className="w-10 h-10 flex-shrink-0 rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="flex-1"><p className="text-sm font-bold text-indigo-800">{method.name}</p><p className="text-xs text-indigo-500">{method.description}</p></div>
                <div className="text-right"><p className="text-xs font-bold text-indigo-600">Min: {method.minOrder}</p><p className="text-[10px] text-indigo-400">{method.priceMultiplier}x base</p></div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 p-4 flex-shrink-0"><button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition">Close</button></div>
      </div>
    </div>
  );
};

// ─── InlineTextEditPanel ──────────────────────────────────────────────────────
const InlineTextEditPanel = ({ el, onUpdate, onClose }: { el: DesignElement; onUpdate: (id: string, prop: keyof DesignElement, value: any) => void; onClose: () => void; }) => {
  const [localContent, setLocalContent] = useState(el.content);
  const commit = () => { if (localContent.trim()) onUpdate(el.id, 'content', localContent); onClose(); };
  return (
    <div className="absolute z-[200] bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 w-64" style={{ top: '105%', left: '50%', transform: 'translateX(-50%)' }} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-gray-700">Edit Text</span><button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100"><X size={10} /></button></div>
      <textarea value={localContent} onChange={e => setLocalContent(e.target.value)} rows={2} autoFocus className="w-full p-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); } }} />
      <div className="flex gap-2 mt-2">
        <input type="color" value={el.color ?? '#000000'} onChange={e => onUpdate(el.id, 'color', e.target.value)} className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0" />
        <select value={el.fontFamily ?? 'Arial, sans-serif'} onChange={e => onUpdate(el.id, 'fontFamily', e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-1 focus:outline-none">
          {fontOptions.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={() => onUpdate(el.id, 'isBold', !el.isBold)} className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${el.isBold ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>B</button>
        <button onClick={() => onUpdate(el.id, 'isItalic', !el.isItalic)} className={`flex-1 py-1 rounded-lg text-xs italic transition ${el.isItalic ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>I</button>
        <button onClick={commit} className="flex-1 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"><Check size={10} /> Done</button>
      </div>
    </div>
  );
};

// ─── ElementWithHandles ───────────────────────────────────────────────────────
const ElementWithHandles = ({ el, isSelected, onMouseDown, onTouchStart, onClick, onDelete, onDuplicate, onRotateStart, onResizeStart, onResizeTouchStart, onUpdateProp }: {
  el: DesignElement; isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void; onTouchStart: (e: React.TouchEvent) => void; onClick: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent | React.TouchEvent) => void; onDuplicate: (e: React.MouseEvent | React.TouchEvent) => void;
  onRotateStart: (e: React.MouseEvent) => void; onResizeStart: (e: React.MouseEvent) => void; onResizeTouchStart: (e: React.TouchEvent) => void;
  onUpdateProp: (id: string, prop: keyof DesignElement, value: any) => void;
}) => {
  const [showInlineEdit, setShowInlineEdit] = useState(false);
  const isTextType = el.type === 'text' || el.type === 'number';
  const hs: React.CSSProperties = { position: 'absolute', width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.35)', cursor: 'pointer', pointerEvents: 'auto' };
  return (
    <div data-element="true" style={{ position: 'absolute', left: el.x, top: el.y, transform: `rotate(${el.rotation}deg)`, transformOrigin: '0 0', opacity: el.opacity ?? 1, filter: el.isBlackWhite ? 'grayscale(100%)' : 'none', zIndex: el.zIndex ?? 0, pointerEvents: 'auto', cursor: el.locked ? 'not-allowed' : 'move', overflow: 'visible' }} onMouseDown={onMouseDown} onTouchStart={onTouchStart} onClick={onClick}>
      {isSelected && <div style={{ position: 'absolute', inset: -10, border: '2px dashed #2563eb', borderRadius: 4, pointerEvents: 'none', zIndex: 10 }} />}
      {isSelected && <div style={{ ...hs, top: -14, left: -14, background: '#ef4444' }} onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onDelete(e); }} onTouchStart={e => { e.stopPropagation(); onDelete(e); }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></div>}
      {isSelected && <div style={{ ...hs, top: -14, right: -14, background: '#f59e0b', cursor: 'grab' }} onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onRotateStart(e); }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6" /><path d="M21.34 15.57a10 10 0 11-.57-8.38" /></svg></div>}
      {isSelected && <div style={{ ...hs, bottom: -14, left: -14, background: '#3b82f6' }} onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onDuplicate(e); }} onTouchStart={e => { e.stopPropagation(); onDuplicate(e); }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg></div>}
      {isSelected && <div style={{ ...hs, bottom: -14, right: -14, background: '#10b981', cursor: 'se-resize' }} onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onResizeStart(e); }} onTouchStart={e => { e.stopPropagation(); onResizeTouchStart(e); }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 9 3 3 9 3" /><polyline points="21 15 21 21 15 21" /><line x1="3" y1="3" x2="10" y2="10" /><line x1="21" y1="21" x2="14" y2="14" /></svg></div>}
      {isSelected && isTextType && <div style={{ ...hs, top: -14, left: '50%', transform: 'translateX(-50%)', background: '#8b5cf6', width: 24, height: 24 }} onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setShowInlineEdit(v => !v); }} onTouchStart={e => { e.stopPropagation(); setShowInlineEdit(v => !v); }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></div>}
      {showInlineEdit && isTextType && <InlineTextEditPanel el={el} onUpdate={onUpdateProp} onClose={() => setShowInlineEdit(false)} />}
      {(el.type === 'text' || el.type === 'number') && <div style={{ fontSize: (el.fontSize ?? 32) * el.scale, color: el.color, fontFamily: el.fontFamily, fontWeight: el.isBold ? 'bold' : 'normal', fontStyle: el.isItalic ? 'italic' : 'normal', textAlign: el.textAlign ?? 'center', whiteSpace: 'nowrap', userSelect: 'none', lineHeight: 1.2 }}>{el.content}</div>}
      {el.type === 'emoji' && <div style={{ fontSize: (el.fontSize ?? 48) * el.scale, userSelect: 'none', lineHeight: 1 }}>{el.content}</div>}
      {(el.type === 'logo' || el.type === 'artwork') && el.imageUrl && <img src={el.imageUrl} alt="element" draggable={false} style={{ width: (el.width ?? 100) * el.scale, height: (el.height ?? 100) * el.scale, display: 'block', userSelect: 'none', objectFit: 'contain' }} />}
    </div>
  );
};

// ─── SidebarIcon ──────────────────────────────────────────────────────────────
const SidebarIcon = ({ imageIcon, label, active, onClick, size = 32 }: { imageIcon?: string; label: string; active: boolean; onClick: () => void; size?: number }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg transition-all duration-200 group ${active ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
    {imageIcon && <img src={imageIcon} alt={label} style={{ width: size, height: size }} className={`object-contain transition-opacity ${active ? 'opacity-60' : 'opacity-100'}`} />}
    <span className={`text-[10px] mt-0.5 font-medium leading-tight text-center ${active ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`}>{label}</span>
  </button>
);

// ─── MobileBottomNavItem ──────────────────────────────────────────────────────
const MobileBottomNavItem = ({ imageIcon, label, active, onClick, badge, isSpecial }: { imageIcon?: string; label: string; active: boolean; onClick: () => void; badge?: number; isSpecial?: boolean; }) => (
  <button onClick={onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative', WebkitTapHighlightColor: 'transparent', minWidth: 0, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
    <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: active ? 28 : 0, height: 3, borderRadius: '0 0 3px 3px', background: isSpecial ? '#8b5cf6' : '#4F46E5', transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)' }} />
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 26, borderRadius: 8, background: active ? (isSpecial ? '#F3F0FF' : '#EEF2FF') : 'transparent', transition: 'background 0.18s', position: 'relative', marginBottom: 3 }}>
      {imageIcon ? <img src={imageIcon} alt={label} style={{ width: 35, height: 35, objectFit: 'contain', transition: 'filter 0.18s' }} /> : null}
      {badge && badge > 0 ? <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, background: '#E24B4A', borderRadius: 8, fontSize: 8, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #fff', lineHeight: 1 }}>{badge}</span> : null}
    </span>
    <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? (isSpecial ? '#8b5cf6' : '#4F46E5') : '#9CA3AF', letterSpacing: 0.1, lineHeight: 1, transition: 'color 0.18s', whiteSpace: 'nowrap' }}>{label}</span>
  </button>
);

// ─── PrintAreaOverlay ─────────────────────────────────────────────────────────
const PrintAreaOverlay = ({ view, productId }: { view: ProductView; productId: string }) => {
  const area = getPrintAreaForProduct(productId, view);
  return (
    <div className="absolute pointer-events-none border-2 border-dashed border-blue-500 bg-blue-500/5 rounded-lg" style={{ left: `${area.xMin}%`, top: `${area.yMin}%`, width: `${area.xMax - area.xMin}%`, height: `${area.yMax - area.yMin}%` }}>
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded shadow-sm bg-blue-500 text-white">Print Area</div>
      {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map(pos => <div key={pos} className={`absolute w-2 h-2 rounded-full bg-blue-500 ${pos}`} />)}
    </div>
  );
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────
const Dropdown = ({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm font-semibold text-gray-700">{label}{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
    {open && <div className="p-4">{children}</div>}
  </div>
);

// ─── CategoriesPanel ──────────────────────────────────────────────────────────
const CategoriesPanel = ({ selectedCategory, onSelectCategory, onSelectProduct, selectedProduct, selectedPrintingMethod, onSelectPrintingMethod }: {
  selectedCategory: string; onSelectCategory: (c: ProductCategory) => void;
  onSelectProduct: (p: ProductItem) => void; selectedProduct: ProductItem;
  selectedPrintingMethod: PrintingMethod; onSelectPrintingMethod: (m: PrintingMethod) => void;
}) => {
  const [catOpen, setCatOpen]   = useState(true);
  const [printOpen, setPrintOpen] = useState(false);
  const [activeType, setActiveType] = useState(() => {
    const cat = productCategories.find(c => c.id === selectedCategory);
    return cat?.productType ?? 'cap';
  });

  const catsOfType = productCategories.filter(c => c.productType === activeType);
  const productsOfCategory = productSets.filter(p => p.categoryId === selectedCategory);

  return (
    <div className="space-y-2">
      {/* Product Type Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-1">
        {PRODUCT_TYPE_GROUPS.map(g => (
          <button key={g.id} onClick={() => { setActiveType(g.id); const firstCat = productCategories.find(c => c.productType === g.id); if (firstCat) { onSelectCategory(firstCat); const firstProd = productSets.find(p => p.categoryId === firstCat.id); if (firstProd) onSelectProduct(firstProd); } }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-sm font-semibold ${activeType === g.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'}`}>
            <span className="text-lg">{g.icon}</span>
            <span className="text-xs">{g.label}</span>
            {activeType === g.id && <span className="ml-auto text-blue-500 text-xs">✔</span>}
          </button>
        ))}
      </div>

      <Dropdown label="Styles" open={catOpen} onToggle={() => setCatOpen(v => !v)}>
        <div className="grid grid-cols-1 gap-2">
          {catsOfType.map(cat => {
            const prodsInCat = productSets.filter(p => p.categoryId === cat.id);
            return (
              <button key={cat.id} onClick={() => { onSelectCategory(cat); const first = prodsInCat[0]; if (first) onSelectProduct(first); }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedCategory === cat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <img src={cat.icon} className="w-10 h-10 object-contain flex-shrink-0" alt={cat.name} onError={e => { const el = e.target as HTMLImageElement; el.style.display = 'none'; }} />
                <div className="flex-1 min-w-0"><span className="text-sm font-semibold text-gray-800 block">{cat.name}</span><span className="text-xs text-gray-500">{cat.description}</span></div>
                {selectedCategory === cat.id && <span className="text-blue-500 text-xs flex-shrink-0">✔</span>}
              </button>
            );
          })}
        </div>
      </Dropdown>

      {productsOfCategory.length > 1 && (
        <Dropdown label="Color / Variant" open={true} onToggle={() => {}}>
          <div className="grid grid-cols-3 gap-2">
            {productsOfCategory.map(prod => (
              <button key={prod.id} onClick={() => onSelectProduct(prod)}
                className={`flex flex-col items-center p-2 rounded-xl border transition-all ${selectedProduct.id === prod.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className={`w-8 h-8 rounded-lg mb-1 border ${prod.previewColor} ${prod.borderColor}`} />
                <div className="text-[11px] font-medium text-center leading-tight">{prod.name}</div>
                {selectedProduct.id === prod.id && <span className="text-blue-500 text-[10px] mt-0.5">✔ Selected</span>}
              </button>
            ))}
          </div>
        </Dropdown>
      )}

      <Dropdown label={`Printing – ${printingMethods.find(m => m.id === selectedPrintingMethod)?.name}`} open={printOpen} onToggle={() => setPrintOpen(v => !v)}>
        <div className="space-y-2">
          {printingMethods.map(method => (
            <button key={method.id} onClick={() => onSelectPrintingMethod(method.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedPrintingMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <img src={method.icon} className="w-6 h-6 flex-shrink-0" alt={method.name} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div><div className="text-sm font-medium">{method.name}</div><div className="text-xs text-gray-500">{method.description} · Min {method.minOrder}</div></div>
              {selectedPrintingMethod === method.id && <span className="ml-auto text-blue-500">✔</span>}
            </button>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};

// ─── UploadedImageCard ────────────────────────────────────────────────────────
const UploadedImageCard = ({ img, onPlace, onDelete, onDuplicate, placedCount }: { img: UploadedImage; onPlace: (img: UploadedImage) => void; onDelete: (id: string) => void; onDuplicate: (img: UploadedImage) => void; placedCount: number }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 p-3">
        <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer group" onClick={() => onPlace(img)}>
          <img src={img.url} alt={img.name} className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center"><span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-blue-600 bg-white/90 px-1.5 py-0.5 rounded-full">Add</span></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{img.name}</p>
          {placedCount > 0 && <span className="inline-block mt-0.5 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">{placedCount} on canvas</span>}
          <div className="flex gap-1.5 mt-2">
            <button onClick={() => onPlace(img)} className="flex-1 py-1 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ Add</button>
            <button onClick={() => setExpanded(v => !v)} className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition ${expanded ? 'bg-gray-100 border-gray-300 text-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>···</button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onDuplicate(img)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition text-xs font-semibold"><Copy size={13} />Duplicate</button>
            <button onClick={() => onDelete(img.id)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition text-xs font-semibold"><Trash2 size={13} />Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── UploadPanel ──────────────────────────────────────────────────────────────
const UploadPanel = ({ onUpload, uploadedImages, onPlaceImage, onDeleteUpload, onDuplicateUpload, elements }: { onUpload: (f: File) => void; uploadedImages: UploadedImage[]; onPlaceImage: (img: UploadedImage) => void; onDeleteUpload: (id: string) => void; onDuplicateUpload: (img: UploadedImage) => void; elements: DesignElement[] }) => {
  const [dragActive, setDragActive] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const onDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type !== 'dragleave'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]); };
  return (
    <div className="space-y-4 pt-2">
      <button onClick={() => ref.current?.click()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">Browse Your Computer</button>
      <input ref={ref} type="file" accept="image/*" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} className="hidden" />
      <div onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop} className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Drag & drop your image here</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10 MB</p>
      </div>
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Your Uploads ({uploadedImages.length})</h4>
          <div className="space-y-3">{uploadedImages.map(img => <UploadedImageCard key={img.id} img={img} onPlace={i => onPlaceImage(i)} onDelete={onDeleteUpload} onDuplicate={onDuplicateUpload} placedCount={elements.filter(el => el.imageUrl === img.url).length} />)}</div>
        </div>
      )}
      <div className="bg-blue-50 rounded-xl p-4"><h4 className="text-sm font-semibold text-blue-800 mb-2">Print Area Guide</h4><div className="flex items-center gap-2 mt-1 text-xs text-blue-600"><AlertCircle size={12} /><span>Elements are auto-constrained to the print area.</span></div></div>
    </div>
  );
};

// ─── TextPanel ────────────────────────────────────────────────────────────────
const TextPanel = ({ onAddText }: { onAddText: (text: string, opts: any) => void }) => {
  const [text, setText]         = useState('');
  const [selectedFont, setFont] = useState(fontOptions[0].value);
  const [textSize, setTextSize] = useState(32);
  const [textColor, setColor]   = useState('#000000');
  const [isBold, setIsBold]     = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setAlign]   = useState<'left' | 'center' | 'right'>('center');
  return (
    <div className="space-y-4 pt-2">
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Your Text</label><textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enter your text…" rows={3} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-base" /></div>
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Font</label><select value={selectedFont} onChange={e => setFont(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl text-sm">{fontOptions.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}</select></div>
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Font Size: {textSize}px</label><input type="range" min="16" max="120" value={textSize} onChange={e => setTextSize(+e.target.value)} className="w-full" /></div>
      <div className="flex gap-3">
        <div className="flex-1"><label className="text-sm font-medium text-gray-700 mb-1 block">Color</label><input type="color" value={textColor} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-gray-200" /></div>
        <div className="flex-1"><label className="text-sm font-medium text-gray-700 mb-1 block">Align</label>
          <div className="flex gap-1">{(['left', 'center', 'right'] as const).map(a => <button key={a} onClick={() => setAlign(a)} className={`flex-1 py-2 rounded-lg ${textAlign === a ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{a === 'left' ? <AlignLeft size={16} className="mx-auto" /> : a === 'center' ? <AlignCenter size={16} className="mx-auto" /> : <AlignRight size={16} className="mx-auto" />}</button>)}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsBold(!isBold)} className={`flex-1 py-2 rounded-xl transition ${isBold ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}><Bold size={16} className="inline mr-1" />Bold</button>
        <button onClick={() => setIsItalic(!isItalic)} className={`flex-1 py-2 rounded-xl transition ${isItalic ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}><Italic size={16} className="inline mr-1" />Italic</button>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 overflow-hidden"><p className="text-xs text-gray-500 mb-1">Preview</p><div style={{ fontFamily: selectedFont, fontSize: `${Math.min(textSize, 36)}px`, color: textColor, fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', textAlign, maxWidth: '100%', overflow: 'hidden', wordBreak: 'break-word' }} className="p-2 bg-white rounded-lg min-h-[40px]">{text || 'Sample Text'}</div></div>
      <button onClick={() => { if (text.trim()) { onAddText(text, { fontFamily: selectedFont, fontSize: textSize, color: textColor, isBold, isItalic, textAlign }); setText(''); } }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">Add To Design</button>
    </div>
  );
};

// ─── ArtworkPanel ─────────────────────────────────────────────────────────────
const ArtworkPanel = ({ onAddEmoji, onAddNumber, onAddArtwork }: { onAddEmoji: (e: string) => void; onAddNumber: (n: string) => void; onAddArtwork: (src: string, name: string) => void }) => {
  const [activeTab, setActiveTab]           = useState<'emoji' | 'number' | 'images' | 'designs'>('designs');
  const [numberValue, setNumberValue]       = useState('');
  const [searchTerm, setSearchTerm]         = useState('');
  const [openCategory, setOpenCategory]     = useState<typeof artCategories[0] | null>(null);
  const filtered = emojis.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.char.includes(searchTerm));
  const jerseyNumbers = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','30','32','33'];
  return (
    <>
      <div className="space-y-3">
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[{ id: 'designs', label: '🎨 Designs' }, { id: 'emoji', label: '😊 Emojis' }, { id: 'number', label: '# Numbers' }, { id: 'images', label: '🖼 Artwork' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-shrink-0 py-2 px-2 text-xs font-semibold transition border-b-2 ${activeTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>{tab.label}</button>
          ))}
        </div>
        {activeTab === 'designs' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">Browse our curated design collections. Click a category to explore.</p>
            <div className="grid grid-cols-2 gap-3">
              {artCategories.map(cat => (
                <button key={cat.id} onClick={() => setOpenCategory(cat)} className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-200 active:scale-95 group overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)', border: '1.5px solid #e0e7ff' }}>{cat.icon}</div>
                  <div className="text-center"><p className="text-sm font-bold text-gray-800 leading-tight">{cat.label}</p><p className="text-[10px] text-gray-400 mt-0.5">{cat.designs.length} designs</p></div>
                  {cat.designs.some(d => d.tag === 'new') && <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-wide">New</div>}
                  <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors"><ChevronRight size={11} className="text-gray-400 group-hover:text-indigo-500" /></div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] text-gray-400 font-medium px-2">{artCategories.reduce((a, c) => a + c.designs.length, 0)} total designs</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
          </div>
        )}
        {activeTab === 'emoji' && (
          <>
            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search emojis…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" /></div>
            <div className="grid grid-cols-4 gap-2">
              {filtered.map(em => <button key={em.char} onClick={() => onAddEmoji(em.char)} className="flex flex-col items-center p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition group"><span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{em.char}</span><span className="text-[10px] text-gray-500 truncate w-full text-center">{em.name}</span></button>)}
            </div>
          </>
        )}
        {activeTab === 'number' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={numberValue} onChange={e => setNumberValue(e.target.value)} placeholder="Custom number…" className="flex-1 p-2 border border-gray-200 rounded-xl focus:outline-none" onKeyDown={e => { if (e.key === 'Enter' && numberValue.trim()) { onAddNumber(numberValue.trim()); setNumberValue(''); } }} />
              <button onClick={() => { if (numberValue.trim()) { onAddNumber(numberValue.trim()); setNumberValue(''); } }} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Add</button>
            </div>
            <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto">
              {jerseyNumbers.map(n => <button key={n} onClick={() => onAddNumber(n)} className="aspect-square flex items-center justify-center bg-gray-50 rounded-xl hover:bg-blue-100 transition text-lg font-bold" style={{ fontFamily: 'Impact, sans-serif' }}>{n}</button>)}
            </div>
          </div>
        )}
        {activeTab === 'images' && (
          <div className="grid grid-cols-3 gap-2">
            {artworkImages.map(art => (
              <button key={art.id} onClick={() => onAddArtwork(art.src, art.name)} className="flex flex-col items-center p-2 bg-gray-50 rounded-xl hover:bg-blue-50 border-2 border-transparent hover:border-blue-400 transition group">
                <div className="w-full h-16 flex items-center justify-center mb-1 rounded-lg bg-white overflow-hidden"><img src={art.thumb} alt={art.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23e5e7eb" rx="8"/><text x="50%" y="55%" text-anchor="middle" font-size="24">🖼</text></svg>'; }} /></div>
                <span className="text-[10px] text-gray-500 text-center truncate w-full">{art.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {openCategory && <ArtDesignsModal category={openCategory} onClose={() => setOpenCategory(null)} onAddArtwork={onAddArtwork} />}
    </>
  );
};

// ─── NamesPanel ───────────────────────────────────────────────────────────────
const NamesPanel = ({ onAddName }: { onAddName: (n: string) => void }) => {
  const [name, setName]           = useState('');
  const [recentNames, setRecentNames] = useState<string[]>(['Sarah', 'Michael', 'Emma', 'James']);
  const add = () => { if (name.trim()) { onAddName(name.trim()); setRecentNames(p => [name.trim(), ...p.slice(0, 3)]); setName(''); } };
  return (
    <div className="space-y-4 pt-2">
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Add a name to your design</label>
        <div className="flex gap-2"><input value={name} onChange={e => setName(e.target.value)} placeholder="Enter a name…" className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base" onKeyDown={e => e.key === 'Enter' && add()} /><button onClick={add} className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">Add</button></div>
      </div>
      {recentNames.length > 0 && <div><h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Names</h4><div className="flex flex-wrap gap-2">{recentNames.map((n, i) => <button key={i} onClick={() => setName(n)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition">{n}</button>)}</div></div>}
    </div>
  );
};

// ─── MobileSheetPanel ─────────────────────────────────────────────────────────
const MobileSheetPanel = ({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[900] lg:hidden" onClick={onClose} style={{ backdropFilter: 'blur(2px)' }} />
      <div className="fixed left-0 right-0 bottom-0 z-[1000] lg:hidden bg-white rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '82vh', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0"><span className="font-bold text-gray-900 text-base">{title}</span><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"><X size={16} className="text-gray-600" /></button></div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>{children}</div>
      </div>
    </>
  );
};

// ─── MobileSidebarPanel ───────────────────────────────────────────────────────
const MobileSidebarPanel = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[950] lg:hidden" onClick={onClose} style={{ backdropFilter: 'blur(2px)' }} />
      <div className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white z-[1000] lg:hidden shadow-2xl flex flex-col overflow-hidden">{children}</div>
    </>
  );
};

// ─── ProductSpecsCard ─────────────────────────────────────────────────────────
const ProductSpecsCard = ({ product, selectedPrintingMethod, onLearnMore }: { product: ProductItem; selectedPrintingMethod: PrintingMethod; onLearnMore: () => void }) => {
  const method   = printingMethods.find(m => m.id === selectedPrintingMethod);
  const category = productCategories.find(c => c.id === product.categoryId);
  const typeGroup = PRODUCT_TYPE_GROUPS.find(g => g.id === category?.productType);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-3 py-2"><span className="text-xs font-bold text-white tracking-wide uppercase">Product Specification</span></div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border-2 flex-shrink-0 ${product.previewColor} ${product.borderColor}`} />
          <div><p className="text-xs font-bold text-gray-800">{product.name}</p><p className="text-[10px] text-gray-500">{typeGroup?.icon} {category?.name}</p></div>
        </div>
        {product.specs && (
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
              <div key={k} className="flex flex-col bg-gray-50 rounded-lg p-1.5"><span className="text-gray-400 font-medium uppercase tracking-wide">{k.replace(/_/g, ' ')}</span><span className="text-gray-800 font-bold text-[9px] leading-tight">{v}</span></div>
            ))}
          </div>
        )}
        <button onClick={onLearnMore} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"><Info size={12} />Product Specification</button>
        {method && <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2"><img src={method.icon} alt={method.name} className="w-5 h-5 flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /><div><p className="text-[10px] font-bold text-blue-700">{method.name}</p><p className="text-[9px] text-blue-500">{method.description} · Min: {method.minOrder}</p></div></div>}
      </div>
    </div>
  );
};

// ─── WelcomePanel ─────────────────────────────────────────────────────────────
const WelcomePanel = ({ onSelect }: { onSelect: (tab: SidebarTab) => void }) => (
  <div className="py-2">
    <h4 className="text-base font-bold text-gray-800 text-[22px] -mt-2 py-2 text-center">Choose your product</h4>
    <div className="grid grid-cols-2 gap-3 mb-5">
      {PRODUCT_TYPE_GROUPS.map(g => (
        <button key={g.id} onClick={() => onSelect('categories')} className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-150 active:scale-95 shadow-sm">
          <span className="text-4xl">{g.icon}</span>
          <span className="text-sm font-semibold text-gray-700">{g.label}</span>
        </button>
      ))}
    </div>
    {/* <h4 className="text-base font-bold text-gray-800 text-[18px] mb-3 text-center">How do you want to start?</h4>
    <div className="grid grid-cols-2 gap-3 mb-5">
      {[
        { tab: 'categories' as SidebarTab, img: '/product-default-icon/products.png',  label: 'Products'  },
        { tab: 'upload'     as SidebarTab, img: '/product-default-icon/own-image.png', label: 'Upload'    },
        { tab: 'text'       as SidebarTab, img: '/product-default-icon/add-text.png',  label: 'Text'      },
        { tab: 'art'        as SidebarTab, img: '/product-default-icon/add-art.png',   label: 'Artwork'   },
      ].map(item => (
        <button key={item.tab} onClick={() => onSelect(item.tab)} className="rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-150 active:scale-95 overflow-hidden shadow-md">
          <img src={item.img} alt={item.label} className="w-full h-auto object-contain block drop-shadow-lg" style={{ maxHeight: '100px' }} />
        </button>
      ))}
    </div> */}
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
      <h5 className="text-sm font-semibold text-blue-700 mb-2">Quick Tips</h5>
      <div className="space-y-1 text-xs text-blue-600">
        <div className="flex items-center gap-2"><span>⊕</span><span>Drag and drop images anywhere</span></div>
        <div className="flex items-center gap-2"><span>⊟</span><span>Copy & paste from clipboard</span></div>
        <div className="flex items-center gap-2"><span>↻</span><span>Use handles to resize & rotate</span></div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CustomizedProductToolPage() {
  const [selectedProduct, setSelectedProductState]          = useState<ProductItem>(() => { const id = lsGet<string>(LS_PRODUCT, productSets[0].id); return productSets.find(p => p.id === id) ?? productSets[0]; });
  const [selectedCategory, setSelectedCategoryState]        = useState<string>(() => lsGet(LS_CATEGORY, 'cap-snapback'));
  const [selectedPrintingMethod, setSelectedPrintingState]  = useState<PrintingMethod>(() => lsGet(LS_PRINTING, 'dtf'));
  const [elements, setElementsState]                        = useState<DesignElement[]>(() => lsGet(LS_ELEMENTS, []));
  const [selectedView, setSelectedViewState]                = useState<ProductView>(() => lsGet(LS_VIEW, 'front'));

  const setSelectedProduct      = (p: ProductItem)     => { setSelectedProductState(p);   lsSet(LS_PRODUCT, p.id); };
  const setSelectedCategory     = (c: string)          => { setSelectedCategoryState(c);  lsSet(LS_CATEGORY, c);   };
  const setSelectedPrintingMethod = (m: PrintingMethod) => { setSelectedPrintingState(m); lsSet(LS_PRINTING, m);   };
  const setElements = (els: DesignElement[] | ((p: DesignElement[]) => DesignElement[])) => {
    setElementsState(prev => { const next = typeof els === 'function' ? els(prev) : els; lsSet(LS_ELEMENTS, next); return next; });
  };
  const setSelectedView = (v: ProductView) => { setSelectedViewState(v); lsSet(LS_VIEW, v); };

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging]               = useState(false);
  const [dragOffset, setDragOffset]               = useState({ x: 0, y: 0 });
  const [isEditModalOpen, setIsEditModalOpen]     = useState(false);
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false);
  const [history, setHistory]                     = useState<DesignElement[][]>([]);
  const [historyIndex, setHistoryIndex]           = useState(-1);
  const [savedDesigns, setSavedDesigns]           = useState<SavedDesign[]>(() => lsGet(LS_DESIGNS, []));
  const [designName, setDesignName]               = useState('');
  const [showSaveDialog, setShowSaveDialog]       = useState(false);
  const [editingElement, setEditingElement]       = useState<DesignElement | null>(null);
  const [tempScale, setTempScale]                 = useState(1);
  const [tempRotation, setTempRotation]           = useState(0);
  const [tempOpacity, setTempOpacity]             = useState(1);
  const [showPrintArea, setShowPrintArea]         = useState(true);
  const [isMobile, setIsMobile]                   = useState(false);
  const [isTablet, setIsTablet]                   = useState(false);
  const [mobileSheetTab, setMobileSheetTab]       = useState<SidebarTab | null>(null);
  const [desktopActiveTab, setDesktopActiveTab]   = useState<SidebarTab | null>(null);
  const [mobileViewsOpen, setMobileViewsOpen]     = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [uploadedImages, setUploadedImages]       = useState<UploadedImage[]>([]);
  const [imgSize, setImgSize]                     = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
  const [viewImgSizes, setViewImgSizes]           = useState<Partial<Record<ProductView, { width: number; height: number; offsetX: number; offsetY: number }>>>({});
  const [showSpecsModal, setShowSpecsModal]       = useState(false);

  const canvasRef    = useRef<HTMLDivElement>(null);
  const canvasImgRef = useRef<HTMLImageElement>(null);
  const viewImgRefs  = useRef<Partial<Record<ProductView, HTMLImageElement | null>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const check = () => { const w = window.innerWidth; setIsMobile(w < 768); setIsTablet(w >= 768 && w < 1024); }; check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check); }, []);

  const measureImage = useCallback(() => { if (!canvasImgRef.current || !canvasRef.current) return; const ir = canvasImgRef.current.getBoundingClientRect(); const cr = canvasRef.current.getBoundingClientRect(); setImgSize({ width: ir.width, height: ir.height, offsetX: ir.left - cr.left, offsetY: ir.top - cr.top }); }, []);
  const measureAllViews = useCallback(() => {
    if (!canvasRef.current) return; const cr = canvasRef.current.getBoundingClientRect();
    const ns: Partial<Record<ProductView, { width: number; height: number; offsetX: number; offsetY: number }>> = {};
    Object.entries(viewImgRefs.current).forEach(([v, el]) => { if (el) { const r = el.getBoundingClientRect(); ns[v as ProductView] = { width: r.width, height: r.height, offsetX: r.left - cr.left, offsetY: r.top - cr.top }; } });
    setViewImgSizes(ns);
  }, []);

  useEffect(() => { const id = setTimeout(() => { measureImage(); measureAllViews(); }, 100); return () => clearTimeout(id); }, [selectedProduct, selectedView, desktopActiveTab, isMobile, isTablet, measureImage, measureAllViews]);
  useEffect(() => {
    if (!canvasImgRef.current) return;
    const ro = new ResizeObserver(() => { measureImage(); measureAllViews(); }); ro.observe(canvasImgRef.current);
    window.addEventListener('resize', () => { measureImage(); measureAllViews(); });
    return () => { ro.disconnect(); window.removeEventListener('resize', measureImage); };
  }, [measureImage, measureAllViews]);

  // Sync view when product changes
  useEffect(() => {
    const cat = productCategories.find(c => c.id === selectedProduct.categoryId);
    const views = cat?.availableViews ?? ['front'];
    if (!views.includes(selectedView)) setSelectedView(views[0] as ProductView);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  const pushHistory = useCallback((els: DesignElement[]) => {
    setHistory(h => { const next = [...h.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(els))]; setHistoryIndex(next.length - 1); return next; });
  }, [historyIndex]);

  const undo = () => { if (historyIndex > 0) { const i = historyIndex - 1; setHistoryIndex(i); setElementsState(JSON.parse(JSON.stringify(history[i]))); lsSet(LS_ELEMENTS, history[i]); } };
  const redo = () => { if (historyIndex < history.length - 1) { const i = historyIndex + 1; setHistoryIndex(i); setElementsState(JSON.parse(JSON.stringify(history[i]))); lsSet(LS_ELEMENTS, history[i]); } };

  const getAvailableViews = (): ProductView[] => {
    const cat = productCategories.find(c => c.id === selectedProduct.categoryId);
    return (cat?.availableViews ?? ['front']) as ProductView[];
  };

  const getProductType = () => {
    const cat = productCategories.find(c => c.id === selectedProduct.categoryId);
    return cat?.productType ?? 'cap';
  };

  const getViewPairs = (): [ProductView, ProductView][] => {
    const type = getProductType();
    return VIEW_PAIRS_MAP[type] ?? VIEW_PAIRS_MAP['cap'];
  };

  const navigateView = (direction: 'prev' | 'next') => {
    const available = getAvailableViews();
    const idx = available.indexOf(selectedView);
    if (direction === 'prev') setSelectedView(available[(idx - 1 + available.length) % available.length]);
    else setSelectedView(available[(idx + 1) % available.length]);
  };

  const getPlacementPosition = (elemW: number, elemH: number) => {
    if (imgSize.width === 0) return { x: 50, y: 50 };
    const area = getPrintAreaForProduct(selectedProduct.id, selectedView);
    const cx = ((area.xMin + area.xMax) / 2 / 100) * imgSize.width - elemW / 2;
    const cy = ((area.yMin + area.yMax) / 2 / 100) * imgSize.height - elemH / 2;
    return constrainToPrintArea(cx, cy, imgSize.width, imgSize.height, selectedView, elemW, elemH, selectedProduct.id);
  };

  const updateElementProperty = (id: string, prop: keyof DesignElement, value: any) => {
    setElements(prev => {
      const next = prev.map(el => {
        if (el.id !== id) return el;
        const updated = { ...el, [prop]: value };
        if (prop === 'fontSize' && (el.type === 'text' || el.type === 'number')) {
          updated.x = el.x + (getElementDimensions(el).width - getElementDimensions(updated).width) / 2;
        }
        return updated;
      });
      if ((prop === 'scale' || prop === 'fontSize') && imgSize.width > 0) {
        return next.map(el => {
          if (el.id !== id) return el;
          const { width: ew, height: eh } = getElementDimensions(el);
          return { ...el, ...constrainToPrintArea(el.x, el.y, imgSize.width, imgSize.height, el.view, ew, eh, selectedProduct.id) };
        });
      }
      return next;
    });
  };

  const closeMobileSheet = () => setMobileSheetTab(null);

  const addText = (content: string, opts?: any) => {
    if (!content.trim()) return;
    const fs = opts?.fontSize ?? 32; const fontFamily = opts?.fontFamily ?? 'Arial, sans-serif';
    const isBold = opts?.isBold ?? false; const isItalic = opts?.isItalic ?? false;
    const ew = measureTextWidth(content, fs, fontFamily, isBold, isItalic); const eh = fs * 1.5;
    const { x, y } = getPlacementPosition(ew, eh);
    const el: DesignElement = { id: Date.now().toString(), type: 'text', content, x, y, scale: 1, rotation: 0, view: selectedView, productId: selectedProduct.id, fontSize: fs, color: opts?.color ?? '#000000', isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true, isBold, isItalic, fontFamily, textAlign: opts?.textAlign ?? 'center' };
    const next = [...elements, el]; setElements(next); setSelectedElementId(el.id); closeMobileSheet(); pushHistory(next);
  };

  const addEmoji = (emoji: string) => {
    const sz = 48; const { x, y } = getPlacementPosition(sz, sz);
    const el: DesignElement = { id: Date.now().toString(), type: 'emoji', content: emoji, x, y, scale: 1, rotation: 0, view: selectedView, productId: selectedProduct.id, fontSize: sz, isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true, fontFamily: 'Segoe UI Emoji, Apple Color Emoji, sans-serif' };
    const next = [...elements, el]; setElements(next); setSelectedElementId(el.id); closeMobileSheet(); pushHistory(next);
  };

  const addNumber = (number: string) => {
    const fs = 64; const fontFamily = 'Impact, Arial Black, sans-serif';
    const ew = measureTextWidth(number, fs, fontFamily, true, false);
    const { x, y } = getPlacementPosition(ew, fs * 1.2);
    const el: DesignElement = { id: Date.now().toString(), type: 'number', content: number, x, y, scale: 1, rotation: 0, view: selectedView, productId: selectedProduct.id, fontSize: fs, color: '#FFFFFF', isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true, isBold: true, isItalic: false, fontFamily, textAlign: 'center' };
    const next = [...elements, el]; setElements(next); setSelectedElementId(el.id); closeMobileSheet(); pushHistory(next);
  };

  const addName = (name: string) => {
    const fs = 36; const fontFamily = 'Impact, Arial Black, sans-serif';
    const ew = measureTextWidth(name.toUpperCase(), fs, fontFamily, true, false);
    const { x, y } = getPlacementPosition(ew, fs * 1.5);
    const el: DesignElement = { id: Date.now().toString(), type: 'text', content: name.toUpperCase(), x, y, scale: 1, rotation: 0, view: selectedView, productId: selectedProduct.id, fontSize: fs, color: '#FFFFFF', isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true, isBold: true, isItalic: false, fontFamily, textAlign: 'center' };
    const next = [...elements, el]; setElements(next); setSelectedElementId(el.id); closeMobileSheet(); pushHistory(next);
  };

  const addArtwork = (src: string, name: string) => {
    const w = 100, h = 100; const { x, y } = getPlacementPosition(w, h);
    const el: DesignElement = { id: Date.now().toString(), type: 'artwork', content: name, x, y, scale: 1, rotation: 0, view: selectedView, productId: selectedProduct.id, imageUrl: src, isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true, width: w, height: h };
    const next = [...elements, el]; setElements(next); setSelectedElementId(el.id); closeMobileSheet(); pushHistory(next);
  };

  const uploadLogo = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const uploadedImg: UploadedImage = { id: `upload-${Date.now()}`, name: file.name.replace(/\.[^.]+$/, ''), url, thumb: url };
    setUploadedImages(prev => [...prev, uploadedImg]);
    img.onload = () => {
      const h = 100;
      const { x, y } = getPlacementPosition(Math.round(h * img.width / img.height), h);
      const el: DesignElement = { id: Date.now().toString(), type: 'logo', content: url, x, y, scale: 1, rotation: 0, view: selectedView, productId: selectedProduct.id, imageUrl: url, isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true, width: Math.round(h * img.width / img.height), height: h };
      const next = [...elements, el]; setElements(next); setSelectedElementId(el.id); closeMobileSheet(); pushHistory(next);
    };
    img.onerror = () => {
      const el: DesignElement = { id: Date.now().toString(), type: 'logo', content: url, x: 50, y: 50, scale: 1, rotation: 0, view: selectedView, productId: selectedProduct.id, imageUrl: url, isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true, width: 100, height: 100 };
      const next = [...elements, el]; setElements(next); pushHistory(next);
    };
    img.src = url;
  };

  const placeUploadedImage = (img: UploadedImage) => {
    const w = 100, h = 100; const { x, y } = getPlacementPosition(w, h);
    const el: DesignElement = { id: Date.now().toString(), type: 'logo', content: img.url, x, y, scale: 1, rotation: 0, view: selectedView, productId: selectedProduct.id, imageUrl: img.url, isBlackWhite: false, opacity: 1, zIndex: elements.length, locked: false, visible: true, width: w, height: h };
    const next = [...elements, el]; setElements(next); setSelectedElementId(el.id); pushHistory(next);
  };

  const deleteUploadedImage = (id: string) => { const img = uploadedImages.find(i => i.id === id); if (!img) return; setUploadedImages(prev => prev.filter(i => i.id !== id)); const next = elements.filter(el => el.imageUrl !== img.url); setElements(next); pushHistory(next); };
  const duplicateUploadedImage = (img: UploadedImage) => placeUploadedImage(img);

  const removeElement = (id: string) => { const next = elements.filter(e => e.id !== id); setElements(next); if (selectedElementId === id) setSelectedElementId(null); pushHistory(next); };
  const duplicateElement = (id: string) => { const el = elements.find(e => e.id === id); if (!el) return; const { width: ew, height: eh } = getElementDimensions(el); const c = constrainToPrintArea(el.x + 20, el.y + 20, imgSize.width, imgSize.height, el.view, ew, eh, selectedProduct.id); const newEl = { ...el, id: Date.now().toString(), ...c }; const next = [...elements, newEl]; setElements(next); setSelectedElementId(newEl.id); pushHistory(next); };
  const bringToFront = (id: string) => { const el = elements.find(e => e.id === id); if (!el) return; const next = [...elements.filter(e => e.id !== id), el]; setElements(next); pushHistory(next); };
  const toggleBlackWhite = (id: string) => { const el = elements.find(e => e.id === id); if (el) updateElementProperty(id, 'isBlackWhite', !el.isBlackWhite); };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    const el = elements.find(x => x.id === id); if (el?.locked) return;
    e.stopPropagation(); setSelectedElementId(id); setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (canvasRef.current && el) { const cr = canvasRef.current.getBoundingClientRect(); setDragOffset({ x: (clientX - cr.left) - imgSize.offsetX - el.x, y: (clientY - cr.top) - imgSize.offsetY - el.y }); }
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedElementId || !canvasRef.current) return;
    const el = elements.find(x => x.id === selectedElementId); if (!el || el.locked) return;
    e.preventDefault?.();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const cr = canvasRef.current.getBoundingClientRect();
    let x = (clientX - cr.left) - imgSize.offsetX - dragOffset.x;
    let y = (clientY - cr.top) - imgSize.offsetY - dragOffset.y;
    if (imgSize.width > 0) { const { width: ew, height: eh } = getElementDimensions(el); const c = constrainToPrintArea(x, y, imgSize.width, imgSize.height, el.view, ew, eh, selectedProduct.id); x = c.x; y = c.y; }
    setElements(prev => prev.map(item => item.id === selectedElementId ? { ...item, x, y } : item));
  }, [isDragging, selectedElementId, elements, imgSize, dragOffset, selectedProduct]);

  const handleMouseUp = useCallback(() => { if (isDragging) { setIsDragging(false); pushHistory(elements); } }, [isDragging, elements, pushHistory]);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mousemove', handleMouseMove, { passive: false }); window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false }); window.addEventListener('touchend', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); window.removeEventListener('touchmove', handleMouseMove); window.removeEventListener('touchend', handleMouseUp); };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleRotateStart = (e: React.MouseEvent, el: DesignElement) => {
    e.stopPropagation(); e.preventDefault();
    const target = (e.currentTarget as HTMLElement).closest('[data-element]') as HTMLElement; if (!target) return;
    const rect = target.getBoundingClientRect(); const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI; const startRot = el.rotation;
    const onMove = (mv: MouseEvent) => { updateElementProperty(el.id, 'rotation', startRot + (Math.atan2(mv.clientY - cy, mv.clientX - cx) * 180 / Math.PI - startAngle)); };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  const handleResizeStart = (e: React.MouseEvent, el: DesignElement) => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX; const startScale = el.scale;
    const maxScale = getMaxScaleForElement(el, imgSize.width, imgSize.height, selectedProduct.id);
    const { width: startWidth, height: startHeight } = getElementDimensions(el);
    const startCenterX = el.x + startWidth / 2; const startCenterY = el.y + startHeight / 2;
    const onMove = (mv: MouseEvent) => {
      const ns = Math.max(0.2, Math.min(maxScale, startScale + (mv.clientX - startX) / 80));
      setElements(prev => prev.map(item => {
        if (item.id !== el.id) return item;
        const upd = { ...item, scale: ns };
        if (imgSize.width > 0) {
          const { width: ew, height: eh } = getElementDimensions(upd);
          const area = getPrintAreaForProduct(selectedProduct.id, upd.view);
          const xMin = (area.xMin / 100) * imgSize.width, xMax = (area.xMax / 100) * imgSize.width;
          const yMin = (area.yMin / 100) * imgSize.height, yMax = (area.yMax / 100) * imgSize.height;
          let newX = startCenterX - ew / 2, newY = startCenterY - eh / 2;
          if (newX < xMin) newX = xMin; if (newX + ew > xMax) newX = xMax - ew;
          if (newY < yMin) newY = yMin; if (newY + eh > yMax) newY = yMax - eh;
          return { ...upd, x: newX, y: newY };
        }
        return upd;
      }));
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); pushHistory(elements); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  const handleResizeTouchStart = (e: React.TouchEvent, el: DesignElement) => {
    e.stopPropagation();
    const startX = e.touches[0].clientX; const startScale = el.scale;
    const maxScale = getMaxScaleForElement(el, imgSize.width, imgSize.height, selectedProduct.id);
    const { width: sw, height: sh } = getElementDimensions(el);
    const scx = el.x + sw / 2; const scy = el.y + sh / 2;
    const onMove = (mv: TouchEvent) => {
      const ns = Math.max(0.2, Math.min(maxScale, startScale + (mv.touches[0].clientX - startX) / 80));
      setElements(prev => prev.map(item => {
        if (item.id !== el.id) return item;
        const upd = { ...item, scale: ns };
        if (imgSize.width > 0) {
          const { width: ew, height: eh } = getElementDimensions(upd);
          const area = getPrintAreaForProduct(selectedProduct.id, upd.view);
          let nx = scx - ew / 2, ny = scy - eh / 2;
          nx = Math.max((area.xMin / 100) * imgSize.width, Math.min((area.xMax / 100) * imgSize.width - ew, nx));
          ny = Math.max((area.yMin / 100) * imgSize.height, Math.min((area.yMax / 100) * imgSize.height - eh, ny));
          return { ...upd, x: nx, y: ny };
        }
        return upd;
      }));
    };
    const onUp = () => { window.removeEventListener('touchmove', onMove as any); window.removeEventListener('touchend', onUp); };
    window.addEventListener('touchmove', onMove as any, { passive: true }); window.addEventListener('touchend', onUp);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('[data-element]')) { setSelectedElementId(null); setShowPrintArea(v => !v); }
  };

  const saveDesign = () => {
    if (!designName.trim()) { alert('Please enter a design name'); return; }
    const d: SavedDesign = { id: Date.now().toString(), name: designName, date: new Date().toLocaleString(), elements, productId: selectedProduct.id, categoryId: selectedCategory, printingMethod: selectedPrintingMethod, thumbnail: Object.values(selectedProduct.images)[0] ?? '' };
    const next = [...savedDesigns, d]; setSavedDesigns(next); lsSet(LS_DESIGNS, next); setShowSaveDialog(false); setDesignName('');
  };

  const loadDesign = (d: SavedDesign) => {
    setElementsState(d.elements); lsSet(LS_ELEMENTS, d.elements);
    const prod = productSets.find(p => p.id === d.productId);
    if (prod) { setSelectedProduct(prod); setSelectedCategory(prod.categoryId); }
    if (d.printingMethod) setSelectedPrintingMethod(d.printingMethod);
    setIsSavedDesignsOpen(false); pushHistory(d.elements);
  };

  const availableViews      = getAvailableViews();
  const currentViewElements = elements.filter(el => el.view === selectedView && el.visible !== false && (!el.productId || el.productId === selectedProduct.id));
  const otherViewBadge      = elements.filter(el => el.view !== selectedView && el.visible !== false && (!el.productId || el.productId === selectedProduct.id)).length;

  const sidebarIcons = [
    { id: 'categories' as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/add-product.png', label: '' },
    { id: 'upload'     as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/upload.png',      label: '' },
    { id: 'text'       as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/add-text.png',    label: '' },
    { id: 'art'        as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/add-art.png',     label: '' },
    { id: 'names'      as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/names.png',       label: '' },
  ];

  const mobileNavItems = [
    { id: 'categories' as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/product.png',  label: '' },
    { id: 'upload'     as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/upload.png',   label: '' },
    { id: 'text'       as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/add-text.png', label: '' },
    { id: 'art'        as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/add-art.png',  label: '' },
    { id: 'names'      as SidebarTab, imageIcon: '/custom-tool-t-shirt-mobile-logo/names.png',    label: '' },
  ];

  const titles: Record<SidebarTab, string> = { categories: 'Products & Printing', product: 'Products', upload: 'Upload Image', text: 'Add Text', art: 'Artwork Library', names: 'Add Names' };

  const renderMobilePanelContent = (tab: SidebarTab | null) => {
    switch (tab) {
      case 'categories': return <CategoriesPanel selectedCategory={selectedCategory} onSelectCategory={cat => { setSelectedCategory(cat.id); const p = productSets.find(pr => pr.categoryId === cat.id); if (p) setSelectedProduct(p); }} onSelectProduct={setSelectedProduct} selectedProduct={selectedProduct} selectedPrintingMethod={selectedPrintingMethod} onSelectPrintingMethod={setSelectedPrintingMethod} />;
      case 'upload':     return <UploadPanel onUpload={uploadLogo} uploadedImages={uploadedImages} onPlaceImage={placeUploadedImage} onDeleteUpload={deleteUploadedImage} onDuplicateUpload={duplicateUploadedImage} elements={elements} />;
      case 'text':       return <TextPanel onAddText={addText} />;
      case 'art':        return <ArtworkPanel onAddEmoji={addEmoji} onAddNumber={addNumber} onAddArtwork={addArtwork} />;
      case 'names':      return <NamesPanel onAddName={addName} />;
      default:           return null;
    }
  };

  const renderDesktopPanelContent = (tab: SidebarTab | null) => {
    if (tab === null) return <WelcomePanel onSelect={setDesktopActiveTab} />;
    return renderMobilePanelContent(tab);
  };

  const renderElements = (viewElems: DesignElement[], isActiveView = true) => viewElems.map(el => (
    <ElementWithHandles key={el.id} el={el} isSelected={isActiveView && selectedElementId === el.id}
      onMouseDown={e => { if (isActiveView) { e.stopPropagation(); handleMouseDown(e, el.id); } }}
      onTouchStart={e => { if (isActiveView) { e.stopPropagation(); handleMouseDown(e, el.id); } }}
      onClick={e => { if (isActiveView) { e.stopPropagation(); setSelectedElementId(el.id); } }}
      onDelete={e => { e.stopPropagation(); removeElement(el.id); }}
      onDuplicate={e => { e.stopPropagation(); duplicateElement(el.id); }}
      onRotateStart={e => handleRotateStart(e, el)}
      onResizeStart={e => handleResizeStart(e, el)}
      onResizeTouchStart={e => handleResizeTouchStart(e, el)}
      onUpdateProp={updateElementProperty}
    />
  ));

  const viewPairs = getViewPairs();

  return (
    <div className="h-screen max-h-screen flex flex-col bg-gray-50 overflow-hidden py-5 font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-indigo-100 transition active:scale-95" onClick={() => setMobileViewsOpen(true)} title="Change view">
              <img src="/custom-tool-t-shirt-mobile-logo/view.png" alt="Change view" className="w-8 h-8 object-contain" />
            </button>
            <h1 className="hidden sm:block text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">Cluesstyle Designer</h1>
            <div className="hidden lg:flex gap-2">
              <button onClick={undo} className="p-2 hover:bg-gray-100 rounded-lg" title="Undo"><Undo size={18} /></button>
              <button onClick={redo} className="p-2 hover:bg-gray-100 rounded-lg" title="Redo"><Redo size={18} /></button>
              <button onClick={() => setShowPrintArea(v => !v)} className={`p-2 rounded-lg ${showPrintArea ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`} title={showPrintArea ? 'Hide print area' : 'Show print area'}><Crop size={18} /></button>
              <button onClick={() => setIsSavedDesignsOpen(true)} className="px-2.5 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-1"><Layers size={16} /><span className="hidden sm:inline text-xs font-medium">Designs</span></button>
              <button onClick={() => setShowSaveDialog(true)} className="px-2.5 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"><Save size={16} /><span className="hidden sm:inline text-xs font-medium">Save</span></button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex lg:hidden gap-1">
              <button onClick={undo} className="p-2 hover:bg-gray-100 rounded-lg"><Undo size={16} /></button>
              <button onClick={redo} className="p-2 hover:bg-gray-100 rounded-lg"><Redo size={16} /></button>
              <button onClick={() => setShowPrintArea(v => !v)} className={`p-2 rounded-lg ${showPrintArea ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><Crop size={16} /></button>
            </div>
            <button onClick={() => setIsSavedDesignsOpen(true)} className="lg:hidden px-2.5 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-1"><Layers size={16} /></button>
            <button onClick={() => setShowSaveDialog(true)} className="lg:hidden px-2.5 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"><Save size={16} /></button>
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu size={20} className="text-gray-600" /></button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">

        {/* Desktop Left Sidebar */}
        <div className="hidden lg:flex absolute left-4 top-4 bottom-0 my-auto z-40 items-start gap-3">
          <div className="flex flex-col w-[100px] bg-[#000] h-[666px] rounded-xl shadow-lg overflow-hidden flex-shrink-0" style={{ maxHeight: 600 }}>
            <div className="flex flex-col items-center py-18 gap-4">
              {sidebarIcons.map(icon => <SidebarIcon key={icon.id} imageIcon={icon.imageIcon} active={desktopActiveTab === icon.id} size={65} onClick={() => setDesktopActiveTab(prev => prev === icon.id ? null : icon.id)} label={''} />)}
            </div>
          </div>
          <div className="w-[420px] h-[666px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col flex-shrink-0" style={{ maxHeight: 600 }}>
            <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0">
              <span className="font-semibold text-gray-800">{desktopActiveTab === null ? 'Design Studio' : titles[desktopActiveTab as SidebarTab]}</span>
              {desktopActiveTab !== null && <button onClick={() => setDesktopActiveTab(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-500" /></button>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ maxHeight: 538 }}>{renderDesktopPanelContent(desktopActiveTab)}</div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col items-center justify-start lg:justify-center overflow-hidden min-h-0">
          {!showPrintArea && currentViewElements.length > 0 && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-medium"><Eye size={12} /> Tap product to show print area</div>
            </div>
          )}
          <div ref={canvasRef} className="relative flex-shrink-0 flex items-center justify-center w-full" onClick={handleCanvasClick}>

            {/* MOBILE VIEW */}
            {isMobile ? (
              <div className="relative flex flex-col items-center w-full">
                <div className="relative flex items-center justify-center w-full">
                  <button onClick={e => { e.stopPropagation(); navigateView('prev'); }} className="absolute left-1 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-md hover:bg-white active:scale-90 transition" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                    <ChevronLeft size={18} className="text-gray-700" />
                  </button>
                  <div className="relative">
                    <br />
                    {selectedProduct.images[selectedView] ? (
                      <img ref={canvasImgRef} src={selectedProduct.images[selectedView]} alt={selectedView} onLoad={measureImage} draggable={false} className="select-none block" style={{ width: '100vw', maxHeight: 'calc(100vh - 270px)', objectFit: 'contain', pointerEvents: 'none' }} />
                    ) : (
                      <div className="flex items-center justify-center bg-gray-100 rounded-2xl" style={{ width: '100vw', maxHeight: 'calc(100vh - 270px)', height: 280 }}>
                        <div className="text-center text-gray-400"><div className="text-5xl mb-2">{PRODUCT_TYPE_GROUPS.find(g => g.id === getProductType())?.icon}</div><p className="text-sm font-medium">Image coming soon</p></div>
                      </div>
                    )}
                    {showPrintArea && <div className="absolute inset-0 pointer-events-none"><PrintAreaOverlay view={selectedView} productId={selectedProduct.id} /></div>}
                    {imgSize.width > 0 && <div className="absolute pointer-events-none" style={{ left: 0, top: 0, width: imgSize.width, height: imgSize.height, overflow: 'visible' }}>{renderElements(currentViewElements)}</div>}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-semibold capitalize pointer-events-none">{selectedView}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); navigateView('next'); }} className="absolute right-1 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-md hover:bg-white active:scale-90 transition" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {availableViews.map(v => <button key={v} onClick={() => setSelectedView(v)} className={`transition-all rounded-full ${selectedView === v ? 'w-5 h-2 bg-indigo-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />)}
                </div>
              </div>
            ) : (
              // DESKTOP VIEW — show 2 views side by side
              (() => {
                const activePair = viewPairs.find(pair => pair.includes(selectedView)) ?? viewPairs[0];
                return (
                  <div className="flex items-center justify-center gap-6">
                    {activePair.map(view => {
                      const imgSrc = selectedProduct.images[view];
                      const isActiveView = view === selectedView;
                      const viewElems = elements.filter(el => el.view === view && el.visible !== false && (!el.productId || el.productId === selectedProduct.id));
                      const thisViewSize = isActiveView ? imgSize : viewImgSizes[view];
                      return (
                        <div key={view} className="relative flex flex-col items-center" style={{ transform: VIEW_TRANSLATE_X[view] }} onClick={() => { if (!isActiveView) setSelectedView(view); }}>
                          <div className="relative">
                            {imgSrc ? (
                              <img
                                ref={el => { if (isActiveView) { (canvasImgRef as any).current = el; } else { viewImgRefs.current[view] = el; } }}
                                src={imgSrc} alt={view} onLoad={() => { if (isActiveView) measureImage(); measureAllViews(); }} draggable={false}
                                className="select-none block"
                                style={{ width: isTablet ? '35vw' : '27vw', maxHeight: 'calc(100vh - 64px)', objectFit: 'contain', pointerEvents: 'none' }}
                              />
                            ) : (
                              <div
                                ref={el => { if (isActiveView) { (canvasImgRef as any).current = null; } else { viewImgRefs.current[view] = null; } }}
                                className="flex items-center justify-center bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
                                style={{ width: isTablet ? '35vw' : '27vw', height: isTablet ? '45vw' : '34vw' }}
                              >
                                <div className="text-center text-gray-400"><div className="text-5xl mb-2">{PRODUCT_TYPE_GROUPS.find(g => g.id === getProductType())?.icon}</div><p className="text-sm font-medium capitalize">{view} view</p><p className="text-xs">Image coming soon</p></div>
                              </div>
                            )}
                            {isActiveView && showPrintArea && <div className="absolute inset-0 pointer-events-none"><PrintAreaOverlay view={view} productId={selectedProduct.id} /></div>}
                            {!isActiveView && showPrintArea && viewElems.length > 0 && (() => { const area = getPrintAreaForProduct(selectedProduct.id, view); return <div className="absolute pointer-events-none border border-dashed border-blue-300 rounded-lg opacity-50" style={{ left: `${area.xMin}%`, top: `${area.yMin}%`, width: `${area.xMax - area.xMin}%`, height: `${area.yMax - area.yMin}%` }} />; })()}
                            {thisViewSize && thisViewSize.width > 0 && viewElems.length > 0 && (
                              <div className="absolute" style={{ left: 0, top: 0, width: thisViewSize.width, height: thisViewSize.height, overflow: 'visible', pointerEvents: isActiveView ? 'auto' : 'none' }}>
                                {renderElements(viewElems, isActiveView)}
                              </div>
                            )}
                            {!isActiveView && viewElems.length > 0 && <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">{viewElems.length}</div>}
                          </div>
                          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${isActiveView ? 'bg-blue-500 text-white' : 'bg-black/40 text-white'}`}>{view}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Desktop Right Panel */}
        <div className="hidden lg:block w-70 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Views</h3>
              <div className="space-y-3">
                {viewPairs.map(pair => {
                  const isPairActive = pair.includes(selectedView);
                  return (
                    <div key={pair.join('-')} className={`w-full p-2 rounded-xl transition-all border-2 ${isPairActive ? 'bg-blue-50 border-blue-500' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}>
                      <div className="grid grid-cols-2 gap-2">
                        {pair.map(view => {
                          const isActive = view === selectedView;
                          const cnt = elements.filter(el => el.view === view && el.visible !== false && (!el.productId || el.productId === selectedProduct.id)).length;
                          const imgSrc = selectedProduct.images[view];
                          return (
                            <button key={view} onClick={() => setSelectedView(view)} className={`relative rounded-lg overflow-hidden transition-all ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-70 hover:opacity-100'}`}>
                              {imgSrc ? (
                                <img src={imgSrc} alt={view} className="w-full h-30 rounded-lg" style={{ objectFit: 'contain', display: 'block' }} />
                              ) : (
                                <div className="w-full flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: 80 }}>
                                  <div className="text-center text-gray-400"><div className="text-2xl">{PRODUCT_TYPE_GROUPS.find(g => g.id === getProductType())?.icon}</div><p className="text-[9px] capitalize">{view}</p></div>
                                </div>
                              )}
                              <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold whitespace-nowrap ${isActive ? 'bg-blue-500' : 'bg-black/60'}`}>{view}</div>
                              {cnt > 0 && <div className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cnt}</div>}
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-400 text-center mt-1 capitalize">{pair.join(' / ')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <ProductSpecsCard product={selectedProduct} selectedPrintingMethod={selectedPrintingMethod} onLearnMore={() => setShowSpecsModal(true)} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden flex-shrink-0 fixed bottom-0 left-0 right-0 z-50" style={{ height: 60, background: 'rgba(0, 0, 0, 0.92)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          {mobileNavItems.map(item => {
            const tabId = item.id as SidebarTab; const isActive = mobileSheetTab === tabId;
            return <MobileBottomNavItem key={item.id} label={item.label} imageIcon={item.imageIcon} active={isActive} onClick={() => setMobileSheetTab(prev => prev === tabId ? null : tabId)} />;
          })}
        </div>
      </div>

      {/* Mobile Sheet Panels */}
      {sidebarIcons.map(tab => (
        <MobileSheetPanel key={tab.id} open={mobileSheetTab === tab.id} title={titles[tab.id]} onClose={closeMobileSheet}>
          {renderMobilePanelContent(tab.id)}
        </MobileSheetPanel>
      ))}

      {/* Mobile Views Sheet */}
      <MobileSheetPanel open={mobileViewsOpen} title="Switch View" onClose={() => setMobileViewsOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          {availableViews.map(v => {
            const imgSrc = selectedProduct.images[v];
            return (
              <button key={v} onClick={() => { setSelectedView(v); setMobileViewsOpen(false); }} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${selectedView === v ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                {imgSrc ? (
                  <img src={imgSrc} alt={v} className="w-full h-24 object-contain rounded-lg mb-2" />
                ) : (
                  <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-lg mb-2">
                    <div className="text-center text-gray-400"><div className="text-3xl">{PRODUCT_TYPE_GROUPS.find(g => g.id === getProductType())?.icon}</div><p className="text-xs capitalize">{v}</p></div>
                  </div>
                )}
                <div className="flex items-center gap-2"><span className={`text-sm font-semibold capitalize ${selectedView === v ? 'text-indigo-600' : 'text-gray-700'}`}>{v}</span>{selectedView === v && <span className="text-indigo-500 text-xs">✔</span>}</div>
                {elements.filter(el => el.view === v && el.visible !== false && (!el.productId || el.productId === selectedProduct.id)).length > 0 && <div className="text-xs text-indigo-500 mt-1">{elements.filter(el => el.view === v && el.visible !== false && (!el.productId || el.productId === selectedProduct.id)).length} element(s)</div>}
              </button>
            );
          })}
        </div>
      </MobileSheetPanel>

      {/* Mobile Sidebar (Hamburger) */}
      <MobileSidebarPanel open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
          <div><h2 className="text-white font-bold text-lg">Product Studio</h2><p className="text-blue-100 text-xs">Customize your product</p></div>
          <button onClick={() => setMobileSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20"><X size={18} className="text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Product</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl border-2 flex-shrink-0 ${selectedProduct.previewColor} ${selectedProduct.borderColor}`} />
              <div className="flex-1"><div className="font-semibold text-gray-800">{selectedProduct.name}</div><div className="text-xs text-gray-500">{productCategories.find(c => c.id === selectedProduct.categoryId)?.name}</div></div>
            </div>
            <button onClick={() => { setMobileSidebarOpen(false); setShowSpecsModal(true); }} className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition">
              <Info size={12} />Product Specs
            </button>
          </div>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {sidebarIcons.map(icon => (
                <button key={icon.id} onClick={() => { setMobileSidebarOpen(false); setMobileSheetTab(icon.id); }} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition group">
                  <img src={icon.imageIcon} alt={titles[icon.id]} className="w-6 h-6 object-contain opacity-70 group-hover:opacity-100 transition" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{titles[icon.id]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Actions</h3>
            <div className="space-y-2">
              <button onClick={() => { setShowSaveDialog(true); setMobileSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"><Save size={18} /><span className="text-sm font-medium">Save Design</span></button>
              <button onClick={() => { setIsSavedDesignsOpen(true); setMobileSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"><Layers size={18} /><span className="text-sm font-medium">My Designs</span></button>
              <button onClick={() => { setShowPrintArea(!showPrintArea); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${showPrintArea ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}><Crop size={18} /><span className="text-sm font-medium">{showPrintArea ? 'Hide' : 'Show'} Print Area</span></button>
              <button onClick={() => { if (confirm('Clear all elements from current view on this product?')) { const remaining = elements.filter(el => !(el.view === selectedView && (!el.productId || el.productId === selectedProduct.id))); setElements(remaining); pushHistory(remaining); } setMobileSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition"><Trash2 size={18} /><span className="text-sm font-medium">Clear Current View</span></button>
            </div>
          </div>
          {currentViewElements.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Elements ({currentViewElements.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentViewElements.map(el => (
                  <div key={el.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {el.type === 'text' && <Type size={14} className="text-blue-500 flex-shrink-0" />}
                      {el.type === 'emoji' && <Smile size={14} className="text-yellow-500 flex-shrink-0" />}
                      {el.type === 'number' && <Hash size={14} className="text-green-500 flex-shrink-0" />}
                      {(el.type === 'logo' || el.type === 'artwork') && <ImageIcon size={14} className="text-purple-500 flex-shrink-0" />}
                      <span className="text-sm text-gray-600 truncate">{el.content || el.type}</span>
                    </div>
                    <button onClick={() => { setEditingElement(el); setTempScale(el.scale); setTempRotation(el.rotation); setTempOpacity(el.opacity ?? 1); setIsEditModalOpen(true); setMobileSidebarOpen(false); }} className="text-xs text-blue-600 px-2 py-1 hover:bg-blue-50 rounded">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between text-xs text-gray-500"><span>Total: {elements.filter(el => !el.productId || el.productId === selectedProduct.id).length} elements</span><span className="capitalize">View: {selectedView}</span></div>
        </div>
      </MobileSidebarPanel>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} className="hidden" />

      {/* Edit Modal */}
      {isEditModalOpen && editingElement && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[1100] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
            <div className="border-b px-4 py-3 flex justify-between items-center flex-shrink-0"><h2 className="text-lg font-bold">Edit {editingElement.type.charAt(0).toUpperCase() + editingElement.type.slice(1)}</h2><button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><X size={16} /></button></div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {(editingElement.type === 'text' || editingElement.type === 'number') && (
                <>
                  <div><label className="text-sm font-medium">Content</label><input value={editingElement.content} onChange={e => updateElementProperty(editingElement.id, 'content', e.target.value)} className="w-full p-2 border rounded-lg mt-1" /></div>
                  <div><label className="text-sm font-medium">Color</label><input type="color" value={editingElement.color ?? '#000000'} onChange={e => updateElementProperty(editingElement.id, 'color', e.target.value)} className="w-full h-10 rounded mt-1 cursor-pointer" /></div>
                  <div><label className="text-sm font-medium">Font Size: {editingElement.fontSize}px</label><input type="range" min="12" max="120" value={editingElement.fontSize} onChange={e => updateElementProperty(editingElement.id, 'fontSize', +e.target.value)} className="w-full mt-1" /></div>
                  <div><label className="text-sm font-medium">Font</label><select value={editingElement.fontFamily} onChange={e => updateElementProperty(editingElement.id, 'fontFamily', e.target.value)} className="w-full p-2 border rounded-lg mt-1">{fontOptions.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}</select></div>
                  <div className="flex gap-2">
                    <button onClick={() => updateElementProperty(editingElement.id, 'isBold', !editingElement.isBold)} className={`flex-1 py-2 rounded ${editingElement.isBold ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><Bold size={16} className="inline mr-1" />Bold</button>
                    <button onClick={() => updateElementProperty(editingElement.id, 'isItalic', !editingElement.isItalic)} className={`flex-1 py-2 rounded ${editingElement.isItalic ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><Italic size={16} className="inline mr-1" />Italic</button>
                  </div>
                </>
              )}
              <div><label className="text-sm font-medium">Scale: {tempScale.toFixed(1)}x</label><input type="range" min="0.3" max={getMaxScaleForElement(editingElement, imgSize.width, imgSize.height, selectedProduct.id)} step="0.1" value={tempScale} onChange={e => { setTempScale(+e.target.value); updateElementProperty(editingElement.id, 'scale', +e.target.value); }} className="w-full mt-1" /></div>
              <div><label className="text-sm font-medium">Rotation: {tempRotation}°</label><input type="range" min="0" max="360" value={tempRotation} onChange={e => { setTempRotation(+e.target.value); updateElementProperty(editingElement.id, 'rotation', +e.target.value); }} className="w-full mt-1" /></div>
              <div><label className="text-sm font-medium">Opacity: {Math.round(tempOpacity * 100)}%</label><input type="range" min="0" max="1" step="0.01" value={tempOpacity} onChange={e => { setTempOpacity(+e.target.value); updateElementProperty(editingElement.id, 'opacity', +e.target.value); }} className="w-full mt-1" /></div>
              <div className="flex gap-2">
                <button onClick={() => toggleBlackWhite(editingElement.id)} className={`flex-1 py-2 rounded ${editingElement.isBlackWhite ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}><Filter size={16} className="inline mr-1" />B&W</button>
                <button onClick={() => bringToFront(editingElement.id)} className="flex-1 py-2 bg-indigo-600 text-white rounded">Front</button>
                <button onClick={() => { duplicateElement(editingElement.id); setIsEditModalOpen(false); }} className="flex-1 py-2 bg-yellow-600 text-white rounded"><Copy size={16} className="inline" /></button>
              </div>
              <button onClick={() => { removeElement(editingElement.id); setIsEditModalOpen(false); }} className="w-full py-2 bg-red-600 text-white rounded flex items-center justify-center gap-2"><Trash2 size={16} />Delete</button>
            </div>
            <div className="border-t p-4 flex-shrink-0"><button onClick={() => setIsEditModalOpen(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold">Done</button></div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[1100] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
            <div className="border-b p-4"><h2 className="text-lg font-bold">Save Your Design</h2></div>
            <div className="p-4">
              <input value={designName} onChange={e => setDesignName(e.target.value)} placeholder="Design name…" className="w-full p-3 border rounded-xl mb-4 text-base" autoFocus onKeyDown={e => e.key === 'Enter' && saveDesign()} />
              <div className="flex gap-2">
                <button onClick={() => setShowSaveDialog(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button onClick={saveDesign} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Designs Modal */}
      {isSavedDesignsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[1100] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
            <div className="border-b p-4 flex justify-between items-center flex-shrink-0"><h2 className="text-lg font-bold">My Saved Designs</h2><button onClick={() => setIsSavedDesignsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><X size={16} /></button></div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {savedDesigns.length === 0 ? <p className="text-center text-gray-500 py-8">No saved designs yet</p> : (
                <div className="space-y-2">
                  {savedDesigns.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 border rounded-xl">
                      <div><p className="font-medium">{d.name}</p><p className="text-xs text-gray-500">{d.date}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => loadDesign(d)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Load</button>
                        <button onClick={() => { const u = savedDesigns.filter(x => x.id !== d.id); setSavedDesigns(u); lsSet(LS_DESIGNS, u); }} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm">Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Specs Modal */}
      {showSpecsModal && <ProductSpecsModal product={selectedProduct} selectedPrintingMethod={selectedPrintingMethod} onClose={() => setShowSpecsModal(false)} />}

      <style jsx global>{`
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
        @media (max-width: 768px) { input, textarea, select { font-size: 16px !important; } }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .overscroll-contain { overscroll-behavior: contain; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}