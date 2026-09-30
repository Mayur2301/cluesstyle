"use client";

import { useState, useEffect, FC, ChangeEvent } from "react";
import styles from "./Bulkordermodal.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductKey =
  | "tote_bag"
  | "certificate_frame"
  | "polo_tshirt"
  | "round_tshirt"
  | "pin_badges"
  | "trophy"
  | "visiting_card"
  | "umbrella"
  | "jersey"
  | "executive_kit";

type StepType =
  | "product_select"
  | "contact"
  | "quantity"
  | "chips"
  | "multi_chips"
  | "textarea"
  | "upload";

interface Step {
  id: string;
  title: string;
  subtitle?: string;
  type: StepType;
  options?: string[];
}

interface Product {
  value: ProductKey;
  label: string;
  emoji: string;
}

type Answers = Record<string, string | string[] | number | File | undefined>;

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChipGroupProps {
  options: string[];
  value: string | string[] | undefined;
  onChange: (val: string | string[]) => void;
  multi?: boolean;
}

interface QuantityInputProps {
  value: number | undefined;
  onChange: (val: number) => void;
}

interface UploadInputProps {
  value: File | undefined;
  onChange: (file: File) => void;
}

// ─── Product Catalogue ───────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { value: "tote_bag",          label: "Tote Bag",           emoji: "👜" },
//   { value: "certificate_frame", label: "Certificate Frames", emoji: "🖼️" },
  { value: "polo_tshirt",       label: "Polo T-Shirt",       emoji: "👔" },
  { value: "round_tshirt",      label: "Round Neck T-Shirt", emoji: "👕" },
//  { value: "pin_badges",        label: "Pin Badges",         emoji: "📌" },
//  { value: "trophy",            label: "Trophies",           emoji: "🏆" },
  { value: "visiting_card",     label: "Visiting Card",      emoji: "💼" },
//   { value: "umbrella",          label: "Umbrella",           emoji: "☂️" },
  { value: "jersey",            label: "Jerseys",            emoji: "🎽" },
  { value: "executive_kit",     label: "Executive Kits",     emoji: "🗂️" },
];

// ─── Product images ───────────────────────────────────────────────────────────
// Before = idle image, After = hover image. Replace paths with your real images.

const PRODUCT_IMAGES_BEFORE: Record<ProductKey | "default", string> = {
  tote_bag:          "/tote-bag-before.png",
  certificate_frame: "/products/certificate-frame.jpg",
  polo_tshirt:       "/green-polo-before.png",
  round_tshirt:      "/products/round-tshirt.jpg",
  pin_badges:        "/badge-collection/rectangle-pin-badges/rectangle-badge-1.webp",
  trophy:            "/products/trophy.jpg",
  visiting_card:     "/visiting-card-before.png",
  umbrella:          "/products/umbrella.jpg",
  jersey:            "/indian-jersey-before.png",
  executive_kit:     "/bottle-box-before.png",
  default:           "/bulk-order-banner.jpg",
};

// Replace these with alternate/hover images when available.
// Until then they mirror the before images (no visible swap).
const PRODUCT_IMAGES_AFTER: Record<ProductKey | "default", string> = {
  tote_bag:          "/tote-bag-after.png",
  certificate_frame: "/products/certificate-frame.jpg",
  polo_tshirt:       "/green-polo-after.png",
  round_tshirt:      "/products/round-tshirt.jpg",
  pin_badges:        "/products/pin-badges.jpg",
  trophy:            "/products/trophy.jpg",
  visiting_card:     "/visiting-card-after.png",
  umbrella:          "/products/umbrella.jpg",
  jersey:            "/indian-jersey-after.png",
  executive_kit:     "/bottle-box-after.png",
  default:           "/bulk-order-banner.png",
};

// ─── Panel colours per product ────────────────────────────────────────────────

const PANEL_COLORS: Record<ProductKey | "default", string> = {
  tote_bag:          "#e8f4e8",
  certificate_frame: "#f4f0e8",
  polo_tshirt:       "#e8eef4",
  round_tshirt:      "#f4e8ee",
  pin_badges:        "#f0e8f4",
  trophy:            "#f4f0d8",
  visiting_card:     "#e8f4f4",
  umbrella:          "#d8e8f4",
  jersey:            "#f4e8d8",
  executive_kit:     "#e8e8f4",
  default:           "#f0f0f0",
};

// ─── Left panel images (larger, shown on the left side of modal) ──────────────

