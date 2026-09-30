"""
generate_invoice.py  —  Windows + Linux compatible

Called by Node (see app/lib/invoice.ts):
    python3 scripts/generate_invoice.py '<json>' '<out_path>'

Requires:
    pip install Pillow qrcode

Brand assets (put these next to this script, in scripts/assets/):
    scripts/assets/cluesstyle-logo.webp   — square/roughly-square logo mark
    scripts/assets/thankyou.webp          — the cursive "Thank you" script,
                                             transparent background, wide
                                             aspect ratio (~3:1)
If either file is missing this still runs — it falls back to plain text so
a missing asset never breaks invoice generation — but drop the real files
in for the exact look.
"""

import sys
import json
import os
import platform
import textwrap
import urllib.request
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime, timezone

try:
    import qrcode
except ImportError:
    qrcode = None

# ── Font resolution (Windows + Linux) ───────────────────────────────────────

def _find_font(bold: bool = False, italic: bool = False) -> str:
    """Return an absolute path to a suitable TrueType font."""
    if platform.system() == "Windows":
        win_dir = os.environ.get("WINDIR", "C:\\Windows")
        if italic:
            candidates = [os.path.join(win_dir, "Fonts", "italic.ttf")]
        else:
            candidates = [
                os.path.join(win_dir, "Fonts", "arialbd.ttf" if bold else "arial.ttf"),
                os.path.join(win_dir, "Fonts", "calibrib.ttf" if bold else "calibri.ttf"),
                os.path.join(win_dir, "Fonts", "verdanab.ttf" if bold else "verdana.ttf"),
            ]
    else:
        if italic:
            candidates = [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf",
            ]
        else:
            candidates = [
                f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",
                f"/usr/share/fonts/truetype/liberation/LiberationSans{'-Bold' if bold else ''}.ttf",
                f"/usr/share/fonts/truetype/freefont/FreeSans{'Bold' if bold else ''}.ttf",
            ]

    for path in candidates:
        if os.path.isfile(path):
            return path

    # Last resort — fall back to the non-italic/non-bold search rather than
    # crash the whole invoice over a missing italic variant.
    if italic:
        return _find_font(bold=bold, italic=False)

    raise FileNotFoundError(
        f"No suitable {'bold ' if bold else ''}font found. Tried: {candidates}"
    )


_FONT_CACHE: dict = {}


def font(size: int, bold: bool = False, italic: bool = False) -> ImageFont.FreeTypeFont:
    key = (size, bold, italic)
    if key not in _FONT_CACHE:
        _FONT_CACHE[key] = ImageFont.truetype(_find_font(bold, italic), size)
    return _FONT_CACHE[key]


# ── Palette (matches the reference invoice + the site's own accent colors) ──
BG        = (255, 255, 255)
INK       = (15,  23,  42)     # near-black text
SUBTEXT   = (100, 116, 139)    # slate-500
MUTED     = (148, 163, 184)    # slate-400
LINE      = (226, 232, 240)    # slate-200
PANEL     = (248, 250, 252)    # slate-50
GREEN     = (22,  163,  74)
GREEN_BG  = (220, 252, 231)
BLUE      = (37,  99,  235)
BLUE_BG   = (219, 234, 254)
ORANGE    = (234, 88,  12)
ORANGE_BG = (255, 237, 213)
PURPLE    = (147, 51,  234)
PURPLE_BG = (243, 232, 255)
BLACK     = (17,  24,  39)
WHITE     = (255, 255, 255)

W   = 900
PAD = 56

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")


def _tw(draw, text, fnt):
    bb = draw.textbbox((0, 0), text, font=fnt)
    return bb[2] - bb[0]


def _text_right(draw, right_x, y, text, fnt, fill):
    draw.text((right_x - _tw(draw, text, fnt), y), text, font=fnt, fill=fill)


