function toShiprocketDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizePhoneForShiprocket(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export async function createShiprocketOrder(order: any) {
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new Error(
      "Missing SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD env vars"
    );
  }
  if (!process.env.SHIPROCKET_PICKUP_LOCATION) {
    throw new Error(
      "Missing SHIPROCKET_PICKUP_LOCATION env var — must match a pickup address nickname in your Shiprocket dashboard (Settings > Pickup Addresses)"
    );
  }

  // Login to Shiprocket
  const authResponse = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    }
  );

  const authData = await authResponse.json();

  console.log("Shiprocket Auth Response:", authData);

  // FIX: throw instead of silently returning the error payload as if it succeeded
  if (!authResponse.ok || !authData.token) {
    throw new Error(`Shiprocket auth failed: ${JSON.stringify(authData)}`);
  }

  const token = authData.token;

  // Create Order
  const response = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: order.order_ref,
        order_date: toShiprocketDate(new Date()), // FIX: was ISO 8601, Shiprocket wants "YYYY-MM-DD HH:mm"
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION, // FIX: required field, was missing entirely

        billing_customer_name: order.customer_name,
        billing_last_name: "",

        billing_address: order.address_line1,
        billing_address_2: order.address_line2 || "",

        billing_city: order.address_city,
        billing_state: order.address_state,
        billing_country: "India",
        billing_pincode: order.address_pincode,

        billing_phone: normalizePhoneForShiprocket(order.customer_phone), // FIX: strip +91/spaces/dashes down to 10 digits
        billing_email: order.customer_email,

        shipping_is_billing: true,

        payment_method: order.payment_mode === "cod" ? "COD" : "Prepaid",

        // FIX: Shiprocket has no separate "amount to collect" field — for
        // a COD shipment, it uses `sub_total` itself as the cash the
        // courier collects on delivery. Sending the full grand_total here
        // for a COD order (which already had its 5% advance captured via
        // Razorpay) told Shiprocket/the courier to collect the ENTIRE
        // amount again in cash. Send only the actual outstanding balance
        // for COD orders; prepaid orders (nothing left to collect) still
        // send the full amount as before.
        sub_total: order.payment_mode === "cod" ? Number(order.cod_due_amount) : Number(order.grand_total),

        order_items: [
          {
            name: order.product_name,
            sku: order.color_sku ?? order.product_sku,
            units: Number(order.quantity),
            selling_price: Number(order.price_per_unit),
          },
        ],

        length: 10,
        breadth: 10,
        height: 5,
        weight: 0.5,
      }),
    }
  );

  const data = await response.json();

  // FIX: Shiprocket sometimes returns HTTP 200 with an error *message*
  // instead of an actual order (e.g. wrong pickup location, missing
  // field, etc). A real success always has an order_id, so check for
  // that instead of trusting response.ok alone.
  if (!response.ok || !data.order_id) {
    console.error(
      "Shiprocket order creation rejected:",
      JSON.stringify(data, null, 2)
    );
    throw new Error(`Shiprocket order creation failed: ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Fetches the pickup addresses saved in your Shiprocket account, so you
 * can copy the exact "pickup_location" nickname into your env var.
 * Run this once (e.g. via a temporary script or API route) to see the
 * valid values — Shiprocket is strict about exact string matches.
 */
export async function getShiprocketPickupLocations() {
  const authResponse = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    }
  );

  const authData = await authResponse.json();

  if (!authResponse.ok || !authData.token) {
    throw new Error(`Shiprocket auth failed: ${JSON.stringify(authData)}`);
  }

  const response = await fetch(
    "https://apiv2.shiprocket.in/v1/external/settings/company/pickup",
    {
      headers: { Authorization: `Bearer ${authData.token}` },
    }
  );

  const data = await response.json();
  console.log("Shiprocket pickup locations:", JSON.stringify(data, null, 2));
  return data;
}