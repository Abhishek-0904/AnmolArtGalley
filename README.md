# 🎨 Anoml Art Gallery - Website Documentation

Yeh ek simple, fast aur modern e-commerce website hai jo special **Sketch Artists & Portrait Painters** ke liye design ki gayi hai.

---

## 🌟 Key Features

1. **Ready-made Sketches Store (E-Commerce Catalog)**:
   - Filter categories: All, Portraits, Wildlife, Landscape, Charcoal.
   - Zoom Preview Modal (badi screen par artwork dekhne ke liye).
   - "Add to Cart" & Direct "WhatsApp Buy" buttons.

2. **Custom Portrait Order Studio (Photo to Sketch)**:
   - Customer apni photo upload kar sakta hai.
   - Medium select kar sakta hai (Graphite Pencil, Dark Charcoal, Color Pencil).
   - Size select kar sakta hai (A4, A3, A2).
   - Number of faces & Framing options (Matte Black, Teak Wood, Minimal White).
   - Instant live price calculator!
   - 1-Click **"Order on WhatsApp"** (saari details automatically formatted message banakar artist ko WhatsApp bhejti hain).

3. **Slide-Over Shopping Cart**:
   - Quantity update (+ / - / remove).
   - Customer details input (Naam, Phone, Address).
   - Subtotal aur Total calculation.
   - **WhatsApp Checkout** aur **Cash on Delivery / UPI** button.

4. **Artist Story & Reviews**:
   - Artist bio, paper quality (300 GSM archival), fixative spray details, and 5-star customer testimonials.

---

## 🛠️ Kaise Customize Karein?

### 1. Artist ka WhatsApp Number Kaise Badlein?
`app.js` file kholiye aur line **78** par apna WhatsApp number daal dijiye:
```javascript
const ARTIST_WHATSAPP_NUMBER = '919876543210'; // Apna 10-digit number (country code 91 ke sath)
```

### 2. Sketches / Artworks Kaise Add ya Change Karein?
`app.js` ke upar `ARTWORKS_DATA` array diya hua hai:
```javascript
{
    id: 'art-1',
    title: 'Apne Sketch Ka Naam',
    category: 'portrait', // portrait, wildlife, landscape, charcoal
    medium: 'Charcoal & Pencil',
    paper: '300 GSM Fabriano',
    dimensions: 'A3 (11.7 × 16.5 inches)',
    price: 2499,
    image: 'IMAGE_URL_YA_LOCAL_IMAGE.jpg',
    description: 'Sketch ka short description...',
    isOriginal: true,
    tag: 'Original Piece'
}
```

### 3. Website Kaise Open Karein?
Aapko kisi server ya setup ki zaroorat nahi hai:
- Bas apne folder `c:\Users\HP\OneDrive\Desktop\Website` me jaiye.
- **`index.html`** par double click karein, aur website aapke Chrome ya kisi bhi browser me open ho jayegi!

---

## 🚀 Free Me Live Kaise Karein?
Aap is folder ko bina kisi coding ke free me internet par live kar sakte hain:
1. **Netlify Drop**: [app.netlify.com/drop](https://app.netlify.com/drop) par jaiye aur is folder ko drag & drop kar dijiye — 10 seconds me live link mil jayega!
2. Ya **Vercel** / **GitHub Pages** par host kar sakte hain.
