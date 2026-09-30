'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  ArrowLeftRight, Package, Trophy, Shirt,
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

// ─── Art Design Categories ────────────────────────────────────────────────────
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
      { id: 'j1', name: 'Ferrari', src: '/our-designs/jersey/ferrari.jpg', year: 2026, tag: 'new' },
      { id: 'j2', name: 'Jersey Classic 02', src: '/our-designs/jersey/jersey-02.png', year: 2024, tag: 'latest' },
      { id: 'j3', name: 'Jersey Sport 03',   src: '/our-designs/jersey/jersey-03.png', year: 2023, tag: null },
      { id: 'j4', name: 'Jersey Pro 04',     src: '/our-designs/jersey/jersey-04.png', year: 2023, tag: null },
      { id: 'j5', name: 'Jersey Elite 05',   src: '/our-designs/jersey/jersey-05.png', year: 2022, tag: null },
      { id: 'j6', name: 'Jersey Team 06',    src: '/our-designs/jersey/jersey-06.png', year: 2024, tag: 'new' },
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
      { id: 't1', name: 'Tee Graphic 01',  src: '/our-designs/tshirt/tshirt-01.png', year: 2024, tag: 'latest' },
      { id: 't2', name: 'Tee Street 02',   src: '/our-designs/tshirt/tshirt-02.png', year: 2024, tag: 'new' },
      { id: 't3', name: 'Tee Minimal 03',  src: '/our-designs/tshirt/tshirt-03.png', year: 2023, tag: null },
      { id: 't4', name: 'Tee Bold 04',     src: '/our-designs/tshirt/tshirt-04.png', year: 2023, tag: null },
      { id: 't5', name: 'Tee Abstract 05', src: '/our-designs/tshirt/tshirt-05.png', year: 2022, tag: null },
      { id: 't6', name: 'Tee Retro 06',    src: '/our-designs/tshirt/tshirt-06.png', year: 2024, tag: 'new' },
    ],
  },
  {
    id: 'formal',
    label: 'Formal Shirt',
    icon: '👔',
    color: 'from-slate-500 to-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    activeBg: 'bg-slate-700',
    designs: [
      { id: 'f1', name: 'Formal Classic 01', src: '/our-designs/formal/formal-01.png', year: 2024, tag: 'latest' },
      { id: 'f2', name: 'Formal Business 02',src: '/our-designs/formal/formal-02.png', year: 2024, tag: 'new' },
      { id: 'f3', name: 'Formal Stripe 03',  src: '/our-designs/formal/formal-03.png', year: 2023, tag: null },
      { id: 'f4', name: 'Formal Solid 04',   src: '/our-designs/formal/formal-04.png', year: 2022, tag: null },
    ],
  },
  {
    id: 'hoodie',
    label: 'Hoodie',
    icon: '🧥',
    color: 'from-orange-500 to-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    activeBg: 'bg-orange-600',
    designs: [
      { id: 'h1', name: 'Hoodie Urban 01',  src: '/our-designs/hoodie/hoodie-01.png', year: 2024, tag: 'new' },
      { id: 'h2', name: 'Hoodie Cozy 02',   src: '/our-designs/hoodie/hoodie-02.png', year: 2024, tag: 'latest' },
      { id: 'h3', name: 'Hoodie Street 03', src: '/our-designs/hoodie/hoodie-03.png', year: 2023, tag: null },
    ],
  },
  {
    id: 'polo',
    label: 'Polo',
    icon: '🏌️',
    color: 'from-green-500 to-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    activeBg: 'bg-green-600',
    designs: [
      { id: 'p1', name: 'Polo Sport 01',   src: '/our-designs/polo/polo-01.png', year: 2024, tag: 'new' },
      { id: 'p2', name: 'Polo Classic 02', src: '/our-designs/polo/polo-02.png', year: 2023, tag: null },
      { id: 'p3', name: 'Polo Elite 03',   src: '/our-designs/polo/polo-03.png', year: 2024, tag: 'latest' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: '⚡',
    color: 'from-red-500 to-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    activeBg: 'bg-red-600',
    designs: [
      { id: 's1', name: 'Sports Pro 01',    src: '/our-designs/sports/sports-01.png', year: 2024, tag: 'latest' },
      { id: 's2', name: 'Sports Thunder 02',src: '/our-designs/sports/sports-02.png', year: 2024, tag: 'new' },
      { id: 's3', name: 'Sports Speed 03',  src: '/our-designs/sports/sports-03.png', year: 2023, tag: null },
      { id: 's4', name: 'Sports Team 04',   src: '/our-designs/sports/sports-04.png', year: 2022, tag: null },
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

// ─── Swap Product (Accessories / Sports Wear) Data ────────────────────────────
// Each `href` is the route to that product's own design-tool page/id. Update these
// to match your actual routes (e.g. a dynamic route like `/custom-tool/[productId]`,
// or a separate page per product line).
interface SwapOption { id: string; name: string; image: string; href: string; }

const swapMainCategories: { id: 'accessories' | 'sportswear' | 'apparels'; name: string; image: string; description: string }[] = [
  { id: 'accessories', name: 'Accessories', image: '/accessory.webp',       description: '' },
  { id: 'sportswear',  name: 'Sports Wear', image: '/e-sports-tshirt.png',  description: '' },
  { id: 'apparels',    name: 'Apparels',    image: '/multi-apparel.webp',   description: '' },
];
const accessorySwapOptions: SwapOption[] = [
  { id: 'drinkware', name: 'Drinkware', image: '/drinkwares.webp', href: '/custom-tool/drinkware' },
  { id: 'pin-badge', name: 'Pin Badge', image: '/pin-badges.webp', href: '/custom-tool/pin-badge' },
  { id: 'cap',       name: 'Cap',       image: '/custom-cap.webp',       href: '/custom-tool/cap'       },
  { id: 'tote-bag',  name: 'Tote Bag',  image: '/tote-bag-after.webp',  href: '/custom-tool/tote-bag'  },
  // { id: 'keychain',  name: 'Keychain',  image: '/swap-options/accessories/keychain.png',  href: '/custom-tool/keychain'  },
  // { id: 'sticker',   name: 'Sticker',   image: '/swap-options/accessories/sticker.png',   href: '/custom-tool/sticker'   },
];


const apparelsSwapOptions: SwapOption[] = [
  { id: 'round-neck',   name: 'Round Neck',   image: '/round-neck-blue.png',   href: '/customized-your-t-shirt?productId=round-neck-white&category=round-neck'   },
  { id: 'polo-neck',    name: 'Polo Neck',    image: '/single-polo-after.png',    href: '/customized-your-t-shirt?productId=polo-green-apple&category=polo-neck'    },
  //{ id: 'v-neck',       name: 'V Neck',       image: '/swap-options/apparels/v-neck.png',       href: '/custom-tool?category=v-neck'       },
  { id: 'full-sleeves', name: 'Full Sleeves', image: '/shirt-after.webp', href: '/custom-tool?category=full-sleeves' },
  //{ id: 'tank-top',     name: 'Tank Top',     image: '/swap-options/apparels/tank-top.png',     href: '/custom-tool?category=tank-top'     },
  { id: 'oversized',    name: 'Oversized',    image: '/purple-solid-oversize-tshirt-front21.webp',    href: '/customized-your-t-shirt?productId=oversized-beige&category=oversized'    },
  { id: 'hoodies',     name: 'Hoodies',     image: '/ice-blue-solid-zipper-hoodie-front2.webp',     href: '/custom-tool?category=crop-top'     },
  //{ id: 'sports-bra',   name: 'Sports Bra',   image: '/swap-options/apparels/sports-bra.png',   href: '/custom-tool?category=sports-bra'   },
];


const sportsWearSwapOptions: SwapOption[] = [
  { id: 'cricket',    name: 'Cricket',    image: '/cricket-india-jersey.webp',    href: '/custom-tool/cricket'    },
  { id: 'football',   name: 'Football',   image: '/football-playing.png',   href: '/custom-tool/football'   },
  { id: 'kabaddi',    name: 'Kabaddi',    image: '/kabaddi.png',    href: '/custom-tool/kabaddi'    },
  { id: 'esports',    name: 'E-Sports',   image: '/e-sports-tshirt.png',    href: '/custom-tool/esports'    },
  { id: 'basketball', name: 'Basketball', image: '/volley-ball.png', href: '/custom-tool/basketball' },
  { id: 'volleyball', name: 'Volleyball', image: '/volley-ball-playing-girl.png', href: '/custom-tool/volleyball' },
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

const gsmCategories = [
  { id: '180', label: '180 GSM', description: 'Lightweight & breathable', icon: '' },
  { id: '200', label: '200 GSM', description: 'Standard everyday wear', icon: '' },
  { id: '220', label: '220 GSM', description: 'Mid-weight comfort', icon: '' },
  { id: '240', label: '240 GSM', description: 'Heavy premium feel', icon: '' },
];

type ShirtView      = 'front' | 'back' | 'left' | 'right';
type SidebarTab     = 'upload' | 'text' | 'art' | 'product' | 'names' | 'categories';
type PrintingMethod = 'dtf' | 'dtg' | 'embroider' | 'uv' | 'waterbase';
type Gender         = 'male' | 'female';
type ArtFilter      = 'all' | 'latest' | 'new' | '2024' | '2023' | '2022';

interface UploadedImage { id: string; name: string; url: string; thumb: string; }
interface ProductCategory { id: string; name: string; icon: string; availableViews: ShirtView[]; description: string; gender: Gender[]; }
interface PrintingMethodType { id: PrintingMethod; name: string; icon: string; description: string; priceMultiplier: number; minOrder: number; }
interface ProductItem {
  id: string; name: string; categoryId: string;
  images: { front: string; back?: string; left?: string; right?: string };
  previewColor: string; borderColor: string; gsm?: number; material?: string;
  sizes?: string[]; colors?: { name: string; code: string }[];
  fit?: string; neckStyle?: string; sleeveType?: string; weight?: string; careInstructions?: string[]; features?: string[];
}
interface DesignElement { id: string; type: 'text' | 'logo' | 'emoji' | 'number' | 'artwork'; content: string; x: number; y: number; scale: number; rotation: number; view: ShirtView; productId: string; fontSize?: number; color?: string; imageUrl?: string; isBlackWhite?: boolean; opacity?: number; zIndex?: number; locked?: boolean; visible?: boolean; isBold?: boolean; isItalic?: boolean; fontFamily?: string; textAlign?: 'left' | 'center' | 'right'; width?: number; height?: number; }
interface SavedDesign { id: string; name: string; date: string; elements: DesignElement[]; productId: string; categoryId: string; printingMethod?: PrintingMethod; thumbnail: string; }

const printingMethods: PrintingMethodType[] = [
  { id: 'dtf',       name: 'DTF Printing',     icon: '/cluesstyle-icons/dtf-icon.png',        description: 'Direct to Film',      priceMultiplier: 1.0, minOrder: 1  },
  { id: 'dtg',       name: 'DTG Printing',     icon: '/cluesstyle-icons/dtg-icon.png',        description: 'Direct to Garment',   priceMultiplier: 1.2, minOrder: 1  },
  { id: 'embroider', name: 'Embroidery',       icon: '/cluesstyle-icons/embroidery-icon.png', description: 'Thread embroidery',   priceMultiplier: 2.0, minOrder: 10 },
  { id: 'uv',        name: 'UV Printing',      icon: '/cluesstyle-icons/uv-icon.png',         description: 'UV DTF – Vibrant',    priceMultiplier: 1.5, minOrder: 5  },
  { id: 'waterbase', name: 'Waterbase Screen', icon: '/cluesstyle-icons/waterbase-icon.png',  description: 'Eco-friendly screen', priceMultiplier: 1.8, minOrder: 50 },
];

const productCategories: ProductCategory[] = [
  { id: 'round-neck',   name: 'Round Neck',        icon: '/new-icons/round-neck-t-shirt.png',   availableViews: ['front','back','left','right'], description: 'Classic round neck',     gender: ['male','female'] },
  { id: 'polo-neck',    name: 'Polo Neck',         icon: '/new-icons/polo-neck-t-shirt.png',    availableViews: ['front','back','left','right'], description: 'Collar polo',            gender: ['male']          },
  { id: 'v-neck',       name: 'V Neck',            icon: '/new-icons/v-neck-t-shirt.png',       availableViews: ['front','back','left','right'], description: 'V neck tee',             gender: ['male','female'] },
  { id: 'full-sleeves', name: 'Full Sleeves',      icon: '/new-icons/full-sleeves-t-shirt.png', availableViews: ['front','back','left','right'], description: 'Long sleeve tee',        gender: ['male']          },
  { id: 'tank-top',     name: 'Tank Top',          icon: '/new-icons/tank-top-t-shirt.png',     availableViews: ['front','back','left','right'], description: 'Tank top',               gender: ['male','female'] },
  { id: 'oversized',    name: 'Oversized T-shirt', icon: '/new-icons/oversized-t-shirt.png',    availableViews: ['front','back','left','right'], description: 'China neck collar',      gender: ['male']          },
  { id: 'crop-top',     name: 'Crop Top',          icon: '/new-icons/round-neck-t-shirt.png',   availableViews: ['front','back','left','right'], description: 'Cropped fit top',        gender: ['female']        },
  { id: 'sports-bra',   name: 'Sports Bra',        icon: '/new-icons/tank-top-t-shirt.png',     availableViews: ['front','back'],               description: 'Performance sports bra', gender: ['female']        },
];

const productSets: ProductItem[] = [
  // { id: 'polo-navy',            name: 'Navy Blue',    categoryId: 'round-neck',   images: { front: '/t-shirts/turquoise-blue/front-facing.png', back: '/t-shirts/turquoise-blue/back-facing.png', left: '/t-shirts/turquoise-blue/left-facing.png', right: '/t-shirts/turquoise-blue/right-facing.png' }, previewColor: 'bg-blue-900',    borderColor: 'border-blue-800', gsm: 200, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low','Iron on low heat'], features: ['Pre-shrunk fabric','Reinforced stitching','Tagless neck label','Double-needle hem'] },
 // { id: 'polo-black',           name: 'Black Polo',   categoryId: 'polo-neck',    images: { front: '/t-shirts/polo-black-front.png', back: '/t-shirts/polo-black-back.png', left: '/t-shirts/polo-black-left.png', right: '/t-shirts/polo-black-right.png' }, previewColor: 'bg-gray-900',    borderColor: 'border-gray-800', gsm: 200, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
 // { id: 'oversized-white',      name: 'White',        categoryId: 'polo-neck',    images: { front: '/t-shirts/oversized-white-front.png', back: '/t-shirts/oversized-white-back.png', left: '/t-shirts/oversized-white-left.png', right: '/t-shirts/oversized-white-right.png' }, previewColor: 'bg-white',       borderColor: 'border-gray-300', gsm: 240, material: '100% Cotton',       sizes: ['S','M','L','XL'], fit: 'Oversized', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '240g', careInstructions: ['Machine wash cold','Wash with like colors','Tumble dry low'], features: ['100% ring-spun cotton','Soft-washed finish','Drop shoulders'] },
  { id: 'oversized-gray',       name: 'Gray',         categoryId: 'v-neck',       images: { front: '/t-shirts/oversized-gray-front.png', back: '/t-shirts/oversized-gray-back.png', left: '/t-shirts/oversized-gray-left.png', right: '/t-shirts/oversized-gray-right.png' }, previewColor: 'bg-gray-500',    borderColor: 'border-gray-400', gsm: 240, material: '100% Cotton',       sizes: ['S','M','L','XL'], fit: 'Regular Fit', neckStyle: 'V Neck', sleeveType: 'Half Sleeve', weight: '240g', careInstructions: ['Machine wash cold','Do not bleach','Air dry preferred'], features: ['V-neck construction','Pre-shrunk','Lightweight & breathable'] },
  { id: 'fullsleeve-navy',      name: 'Navy',         categoryId: 'full-sleeves', images: { front: '/t-shirts/fullsleeve-navy-front.png', back: '/t-shirts/fullsleeve-navy-back.png', left: '/t-shirts/fullsleeve-navy-left.png', right: '/t-shirts/fullsleeve-navy-right.png' }, previewColor: 'bg-blue-800',    borderColor: 'border-blue-700', gsm: 220, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Round Neck', sleeveType: 'Full Sleeve', weight: '220g', careInstructions: ['Machine wash warm','Do not bleach','Tumble dry medium'], features: ['Ribbed cuffs','Extended sleeve length','Anti-shrink treatment'] },
 // { id: 'formal-white',         name: 'White',        categoryId: 'round-neck',   images: { front: '/t-shirts/formal-white-front.png', back: '/t-shirts/formal-white-back.png', left: '/t-shirts/formal-white-left.png', right: '/t-shirts/formal-white-right.png' }, previewColor: 'bg-white',       borderColor: 'border-gray-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Slim Fit', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold','Wash separately first','Iron while damp'], features: ['Slim silhouette','Soft hand feel','Moisture-wicking'] },
  { id: 'oversized-black',      name: 'Black',        categoryId: 'oversized',    images: { front: '/t-shirts/oversized-t-shirt/black/front-facing.webp', back: '/t-shirts/oversized-t-shirt/black/back-facing.webp', left: '/t-shirts/oversized-t-shirt/black/left-facing.webp', right: '/t-shirts/oversized-t-shirt/black/right-facing.webp' }, previewColor: 'bg-black',       borderColor: 'border-gray-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold','Turn inside out','Do not bleach'], features: ['Drop shoulder design','Boxy silhouette','Unisex fit'] },
  { id: 'oversized-beige',      name: 'Beige',        categoryId: 'oversized',    images: { front: '/t-shirts/oversized-t-shirt/beige/front-facing.webp', back: '/t-shirts/oversized-t-shirt/beige/back-facing.webp', left: '/t-shirts/oversized-t-shirt/beige/left-facing.webp', right: '/t-shirts/oversized-t-shirt/beige/right-facing.webp' }, previewColor: 'bg-[#dfcdbe]',   borderColor: 'border-[#dfcdbe]',gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold','Wash with similar colors'], features: ['Neutral tone','Versatile everyday wear'] },
  { id: 'oversized-carbon-grey',name: 'Carbon Grey',  categoryId: 'oversized',    images: { front: '/t-shirts/oversized-t-shirt/carbon-grey/front-facing.webp', back: '/t-shirts/oversized-t-shirt/carbon-grey/back-facing.webp', left: '/t-shirts/oversized-t-shirt/carbon-grey/left-facing.webp', right: '/t-shirts/oversized-t-shirt/carbon-grey/right-facing.webp' }, previewColor: 'bg-[#3f3f3e]',   borderColor: 'border-gray-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold','Turn inside out'], features: ['Carbon-dyed fabric','Rich deep tone'] },
  { id: 'oversized-ice-blue',   name: 'ICE Blue',     categoryId: 'oversized',    images: { front: '/t-shirts/oversized-t-shirt/ice-blue/front-facing.webp', back: '/t-shirts/oversized-t-shirt/ice-blue/back-facing.webp', left: '/t-shirts/oversized-t-shirt/ice-blue/left-facing.webp', right: '/t-shirts/oversized-t-shirt/ice-blue/right-facing.webp' }, previewColor: 'bg-[#b3e0f8]',   borderColor: 'border-gray-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold'], features: ['Ice-wash finish','Cool pastel tone'] },
  { id: 'oversized-lavender',   name: 'Lavender',     categoryId: 'oversized',    images: { front: '/t-shirts/oversized-t-shirt/lavender/front-facing.webp', back: '/t-shirts/oversized-t-shirt/lavender/back-facing.webp', left: '/t-shirts/oversized-t-shirt/lavender/left-facing.webp', right: '/t-shirts/oversized-t-shirt/lavender/right-facing.webp' }, previewColor: 'bg-[#c1a6eb]',   borderColor: 'border-gray-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold','Wash with light colors'], features: ['Soft lavender pigment','Trendy pastel collection'] },
  { id: 'oversized-navy-blue',  name: 'Navy Blue',    categoryId: 'oversized',    images: { front: '/t-shirts/oversized-t-shirt/navy-blue/front-facing.webp', back: '/t-shirts/oversized-t-shirt/navy-blue/back-facing.webp', left: '/t-shirts/oversized-t-shirt/navy-blue/left-facing.webp', right: '/t-shirts/oversized-t-shirt/navy-blue/right-facing.webp' }, previewColor: 'bg-[#0c1939]',   borderColor: 'border-gray-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold','Turn inside out'], features: ['Deep navy tone','Classic streetwear staple'] },
  { id: 'oversized-red',        name: 'Red',          categoryId: 'oversized',    images: { front: '/t-shirts/oversized-t-shirt/red/front-facing.webp', back: '/t-shirts/oversized-t-shirt/red/back-facing.webp', left: '/t-shirts/oversized-t-shirt/red/left-facing.webp', right: '/t-shirts/oversized-t-shirt/red/right-facing.webp' }, previewColor: 'bg-[#e4011b]',   borderColor: 'border-gray-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold','Wash with dark colors'], features: ['Bold red pigment','Statement piece'] },
  { id: 'oversized-white-off',  name: 'White',        categoryId: 'oversized',    images: { front: '/t-shirts/oversized-t-shirt/white/front-facing.webp', back: '/t-shirts/oversized-t-shirt/white/back-facing.webp', left: '/t-shirts/oversized-t-shirt/white/left-facing.webp', right: '/t-shirts/oversized-t-shirt/white/right-facing.webp' }, previewColor: 'bg-white',       borderColor: 'border-gray-300', gsm: 200, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '180g', careInstructions: ['Machine wash cold','Wash separately first time'], features: ['Clean off-white tone','Versatile base for prints'] },
    //round-neck-tshirt
  { id: 'round-neck-white',  name: 'White Round Neck',        categoryId: 'round-neck',    images: { front: '/solid-round-neck/white/white-round-neck-tshirt-front.webp', back: '/solid-round-neck/white/white-round-neck-tshirt-back.webp', left: '/solid-round-neck/white/white-round-neck-tshirt-left.webp', right: '/solid-round-neck/white/white-round-neck-tshirt-right.webp' }, previewColor: 'bg-white',       borderColor: 'border-gray-300', gsm: 200, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '300g', careInstructions: ['Machine wash cold','Wash separately first time'], features: ['Clean off-white tone','Versatile base for prints'] },
  { id: 'round-neck-royal-blue',  name: 'Royal Blue Round Neck',        categoryId: 'round-neck',    images: { front: '/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-front.webp', back: '/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-back.webp', left: '/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-left.webp', right: '/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-right.webp' }, previewColor: 'bg-[#0023FF]',       borderColor: 'border-blue-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '300g', careInstructions: ['Machine wash cold','Wash separately first time'], features: ['Clean off-white tone','Versatile base for prints'] },
  { id: 'round-neck-red',  name: 'Red Round Neck',        categoryId: 'round-neck',    images: { front: '/solid-round-neck/red/red-round-neck-tshirt-front.webp', back: '/solid-round-neck/red/red-round-neck-tshirt-back.webp', left: '/solid-round-neck/red/red-round-neck-tshirt-left.webp', right: '/solid-round-neck/red/red-round-neck-tshirt-right.webp' }, previewColor: 'bg-[#FF1500]',       borderColor: 'border-red-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '300g', careInstructions: ['Machine wash cold','Wash separately first time'], features: ['Clean off-white tone','Versatile base for prints'] },
  { id: 'round-neck-navy-blue',  name: 'Navy Blue Round Neck',        categoryId: 'round-neck',    images: { front: '/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-front.webp', back: '/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-back.webp', left: '/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-left.webp', right: '/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-right.webp' }, previewColor: 'bg-[#1a2238]',       borderColor: 'border-blue-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '300g', careInstructions: ['Machine wash cold','Wash separately first time'], features: ['Clean off-white tone','Versatile base for prints'] },
  { id: 'round-neck-miletry-green',  name: 'Military Green Round Neck',        categoryId: 'round-neck',    images: { front: '/solid-round-neck/miletry green/military-green-round-neck-tshirt-front.webp', back: '/solid-round-neck/miletry green/military-green-round-neck-tshirt-back.webp', left: '/solid-round-neck/miletry green/military-green-round-neck-tshirt-left.webp', right: '/solid-round-neck/miletry green/military-green-round-neck-tshirt-right.webp' }, previewColor: 'bg-[#394332]',       borderColor: 'border-blue-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '300g', careInstructions: ['Machine wash cold','Wash separately first time'], features: ['Clean off-white tone','Versatile base for prints'] },
  { id: 'round-neck-black',  name: 'Black Round Neck',        categoryId: 'round-neck',    images: { front: '/solid-round-neck/black/black-round-neck-tshirt-front.webp', back: '/solid-round-neck/black/black-round-neck-tshirt-back.webp', left: '/solid-round-neck/black/black-round-neck-tshirt-left.webp', right: '/solid-round-neck/black/black-round-neck-tshirt-right.webp' }, previewColor: 'bg-[#000]',       borderColor: 'border-blue-300', gsm: 180, material: 'Cotton Blend',      sizes: ['S','M','L','XL','XXL'], fit: 'Oversized', neckStyle: 'Round Neck', sleeveType: 'Half Sleeve', weight: '300g', careInstructions: ['Machine wash cold','Wash separately first time'], features: ['Clean off-white tone','Versatile base for prints'] },

  //polo t-shirts

    { id: 'polo-green-apple',           name: 'Green Apple Polo',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-green-400',    borderColor: 'border-green-400', gsm: 200, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-beigh-black',           name: 'Beige with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-left-side.webp', right: '/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-right-side.webp' }, previewColor: 'bg-[#F5F5DC]',    borderColor: 'border-[#000]', gsm: 200, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-black-malenge',           name: 'Black Malenge with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#BDBBB6]',    borderColor: 'border-[#000]', gsm: 200, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-black-red',           name: 'Black with Red',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-right.webp' }, previewColor: 'bg-[#000]',    borderColor: 'border-[#000]', gsm: 200, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-black-with-royal-blue',           name: 'Black with Royal Blue',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-right.webp' }, previewColor: 'bg-[#000]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-black-with-white',           name: 'Black with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#000]',    borderColor: 'border-[#000080]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-cream-with-black',           name: 'Cream with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-black.webp', left: '/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-right.webp' }, previewColor: 'bg-[#FFFDD0]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-dark-denim-with-white',           name: 'Dark Denim with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#00334F]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-denim-with-white',           name: 'Denim with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#1560BD]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-electric-blue-with-white',           name: 'Electric Blue with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#5879F7]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-forest-green-with-white',           name: 'Forest Green with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#0E390E]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-grey with black',           name: 'Grey with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-right.webp' }, previewColor: 'bg-[#808080]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-light-denim-with-white',           name: 'Grey with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#778FA8]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-magenta-with-white',           name: 'Magenta with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#FF00FF]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-maroon-with-white',           name: 'Maroon with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-lefT.webp', right: '/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#800000]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-militry-green',           name: 'Military Green',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#6B8E23]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-navy-blue-with-white',           name: 'Navy Blue with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#0000FF]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-ocean-blue-with-black',           name: 'Ocean Blue with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-right.webp' }, previewColor: 'bg-[#B8B8FF]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-red-with-black',           name: 'Red with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-right.webp' }, previewColor: 'bg-[#FF0000]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-red-with-white',           name: 'Red with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#FF0000]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-royal-blue-with-white',           name: 'Royal Blue with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#000080]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-sky-blue-with-black',           name: 'Sky Blue with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-right.webp' }, previewColor: 'bg-[#5C5CFF]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-tangerine-with-white',           name: 'Tangerine with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#F28500]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-turquoise-blue-with-white',           name: 'Turquoise with White',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-black.webp', left: '/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-right.webp' }, previewColor: 'bg-[#40E0D0]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-white-melange-with-black',           name: 'White Melange with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-right.webp' }, previewColor: 'bg-[#ffffff]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-white-with-black',           name: 'White with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/white-melange-with-black/white-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/white-melange-with-black/white-tipping-black-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/white-melange-with-black/white-tipping-black-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/white-melange-with-black/white-tipping-black-collar-tshirt-right.webp' }, previewColor: 'bg-[#ffffff]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-white-with-blue',           name: 'White with Blue',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-right.webp' }, previewColor: 'bg-[#ffffff]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-white-with-red',           name: 'White with Red',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-right.webp' }, previewColor: 'bg-[#ffffff]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },
    { id: 'polo-yellow-with-black',           name: 'Yellow with Black',   categoryId: 'polo-neck',    images: { front: '/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-front.webp', back: '/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-back.webp', left: '/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-left.webp', right: '/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-right.webp' }, previewColor: 'bg-[#FFEA00]',    borderColor: 'border-[#000]', gsm: 180, material: 'Cotton Poly Blend', sizes: ['S','M','L','XL','XXL'], fit: 'Regular Fit', neckStyle: 'Polo Collar', sleeveType: 'Half Sleeve', weight: '200g', careInstructions: ['Machine wash cold','Do not bleach','Tumble dry low'], features: ['2-button placket','Ribbed collar and cuffs','Side vents'] },


  ];

const viewPairs: [ShirtView, ShirtView][] = [['front','back'],['left','right']];
const ALL_VIEWS: ShirtView[] = ['front', 'back', 'left', 'right'];

const LS_ELEMENTS = 'cst-elements-v3';
const LS_PRODUCT  = 'cst-product-v2';
const LS_CATEGORY = 'cst-category-v2';
const LS_GENDER   = 'cst-gender-v2';
const LS_PRINTING = 'cst-printing-v2';
const LS_VIEW     = 'cst-view-v2';
const LS_DESIGNS  = 'product-designs-customized-tool';

const lsGet = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } };
const lsSet = (key: string, val: unknown) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const getPrintAreaForProduct = (productId: string, view: ShirtView) => {
  const product  = productSets.find(p => p.id === productId);
  const category = product?.categoryId ?? 'round-neck';
  type A = Record<ShirtView, { xMin:number;xMax:number;yMin:number;yMax:number }>;
  const areas: Record<string, A> = {
    'round-neck':   { front:{xMin:25,xMax:75,yMin:18,yMax:78}, back:{xMin:25,xMax:75,yMin:18,yMax:78}, left:{xMin:30,xMax:70,yMin:20,yMax:42}, right:{xMin:30,xMax:70,yMin:20,yMax:42} },
    'polo-neck':    { front:{xMin:25,xMax:75,yMin:22,yMax:78}, back:{xMin:25,xMax:75,yMin:22,yMax:78}, left:{xMin:32,xMax:68,yMin:18,yMax:40}, right:{xMin:32,xMax:68,yMin:18,yMax:40} },
    'v-neck':       { front:{xMin:22,xMax:78,yMin:22,yMax:82}, back:{xMin:22,xMax:78,yMin:22,yMax:82}, left:{xMin:32,xMax:68,yMin:18,yMax:44}, right:{xMin:32,xMax:68,yMin:18,yMax:44} },
    'full-sleeves': { front:{xMin:25,xMax:75,yMin:20,yMax:78}, back:{xMin:25,xMax:75,yMin:20,yMax:78}, left:{xMin:38,xMax:62,yMin:18,yMax:40}, right:{xMin:38,xMax:62,yMin:18,yMax:40} },
    'tank-top':     { front:{xMin:22,xMax:78,yMin:15,yMax:82}, back:{xMin:22,xMax:78,yMin:15,yMax:82}, left:{xMin:35,xMax:65,yMin:12,yMax:40}, right:{xMin:35,xMax:65,yMin:12,yMax:40} },
    'crop-top':     { front:{xMin:22,xMax:78,yMin:18,yMax:78}, back:{xMin:22,xMax:78,yMin:18,yMax:78}, left:{xMin:32,xMax:68,yMin:14,yMax:46}, right:{xMin:32,xMax:68,yMin:14,yMax:46} },
    'sports-bra':   { front:{xMin:28,xMax:72,yMin:22,yMax:78}, back:{xMin:28,xMax:72,yMin:22,yMax:78}, left:{xMin:35,xMax:65,yMin:18,yMax:46}, right:{xMin:35,xMax:65,yMin:18,yMax:46} },
    'oversized':    { front:{xMin:20,xMax:75,yMin:34,yMax:85}, back:{xMin:25,xMax:75,yMin:34,yMax:85}, left:{xMin:42,xMax:65,yMin:35,yMax:55}, right:{xMin:33,xMax:56,yMin:35,yMax:56} },
  };
  return (areas[category] ?? areas['round-neck'])[view] ?? areas['round-neck'].front;
};

const measureTextWidth = (content: string, fontSize: number, fontFamily: string, isBold: boolean, isItalic: boolean): number => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    const weight = isBold ? 'bold' : 'normal';
    const style  = isItalic ? 'italic' : 'normal';
    ctx.font = `${style} ${weight} ${fontSize}px ${fontFamily}`;
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

// ─── Embroidery Effect Helpers ─────────────────────────────────────────────────
// Simulates a stitched-thread look purely with CSS (no server-side rendering),
// used whenever the active printing method is 'embroider'. Text gets a layered
// thread-color outline + highlight/shadow pass; images/logos get a contrast
// boost plus a cross-hatch "stitch" texture blended on top.
const shadeHexColor = (hex: string, percent: number): string => {
  try {
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(c)) return hex;
    const num = parseInt(c, 16);
    let r = (num >> 16) + Math.round(2.55 * percent);
    let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
    let b = (num & 0x0000ff) + Math.round(2.55 * percent);
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return hex;
  }
};

const getEmbroideryTextShadow = (color?: string): string => {
  const base = color ?? '#000000';
  const dark = shadeHexColor(base, -42);
  const light = shadeHexColor(base, 42);
  return [
    `1px 0 0 ${dark}`, `-1px 0 0 ${dark}`, `0 1px 0 ${dark}`, `0 -1px 0 ${dark}`,
    `1px 1px 0 ${dark}`, `-1px -1px 0 ${dark}`, `1px -1px 0 ${dark}`, `-1px 1px 0 ${dark}`,
    `0 -1px 0 ${light}`, `0 2px 1px rgba(0,0,0,0.35)`,
  ].join(', ');
};

const getEmbroideryTextStyle = (color?: string): React.CSSProperties => ({
  textShadow: getEmbroideryTextShadow(color),
  WebkitTextStroke: `0.6px ${shadeHexColor(color ?? '#000000', -55)}`,
  letterSpacing: '0.5px',
  fontWeight: 'bold',
  fontStyle: 'normal',
});

const EMBROIDERY_STITCH_OVERLAY: React.CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  mixBlendMode: 'overlay', opacity: 0.55,
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 1px, transparent 1px, transparent 3px), ' +
    'repeating-linear-gradient(-45deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)',
};

