// PATH: app/lib/company-info.ts
//
// CluesStyle's own business details — used wherever the app needs to print
// the seller's own name/address/phone (currently: the admin shipping
// label). Kept in one place so it never drifts between call sites; add an
// email/GSTIN here too if/when those get used elsewhere.

export const SELLER_NAME = "CluesStyle";

// Kept as a single line for anywhere that wants the whole address in one
// string (e.g. a "Sold By" line), and as an array for anywhere that wants
// it wrapped across a couple of lines (e.g. the shipping label's smaller
// print area).
export const SELLER_ADDRESS_LINE = "Shop no 15, samta socity, Hiranadani Link Rd, nr. bar bank, nr. Kailash Vaibhav B Wing, HMPL Surya Nagar, Vikhroli West, Mumbai, Maharashtra 400079";

export const SELLER_ADDRESS_LINES = [
  "Shop no 15, samta socity, Hiranadani Link Rd,",
  "nr. bar bank, nr. Kailash Vaibhav B Wing,",
  "HMPL Surya Nagar, Vikhroli West,",
  "Mumbai, Maharashtra 400079",
];

export const SELLER_PHONE_DISPLAY = "90043 63902";
export const SELLER_PHONE_E164 = "+919004363902";