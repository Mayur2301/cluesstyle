// app/services/screen-printing/t-shirt/[slug]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Product data (same as above - you can import from a shared file)
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceLabel: string;
  img: string;
  quantityReq: number;
  priceRange: "budget" | "mid" | "premium";
  category: string;
  description?: string;
  features?: string[];
  material?: string;
  turnaround?: string;
}

const productsData: Product[] = [
  {
    id: "1",
    name: "Basic T-shirt Print",
    slug: "basic-t-shirt-print",
    price: 499,
    priceLabel: "₹499",
    img: "/t-shirt-1.jpg",
    quantityReq: 10,
    priceRange: "budget",
    category: "tshirt",
    description: "High-quality screen printing on basic cotton t-shirts. Perfect for events, teams, and casual wear.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days"
  },
  {
    id: "2",
    name: "Premium Cotton Print",
    slug: "premium-cotton-print",
    price: 899,
    priceLabel: "₹899",
    img: "/t-shirt-2.jpg",
    quantityReq: 10,
    priceRange: "budget",
    category: "tshirt",
    description: "Superior quality printing on premium cotton fabric. Soft touch and long-lasting prints.",
    features: ["Premium Cotton", "Eco-friendly inks", "Soft touch finish", "Color fastness guaranteed"],
    material: "Premium Combed Cotton, 200 GSM",
    turnaround: "7-10 business days"
  },
  {
    id: "3",
    name: "Bulk Printing Pack",
    slug: "bulk-printing-pack",
    price: 4999,
    priceLabel: "₹4999",
    img: "/t-shirt-3.jpg",
    quantityReq: 50,
    priceRange: "mid",
    category: "bulk",
    description: "Special bulk pricing for large orders. Ideal for corporate events and merchandise.",
    features: ["Bulk discount pricing", "Custom packaging", "Free design support", "Express shipping available"],
    material: "Choice of fabric",
    turnaround: "10-14 business days"
  },
  {
    id: "4",
    name: "Hoodie Print",
    slug: "hoodie-print",
    price: 1299,
    priceLabel: "₹1299",
    img: "/products/hoodie.jpg",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Cozy hoodies with vibrant screen prints. Perfect for streetwear and brand merchandise.",
    features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
    material: "Cotton-polyester blend, 280 GSM",
    turnaround: "7-10 business days"
  },
  {
    id: "5",
    name: "Eco Hoodie Bundle",
    slug: "eco-hoodie-bundle",
    price: 2899,
    priceLabel: "₹2899",
    img: "/products/hoodie2.jpg",
    quantityReq: 50,
    priceRange: "mid",
    category: "hoodie",
    description: "Eco-friendly hoodies made from recycled materials. Sustainable printing options available.",
    features: ["Recycled materials", "Water-based inks", "Carbon-neutral shipping", "Eco-certified"],
    material: "Recycled Polyester Blend, 300 GSM",
    turnaround: "10-14 business days"
  },
  {
    id: "6",
    name: "Corporate Bulk Kit",
    slug: "corporate-bulk-kit",
    price: 8999,
    priceLabel: "₹8999",
    img: "/products/corporate.jpg",
    quantityReq: 100,
    priceRange: "premium",
    category: "corporate",
    description: "Complete corporate merchandise solution. Includes branding, packaging, and delivery.",
    features: ["End-to-end solution", "Premium packaging", "Brand consultation", "Pan India delivery"],
    material: "Premium selection",
    turnaround: "14-21 business days"
  },
  {
    id: "7",
    name: "Kids Custom Tee",
    slug: "kids-custom-tee",
    price: 399,
    priceLabel: "₹399",
    img: "/products/kids.jpg",
    quantityReq: 10,
    priceRange: "budget",
    category: "tshirt",
    description: "Fun and colorful prints for kids. Soft fabric perfect for sensitive skin.",
    features: ["Soft cotton", "Child-safe inks", "Vibrant colors", "Easy care"],
    material: "Soft Cotton, 160 GSM",
    turnaround: "5-7 business days"
  },
  {
    id: "8",
    name: "Premium Oversized Hoodie",
    slug: "premium-oversized-hoodie",
    price: 1999,
    priceLabel: "₹1999",
    img: "/products/premiumhoodie.jpg",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Trendy oversized hoodie with premium quality print. Streetwear essential.",
    features: ["Oversized fit", "Heavyweight fabric", "Embroidery option", "Multiple colors"],
    material: "Heavy Cotton, 350 GSM",
    turnaround: "7-10 business days"
  },
];

