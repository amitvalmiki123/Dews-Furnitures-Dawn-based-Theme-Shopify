# Dew's Furniture — Kaunsi file, kahan paste karein

Har change ke saath **file name** aur **exact location** diya gaya hai.
Tum sirf copy-paste kar ke manually update kar sakte ho — poori zip upload karne ki zarurat nahi.

---

## 1. Kaunsi file kis page ke liye

| Page / Section | File | Paste kahan |
|---|---|---|
| **Global** — header, footer, hero, rooms, promise, promo, ribbon, section rhythm, type tokens | `assets/style.css` | file ke **sabse end** mein |
| **Collection page** — toolbar, `.shop`, `.chero`, facets, product grid | `assets/dews-collection.css` | file ke **sabse end** mein |
| **PDP / product page** — gallery, buy row, accordion, breadcrumb | `assets/component-dews-product.css` | file ke **sabse end** mein |
| **Pages** — Our craft, Material, Sustainability | `assets/dews-pages.css` | file ke **sabse end** mein |
| **Cart drawer** | `assets/component-cart-drawer.css` | file ke **sabse end** mein |

**Rule:** jis file mein original rule hai, **usi file ke end mein** paste karo.
Tab `!important` ki zarurat nahi padti.

---

## 2. CSS load order (ye samajh lo, aage kaam aayega)

```
1. assets/style.css                    (theme.liquid:281)   <- sabse pehle
2. assets/base.css                     (282)
3. assets/component-cart-items.css     (283)
4. assets/component-cart-drawer.css    (286)
5. assets/component-cart.css           (287)
6. assets/component-totals.css         (288)
7. assets/component-price.css          (289)
8. assets/component-discounts.css      (290)
--- section stylesheets (inke baad load hoti hain) ---
9. assets/dews-collection.css          (main-collection-banner / -product-grid)
10. assets/dews-pages.css              (custom-craft-*)
11. assets/component-dews-product.css  (main-product.liquid)
12. assets/component-facets.css        (main-collection-product-grid / main-search)
```

**Jo file baad mein load hoti hai, woh jeetti hai** (agar specificity barabar ho).
Isliye agar tum `style.css` mein koi aisi cheez change kar rahe ho jo
`dews-collection.css` ya `component-dews-product.css` mein defined hai,
toh `!important` lagana padega.

---

## 3. Responsive changes kahan

Har file ke end mein ye block maujood hai:

```css
@media (max-width: 989px) {
  /* mobile / tablet rules */
}
```

**Mobile changes isi `@media` block ke andar** paste karo.
Agar file mein ye block nahi hai, toh end mein naya bana lo.

Note: `component-facets.css` mein Dawn ka block `@media screen and (max-width: 749px)` hai.

---

## 4. Line numbers kaise dhundho

`Edit code` mein file kholo, phir browser ka Find (`Ctrl/Cmd + F`) use karo —
main har change ke saath **nearby selector** bhi bataata hoon, usse dhoondh lo.

---
---

# Changes, batch by batch


## `179e874` — PDP accordion pin, breadcrumb dot alignment, delegated quick view / quick add

```css
/* Separator dots align with the FIRST line when a crumb wraps onto two lines.
   align-items:center put the dot in the middle of the whole (wrapped) block;
   flex-start + a half-line top margin parks it on the first line instead —
   which is identical to centre while the crumb fits on one line. */
.breadcrumb li{ display:inline-flex; align-items:flex-start; gap:.55rem; }
.breadcrumb li + li::before{
  content:''; width:3px; height:3px; border-radius:50%; background:var(--muted-2); flex:none;
  margin-top: calc(0.85em - 1.5px);  /* half of the 1.7 line-height, less half the dot */
  margin-top: calc(0.5lh - 1.5px);   /* exact, where the lh unit is supported */
}
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

## `1206ebd` — Breadcrumb conflict, PDP discount tag, header icon spacing, mobile section rhythm

```css
/* NOTE: this file is loaded from main-product.liquid, i.e. AFTER style.css,
   so any rule here wins over the duplicate in style.css. Keep the two
   breadcrumb blocks identical or the dot alignment silently breaks. */
