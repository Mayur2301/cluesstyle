// PATH: app/admin/(protected)/orders/[orderRef]/label/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByRef, SHIPPING_PROVIDERS } from "@/app/lib/admin-orders";
import ShippingLabelPrint, { type ShippingLabelOrder } from "./ShippingLabelPrint";

export default async function ShippingLabelPage({
  params,
}: {
  params: Promise<{ orderRef: string }>;
}) {
  const { orderRef } = await params;
  const order = await getOrderByRef(orderRef);

  if (!order) notFound();

  // The label needs an actual courier + AWB number to be worth printing —
  // without them there's nothing to put in the barcode or the top bar.
  // Send the admin back to save those first instead of printing a
  // half-empty label.
  if (!order.shipping_provider || !order.awb_number) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <p className="text-base font-bold text-gray-900 mb-1.5">Nothing to print yet</p>
          <p className="text-sm text-gray-500 mb-5">
            Save the courier and AWB number in the order&apos;s Shipping section first — the label needs both.
          </p>
          <Link
            href={`/admin/orders/${orderRef}#shipping`}
            className="inline-block text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg px-4 py-2"
          >
            Go to Shipping section
          </Link>
        </div>
      </div>
    );
  }

  const courierLabel =
    SHIPPING_PROVIDERS.find((p) => p.value === order.shipping_provider)?.label ?? order.shipping_provider;

  const labelOrder: ShippingLabelOrder = {
    orderRef: order.order_ref,
    courierLabel,
    awbNumber: order.awb_number,
    trackingLink: order.tracking_link,
    deliveryType: order.delivery_type,
    paymentMode: order.payment_mode,
    codDueAmount: Number(order.cod_due_amount ?? 0),
    createdAt: order.created_at,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    addressLine1: order.address_line1,
    addressLine2: order.address_line2,
    addressCity: order.address_city,
    addressState: order.address_state,
    addressPincode: order.address_pincode,
    productName: order.product_name,
    productSku: order.product_sku,
    selectedSize: order.selected_size,
    selectedColor: order.selected_color,
    quantity: Number(order.quantity ?? 1),
  };

  return <ShippingLabelPrint order={labelOrder} />;
}