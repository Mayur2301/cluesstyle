// PATH: app/admin/(protected)/orders/[orderRef]/label/ShippingLabelPrint.tsx
"use client";

import { SELLER_NAME, SELLER_ADDRESS_LINES, SELLER_PHONE_DISPLAY } from "@/app/lib/company-info";
import { formatDate, formatDateTime, DELIVERY_TYPE_LABELS } from "@/app/admin/(protected)/_components/format";
import Barcode128 from "./Barcode128";
import QrCodeCanvas from "./QrCodeCanvas";

// Common Indian state/UT names (as this project stores them, see the
// address form on every ProductDetailClient) -> the 2-letter vehicle/GST
// code couriers print after "IN-" on their own labels (see reference:
// "IN-TS" for Telangana). Falls back to the first two letters of whatever
// was actually stored if a state isn't in this list, so an unusual entry
// never breaks the label.
const STATE_CODES: Record<string, string> = {
  "andhra pradesh": "AP", "arunachal pradesh": "AR", "assam": "AS", "bihar": "BR",
  "chhattisgarh": "CG", "goa": "GA", "gujarat": "GJ", "haryana": "HR",
  "himachal pradesh": "HP", "jharkhand": "JH", "karnataka": "KA", "kerala": "KL",
  "madhya pradesh": "MP", "maharashtra": "MH", "manipur": "MN", "meghalaya": "ML",
  "mizoram": "MZ", "nagaland": "NL", "odisha": "OD", "punjab": "PB",
  "rajasthan": "RJ", "sikkim": "SK", "tamil nadu": "TN", "telangana": "TS",
  "tripura": "TR", "uttar pradesh": "UP", "uttarakhand": "UK", "west bengal": "WB",
  "delhi": "DL", "jammu and kashmir": "JK", "ladakh": "LA", "puducherry": "PY",
  "chandigarh": "CH", "andaman and nicobar islands": "AN",
  "dadra and nagar haveli and daman and diu": "DN",
};
function stateCode(state: string): string {
  return STATE_CODES[state.trim().toLowerCase()] ?? state.trim().slice(0, 2).toUpperCase();
}

export interface ShippingLabelOrder {
  orderRef: string;
  courierLabel: string;
  awbNumber: string;
  trackingLink: string | null;
  deliveryType: "standard" | "sameday" | "pickup";
  paymentMode: "prepaid" | "cod";
  codDueAmount: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  productName: string;
  productSku: string | null;
  selectedSize: string | null;
  selectedColor: string | null;
  quantity: number;
}