.breadcrumb{ display:flex; flex-wrap:wrap; align-items:center; gap:.55rem; font-size:.8rem; color:var(--muted); list-style:none; margin:0; padding:0; }
/* flex-start (not center) so the dot sits on the FIRST line when a crumb wraps */
.breadcrumb li{ display:inline-flex; align-items:flex-start; gap:.55rem; }
.breadcrumb li + li::before{
  content:''; width:3px; height:3px; border-radius:50%; background:var(--muted-2); flex:none;
  margin-top: calc(0.85em - 1.5px);  /* half of the 1.7 line-height, less half the dot */
  margin-top: calc(0.5lh - 1.5px);   /* exact, where the lh unit is supported */
}
/* Discount tag on the main PDP image — top-right corner.
   Mirrors the .product__media .badge--sale treatment used on the cards. */
.gallery__tag{
  position:absolute; top:1rem; right:1rem; z-index:3;
  padding:.4rem .8rem; border-radius:var(--r-pill);
  background:var(--red); color:#fff;
  font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
  box-shadow:var(--shadow-sm); line-height:1; white-space:nowrap;
  pointer-events:none;
}


/* =========================================================
   HEADER (mobile / tablet) — proper spacing around the icons
   On a ~390px phone the row is: hamburger · logo · icons. With 42px icon
   buttons there was no free width left, so the logo and the icon group
   ended up jammed together. Shrink the buttons to buy the width back,
   then keep a real gap between the three groups.
========================================================= */
@media (max-width: 1024px) {
  body .dews-header .header__row { gap: 0.5rem; }   /* beats the `gap:0` rule above */
  .dews-header .icon-btn { width: 38px; height: 38px; }
  .dews-header .icon-btn svg { width: 18px; height: 18px; }
  .dews-header .actions .wishlist-hero-header-icon { width: 38px; height: 38px; }
  .dews-header .actions { margin-left: auto; }
  /* let the wordmark shrink instead of pushing the icons off the row */
  .dews-header .logo { min-width: 0; overflow: hidden; }
  .dews-header .logo__word { overflow: hidden; text-overflow: ellipsis; }
}

@media (max-width: 576px) {
  .dews-header .icon-btn { width: 36px; height: 36px; }
  .dews-header .icon-btn svg { width: 17px; height: 17px; }
  .dews-header .actions .wishlist-hero-header-icon { width: 36px; height: 36px; }
  .dews-header .logo__word { font-size: 0.86rem; }
}

/* =========================================================
   MOBILE / TABLET · tighter vertical rhythm
   Desktop keeps --section-y; phones and tablets get a compact 30px so the
   page reads as one continuous scroll instead of separate slides.
========================================================= */
@media (max-width: 989px) {
  .section,
  .section--tight { padding-block: 30px; }

  /* the eyebrow must not add its own top margin on top of the 30px, or the
     gap above a section doubles */
  .section-head p { margin-top: 0; }
  /* …but a description sitting directly under an h2 still needs its gap */
  .section-head h2 + p { margin-top: 1.1rem; }
}
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

## `8ec23c9` — Cart drawer: single close button, fixed scroll layout, tighter typography