const getProductImage = (productName: string): string => {
  const imageMap: Record<string, string> = {
    "Basic T-shirt Print": "/products/tshirt1.jpg",
    "Premium Cotton Print": "/products/tshirt2.jpg",
    "Bulk Printing Pack": "/products/tshirt3.jpg",
    "Hoodie Print": "/products/hoodie.jpg",
    "Eco Hoodie Bundle": "/products/hoodie2.jpg",
    "Corporate Bulk Kit": "/products/corporate.jpg",
    "Kids Custom Tee": "/products/kids.jpg",
    "Premium Oversized Hoodie": "/products/premiumhoodie.jpg",
  };
  return imageMap[productName] || "/products/placeholder.jpg";
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [quantity, setQuantity] = useState(10);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const product = productsData.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link href="/services/screen-printing/hoodies-and-sweatshirt" className="mt-4 inline-block text-blue-600 underline">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const totalPrice = product.price * quantity;
  const bulkDiscount = quantity >= 100 ? 0.3 : quantity >= 50 ? 0.2 : quantity >= 25 ? 0.1 : 0;
  const discountedPrice = totalPrice * (1 - bulkDiscount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/services/screen-printing/hoodies-and-sweatshirt" className="inline-flex items-center gap-2 text-gray-600 hover:text-black">
            <i className="fas fa-arrow-left"></i> Back to Products
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[6px_6px_0px_#000]">
            <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={getProductImage(product.name)}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-black tracking-tight">{product.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                <span className="text-sm text-gray-500">per piece</span>
              </div>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Key Features:</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <i className="fas fa-check-circle text-green-600 text-xs"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Material:</span>
                <p className="font-medium">{product.material || "Premium Cotton"}</p>
              </div>
              <div>
                <span className="text-gray-500">Turnaround:</span>
                <p className="font-medium">{product.turnaround || "7-10 business days"}</p>
              </div>
              <div>
                <span className="text-gray-500">Min Quantity:</span>
                <p className="font-medium">{product.quantityReq}+ pieces</p>
              </div>
              <div>
                <span className="text-gray-500">Print Method:</span>
                <p className="font-medium">Screen Printing</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(product.quantityReq, quantity - 10))}
                  className="w-10 h-10 rounded-lg border-2 border-black bg-white flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.quantityReq, parseInt(e.target.value) || product.quantityReq))}
                  className="w-24 text-center border-2 border-gray-300 rounded-lg p-2 focus:border-black focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 10)}
                  className="w-10 h-10 rounded-lg border-2 border-black bg-white flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Subtotal ({quantity} pieces):</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {bulkDiscount > 0 && (
                <div className="flex justify-between text-green-600 mb-2">
                  <span>Bulk Discount ({bulkDiscount * 100}%):</span>
                  <span>-{formatPrice(totalPrice - discountedPrice)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span>{formatPrice(discountedPrice)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">*Excludes GST and shipping</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link
                href={`/customized-your-t-shirt`}
                className="flex-1 text-center rounded-lg border-2 border-black bg-black py-3 font-medium text-white transition-all hover:bg-white hover:text-black"
              >
                <i className="fas fa-paint-brush mr-2"></i> Customize Now
              </Link>
              <button className="flex-1 rounded-lg border-2 border-black bg-white py-3 font-medium transition-all hover:bg-black hover:text-white">
                <i className="fas fa-shopping-cart mr-2"></i> Order Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 flex justify-center gap-6 text-xs text-gray-500">
              <span><i className="fas fa-truck-fast mr-1"></i> Free Shipping*</span>
              <span><i className="fas fa-shield-alt mr-1"></i> Quality Guarantee</span>
              <span><i className="fas fa-headset mr-1"></i> 24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-black mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productsData.filter(p => p.id !== product.id).slice(0, 4).map((related) => (
              <Link
                key={related.id}
                href={`/services/screen-printing/hoodies-and-sweatshirt/${related.slug}`}
                className="group block"
              >
                <div className="rounded-xl border border-gray-200 bg-white p-3 transition-all hover:shadow-md">
                  <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={getProductImage(related.name)}
                      alt={related.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-2 font-bold text-sm">{related.name}</h3>
                  <p className="text-sm font-medium">{related.priceLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}