const EMBROIDERY_IMAGE_FILTER =
  'contrast(1.35) saturate(1.3) drop-shadow(1px 1px 0 rgba(0,0,0,0.45)) drop-shadow(-1px -1px 0 rgba(255,255,255,0.35)) drop-shadow(0 0 0.5px rgba(0,0,0,0.6))';

// ─── Realistic embroidery renderer (canvas-based stitch simulation) ───────────
// This mirrors the actual technique real digitizing/preview engines use — not a
// CSS filter trick:
//   1. Render the shape (text glyphs, or the image's own alpha) to get a silhouette.
//   2. Fill that silhouette with a dense field of parallel "thread" stitches, each
//      given a light → base → highlight → dark gradient across its width — this is
//      what makes individual stitches catch light differently, the way real thread does.
//   3. Composite a soft offset shadow + a rim highlight underneath/behind the fill
//      so it reads as raised off the fabric rather than flat-printed.
// It's an approximation built on the same principles, not a copy of any vendor's
// proprietary algorithm — there's no way to guarantee pixel-identical output to a
// closed, patented renderer we don't have access to.
function buildEmbroideryCanvas({
  width, height, color, drawMask, stitchAngleDeg = 45, stitchSpacing = 2.6, scaleFactor = 2,
}: {
  width: number; height: number; color: string;
  drawMask: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  stitchAngleDeg?: number; stitchSpacing?: number; scaleFactor?: number;
}): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || width <= 0 || height <= 0) return null;
  const W = Math.max(1, Math.round(width * scaleFactor));
  const H = Math.max(1, Math.round(height * scaleFactor));

  // 1) silhouette mask (black shape on transparent)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W; maskCanvas.height = H;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return null;
  maskCtx.save();
  maskCtx.scale(scaleFactor, scaleFactor);
  drawMask(maskCtx, width, height);
  maskCtx.restore();

  // light-colored version of the same silhouette, used for the rim highlight pass
  const highlightMaskCanvas = document.createElement('canvas');
  highlightMaskCanvas.width = W; highlightMaskCanvas.height = H;
  const hCtx = highlightMaskCanvas.getContext('2d');
  if (!hCtx) return null;
  hCtx.drawImage(maskCanvas, 0, 0);
  hCtx.globalCompositeOperation = 'source-in';
  hCtx.fillStyle = 'rgba(255,255,255,0.95)';
  hCtx.fillRect(0, 0, W, H);

  // 2) dense field of individually-shaded parallel thread stitches
  const texCanvas = document.createElement('canvas');
  texCanvas.width = W; texCanvas.height = H;
  const texCtx = texCanvas.getContext('2d');
  if (!texCtx) return null;

  const dark = shadeHexColor(color, -45);
  const light = shadeHexColor(color, 48);
  const angle = (stitchAngleDeg * Math.PI) / 180;
  const spacing = stitchSpacing * scaleFactor;
  const diag = Math.sqrt(W * W + H * H);

  texCtx.save();
  texCtx.translate(W / 2, H / 2);
  texCtx.rotate(angle);
  for (let y = -diag; y <= diag; y += spacing) {
    const grad = texCtx.createLinearGradient(0, y - spacing / 2, 0, y + spacing / 2);
    grad.addColorStop(0, dark);
    grad.addColorStop(0.45, color);
    grad.addColorStop(0.8, light);
    grad.addColorStop(1, dark);
    texCtx.fillStyle = grad;
    texCtx.fillRect(-diag, y - spacing / 2, diag * 2, spacing);
  }
  texCtx.restore();

  // clip the thread field to the silhouette
  texCtx.globalCompositeOperation = 'destination-in';
  texCtx.drawImage(maskCanvas, 0, 0);
  texCtx.globalCompositeOperation = 'source-over';

  // 3) composite: soft raised shadow, rim highlight, then the stitched fill on top
  const outCanvas = document.createElement('canvas');
  outCanvas.width = W; outCanvas.height = H;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return null;

  outCtx.save();
  outCtx.globalAlpha = 0.35;
  outCtx.filter = `blur(${Math.max(1, scaleFactor)}px)`;
  outCtx.drawImage(maskCanvas, scaleFactor, scaleFactor * 1.4);
  outCtx.restore();

  outCtx.save();
  outCtx.globalAlpha = 0.4;
  outCtx.filter = `blur(${Math.max(0.5, scaleFactor * 0.6)}px)`;
  outCtx.drawImage(highlightMaskCanvas, -scaleFactor * 0.6, -scaleFactor * 0.6);
  outCtx.restore();

  outCtx.drawImage(texCanvas, 0, 0);

  return outCanvas;
}