```css

/* =========================================================
   CART DRAWER — empty state, scroll layout, typography
========================================================= */

/* --- 1. Empty cart: ONE close button, pinned to the drawer corner ---------
   Dawn hides .drawer__header when the cart is empty and renders its own close
   button inside .cart-drawer__empty-content. Two things broke that:
     a) the compact-header rule above uses display:flex !important, which
        defeated `cart-drawer.is-empty .drawer__header { display: none }`;
     b) `is-empty` is only ever REMOVED by the theme JS, never added, so after
        an AJAX removal the fresh markup contains BOTH close buttons.
   The :has() form is JS-independent — it keys off the empty-state markup
   itself, so it works no matter how the drawer was re-rendered. */
cart-drawer.is-empty .drawer__header,
cart-drawer:has(.drawer__inner-empty) .drawer__header { display: none !important; }

cart-drawer.is-empty .drawer__inner-empty {
  position: relative;      /* containing block for the close button */
  width: 100%;
  align-self: stretch;
}

cart-drawer .cart-drawer__warnings .drawer__close,
cart-drawer.is-empty .cart-drawer__empty-content .drawer__close {
  position: absolute !important;
  top: 0.85rem !important;
  right: 0 !important;                      /* 1.5rem from the drawer edge */
  min-width: 2.5rem !important; min-height: 2.5rem !important;
  width: 2.5rem !important; height: 2.5rem !important;
  display: grid !important; place-items: center !important;
  padding: 0 !important; background: transparent !important;
  border: 0 !important; box-shadow: none !important;
}
cart-drawer .cart-drawer__warnings .drawer__close .svg-wrapper,
cart-drawer.is-empty .cart-drawer__empty-content .drawer__close .svg-wrapper {
  width: 1.05rem !important; height: 1.05rem !important;
  display: grid !important; place-items: center !important;
}
cart-drawer .cart-drawer__warnings .drawer__close svg,
cart-drawer.is-empty .cart-drawer__empty-content .drawer__close svg {
  width: 100% !important; height: 100% !important; display: block !important;
}
/* normal (non-empty) header close — same optical inset as the empty one */
cart-drawer .drawer__close { right: 0 !important; }

/* --- 2. "Continue shopping" hover --------------------------------------- */
cart-drawer.is-empty .drawer__inner-empty .button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px #0000001f!important;
    background-color: var(--cane);
}

/* --- 3. "Log in to check out faster" link ------------------------------- */
.cart__login-paragraph a {
    font-size: inherit;
    color: #666;
    text-decoration: none;
    border-bottom: 1px solid #666;
}

/* --- 4. Scroll layout: fixed header · scrolling items · fixed footer ---- */
cart-drawer .drawer__inner { overflow: hidden !important; }
cart-drawer .drawer__header { flex: none !important; }
cart-drawer-items {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
  scrollbar-width: thin;
}
cart-drawer .drawer__footer { flex: none !important; }
/* Dawn flips both of these on short screens — keep the same split instead */
@media screen and (max-height: 650px) {
  cart-drawer-items { overflow-y: auto !important; }
  cart-drawer .drawer__inner { overflow: hidden !important; }
}

/* --- 5. Cart item typography & spacing ---------------------------------- */
cart-drawer .cart-item {
  gap: 0.9rem 1rem !important;
  padding-block: 1rem !important;
  border-bottom: 1px solid var(--line-soft);
}
cart-drawer .cart-item:last-child { border-bottom: 0; }
cart-drawer .cart-item__media { grid-row: 1 / 3; }
cart-drawer .cart-item__image { width: 100%; border-radius: var(--r-xs); }
cart-drawer .cart-item__name,
cart-drawer .cart-item__title {
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  line-height: 1.35 !important;
}
cart-drawer .cart-item__details { font-size: 0.8rem !important; line-height: 1.5; }
cart-drawer .cart-item__price-wrapper,
cart-drawer .cart-item__totals,
cart-drawer .cart-item__final-price { font-size: 0.85rem !important; }
cart-drawer .cart-item__old-price { font-size: 0.78rem !important; }
cart-drawer .product-option { font-size: 0.78rem !important; }

/* --- 6. Judge.me review widget inside the drawer ------------------------ */
/* Scoped to the drawer so the storefront widget is untouched. */
cart-drawer .jm-review-widget[data-v-d92151cd] { padding-block: 0.75rem !important; }
cart-drawer .jm-text[data-v-6d928e9f] { font-size: 1rem !important; line-height: 1.35 !important; }
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

## `f4884be` — Harden the cart drawer empty-state fix against JS response shapes

```css
/* NOTE: deliberately two separate rules, not one comma-separated list. An
   invalid selector inside a selector list invalidates the WHOLE rule, so if a
   browser does not support :has() the is-empty rule must still survive. */
