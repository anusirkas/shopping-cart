# 🛍️ Auro — Luxury Fashion E-Commerce (React + Vite)

This is a portfolio project inspired by modern luxury fashion brands (Prada, Acne Studios, Celine).  
The goal is to build a **minimalist and luxurious shopping experience** with React, modern CSS, and smooth UX animations.  
This project is part of [The Odin Project](https://www.theodinproject.com/) React curriculum.  

---

## 🖼️ Preview
![Preview of Auro project](preview.png)

---

## 🚀 Tech Stack

- ⚛️ **React 18 (with Vite)** — fast SPA framework  
- 🌐 **React Router v6** — multipage routing  
- 🛒 **Context API** — shopping cart state management  
- 🎞️ **Framer Motion** — animations & transitions  
- 🗺️ **Leaflet** — interactive store locator map  
- 🚩 **React Country Flag** — international shipping selector  
- 🎨 **CSS** — mostly component-based CSS files (classic styling)  
- ⚡ **TailwindCSS** — partial use for rapid prototyping  
- ☁️ **Vercel (planned)** — deployment  

---

## ✨ Features

### 🧭 Header & Navigation
- Sticky top header with brand name **Auro** (click → Home)  
- Centered navigation links (Shop, Women, Men, Bags, Jewelry, News, etc.)  
- Right-side icons: **Search, Account, Wishlist, Cart**  
- Pop-ups for Account, Wishlist, Cart (luxury style overlays)  

### 🖥️ Front Page
- Large full-screen hero images (Acne Studios–style scrolling animation)  
- Overlay logo animation  
- Campaign & intro sections  
- News grid with latest brand updates  
- Newsletter subscription form  

### 📑 Footer
- Four columns: links + social media icons  
- Store Locator link  
- Shipping info selector (with flags)  
- Disclaimer line at the bottom  

### 📍 Store Locator
- Interactive map using Leaflet with **custom luxury markers**  
- Search bar with filtering by city  
- Predefined stores: Paris, London, New York, Copenhagen, Tallinn  
- Auto-zoom to store locations  

### 🛒 Cart
- Context-based cart system  
- Real-time item count in header  
- Ability to add/remove products  

---

## 📌 Work in Progress

- ✨ Improve **Home page animations** (smooth logo transition)  
- 🧾 Build **mega menu** for Shop categories (Prada-style hover)  
- 📱 Add **responsive mobile navigation**  
- 💖 Enhance **Wishlist** functionality (currently placeholder pop-up)  
- ☁️ Deploy to **Vercel** with SPA routing config  

---

## 🧑‍💻 Setup
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build