# Dew's Furniture — Support & Legal Pages Setup

> Theme me **koi change nahi chahiye**. Ye saare pages Shopify admin se bante hain
> aur theme ke existing `page` template (Dew's styling ke saath) se render hote hain.
> Isliye **koi JSON remove / upload error ka risk bilkul nahi hai.**

---

## CATEGORY 1 — Shopify ke built-in Policy pages

Ye 4 pages Shopify khud provide karta hai. Inka content **Settings → Policies** me
bharte ho, aur inke URLs apne aap ban jaate hain. Inhe koi template banane ki zaroorat nahi.

### Step 1 — Policies bharo

**Shopify Admin → Settings → Policies**

Neeche har policy ka ready-to-paste content hai. Bas copy karke paste kar do.

| Policy | Auto URL |
|---|---|
| Privacy Policy | `/policies/privacy-policy` |
| Terms of Service | `/policies/terms-of-service` |
| Refund Policy | `/policies/refund-policy` |
| Shipping Policy | `/policies/shipping-policy` |

---

### 📄 Privacy Policy (copy-paste)

```text
PRIVACY POLICY

Dew's Furniture ("we", "us", "our") respects your privacy. This policy explains what
we collect, why we collect it, and how we keep it safe.

INFORMATION WE COLLECT

- Contact details — your name, email address, phone number and delivery address
  when you place an order or sign up to our newsletter.
- Order information — the products you buy, payment status and delivery details.
- Technical data — browser type, device and pages visited, collected via cookies
  and similar technologies.

HOW WE USE YOUR INFORMATION

We use your information to:
- Process and deliver your orders.
- Send order updates and (if you opt in) marketing emails.
- Improve our products and website.
- Meet our legal and tax obligations.

COOKIES

Cookies help us remember your cart, keep you signed in and understand how you use
our site. You can control cookies through your browser settings.

THIRD PARTIES

We share information only with trusted partners who help us run the store — payment
processors, delivery carriers and analytics providers. We never sell your personal data.

YOUR RIGHTS

You may request access to, correction of, or deletion of your personal information at
any time. To exercise these rights, contact us at hello@dewsfurniture.com.

DATA RETENTION

We keep your information only as long as needed to provide our services and comply
with the law.

CONTACT

Dew's Furniture
hello@dewsfurniture.com
```

---

### 📄 Terms of Service (copy-paste)

```text
TERMS OF SERVICE

OVERVIEW

This website is operated by Dew's Furniture. Throughout the site, "we", "us" and
"our" refer to Dew's Furniture. By using our site and purchasing our products, you
agree to these Terms of Service.

ONLINE STORE TERMS

By agreeing to these terms, you confirm you are at least the age of majority in your
region. You may not use our products or services for any unlawful purpose.

PRODUCTS AND PRICING

We handcraft furniture in small batches. Natural materials like solid wood and woven
cane vary in grain and tone, so each piece is unique. We work hard to display
colours and finishes accurately, but actual appearance may vary slightly by screen.

Prices are shown in your local currency and may change without notice. We reserve the
right to correct pricing errors.

ORDERS AND PAYMENT

We may refuse or cancel any order, including where a product is mispriced or
unavailable. Payment must be completed in full before your order is dispatched.

ACCURACY OF INFORMATION

We aim to keep all product descriptions and stock information accurate, but we do not
guarantee that content is always error-free, complete or current.

INTELLECTUAL PROPERTY

All content on this site — text, images, logos and design — belongs to Dew's
Furniture and may not be reproduced without written permission.

LIMITATION OF LIABILITY

To the maximum extent permitted by law, Dew's Furniture is not liable for any
indirect or consequential loss arising from the use of our products or site.

GOVERNING LAW

These terms are governed by the laws of the jurisdiction in which Dew's Furniture
operates.

CONTACT

Questions about these terms? Email hello@dewsfurniture.com.
```

---

### 📄 Refund Policy (copy-paste)

```text
REFUND POLICY

30-DAY RETURNS

We want you to love your furniture. If a piece isn't right, you have 30 days from
delivery to return it for a full refund or exchange.

CONDITIONS

- Items must be in their original condition, unassembled, with all hardware and
  packaging where possible.
- Custom or made-to-order pieces are non-refundable unless faulty.
- We may request photos to assess the condition before arranging a collection.

HOW TO START A RETURN

Email hello@dewsfurniture.com with your order number and the reason for the return.
We will arrange collection and share the next steps within 2 business days.

REFUNDS

Once we receive and inspect the returned item, we will process your refund to the
original payment method. Refunds typically appear within 5–10 business days.

DAMAGED OR FAULTY ITEMS

If your furniture arrives damaged or faulty, contact us within 7 days with photos.
We will repair, replace or refund it — including the cost of return delivery.

WARRANTY

All our furniture carries a 1-year structural warranty against manufacturing
defects. This does not cover normal wear and tear or accidental damage.
```

---

### 📄 Shipping Policy (copy-paste)

```text
SHIPPING POLICY

DELIVERY

We deliver across our service area with care. Standard delivery is free on orders
over $999; a small fee applies below this amount.

WHITE-GLOVE DELIVERY

Every order includes white-glove delivery: we place your furniture in the room,
assemble it, and take away all packaging.

DELIVERY TIMES

- In-stock pieces: dispatched within 3–7 business days.
- Handcrafted and small-batch pieces: lead times are shown on the product page.
- You will receive tracking details by email once your order is on its way.

DELIVERY PROCESS

Our carrier will contact you to schedule a delivery slot. Please ensure someone is
available to receive the order and that doorways and access are clear.

DAMAGE IN TRANSIT

Please inspect your delivery on arrival. If anything is damaged, note it with the
driver and contact us within 7 days with photos.

QUESTIONS

For anything delivery-related, email hello@dewsfurniture.com.
```

---

### Step 2 — Footer "Support" menu me links add karo

**Shopify Admin → Online Store → Navigation → Footer menu** (handle `footer`)

Isme ye items add karo (Theme is `col_3_menu: "footer"` handle padh raha hai):

| Menu item name | Link (URL) |
|---|---|
| Track Your Order | (Category 3 — baad me decide hoga) |
| Shipping & Delivery | `/policies/shipping-policy` |
| Returns & Exchanges | `/policies/refund-policy` |
| Privacy Policy | `/policies/privacy-policy` |
| Terms of Service | `/policies/terms-of-service` |
| Care Guide | (Category 2 — normal page banne ke baad) |

> **Note:** Policies ka URL tabhi banta hai jab aap **Settings → Policies** me content
> save kar dete ho. Pehle policies bharo, phir menu links add karo — warna URL "page
> not found" dega.

---

## CATEGORY 2 — Normal pages (Shipping & Delivery, Care Guide)

Ye **Admin → Online Store → Pages** me bante hain, template `page` select karte ho.
(Content drafts next step me dunga — pehle Category 1 complete karo.)

## CATEGORY 3 — Track Your Order

App (AfterShip/Track123) vs native vs custom form — decision pending. Baad me setup
hoga.
