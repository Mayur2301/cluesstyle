"use client";

import { useState, useEffect, FC, ChangeEvent } from "react";
import styles from "./bulkorderhero.module.css";
import Link from "next/link";


/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type ProductKey =
  | "tote_bag" | "certificate_frame" | "polo_tshirt" | "round_tshirt"
  | "pin_badges" | "trophy" | "visiting_card" | "umbrella" | "jersey" | "executive_kit";

type StepType = "product_select" | "contact" | "quantity" | "chips" | "multi_chips" | "textarea" | "upload";

interface Step { id: string; title: string; subtitle?: string; type: StepType; options?: string[]; }
interface Product { value: ProductKey; label: string; emoji: string; }
type Answers = Record<string, string | string[] | number | File | undefined>;

interface ChipGroupProps { options: string[]; value: string | string[] | undefined; onChange: (v: string | string[]) => void; multi?: boolean; }
interface QuantityInputProps { value: number | undefined; onChange: (v: number) => void; }
interface UploadInputProps { value: File | undefined; onChange: (f: File) => void; }

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const PRODUCTS: Product[] = [
  { value: "tote_bag",      label: "Tote Bag",           emoji: "" },
  { value: "polo_tshirt",   label: "Polo T-Shirt",       emoji: "" },
  { value: "round_tshirt",  label: "Round Neck T-Shirt", emoji: "" },
  { value: "visiting_card", label: "Visiting Card",      emoji: "" },
  { value: "jersey",        label: "Jerseys",            emoji: "" },
  { value: "executive_kit", label: "Executive Kits",     emoji: "" },
];

const PRODUCT_IMAGES_BEFORE: Record<ProductKey | "default", string> = {
  tote_bag: "/tote-bag-before.png", certificate_frame: "/products/certificate-frame.jpg",
  polo_tshirt: "/green-polo-before.png", round_tshirt: "/products/round-tshirt.jpg",
  pin_badges: "/products/pin-badges.jpg", trophy: "/products/trophy.jpg",
  visiting_card: "/visiting-card-before.png", umbrella: "/products/umbrella.jpg",
  jersey: "/indian-jersey-before.png", executive_kit: "/bottle-box-before.png",
  default: "/bulk-order-banner.jpg",
};
const PRODUCT_IMAGES_AFTER: Record<ProductKey | "default", string> = {
  tote_bag: "/tote-bag-after.png", certificate_frame: "/products/certificate-frame.jpg",
  polo_tshirt: "/green-polo-after.png", round_tshirt: "/products/round-tshirt.jpg",
  pin_badges: "/products/pin-badges.jpg", trophy: "/products/trophy.jpg",
  visiting_card: "/visiting-card-after.png", umbrella: "/products/umbrella.jpg",
  jersey: "/indian-jersey-after.png", executive_kit: "/bottle-box-after.png",
  default: "/bulk-order-banner.png",
};
const PANEL_COLORS: Record<ProductKey | "default", string> = {
  tote_bag: "#d4edda", certificate_frame: "#fef3cd", polo_tshirt: "#cce5ff",
  round_tshirt: "#f8d7da", pin_badges: "#e2d9f3", trophy: "#fff3cd",
  visiting_card: "#d1ecf1", umbrella: "#cce5ff", jersey: "#ffddd2",
  executive_kit: "#e0e0ff", default: "#FFB347",
};
const PANEL_IMAGES: Record<ProductKey | "default", string> = {
  tote_bag: "/products/tote-bag.jpg", certificate_frame: "/products/certificate-frame.jpg",
  polo_tshirt: "/products/polo-tshirt.jpg", round_tshirt: "/products/round-tshirt.jpg",
  pin_badges: "/products/pin-badges.jpg", trophy: "/products/trophy.jpg",
  visiting_card: "/products/visiting-card.jpg", umbrella: "/products/umbrella.jpg",
  jersey: "/products/jersey.jpg", executive_kit: "/products/executive-kit.jpg",
  default: "/bulk-order-banner.jpg",
};

