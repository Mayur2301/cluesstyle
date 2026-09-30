// Borzo API — calculate live same-day delivery price
// Pickup is always your warehouse: 400079 (Dharavi, Mumbai)

const BORZO_API_URL = process.env.NODE_ENV === "production"
  ? "https://robot-in.borzodelivery.com/api/business/1.6/calculate-order"
  : "https://robotapitest-in.borzodelivery.com/api/business/1.6/calculate-order";

const BORZO_CREATE_URL = process.env.NODE_ENV === "production"
  ? "https://robot-in.borzodelivery.com/api/business/1.6/create-order"
  : "https://robotapitest-in.borzodelivery.com/api/business/1.6/create-order";

const PICKUP_ADDRESS = "Dharavi, Mumbai, Maharashtra 400079, India";
const WEIGHT_PER_SHIRT_KG = 0.3; // 300g per shirt

// Above this quantity we switch from a motorbike to a car/van — bigger
// vehicle, bigger Borzo quote automatically, no manual surcharge math needed.
const BULK_VEHICLE_THRESHOLD_QTY = 30;

// TODO: confirm these IDs against your Borzo account's actual vehicle list
// (GET /api/business/1.6/vehicle-types) — vehicle_type_id values are
// business/city-specific and are NOT guaranteed to match across accounts.
const VEHICLE_TYPE_MOTORBIKE = 8; // up to ~20kg — fine for small orders
const VEHICLE_TYPE_CAR = 1;       // car/van — bigger capacity, higher quote

function getVehicleTypeId(quantity: number): number {
  return quantity > BULK_VEHICLE_THRESHOLD_QTY ? VEHICLE_TYPE_CAR : VEHICLE_TYPE_MOTORBIKE;
}

export async function getBorzoDeliveryCharge(
  customerPincode: string,
  customerCity: string,
  customerState: string,
  quantity: number
): Promise<{ charge: number; error?: string }> {
  const totalWeightKg = WEIGHT_PER_SHIRT_KG * quantity;
  const dropAddress = `${customerCity}, ${customerState} ${customerPincode}, India`;
  const vehicleTypeId = getVehicleTypeId(quantity);

  try {
    console.log("[Borzo] Using token:", process.env.BORZO_AUTH_TOKEN);
    console.log("[Borzo] quantity:", quantity, "-> vehicle_type_id:", vehicleTypeId);

    const res = await fetch(BORZO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DV-Auth-Token": process.env.BORZO_AUTH_TOKEN!,
      },
      body: JSON.stringify({
        matter: "Clothing / T-Shirts",
        vehicle_type_id: vehicleTypeId, // motorbike for small orders, car/van above the bulk threshold
        total_weight_kg: totalWeightKg,
        points: [
          { address: PICKUP_ADDRESS },
          { address: dropAddress },
        ],
      }),
    });

    const data = await res.json();

    if (!data.is_successful) {
      console.error("[Borzo]", data);
      return { charge: 0, error: "Borzo quote failed" };
    }

    // Borzo returns price_of_delivery in rupees
    const charge = Math.round(Number(data.order.payment_amount));
    return { charge };

  } catch (err: any) {
    console.error("[Borzo error]", err);
    return { charge: 0, error: err.message };
  }
}

// ─── NEW: Place a same-day order on Borzo ────────────────────────────────────
export async function createBorzoOrder(order: any): Promise<any> {
  const totalWeightKg = WEIGHT_PER_SHIRT_KG * Number(order.quantity);
  const vehicleTypeId = getVehicleTypeId(Number(order.quantity));

  console.log("[Borzo] Token present:", !!process.env.BORZO_AUTH_TOKEN);
  console.log("[Borzo] CREATE_URL:", BORZO_CREATE_URL);
  console.log("[Borzo] order.quantity:", order.quantity, "-> weight kg:", totalWeightKg, "-> vehicle_type_id:", vehicleTypeId);

  const dropAddress = [
    order.address_line1,
    order.address_line2,
    order.address_city,
    order.address_state,
    order.address_pincode,
    "India",
  ]
    .filter(Boolean)
    .join(", ");

  const res = await fetch(BORZO_CREATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-DV-Auth-Token": process.env.BORZO_AUTH_TOKEN!,
    },
    body: JSON.stringify({
      matter: "Clothing / T-Shirts",
      vehicle_type_id: vehicleTypeId, // must match the vehicle used for the quote, or the final charge can differ
      total_weight_kg: totalWeightKg,
      points: [
        {
          address: PICKUP_ADDRESS,
          contact_person: {
            name:  process.env.STORE_NAME  ?? "Store",
            phone: process.env.STORE_PHONE ?? "",
          },
        },
        {
          address: dropAddress,
          contact_person: {
            name:  order.customer_name,
            phone: order.customer_phone,
          },
        },
      ],
    }),
  });

  const data = await res.json();

  if (!data.is_successful) {
    throw new Error(`Borzo create-order failed: ${JSON.stringify(data)}`);
  }

  console.log("[Borzo] Order placed:", data.order?.order_id);
  return data.order;
}