const PANEL_IMAGES: Record<ProductKey | "default", string> = {
  tote_bag:          "/products/tote-bag.jpg",
  certificate_frame: "/products/certificate-frame.jpg",
  polo_tshirt:       "/products/polo-tshirt.jpg",
  round_tshirt:      "/products/round-tshirt.jpg",
  pin_badges:        "/products/pin-badges.jpg",
  trophy:            "/products/trophy.jpg",
  visiting_card:     "/products/visiting-card.jpg",
  umbrella:          "/products/umbrella.jpg",
  jersey:            "/products/jersey.jpg",
  executive_kit:     "/products/executive-kit.jpg",
  default:           "/bulk-order-banner.jpg",
};

// ─── Step definitions per product ────────────────────────────────────────────

const STEPS: Record<ProductKey, Step[]> = {
  tote_bag: [
    { id: "quantity", title: "How many do you need?",       subtitle: "Minimum order: 50 units",                          type: "quantity" },
    { id: "material", title: "Choose Material",             subtitle: "Select the fabric for your tote bag",              type: "chips",      options: ["Cotton", "Canvas", "Polyester", "Jute"] },
    { id: "size",     title: "Pick a Size",                 subtitle: "Width × Height in inches",                         type: "chips",      options: ['14"×16"', '16"×14"', '12"×14"', '10"×12"'] },
    { id: "pattern",  title: "Design Pattern",              subtitle: "How should your tote look?",                       type: "chips",      options: ["Plain", "Printed", "Custom Design", "Embroidery"] },
    { id: "info",     title: "Additional Information",      subtitle: "Any specific requirements, colours, or branding?", type: "textarea" },
    { id: "image",    title: "Upload Reference Image",      subtitle: "Logo, mockup, or inspiration (optional)",          type: "upload" },
  ],
  certificate_frame: [
    { id: "quantity", title: "Quantity Required",      subtitle: "Minimum order: 25 units",         type: "quantity" },
    { id: "size",     title: "Frame Size",             subtitle: "Standard certificate sizes",      type: "chips",  options: ['A4 (8.3"×11.7")', 'A3 (11.7"×16.5")', 'Letter (8.5"×11")', "Custom"] },
    { id: "material", title: "Frame Material",         subtitle: "Choose the frame finish",         type: "chips",  options: ["Wooden", "Metal", "Acrylic", "MDF with Laminate"] },
    { id: "colour",   title: "Frame Colour",                                                        type: "chips",  options: ["Black", "Gold", "Silver", "Walnut Brown", "White"] },
    { id: "branding", title: "Branding / Engraving",   subtitle: "Logo, text, or personalisation?", type: "chips",  options: ["None", "Logo Print", "Laser Engraving", "Custom Plate"] },
    { id: "info",     title: "Additional Notes",                                                    type: "textarea" },
    { id: "image",    title: "Upload Reference / Logo", subtitle: "Optional",                      type: "upload" },
  ],
  polo_tshirt: [
    { id: "quantity", title: "Total Quantity",     subtitle: "Minimum order: 50 units",        type: "quantity" },
    { id: "fabric",   title: "Fabric Type",                                                    type: "chips",       options: ["100% Cotton Pique", "Polyester Blend", "Dri-Fit / Moisture Wick", "Premium Interlock"] },
    { id: "sizes",    title: "Size Breakdown",    subtitle: "Select all sizes needed",         type: "multi_chips", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
    { id: "branding", title: "Branding Method",                                                type: "chips",       options: ["Embroidery", "Screen Print", "Heat Transfer", "Sublimation"] },
    { id: "colour",   title: "Colour Preference", subtitle: "Mention Pantone codes if known",  type: "textarea" },
    { id: "image",    title: "Upload Logo / Mockup", subtitle: "Optional",                    type: "upload" },
  ],
  round_tshirt: [
    { id: "quantity", title: "Total Quantity",        subtitle: "Minimum order: 50 units", type: "quantity" },
    { id: "fabric",   title: "Fabric Type",                                                type: "chips",       options: ["180 GSM Cotton", "200 GSM Cotton", "Polyester Blend", "Oversized Cotton"] },
    { id: "sizes",    title: "Size Breakdown",        subtitle: "Select all sizes needed", type: "multi_chips", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
    { id: "print",    title: "Print Type",                                                 type: "chips",       options: ["Screen Print", "DTF Print", "Sublimation", "Embroidery", "No Print"] },
    { id: "info",     title: "Colour & Design Notes",                                      type: "textarea" },
    { id: "image",    title: "Upload Artwork / Logo",  subtitle: "Optional",               type: "upload" },
  ],
  pin_badges: [
    { id: "quantity",  title: "Quantity Required",     subtitle: "Minimum order: 100 units", type: "quantity" },
    { id: "shape",     title: "Badge Shape",                                                 type: "chips", options: ["Round", "Square", "Oval", "Custom Shape"] },
    { id: "size",      title: "Badge Diameter / Size",                                       type: "chips", options: ["25mm", "32mm", "44mm", "58mm", "Custom"] },
    { id: "finish",    title: "Finish Type",                                                 type: "chips", options: ["Glossy", "Matte", "Metal Enamel", "Glitter"] },
    { id: "fastening", title: "Fastening Type",                                              type: "chips", options: ["Safety Pin", "Butterfly Clasp", "Magnetic Back", "Flat Back"] },
    { id: "info",      title: "Design / Branding Notes",                                     type: "textarea" },
    { id: "image",     title: "Upload Artwork",         subtitle: "Optional",                type: "upload" },
  ],
  trophy: [
    { id: "quantity",  title: "Number of Trophies",    subtitle: "Minimum order: 10 units",   type: "quantity" },
    { id: "type",      title: "Trophy Type",                                                  type: "chips",   options: ["Metal Trophy", "Crystal / Acrylic", "Wooden Shield", "3D Printed", "Resin"] },
    { id: "size",      title: "Trophy Height",                                                type: "chips",   options: ['6"', '9"', '12"', '15"', "Custom"] },
    { id: "engraving", title: "Engraving / Text",      subtitle: "Names, titles, event details", type: "textarea" },
    { id: "info",      title: "Additional Requirements",                                      type: "textarea" },
    { id: "image",     title: "Upload Reference / Logo", subtitle: "Optional",                type: "upload" },
  ],
  visiting_card: [
    { id: "quantity", title: "Quantity Required", subtitle: "Usually in multiples of 100", type: "quantity" },
    { id: "paper",    title: "Paper / Material",                                            type: "chips", options: ["350 GSM Matte", "400 GSM Glossy", "Soft Touch Lamination", "Metal Card", "Transparent PVC"] },
    { id: "finish",   title: "Finish",                                                      type: "chips", options: ["Matte Lamination", "Gloss Lamination", "Spot UV", "Foil Stamping", "Embossed"] },
    { id: "sides",    title: "Print Sides",                                                 type: "chips", options: ["Single Side", "Double Side"] },
    { id: "corners",  title: "Corner Style",                                                type: "chips", options: ["Square Corners", "Rounded Corners"] },
    { id: "info",     title: "Design / Branding Notes",                                     type: "textarea" },
    { id: "image",    title: "Upload Design / Logo",   subtitle: "Optional",                type: "upload" },
  ],
  umbrella: [
    { id: "quantity", title: "Quantity Required", subtitle: "Minimum order: 50 units",  type: "quantity" },
    { id: "type",     title: "Umbrella Type",                                            type: "chips", options: ["Straight / Golf", "3-Fold Compact", "2-Fold", "Inverted / Reverse", "Kids"] },
    { id: "canopy",   title: "Canopy Material",                                          type: "chips", options: ["190T Polyester", "210T Pongee", "Satin", "Windproof Teflon"] },
    { id: "branding", title: "Branding Area",                                            type: "chips", options: ["1 Panel Print", "2 Panel Print", "Full Canopy Print", "Embroidery on Strap"] },
    { id: "handle",   title: "Handle Style",                                             type: "chips", options: ["Straight Wooden", "J-Shape Wooden", "Rubber Grip", "Acrylic / Crystal"] },
    { id: "info",     title: "Colour & Design Notes",                                    type: "textarea" },
    { id: "image",    title: "Upload Logo / Artwork",  subtitle: "Optional",             type: "upload" },
  ],
  jersey: [
    { id: "quantity",      title: "Total Jerseys",   subtitle: "Minimum order: 20 units", type: "quantity" },
    { id: "sport",         title: "Sport / Style",                                        type: "chips",       options: ["Football", "Cricket", "Basketball", "Cycling", "Corporate / Polo Style"] },
    { id: "fabric",        title: "Fabric",                                               type: "chips",       options: ["Dri-Fit Polyester", "Sublimation Fabric", "Mesh", "Premium Interlock"] },
    { id: "sizes",         title: "Size Breakdown",  subtitle: "Select all sizes needed", type: "multi_chips", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
    { id: "customization", title: "Customisation",                                        type: "chips",       options: ["Name & Number", "Logo Only", "Full Sublimation Design", "Patch / Badge"] },
    { id: "info",          title: "Team / Branding Details",                              type: "textarea" },
    { id: "image",         title: "Upload Artwork / Team Logo", subtitle: "Optional",     type: "upload" },
  ],
  executive_kit: [
    { id: "quantity",  title: "Number of Kits",       subtitle: "Minimum order: 25 sets",                             type: "quantity" },
    { id: "items",     title: "Kit Contents",          subtitle: "Select items to include",                            type: "multi_chips", options: ["Pen", "Diary / Notebook", "Card Holder", "USB Drive", "Keychain", "Mug", "Polo T-Shirt", "Laptop Bag"] },
    { id: "packaging", title: "Packaging",                                                                             type: "chips",       options: ["Rigid Gift Box", "Kraft Box", "Jute Bag", "Branded Carry Bag"] },
    { id: "branding",  title: "Branding Method",                                                                       type: "chips",       options: ["Laser Engraving", "UV Print", "Embossed Logo", "Screen Print"] },
    { id: "info",      title: "Theme / Occasion Notes", subtitle: "e.g. Diwali gifts, Onboarding kits, Event kits",   type: "textarea" },
    { id: "image",     title: "Upload Logo / Inspiration", subtitle: "Optional",                                      type: "upload" },
  ],
};

// ─── Fixed steps ──────────────────────────────────────────────────────────────

const PRODUCT_STEP: Step = {
  id: "product",
  title: "Select a Product",
  subtitle: "What would you like to order?",
  type: "product_select",
};

const CONTACT_STEP: Step = {
  id: "contact",
  title: "Your Details",
  subtitle: "So our team can reach you",
  type: "contact",
};

function getSteps(product: ProductKey | ""): Step[] {
  if (!product) return [PRODUCT_STEP, CONTACT_STEP];
  return [PRODUCT_STEP, ...(STEPS[product] ?? []), CONTACT_STEP];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ChipGroup: FC<ChipGroupProps> = ({ options, value, onChange, multi = false }) => {
  const selected = multi ? (value as string[] ?? []) : (value as string);

  const toggle = (opt: string): void => {
    if (multi) {
      const arr = (selected as string[]).includes(opt)
        ? (selected as string[]).filter((x) => x !== opt)
        : [...(selected as string[]), opt];
      onChange(arr);
    } else {
      onChange(opt);
    }
  };

  const isSelected = (opt: string): boolean =>
    multi ? (selected as string[]).includes(opt) : selected === opt;

  return (
    <div className={styles.chipGroup}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={[styles.chip, isSelected(opt) ? styles.chipActive : ""].join(" ")}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

const QuantityInput: FC<QuantityInputProps> = ({ value, onChange }) => (
  <div className={styles.quantityWrap}>
    <button
      type="button"
      className={styles.qtyBtn}
      onClick={() => onChange(Math.max(0, (value ?? 0) - 10))}
    >
      −
    </button>
    <input
      type="number"
      className={styles.qtyInput}
      value={value ?? ""}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
      placeholder="0"
      min={0}
    />
    <button
      type="button"
      className={styles.qtyBtn}
      onClick={() => onChange((value ?? 0) + 10)}
    >
      +
    </button>
  </div>
);

const UploadInput: FC<UploadInputProps> = ({ value, onChange }) => (
  <label className={styles.uploadLabel}>
    <input
      type="file"
      accept="image/*,.pdf"
      className={styles.uploadInput}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) onChange(e.target.files[0]);
      }}
    />
    <div className={styles.uploadBox}>
      {value ? (
        <span className={styles.uploadName}>✅ {value.name}</span>
      ) : (
        <>
          <span className={styles.uploadIcon}>📎</span>
          <span>Click to upload reference image</span>
          <span className={styles.uploadHint}>PNG, JPG, PDF up to 10MB</span>
        </>
      )}
    </div>
  </label>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

const BulkOrderModal: FC<BulkOrderModalProps> = ({ isOpen, onClose }) => {
  const [product, setProduct]     = useState<ProductKey | "">("");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [answers, setAnswers]     = useState<Answers>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps       = getSteps(product);
  const currentStep = steps[stepIndex];
  const totalSteps  = steps.length;

  useEffect(() => {
    if (isOpen) {
      setProduct("");
      setStepIndex(0);
      setAnswers({});
      setSubmitted(false);
      setSubmitting(false);
      setSubmitError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const answer    = answers[currentStep?.id];
  const setAnswer = (val: Answers[string]): void =>
    setAnswers((prev) => ({ ...prev, [currentStep.id]: val }));

  const canNext = (): boolean => {
    switch (currentStep.type) {
      case "product_select": return !!product;
      case "contact":        return !!(answers.name && answers.phone && answers.email);
      case "quantity":       return (answer as number) > 0;
      case "chips":          return !!answer;
      case "multi_chips":    return Array.isArray(answer) && answer.length > 0;
      default:               return true; // textarea & upload are optional
    }
  };

  // Posts to the same /api/web-enquiry endpoint (and web_enquires table)
  // every other product inquiry modal uses. The contact fields go into the
  // shared columns; everything else this product's steps collected
  // (quantity, material, size, colour notes, etc.) goes into `details` as
  // JSON, keyed by step id. A File answer (the optional reference-image
  // step) can't go into JSON directly, so it's uploaded first via
  // /api/upload-bulk-reference and only its resulting URL is stored.
  const submitEnquiry = async (): Promise<void> => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const details: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(answers)) {
        if (["name", "phone", "email", "company"].includes(key)) continue;
        if (value instanceof File) continue; // handled separately below
        details[key] = value;
      }

      const imageFile = answers.image;
      if (imageFile instanceof File) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await fetch("/api/upload-bulk-reference", { method: "POST", body: fd });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (uploadRes.ok && uploadData?.url) {
          details.reference_image_url = uploadData.url;
        }
        // If the upload fails, the rest of the enquiry still gets submitted
        // — a missing reference image shouldn't block a lead from coming
        // through, since every "image" step is marked optional.
      }

      const res = await fetch("/api/web-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: `bulk-order-${product}`,
          fullName: answers.name,
          phone: answers.phone,
          email: answers.email,
          companyName: answers.company || "",
          details,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data?.error || "Could not submit your enquiry. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const go = (dir: "next" | "back"): void => {
    if (dir === "next") {
      if (stepIndex === totalSteps - 1) { submitEnquiry(); return; }
      setStepIndex((i) => i + 1);
    } else {
      setStepIndex((i) => Math.max(0, i - 1));
    }
  };

  const panelBg        = product ? (PANEL_COLORS[product]  ?? PANEL_COLORS.default)  : PANEL_COLORS.default;
  const panelImg       = product ? (PANEL_IMAGES[product]  ?? PANEL_IMAGES.default)  : PANEL_IMAGES.default;
  const selectedProduct = PRODUCTS.find((p) => p.value === product);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* ── Left Panel ── */}
        <div className={styles.leftPanel} style={{ background: panelBg }}>
          <div className={styles.leftBadge}>
            {selectedProduct
              ? `${selectedProduct.emoji} ${selectedProduct.label}`
              : "🏢 Bulk Orders"}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={panelImg} alt={product || "Bulk Order"} className={styles.leftImg} />
          {/* <div className={styles.leftFooter}>
            <p className={styles.leftTagline}>
              {submitted
                ? "We'll get back to you shortly!"
                : "Custom branded merchandise for your business"}
            </p>
            {!submitted && (
              <div className={styles.stepDots}>
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={[
                      styles.dot,
                      i === stepIndex ? styles.dotActive : "",
                      i < stepIndex   ? styles.dotDone   : "",
                    ].join(" ")}
                  />
                ))}
              </div>
            )}
          </div> */}
        </div>

        {/* ── Right Panel ── */}
        <div className={styles.rightPanel}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>

          {submitted ? (
            <div className={styles.successWrap}>
              <div className={styles.successIcon}>🎉</div>
              <h2 className={styles.successTitle}>Enquiry Submitted!</h2>
              <p className={styles.successSub}>
                Our team will contact you within 24 hours with a custom quote.
              </p>
              <button className={styles.primaryBtn} onClick={onClose}>Done</button>
            </div>
          ) : (
            <div className={styles.stepWrap} key={currentStep.id}>

              {/* Progress bar */}
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <p className={styles.stepCount}>Step {stepIndex + 1} of {totalSteps}</p>

              <h2 className={styles.stepTitle}>{currentStep.title}</h2>
              {currentStep.subtitle && (
                <p className={styles.stepSubtitle}>{currentStep.subtitle}</p>
              )}

              <div className={styles.inputArea}>

                {/* ── Product grid ── */}
                {currentStep.type === "product_select" && (
                  <div className={styles.productGrid}>
                    {PRODUCTS.map((p) => {
                      const imgBefore = PRODUCT_IMAGES_BEFORE[p.value] ?? PRODUCT_IMAGES_BEFORE.default;
                      const imgAfter  = PRODUCT_IMAGES_AFTER[p.value]  ?? PRODUCT_IMAGES_AFTER.default;
                      const hasImage  = imgBefore !== "/bulk-order-banner.jpg";
                      const isActive  = product === p.value;

                      return (
                        <button
                          key={p.value}
                          type="button"
                          className={[
                            styles.productCard,
                            isActive ? styles.productCardActive : "",
                          ].join(" ")}
                          onClick={() => {
                            setProduct(p.value);
                            setAnswers({});
                            setStepIndex(0);
                          }}
                        >
                          {/* Left: label + arrow */}
                          <div className={styles.productCardLeft}>
                            <span className={styles.productLabel}>{p.label}</span>
                            <div className={styles.productArrow}>
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                              >
                                <path d="M5 12h14" />
                                <path d="M13 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {/* Right: image or emoji */}
                          <div className={styles.productCardRight}>
                            {hasImage ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={imgBefore}
                                  alt={p.label}
                                  className={styles.productImgBefore}
                                />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={imgAfter}
                                  alt={p.label}
                                  className={styles.productImgAfter}
                                />
                              </>
                            ) : (
                              <div className={styles.productEmoji}>{p.emoji}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── Contact ── */}
                {currentStep.type === "contact" && (
                  <div className={styles.contactFields}>
                    {(
                      [
                        { key: "name",    type: "text",  placeholder: "Your Name *" },
                        { key: "phone",   type: "tel",   placeholder: "Mobile Number *" },
                        { key: "email",   type: "email", placeholder: "Email Address *" },
                        { key: "company", type: "text",  placeholder: "Company Name (optional)" },
                      ] as { key: keyof Answers; type: string; placeholder: string }[]
                    ).map(({ key, type, placeholder }) => (
                      <input
                        key={String(key)}
                        className={styles.field}
                        type={type}
                        placeholder={placeholder}
                        value={(answers[key as string] as string) ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setAnswers((a) => ({ ...a, [key]: e.target.value }))
                        }
                      />
                    ))}
                  </div>
                )}

                {/* ── Quantity ── */}
                {currentStep.type === "quantity" && (
                  <QuantityInput
                    value={answer as number | undefined}
                    onChange={setAnswer}
                  />
                )}

                {/* ── Single-select chips ── */}
                {currentStep.type === "chips" && currentStep.options && (
                  <ChipGroup
                    options={currentStep.options}
                    value={answer as string | undefined}
                    onChange={setAnswer}
                  />
                )}

                {/* ── Multi-select chips ── */}
                {currentStep.type === "multi_chips" && currentStep.options && (
                  <ChipGroup
                    options={currentStep.options}
                    value={answer as string[] | undefined}
                    onChange={setAnswer}
                    multi
                  />
                )}

                {/* ── Textarea ── */}
                {currentStep.type === "textarea" && (
                  <textarea
                    className={styles.field}
                    rows={5}
                    placeholder="Type here..."
                    value={(answer as string) ?? ""}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setAnswer(e.target.value)
                    }
                  />
                )}

                {/* ── File upload ── */}
                {currentStep.type === "upload" && (
                  <UploadInput
                    value={answer as File | undefined}
                    onChange={setAnswer}
                  />
                )}
              </div>

              {submitError && (
                <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "10px" }}>{submitError}</p>
              )}

              {/* Navigation */}
              <div className={styles.navRow}>
                {stepIndex > 0 && (
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => go("back")}
                    disabled={submitting}
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  className={[
                    styles.primaryBtn,
                    (!canNext() || submitting) ? styles.primaryBtnDisabled : "",
                  ].join(" ")}
                  onClick={() => go("next")}
                  disabled={!canNext() || submitting}
                >
                  {stepIndex === totalSteps - 1
                    ? (submitting ? "Submitting…" : "Submit Enquiry 🚀")
                    : "Continue →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkOrderModal;