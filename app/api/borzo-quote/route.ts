import { NextRequest, NextResponse } from "next/server";
import { getBorzoDeliveryCharge } from "@/app/lib/borzo";
import { MUMBAI_PINCODES } from "@/app/lib/pricing";

export async function POST(req: NextRequest) {
  const { pincode, city, state, quantity } = await req.json();

  if (!MUMBAI_PINCODES.has(pincode)) {
    return NextResponse.json(
      { error: "Same-day delivery not available for this pincode" },
      { status: 400 }
    );
  }

  const { charge, error } = await getBorzoDeliveryCharge(
    pincode,
    city || "Mumbai",
    state || "Maharashtra",
    Number(quantity) || 1
  );

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ charge });
}