def _text_center(draw, cx, y, text, fnt, fill):
    draw.text((cx - _tw(draw, text, fnt) // 2, y), text, font=fnt, fill=fill)


def _load_asset(name: str):
    path = os.path.join(ASSETS_DIR, name)
    if os.path.isfile(path):
        try:
            return Image.open(path).convert("RGBA")
        except Exception:
            return None
    return None


def _load_asset_any(names) -> "Image.Image | None":
    """Tries each filename in order, returns the first that exists.
    Used for the thank-you asset since it's been referred to as both
    "thankyou.webp" and "thank-you.webp" — accept either spelling instead
    of silently falling back to drawn text over a naming mismatch."""
    for n in names:
        img = _load_asset(n)
        if img is not None:
            return img
    return None


def _fit(img: Image.Image, max_w: int, max_h: int) -> Image.Image:
    ratio = min(max_w / img.width, max_h / img.height)
    return img.resize((max(1, int(img.width * ratio)), max(1, int(img.height * ratio))), Image.LANCZOS)


def _fetch_remote_image(url: str):
    """Downloads a product photo for the item table thumbnail. Best-effort —
    any failure (blocked host, timeout, bad URL, relative path with no
    scheme) falls back to a plain placeholder square rather than breaking
    invoice generation, but prints a one-line reason to stderr so a silent
    blank thumbnail is actually debuggable from the server logs instead of
    a mystery. Must be an absolute http(s) URL — a site-relative path like
    "/office-bag/foo.webp" is resolved to one on the Node side (see
    toAbsoluteProductImageUrl in app/lib/invoice.ts) before it ever gets here."""
    if not url:
        return None
    if not url.lower().startswith(("http://", "https://")):
        print(f"[invoice] productImage isn't an absolute URL, skipping thumbnail: {url!r}", file=sys.stderr)
        return None
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            return Image.open(BytesIO(resp.read())).convert("RGBA")
    except Exception as e:
        print(f"[invoice] Could not fetch productImage {url!r}: {e}", file=sys.stderr)
        return None


def _rounded_panel(d, box, fill=None, outline=None, radius=14, width=1):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


# ── Small vector icons (no icon font dependency — drawn straight from
# primitives so the invoice never depends on an external icon asset) ────────

def icon_shield_check(d, cx, cy, r, color):
    d.polygon(
        [(cx, cy - r), (cx + r, cy - r * 0.55), (cx + r, cy + r * 0.15),
         (cx, cy + r), (cx - r, cy + r * 0.15), (cx - r, cy - r * 0.55)],
        fill=color,
    )
    d.line([(cx - r * 0.45, cy), (cx - r * 0.1, cy + r * 0.35), (cx + r * 0.5, cy - r * 0.35)],
           fill=WHITE, width=max(2, r // 5), joint="curve")


def icon_box(d, cx, cy, r, color):
    d.rectangle([cx - r, cy - r * 0.6, cx + r, cy + r * 0.75], fill=color)
    d.line([(cx - r, cy - r * 0.15), (cx + r, cy - r * 0.15)], fill=WHITE, width=max(2, r // 6))
    d.line([(cx, cy - r * 0.6), (cx, cy + r * 0.75)], fill=WHITE, width=max(2, r // 6))


def icon_truck(d, cx, cy, r, color):
    d.rectangle([cx - r, cy - r * 0.4, cx + r * 0.25, cy + r * 0.5], fill=color)
    d.polygon([(cx + r * 0.25, cy - r * 0.1), (cx + r * 0.9, cy - r * 0.1),
               (cx + r, cy + r * 0.2), (cx + r * 0.25, cy + r * 0.5)], fill=color)
    d.ellipse([cx - r * 0.65, cy + r * 0.35, cx - r * 0.25, cy + r * 0.75], fill=INK)
    d.ellipse([cx + r * 0.35, cy + r * 0.35, cx + r * 0.75, cy + r * 0.75], fill=INK)


def icon_headset(d, cx, cy, r, color):
    d.arc([cx - r, cy - r, cx + r, cy + r * 0.6], 180, 360, fill=color, width=max(2, r // 4))
    d.ellipse([cx - r, cy - r * 0.1, cx - r * 0.55, cy + r * 0.45], fill=color)
    d.ellipse([cx + r * 0.55, cy - r * 0.1, cx + r, cy + r * 0.45], fill=color)


def icon_phone(d, cx, cy, r, color):
    d.rounded_rectangle([cx - r * 0.55, cy - r, cx + r * 0.55, cy + r], radius=r * 0.3, fill=color)


def icon_mail(d, cx, cy, r, color):
    d.rectangle([cx - r, cy - r * 0.65, cx + r, cy + r * 0.65], outline=color, width=max(2, r // 6))
    d.line([(cx - r, cy - r * 0.6), (cx, cy + r * 0.1), (cx + r, cy - r * 0.6)], fill=color, width=max(2, r // 6), joint="curve")


def icon_chat(d, cx, cy, r, color):
    d.rounded_rectangle([cx - r, cy - r * 0.8, cx + r, cy + r * 0.55], radius=r * 0.4, fill=color)
    d.polygon([(cx - r * 0.3, cy + r * 0.5), (cx - r * 0.05, cy + r * 0.5), (cx - r * 0.3, cy + r * 0.95)], fill=color)


def social_icon(d, cx, cy, r, glyph):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=WHITE, width=2)
    f = font(int(r * 1.1), bold=True)
    _text_center(d, cx, cy - int(r * 0.65), glyph, f, WHITE)


# ── Main render ──────────────────────────────────────────────────────────────

def draw_invoice(data: dict, out_path: str) -> None:
    H = 1900  # generous — cropped to actual content at the end
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    logo_asset = _load_asset("cluesstyle-logo.webp")
    # Dedicated white/light variant for the black footer band — the regular
    # (dark-on-transparent) logo would be invisible against BLACK there.
    logo_asset_white = _load_asset("cluesstyle-white-logo.webp")
    thankyou_asset = _load_asset_any(["thankyou.webp", "thank-you.webp", "thank_you.webp"])

    y = PAD

    # ── Header: logo (left), INVOICE + meta (right) ─────────────────────────
    # cluesstyle-logo.webp already carries the "Cluesstyle.com" wordmark
    # baked in, so when it's present we draw ONLY the image — no separate
    # drawn "Cluesstyle" / ".com" text next to it (that used to duplicate
    # the logo's own wordmark). Sized to occupy roughly the same header
    # footprint the icon+text combo used to (~64px tall). The drawn
    # fallback (no asset found) is unchanged, since there's no logo image
    # to carry the wordmark in that case.
    header_top = y
    if logo_asset:
        logo = _fit(logo_asset, 260, 64)
        img.paste(logo, (PAD, y), logo)
        tagline_y = y + logo.height + 8
    else:
        d.rounded_rectangle([PAD, y, PAD + 48, y + 48], radius=10, fill=INK)
        d.text((PAD + 10, y + 12), "CS", font=font(18, bold=True), fill=WHITE)
        wm_x = PAD + 48 + 12
        d.text((wm_x, y + 2), "Cluesstyle", font=font(22, bold=True), fill=INK)
        d.text((wm_x, y + 28), ".com", font=font(13), fill=SUBTEXT)
        tagline_y = y + 60

    tagline = "CUSTOMIZE  |  PRINT  |  BRAND  |  GIFT"
    d.text((PAD, tagline_y), tagline, font=font(10, bold=True), fill=MUTED)

    inv_no = data.get("orderRef", "N/A")
    right_x = W - PAD
    title = "INVOICE"
    tf = font(30, bold=True)
    _text_right(d, right_x, header_top, title, tf, INK)
    _text_right(d, right_x, header_top + 38, f"#{inv_no}", font(13, bold=True), SUBTEXT)

    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p").lstrip("0")
    order_date = data.get("orderDate") or now_str
    payment_date = data.get("paymentDate") or now_str
    is_cod = data.get("paymentMode") == "cod"
    order_status = data.get("orderStatus") or (
        "Advance Paid — Balance Due on Delivery" if is_cod else "Payment Confirmed"
    )
    payment_method = data.get("paymentMethod") or "Razorpay"

    meta_y = header_top + 66
    meta_rows = [
        ("Order Date", order_date, SUBTEXT),
        ("Payment Date", payment_date, SUBTEXT),
        ("Order Status", order_status, ORANGE if is_cod else GREEN),
        ("Payment Method", payment_method, SUBTEXT),
    ]
    for label, val, color in meta_rows:
        line = f"{label}: {val}"
        _text_right(d, right_x, meta_y, line, font(11), color)
        meta_y += 18

    y = max(y + 90, meta_y + 8)

    d.line([(PAD, y), (W - PAD, y)], fill=LINE, width=1)
    y += 26

    # ── Bill To / Ship To ────────────────────────────────────────────────────
    cust = data.get("customer", {})
    addr = data.get("address", {})
    ship = data.get("shipAddress", addr)  # falls back to billing address when there's no separate one

    col_w = (W - 2 * PAD - 40) // 2
    col2_x = PAD + col_w + 40

    def address_block(x, heading, name, phone, email, a):
        yy = y
        d.text((x, yy), heading, font=font(11, bold=True), fill=MUTED)
        yy += 22
        if name:
            d.text((x, yy), name, font=font(15, bold=True), fill=INK)
            yy += 22
        addr_lines = []
        line1 = a.get("line1", "")
        line2 = a.get("line2", "")
        if line1:
            addr_lines.append(line1 + (f", {line2}" if line2 else ""))
        city_line = ", ".join(filter(None, [a.get("city"), a.get("state")]))
        if a.get("pincode"):
            city_line = (city_line + f" – {a.get('pincode')}") if city_line else a.get("pincode")
        if city_line:
            addr_lines.append(city_line)
        addr_lines.append("India")
        for line in addr_lines:
            for wrapped in textwrap.wrap(line, width=44) or [""]:
                d.text((x, yy), wrapped, font=font(12), fill=SUBTEXT)
                yy += 17
        yy += 6
        if phone:
            icon_phone(d, x + 7, yy + 7, 6, SUBTEXT)
            d.text((x + 20, yy), phone, font=font(12), fill=SUBTEXT)
            yy += 18
        if email:
            icon_mail(d, x + 7, yy + 6, 6, SUBTEXT)
            d.text((x + 20, yy), email, font=font(12), fill=SUBTEXT)
            yy += 18
        return yy

    y1 = address_block(PAD, "BILL TO", cust.get("name"), cust.get("phone"), cust.get("email"), addr)
    y2 = address_block(col2_x, "SHIP TO", cust.get("name"), cust.get("phone"), None, ship)
    y = max(y1, y2) + 16

    d.line([(PAD, y), (W - PAD, y)], fill=LINE, width=1)
    y += 24

    # ── Item table ───────────────────────────────────────────────────────────
    col_num = PAD
    col_product = PAD + 36
    col_details = PAD + 380
    col_qty = W - PAD - 210
    col_price = W - PAD - 130
    col_total = W - PAD

    d.rounded_rectangle([PAD, y, W - PAD, y + 32], radius=8, fill=PANEL)
    fnt_th = font(10, bold=True)
    d.text((col_num + 4, y + 10), "#", font=fnt_th, fill=SUBTEXT)
    d.text((col_product, y + 10), "PRODUCT", font=fnt_th, fill=SUBTEXT)
    d.text((col_details, y + 10), "DETAILS", font=fnt_th, fill=SUBTEXT)
    _text_right(d, col_qty + 24, y + 10, "QTY", fnt_th, SUBTEXT)
    _text_right(d, col_price + 30, y + 10, "PRICE", fnt_th, SUBTEXT)
    _text_right(d, col_total, y + 10, "TOTAL", fnt_th, SUBTEXT)
    y += 32

    product = data.get("productName", "")
    sku = data.get("productSku") or ""
    size = data.get("selectedSize")
    color = data.get("selectedColor")
    delivery = data.get("deliveryLabel") or {
        "sameday": "Same-day", "pickup": "Self Pick Up",
    }.get((data.get("deliveryType") or "standard"), "Standard")
    qty = data.get("quantity", 1)
    unit_p = data.get("pricePerUnit", 0)
    embroidery_charge = data.get("embroideryCharge") or 0
    dtf_charge = data.get("dtfCharge") or 0
    print_charge = embroidery_charge + dtf_charge  # at most one of these is ever non-zero
    line_total = unit_p * qty + print_charge

    row_h = 100 if print_charge else 84
    d.line([(PAD, y), (W - PAD, y + row_h)], fill=None)  # no-op, keeps row_h referenced
    thumb_box = [col_product, y + 8, col_product + 64, y + 8 + 64]
    thumb = _fetch_remote_image(data.get("productImage", ""))
    if thumb:
        thumb = _fit(thumb.convert("RGB").convert("RGBA"), 64, 64)
        tx = col_product + (64 - thumb.width) // 2
        ty = y + 8 + (64 - thumb.height) // 2
        mask = Image.new("L", thumb.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, thumb.width, thumb.height], radius=8, fill=255)
        img.paste(thumb, (tx, ty), mask)
    else:
        d.rounded_rectangle(thumb_box, radius=8, fill=PANEL, outline=LINE, width=1)

    text_x = col_product + 76
    d.text((col_num + 4, y + 26), "1", font=font(12), fill=SUBTEXT)
    d.text((text_x, y + 10), product, font=font(13, bold=True), fill=INK)
    if sku:
        d.text((text_x, y + 30), f"SKU: {sku}", font=font(10), fill=MUTED)

    details_lines = []
    if size:
        details_lines.append(f"Size: {size}")
    if color:
        details_lines.append(f"Color: {color}")
    details_lines.append(f"Delivery: {delivery}")
    if embroidery_charge:
        details_lines.append(f"Embroidery charge: ₹{embroidery_charge:,.0f}")
    elif dtf_charge:
        details_lines.append(f"DTF print charge: ₹{dtf_charge:,.0f}")
    dy = y + 6
    for line in details_lines:
        d.text((col_details, dy), line, font=font(11), fill=SUBTEXT)
        dy += 16

    _text_right(d, col_qty + 24, y + 10, str(qty), font(12), INK)
    _text_right(d, col_price + 30, y + 10, f"\u20b9{unit_p:,.0f}", font(12), INK)
    _text_right(d, col_total, y + 10, f"\u20b9{line_total:,.0f}", font(13, bold=True), INK)

    y += row_h
    d.line([(PAD, y), (W - PAD, y)], fill=LINE, width=1)
    y += 26

    # ── Summary box (right-aligned) ─────────────────────────────────────────
    subtotal = line_total
    same_day = data.get("sameDayCharge", 0)
    gst_pct = data.get("gstPercent", 5)  # matches the site's real 5% GST — NOT the 18% shown
    # in the reference screenshot, which looks like generic placeholder text.
    gst_amount = data.get("gstAmount")
    if gst_amount is None:
        gst_amount = round((subtotal + same_day) * gst_pct / 100)
    grand_total = data.get("grandTotal", subtotal + same_day + gst_amount)

    # COD orders only ever collect a small advance via Razorpay right now \u2014
    # the rest is cash on delivery and hasn't actually been paid yet, so it
    # must never be labelled "Total Paid". advance_paid defaults to the full
    # grand_total (i.e. behaves exactly like the old prepaid-only invoice)
    # whenever paymentMode/advanceAmountPaid aren't passed at all.
    advance_paid = data.get("advanceAmountPaid", grand_total)
    cod_due = data.get("codDueAmount", 0) if is_cod else 0

    box_w = 300
    box_x = W - PAD - box_w
    box_y = y
    rows = [("Subtotal", f"\u20b9{subtotal:,.0f}", False)]
    if same_day:
        rows.append(("Same-day delivery", f"\u20b9{same_day:,.0f}", False))
    else:
        rows.append(("Shipping", "Free", False))
    rows.append((f"GST ({gst_pct:g}%)", f"\u20b9{gst_amount:,.0f}", False))
    if is_cod and cod_due:
        rows.append(("Order Total", f"\u20b9{grand_total:,.0f}", False))
    box_h = 24 * len(rows) + 56 + (26 if (is_cod and cod_due) else 0)
    _rounded_panel(d, [box_x, box_y, box_x + box_w, box_y + box_h], fill=PANEL, radius=12)

    ry = box_y + 16
    for label, val, bold in rows:
        d.text((box_x + 18, ry), label, font=font(12), fill=SUBTEXT)
        _text_right(d, box_x + box_w - 18, ry, val, font(12, bold=bold), INK)
        ry += 24

    d.line([(box_x + 18, ry + 2), (box_x + box_w - 18, ry + 2)], fill=LINE, width=1)
    ry += 14
    if is_cod and cod_due:
        # Two-line breakdown instead of a single "Total Paid" \u2014 showing the
        # full order total there would falsely claim the customer already
        # paid the cash-on-delivery portion.
        d.text((box_x + 18, ry), "Paid Now (Advance)", font=font(13, bold=True), fill=INK)
        _text_right(d, box_x + box_w - 18, ry, f"\u20b9{advance_paid:,.0f}", font(15, bold=True), GREEN)
        ry += 26
        d.text((box_x + 18, ry), "Due on Delivery (COD)", font=font(13, bold=True), fill=INK)
        _text_right(d, box_x + box_w - 18, ry, f"\u20b9{cod_due:,.0f}", font(15, bold=True), ORANGE)
        ry += 30
    else:
        d.text((box_x + 18, ry), "Total Paid", font=font(14, bold=True), fill=INK)
        _text_right(d, box_x + box_w - 18, ry, f"\u20b9{grand_total:,.0f}", font(16, bold=True), GREEN)
        ry += 30
    note = "All prices are inclusive of applicable taxes"
    d.text((box_x + box_w - _tw(d, note, font(9)), ry), note, font=font(9), fill=MUTED)

    # ── Thank you (left column, alongside the summary box) ──────────────
    # thank-you.webp is the designed graphic (script "Thank you" + "for
    # shopping with us" caption baked in). Drawn starting at the SAME row
    # as the summary box (box_y) rather than after it — the summary box
    # only occupies the right ~300px, so anchoring "Thank you" to box_y
    # instead of to the summary box's bottom fills the empty left-hand
    # space next to it instead of leaving it blank. Vertically centered
    # against the box's height so it doesn't look pinned to the very top.
    if thankyou_asset:
        ty_img = _fit(thankyou_asset, 260, 110)
        ty_y = box_y + max(0, (box_h - ty_img.height) // 2)
        img.paste(ty_img, (PAD, ty_y), ty_img)
        ty_bottom = ty_y + ty_img.height
    else:
        ty_y = box_y + max(0, (box_h - 76) // 2)
        d.text((PAD, ty_y + 10), "Thank you \u2764", font=font(30, italic=True), fill=INK)
        d.text((PAD, ty_y + 56), "FOR SHOPPING WITH US!", font=font(11, bold=True), fill=SUBTEXT)
        ty_bottom = ty_y + 76

    # Next section starts below whichever of the two (summary box vs.
    # thank-you block) is taller, so nothing overlaps either column.
    y = max(box_y + box_h, ty_bottom) + 36


    # ── Trust badges row ─────────────────────────────────────────────────────
    badges = [
        (icon_shield_check, GREEN, GREEN_BG, "Secure Payments", "100% safe & secure"),
        (icon_box, ORANGE, ORANGE_BG, "Easy Returns", "15 days return policy"),
        (icon_truck, BLUE, BLUE_BG, "Pan India Delivery", "Fast & reliable"),
        (icon_headset, PURPLE, PURPLE_BG, "Dedicated Support", "We're here to help"),
    ]
    badge_w = (W - 2 * PAD) // 4
    for i, (icon_fn, color, bg, title_, sub) in enumerate(badges):
        bx = PAD + i * badge_w
        cx, cy, r = bx + 24, y + 22, 18
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=bg)
        icon_fn(d, cx, cy, 10, color)
        d.text((bx + 52, y + 10), title_, font=font(12, bold=True), fill=INK)
        d.text((bx + 52, y + 28), sub, font=font(10), fill=SUBTEXT)
    y += 68

    d.line([(PAD, y), (W - PAD, y)], fill=LINE, width=1)
    y += 4

    # ── "Need Help?" band ────────────────────────────────────────────────────
    band_h = 96
    _rounded_panel(d, [PAD, y, W - PAD, y + band_h], fill=PANEL, radius=0)
    col_w3 = (W - 2 * PAD) // 3
    support_phone = data.get("supportPhone") or "+91 90043 63902"
    support_email = data.get("supportEmail") or "support@cluesstyle.com"
    support_hours = data.get("supportHours") or "Mon – Sat, 10 AM – 8 PM"

    help_cols = [
        (icon_chat, "Need Help?", "For any questions about your order, feel free to contact us."),
        (icon_phone, support_phone, support_hours),
        (icon_mail, support_email, "We reply within 24 hrs"),
    ]
    for i, (icon_fn, title_, sub) in enumerate(help_cols):
        cx0 = PAD + i * col_w3 + 30
        cy0 = y + band_h // 2
        d.ellipse([cx0 - 16, cy0 - 24, cx0 + 16, cy0 + 8], fill=WHITE, outline=LINE, width=1)
        icon_fn(d, cx0, cy0 - 8, 9, INK)
        tx0 = cx0 + 32
        col_text_w = col_w3 - 70
        d.text((tx0, y + 24), title_, font=font(12, bold=True), fill=INK)
        wrap_chars = max(12, col_text_w // 6)
        sub_y = y + 44
        for wl in textwrap.wrap(sub, width=wrap_chars) or [sub]:
            d.text((tx0, sub_y), wl, font=font(10), fill=SUBTEXT)
            sub_y += 15
        if i < 2:
            d.line([(PAD + (i + 1) * col_w3, y + 16), (PAD + (i + 1) * col_w3, y + band_h - 16)], fill=LINE, width=1)

    y += band_h

    # ── Bottom black footer band ─────────────────────────────────────────────
    footer_h = 190
    d.rectangle([0, y, W, y + footer_h], fill=BLACK)
    fy = y + 26

    # Same as the header — the logo image already carries the wordmark, so
    # no separate "Cluesstyle" / ".com" text is drawn next to it here
    # either. Sized to roughly the same footprint the old icon+text row
    # used to occupy (~48px tall). Uses the white/light variant since this
    # band's background is black.
    footer_logo = logo_asset_white or logo_asset
    if footer_logo:
        logo_w = _fit(footer_logo, 190, 48)
        img.paste(logo_w, (PAD, fy), logo_w)
        below_logo_y = fy + logo_w.height + 10
    else:
        d.text((PAD, fy), "Cluesstyle", font=font(17, bold=True), fill=WHITE)
        d.text((PAD, fy + 22), ".com", font=font(10), fill=MUTED)
        below_logo_y = fy + 48

    d.text((PAD, below_logo_y), "CUSTOMIZE | PRINT | BRAND | GIFT", font=font(9, bold=True), fill=MUTED)
    tagline_full = "Your one-stop destination for custom apparel, corporate gifts, print solutions and more."
    ty2 = below_logo_y + 20
    for wl in textwrap.wrap(tagline_full, width=42):
        d.text((PAD, ty2), wl, font=font(10), fill=(203, 213, 225))
        ty2 += 15

    # Middle — socials
    mid_cx = W // 2 - 30
    d.text((mid_cx - 40, fy + 4), "Ideas Worn Better", font=font(14, italic=True), fill=WHITE)
    d.text((mid_cx - 40, fy + 34), "Follow Us", font=font(10, bold=True), fill=MUTED)
    socials = ["ig", "fb", "yt", "in", "pt"]
    sx = mid_cx - 40
    sy = fy + 60
    for label in socials:
        d.ellipse([sx, sy, sx + 26, sy + 26], outline=(71, 85, 105), width=1)
        d.text((sx + 13 - _tw(d, label[0].upper(), font(10, bold=True)) // 2, sy + 6),
               label[0].upper(), font=font(10, bold=True), fill=WHITE)
        sx += 34

    # Right — QR + website
    qr_size = 92
    qr_x = W - PAD - qr_size
    qr_y = fy
    site_url = data.get("qrUrl") or "https://cluesstyle.com"
    if qrcode:
        qr_img = qrcode.make(site_url).convert("RGB").resize((qr_size, qr_size))
        d.rectangle([qr_x - 6, qr_y - 6, qr_x + qr_size + 6, qr_y + qr_size + 6], fill=WHITE)
        img.paste(qr_img, (qr_x, qr_y))
    else:
        d.rectangle([qr_x, qr_y, qr_x + qr_size, qr_y + qr_size], outline=WHITE, width=1)
    _text_center(d, qr_x + qr_size // 2, qr_y + qr_size + 12, "Visit Our Website", font(9, bold=True), WHITE)
    _text_center(d, qr_x + qr_size // 2, qr_y + qr_size + 28, site_url.replace("https://", "www.").replace("http://", ""), font(8), MUTED)

    y += footer_h

    # ── Terms strip ──────────────────────────────────────────────────────────
    terms_h = 100
    d.rectangle([0, y, W, y + terms_h], fill=PANEL)
    ty3 = y + 18
    d.text((PAD, ty3), "Terms & Conditions", font=font(11, bold=True), fill=INK)
    ty3 += 20
    terms = [
        "This is a computer-generated invoice and does not require a signature.",
        "Products once customized cannot be returned unless there is a manufacturing defect.",
        "For returns, refer to our Return Policy on our website.",
        "If you have any issues, please contact our support team.",
    ]
    for t in terms:
        d.text((PAD, ty3), f"\u2022 {t}", font=font(9), fill=SUBTEXT)
        ty3 += 15

    if thankyou_asset:
        ty_small = _fit(thankyou_asset, 130, 48)
        img.paste(ty_small, (W - PAD - ty_small.width, y + 20), ty_small)
        note2_y = y + 20 + ty_small.height + 4
    else:
        small_f = font(16, italic=True)
        txt2 = "Thank you \u2764"
        d.text((W - PAD - _tw(d, txt2, small_f), y + 20), txt2, font=small_f, fill=INK)
        note2_y = y + 52
    note2 = "FOR BEING A PART OF"
    note3 = "THE CLUESSTYLE FAMILY!"
    _text_right(d, W - PAD, note2_y, note2, font(8, bold=True), MUTED)
    _text_right(d, W - PAD, note2_y + 12, note3, font(8, bold=True), MUTED)

    y += terms_h + 20

    img = img.crop((0, 0, W, y))
    img.save(out_path, "PNG", dpi=(150, 150))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(
            "Usage: python scripts/generate_invoice.py '<json>' '<out_path>'\n"
            "   or: python scripts/generate_invoice.py @path/to/data.json '<out_path>'",
            file=sys.stderr,
        )
        sys.exit(1)

    # The real Node caller (lib/invoice.ts) always passes the JSON inline as
    # argv[1] via execFile, which is quoting-safe on every platform — that
    # path is unaffected by this. This "@file" form exists only for manual
    # testing from a shell, where passing a large JSON blob with embedded
    # double quotes as a single command-line argument is notoriously fragile
    # on Windows/PowerShell (cmd.exe's argv quoting mangles embedded `"`
    # characters, unlike POSIX shells) — reading the JSON straight from a
    # file sidesteps shell quoting entirely.
    raw_arg = sys.argv[1]
    if raw_arg.startswith("@"):
        json_path = raw_arg[1:]
        with open(json_path, "r", encoding="utf-8") as f:
            payload = json.load(f)
    else:
        payload = json.loads(raw_arg)

    draw_invoice(payload, sys.argv[2])
    print(sys.argv[2])