const STEPS: Record<ProductKey, Step[]> = {
  tote_bag: [
    { id: "quantity", title: "How many do you need?", subtitle: "Minimum order: 50 units", type: "quantity" },
    { id: "material", title: "Choose Material", subtitle: "Select the fabric for your tote bag", type: "chips", options: ["Cotton", "Canvas", "Polyester", "Jute"] },
    { id: "size", title: "Pick a Size", subtitle: "Width × Height in inches", type: "chips", options: ['14"×16"', '16"×14"', '12"×14"', '10"×12"'] },
    { id: "pattern", title: "Design Pattern", subtitle: "How should your tote look?", type: "chips", options: ["Plain", "Printed", "Custom Design", "Embroidery"] },
    { id: "info", title: "Additional Information", subtitle: "Any specific requirements, colours, or branding?", type: "textarea" },
    { id: "image", title: "Upload Reference Image", subtitle: "Logo, mockup, or inspiration (optional)", type: "upload" },
  ],
  certificate_frame: [
    { id: "quantity", title: "Quantity Required", subtitle: "Minimum order: 25 units", type: "quantity" },
    { id: "size", title: "Frame Size", subtitle: "Standard certificate sizes", type: "chips", options: ['A4 (8.3"×11.7")', 'A3 (11.7"×16.5")', 'Letter (8.5"×11")', "Custom"] },
    { id: "material", title: "Frame Material", subtitle: "Choose the frame finish", type: "chips", options: ["Wooden", "Metal", "Acrylic", "MDF with Laminate"] },
    { id: "colour", title: "Frame Colour", type: "chips", options: ["Black", "Gold", "Silver", "Walnut Brown", "White"] },
    { id: "branding", title: "Branding / Engraving", subtitle: "Logo, text, or personalisation?", type: "chips", options: ["None", "Logo Print", "Laser Engraving", "Custom Plate"] },
    { id: "info", title: "Additional Notes", type: "textarea" },
    { id: "image", title: "Upload Reference / Logo", subtitle: "Optional", type: "upload" },
  ],
  polo_tshirt: [
    { id: "quantity", title: "Total Quantity", subtitle: "Minimum order: 50 units", type: "quantity" },
    { id: "fabric", title: "Fabric Type", type: "chips", options: ["100% Cotton Pique", "Polyester Blend", "Dri-Fit / Moisture Wick", "Premium Interlock"] },
    { id: "sizes", title: "Size Breakdown", subtitle: "Select all sizes needed", type: "multi_chips", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
    { id: "branding", title: "Branding Method", type: "chips", options: ["Embroidery", "Screen Print", "Heat Transfer", "Sublimation"] },
    { id: "colour", title: "Colour Preference", subtitle: "Mention Pantone codes if known", type: "textarea" },
    { id: "image", title: "Upload Logo / Mockup", subtitle: "Optional", type: "upload" },
  ],
  round_tshirt: [
    { id: "quantity", title: "Total Quantity", subtitle: "Minimum order: 50 units", type: "quantity" },
    { id: "fabric", title: "Fabric Type", type: "chips", options: ["180 GSM Cotton", "200 GSM Cotton", "Polyester Blend", "Oversized Cotton"] },
    { id: "sizes", title: "Size Breakdown", subtitle: "Select all sizes needed", type: "multi_chips", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
    { id: "print", title: "Print Type", type: "chips", options: ["Screen Print", "DTF Print", "Sublimation", "Embroidery", "No Print"] },
    { id: "info", title: "Colour & Design Notes", type: "textarea" },
    { id: "image", title: "Upload Artwork / Logo", subtitle: "Optional", type: "upload" },
  ],
  pin_badges: [
    { id: "quantity", title: "Quantity Required", subtitle: "Minimum order: 100 units", type: "quantity" },
    { id: "shape", title: "Badge Shape", type: "chips", options: ["Round", "Square", "Oval", "Custom Shape"] },
    { id: "size", title: "Badge Diameter / Size", type: "chips", options: ["25mm", "32mm", "44mm", "58mm", "Custom"] },
    { id: "finish", title: "Finish Type", type: "chips", options: ["Glossy", "Matte", "Metal Enamel", "Glitter"] },
    { id: "fastening", title: "Fastening Type", type: "chips", options: ["Safety Pin", "Butterfly Clasp", "Magnetic Back", "Flat Back"] },
    { id: "info", title: "Design / Branding Notes", type: "textarea" },
    { id: "image", title: "Upload Artwork", subtitle: "Optional", type: "upload" },
  ],
  trophy: [
    { id: "quantity", title: "Number of Trophies", subtitle: "Minimum order: 10 units", type: "quantity" },
    { id: "type", title: "Trophy Type", type: "chips", options: ["Metal Trophy", "Crystal / Acrylic", "Wooden Shield", "3D Printed", "Resin"] },
    { id: "size", title: "Trophy Height", type: "chips", options: ['6"', '9"', '12"', '15"', "Custom"] },
    { id: "engraving", title: "Engraving / Text", subtitle: "Names, titles, event details", type: "textarea" },
    { id: "info", title: "Additional Requirements", type: "textarea" },
    { id: "image", title: "Upload Reference / Logo", subtitle: "Optional", type: "upload" },
  ],
  visiting_card: [
    { id: "quantity", title: "Quantity Required", subtitle: "Usually in multiples of 100", type: "quantity" },
    { id: "paper", title: "Paper / Material", type: "chips", options: ["350 GSM Matte", "400 GSM Glossy", "Soft Touch Lamination", "Metal Card", "Transparent PVC"] },
    { id: "finish", title: "Finish", type: "chips", options: ["Matte Lamination", "Gloss Lamination", "Spot UV", "Foil Stamping", "Embossed"] },
    { id: "sides", title: "Print Sides", type: "chips", options: ["Single Side", "Double Side"] },
    { id: "corners", title: "Corner Style", type: "chips", options: ["Square Corners", "Rounded Corners"] },
    { id: "info", title: "Design / Branding Notes", type: "textarea" },
    { id: "image", title: "Upload Design / Logo", subtitle: "Optional", type: "upload" },
  ],
  umbrella: [
    { id: "quantity", title: "Quantity Required", subtitle: "Minimum order: 50 units", type: "quantity" },
    { id: "type", title: "Umbrella Type", type: "chips", options: ["Straight / Golf", "3-Fold Compact", "2-Fold", "Inverted / Reverse", "Kids"] },
    { id: "canopy", title: "Canopy Material", type: "chips", options: ["190T Polyester", "210T Pongee", "Satin", "Windproof Teflon"] },
    { id: "branding", title: "Branding Area", type: "chips", options: ["1 Panel Print", "2 Panel Print", "Full Canopy Print", "Embroidery on Strap"] },
    { id: "handle", title: "Handle Style", type: "chips", options: ["Straight Wooden", "J-Shape Wooden", "Rubber Grip", "Acrylic / Crystal"] },
    { id: "info", title: "Colour & Design Notes", type: "textarea" },
    { id: "image", title: "Upload Logo / Artwork", subtitle: "Optional", type: "upload" },
  ],
  jersey: [
    { id: "quantity", title: "Total Jerseys", subtitle: "Minimum order: 20 units", type: "quantity" },
    { id: "sport", title: "Sport / Style", type: "chips", options: ["Football", "Cricket", "Basketball", "Cycling", "Corporate / Polo Style"] },
    { id: "fabric", title: "Fabric", type: "chips", options: ["Dri-Fit Polyester", "Sublimation Fabric", "Mesh", "Premium Interlock"] },
    { id: "sizes", title: "Size Breakdown", subtitle: "Select all sizes needed", type: "multi_chips", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
    { id: "customization", title: "Customisation", type: "chips", options: ["Name & Number", "Logo Only", "Full Sublimation Design", "Patch / Badge"] },
    { id: "info", title: "Team / Branding Details", type: "textarea" },
    { id: "image", title: "Upload Artwork / Team Logo", subtitle: "Optional", type: "upload" },
  ],
  executive_kit: [
    { id: "quantity", title: "Number of Kits", subtitle: "Minimum order: 25 sets", type: "quantity" },
    { id: "items", title: "Kit Contents", subtitle: "Select items to include", type: "multi_chips", options: ["Pen", "Diary / Notebook", "Card Holder", "USB Drive", "Keychain", "Mug", "Polo T-Shirt", "Laptop Bag"] },
    { id: "packaging", title: "Packaging", type: "chips", options: ["Rigid Gift Box", "Kraft Box", "Jute Bag", "Branded Carry Bag"] },
    { id: "branding", title: "Branding Method", type: "chips", options: ["Laser Engraving", "UV Print", "Embossed Logo", "Screen Print"] },
    { id: "info", title: "Theme / Occasion Notes", subtitle: "e.g. Diwali gifts, Onboarding kits, Event kits", type: "textarea" },
    { id: "image", title: "Upload Logo / Inspiration", subtitle: "Optional", type: "upload" },
  ],
};

const PRODUCT_STEP: Step = { id: "product", title: "Select a Product", subtitle: "What would you like to order?", type: "product_select" };
const CONTACT_STEP: Step = { id: "contact", title: "Your Details", subtitle: "So our team can reach you", type: "contact" };

const FAQS = [
  {
    question: "How long does delivery take?",
    answer:
      "Orders are typically delivered within 3-7 business days depending on your location.",
  },
  {
    question: "Can I personalize my order?",
    answer:
      "Yes, many of our products can be customized with names, photos, messages, or unique designs.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship worldwide to ensure your gifts reach loved ones wherever they are.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Absolutely. Once your order is shipped, you'll receive a tracking link via email or SMS.",
  },
  {
    question: "What if I receive a damaged product?",
    answer:
      "Contact our support team within 48 hours of delivery and we'll assist with a replacement or resolution.",
  },
];

function getSteps(product: ProductKey | ""): Step[] {
  if (!product) return [PRODUCT_STEP, CONTACT_STEP];
  return [PRODUCT_STEP, ...(STEPS[product] ?? []), CONTACT_STEP];
}

/* ═══════════════════════════════════════════════════════════════
   STATIC PAGE DATA
═══════════════════════════════════════════════════════════════ */
const BRANDS = [
  {
    name: "Google",
    logo: "/client-logo/amazon.png",
  },
  {
    name: "Amazon",
    logo: "/client-logo/google.png",
  },
  {
    name: "Microsoft",
    logo: "/client-logo/microsoft.png",
  },
  {
    name: "Infosys",
    logo: "/client-logo/netflix.png",
  },
  {
    name: "TCS",
    logo: "/client-logo/tesla.png",
  },
  {
    name: "Wipro",
    logo: "/client-logo/amazon.png",
  },
];
const GIFTECH_PARTNERS = [
  { icon: "🏛️", label: "BFSI" },
  { icon: "💻", label: "IT" },
  { icon: "🏥", label: "Pharma" },
  { icon: "⚙️", label: "Manufacturing" },
  { icon: "🎓", label: "Education & Edtech" },
];

const TOP_CATEGORIES = [
  { icon: "🎁", label: "Corporate Gifts", img: "/products/corporate-gifts.jpg" },
  { icon: "🌙", label: "Night Lamps", img: "/products/night-lamp.jpg" },
  { icon: "✨", label: "Personalised Gifts", img: "/products/personalised-gifts.jpg" },
  { icon: "🎂", label: "Birthday Gifts", img: "/products/birthday-gifts.jpg" },
];

const DIFFERENTIATORS = [
  {
    label: "In House Personalization",
    image: "/in-house-personalization.png",
  },
  {
    label: "Curated Collection",
    image: "/curated-collection.png",
  },
  {
    label: "Same Day Delivery",
    image: "/same-day.png",
  },
  {
    label: "Global Fulfillment",
    image: "/global-fulfilment.png",
  },
];

const PROMISES = [
  {
    title: "World Wide Delivery",
    desc: "Shop with us and enjoy reliable delivery to every corner of the globe",
    image: "/wwd.png",
  },
  {
    title: "Best Quality On Every Product",
    desc: "Experience excellence—our commitment to the best quality is unmatched",
    image: "/highquality.png",
  },
  {
    title: "Best Customer Support",
    desc: "Your satisfaction is our priority. Count on us for friendly and efficient support",
    image: "/Best-Customer-support.png",
  },
  {
    title: "Free Shipping Anywhere",
    desc: "Shop more, spend less—get free shipping on every purchase",
    image: "/freeship.png",
  },
];

const WHY_STATS = [
  { num: "25+", label: "Years of Trust" },
  { num: "🛍️", label: "Shop & Earn Rewards" },
  { num: "💬", label: "Excellent Support" },
  { num: "8M+", label: "Happy Customers" },
];

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */
const ChipGroup: FC<ChipGroupProps> = ({ options, value, onChange, multi = false }) => {
  const selected = multi ? (value as string[] ?? []) : (value as string);
  const toggle = (opt: string) => {
    if (multi) {
      const arr = (selected as string[]).includes(opt)
        ? (selected as string[]).filter((x) => x !== opt)
        : [...(selected as string[]), opt];
      onChange(arr);
    } else { onChange(opt); }
  };
  const isSelected = (opt: string) => multi ? (selected as string[]).includes(opt) : selected === opt;
  return (
    <div className={styles.chipGroup}>
      {options.map((opt) => (
        <button key={opt} type="button"
          className={[styles.chip, isSelected(opt) ? styles.chipActive : ""].join(" ")}
          onClick={() => toggle(opt)}>{opt}</button>
      ))}
    </div>
  );
};

const QuantityInput: FC<QuantityInputProps> = ({ value, onChange }) => (
  <div className={styles.quantityWrap}>
    <button type="button" className={styles.qtyBtn} onClick={() => onChange(Math.max(0, (value ?? 0) - 10))}>−</button>
    <input type="number" className={styles.qtyInput} value={value ?? ""} min={0} placeholder="0"
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))} />
    <button type="button" className={styles.qtyBtn} onClick={() => onChange((value ?? 0) + 10)}>+</button>
  </div>
);

