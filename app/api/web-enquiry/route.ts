// PATH: app/api/web-enquiry/route.ts
//
// Public, unauthenticated endpoint — anyone can submit an inquiry, no login
// required (this is lead-capture, not a customer-account feature). Shared
// by every product's inquiry modal: each one posts its own `productType`
// plus whatever fields its form collects in `details`.
//
// Only the common contact fields (name/phone/email/productType) are
// validated here, since those are the only ones guaranteed to exist across
// every inquiry type — anything product-specific should be validated
// client-side in that product's own modal (see VisitingCardInquiryModal's
// canGoNext(), for example).

import { NextRequest, NextResponse } from "next/server";
import { createWebEnquiry } from "@/app/lib/web-enquiries";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, "");
  return /^\+?[\d\s-]+$/.test(value.trim()) && digitsOnly.length >= 10;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const productType = typeof body.productType === "string" ? body.productType.trim() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const businessAddress = typeof body.businessAddress === "string" ? body.businessAddress.trim() : "";
  const details = body.details && typeof body.details === "object" ? body.details : {};

  if (!productType) {
    return NextResponse.json({ error: "productType is required." }, { status: 400 });
  }
  if (!fullName || !phone || !email) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }

  try {
    const enquiry = await createWebEnquiry({
      productType, fullName, phone, email, companyName, businessAddress, details,
    });
    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/web-enquiry]", err);
    return NextResponse.json({ error: "Could not submit your inquiry. Please try again." }, { status: 500 });
  }
}