cart-drawer.is-empty .drawer__header { display: none !important; }
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

## `5e5702e` — Batch 8: wishlist badge, cart drawer extras, equal +/- icons, filter drawer, mobile type

```css
section#shopify-section-template--28482456912053__reviews-heading { background-color: var(--bone); padding-block-start: 4.3rem; }

/* Store-independent twin of the three id rules above. Scoped to the HOMEPAGE
   on purpose: the same review section also renders on the PDP, where the bone
   background must NOT be applied. `template-index` is emitted on <body> by
   layout/theme.liquid. The id rules are left exactly as they were. */
body.template-index section.dews-reviews-heading { background-color: var(--bone); padding-block-start: 4.3rem; }
   the store / theme copy — so cover both.
   Scoped to body.template-index for the same reason as above: this section
   exists on the PDP too and must keep its own background there. */
body.template-index [id$="__1788325876b6967a8d"],
body.template-index [id$="-1788325876b6967a8d"] {
#shopify-section-template--22920630862021__1788325876b6967a8d {
	padding-top: 0;
	background-color: var(--bone);
}
  /* the app sizes the badge with an inline stretched span — keep it hugging
     its number instead of stretching, and cancel any left offset it ships */
  width: fit-content !important;
  left: auto !important;

/* =========================================================
   BATCH — cart drawer extras, +/- icons, filter drawer,
   footer rhythm, homepage reviews, mobile typography
========================================================= */

/* --- (2a) Cart note + drawer footer disclosure --------------------------- */
.cart__note {
  height: fit-content;
  top: 0;
}

.drawer__footer summary {
  display: flex;
  position: relative;
  line-height: normal;
  padding: 1rem;
  font-size: 0.8rem;
}

/* --- (2b) Checkout button hover ----------------------------------------- */
.cart__checkout-button:hover {
  background-color: var(--cane) !important;
  transform: translateY(-2px) !important;
}

/* --- (2c) Totals — desktop size was oversized --------------------------- */
/* component-totals.css ships `.totals__total-value{font-size:1.8rem}` and
   component-cart-drawer.css pins the drawer copy to 1.2rem; both of those are
   enqueued after this file, so !important is the only way to win cleanly. */
.totals > h2,
.totals .totals__total,
.totals .totals__total-value {
  font-size: 1.1rem !important;
  line-height: 1.35 !important;
}

/* --- (2d) Mobile cart row ----------------------------------------------- */
/* Scoped to the drawer: on the cart PAGE .cart-item is a <tr>, and forcing
   display:grid there would collapse the table layout. */
@media screen and (max-width: 990px) {
  cart-drawer .cart-item {
    display: grid !important;
    grid-template-columns: 100px 1fr !important;
    gap: 1.5rem !important;
    padding-top: 1rem !important;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
    border-bottom: 1px solid #eaeaea !important;
    align-items: start !important;
  }
  cart-drawer .cart-item:last-child { border-bottom: 0 !important; }
  /* an earlier rule pins the thumb to column 1 / rows 1-3; keep the line
     total in column 2 under the details instead of wrapping under the thumb */
  cart-drawer .cart-item__totals { grid-column: 2 !important; grid-row: auto !important; }
}

/* --- (4) Footer rhythm on mobile ---------------------------------------- */
@media (max-width: 989px) {
  .footer { padding-top: 30px; }
}

/* --- (5) Equal +/- icons everywhere ------------------------------------- */
/* The collection rail shipped 13px while the FAQ page and the PDP accordion
   use 16px, so the very same toggle read as two different icons. Lock one box
   size and centre the rule properly, so + and - swap inside an identical box.
   !important because dews-collection.css is enqueued from a section, i.e.
   after this file. */
.faq__icon,
.facet__q .faq__icon {
  position: relative;
  width: 16px !important;
  height: 16px !important;
  flex: none;
}
.faq__icon::before,
.faq__icon::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1.5px;
  margin-top: -0.75px;          /* true centring without spending `transform` */
  background: currentColor;
  transition: transform 0.4s var(--ease);
}
.faq__icon::after { transform: rotate(90deg); }
.faq__item.is-open .faq__icon::after,
.facet[open] .faq__icon::after { transform: rotate(0); }

/* --- (6) Collection filter drawer must clear the sticky header ----------- */
/* .mobile-facets and .shopify-section-group-header-group are BOTH z-index
   100, so the drawer's X ended up underneath the header on mobile. */
@media screen and (max-width: 1100px) {
  /* `html` prefix: component-facets.css is enqueued from a section (i.e. after
     this file) with the same `!important` z-index, so specificity decides. */
  html .mobile-facets { z-index: 300 !important; }
  html .mobile-facets__inner { z-index: 301 !important; }
}

/* --- (7) Mobile typography + tighter section rhythm --------------------- */
/* Every heading/lead size is a clamp() whose *minimum* is what mobile hits
   (3.3vw at 390px is ~13px, far below the 1.85rem floor). So the fix belongs
   on the tokens: lower the floors and let the middle value breathe. */
@media (max-width: 989px) {
  :root {
    --t-hero: clamp(2rem, 8.5vw, 2.8rem);
    --t-display: clamp(1.7rem, 6.8vw, 2.35rem);
    --t-h2: clamp(1.3rem, 5.6vw, 1.85rem);
    --t-h3: clamp(0.95rem, 3.6vw, 1.15rem);
    --t-lead: clamp(0.88rem, 3.8vw, 1rem);
    --t-body: 0.95rem;
    --section-y: 30px;
  }

  /* cart totals one more step down on a phone */
  .totals > h2,
  .totals .totals__total,
  .totals .totals__total-value { font-size: 1rem !important; }

  /* section head sits closer to the grid it introduces */
  .section-head { margin-bottom: 1.5rem; gap: 1rem; }
  .section-head p,
  .section-head__text p { font-size: 0.9rem; line-height: 1.65; }

  /* product / content grids breathe less on a phone */
  .grid-products { gap: 1.15rem 1rem; }
  .footer__grid { gap: 1.75rem; }
  .footer__signup h2 { font-size: clamp(1.3rem, 6vw, 1.75rem); }
  .footer__contact-text,
  .footer__brand p { font-size: 0.86rem; line-height: 1.7; }

  /* long-form copy */
  .seo-copy p,
  .seo-copy li { font-size: 0.88rem; line-height: 1.7; }
  .section li, .section p { line-height: 1.7; }

  /* reviews: 30px above the heading, 30px below the app widget, so the two
     sections that are not one wrapper still read as one 30px rhythm */
  .section.dews-reviews-heading { padding-block-start: 30px; }
  body.template-index [id$="__1788325876b6967a8d"],
  body.template-index [id$="-1788325876b6967a8d"] { padding-block-end: 30px; }
}
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

## `69cab81` — Soften the mobile type scale — the first pass overshot

```css
    --t-hero: clamp(2.2rem, 8.5vw, 3rem);
    --t-display: clamp(1.85rem, 6.8vw, 2.5rem);
    --t-h2: clamp(1.55rem, 6.2vw, 2.1rem);
    --t-lead: clamp(0.95rem, 3.8vw, 1.05rem);
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