const UploadInput: FC<UploadInputProps> = ({ value, onChange }) => (
  <label className={styles.uploadLabel}>
    <input type="file" accept="image/*,.pdf" className={styles.uploadInput}
      onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) onChange(e.target.files[0]); }} />
    <div className={styles.uploadBox}>
      {value ? <span className={styles.uploadName}>✅ {value.name}</span> : (
        <><span className={styles.uploadIcon}>📎</span><span>Click to upload reference image</span><span className={styles.uploadHint}>PNG, JPG, PDF up to 10MB</span></>
      )}
    </div>
  </label>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const BulkOrderPage = () => {
  const [product, setProduct] = useState<ProductKey | "">("");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const steps = getSteps(product);
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;

  useEffect(() => { setProduct(""); setStepIndex(0); setAnswers({}); setSubmitted(false); }, []);

  const answer = answers[currentStep?.id];
  const setAnswer = (val: Answers[string]) => setAnswers((prev) => ({ ...prev, [currentStep.id]: val }));

  const canNext = (): boolean => {
    switch (currentStep.type) {
      case "product_select": return !!product;
      case "contact": return !!(answers.name && answers.phone && answers.email);
      case "quantity": return (answer as number) > 0;
      case "chips": return !!answer;
      case "multi_chips": return Array.isArray(answer) && answer.length > 0;
      default: return true;
    }
  };

  const go = (dir: "next" | "back") => {
    if (dir === "next") {
      if (stepIndex === totalSteps - 1) { setSubmitted(true); return; }
      setStepIndex((i) => i + 1);
    } else { setStepIndex((i) => Math.max(0, i - 1)); }
  };

  const panelBg = product ? (PANEL_COLORS[product] ?? PANEL_COLORS.default) : PANEL_COLORS.default;
  const panelImg = product ? (PANEL_IMAGES[product] ?? PANEL_IMAGES.default) : PANEL_IMAGES.default;
  const selectedProduct = PRODUCTS.find((p) => p.value === product);

  return (
    <div className={styles.page}>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO + FORM
      ══════════════════════════════════════════ */}
      <section className={styles.heroSection}>
        {/* LEFT BANNER */}
        <div className={styles.heroBanner} style={{ background: panelBg }}>
          <div className={styles.blob1} /><div className={styles.blob2} />
          <div className={styles.bannerInner}>
            <div className={styles.bannerTag}>
              {selectedProduct ? `${selectedProduct.emoji} ${selectedProduct.label}` : "🏢 Custom Merchandise"}
            </div>
            <h1 className={styles.bannerTitle}>
              Give <span className={styles.bannerAccent}>Bulk Orders</span><br />
              for <span className={styles.bannerAccent2}>Maximum Savings</span><br />
              &amp; a Seamless Experience!
            </h1>
            <p className={styles.bannerDesc}>
              Custom t-shirts, jerseys, executive kits, tote bags, visiting cards &amp; more — premium branding delivered fast.
            </p>
            <div className={styles.bannerStats}>
              <div className={styles.stat}><span className={styles.statNum}>50+</span><span className={styles.statLabel}>Products</span></div>
              <div className={styles.statDivider} />
              <div className={styles.stat}><span className={styles.statNum}>24hr</span><span className={styles.statLabel}>Quote</span></div>
              <div className={styles.statDivider} />
              <div className={styles.stat}><span className={styles.statNum}>5K+</span><span className={styles.statLabel}>Happy Clients</span></div>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={panelImg} alt={product || "Bulk Order"} className={styles.bannerImg} />
        </div>

        {/* RIGHT FORM */}
        <div className={styles.heroForm}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Bulk Order Enquiry</h2>
            <p className={styles.formSub}>Unlock an exclusive discount for your bulk order!</p>
          </div>

          {submitted ? (
            <div className={styles.successWrap}>
              <div className={styles.successIcon}>🎉</div>
              <h2 className={styles.successTitle}>Enquiry Submitted!</h2>
              <p className={styles.successSub}>Our team will contact you within 24 hours with a custom quote.</p>
              <button className={styles.submitBtn} onClick={() => { setProduct(""); setStepIndex(0); setAnswers({}); setSubmitted(false); }}>
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <div className={styles.stepWrap} key={currentStep.id}>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
              </div>
              <p className={styles.stepCount}>Step {stepIndex + 1} of {totalSteps}</p>
              <h3 className={styles.stepTitle}>{currentStep.title}</h3>
              {currentStep.subtitle && <p className={styles.stepSubtitle}>{currentStep.subtitle}</p>}

              <div className={styles.inputArea}>
                {/* Product grid */}
                {currentStep.type === "product_select" && (
                  <div className={styles.productGrid}>
                    {PRODUCTS.map((p) => {
                      const imgBefore = PRODUCT_IMAGES_BEFORE[p.value] ?? PRODUCT_IMAGES_BEFORE.default;
                      const imgAfter  = PRODUCT_IMAGES_AFTER[p.value]  ?? PRODUCT_IMAGES_AFTER.default;
                      const hasImage  = imgBefore !== "/bulk-order-banner.jpg";
                      const isActive  = product === p.value;
                      return (
                        <button key={p.value} type="button"
                          className={[styles.productCard, isActive ? styles.productCardActive : ""].join(" ")}
                          onClick={() => { setProduct(p.value); setAnswers({}); setStepIndex(0); }}>
                          <div className={styles.productCardLeft}>
                            <span className={styles.productLabel}>{p.label}</span>
                            <div className={styles.productArrow}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                          <div className={styles.productCardRight}>
                            {hasImage ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imgBefore} alt={p.label} className={styles.productImgBefore} />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imgAfter}  alt={p.label} className={styles.productImgAfter} />
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

                {/* Contact */}
                {currentStep.type === "contact" && (
                  <div className={styles.contactFields}>
                    {([
                      { key: "name", type: "text", placeholder: "Your Name *" },
                      { key: "phone", type: "tel", placeholder: "Mobile Number *" },
                      { key: "email", type: "email", placeholder: "Email Address *" },
                      { key: "company", type: "text", placeholder: "Company Name (optional)" },
                    ] as { key: keyof Answers; type: string; placeholder: string }[]).map(({ key, type, placeholder }) => (
                      <input key={String(key)} className={styles.field} type={type} placeholder={placeholder}
                        value={(answers[key as string] as string) ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setAnswers((a) => ({ ...a, [key]: e.target.value }))} />
                    ))}
                  </div>
                )}

                {currentStep.type === "quantity" && <QuantityInput value={answer as number | undefined} onChange={setAnswer} />}
                {currentStep.type === "chips" && currentStep.options && <ChipGroup options={currentStep.options} value={answer as string | undefined} onChange={setAnswer} />}
                {currentStep.type === "multi_chips" && currentStep.options && <ChipGroup options={currentStep.options} value={answer as string[] | undefined} onChange={setAnswer} multi />}
                {currentStep.type === "textarea" && (
                  <textarea className={styles.field} rows={5} placeholder="Type here..." value={(answer as string) ?? ""}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)} />
                )}
                {currentStep.type === "upload" && <UploadInput value={answer as File | undefined} onChange={setAnswer} />}
              </div>

              <div className={styles.navRow}>
                {stepIndex > 0 && <button type="button" className={styles.backBtn} onClick={() => go("back")}>← Back</button>}
                <button type="button"
                  className={[styles.submitBtn, !canNext() ? styles.submitBtnDisabled : ""].join(" ")}
                  onClick={() => go("next")} disabled={!canNext()}>
                  {stepIndex === totalSteps - 1 ? "Send Request 🚀" : "Continue →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — BRANDS THAT TRUST US
      ══════════════════════════════════════════ */}
      <section className={styles.brandsSection}>
        <h2 className={styles.sectionTitle}>Brands That Trust Us</h2>
        <br/><br/>
        <div className={styles.brandsTrack}>
            <div className={styles.brandsScroll}>
            {[...BRANDS, ...BRANDS].map((brand, index) => (
                <div key={index} className={styles.brandCard}>
                <img
                    src={brand.logo}
                    alt={brand.name}
                    className={styles.brandLogo}
                />
                </div>
            ))}
            </div>
        </div>
        </section>


      {/* ══════════════════════════════════════════
          SECTION 3 — PERSONALISED GIFTING BANNER
    

{/* giftech new section */}
<section className="py-20 bg-white">
  <div className="max-w-[1700px] mx-auto px-5">

    {/* Heading */}
    <div className="flex items-center justify-center gap-5 mb-16">
      <div className="flex-1 h-px bg-gray-300"></div>

      <h2 className="text-3xl md:text-4xl font-bold text-center whitespace-nowrap">
        We are Giftech Partners For
      </h2>

      <div className="flex-1 h-px bg-gray-300"></div>
    </div>

    {/* Industries */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

      {/* BFSI */}
      <div className="flex flex-col items-center text-center">
        <img
          src="/bfsi.png"
          alt="BFSI"
          className="w-40 h-40 object-contain mb-4"
        />
        <h3 className="text-lg font-medium">BFSI</h3>
      </div>

      {/* IT */}
      <div className="flex flex-col items-center text-center">
        <img
          src="/it.png"
          alt="IT"
          className="w-40 h-40 object-contain mb-4"
        />
        <h3 className="text-lg font-medium">IT</h3>
      </div>

      {/* Pharma */}
      <div className="flex flex-col items-center text-center">
        <img
          src="/pharma.png"
          alt="PHARMA"
          className="w-40 h-40 object-contain mb-4"
        />
        <h3 className="text-lg font-medium uppercase">
          Pharma
        </h3>
      </div>

      {/* Manufacturing */}
      <div className="flex flex-col items-center text-center">
        <img
          src="/manufacturing.png"
          alt="Manufacturing"
          className="w-40 h-40 object-contain mb-4"
        />
        <h3 className="text-lg font-medium uppercase">
          Manufacturing
        </h3>
      </div>

      {/* Education */}
      <div className="flex flex-col items-center text-center">
        <img
          src="/education.png"
          alt="Education & EdTech"
          className="w-40 h-40 object-contain mb-4"
        />
        <h3 className="text-lg font-medium">
          Education &amp; EdTech
        </h3>
      </div>

    </div>
  </div>
</section>


      {/* ══════════════════════════════════════════
          SECTION 4 — GIFTECH PARTNERS
      ══════════════════════════════════════════ */}
       <section
      className={styles.categoriesSection}
      aria-labelledby="top-categories-heading"
    >
      <div className={styles.titleWrap}>
        <span className={styles.line} />
        <h2
          id="top-categories-heading"
          className={styles.sectionTitle}
        >
          Our Top Product Categories
        </h2>
        <span className={styles.line} />
      </div>

      <div className={styles.categoriesGrid}>
        <Link
          href="/corporate-gifts"
          className={styles.categoryCard}
        >
          <div className={styles.imageWrap}>
            <img
              src="/corporate-gifts.png"
              alt="Premium Corporate Gift Hampers and Executive Gift Sets"
              className={styles.categoryImage}
              loading="lazy"
            />
          </div>

          <h3 className={styles.categoryTitle}>
            Corporate Gifts
          </h3>
        </Link>

        <Link
          href="/night-lamps"
          className={styles.categoryCard}
        >
          <div className={styles.imageWrap}>
            <img
              src="/moon-lamp.png"
              alt="Custom Moon Lamps and Personalised Night Lamps"
              className={styles.categoryImage}
              loading="lazy"
            />
          </div>

          <h3 className={styles.categoryTitle}>
            Night Lamps
          </h3>
        </Link>

        <Link
          href="/personalised-gifts"
          className={styles.categoryCard}
        >
          <div className={styles.imageWrap}>
            <img
              src="/personalised-gifts.png"
              alt="Personalised Water Bottles and Custom Name Gifts"
              className={styles.categoryImage}
              loading="lazy"
            />
          </div>

          <h3 className={styles.categoryTitle}>
            Personalised Gifts
          </h3>
        </Link>

        <Link
          href="/birthday-gifts"
          className={styles.categoryCard}
        >
          <div className={styles.imageWrap}>
            <img
              src="/birthday-gifts.png"
              alt="Unique Birthday Gift Ideas and Personalised Birthday Gifts"
              className={styles.categoryImage}
              loading="lazy"
            />
          </div>

          <h3 className={styles.categoryTitle}>
            Birthday Gifts
          </h3>
        </Link>
      </div>
    </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — TOP PRODUCT CATEGORIES
      ══════════════════════════════════════════ */}
      

      {/* ══════════════════════════════════════════
          SECTION 6 — OUR DIFFERENTIATORS
      ══════════════════════════════════════════ */}
     <section className="py-20 px-5 bg-white">
  {/* Heading */}
  <div className="flex items-center justify-center gap-5 mb-16">
    <div className="flex-1 h-px bg-gray-300"></div>

    <h2 className="text-3xl md:text-4xl font-bold text-center whitespace-nowrap">
      Our Differentiators
    </h2>

    <div className="flex-1 h-px bg-gray-300"></div>
  </div>

  {/* Grid */}
  <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
    {DIFFERENTIATORS.map((d) => (
      <div
        key={d.label}
        className="flex flex-col items-center text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <img
            src={d.image}
            alt={d.label}
            className="w-40 h-40 object-contain"
          />
        </div>

        <span className="text-lg font-medium leading-snug">
          {d.label}
        </span>
      </div>
    ))}
  </div>
</section>

      {/* ══════════════════════════════════════════
          SECTION 7 — WHAT WE PROMISE
      ══════════════════════════════════════════ */}
      <section className={styles.promiseSection}>
  <h2 className={styles.sectionTitle}>What We Promise</h2>

  <div className={styles.promiseGrid}>
    {PROMISES.map((p) => (
      <div key={p.title} className={styles.promiseCard}>
        <div className={styles.promiseImageWrapper}>
          <img
            src={p.image}
            alt={p.title}
            width={160}
            height={160}
            className={styles.promiseImage}
          />
        </div>

        <h4 className={styles.promiseTitle}>{p.title}</h4>
        <p className={styles.promiseDesc}>{p.desc}</p>
      </div>
    ))}
  </div>
</section>

      {/* ══════════════════════════════════════════
          SECTION 8 — WHY CHOOSE PRESTO
      ══════════════════════════════════════════ */}
      <section className={styles.whyChooseSection}>
        <img
            src="/Why_us.jpg"
            alt="Why Choose CluesStyle"
            className={styles.whyChooseImage}
        />
        </section>


{/* faq section */}
        <section className={styles.faqSection}>
            <div className={styles.faqContainer}>
                <h2 className={styles.faqTitle}>
                Frequently Asked Questions
                </h2>

                <div className={styles.faqList}>
                {FAQS.map((faq, index) => (
                    <details key={index} className={styles.faqItem}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                    </details>
                ))}
                </div>
            </div>
            </section>

            {/* gifting section */}

 

    </div>
  );
};

export default BulkOrderPage;