// app/lib/delhivery.ts

function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

export async function createDelhiveryOrder(order: any): Promise<any> {
  const token = process.env.DELHIVERY_API_TOKEN;

  console.log(
    "[Delhivery] Function called. Token present:",
    !!token,
    token ? `(${maskToken(token)})` : ""
  );

  if (!token) {
    console.error("[Delhivery] ❌ Token is missing from env");
    throw new Error("DELHIVERY_API_TOKEN is not set");
  }

  const baseUrl =
    process.env.DELHIVERY_ENV?.toLowerCase() === "production"
      ? "https://track.delhivery.com"
      : "https://staging-express.delhivery.com";

  const pickupName = process.env.DELHIVERY_PICKUP_NAME;
  if (!pickupName) {
    console.warn(
      "[Delhivery] ⚠️ DELHIVERY_PICKUP_NAME is not set — falling back to 'Primary', " +
        "which will fail unless that exact warehouse name exists in your Delhivery account."
    );
  }
const sku = order.color_sku ?? order.product_sku ?? null;
  const shipmentPayload = {
    shipments: [
      {
        name: order.customer_name,
        add: [order.address_line1, order.address_line2]
          .filter(Boolean)
          .join(", "),
        pin: String(order.address_pincode),
        city: order.address_city,
        state: order.address_state,
        country: "India",
        phone: String(order.customer_phone),
        order: order.order_ref,
        payment_mode: order.payment_mode === "cod" ? "COD" : "Prepaid",
        return_pin: process.env.DELHIVERY_RETURN_PINCODE ?? "",
        return_city: process.env.DELHIVERY_RETURN_CITY ?? "",
        return_phone: process.env.DELHIVERY_RETURN_PHONE ?? "",
        return_name: process.env.DELHIVERY_RETURN_NAME ?? "",
        return_add: process.env.DELHIVERY_RETURN_ADDRESS ?? "",
        return_state: process.env.DELHIVERY_RETURN_STATE ?? "",
        return_country: "India",
       products_desc: sku ? `${order.product_name} (SKU: ${sku})` : order.product_name,
        hsn_code: "",
        cod_amount: order.payment_mode === "cod" ? String(order.cod_due_amount ?? 0) : "0",
        order_date: new Date(order.created_at ?? Date.now())
          .toISOString()
          .split("T")[0],
        total_amount: String(order.grand_total),
        seller_add: process.env.DELHIVERY_SELLER_ADDRESS ?? "",
        seller_name: process.env.DELHIVERY_SELLER_NAME ?? "",
        seller_inv: order.order_ref,
        quantity: String(order.quantity),
        waybill: "",
        shipment_width: process.env.DELHIVERY_WIDTH ?? "10",
        shipment_height: process.env.DELHIVERY_HEIGHT ?? "10",
        weight: process.env.DELHIVERY_WEIGHT ?? "500",
        seller_gst_tin: process.env.DELHIVERY_GST ?? "",
        shipping_mode: "Surface",
        address_type: "home",
      },
    ],
    pickup_location: {
      name: pickupName ?? "Primary",
    },
  };

  const body = new URLSearchParams();
  body.append("format", "json");
  body.append("data", JSON.stringify(shipmentPayload));

  console.log("[Delhivery] Endpoint:", `${baseUrl}/api/cmu/create.json`);
  console.log(
    "[Delhivery] Payload (order ref):",
    order.order_ref,
    "| pickup:",
    shipmentPayload.pickup_location.name
  );

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
  } catch (networkErr: any) {
    console.error("[Delhivery] Network error calling API:", networkErr);
    throw new Error(`Delhivery network error: ${networkErr.message}`);
  }

  const text = await response.text();
  console.log("[Delhivery] Status:", response.status);
  console.log("[Delhivery] Raw response:", text);

  // Delhivery can return HTTP 200 even on a logical failure
  // (e.g. bad pickup_location, invalid pincode), so we still need
  // to check the body for error/success flags.
  if (!response.ok) {
    throw new Error(`Delhivery API error ${response.status}: ${text}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Delhivery returned a non-JSON response: ${text}`);
  }

  if (parsed?.error === true || parsed?.success === false) {
    const reason = parsed?.rmk ?? JSON.stringify(parsed);
    throw new Error(`Delhivery order creation failed: ${reason}`);
  }

  return parsed;
}