## `a1918d3` — Mobile polish: craft heading, 40px rhythm, collection double-padding fix

```css
  .section--tight { padding-block: 40px; }
    --t-h2: clamp(1.65rem, 6.4vw, 2.1rem);

/* =========================================================
   MOBILE POLISH — headings, rhythm, component spacing
========================================================= */
@media (max-width: 989px) {

  /* --- double padding fix ------------------------------------------------
     The `.section, .section--tight` rule a few lines up is what gives mobile
     its 40px rhythm, but it now wins over the two collection-page rules that
     zero their own padding-block (they sit earlier in this file and have the
     same specificity). Re-asserted here so those sections do not double up. */
  .dews-collection-about,
  .dews-more-collections { padding-block: 0; }

  /* --- reviews: 30px above the heading, nothing below --------------------
     The Judge.me widget section below it supplies the tail gap, so the two
     halves together still read as one section. */
  body.template-index section.dews-reviews-heading {
    background-color: var(--bone);
    padding-block-start: 30px;
    padding-bottom: 0;
  }

  /* --- heading offsets --------------------------------------------------- */
  .section-head h2 { margin-top: 8px; }
  .hero h1 { margin-top: 0.75rem; }

  /* --- "Our craft" heading -----------------------------------------------
     #craft-title is a bare <h2> (no .section-head h2 wrapper), so it was
     falling back to Dawn's base h2 — calc(--font-heading-scale * 2rem) —
     which is far bigger than --t-h2. Pin it to the same scale. */
  #craft-title { font-size: var(--t-h2); }

  /* --- craft step numbers: sit on the heading's baseline ------------------ */
  .step__num { padding-top: 0; }

  /* --- ribbon ------------------------------------------------------------ */
  .ribbon { padding: 10px 0; }

  /* --- collection page --------------------------------------------------- */
  .chero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 15px;
    margin-top: 15px;
  }
  .shop {
    grid-template-columns: minmax(0, 1fr);
    padding-bottom: 0;
  }
}

@media (max-width: 576px) {
  .rooms__name { font-size: 1.2rem; }
}
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

## `aa4055a` — Red diamond list dots, search page layout, filter drawer, hero proof, rooms touch

```css
  html .mobile-facets { z-index: 99999 !important; }
  html .mobile-facets__inner { z-index: 100000 !important; }

  /* Raising the drawer alone was not enough here: with the header in its
     non-sticky state the drawer still painted underneath it. Pin the whole
     header below the drawer for as long as the facet <details> is open, so it
     cannot win in either the sticky or the static state. */
  html body:has(.mobile-facets__disclosure[open]) .shopify-section-group-header-group,
  html body:has(.mobile-facets__disclosure[open]) .header,
  html body:has(.mobile-facets__disclosure[open]) .dews-header { z-index: 1 !important; }

