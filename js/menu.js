/* ----------------------------------------------------
   DineQR Menu Display JavaScript Core
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const menuAppContainer = document.getElementById('menu-app-container');
  const resLogo = document.getElementById('res-logo');
  const resName = document.getElementById('res-name');
  const resAddress = document.getElementById('res-address');
  const btnPhone = document.getElementById('res-btn-phone');
  const btnMap = document.getElementById('res-btn-map');
  const categoryNavScroll = document.getElementById('category-nav-scroll');
  const menuItemsGrid = document.getElementById('menu-items-grid');
  
  // Cart floating bar elements
  const cartFooter = document.getElementById('cart-footer');
  const cartQtyText = document.getElementById('cart-qty');
  const cartTotalText = document.getElementById('cart-total');
  const btnWhatsappOrder = document.getElementById('btn-whatsapp-order');
  
  // Error Screen
  const errorScreen = document.getElementById('error-screen');

  // --- App State ---
  let menuData = null;
  const cart = {}; // Scheme: { "itemName": { price: 12.0, qty: 2 } }

  // --- Functions: Initialization ---
  function init() {
    // 1. Get query parameter 'd' or fallback to localStorage draft
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('d');

    if (encodedData) {
      menuData = decodeMenuData(encodedData);
    } else {
      // Look for a local draft
      const draft = localStorage.getItem('dineqr_draft_menu');
      if (draft) {
        menuData = JSON.parse(draft);
      }
    }

    // 2. Validate menu data
    if (!menuData) {
      showErrorState();
      return;
    }

    // 3. Render the dynamic elements
    renderRestaurantBranding();
    renderCategoriesAndItems();
    
    // 4. Set up scroll spy and WhatsApp trigger
    setupInteractions();

    lucide.createIcons();
  }

  // --- Functions: Decoders & Renderers ---
  
  function decodeMenuData(hash) {
    try {
      // Reverse URL-safe Base64 transformation
      let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const raw = atob(base64);
      // Decodes UTF-8 correctly
      const jsonStr = decodeURIComponent(escape(raw));
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Decoding error:", e);
      return null;
    }
  }

  function showErrorState() {
    errorScreen.classList.remove('hidden');
    resName.textContent = "Error";
  }

  function renderRestaurantBranding() {
    // Theme setup
    menuAppContainer.className = `menu-app-wrapper theme-${menuData.t || 'gold'}`;

    // Restaurant Name & Address
    resName.textContent = menuData.n || "Welcome to Our Restaurant";
    resAddress.textContent = menuData.a || "";

    // Logo Setup
    if (menuData.l) {
      if (menuData.l.startsWith('data:image/')) {
        resLogo.innerHTML = `<img src="${menuData.l}" alt="Restaurant Logo">`;
      } else {
        resLogo.innerHTML = menuData.l; // Emoji preset
      }
    } else {
      resLogo.innerHTML = "🍔"; // Fallback
    }

    // Phone configuration
    if (menuData.p) {
      btnPhone.href = `tel:${menuData.p.replace(/\s+/g, '')}`;
      btnPhone.classList.remove('hidden');
    } else {
      btnPhone.classList.add('hidden');
    }

    // Address/Map Link configuration
    if (menuData.a) {
      btnMap.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(menuData.a)}`;
      btnMap.classList.remove('hidden');
    } else {
      btnMap.classList.add('hidden');
    }
  }

  function renderCategoriesAndItems() {
    categoryNavScroll.innerHTML = '';
    menuItemsGrid.innerHTML = '';

    if (!menuData.c || menuData.c.length === 0) {
      menuItemsGrid.innerHTML = `<p style="text-align:center; padding:3rem; color:var(--text-light)">No menu items available.</p>`;
      return;
    }

    menuData.c.forEach((cat, catIdx) => {
      // Skip empty categories
      if (!cat.n || (!cat.i || cat.i.length === 0)) return;

      const categoryId = `cat-section-${catIdx}`;

      // 1. Create Category Pill Nav Item
      const navPill = document.createElement('a');
      navPill.href = `#${categoryId}`;
      navPill.className = `nav-pill ${catIdx === 0 ? 'active' : ''}`;
      navPill.textContent = cat.n;
      
      // Smooth scroll click handler
      navPill.addEventListener('click', (e) => {
        e.preventDefault();
        const targetElement = document.getElementById(categoryId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          
          // Focus visual active pill
          document.querySelectorAll('.nav-pill').forEach(pill => pill.classList.remove('active'));
          navPill.classList.add('active');
        }
      });
      categoryNavScroll.appendChild(navPill);

      // 2. Create Section Block
      const catSec = document.createElement('section');
      catSec.id = categoryId;
      catSec.className = 'category-block-sec';

      const secTitle = document.createElement('h3');
      secTitle.className = 'category-title';
      secTitle.textContent = cat.n;
      catSec.appendChild(secTitle);

      const itemsListContainer = document.createElement('div');
      itemsListContainer.className = 'category-items-list';

      // 3. Render Item Cards
      cat.i.forEach((item, itemIdx) => {
        if (!item.n) return; // Skip item with empty name

        const itemCard = document.createElement('div');
        itemCard.className = 'menu-item-card';
        
        const uniqueKey = `${cat.n}::${item.n}`; // Unique identifier

        itemCard.innerHTML = `
          <div class="item-left">
            <div class="item-header-row">
              <span class="item-title-name">${item.n}</span>
              <span class="item-title-price">$${parseFloat(item.p || 0).toFixed(2)}</span>
            </div>
            ${item.d ? `<p class="item-description">${item.d}</p>` : ''}
          </div>
          <div class="item-right" data-cart-key="${uniqueKey}">
            <button class="btn-add-to-cart">Add</button>
            <div class="quantity-controller hidden">
              <button class="btn-qty btn-dec">-</button>
              <span class="qty-val">0</span>
              <button class="btn-qty btn-inc">+</button>
            </div>
          </div>
        `;

        // Cart controllers binding
        const addBtn = itemCard.querySelector('.btn-add-to-cart');
        const qtyController = itemCard.querySelector('.quantity-controller');
        const decBtn = itemCard.querySelector('.btn-dec');
        const incBtn = itemCard.querySelector('.btn-inc');
        const qtyVal = itemCard.querySelector('.qty-val');

        const updateCartItemState = (change) => {
          if (!cart[uniqueKey]) {
            cart[uniqueKey] = {
              name: item.n,
              price: parseFloat(item.p || 0),
              qty: 0
            };
          }

          cart[uniqueKey].qty += change;

          if (cart[uniqueKey].qty <= 0) {
            delete cart[uniqueKey];
            addBtn.classList.remove('hidden');
            qtyController.classList.add('hidden');
            qtyVal.textContent = "0";
          } else {
            addBtn.classList.add('hidden');
            qtyController.classList.remove('hidden');
            qtyVal.textContent = cart[uniqueKey].qty;
          }

          updateCartFooterDisplay();
        };

        addBtn.addEventListener('click', () => updateCartItemState(1));
        incBtn.addEventListener('click', () => updateCartItemState(1));
        decBtn.addEventListener('click', () => updateCartItemState(-1));

        itemsListContainer.appendChild(itemCard);
      });

      catSec.appendChild(itemsListContainer);
      menuItemsGrid.appendChild(catSec);
    });
  }

  // --- Functions: Cart Status & WhatsApp Link formatting ---
  
  function updateCartFooterDisplay() {
    let totalItems = 0;
    let subtotal = 0;

    Object.values(cart).forEach(item => {
      totalItems += item.qty;
      subtotal += item.qty * item.price;
    });

    if (totalItems > 0) {
      cartQtyText.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''}`;
      cartTotalText.textContent = `$${subtotal.toFixed(2)}`;
      cartFooter.classList.remove('hidden');
    } else {
      cartFooter.classList.add('hidden');
    }
  }

  function setupInteractions() {
    // 1. WhatsApp Order Action click
    btnWhatsappOrder.addEventListener('click', () => {
      if (Object.keys(cart).length === 0) return;

      const restaurantName = menuData.n || "Restaurant";
      const whatsappPhone = menuData.w; // country code + number

      if (!whatsappPhone) {
        alert("The restaurant has not configured a valid WhatsApp ordering number.");
        return;
      }

      // Build Message Structure
      let msg = `*🍽️ NEW ORDER - ${restaurantName.toUpperCase()}*\n`;
      msg += `--------------------------------------\n\n`;
      
      let subtotal = 0;
      Object.values(cart).forEach(item => {
        const itemCost = item.qty * item.price;
        subtotal += itemCost;
        msg += `• *${item.qty}x* ${item.name} _($${item.price.toFixed(2)} ea)_\n`;
        msg += `  ↳ *Cost: $${itemCost.toFixed(2)}*\n\n`;
      });

      msg += `--------------------------------------\n`;
      msg += `*🧾 Order Subtotal: $${subtotal.toFixed(2)}*\n\n`;
      msg += `Please confirm my order. My choice is:\n`;
      msg += `☐ Dine-in (Table Number: ____ )\n`;
      msg += `☐ Takeaway / Delivery\n\n`;
      msg += `_Sent via DineQR digital menu._`;

      // Formulate WhatsApp Web/App Redirect Link
      const targetLink = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(msg)}`;
      
      window.open(targetLink, '_blank');
    });

    // 2. Scrollspy highlights active navbar tab based on viewport coordinates
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('.category-block-sec');
      const navPills = document.querySelectorAll('.nav-pill');
      let currentActiveId = "";

      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        // Section is in view if its top boundary is close to navbar heights
        if (rect.top <= 120) {
          currentActiveId = sec.id;
        }
      });

      if (currentActiveId) {
        navPills.forEach(pill => {
          pill.classList.remove('active');
          if (pill.getAttribute('href') === `#${currentActiveId}`) {
            pill.classList.add('active');
            
            // Auto scroll category nav bar horizontally so the active pill stays visible
            const navScroll = categoryNavScroll;
            const activeOffset = pill.offsetLeft;
            const activeWidth = pill.offsetWidth;
            const containerWidth = navScroll.offsetWidth;
            
            navScroll.scrollTo({
              left: activeOffset - (containerWidth / 2) + (activeWidth / 2),
              behavior: 'smooth'
            });
          }
        });
      }
    });
  }

  // --- Run Initialization ---
  init();
});