// Same idea as buildEmbroideryCanvas, but for uploaded logos/artwork: keeps the
// image's own colors (real embroidery digitizes each color region into its own
// thread color — we approximate that by preserving the source palette) and blends
// the stitch-direction light/dark banding on top via 'overlay' so it modulates
// whatever's underneath instead of flattening it to one thread color.
function buildEmbroideryImageCanvas({
  img, width, height, stitchAngleDeg = 45, stitchSpacing = 2.6, scaleFactor = 2,
}: {
  img: HTMLImageElement; width: number; height: number;
  stitchAngleDeg?: number; stitchSpacing?: number; scaleFactor?: number;
}): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || width <= 0 || height <= 0 || !img.width || !img.height) return null;
  const W = Math.max(1, Math.round(width * scaleFactor));
  const H = Math.max(1, Math.round(height * scaleFactor));

  // image letterboxed into the box (object-fit: contain)
  const imgCanvas = document.createElement('canvas');
  imgCanvas.width = W; imgCanvas.height = H;
  const imgCtx = imgCanvas.getContext('2d');
  if (!imgCtx) return null;
  const ratio = Math.min(W / img.width, H / img.height);
  const dw = img.width * ratio, dh = img.height * ratio;
  imgCtx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);

  // neutral thread-direction banding, masked to the image's own alpha
  const bandCanvas = document.createElement('canvas');
  bandCanvas.width = W; bandCanvas.height = H;
  const bandCtx = bandCanvas.getContext('2d');
  if (!bandCtx) return null;
  const angle = (stitchAngleDeg * Math.PI) / 180;
  const spacing = stitchSpacing * scaleFactor;
  const diag = Math.sqrt(W * W + H * H);
  bandCtx.save();
  bandCtx.translate(W / 2, H / 2);
  bandCtx.rotate(angle);
  for (let y = -diag; y <= diag; y += spacing) {
    const grad = bandCtx.createLinearGradient(0, y - spacing / 2, 0, y + spacing / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.32)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0.05)');
    grad.addColorStop(0.8, 'rgba(255,255,255,0.38)');
    grad.addColorStop(1, 'rgba(0,0,0,0.32)');
    bandCtx.fillStyle = grad;
    bandCtx.fillRect(-diag, y - spacing / 2, diag * 2, spacing);
  }
  bandCtx.restore();
  bandCtx.globalCompositeOperation = 'destination-in';
  bandCtx.drawImage(imgCanvas, 0, 0);
  bandCtx.globalCompositeOperation = 'source-over';

  const outCanvas = document.createElement('canvas');
  outCanvas.width = W; outCanvas.height = H;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return null;

  // soft raised shadow beneath
  outCtx.save();
  outCtx.globalAlpha = 0.4;
  outCtx.filter = `blur(${Math.max(1, scaleFactor)}px)`;
  outCtx.drawImage(imgCanvas, scaleFactor, scaleFactor * 1.4);
  outCtx.restore();

  // base artwork, own colors, slight contrast/saturation lift
  outCtx.save();
  outCtx.filter = 'saturate(1.15) contrast(1.08)';
  outCtx.drawImage(imgCanvas, 0, 0);
  outCtx.restore();

  // stitch-direction banding blended on top
  outCtx.save();
  outCtx.globalCompositeOperation = 'overlay';
  outCtx.drawImage(bandCanvas, 0, 0);
  outCtx.restore();

  return outCanvas;
}

// Renders either a text/number element or a logo/artwork image through the
// stitch-simulation pipeline above, into a real <canvas> in the DOM.
function EmbroideryCanvas({
  mode, content, fontSize, fontFamily, color, width, height, imageSrc, stitchAngleDeg,
}: {
  mode: 'text' | 'image';
  content?: string; fontSize?: number; fontFamily?: string; color?: string;
  width: number; height: number; imageSrc?: string; stitchAngleDeg?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl || width <= 0 || height <= 0) return;
    let cancelled = false;

    const paint = (built: HTMLCanvasElement | null) => {
      if (cancelled || !built) return;
      canvasEl.width = built.width;
      canvasEl.height = built.height;
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.drawImage(built, 0, 0);
    };

    if (mode === 'text') {
      const fam = fontFamily ?? 'Arial, sans-serif';
      const fs = fontSize ?? 32;
      const built = buildEmbroideryCanvas({
        width, height, color: color ?? '#000000', stitchAngleDeg,
        drawMask: (ctx, w, h) => {
          ctx.fillStyle = '#000';
          ctx.font = `bold ${fs}px ${fam}`;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillText(content ?? '', 1, h / 2);
        },
      });
      paint(built);
    } else if (mode === 'image' && imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { if (!cancelled) paint(buildEmbroideryImageCanvas({ img, width, height, stitchAngleDeg })); };
      img.onerror = () => {};
      img.src = imageSrc;
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, content, fontSize, fontFamily, color, width, height, imageSrc, stitchAngleDeg]);

  return <canvas ref={canvasRef} style={{ width, height, display: 'block' }} />;
}

const constrainToPrintArea = (x: number, y: number, imgW: number, imgH: number, view: ShirtView, elemW: number, elemH: number, productId: string) => {
  if (imgW === 0 || imgH === 0) return { x, y };
  const area = getPrintAreaForProduct(productId, view);
  const xMin = (area.xMin / 100) * imgW;
  const xMax = (area.xMax / 100) * imgW;
  const yMin = (area.yMin / 100) * imgH;
  const yMax = (area.yMax / 100) * imgH;
  let clampedX = Math.max(xMin, Math.min(xMax - elemW, x));
  let clampedY = Math.max(yMin, Math.min(yMax - elemH, y));
  return { x: clampedX, y: clampedY };
};

const getMaxScaleForElement = (el: DesignElement, imgW: number, imgH: number, productId: string) => {
  if (imgW === 0 || imgH === 0) return 5;
  const area = getPrintAreaForProduct(productId, el.view);
  const areaW = ((area.xMax - area.xMin) / 100) * imgW;
  const areaH = ((area.yMax - area.yMin) / 100) * imgH;
  let bW = 100, bH = 100;
  if (el.width && el.height) { bW = el.width; bH = el.height; }
  else if (el.type === 'text' || el.type === 'number') {
    const fs = el.fontSize ?? 32;
    bW = measureTextWidth(el.content, fs, el.fontFamily ?? 'Arial, sans-serif', el.isBold ?? false, el.isItalic ?? false);
    bH = fs * 1.5;
  }
  else if (el.type === 'emoji') { bW = el.fontSize ?? 48; bH = el.fontSize ?? 48; }
  return Math.max(0.2, Math.min(areaW / bW, areaH / bH));
};