/* =========================================================
   BATCH — list dots, search page, hero proof
========================================================= */

/* --- (1) Red diamond bullets -------------------------------------------
   Our craft / Material / Sustainability all render the same
   .craft-content .rte list, which was using the default round marker tinted
   --cane. Swap it for the same 5px red diamond used by .seo-copy and .dew
   elsewhere. Scoped to .craft-content so nothing else changes.
   !important because dews-pages.css is enqueued from the section, i.e. after
   this file. */
.craft-content .rte ul { list-style: none !important; padding-left: 0 !important; }
.craft-content .rte li { position: relative; padding-left: 1.15rem; }
.craft-content .rte li::before {
  content: '';
  position: absolute;
  left: 0;
  top: calc(0.9em - 2.5px);   /* half the 1.8 line-height, less half the dot */
  width: 5px;
  height: 5px;
  background: var(--red);
  transform: rotate(45deg);
}
.craft-content .rte li::marker { color: transparent !important; }

/* --- (2) Search page only ----------------------------------------------
   .chero--single also renders on collection / list-collections banners when
   there is no hero image, so everything here is scoped to body.template-search
   (the template name is emitted on <body> by layout/theme.liquid). */
body.template-search .chero--single .chero__text {
  max-width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
/* the search field was capped at 34rem — let it fill the centred column */
body.template-search .search-page__form { max-width: 100%; width: 100%; }

body.template-search predictive-search[open] .predictive-search,
body.template-search predictive-search[loading] .predictive-search {
  display: block;
  width: 100%;
  z-index: 9;
}
/* The collection toolbar is sticky at z-index 10, so the popup's own z-index
   9 alone would still let the toolbar paint over it. Drop the toolbar for as
   long as the predictive results are open. */
body.template-search:has(predictive-search[open]) .toolbar { z-index: 1 !important; }

/* --- (4) Hero proof badges on phones ------------------------------------ */
@media (max-width: 768px) {
  .hero__proof { gap: 3px 20px; }
}
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

## `0c5f3f2` — Promo eyebrow, promise boxes, footer perks, app-widget gaps, PDP padding

```css

/* =========================================================
   BATCH — promo eyebrow, promise, footer perks,
   app-widget gaps, PDP section double padding
========================================================= */

/* --- Promo eyebrow ------------------------------------------------------
   `.promo p { font-size: var(--t-lead) }` (line ~365) outranks the base
   `.eyebrow { font-size: var(--t-label) }` — `.promo p` is class+type while
   `.eyebrow` is a bare class — and the promo eyebrow IS a <p>. Pin it back to
   --t-label, scoped to .promo__body so nothing else in .promo changes. */
.promo__body .eyebrow { font-size: var(--t-label); }

@media (max-width: 989px) {

  /* --- Promise boxes ---------------------------------------------------- */
  .promise__item { padding: 15px; }
  .promise__icon { width: 30px; height: 30px; color: var(--ink); margin-bottom: 10px; }

  /* --- Footer newsletter perks ------------------------------------------ */
  .newsletter__perks { gap: 8px 20px; }

  /* --- Judge.me cards carousel: default bottom margin -------------------
       Applies to both the homepage and the PDP — the widget markup is
       identical on the two. */
  .jdgm-widget.jdgm-cards-carousel .jdgm-content { margin-bottom: 0; }

  /* --- PDP sections: cancel the doubled 40px ---------------------------
       .dews-related-wrapper, .dews-recently-viewed and .dews-complete-look
       each carry `padding-block: 0` earlier in this file, but the mobile
       `.section, .section--tight { padding-block: 40px }` rule sits further
       down with the same specificity, so it wins and stacks 40px twice.
       Re-asserted here so each section keeps the 40px rhythm once. */
  .dews-related-wrapper { padding-block: 0 !important; }
  .dews-recently-viewed { padding-block: 0; }
  .dews-complete-look   { padding-block: 0; }
}

/* --- Reviews: strip the app widget's own default gaps ------------------- */
section#shopify-section-template--28486573293749__reviews-heading {
    padding-bottom: 0;
}
section#shopify-section-template--28486573293749__judgeme-reviews {
    padding-block: 0;
}

.jm-review-widget.jm-review-widget--minimal-header {
    padding-block: 0;
}
.jdgm-tabs.jm-review-widget-minimal-header__tabs {
    margin-block: 0;
}
```

> **Paste:** `assets/style.css` ke sabse end mein.

---

# Non-CSS changes (JS / Liquid)

Ye sirf CSS se nahi ho sakte — file khol kar exactly ye edit karo:

| Batch | File | Change |
|---|---|---|
| `aa4055a` | `assets/script.js` | rooms IIFE — `mouseenter` / `focusin` ke saath `pointerdown` + `touchstart` (passive) listeners add karo, taaki touch pe active row switch ho |
| `f4884be` | `assets/cart-drawer.js` | `renderContents` mein, section re-render ke baad: `if (typeof parsedState.item_count === 'number') { this.classList.toggle('is-empty', parsedState.item_count === 0); } else if (!this.querySelector('.drawer__inner-empty')) { this.classList.remove('is-empty'); }` |
| `0c5f3f2` | `layout/theme.liquid` | `<body class="gradient template-{{ template.name }} ...">` — `body.template-index` / `body.template-search` scoping ke liye |

Poori diff hamesha branch par milti hai: `git show <batch>` ya GitHub par commit dekho.
