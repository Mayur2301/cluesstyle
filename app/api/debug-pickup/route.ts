import { NextResponse } from "next/server";
import { getShiprocketPickupLocations } from "@/app/lib/shiprocket";

export async function GET() {
  const data = await getShiprocketPickupLocations();
  return NextResponse.json(data);
}