// ─── Art Designs Modal ────────────────────────────────────────────────────────
const ArtDesignsModal = ({
  category,
  onClose,
  onAddArtwork,
}: {
  category: typeof artCategories[0];
  onClose: () => void;
  onAddArtwork: (src: string, name: string) => void;
}) => {
  const [filter, setFilter] = useState<ArtFilter>('all');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filterOptions: { id: ArtFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all',    label: 'All',    icon: <Grid size={13} /> },
    { id: 'latest', label: 'Latest', icon: <Clock size={13} /> },
    { id: 'new',    label: 'New',    icon: <Sparkles size={13} /> },
    { id: '2024',   label: '2024',   icon: <Star size={13} /> },
    { id: '2023',   label: '2023',   icon: <Star size={13} /> },
    { id: '2022',   label: '2022',   icon: <Star size={13} /> },
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
    <div
      className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{ maxHeight: '88vh', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              {category.icon}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{category.label} Designs</h2>
              <p className="text-gray-400 text-xs mt-0.5">{category.designs.length} designs available</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full transition"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Search + Filters */}
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 space-y-3 bg-gray-50">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${category.label} designs…`}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {filterOptions.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filter === f.id
                    ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Designs Grid */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-3">🎨</div>
              <p className="text-gray-500 font-medium">No designs found</p>
              <p className="text-gray-400 text-xs mt-1">Try a different filter or search term</p>
              <button
                onClick={() => { setFilter('all'); setSearch(''); }}
                className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(design => (
                <button
                  key={design.id}
                  onClick={() => { onAddArtwork(design.src, design.name); onClose(); }}
                  onMouseEnter={() => setHoveredId(design.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative group flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 active:scale-95"
                  style={{
                    borderColor: hoveredId === design.id ? '#6366f1' : '#e5e7eb',
                    boxShadow: hoveredId === design.id ? '0 8px 24px rgba(99,102,241,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                    background: hoveredId === design.id ? '#f5f3ff' : '#fafafa',
                  }}
                >
                  {/* Tag badge */}
                  {design.tag && (
                    <div
                      className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        background: design.tag === 'new' ? '#10b981' : '#f59e0b',
                        color: 'white',
                      }}
                    >
                      {design.tag === 'new' ? '✦ New' : '★ Latest'}
                    </div>
                  )}

                  {/* Year badge */}
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-semibold">
                    {design.year}
                  </div>

                  {/* Image area */}
                  <div className="w-full aspect-square flex items-center justify-center p-4 bg-white relative overflow-hidden">
                    <img
                      src={design.src}
                      alt={design.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-200"
                      style={{ transform: hoveredId === design.id ? 'scale(1.08)' : 'scale(1)' }}
                      onError={e => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        const parent = el.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          const fb = document.createElement('div');
                          fb.className = 'fallback-icon flex flex-col items-center justify-center w-full h-full text-gray-300';
                          fb.innerHTML = `<div style="font-size:40px">${category.icon}</div><div style="font-size:11px;color:#9ca3af;margin-top:6px">No preview</div>`;
                          parent.appendChild(fb);
                        }
                      }}
                    />
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
                      style={{
                        background: 'rgba(99,102,241,0.85)',
                        opacity: hoveredId === design.id ? 1 : 0,
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check size={20} className="text-indigo-600" />
                        </div>
                        <span className="text-white text-xs font-bold">Add to Design</span>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="px-2 py-2 text-center">
                    <p className="text-xs font-semibold text-gray-700 truncate leading-tight">{design.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0 bg-gray-50">
          <p className="text-center text-xs text-gray-400">
            {filtered.length} of {category.designs.length} designs shown · Click any to add to your design
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Swap Product Option Card — rectangular, name on the left, image on the right ──
// ─── Swap Product Option Card — name/arrow on the left, image on the right ────────
const SwapOptionCard = ({
  name,
  description,
  image,
  onClick,
}: {
  name: string;
  description?: string;
  image: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="
      group relative flex overflow-hidden
      rounded-xl lg:rounded-2xl
      border border-black/20 bg-white
      shadow-[1px_1px_0px_#000]
      transition-all duration-300 ease-out
      hover:-translate-y-2
      hover:shadow-[5px_8px_0px_#000]
      h-[130px]
      sm:h-[150px]
      w-full
      text-left
    "
  >
    {/* LEFT */}
    <div
      className="
        relative z-20
        flex flex-col justify-between
        w-[60%] p-3
        sm:w-1/2 sm:p-4
        bg-transparent
      "
    >
      <div>
        <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base">
          {name}
        </h4>
        {description && (
          <p className="text-[11px] text-gray-400 mt-1 leading-snug">{description}</p>
        )}
      </div>

      <div
        className="
          flex items-center justify-center
          rounded-full
          h-7 w-7 sm:h-8 sm:w-8
          bg-[#000]
          transition-all duration-300 ease-out
          group-hover:bg-[#444444]
          group-hover:-translate-y-1
        "
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          className="transition-transform duration-300 group-hover:translate-x-[2px]"
        >
          <path d="M5 12h14" />
          <path d="M13 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    {/* RIGHT IMAGE */}
    <div
      className="
        absolute right-0 top-0
        w-[55%] h-full
        z-10
        overflow-hidden
      "
    >
      <img
        src={image}
        alt={name}
        className="
          absolute inset-0 w-full h-full
          object-contain
          transition-all duration-500 ease-out
          group-hover:scale-110
        "
        onError={e => {
          const el = e.target as HTMLImageElement;
          el.style.display = 'none';
          const parent = el.parentElement;
          if (parent && !parent.querySelector('.fallback-icon')) {
            const fb = document.createElement('div');
            fb.className = 'fallback-icon flex items-center justify-center w-full h-full text-3xl';
            fb.innerHTML = '🛍️';
            parent.appendChild(fb);
          }
        }}
      />
    </div>
  </button>
);

// ─── Swap Product Modal — Accessories vs Sports Wear, then individual items ───────
const SwapProductModal = ({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (href: string) => void;
}) => {
  const [view, setView] = useState<'main' | 'accessories' | 'sportswear' | 'apparels'>('main');

  const title =
    view === 'main' ? 'Swap Product Type' :
    view === 'accessories' ? 'Accessories' :
    view === 'sportswear' ? 'Sports Wear' :
    'Apparels';

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{ maxHeight: '85vh', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)' }}
        >
          <div className="flex items-center gap-3">
            {view !== 'main' && (
              <button
                onClick={() => setView('main')}
                className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
            )}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              {view === 'sportswear' ? <Trophy size={18} className="text-white" /> : view === 'apparels' ? <Shirt size={18} className="text-white" /> : <Package size={18} className="text-white" />}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {view === 'main' ? 'Choose a product family' : 'Pick a product to open its tool'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full transition flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Body */}
        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start" style={{ WebkitOverflowScrolling: 'touch' }}>
          {view === 'main' && swapMainCategories.map(cat => (
            <SwapOptionCard
              key={cat.id}
              name={cat.name}
              description={cat.description}
              image={cat.image}
              onClick={() => setView(cat.id)}
            />
          ))}

          {view === 'accessories' && accessorySwapOptions.map(opt => (
            <SwapOptionCard key={opt.id} name={opt.name} image={opt.image} onClick={() => onNavigate(opt.href)} />
          ))}

          {view === 'sportswear' && sportsWearSwapOptions.map(opt => (
            <SwapOptionCard key={opt.id} name={opt.name} image={opt.image} onClick={() => onNavigate(opt.href)} />
          ))}

          {view === 'apparels' && apparelsSwapOptions.map(opt => (
            <SwapOptionCard key={opt.id} name={opt.name} image={opt.image} onClick={() => onNavigate(opt.href)} />
          ))}
        </div>
        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0 bg-gray-50">
          <p className="text-center text-xs text-gray-400">
            {view === 'main' ? 'Select a category to see available products' : 'Tap a product to open its design tool'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── ProductSpecsModal ────────────────────────────────────────────────────────
const ProductSpecsModal = ({ product, selectedPrintingMethod, onClose }: { product: ProductItem; selectedPrintingMethod: PrintingMethod; onClose: () => void }) => {
  const method = printingMethods.find(m => m.id === selectedPrintingMethod);
  const [showSizeChart, setShowSizeChart] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[1200] p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col overflow-hidden shadow-2xl"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-800 to-gray-900">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{product.name}</h2>
            <p className="text-gray-400 text-xs capitalize mt-0.5">{product.categoryId.replace(/-/g, ' ')}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"><X size={18} className="text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl border-2 flex-shrink-0 ${product.previewColor} ${product.borderColor} shadow-md`} />
            <div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes?.map(s => (
                  <span key={s} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">{s}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Available Sizes</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Size Chart</h3>
            {showSizeChart ? (
              <div className="space-y-2">
                <img src="/size-chart.jpg" alt="Size Chart" className="w-full rounded-xl border border-gray-200 shadow-sm" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <button onClick={() => setShowSizeChart(false)} className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 font-medium transition">Hide size chart ↑</button>
              </div>
            ) : (
              <button onClick={() => setShowSizeChart(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition text-sm font-semibold text-gray-600">
                <span className="text-lg">📏</span>View Size Chart
              </button>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Fabric & Construction</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'GSM', value: product.gsm ? `${product.gsm} g/m²` : '—' },
                { label: 'Material', value: product.material ?? '—' },
                { label: 'Fit', value: product.fit ?? '—' },
                { label: 'Neck Style', value: product.neckStyle ?? '—' },
                { label: 'Sleeve', value: product.sleeveType ?? '—' },
                { label: 'Weight', value: product.weight ?? '—' },
              ].map(spec => (
                <div key={spec.label} className="bg-gray-50 rounded-xl p-3">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide block">{spec.label}</span>
                  <span className="text-sm text-gray-800 font-bold mt-0.5 block">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
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
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-base">{'🧺🚫💧🌡️🧴'.split('')[i % 5]}</span>
                    <span className="text-sm text-gray-700">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {method && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Selected Printing Method</h3>
              <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                <img src={method.icon} alt={method.name} className="w-10 h-10 flex-shrink-0 rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-indigo-800">{method.name}</p>
                  <p className="text-xs text-indigo-500">{method.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-indigo-600">Min: {method.minOrder}</p>
                  <p className="text-[10px] text-indigo-400">{method.priceMultiplier}x base</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 p-4 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── InlineTextEditPanel ───────────────────────────────────────────────────────
const InlineTextEditPanel = ({ el, onUpdate, onClose, embroidery }: { el: DesignElement; onUpdate: (id: string, prop: keyof DesignElement, value: any) => void; onClose: () => void; embroidery?: boolean; }) => {
  const [localContent, setLocalContent] = useState(el.content);
  const commit = () => { if (localContent.trim()) onUpdate(el.id, 'content', localContent); onClose(); };
  return (
    <div className="absolute z-[200] bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 w-64"
      style={{ top: '105%', left: '50%', transform: 'translateX(-50%)' }}
      onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-700">Edit Text</span>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100"><X size={10} /></button>
      </div>
      {embroidery && (
        <div className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
          🧵 Embroidery mode — bold, upright thread lettering only
        </div>
      )}
      <textarea value={localContent} onChange={e => setLocalContent(e.target.value)} rows={2} autoFocus
        className="w-full p-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); } }} />
      <div className="flex gap-2 mt-2">
        <input type="color" value={el.color ?? '#000000'} onChange={e => onUpdate(el.id, 'color', e.target.value)} className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0" />
        <select value={el.fontFamily ?? 'Arial, sans-serif'} onChange={e => onUpdate(el.id, 'fontFamily', e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-1 focus:outline-none">
          {fontOptions.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => !embroidery && onUpdate(el.id, 'isBold', !el.isBold)}
          disabled={embroidery}
          title={embroidery ? 'Embroidery text is always bold' : undefined}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${(embroidery || el.isBold) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} ${embroidery ? 'opacity-70 cursor-not-allowed' : ''}`}
        >B</button>
        <button
          onClick={() => !embroidery && onUpdate(el.id, 'isItalic', !el.isItalic)}
          disabled={embroidery}
          title={embroidery ? 'Italics can\'t be embroidered — disabled' : undefined}
          className={`flex-1 py-1 rounded-lg text-xs italic transition ${(!embroidery && el.isItalic) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} ${embroidery ? 'opacity-40 cursor-not-allowed' : ''}`}
        >I</button>
        <button onClick={commit} className="flex-1 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"><Check size={10} /> Done</button>
      </div>
    </div>
  );
};

// ─── ElementWithHandles ────────────────────────────────────────────────────────
const ElementWithHandles = ({ el, isSelected, onMouseDown, onTouchStart, onClick, onDelete, onDuplicate, onRotateStart, onResizeStart, onResizeTouchStart, onUpdateProp, embroidery }: {
  el: DesignElement; isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void; onTouchStart: (e: React.TouchEvent) => void; onClick: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent | React.TouchEvent) => void; onDuplicate: (e: React.MouseEvent | React.TouchEvent) => void;
  onRotateStart: (e: React.MouseEvent) => void; onResizeStart: (e: React.MouseEvent) => void; onResizeTouchStart: (e: React.TouchEvent) => void;
  onUpdateProp: (id: string, prop: keyof DesignElement, value: any) => void;
  embroidery?: boolean;
}) => {
  const [showInlineEdit, setShowInlineEdit] = useState(false);
  const isTextType = el.type === 'text' || el.type === 'number';
  const hs: React.CSSProperties = { position:'absolute', width:28, height:28, borderRadius:'50%', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, boxShadow:'0 2px 8px rgba(0,0,0,0.35)', cursor:'pointer', pointerEvents:'auto' };
  return (
    <div data-element="true"
      style={{ position:'absolute', left:el.x, top:el.y, transform:`rotate(${el.rotation}deg)`, transformOrigin:'0 0', opacity:el.opacity??1, filter:el.isBlackWhite?'grayscale(100%)':'none', zIndex:el.zIndex??0, pointerEvents:'auto', cursor:el.locked?'not-allowed':'move', overflow:'visible' }}
      onMouseDown={onMouseDown} onTouchStart={onTouchStart} onClick={onClick}>
      {isSelected && <div style={{ position:'absolute', inset:-10, border:'2px dashed #2563eb', borderRadius:4, pointerEvents:'none', zIndex:10 }} />}
      {isSelected && <div style={{ ...hs, top:-14, left:-14, background:'#ef4444' }} onMouseDown={e=>{e.stopPropagation();e.preventDefault();onDelete(e);}} onTouchStart={e=>{e.stopPropagation();onDelete(e);}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>}
      {isSelected && <div style={{ ...hs, top:-14, right:-14, background:'#f59e0b', cursor:'grab' }} onMouseDown={e=>{e.stopPropagation();e.preventDefault();onRotateStart(e);}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 11-.57-8.38"/></svg></div>}
      {isSelected && <div style={{ ...hs, bottom:-14, left:-14, background:'#3b82f6' }} onMouseDown={e=>{e.stopPropagation();e.preventDefault();onDuplicate(e);}} onTouchStart={e=>{e.stopPropagation();onDuplicate(e);}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></div>}
      {isSelected && <div style={{ ...hs, bottom:-14, right:-14, background:'#10b981', cursor:'se-resize' }} onMouseDown={e=>{e.stopPropagation();e.preventDefault();onResizeStart(e);}} onTouchStart={e=>{e.stopPropagation();onResizeTouchStart(e);}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 9 3 3 9 3"/><polyline points="21 15 21 21 15 21"/><line x1="3" y1="3" x2="10" y2="10"/><line x1="21" y1="21" x2="14" y2="14"/></svg></div>}
      {isSelected && isTextType && <div style={{ ...hs, top:-14, left:'50%', transform:'translateX(-50%)', background:'#8b5cf6', width:24, height:24 }} onMouseDown={e=>{e.stopPropagation();e.preventDefault();setShowInlineEdit(v=>!v);}} onTouchStart={e=>{e.stopPropagation();setShowInlineEdit(v=>!v);}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>}
      {showInlineEdit && isTextType && <InlineTextEditPanel el={el} onUpdate={onUpdateProp} onClose={() => setShowInlineEdit(false)} embroidery={embroidery} />}
      {(el.type==='text'||el.type==='number') && (
        <div style={{
          fontSize:(el.fontSize??32)*el.scale,
          color:el.color,
          fontFamily:el.fontFamily,
          fontWeight: embroidery ? 'bold' : (el.isBold?'bold':'normal'),
          fontStyle: embroidery ? 'normal' : (el.isItalic?'italic':'normal'),
          textAlign:el.textAlign??'center',
          whiteSpace:'nowrap',
          userSelect:'none',
          lineHeight:1.2,
          ...(embroidery ? getEmbroideryTextStyle(el.color) : {}),
        }}>{el.content}</div>
      )}
      {el.type==='emoji' && <div style={{ fontSize:(el.fontSize??48)*el.scale, userSelect:'none', lineHeight:1 }}>{el.content}</div>}
      {(el.type==='logo'||el.type==='artwork') && el.imageUrl && (
        embroidery ? (
          <div style={{ position:'relative', width:(el.width??100)*el.scale, height:(el.height??100)*el.scale, display:'block' }}>
            <img src={el.imageUrl} alt="element" draggable={false}
              style={{ width:'100%', height:'100%', display:'block', userSelect:'none', objectFit:'contain', filter:EMBROIDERY_IMAGE_FILTER }} />
            <div style={EMBROIDERY_STITCH_OVERLAY} />
          </div>
        ) : (
          <img src={el.imageUrl} alt="element" draggable={false} style={{ width:(el.width??100)*el.scale, height:(el.height??100)*el.scale, display:'block', userSelect:'none', objectFit:'contain' }} />
        )
      )}
    </div>
  );
};

// ─── SidebarIcon ──────────────────────────────────────────────────────────────
const SidebarIcon = ({ imageIcon, label, active, onClick, size=32 }: { imageIcon?:string; label:string; active:boolean; onClick:()=>void; size?:number }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg transition-all duration-200 group ${active?'text-blue-400 bg-blue-500/10':'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
    {imageIcon && <img src={imageIcon} alt={label} style={{ width:size, height:size }} className={`object-contain transition-opacity ${active ? 'opacity-60' : 'opacity-100'}`} />}
    <span className={`text-[10px] mt-0.5 font-medium leading-tight text-center ${active?'text-blue-400':'text-gray-400 group-hover:text-gray-300'}`}>{label}</span>
  </button>
);

// ─── MobileBottomNavItem ──────────────────────────────────────────────────────
const MobileBottomNavItem = ({ imageIcon, label, active, onClick, badge, isSpecial }: {
  imageIcon?: string; label: string; active: boolean; onClick: () => void; badge?: number; isSpecial?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative', WebkitTapHighlightColor: 'transparent', minWidth: 0, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
  >
    <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: active ? 28 : 0, height: 3, borderRadius: '0 0 3px 3px', background: isSpecial ? '#8b5cf6' : '#4F46E5', transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)' }} />
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 26, borderRadius: 8, background: active ? (isSpecial ? '#F3F0FF' : '#EEF2FF') : 'transparent', transition: 'background 0.18s', position: 'relative', marginBottom: 3 }}>
      {imageIcon ? <img src={imageIcon} alt={label} style={{ width: 35, height: 35, objectFit: 'contain', transition: 'filter 0.18s' }} /> : null}
      {badge && badge > 0 ? <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, background: '#E24B4A', borderRadius: 8, fontSize: 8, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #fff', lineHeight: 1 }}>{badge}</span> : null}
    </span>
    <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? (isSpecial ? '#8b5cf6' : '#4F46E5') : '#9CA3AF', letterSpacing: 0.1, lineHeight: 1, transition: 'color 0.18s', whiteSpace: 'nowrap' }}>{label}</span>
  </button>
);

// ─── PrintAreaOverlay ─────────────────────────────────────────────────────────
const PrintAreaOverlay = ({ view, productId }: { view: ShirtView; productId: string }) => {
  const area = getPrintAreaForProduct(productId, view);
  return (
    <div className="absolute pointer-events-none border-2 border-dashed border-blue-500 bg-blue-500/5 rounded-lg"
      style={{ left:`${area.xMin}%`, top:`${area.yMin}%`, width:`${area.xMax-area.xMin}%`, height:`${area.yMax-area.yMin}%` }}>
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded shadow-sm bg-blue-500 text-white">Print Area</div>
      {['-top-1 -left-1','-top-1 -right-1','-bottom-1 -left-1','-bottom-1 -right-1'].map(pos => <div key={pos} className={`absolute w-2 h-2 rounded-full bg-blue-500 ${pos}`} />)}
    </div>
  );
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────
const Dropdown = ({ label, open, onToggle, children }: { label:string; open:boolean; onToggle:()=>void; children:React.ReactNode }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm font-semibold text-gray-700">{label}{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
    {open && <div className="p-4">{children}</div>}
  </div>
);

// ─── WelcomePanel ─────────────────────────────────────────────────────────────
const WelcomePanel = ({ onSelect, onSelectGender, selectedGender }: { onSelect:(tab:SidebarTab)=>void; onSelectGender:(g:Gender)=>void; selectedGender:Gender }) => (
  <div className="py-2">
    <h4 className="text-base font-bold text-gray-800 text-[26px] -mt-6 py-2 text-center">Customize for</h4>
    <div className="grid grid-cols-2 gap-3 mb-5 w-60 mx-auto">
      {(['male','female'] as Gender[]).map(g => (
        <button key={g} onClick={()=>onSelectGender(g)} className={`relative flex flex-col items-center rounded-2xl border-2 overflow-hidden transition-all duration-200 active:scale-95 ${selectedGender===g?(g==='male'?'border-blue-500 shadow-lg shadow-blue-100':'border-pink-400 shadow-lg shadow-pink-100'):'border-gray-200 hover:border-blue-300'}`} style={{ minHeight:70 }}>
          <div className={`absolute inset-0 transition-colors ${selectedGender===g?(g==='male'?'bg-gradient-to-b from-blue-50 to-blue-100':'bg-gradient-to-b from-pink-50 to-pink-100'):'bg-gradient-to-b from-gray-50 to-gray-100'}`} />
          <div className="relative z-10 flex flex-col items-center pt-2 pb-2 w-full">
            <img src={g === 'male' ? '/product-default-icon/male.png' : '/product-default-icon/female.png'} alt={g} className={`w-12 h-16 object-contain transition-all ${selectedGender === g ? 'scale-105' : 'opacity-70'}`} />
            <span className={`text-sm font-bold mt-0.5 ${selectedGender===g?(g==='male'?'text-blue-600':'text-pink-500'):'text-gray-600'}`}>{g==='male'?'♂ Male':'♀ Female'}</span>
          </div>
          {selectedGender===g && <div className={`absolute top-2 right-2 w-5 h-5 ${g==='male'?'bg-blue-500':'bg-pink-400'} rounded-full flex items-center justify-center z-20`}><Check size={10} color="white"/></div>}
        </button>
      ))}
    </div>
    <h4 className="text-base font-bold text-gray-800 mb-1 text-[26px] text-center">How do you want to start?</h4>
    <div className="grid grid-cols-2 gap-3 mb-5 w-80 mx-auto">
      {[
        { tab: 'categories' as SidebarTab, img: '/product-default-icon/products.png' },
        { tab: 'upload' as SidebarTab, img: '/product-default-icon/own-image.png' },
        { tab: 'text' as SidebarTab, img: '/product-default-icon/add-text.png' },
        { tab: 'art' as SidebarTab, img: '/product-default-icon/add-art.png' },
        
      ].map(item => (
        <button key={item.tab} onClick={() => onSelect(item.tab)} className="rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-150 active:scale-95 overflow-hidden shadow-md">
          <img src={item.img} alt={item.tab} className="w-full h-auto object-contain block drop-shadow-lg" style={{ maxHeight: '100px' }} />
        </button>
      ))}
    </div>
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-1">
      <h5 className="text-sm font-semibold text-blue-700 mb-2">Uploading anytime is simple!</h5>
      <div className="space-y-1 text-xs text-blue-600">
        <div className="flex items-center gap-2"><span>⊕</span><span>Drag and drop anywhere</span></div>
        <div className="flex items-center gap-2"><span>⊟</span><span>Copy and paste from clipboard</span></div>
      </div>
    </div>
  </div>
);

// ─── CategoriesPanel ──────────────────────────────────────────────────────────
const CategoriesPanel = ({ selectedGender, onSelectGender, selectedCategory, onSelectCategory, onSelectProduct, selectedProduct, productsInCategory, selectedPrintingMethod, onSelectPrintingMethod }: {
  selectedGender:Gender; onSelectGender:(g:Gender)=>void; selectedCategory:string; onSelectCategory:(c:ProductCategory)=>void;
  onSelectProduct:(p:ProductItem)=>void; selectedProduct:ProductItem; productsInCategory:ProductItem[];
  selectedPrintingMethod:PrintingMethod; onSelectPrintingMethod:(m:PrintingMethod)=>void;
}) => {
  const [catOpen,setCatOpen]=useState(true);
  const [prodOpen,setProdOpen]=useState(true);
  const [printOpen,setPrintOpen]=useState(false);
  const filteredCategories = productCategories.filter(c => c.gender.includes(selectedGender));
  const handleCategorySelect = (cat: ProductCategory) => { onSelectCategory(cat); };
  return (
    <div className="space-y-2">
      <Dropdown label="Product Categories" open={catOpen} onToggle={()=>setCatOpen(v=>!v)}>
        <div className="grid grid-cols-2 gap-2">
          {filteredCategories.map(cat => (
            <button key={cat.id}  onClick={()=>handleCategorySelect(cat)} className={`flex items-center gap-2 h-15  p-2 rounded-xl border transition-all text-left ${selectedCategory===cat.id?'border-blue-500 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
              <img src={cat.icon} className="w-10 h-10 object-contain flex-shrink-0" alt={cat.name}/>
              <span className="text-xs font-medium leading-tight">{cat.name}</span>
              {selectedCategory===cat.id && <span className="ml-auto text-blue-500 text-xs">✔</span>}
            </button>
          ))}
        </div>
      </Dropdown>
      <Dropdown label="Select Color" open={prodOpen} onToggle={()=>setProdOpen(v=>!v)}>
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{productsInCategory.length} color{productsInCategory.length !== 1 ? 's' : ''} available</p>
          {productsInCategory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No products available in this category</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {productsInCategory.map(prod => (
                <button key={prod.id} onClick={()=>onSelectProduct(prod)} className={`flex flex-col items-center p-2 rounded-xl border transition-all ${selectedProduct.id===prod.id?'border-blue-500 bg-blue-50 shadow-sm':'border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-lg mb-1 border ${prod.previewColor} ${prod.borderColor}`}/>
                  <div className="text-[11px] font-medium text-center leading-tight">{prod.name}</div>
                  {selectedProduct.id===prod.id && <span className="text-blue-500 text-[10px] mt-0.5">✔ Selected</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </Dropdown>
      <Dropdown label={`Printing – ${printingMethods.find(m=>m.id===selectedPrintingMethod)?.name}`} open={printOpen} onToggle={()=>setPrintOpen(v=>!v)}>
        <div className="space-y-2">
          {printingMethods.map(method => (
            <button key={method.id} onClick={()=>onSelectPrintingMethod(method.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedPrintingMethod===method.id?'border-blue-500 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
              <img src={method.icon} className="w-6 h-6 flex-shrink-0" alt={method.name}/>
              <div><div className="text-sm font-medium">{method.name}</div><div className="text-xs text-gray-500">{method.description} · Min {method.minOrder}</div></div>
              {selectedPrintingMethod===method.id && <span className="ml-auto text-blue-500">✔</span>}
            </button>
          ))}
        </div>
        {selectedPrintingMethod === 'embroider' && (
          <div className="mt-2 flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
            🧵 <span>Embroidery mode is on — every text and image on the canvas now previews as stitched thread automatically.</span>
          </div>
        )}
      </Dropdown>
    </div>
  );
};

// ─── UploadedImageCard ─────────────────────────────────────────────────────────
const UploadedImageCard = ({ img, onPlace, onDelete, onDuplicate, placedCount }: { img:UploadedImage; onPlace:(img:UploadedImage)=>void; onDelete:(id:string)=>void; onDuplicate:(img:UploadedImage)=>void; placedCount:number }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 p-3">
        <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer group" onClick={()=>onPlace(img)}>
          <img src={img.url} alt={img.name} className="w-full h-full object-contain"/>
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center"><span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-blue-600 bg-white/90 px-1.5 py-0.5 rounded-full">Add</span></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{img.name}</p>
          {placedCount>0 && <span className="inline-block mt-0.5 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">{placedCount} on canvas</span>}
          <div className="flex gap-1.5 mt-2">
            <button onClick={()=>onPlace(img)} className="flex-1 py-1 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ Add</button>
            <button onClick={()=>setExpanded(v=>!v)} className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition ${expanded?'bg-gray-100 border-gray-300 text-gray-700':'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>···</button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>onDuplicate(img)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition text-xs font-semibold"><Copy size={13}/>Duplicate</button>
            <button onClick={()=>onDelete(img.id)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition text-xs font-semibold"><Trash2 size={13}/>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── UploadPanel ───────────────────────────────────────────────────────────────
const UploadPanel = ({ onUpload, uploadedImages, onPlaceImage, onDeleteUpload, onDuplicateUpload, elements, embroidery }: { onUpload:(f:File)=>void; uploadedImages:UploadedImage[]; onPlaceImage:(img:UploadedImage,opts?:any)=>void; onDeleteUpload:(id:string)=>void; onDuplicateUpload:(img:UploadedImage)=>void; elements:DesignElement[]; embroidery?: boolean }) => {
  const [dragActive, setDragActive] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const onDrag=(e:React.DragEvent)=>{e.preventDefault();e.stopPropagation();setDragActive(e.type!=='dragleave');};
  const onDrop=(e:React.DragEvent)=>{e.preventDefault();setDragActive(false);if(e.dataTransfer.files[0])onUpload(e.dataTransfer.files[0]);};
  return (
    <div className="space-y-4 pt-2">
      {embroidery && (
        <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          🧵 <span>Embroidery mode is on — any image you place here will preview with a stitched-thread texture on the canvas.</span>
        </div>
      )}
      <button onClick={()=>ref.current?.click()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">Browse Your Computer</button>
      <input ref={ref} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&onUpload(e.target.files[0])} className="hidden"/>
      <div onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop} className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragActive?'border-blue-500 bg-blue-50':'border-gray-300 bg-gray-50'}`}>
        <Upload size={32} className="mx-auto text-gray-400 mb-2"/>
        <p className="text-sm text-gray-600">Drag & drop your image here</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10 MB</p>
      </div>
      {uploadedImages.length>0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Your Uploads ({uploadedImages.length})</h4>
          <div className="space-y-3">{uploadedImages.map(img=><UploadedImageCard key={img.id} img={img} onPlace={i=>onPlaceImage(i)} onDelete={onDeleteUpload} onDuplicate={onDuplicateUpload} placedCount={elements.filter(el=>el.imageUrl===img.url).length}/>)}</div>
        </div>
      )}
      <div className="bg-blue-50 rounded-xl p-4"><h4 className="text-sm font-semibold text-blue-800 mb-2">Print Area Guide</h4><div className="flex items-center gap-2 mt-1 text-xs text-blue-600"><AlertCircle size={12}/><span>Elements are auto-constrained to the print area.</span></div></div>
    </div>
  );
};

// ─── TextPanel ────────────────────────────────────────────────────────────────
const TextPanel = ({ onAddText, printingMethod }: { onAddText:(text:string,opts:any)=>void; printingMethod?: PrintingMethod }) => {
  const isEmbroidery = printingMethod === 'embroider';
  const [text,setText]=useState('');
  const [selectedFont,setFont]=useState(fontOptions[0].value);
  const [textSize,setTextSize]=useState(32);
  const [textColor,setColor]=useState('#000000');
  const [isBold,setIsBold]=useState(false);
  const [isItalic,setIsItalic]=useState(false);
  const [textAlign,setAlign]=useState<'left'|'center'|'right'>('center');

  // Strictly enforce embroidery-friendly text: bold, upright lettering only.
  useEffect(() => {
    if (isEmbroidery) { setIsBold(true); setIsItalic(false); }
  }, [isEmbroidery]);

  const previewStyle: React.CSSProperties = isEmbroidery
    ? { fontFamily:selectedFont, fontSize:`${Math.min(textSize,36)}px`, color:textColor, textAlign, maxWidth:'100%', overflow:'hidden', wordBreak:'break-word', whiteSpace:'normal', ...getEmbroideryTextStyle(textColor) }
    : { fontFamily:selectedFont, fontSize:`${Math.min(textSize,36)}px`, color:textColor, fontWeight:isBold?'bold':'normal', fontStyle:isItalic?'italic':'normal', textAlign, maxWidth:'100%', overflow:'hidden', wordBreak:'break-word', whiteSpace:'normal' };

  return (
    <div className="space-y-4 pt-2">
      {isEmbroidery && (
        <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          🧵 <span><strong>Embroidery mode</strong> — text is forced bold &amp; upright (italics disabled) and previews as stitched thread.</span>
        </div>
      )}
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Your Text</label><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Enter your text…" rows={3} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-base"/></div>
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Font</label><select value={selectedFont} onChange={e=>setFont(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl text-sm">{fontOptions.map(f=><option key={f.value} value={f.value} style={{fontFamily:f.value}}>{f.name}</option>)}</select></div>
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Font Size: {textSize}px</label><input type="range" min="16" max="120" value={textSize} onChange={e=>setTextSize(+e.target.value)} className="w-full"/></div>
      <div className="flex gap-3">
        <div className="flex-1"><label className="text-sm font-medium text-gray-700 mb-1 block">Color</label><input type="color" value={textColor} onChange={e=>setColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-gray-200"/></div>
        <div className="flex-1"><label className="text-sm font-medium text-gray-700 mb-1 block">Align</label>
          <div className="flex gap-1">{(['left','center','right'] as const).map(a=><button key={a} onClick={()=>setAlign(a)} className={`flex-1 py-2 rounded-lg ${textAlign===a?'bg-blue-600 text-white':'bg-gray-100'}`}>{a==='left'?<AlignLeft size={16} className="mx-auto"/>:a==='center'?<AlignCenter size={16} className="mx-auto"/>:<AlignRight size={16} className="mx-auto"/>}</button>)}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={()=>!isEmbroidery && setIsBold(!isBold)}
          disabled={isEmbroidery}
          title={isEmbroidery ? 'Embroidery text is always bold' : undefined}
          className={`flex-1 py-2 rounded-xl transition ${(isEmbroidery || isBold)?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'} ${isEmbroidery ? 'opacity-70 cursor-not-allowed' : ''}`}
        ><Bold size={16} className="inline mr-1"/>Bold</button>
        <button
          onClick={()=>!isEmbroidery && setIsItalic(!isItalic)}
          disabled={isEmbroidery}
          title={isEmbroidery ? "Italics can't be embroidered — disabled" : undefined}
          className={`flex-1 py-2 rounded-xl transition ${(!isEmbroidery && isItalic)?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'} ${isEmbroidery ? 'opacity-40 cursor-not-allowed' : ''}`}
        ><Italic size={16} className="inline mr-1"/>Italic</button>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 overflow-hidden">
        <p className="text-xs text-gray-500 mb-1">Preview{isEmbroidery ? ' (embroidery)' : ''}</p>
        <div style={previewStyle} className="p-2 bg-white rounded-lg min-h-[40px]">{text||'Sample Text'}</div>
      </div>
      <button onClick={()=>{if(text.trim()){onAddText(text,{fontFamily:selectedFont,fontSize:textSize,color:textColor,isBold:isEmbroidery?true:isBold,isItalic:isEmbroidery?false:isItalic,textAlign});setText('');}}} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">Add To Design</button>
    </div>
  );
};

// ─── ArtworkPanel — now with categories + our-designs modal ──────────────────
const ArtworkPanel = ({ onAddEmoji, onAddNumber, onAddArtwork, embroidery }: { onAddEmoji:(e:string)=>void; onAddNumber:(n:string)=>void; onAddArtwork:(src:string,name:string)=>void; embroidery?: boolean }) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'number' | 'images' | 'designs'>('designs');
  const [numberValue, setNumberValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategory, setOpenCategory] = useState<typeof artCategories[0] | null>(null);

  const filtered = emojis.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.char.includes(searchTerm));
  const jerseyNumbers = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','30','32','33','34','45','50','55','66','69','77','80','99'];

  return (
    <>
      <div className="space-y-3">
        {embroidery && (
          <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            🧵 <span>Embroidery mode is on — numbers, art & designs added here will preview as stitched thread on the canvas.</span>
          </div>
        )}
        {/* Tab bar */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { id: 'designs', label: '🎨 Our Designs' },
            { id: 'emoji',   label: '😊 Emojis' },
            { id: 'number',  label: '# Numbers' },
            { id: 'images',  label: '🖼 Artwork' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 py-2 px-2 text-xs font-semibold transition border-b-2 ${activeTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OUR DESIGNS tab — category cards grid */}
        {activeTab === 'designs' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Browse our curated design collections by category. Click a category to explore and add designs to your product.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {artCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setOpenCategory(cat)}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-200 active:scale-95 group overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${cat.color}`} style={{ opacity: 0 }} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />

                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)', border: '1.5px solid #e0e7ff' }}
                  >
                    {cat.icon}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{cat.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{cat.designs.length} designs</p>
                  </div>

                  {/* New badge if any designs tagged new */}
                  {cat.designs.some(d => d.tag === 'new') && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-wide">
                      New
                    </div>
                  )}

                  {/* Arrow hint */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                    <ChevronRight size={11} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] text-gray-400 font-medium px-2">
                {artCategories.reduce((a, c) => a + c.designs.length, 0)} total designs across {artCategories.length} categories
              </span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
          </div>
        )}

        {/* EMOJI tab */}
        {activeTab === 'emoji' && (
          <>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search emojis…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {filtered.map(em=>(
                <button key={em.char} onClick={()=>onAddEmoji(em.char)} className="flex flex-col items-center p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                  <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{em.char}</span>
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">{em.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* NUMBERS tab */}
        {activeTab === 'number' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={numberValue} onChange={e=>setNumberValue(e.target.value)} placeholder="Custom number…" className="flex-1 p-2 border border-gray-200 rounded-xl focus:outline-none"
                onKeyDown={e=>{if(e.key==='Enter'&&numberValue.trim()){onAddNumber(numberValue.trim());setNumberValue('');}}} />
              <button onClick={()=>{if(numberValue.trim()){onAddNumber(numberValue.trim());setNumberValue('');}}} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Add</button>
            </div>
            <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto">
              {jerseyNumbers.map(n=>(
                <button key={n} onClick={()=>onAddNumber(n)} className="aspect-square flex items-center justify-center bg-gray-50 rounded-xl hover:bg-blue-100 transition text-lg font-bold" style={{fontFamily:'Impact, sans-serif'}}>{n}</button>
              ))}
            </div>
          </div>
        )}

        {/* ARTWORK/IMAGES tab */}
        {activeTab === 'images' && (
          <div className="grid grid-cols-3 gap-2">
            {artworkImages.map(art=>(
              <button key={art.id} onClick={()=>onAddArtwork(art.src,art.name)} className="flex flex-col items-center p-2 bg-gray-50 rounded-xl hover:bg-blue-50 border-2 border-transparent hover:border-blue-400 transition group">
                <div className="w-full h-16 flex items-center justify-center mb-1 rounded-lg bg-white overflow-hidden">
                  <img src={art.thumb} alt={art.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform"
                    onError={e=>{(e.target as HTMLImageElement).src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23e5e7eb" rx="8"/><text x="50%" y="55%" text-anchor="middle" font-size="24">🖼</text></svg>';}} />
                </div>
                <span className="text-[10px] text-gray-500 text-center truncate w-full">{art.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Art Designs Modal */}
      {openCategory && (
        <ArtDesignsModal
          category={openCategory}
          onClose={() => setOpenCategory(null)}
          onAddArtwork={onAddArtwork}
        />
      )}
    </>
  );
};

// ─── NamesPanel ───────────────────────────────────────────────────────────────
const NamesPanel = ({ onAddName, selectedProduct, embroidery }: { onAddName:(n:string)=>void; selectedProduct:ProductItem; embroidery?: boolean }) => {
  const [name,setName]=useState('');
  const [recentNames,setRecentNames]=useState<string[]>(['Sarah','Michael','Emma','James']);
  const add=()=>{if(name.trim()){onAddName(name.trim());setRecentNames(p=>[name.trim(),...p.slice(0,3)]);setName('');}};
  return (
    <div className="space-y-4 pt-2">
      {embroidery && (
        <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          🧵 <span>Embroidery mode is on — names will preview as stitched thread lettering on the canvas.</span>
        </div>
      )}
      <div className="w-full flex justify-center">
        <div className="relative w-full h-70 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md bg-transparent">
          <img src="/name-space.webp" alt="Name Space" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"/>
        </div>
      </div>
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Add a name to your design</label>
        <div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter a name…" className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base" onKeyDown={e=>e.key==='Enter'&&add()}/><button onClick={add} className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">Add</button></div>
      </div>
      {recentNames.length>0&&<div><h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Names</h4><div className="flex flex-wrap gap-2">{recentNames.map((n,i)=><button key={i} onClick={()=>setName(n)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition">{n}</button>)}</div></div>}
    </div>
  );
};

// ─── MobileSheetPanel ─────────────────────────────────────────────────────────
const MobileSheetPanel = ({ open, title, onClose, children }: { open:boolean; title:string; onClose:()=>void; children:React.ReactNode }) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[900] lg:hidden" onClick={onClose} style={{ backdropFilter:'blur(2px)' }}/>
      <div className="fixed left-0 right-0 bottom-0 z-[1000] lg:hidden bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight:'82vh', animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)', paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full"/></div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <span className="font-bold text-gray-900 text-base">{title}</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"><X size={16} className="text-gray-600"/></button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-8" style={{ WebkitOverflowScrolling:'touch' }}>{children}</div>
      </div>
    </>
  );
};

// ─── MobileSidebarPanel ───────────────────────────────────────────────────────
const MobileSidebarPanel = ({ open, onClose, children }: { open:boolean; onClose:()=>void; children:React.ReactNode }) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[950] lg:hidden" onClick={onClose} style={{ backdropFilter:'blur(2px)' }}/>
      <div className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white z-[1000] lg:hidden shadow-2xl flex flex-col overflow-hidden">{children}</div>
    </>
  );
};

// ─── MobileViewStrip ──────────────────────────────────────────────────────────
const MobileViewStrip = ({ views, selectedView, product, onSelect }: { views:ShirtView[]; selectedView:ShirtView; product:ProductItem; onSelect:(v:ShirtView)=>void }) => (
  <div className="flex gap-2 overflow-x-auto px-1 pb-1" style={{ WebkitOverflowScrolling:'touch', scrollbarWidth:'none' }}>
    {views.map(v => (
      <button key={v} onClick={()=>onSelect(v)} className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${selectedView===v?'border-indigo-500 bg-indigo-50':'border-gray-200 bg-white'}`} style={{ minWidth:60 }}>
        <img src={product.images[v]} alt={v} className="w-10 h-10 object-contain rounded-lg"/>
        <span className={`text-[9px] font-semibold capitalize ${selectedView===v?'text-indigo-600':'text-gray-500'}`}>{v}</span>
      </button>
    ))}
  </div>
);

const VIEW_TRANSLATE_X: Record<ShirtView,string> = { front:'translateX(290px)', back:'translateX(260px)', left:'translateX(290px)', right:'translateX(260px)' };

// ─── ProductSpecsCard ─────────────────────────────────────────────────────────
const ProductSpecsCard = ({ product, selectedPrintingMethod, onLearnMore }: { product: ProductItem; selectedPrintingMethod: PrintingMethod; onLearnMore: () => void; }) => {
  const method = printingMethods.find(m => m.id === selectedPrintingMethod);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-3 py-2"><span className="text-xs font-bold text-white tracking-wide uppercase">Product Specification</span></div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl border-2 flex-shrink-0 ${product.previewColor} ${product.borderColor}`}/><div><p className="text-xs font-bold text-gray-800">{product.name}</p><p className="text-[10px] text-gray-500 capitalize">{product.categoryId.replace('-',' ')}</p></div></div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {product.gsm&&<div className="flex flex-col bg-gray-50 rounded-lg p-1.5"><span className="text-gray-400 font-medium uppercase tracking-wide">GSM</span><span className="text-gray-800 font-bold">{product.gsm}g/m²</span></div>}
          {product.material&&<div className="flex flex-col bg-gray-50 rounded-lg p-1.5"><span className="text-gray-400 font-medium uppercase tracking-wide">Material</span><span className="text-gray-800 font-bold text-[9px] leading-tight">{product.material}</span></div>}
        </div>
        <button onClick={onLearnMore} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"><Info size={12} />Product Specification</button>
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Available Sizes</p>
            <div className="flex flex-wrap items-center gap-1">
              {product.sizes.map(s => (<span key={s} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">{s}</span>))}
              <button onClick={onLearnMore} className="text-[9px] h-5 px-2 py-0.5 rounded bg-black text-white font-semibold ml-1 flex-shrink-0">Size Chart</button>
            </div>
          </div>
        )}
        {method&&<div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2"><img src={method.icon} alt={method.name} className="w-5 h-5 flex-shrink-0" onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/><div><p className="text-[10px] font-bold text-blue-700">{method.name}</p><p className="text-[9px] text-blue-500">{method.description} · Min: {method.minOrder}</p></div></div>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT (inner — uses useSearchParams, must be rendered inside <Suspense>)
// ═══════════════════════════════════════════════════════════════════════════════
function CustomizedToolPageContent() {
  // ── Routing (used for deep-linking products by URL/ID, and for the Swap Product modal) ──
  const router       = useRouter();
  const pathname      = usePathname();
  const searchParams = useSearchParams();
  const didInitFromUrl = useRef(false);

  const [selectedProduct, setSelectedProductState]         = useState<ProductItem>(()=>{ const id=lsGet<string>(LS_PRODUCT,productSets[0].id); return productSets.find(p=>p.id===id)??productSets[0]; });
  const [selectedCategory, setSelectedCategoryState]       = useState<string>(()=>lsGet(LS_CATEGORY,'round-neck'));
  const [selectedGender, setSelectedGenderState]           = useState<Gender>(()=>lsGet(LS_GENDER,'male'));
  const [selectedPrintingMethod, setSelectedPrintingState] = useState<PrintingMethod>(()=>lsGet(LS_PRINTING,'dtf'));
  const [elements, setElementsState]                       = useState<DesignElement[]>(()=>lsGet(LS_ELEMENTS,[]));
  const [selectedView, setSelectedViewState]               = useState<ShirtView>(()=>lsGet(LS_VIEW,'front'));

  // Strictly forces the embroidery look: every text/logo/artwork element on the
  // canvas renders through the stitched-thread style whenever this is true.
  const isEmbroideryMode = selectedPrintingMethod === 'embroider';

  // Keeps the current product/category reflected in the URL (?productId=...&category=...)
  // so a specific product can always be opened directly via a shareable link.
  const updateUrlParams = useCallback((updates: Record<string, string>) => {
    try {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
      Object.entries(updates).forEach(([k, v]) => params.set(k, v));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } catch {}
  }, [router, pathname, searchParams]);

  const setSelectedProduct      = (p:ProductItem)      => { setSelectedProductState(p);    lsSet(LS_PRODUCT,p.id); updateUrlParams({ productId: p.id, category: p.categoryId }); };
  const setSelectedCategory     = (c:string)           => { setSelectedCategoryState(c);   lsSet(LS_CATEGORY,c);   updateUrlParams({ category: c }); };
  const setSelectedGender       = (g:Gender)           => { setSelectedGenderState(g);     lsSet(LS_GENDER,g);     };
  const setSelectedPrintingMethod=(m:PrintingMethod)   => { setSelectedPrintingState(m);   lsSet(LS_PRINTING,m);   };
  const setElements = (els:DesignElement[]|((p:DesignElement[])=>DesignElement[])) => {
    setElementsState(prev=>{ const next=typeof els==='function'?els(prev):els; lsSet(LS_ELEMENTS,next); return next; });
  };
  const setSelectedView = (v:ShirtView) => { setSelectedViewState(v); lsSet(LS_VIEW,v); };

  // Initialize directly from the URL on first mount — e.g. a nav link to
  // `/custom-tool?productId=oversized-black` or `/custom-tool?category=tank-top`
  // will load that exact product without needing to click through the UI.
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;
    const productIdParam = searchParams?.get('productId');
    const categoryParam   = searchParams?.get('category');

    if (productIdParam) {
      const prod = productSets.find(p => p.id === productIdParam);
      if (prod) {
        setSelectedProductState(prod);
        setSelectedCategoryState(prod.categoryId);
        lsSet(LS_PRODUCT, prod.id);
        lsSet(LS_CATEGORY, prod.categoryId);
        const cat = productCategories.find(c => c.id === prod.categoryId);
        if (cat && !cat.gender.includes(selectedGender)) {
          setSelectedGenderState(cat.gender[0]);
          lsSet(LS_GENDER, cat.gender[0]);
        }
        // Deep-linked in via Swap Product / URL — open the Product sidebar tab
        // so it's shown as active and the matching category/product is visible.
        setDesktopActiveTab('categories');
        if (isMobile) setMobileSheetTab('categories');
        return;
      }
    }
    if (categoryParam) {
      const cat = productCategories.find(c => c.id === categoryParam);
      if (cat) {
        setSelectedCategoryState(cat.id);
        lsSet(LS_CATEGORY, cat.id);
        // NOTE: only categories that have a matching entry in `productSets` can resolve
        // to an actual product. Add product entries for any category you want deep-linkable.
        const prods = productSets.filter(p => p.categoryId === cat.id);
        if (prods.length) {
          setSelectedProductState(prods[0]);
          lsSet(LS_PRODUCT, prods[0].id);
        }
        if (!cat.gender.includes(selectedGender)) {
          setSelectedGenderState(cat.gender[0]);
          lsSet(LS_GENDER, cat.gender[0]);
        }
        // Deep-linked in via Swap Product / URL — open the Product sidebar tab
        // so it's shown as active and the matching category/product is visible.
        setDesktopActiveTab('categories');
        if (isMobile) setMobileSheetTab('categories');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedElementId,setSelectedElementId] = useState<string|null>(null);
  const [isDragging,setIsDragging]               = useState(false);
  const [dragOffset,setDragOffset]               = useState({x:0,y:0});
  const [isEditModalOpen,setIsEditModalOpen]     = useState(false);
  const [isSavedDesignsOpen,setIsSavedDesignsOpen]=useState(false);
  const [history,setHistory]                     = useState<DesignElement[][]>([]);
  const [historyIndex,setHistoryIndex]           = useState(-1);
  const [savedDesigns,setSavedDesigns]           = useState<SavedDesign[]>(()=>lsGet(LS_DESIGNS,[]));
  const [designName,setDesignName]               = useState('');
  const [showSaveDialog,setShowSaveDialog]       = useState(false);
  const [editingElement,setEditingElement]       = useState<DesignElement|null>(null);
  const [tempScale,setTempScale]                 = useState(1);
  const [tempRotation,setTempRotation]           = useState(0);
  const [tempOpacity,setTempOpacity]             = useState(1);
  const [showPrintArea,setShowPrintArea]         = useState(true);
  const [isMobile,setIsMobile]                   = useState(false);
  const [isTablet,setIsTablet]                   = useState(false);
  const [mobileSheetTab,setMobileSheetTab]       = useState<SidebarTab|null>(null);
  const [desktopActiveTab,setDesktopActiveTab]   = useState<SidebarTab|null>(null);
  const [mobileViewsOpen,setMobileViewsOpen]     = useState(false);
  const [mobileSidebarOpen,setMobileSidebarOpen] = useState(false);
  const [uploadedImages,setUploadedImages]       = useState<UploadedImage[]>([]);
  const [imgSize,setImgSize]                     = useState({width:0,height:0,offsetX:0,offsetY:0});
  const [viewImgSizes,setViewImgSizes]           = useState<Partial<Record<ShirtView,{width:number;height:number;offsetX:number;offsetY:number}>>>({});
  const [showSpecsModal,setShowSpecsModal]       = useState(false);
  const [showSwapModal,setShowSwapModal]         = useState(false);

  const canvasRef    = useRef<HTMLDivElement>(null);
  const canvasImgRef = useRef<HTMLImageElement>(null);
  const viewImgRefs  = useRef<Partial<Record<ShirtView,HTMLImageElement|null>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{ const check=()=>{ const w=window.innerWidth; setIsMobile(w<768); setIsTablet(w>=768&&w<1024); }; check(); window.addEventListener('resize',check); return()=>window.removeEventListener('resize',check); },[]);

  const measureImage = useCallback(()=>{ if(!canvasImgRef.current||!canvasRef.current) return; const ir=canvasImgRef.current.getBoundingClientRect(); const cr=canvasRef.current.getBoundingClientRect(); setImgSize({width:ir.width,height:ir.height,offsetX:ir.left-cr.left,offsetY:ir.top-cr.top}); },[]);
  const measureAllViews = useCallback(()=>{ if(!canvasRef.current) return; const cr=canvasRef.current.getBoundingClientRect(); const ns:Partial<Record<ShirtView,{width:number;height:number;offsetX:number;offsetY:number}>>={};
    Object.entries(viewImgRefs.current).forEach(([v,el])=>{ if(el){const r=el.getBoundingClientRect();ns[v as ShirtView]={width:r.width,height:r.height,offsetX:r.left-cr.left,offsetY:r.top-cr.top};} }); setViewImgSizes(ns); },[]);

  useEffect(()=>{ const id=setTimeout(()=>{measureImage();measureAllViews();},100); return()=>clearTimeout(id); },[selectedProduct,selectedView,desktopActiveTab,isMobile,isTablet,measureImage,measureAllViews]);
  useEffect(()=>{ if(!canvasImgRef.current) return; const ro=new ResizeObserver(()=>{measureImage();measureAllViews();}); ro.observe(canvasImgRef.current); window.addEventListener('resize',()=>{measureImage();measureAllViews();}); return()=>{ ro.disconnect(); window.removeEventListener('resize',measureImage); }; },[measureImage,measureAllViews]);

  useEffect(()=>{
    if(imgSize.width===0) return;
    let changed=false;
    const updated=elements.map(el=>{
      if(el.productId && el.productId !== selectedProduct.id) return el;
      const{width:ew,height:eh}=getElementDimensions(el); const c=constrainToPrintArea(el.x,el.y,imgSize.width,imgSize.height,el.view,ew,eh,selectedProduct.id); if(c.x!==el.x||c.y!==el.y){changed=true;return{...el,...c};} return el; });
    if(changed) setElements(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[imgSize,selectedProduct]);

  useEffect(()=>{ const cat=productCategories.find(c=>c.id===selectedProduct.categoryId); const views=cat?.availableViews??['front']; if(!views.includes(selectedView)) setSelectedView(views[0]); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selectedProduct]);

  const pushHistory = useCallback((els:DesignElement[])=>{
    setHistory(h=>{ const next=[...h.slice(0,historyIndex+1),JSON.parse(JSON.stringify(els))]; setHistoryIndex(next.length-1); return next; });
  },[historyIndex]);

  const undo=()=>{ if(historyIndex>0){const i=historyIndex-1;setHistoryIndex(i);setElementsState(JSON.parse(JSON.stringify(history[i])));lsSet(LS_ELEMENTS,history[i]);} };
  const redo=()=>{ if(historyIndex<history.length-1){const i=historyIndex+1;setHistoryIndex(i);setElementsState(JSON.parse(JSON.stringify(history[i])));lsSet(LS_ELEMENTS,history[i]);} };

  const getProductsByCategory=(cid:string)=>productSets.filter(p=>p.categoryId===cid);
  const getAvailableViews=():ShirtView[]=>{ const cat=productCategories.find(c=>c.id===selectedProduct.categoryId); return cat?.availableViews??['front']; };

  const navigateView = (direction: 'prev' | 'next') => {
    const available = getAvailableViews();
    const idx = available.indexOf(selectedView);
    if (direction === 'prev') { setSelectedView(available[(idx - 1 + available.length) % available.length]); }
    else { setSelectedView(available[(idx + 1) % available.length]); }
  };

  const getPlacementPosition=(elemW:number,elemH:number)=>{
    if(imgSize.width===0) return{x:50,y:50};
    const area=getPrintAreaForProduct(selectedProduct.id,selectedView);
    const cx=((area.xMin+area.xMax)/2/100)*imgSize.width-elemW/2;
    const cy=((area.yMin+area.yMax)/2/100)*imgSize.height-elemH/2;
    return constrainToPrintArea(cx,cy,imgSize.width,imgSize.height,selectedView,elemW,elemH,selectedProduct.id);
  };

  const updateElementProperty = (id: string, prop: keyof DesignElement, value: any) => {
    setElements(prev => {
      const next = prev.map(el => {
        if (el.id !== id) return el;
        const updated = { ...el, [prop]: value };
        if (prop === 'fontSize' && (el.type === 'text' || el.type === 'number')) {
          const oldW = getElementDimensions(el).width;
          const newW = getElementDimensions(updated).width;
          updated.x = el.x + (oldW - newW) / 2;
        }
        return updated;
      });
      if ((prop === 'scale' || prop === 'fontSize') && imgSize.width > 0) {
        return next.map(el => {
          if (el.id !== id) return el;
          if(el.productId && el.productId !== selectedProduct.id) return el;
          const { width: ew, height: eh } = getElementDimensions(el);
          const c = constrainToPrintArea(el.x, el.y, imgSize.width, imgSize.height, el.view, ew, eh, selectedProduct.id);
          return { ...el, ...c };
        });
      }
      return next;
    });
  };

  const closeMobileSheet=()=>setMobileSheetTab(null);

  const handleGenderChange=(g:Gender)=>{
    setSelectedGender(g);
    const cats=productCategories.filter(c=>c.gender.includes(g));
    if(cats.length){setSelectedCategory(cats[0].id);const prods=getProductsByCategory(cats[0].id);if(prods.length)setSelectedProduct(prods[0]);}
  };

  // Opens the Accessories / Sports Wear product picker.
  const handleOpenSwapModal = () => setShowSwapModal(true);

  // Navigates to a different product line's own design-tool page (used by the Swap Product modal).
  // NOTE: uses a hard/full page reload (window.location) instead of router.push.
  // router.push only does a client-side nav, and since this page's init-from-URL
  // logic (didInitFromUrl) only runs once on mount, a same-page URL change like
  // /custom-tool?category=... would never re-trigger it — so the newly picked
  // product/category would silently fail to load. A full reload guarantees the
  // page remounts and re-reads productId/category from the URL correctly.
  const handleSwapNavigate = (href: string) => {
    setShowSwapModal(false);
    window.location.href = href;
  };

  const addText=(content:string,opts?:any)=>{
    if(!content.trim())return;
    const fs=opts?.fontSize??32; const fontFamily=opts?.fontFamily??'Arial, sans-serif';
    // Strictly enforce embroidery-friendly text regardless of what the panel passed in.
    const isBold=isEmbroideryMode?true:(opts?.isBold??false); const isItalic=isEmbroideryMode?false:(opts?.isItalic??false);
    const ew=measureTextWidth(content, fs, fontFamily, isBold, isItalic); const eh=fs*1.5;
    const{x,y}=getPlacementPosition(ew,eh);
    const el:DesignElement={id:Date.now().toString(),type:'text',content,x,y,scale:1,rotation:0,view:selectedView,productId:selectedProduct.id,fontSize:fs,color:opts?.color??'#000000',isBlackWhite:false,opacity:1,zIndex:elements.length,locked:false,visible:true,isBold,isItalic,fontFamily,textAlign:opts?.textAlign??'center'};
    const next=[...elements,el];setElements(next);setSelectedElementId(el.id);closeMobileSheet();pushHistory(next);
  };

  const addEmoji=(emoji:string)=>{
    const sz=48;const{x,y}=getPlacementPosition(sz,sz);
    const el:DesignElement={id:Date.now().toString(),type:'emoji',content:emoji,x,y,scale:1,rotation:0,view:selectedView,productId:selectedProduct.id,fontSize:sz,isBlackWhite:false,opacity:1,zIndex:elements.length,locked:false,visible:true,fontFamily:'Segoe UI Emoji, Apple Color Emoji, sans-serif'};
    const next=[...elements,el];setElements(next);setSelectedElementId(el.id);closeMobileSheet();pushHistory(next);
  };

  const addNumber=(number:string)=>{
    const fs=64; const fontFamily='Impact, Arial Black, sans-serif';
    const ew=measureTextWidth(number, fs, fontFamily, true, false);
    const{x,y}=getPlacementPosition(ew,fs*1.2);
    const el:DesignElement={id:Date.now().toString(),type:'number',content:number,x,y,scale:1,rotation:0,view:selectedView,productId:selectedProduct.id,fontSize:fs,color:'#FFFFFF',isBlackWhite:false,opacity:1,zIndex:elements.length,locked:false,visible:true,isBold:true,isItalic:false,fontFamily,textAlign:'center'};
    const next=[...elements,el];setElements(next);setSelectedElementId(el.id);closeMobileSheet();pushHistory(next);
  };

  const addName=(name:string)=>{
    const fs=36; const fontFamily='Impact, Arial Black, sans-serif';
    const ew=measureTextWidth(name.toUpperCase(), fs, fontFamily, true, false);
    const{x,y}=getPlacementPosition(ew,fs*1.5);
    const el:DesignElement={id:Date.now().toString(),type:'text',content:name.toUpperCase(),x,y,scale:1,rotation:0,view:selectedView,productId:selectedProduct.id,fontSize:fs,color:'#FFFFFF',isBlackWhite:false,opacity:1,zIndex:elements.length,locked:false,visible:true,isBold:true,isItalic:false,fontFamily,textAlign:'center'};
    const next=[...elements,el];setElements(next);setSelectedElementId(el.id);closeMobileSheet();pushHistory(next);
  };

  const addArtwork=(src:string,name:string)=>{
    const w=100,h=100;const{x,y}=getPlacementPosition(w,h);
    const el:DesignElement={id:Date.now().toString(),type:'artwork',content:name,x,y,scale:1,rotation:0,view:selectedView,productId:selectedProduct.id,imageUrl:src,isBlackWhite:false,opacity:1,zIndex:elements.length,locked:false,visible:true,width:w,height:h};
    const next=[...elements,el];setElements(next);setSelectedElementId(el.id);closeMobileSheet();pushHistory(next);
  };

  const uploadLogo=(file:File,opts?:{scale?:number;rotation?:number;opacity?:number})=>{
    const url=URL.createObjectURL(file);const img=new Image();
    const uploadId=`upload-${Date.now()}`;
    const uploadedImg:UploadedImage={id:uploadId,name:file.name.replace(/\.[^.]+$/,''),url,thumb:url};
    setUploadedImages(prev=>[...prev,uploadedImg]);
    const place=(ew:number,eh:number)=>{ const scale=opts?.scale??1;const rotation=opts?.rotation??0;const opacity=opts?.opacity??1;
      const{x,y}=getPlacementPosition(ew*scale,eh*scale);
      const el:DesignElement={id:Date.now().toString(),type:'logo',content:url,x,y,scale,rotation,view:selectedView,productId:selectedProduct.id,imageUrl:url,isBlackWhite:false,opacity,zIndex:elements.length,locked:false,visible:true,width:ew,height:eh};
      const next=[...elements,el];setElements(next);setSelectedElementId(el.id);closeMobileSheet();pushHistory(next);
    };
    img.onload=()=>{ const h=100;place(Math.round(h*img.width/img.height),h); };
    img.onerror=()=>place(100,100); img.src=url;
  };

  const placeUploadedImage=(img:UploadedImage,opts?:{scale?:number;rotation?:number;opacity?:number})=>{
    const scale=opts?.scale??1;const rotation=opts?.rotation??0;const opacity=opts?.opacity??1;
    const w=100,h=100;const{x,y}=getPlacementPosition(w*scale,h*scale);
    const el:DesignElement={id:Date.now().toString(),type:'logo',content:img.url,x,y,scale,rotation,view:selectedView,productId:selectedProduct.id,imageUrl:img.url,isBlackWhite:false,opacity,zIndex:elements.length,locked:false,visible:true,width:w,height:h};
    const next=[...elements,el];setElements(next);setSelectedElementId(el.id);pushHistory(next);
  };

  const deleteUploadedImage=(id:string)=>{ const img=uploadedImages.find(i=>i.id===id);if(!img)return;setUploadedImages(prev=>prev.filter(i=>i.id!==id));const next=elements.filter(el=>el.imageUrl!==img.url);setElements(next);pushHistory(next); };
  const duplicateUploadedImage=(img:UploadedImage)=>placeUploadedImage(img,{scale:1,rotation:0,opacity:1});

  const removeElement=(id:string)=>{ const next=elements.filter(e=>e.id!==id);setElements(next);if(selectedElementId===id)setSelectedElementId(null);pushHistory(next); };
  const duplicateElement=(id:string)=>{ const el=elements.find(e=>e.id===id);if(!el)return;const{width:ew,height:eh}=getElementDimensions(el);const c=constrainToPrintArea(el.x+20,el.y+20,imgSize.width,imgSize.height,el.view,ew,eh,selectedProduct.id);const newEl={...el,id:Date.now().toString(),...c};const next=[...elements,newEl];setElements(next);setSelectedElementId(newEl.id);pushHistory(next); };
  const bringToFront=(id:string)=>{ const el=elements.find(e=>e.id===id);if(!el)return;const next=[...elements.filter(e=>e.id!==id),el];setElements(next);pushHistory(next); };
  const toggleBlackWhite=(id:string)=>{ const el=elements.find(e=>e.id===id);if(el)updateElementProperty(id,'isBlackWhite',!el.isBlackWhite); };

  const handleMouseDown=(e:React.MouseEvent|React.TouchEvent,id:string)=>{
    const el=elements.find(x=>x.id===id);if(el?.locked)return;
    e.stopPropagation();setSelectedElementId(id);setIsDragging(true);
    const clientX='touches' in e?e.touches[0].clientX:e.clientX;
    const clientY='touches' in e?e.touches[0].clientY:e.clientY;
    if(canvasRef.current&&el){const cr=canvasRef.current.getBoundingClientRect();setDragOffset({x:(clientX-cr.left)-imgSize.offsetX-el.x,y:(clientY-cr.top)-imgSize.offsetY-el.y});}
  };

  const handleMouseMove=useCallback((e:MouseEvent|TouchEvent)=>{
    if(!isDragging||!selectedElementId||!canvasRef.current)return;
    const el=elements.find(x=>x.id===selectedElementId);if(!el||el.locked)return;
    e.preventDefault?.();
    const clientX='touches' in e?e.touches[0].clientX:e.clientX;
    const clientY='touches' in e?e.touches[0].clientY:e.clientY;
    const cr=canvasRef.current.getBoundingClientRect();
    let x=(clientX-cr.left)-imgSize.offsetX-dragOffset.x;
    let y=(clientY-cr.top)-imgSize.offsetY-dragOffset.y;
    if(imgSize.width>0){const{width:ew,height:eh}=getElementDimensions(el);const c=constrainToPrintArea(x,y,imgSize.width,imgSize.height,el.view,ew,eh,selectedProduct.id);x=c.x;y=c.y;}
    setElements(prev=>prev.map(item=>item.id===selectedElementId?{...item,x,y}:item));
  },[isDragging,selectedElementId,elements,imgSize,dragOffset,selectedProduct]);

  const handleMouseUp=useCallback(()=>{ if(isDragging){setIsDragging(false);pushHistory(elements);} },[isDragging,elements,pushHistory]);

  useEffect(()=>{
    if(!isDragging)return;
    window.addEventListener('mousemove',handleMouseMove,{passive:false});window.addEventListener('mouseup',handleMouseUp);
    window.addEventListener('touchmove',handleMouseMove,{passive:false});window.addEventListener('touchend',handleMouseUp);
    return()=>{ window.removeEventListener('mousemove',handleMouseMove);window.removeEventListener('mouseup',handleMouseUp);window.removeEventListener('touchmove',handleMouseMove);window.removeEventListener('touchend',handleMouseUp); };
  },[isDragging,handleMouseMove,handleMouseUp]);

  const handleRotateStart=(e:React.MouseEvent,el:DesignElement)=>{
    e.stopPropagation();e.preventDefault();
    const target=(e.currentTarget as HTMLElement).closest('[data-element]') as HTMLElement;if(!target)return;
    const rect=target.getBoundingClientRect();const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    const startAngle=Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI;const startRot=el.rotation;
    const onMove=(mv:MouseEvent)=>{const angle=Math.atan2(mv.clientY-cy,mv.clientX-cx)*180/Math.PI;updateElementProperty(el.id,'rotation',startRot+(angle-startAngle));};
    const onUp=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
  };

  const handleResizeStart = (e: React.MouseEvent, el: DesignElement) => {
    e.stopPropagation();e.preventDefault();
    const startX = e.clientX;const startScale = el.scale;
    const maxScale = getMaxScaleForElement(el, imgSize.width, imgSize.height, selectedProduct.id);
    const { width: startWidth, height: startHeight } = getElementDimensions(el);
    const startCenterX = el.x + startWidth / 2;const startCenterY = el.y + startHeight / 2;
    const onMove = (mv: MouseEvent) => {
      const deltaX = mv.clientX - startX;const ns = Math.max(0.2, Math.min(maxScale, startScale + deltaX / 80));
      setElements(prev => prev.map(item => {
        if (item.id !== el.id) return item;
        const upd = { ...item, scale: ns };
        if (imgSize.width > 0) {
          const { width: ew, height: eh } = getElementDimensions(upd);
          const area = getPrintAreaForProduct(selectedProduct.id, upd.view);
          const xMin=(area.xMin/100)*imgSize.width,xMax=(area.xMax/100)*imgSize.width,yMin=(area.yMin/100)*imgSize.height,yMax=(area.yMax/100)*imgSize.height;
          let newX=startCenterX-ew/2,newY=startCenterY-eh/2;
          if(newX<xMin)newX=xMin;if(newX+ew>xMax)newX=xMax-ew;if(newY<yMin)newY=yMin;if(newY+eh>yMax)newY=yMax-eh;
          return{...upd,x:newX,y:newY};
        }return upd;
      }));
    };
    const onUp=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);pushHistory(elements);};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
  };

  const handleResizeTouchStart = (e: React.TouchEvent, el: DesignElement) => {
    e.stopPropagation();
    const startX=e.touches[0].clientX;const startScale=el.scale;
    const maxScale=getMaxScaleForElement(el,imgSize.width,imgSize.height,selectedProduct.id);
    const{width:startWidth,height:startHeight}=getElementDimensions(el);
    const startCenterX=el.x+startWidth/2;const startCenterY=el.y+startHeight/2;
    const onMove=(mv:TouchEvent)=>{
      const deltaX=mv.touches[0].clientX-startX;const ns=Math.max(0.2,Math.min(maxScale,startScale+deltaX/80));
      setElements(prev=>prev.map(item=>{
        if(item.id!==el.id)return item;const upd={...item,scale:ns};
        if(imgSize.width>0){const{width:ew,height:eh}=getElementDimensions(upd);const area=getPrintAreaForProduct(selectedProduct.id,upd.view);
          const xMin=(area.xMin/100)*imgSize.width,xMax=(area.xMax/100)*imgSize.width,yMin=(area.yMin/100)*imgSize.height,yMax=(area.yMax/100)*imgSize.height;
          let newX=startCenterX-ew/2,newY=startCenterY-eh/2;
          if(newX<xMin)newX=xMin;if(newX+ew>xMax)newX=xMax-ew;if(newY<yMin)newY=yMin;if(newY+eh>yMax)newY=yMax-eh;
          return{...upd,x:newX,y:newY};}return upd;
      }));
    };
    const onUp=()=>{window.removeEventListener('touchmove',onMove as any);window.removeEventListener('touchend',onUp);};
    window.addEventListener('touchmove',onMove as any,{passive:true});window.addEventListener('touchend',onUp);
  };

  const handleCanvasClick=(e:React.MouseEvent)=>{
    if(!(e.target as HTMLElement).closest('[data-element]')) {
      setSelectedElementId(null);
      setShowPrintArea(v => !v);
    }
  };

  const saveDesign=()=>{
    if(!designName.trim()){alert('Please enter a design name');return;}
    const d:SavedDesign={id:Date.now().toString(),name:designName,date:new Date().toLocaleString(),elements,productId:selectedProduct.id,categoryId:selectedCategory,printingMethod:selectedPrintingMethod,thumbnail:selectedProduct.images.front};
    const next=[...savedDesigns,d];setSavedDesigns(next);lsSet(LS_DESIGNS,next);setShowSaveDialog(false);setDesignName('');
  };

  const loadDesign=(d:SavedDesign)=>{
    setElementsState(d.elements);lsSet(LS_ELEMENTS,d.elements);
    const prod=productSets.find(p=>p.id===d.productId);
    if(prod){setSelectedProduct(prod);setSelectedCategory(prod.categoryId);}
    if(d.printingMethod)setSelectedPrintingMethod(d.printingMethod);
    setIsSavedDesignsOpen(false);pushHistory(d.elements);
  };

  const availableViews      = getAvailableViews();
  const currentViewElements = elements.filter(el=>el.view===selectedView&&el.visible!==false&&(!el.productId||el.productId===selectedProduct.id));
  const otherViewBadge      = elements.filter(el=>el.view!==selectedView&&el.visible!==false&&(!el.productId||el.productId===selectedProduct.id)).length;

  const renderMobilePanelContent=(tab:SidebarTab|null)=>{
    switch(tab){
      case 'categories': return <CategoriesPanel selectedGender={selectedGender} onSelectGender={handleGenderChange} selectedCategory={selectedCategory} onSelectCategory={cat=>{setSelectedCategory(cat.id);const p=getProductsByCategory(cat.id);if(p.length)setSelectedProduct(p[0]);}} onSelectProduct={setSelectedProduct} selectedProduct={selectedProduct} productsInCategory={getProductsByCategory(selectedCategory)} selectedPrintingMethod={selectedPrintingMethod} onSelectPrintingMethod={setSelectedPrintingMethod}/>;
      case 'upload': return <UploadPanel onUpload={uploadLogo} uploadedImages={uploadedImages} onPlaceImage={placeUploadedImage} onDeleteUpload={deleteUploadedImage} onDuplicateUpload={duplicateUploadedImage} elements={elements} embroidery={isEmbroideryMode}/>;
      case 'text':   return <TextPanel onAddText={addText} printingMethod={selectedPrintingMethod}/>;
      case 'art':    return <ArtworkPanel onAddEmoji={addEmoji} onAddNumber={addNumber} onAddArtwork={addArtwork} embroidery={isEmbroideryMode}/>;
      case 'names':  return <NamesPanel onAddName={addName} selectedProduct={selectedProduct} embroidery={isEmbroideryMode}/>;
      default: return null;
    }
  };

  const renderDesktopPanelContent=(tab:SidebarTab|null)=>{
    if(tab===null) return <WelcomePanel onSelect={setDesktopActiveTab} onSelectGender={handleGenderChange} selectedGender={selectedGender}/>;
    return renderMobilePanelContent(tab);
  };

  const titles: Record<SidebarTab,string> = { categories:'Products & Printing', product:'Products', upload:'Upload Image', text:'Add Text', art:'Artwork Library', names:'Add Names' };

  const sidebarIcons = [
    { id:'categories' as SidebarTab, imageIcon:'/custom-tool-t-shirt-mobile-logo/add-product.png',   label:'Product'  },
    { id:'upload'     as SidebarTab, imageIcon:'/custom-tool-t-shirt-mobile-logo/upload.png',     label:'Uploads'    },
    { id:'text'       as SidebarTab, imageIcon:'/custom-tool-t-shirt-mobile-logo/add-text.png',   label:'Add Text'  },
    { id:'art'        as SidebarTab, imageIcon:'/custom-tool-t-shirt-mobile-logo/add-art.png',   label:'Add Art'   },
    { id:'names'      as SidebarTab, imageIcon:'/custom-tool-t-shirt-mobile-logo/names.png', label:'Add Name' },
  ];

  const mobileNavItems: Array<{ id: SidebarTab | 'views'; imageIcon: string; label: string; isViews?: boolean; isSpecial?: boolean }> = [
    { id:'categories', imageIcon:'/custom-tool-t-shirt-mobile-logo/product.png',   label:''  },
    { id:'upload',     imageIcon:'/custom-tool-t-shirt-mobile-logo/upload.png',     label:''  },
    { id:'text',       imageIcon:'/custom-tool-t-shirt-mobile-logo/add-text.png',   label:''  },
    { id:'art',        imageIcon:'/custom-tool-t-shirt-mobile-logo/add-art.png',   label:''  },
    { id:'names',      imageIcon:'/custom-tool-t-shirt-mobile-logo/names.png', label:''  },
  ];

  const renderElements=(viewElems:DesignElement[])=>viewElems.map(el=>(
    <ElementWithHandles key={el.id} el={el} isSelected={selectedElementId===el.id}
      onMouseDown={e=>{e.stopPropagation();handleMouseDown(e,el.id);}}
      onTouchStart={e=>{e.stopPropagation();handleMouseDown(e,el.id);}}
      onClick={e=>{e.stopPropagation();setSelectedElementId(el.id);}}
      onDelete={e=>{e.stopPropagation();removeElement(el.id);}}
      onDuplicate={e=>{e.stopPropagation();duplicateElement(el.id);}}
      onRotateStart={e=>handleRotateStart(e,el)}
      onResizeStart={e=>handleResizeStart(e,el)}
      onResizeTouchStart={e=>handleResizeTouchStart(e,el)}
      onUpdateProp={updateElementProperty}
      embroidery={isEmbroideryMode}
    />
  ));

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
            {isEmbroideryMode && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-full px-2.5 py-1">
                🧵 Embroidery Mode
              </span>
            )}
            <div className="hidden lg:flex gap-2">
              <button onClick={undo} className="p-2 hover:bg-gray-100 rounded-lg" title="Undo"><Undo size={18}/></button>
              <button onClick={redo} className="p-2 hover:bg-gray-100 rounded-lg" title="Redo"><Redo size={18}/></button>
              <button onClick={()=>setShowPrintArea(v=>!v)} className={`p-2 rounded-lg ${showPrintArea?'bg-blue-100 text-blue-600':'hover:bg-gray-100'}`} title={showPrintArea ? 'Hide print area' : 'Show print area'}><Crop size={18}/></button>
              <button onClick={()=>setIsSavedDesignsOpen(true)} className="px-2.5 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-1"><Layers size={16}/><span className="hidden sm:inline text-xs font-medium">Designs</span></button>
              <button onClick={()=>setShowSaveDialog(true)} className="px-2.5 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"><Save size={16}/><span className="hidden sm:inline text-xs font-medium">Save</span></button>
              <button onClick={handleOpenSwapModal} className="px-2.5 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-1" title="Swap product type"><ArrowLeftRight size={16}/><span className="hidden sm:inline text-xs font-medium">Swap Category</span></button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex lg:hidden gap-1">
              <button onClick={undo} className="p-2 hover:bg-gray-100 rounded-lg"><Undo size={16}/></button>
              <button onClick={redo} className="p-2 hover:bg-gray-100 rounded-lg"><Redo size={16}/></button>
              <button onClick={()=>setShowPrintArea(v=>!v)} className={`p-2 rounded-lg ${showPrintArea?'bg-blue-100 text-blue-600':'hover:bg-gray-100'}`}><Crop size={16}/></button>
            </div>
            <button onClick={()=>setIsSavedDesignsOpen(true)} className="lg:hidden px-2.5 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-1"><Layers size={16}/><span className="hidden sm:inline text-xs font-medium">Designs</span></button>
            <button onClick={()=>setShowSaveDialog(true)} className="lg:hidden px-2.5 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"><Save size={16}/><span className="hidden sm:inline text-xs font-medium">Save</span></button>
            <button onClick={handleOpenSwapModal} className="lg:hidden px-2.5 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-1" title="Swap product type"><ArrowLeftRight size={16}/><span className="hidden sm:inline text-xs font-medium">Swap</span></button>
            <button onClick={()=>setMobileSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu size={20} className="text-gray-600"/></button>
          </div>
        </div>
        {isEmbroideryMode && (
          <div className="sm:hidden px-4 pb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-full px-2.5 py-1">
              🧵 Embroidery Mode
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">

        {/* Desktop Left Sidebar */}
        <div className="hidden lg:flex absolute left-4 top-4 bottom-0 my-auto z-40 items-start gap-3">
          <div className="flex flex-col w-[100px] bg-[#000] h-[666px] rounded-xl shadow-lg overflow-hidden flex-shrink-0" style={{ maxHeight:600 }}>
            <div className="flex flex-col items-center py-18 gap-4">
              {sidebarIcons.map(icon=><SidebarIcon key={icon.id} imageIcon={icon.imageIcon} active={desktopActiveTab === icon.id} size={65} onClick={() => setDesktopActiveTab(prev => prev === icon.id ? null : icon.id)} label={''}/>)}
            </div>
          </div>
          <div className="w-[420px] h-[666px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col flex-shrink-0" style={{ maxHeight:600 }}>
            <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0">
              <span className="font-semibold text-gray-800">{desktopActiveTab===null?'Design Studio':titles[desktopActiveTab as SidebarTab]}</span>
              {desktopActiveTab!==null && <button onClick={()=>setDesktopActiveTab(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-500"/></button>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ maxHeight:538 }}>{renderDesktopPanelContent(desktopActiveTab)}</div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col items-center justify-start lg:justify-center overflow-hidden min-h-0">
          {isEmbroideryMode && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-semibold shadow">
                🧵 Embroidery preview — text &amp; images shown as stitched thread
              </div>
            </div>
          )}
          {!isEmbroideryMode && !showPrintArea && currentViewElements.length > 0 && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-medium">
                <Eye size={12} /> Tap shirt to show print area
              </div>
            </div>
          )}
          <div ref={canvasRef} className="relative flex-shrink-0 flex items-center justify-center w-full" onClick={handleCanvasClick}>
            {isMobile ? (
              <div className="relative flex flex-col items-center w-full">
                <div className="relative flex items-center justify-center w-full">
                  <button onClick={e=>{e.stopPropagation();navigateView('prev');}} className="absolute left-1 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-md hover:bg-white active:scale-90 transition" style={{ top:'50%', transform:'translateY(-50%)' }}>
                    <ChevronLeft size={18} className="text-gray-700" />
                  </button>
                  <div className="relative">
                    <br/>
                    <img ref={canvasImgRef} src={selectedProduct.images[selectedView]} alt={selectedView} onLoad={measureImage} draggable={false} className="select-none block" style={{ width:'100vw', maxHeight:'calc(100vh - 270px)', objectFit:'contain', pointerEvents:'none' }}/>
                    {showPrintArea && <div className="absolute inset-0 pointer-events-none"><PrintAreaOverlay view={selectedView} productId={selectedProduct.id}/></div>}
                    {imgSize.width>0 && <div className="absolute pointer-events-none" style={{ left:0, top:0, width:imgSize.width, height:imgSize.height, overflow:'visible' }}>{renderElements(currentViewElements)}</div>}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-semibold capitalize pointer-events-none">{selectedView}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();navigateView('next');}} className="absolute right-1 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-md hover:bg-white active:scale-90 transition" style={{ top:'50%', transform:'translateY(-50%)' }}>
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {availableViews.map(v => (
                    <button key={v} onClick={() => setSelectedView(v)} className={`transition-all rounded-full ${selectedView===v?'w-5 h-2 bg-indigo-500':'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
                  ))}
                </div>
              </div>
            ) : (
              (() => {
                const activePair=viewPairs.find(pair=>pair.includes(selectedView))??viewPairs[0];
                return (
                  <div className="flex items-center justify-center gap-6">
                    {activePair.map(view=>{
                      const imgSrc=selectedProduct.images[view];if(!imgSrc)return null;
                      const isActiveView=view===selectedView;
                      const viewElems=elements.filter(el=>el.view===view&&el.visible!==false&&(!el.productId||el.productId===selectedProduct.id));
                      const thisViewSize=isActiveView?imgSize:viewImgSizes[view];
                      return (
                        <div key={view} className="relative flex flex-col items-center" style={{ transform:VIEW_TRANSLATE_X[view] }} onClick={()=>{ if(!isActiveView)setSelectedView(view); }}>
                          <div className="relative">
                            <img ref={el=>{ if(isActiveView){(canvasImgRef as any).current=el;}else{viewImgRefs.current[view]=el;} }} src={imgSrc} alt={view} onLoad={()=>{ if(isActiveView)measureImage(); measureAllViews(); }} draggable={false} className="select-none block" style={{ width:isTablet?'35vw':'27vw', maxHeight:'calc(100vh - 64px)', objectFit:'contain', pointerEvents:'none' }}/>
                            {isActiveView&&showPrintArea&&<div className="absolute inset-0 pointer-events-none"><PrintAreaOverlay view={view} productId={selectedProduct.id}/></div>}
                            {!isActiveView&&showPrintArea&&viewElems.length>0&&(()=>{ const area=getPrintAreaForProduct(selectedProduct.id,view); return <div className="absolute pointer-events-none border border-dashed border-blue-300 rounded-lg opacity-50" style={{ left:`${area.xMin}%`,top:`${area.yMin}%`,width:`${area.xMax-area.xMin}%`,height:`${area.yMax-area.yMin}%` }}/>; })()}
                            {thisViewSize&&thisViewSize.width>0&&viewElems.length>0&&(
                              <div className="absolute" style={{ left:0,top:0,width:thisViewSize.width,height:thisViewSize.height,overflow:'visible',pointerEvents:'none' }}>
                                {viewElems.map(el=>(
                                  <ElementWithHandles key={el.id} el={el} isSelected={isActiveView&&selectedElementId===el.id}
                                    onMouseDown={e=>{ if(isActiveView){e.stopPropagation();handleMouseDown(e,el.id);} }}
                                    onTouchStart={e=>{ if(isActiveView){e.stopPropagation();handleMouseDown(e,el.id);} }}
                                    onClick={e=>{ if(isActiveView){e.stopPropagation();setSelectedElementId(el.id);}else{setSelectedView(view);} }}
                                    onDelete={e=>{e.stopPropagation();removeElement(el.id);}}
                                    onDuplicate={e=>{e.stopPropagation();duplicateElement(el.id);}}
                                    onRotateStart={e=>handleRotateStart(e,el)}
                                    onResizeStart={e=>handleResizeStart(e,el)}
                                    onResizeTouchStart={e=>handleResizeTouchStart(e,el)}
                                    onUpdateProp={updateElementProperty}
                                    embroidery={isEmbroideryMode}
                                  />
                                ))}
                              </div>
                            )}
                            {!isActiveView&&viewElems.length>0&&<div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">{viewElems.length}</div>}
                          </div>
                          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${isActiveView?'bg-blue-500 text-white':'bg-black/40 text-white'}`}>{view}</div>
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
                {viewPairs.map(pair=>{
                  const isPairActive=pair.includes(selectedView);
                  return (
                    <div key={pair.join('-')} className={`w-full p-2 rounded-xl transition-all border-2 ${isPairActive?'bg-blue-50 border-blue-500':'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}>
                      <div className="grid grid-cols-2 gap-2">
                        {pair.map(view=>{ const isActive=view===selectedView;
                          const cnt=elements.filter(el=>el.view===view&&el.visible!==false&&(!el.productId||el.productId===selectedProduct.id)).length;
                          return <button key={view} onClick={()=>setSelectedView(view)} className={`relative rounded-lg overflow-hidden transition-all ${isActive?'ring-2 ring-blue-500 ring-offset-1':'opacity-70 hover:opacity-100'}`}><img src={selectedProduct.images[view]} alt={view} className="w-full h-30 rounded-lg" style={{ objectFit:'contain',display:'block' }}/><div className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold whitespace-nowrap ${isActive?'bg-blue-500':'bg-black/60'}`}>{view}</div>{cnt>0&&<div className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cnt}</div>}</button>; })}
                      </div>
                      <div className="text-xs text-gray-400 text-center mt-1 capitalize">{pair.join(' / ')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <ProductSpecsCard product={selectedProduct} selectedPrintingMethod={selectedPrintingMethod} onLearnMore={() => setShowSpecsModal(true)}/>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden flex-shrink-0 fixed bottom-0 left-0 right-0 z-50"
        style={{ height:60, background:'rgba(0, 0, 0, 0.92)', paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
        <div style={{ display:'flex', height:'100%' }}>
          {mobileNavItems.map(item => {
            const isViews=!!item.isViews;const tabId=item.id as SidebarTab;const isActive=!isViews&&mobileSheetTab===tabId;const badge=isViews&&otherViewBadge>0?otherViewBadge:undefined;
            return (<MobileBottomNavItem key={item.id} label={item.label} imageIcon={item.imageIcon} active={isActive} badge={badge} isSpecial={item.isSpecial} onClick={()=>{ if(isViews){setMobileSheetTab(null);setMobileViewsOpen(true);}else{setMobileSheetTab(prev=>prev===tabId?null:tabId);} }}/>);
          })}
        </div>
      </div>

      {/* Mobile Sheet Panels */}
      {sidebarIcons.map(tab => (
        <MobileSheetPanel key={tab.id} open={mobileSheetTab===tab.id} title={titles[tab.id]} onClose={closeMobileSheet}>
          {renderMobilePanelContent(tab.id)}
        </MobileSheetPanel>
      ))}

      {/* Mobile Views Sheet */}
      <MobileSheetPanel open={mobileViewsOpen} title="Switch View" onClose={()=>setMobileViewsOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          {availableViews.map(v=>(
            <button key={v} onClick={()=>{setSelectedView(v);setMobileViewsOpen(false);}} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${selectedView===v?'border-indigo-500 bg-indigo-50':'border-gray-200 bg-white'}`}>
              <img src={selectedProduct.images[v]} alt={v} className="w-full h-24 object-contain rounded-lg mb-2"/>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold capitalize ${selectedView===v?'text-indigo-600':'text-gray-700'}`}>{v}</span>
                {selectedView===v&&<span className="text-indigo-500 text-xs">✔</span>}
              </div>
              {elements.filter(el=>el.view===v&&el.visible!==false&&(!el.productId||el.productId===selectedProduct.id)).length>0&&<div className="text-xs text-indigo-500 mt-1">{elements.filter(el=>el.view===v&&el.visible!==false&&(!el.productId||el.productId===selectedProduct.id)).length} element(s)</div>}
            </button>
          ))}
        </div>
      </MobileSheetPanel>

      {/* Mobile Sidebar (Hamburger) */}
      <MobileSidebarPanel open={mobileSidebarOpen} onClose={()=>setMobileSidebarOpen(false)}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
          <div><h2 className="text-white font-bold text-lg">Product Studio</h2><p className="text-blue-100 text-xs">Customize your product</p></div>
          <button onClick={()=>setMobileSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20"><X size={18} className="text-white"/></button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Product</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl ${selectedProduct.previewColor} ${selectedProduct.borderColor} border shadow-sm`}/>
              <div className="flex-1"><div className="font-semibold text-gray-800">{selectedProduct.name}</div><div className="text-xs text-gray-500">{selectedProduct.gsm} GSM · {selectedProduct.material}</div></div>
            </div>
            <button onClick={() => { setMobileSidebarOpen(false); setShowSpecsModal(true); }} className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition">
              <Info size={12} />Learn More about this product
            </button>
          </div>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {sidebarIcons.map(icon=>(
                <button key={icon.id} onClick={()=>{setMobileSidebarOpen(false);setMobileSheetTab(icon.id);}} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition group">
                  <img src={icon.imageIcon} alt={icon.label} className="w-6 h-6 object-contain opacity-70 group-hover:opacity-100 transition"/>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{icon.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Actions</h3>
            <div className="space-y-2">
              <button onClick={()=>{setShowSaveDialog(true);setMobileSidebarOpen(false);}} className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"><Save size={18}/><span className="text-sm font-medium">Save Design</span></button>
              <button onClick={()=>{setIsSavedDesignsOpen(true);setMobileSidebarOpen(false);}} className="w-full flex items-center gap-3 p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"><Layers size={18}/><span className="text-sm font-medium">My Designs</span></button>
              <button onClick={()=>{setShowSwapModal(true);setMobileSidebarOpen(false);}} className="w-full flex items-center gap-3 p-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition"><ArrowLeftRight size={18}/><span className="text-sm font-medium">Swap Product Type</span></button>
              <button onClick={()=>{setShowPrintArea(!showPrintArea);setMobileSidebarOpen(false);}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${showPrintArea?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}><Crop size={18}/><span className="text-sm font-medium">{showPrintArea?'Hide':'Show'} Print Area</span></button>
              <button onClick={()=>{if(confirm('Clear all elements from current view on this product?')){const remaining=elements.filter(el=>!(el.view===selectedView&&(!el.productId||el.productId===selectedProduct.id)));setElements(remaining);pushHistory(remaining);}setMobileSidebarOpen(false);}} className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition"><Trash2 size={18}/><span className="text-sm font-medium">Clear Current View</span></button>
            </div>
          </div>
          {currentViewElements.length>0&&(
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Elements ({currentViewElements.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentViewElements.map(el=>(
                  <div key={el.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {el.type==='text'&&<Type size={14} className="text-blue-500 flex-shrink-0"/>}
                      {el.type==='emoji'&&<Smile size={14} className="text-yellow-500 flex-shrink-0"/>}
                      {el.type==='number'&&<Hash size={14} className="text-green-500 flex-shrink-0"/>}
                      {(el.type==='logo'||el.type==='artwork')&&<ImageIcon size={14} className="text-purple-500 flex-shrink-0"/>}
                      <span className="text-sm text-gray-600 truncate">{el.content||el.type}</span>
                    </div>
                    <button onClick={()=>{setEditingElement(el);setTempScale(el.scale);setTempRotation(el.rotation);setTempOpacity(el.opacity??1);setIsEditModalOpen(true);setMobileSidebarOpen(false);}} className="text-xs text-blue-600 px-2 py-1 hover:bg-blue-50 rounded">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between text-xs text-gray-500"><span>Total: {elements.filter(el=>!el.productId||el.productId===selectedProduct.id).length} elements</span><span className="capitalize">View: {selectedView}</span></div>
        </div>
      </MobileSidebarPanel>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&uploadLogo(e.target.files[0])} className="hidden"/>

      {/* Edit Modal */}
      {isEditModalOpen&&editingElement&&(
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[1100] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full"/></div>
            <div className="border-b px-4 py-3 flex justify-between items-center flex-shrink-0"><h2 className="text-lg font-bold">Edit {editingElement.type.charAt(0).toUpperCase()+editingElement.type.slice(1)}</h2><button onClick={()=>setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><X size={16}/></button></div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4" style={{ WebkitOverflowScrolling:'touch' }}>
              {isEmbroideryMode && (
                <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  🧵 <span>Embroidery mode is on — this element previews as stitched thread on the canvas.</span>
                </div>
              )}
              {(editingElement.type==='text'||editingElement.type==='number')&&(<>
                <div><label className="text-sm font-medium">Content</label><input value={editingElement.content} onChange={e=>updateElementProperty(editingElement.id,'content',e.target.value)} className="w-full p-2 border rounded-lg mt-1"/></div>
                <div><label className="text-sm font-medium">Color</label><input type="color" value={editingElement.color??'#000000'} onChange={e=>updateElementProperty(editingElement.id,'color',e.target.value)} className="w-full h-10 rounded mt-1 cursor-pointer"/></div>
                <div><label className="text-sm font-medium">Font Size: {editingElement.fontSize}px</label><input type="range" min="12" max="120" value={editingElement.fontSize} onChange={e=>updateElementProperty(editingElement.id,'fontSize',+e.target.value)} className="w-full mt-1"/></div>
                <div><label className="text-sm font-medium">Font</label><select value={editingElement.fontFamily} onChange={e=>updateElementProperty(editingElement.id,'fontFamily',e.target.value)} className="w-full p-2 border rounded-lg mt-1">{fontOptions.map(f=><option key={f.value} value={f.value}>{f.name}</option>)}</select></div>
                <div className="flex gap-2">
                  <button
                    onClick={()=>!isEmbroideryMode && updateElementProperty(editingElement.id,'isBold',!editingElement.isBold)}
                    disabled={isEmbroideryMode}
                    title={isEmbroideryMode ? 'Embroidery text is always bold' : undefined}
                    className={`flex-1 py-2 rounded ${(isEmbroideryMode || editingElement.isBold)?'bg-blue-600 text-white':'bg-gray-200'} ${isEmbroideryMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                  ><Bold size={16} className="inline mr-1"/>Bold</button>
                  <button
                    onClick={()=>!isEmbroideryMode && updateElementProperty(editingElement.id,'isItalic',!editingElement.isItalic)}
                    disabled={isEmbroideryMode}
                    title={isEmbroideryMode ? "Italics can't be embroidered — disabled" : undefined}
                    className={`flex-1 py-2 rounded ${(!isEmbroideryMode && editingElement.isItalic)?'bg-blue-600 text-white':'bg-gray-200'} ${isEmbroideryMode ? 'opacity-40 cursor-not-allowed' : ''}`}
                  ><Italic size={16} className="inline mr-1"/>Italic</button>
                </div>
              </>)}
              <div><label className="text-sm font-medium">Scale: {tempScale.toFixed(1)}x</label><input type="range" min="0.3" max={getMaxScaleForElement(editingElement,imgSize.width,imgSize.height,selectedProduct.id)} step="0.1" value={tempScale} onChange={e=>{setTempScale(+e.target.value);updateElementProperty(editingElement.id,'scale',+e.target.value);}} className="w-full mt-1"/></div>
              <div><label className="text-sm font-medium">Rotation: {tempRotation}°</label><input type="range" min="0" max="360" value={tempRotation} onChange={e=>{setTempRotation(+e.target.value);updateElementProperty(editingElement.id,'rotation',+e.target.value);}} className="w-full mt-1"/></div>
              <div><label className="text-sm font-medium">Opacity: {Math.round(tempOpacity*100)}%</label><input type="range" min="0" max="1" step="0.01" value={tempOpacity} onChange={e=>{setTempOpacity(+e.target.value);updateElementProperty(editingElement.id,'opacity',+e.target.value);}} className="w-full mt-1"/></div>
              <div className="flex gap-2">
                <button onClick={()=>toggleBlackWhite(editingElement.id)} className={`flex-1 py-2 rounded ${editingElement.isBlackWhite?'bg-gray-800 text-white':'bg-gray-200'}`}><Filter size={16} className="inline mr-1"/>B&amp;W</button>
                <button onClick={()=>bringToFront(editingElement.id)} className="flex-1 py-2 bg-indigo-600 text-white rounded">Front</button>
                <button onClick={()=>{duplicateElement(editingElement.id);setIsEditModalOpen(false);}} className="flex-1 py-2 bg-yellow-600 text-white rounded"><Copy size={16} className="inline"/></button>
              </div>
              <button onClick={()=>{removeElement(editingElement.id);setIsEditModalOpen(false);}} className="w-full py-2 bg-red-600 text-white rounded flex items-center justify-center gap-2"><Trash2 size={16}/>Delete</button>
            </div>
            <div className="border-t p-4 flex-shrink-0"><button onClick={()=>setIsEditModalOpen(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold">Done</button></div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog&&(
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[1100] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full"/></div>
            <div className="border-b p-4"><h2 className="text-lg font-bold">Save Your Design</h2></div>
            <div className="p-4">
              <input value={designName} onChange={e=>setDesignName(e.target.value)} placeholder="Design name…" className="w-full p-3 border rounded-xl mb-4 text-base" autoFocus onKeyDown={e=>e.key==='Enter'&&saveDesign()}/>
              <div className="flex gap-2">
                <button onClick={()=>setShowSaveDialog(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button onClick={saveDesign} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Designs Modal */}
      {isSavedDesignsOpen&&(
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[1100] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight:'85vh' }}>
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full"/></div>
            <div className="border-b p-4 flex justify-between items-center flex-shrink-0"><h2 className="text-lg font-bold">My Saved Designs</h2><button onClick={()=>setIsSavedDesignsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><X size={16}/></button></div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4" style={{ WebkitOverflowScrolling:'touch' }}>
              {savedDesigns.length===0?<p className="text-center text-gray-500 py-8">No saved designs yet</p>:(
                <div className="space-y-2">
                  {savedDesigns.map(d=>(
                    <div key={d.id} className="flex items-center justify-between p-3 border rounded-xl">
                      <div><p className="font-medium">{d.name}</p><p className="text-xs text-gray-500">{d.date}</p></div>
                      <div className="flex gap-2">
                        <button onClick={()=>loadDesign(d)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Load</button>
                        <button onClick={()=>{const u=savedDesigns.filter(x=>x.id!==d.id);setSavedDesigns(u);lsSet(LS_DESIGNS,u);}} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm">Del</button>
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
      {showSpecsModal && (
        <ProductSpecsModal product={selectedProduct} selectedPrintingMethod={selectedPrintingMethod} onClose={() => setShowSpecsModal(false)} />
      )}

      {/* Swap Product Modal — Accessories / Sports Wear */}
      {showSwapModal && (
        <SwapProductModal onClose={() => setShowSwapModal(false)} onNavigate={handleSwapNavigate} />
      )}

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

// ═══════════════════════════════════════════════════════════════════════════════
// Default export — wraps the page in Suspense because useSearchParams() requires it
// under the Next.js App Router.
// ═══════════════════════════════════════════════════════════════════════════════
export default function CustomizedToolPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-gray-50 text-sm text-gray-400">Loading design…</div>}>
      <CustomizedToolPageContent />
    </Suspense>
  );
}