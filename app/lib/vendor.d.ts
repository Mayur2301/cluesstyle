// PATH: app/types/vendor.d.ts
//
// Ambient type declarations for small vendor packages that don't ship their
// own TypeScript types and don't have (or need) a full @types/* package —
// used by the shipping-label barcode/QR renderers
// (app/admin/(protected)/orders/[orderRef]/label/Barcode128.tsx and
// QrCodeCanvas.tsx). Both of those already treat the imported module as
// `any` at the call site, so these declarations only silence the editor/
// build-time "Could not find a declaration file for module ..." (ts7016)
// warning — they don't need to describe the real API.
//
// If you'd rather have full autocomplete/type-checking for these instead,
// delete the two lines below and run:
//   npm i --save-dev @types/qrcode
// (jsbarcode's own package doesn't have a matching @types/jsbarcode that
// tracks its current API, so the declaration below is the simpler fix for
// that one either way.)

declare module "qrcode";
declare module "jsbarcode";