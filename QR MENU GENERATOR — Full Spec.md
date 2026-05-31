QR MENU GENERATOR — Full Spec
What it does
User fills a form with restaurant details and menu items. Clicks generate. Gets a live menu page + QR code that links to it.
Pages needed
Page 1 — Generator (index.html)

Input Restaurant name, address, phone, logo upload
Input Menu items (name + price + category)
Button to add more items
Button to generate
Shows QR code after generating
QR code links to the menu page

Page 2 — Menu Display (menu.html)

Clean mobile-first design
Shows restaurant name, logo, address, phone
Menu items grouped by category
Each item name, price, optional description
WhatsApp order button at bottom
No login needed, no backend needed

Technical requirements

Pure HTML, CSS, JavaScript — no frameworks
Use QRCode.js library for QR generation (CDN available)
Save menu data to localStorage
Menu page reads from URL parameters or localStorage
Host on GitHub Pages — must work as static site
Mobile first — 90% of users will scan and view on phone

Design

Clean, minimal, professional
White background, dark text
Gold accent color (#c9a84c)
Large readable font for menu items
Category headers to separate sections

Extra features

Copy menu link button
Download QR code as image button
Preview menu before generating