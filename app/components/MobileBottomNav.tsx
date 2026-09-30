// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { FaHome, FaStore, FaPrint, FaUsers, FaPaintBrush } from 'react-icons/fa';

// export default function MobileBottomNav() {
//   const pathname = usePathname();

//   // Hide on specific route
//   if (pathname === '/customized-your-t-shirt') {
//     return null;
//   }

//   return (
//     <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-white border-t border-gray-200 shadow-lg">
//       <div className="flex items-center justify-around px-4 py-2">
//         <Link href="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-black transition-colors">
//           <FaHome className="w-5 h-5" />
//           <span className="text-xs">Home</span>
//         </Link>
//         <Link href="/shop" className="flex flex-col items-center gap-1 text-gray-600 hover:text-black transition-colors">
//           <FaStore className="w-5 h-5" />
//           <span className="text-xs">Shop</span>
//         </Link>
//         <Link href="/services" className="flex flex-col items-center gap-1 text-gray-600 hover:text-black transition-colors">
//           <FaPrint className="w-5 h-5" />
//           <span className="text-xs">Services</span>
//         </Link>
//         <Link href="/community" className="flex flex-col items-center gap-1 text-gray-600 hover:text-black transition-colors">
//           <FaUsers className="w-5 h-5" />
//           <span className="text-xs">Community</span>
//         </Link>
//         <Link href="/customize" className="flex flex-col items-center gap-1 text-gray-600 hover:text-black transition-colors">
//           <FaPaintBrush className="w-5 h-5" />
//           <span className="text-xs">Customize</span>
//         </Link>
//       </div>
//     </div>
//   );
// }

export default function MobileBottomNav() {
  return null;
}