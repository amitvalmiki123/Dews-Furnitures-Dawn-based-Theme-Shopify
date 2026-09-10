# Shopify CLI Setup — Dew's Furniture Theme

Is guide se aap theme ko ek command se directly apne Shopify store mein push kar
sakte ho (baar-baar zip upload karne ki zaroorat nahi).

Theme files is folder mein hain: `theme_export/`
Ready-made config file: `theme_export/shopify.theme.toml`

---

## Step 1 — Node.js install karo (ek baar)

Shopify CLI ko Node.js chahiye.

1. https://nodejs.org se **LTS version** (18 ya 20+) download karke install karo.
2. Verify karo:
   ```bash
   node -v
   npm -v
   ```

---

## Step 2 — Shopify CLI install karo (ek baar)

Terminal / Command Prompt kholo aur ye chalao:

```bash
npm install -g @shopify/cli @shopify/theme
```

Verify:
```bash
shopify version
```

---

## Step 3 — Store se login karo (ek baar)

```bash
shopify auth login --store dew-s-furnitures.myshopify.com
```

Browser khulega → **Install app** dabao (authorize). Ek baar login hone ke baad
dobara nahi karna padega.

> Note: aapke pas store ka **staff/admin login** hona chahiye.

---

## Step 4 — Theme folder mein jao

```bash
cd theme_export
```

(yahan `shopify.theme.toml` file pehle se rakhi hai)

---

## Step 5 — Theme push karo

### Pehli baar (nayi dev theme banegi):

```bash
shopify theme push --unpublished
```

Ye ek **nayi unpublished theme** bana ke usme files push karta hai. Phir:
- Shopify Admin → Online Store → Themes mein nayi theme dikhegi
- **Preview** karke check karo, phir **Publish** karo

### Baad mein (jab bhi code badlo):

```bash
shopify theme push
```

(CLI ko yaad rehta hai kis theme mein push karna hai — toml mein id save ho jati hai)

---

## Live preview with hot-reload (optional, best for development)

```bash
shopify theme dev
```

- Ye ek preview URL deta hai jo live hota hai
- File save karte hi store par turant update dikhta hai
- Band karne ke liye `Ctrl + C`

---

## Common commands

| Command | Kaam |
|---|---|
| `shopify theme push --unpublished` | Nayi dev theme bana ke push |
| `shopify theme push` | Last used theme mein push |
| `shopify theme push --theme <id>` | Specific theme mein push |
| `shopify theme pull` | Store se files download (backup) |
| `shopify theme dev` | Live preview + auto-sync |
| `shopify theme list` | Saare themes ki list + ids |
| `shopify theme check` | Liquid error check |

---

## Important notes

1. **Pehla push `--unpublished` se karo** — isse aapka published (live) theme
   galti se nahi badega. Test ke baad admin se publish karna.
2. `shopify.theme.toml` mein store name pehle se set hai, change nahi karna.
3. Theme zip (`theme_export__*.zip`) sirf manual upload ke liye hai — CLI use
   karte waqt iski zaroorat nahi.