export default function ShippingLabelPrint({ order }: { order: ShippingLabelOrder }) {
  const description = [order.productName, order.selectedSize, order.selectedColor].filter(Boolean).join(" · ");
  const qrValue = order.trackingLink || order.orderRef;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Screen-only toolbar — never printed */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Shipping Label — {order.orderRef}</p>
        <div className="flex items-center gap-2">
          <a
            href={`/admin/orders/${order.orderRef}`}
            className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3.5 py-2 hover:bg-gray-50"
          >
            ← Back to order
          </a>
          <button
            onClick={() => window.print()}
            className="text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg px-4 py-2"
          >
            Print label
          </button>
        </div>
      </div>

      {/* The label itself — sized to a standard 4in x 6in shipping label.
          On screen it sits centered with a drop shadow; in print, @page
          below makes it the entire page with no browser margins. */}
      <div className="flex justify-center py-6 print:py-0">
        <div
          className="bg-white border-2 border-black text-black shadow-lg print:shadow-none"
          style={{ width: "4in", fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          {/* Top bar: service type / courier / surface / payment mode */}
          <div className="flex border-b-2 border-black text-[10px] font-bold">
            <div className="w-10 flex items-center justify-center border-r-2 border-black py-1.5">STD</div>
            <div className="flex-1 flex items-center px-2 py-1.5 text-[11px]">{order.courierLabel}</div>
            <div className="w-16 flex items-center justify-center border-l-2 border-black py-1.5 tracking-wide">SURFACE</div>
            <div className="w-8 flex items-center justify-center border-l-2 border-black text-lg">
              {order.paymentMode === "cod" ? "C" : "P"}
            </div>
          </div>

          {/* Order ref row */}
          <div className="border-b-2 border-black px-2 py-1 text-[10px] font-semibold flex items-center justify-between">
            <span>Order: {order.orderRef}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${order.paymentMode === "cod" ? "bg-black text-white" : "border border-black"}`}>
              {order.paymentMode === "cod" ? `COD ₹${order.codDueAmount}` : "PREPAID"}
            </span>
          </div>

          {/* AWB barcode (left, vertical label like the reference) + QR (right) */}
          <div className="flex border-b-2 border-black">
            <div className="flex items-stretch border-r-2 border-black">
              <div className="flex items-center justify-center px-1 py-2 text-[9px] font-bold [writing-mode:vertical-rl] tracking-wide">
                AWB No. {order.awbNumber}
              </div>
              <div className="flex items-center justify-center px-1.5 py-2">
                <Barcode128 value={order.awbNumber} height={70} barWidth={1.3} />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-2">
              <QrCodeCanvas value={qrValue} size={90} />
            </div>
          </div>

          {/* Shipping / customer address */}
          <div className="border-b-2 border-black px-2 py-2 text-[11px] leading-tight">
            <p className="font-semibold mb-1">Shipping/Customer address:</p>
            <p className="font-bold">Name: {order.customerName}</p>
            <p>{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""},</p>
            <p>{order.addressCity},</p>
            <p>
              {order.addressState} - <span className="font-bold">{order.addressPincode}</span>, IN-{stateCode(order.addressState)}
            </p>
            <p className="mt-1">Ph: {order.customerPhone}</p>
          </div>

          {/* Order date / delivery type — stands in for the courier's own
              HBD/CPD (handover-by / courier-promised-delivery) dates,
              which only the actual courier's own system can generate. */}
          <div className="border-b-2 border-black px-2 py-1.5 text-[10px] font-semibold flex justify-between">
            <span>Order Date: {formatDate(order.createdAt)}</span>
            <span>{DELIVERY_TYPE_LABELS[order.deliveryType] ?? order.deliveryType}</span>
          </div>

          {/* Sold by — CluesStyle's own address, constant on every label */}
          <div className="border-b-2 border-black px-2 py-1.5 text-[9.5px] leading-tight">
            <p>
              <span className="font-bold">Sold By: {SELLER_NAME},</span> {SELLER_ADDRESS_LINES.join(" ")}
            </p>
            <p className="mt-0.5">Ph: {SELLER_PHONE_DISPLAY}</p>
          </div>

          {/* SKU table */}
          <table className="w-full border-b-2 border-black text-[10px]">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="w-6 text-left font-bold px-1.5 py-1 border-r-2 border-black">#</th>
                <th className="text-left font-bold px-1.5 py-1 border-r-2 border-black">SKU ID | Description</th>
                <th className="w-10 text-right font-bold px-1.5 py-1">QTY</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-1.5 py-1.5 border-r-2 border-black align-top">1</td>
                <td className="px-1.5 py-1.5 border-r-2 border-black align-top">
                  {order.productSku ? `${order.productSku} | ` : ""}{description}
                </td>
                <td className="px-1.5 py-1.5 text-right align-top">{order.quantity}</td>
              </tr>
            </tbody>
          </table>

          {/* Bottom barcode (order ref) + printed timestamp */}
          <div className="px-2 py-2 border-b-2 border-black">
            <p className="text-[9px] font-semibold mb-1">{order.orderRef}</p>
            <div className="flex justify-center">
              <Barcode128 value={order.orderRef} height={34} barWidth={1.1} />
            </div>
          </div>

          <div className="px-2 py-1.5 flex items-center justify-between text-[8.5px]">
            <span>Not for resale.</span>
            <span>Printed at {formatDateTime(new Date())}</span>
          </div>
        </div>
      </div>

      {/* Print-only page setup: no browser header/footer margins, and the
          label's own 4in width fills the page (height auto-grows to fit —
          most 4x6 label printers/rolls handle that fine; adjust the size
          below to "4in 6in" for a fixed-height label instead). */}
      <style jsx global>{`
        @media print {
          @page {
            size: 4in auto;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}