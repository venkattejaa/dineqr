/* ----------------------------------------------------
   DineQR Generator JavaScript Core
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const categoriesContainer = document.getElementById('categories-container');
  const btnAddCategory = document.getElementById('btn-add-category');
  const btnGenerateMenu = document.getElementById('btn-generate-menu');
  const form = document.getElementById('menu-generator-form');
  
  // Brand details inputs
  const inputResName = document.getElementById('restaurant-name');
  const inputResPhone = document.getElementById('restaurant-phone');
  const inputResAddress = document.getElementById('restaurant-address');
  const inputWhatsapp = document.getElementById('whatsapp-number');
  
  // Logo uploading elements
  const logoFileInput = document.getElementById('logo-file');
  const logoDropzone = document.getElementById('logo-dropzone');
  const logoPreviewWrapper = document.getElementById('logo-preview-wrapper');
  const logoPreviewImg = document.getElementById('logo-preview-img');
  const btnRemoveLogo = document.getElementById('btn-remove-logo');
  const presetButtons = document.querySelectorAll('.btn-preset');
  
  // Theme elements
  const themeRadioButtons = document.querySelectorAll('input[name="theme-color"]');
  
  // Preview Elements
  const simMenuContainer = document.getElementById('sim-menu-container');
  const simLogoArea = document.getElementById('sim-logo-area');
  const simResName = document.getElementById('sim-res-name');
  const simResAddress = document.getElementById('sim-res-address');
  const simResPhone = document.getElementById('sim-res-phone');
  const simCategoryNav = document.getElementById('sim-category-nav');
  const simMenuBody = document.getElementById('sim-menu-body');
  
  // Tabs & Output elements
  const tabPreviewBtn = document.querySelector('[data-tab="preview"]');
  const tabResultBtn = document.getElementById('tab-result-button');
  const previewTabContent = document.getElementById('preview-tab-content');
  const resultTabContent = document.getElementById('result-tab-content');
  const generatedUrlInput = document.getElementById('generated-url-input');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnDownloadQr = document.getElementById('btn-download-qr');
  const btnVisitMenu = document.getElementById('btn-visit-menu');

  // Templates
  const categoryTemplate = document.getElementById('category-template');
  const itemTemplate = document.getElementById('item-template');

  // --- App State ---
  let selectedLogo = "🍔"; // Default can be emoji or a base64 string
  let logoType = "emoji";  // "emoji" or "image"
  let currentTheme = "gold";
  let activeMenuUrl = "";

  // Preset Menu Configuration (to show beautiful premium data on start)
  const defaultMenuData = [
    {
      id: "cat_1",
      title: "Starters & Appetizers",
      items: [
        { id: "item_1_1", name: "Truffle Parmesan Fries", price: "12.00", desc: "Hand-cut Russet potatoes, white truffle oil, grated pecorino, roasted garlic aioli." },
        { id: "item_1_2", name: "Crispy Calamari", price: "16.00", desc: "Lightly dusted squid, pickled hot peppers, key lime sweet chili glaze." }
      ]
    },
    {
      id: "cat_2",
      title: "Artisanal Mains",
      items: [
        { id: "item_2_1", name: "Signature Wagyu Burger", price: "24.00", desc: "8oz American Wagyu, caramelized balsamic onion jam, aged gruyère, toasted brioche bun." },
        { id: "item_2_2", name: "Wood-Fired Prime Ribeye", price: "45.00", desc: "14oz USDA Prime bone-in ribeye, smoked bone marrow butter, garlic broccolini." }
      ]
    },
    {
      id: "cat_3",
      title: "Refreshing Craft Sips",
      items: [
        { id: "item_3_1", name: "Citrus Mint Infusion", price: "8.50", desc: "Cold-press Sicilian lemons, wild mint shrub, fresh cane nectar, organic carbonated water." }
      ]
    }
  ];

  // Initialize Lucide Icons
  lucide.createIcons();

  // --- Functions: Initialization & Setup ---
  
  function init() {
    // 1. Populate the default items
    defaultMenuData.forEach(cat => {
      addCategoryBlock(cat);
    });

    // 2. Set up event listeners for inputs
    setupInputListeners();

    // 3. Render the initial Live Preview
    updateLivePreview();
  }

  // --- Functions: Event Listeners Setup ---
  function setupInputListeners() {
    // Header brand edits triggers live mockup update
    inputResName.addEventListener('input', updateLivePreview);
    inputResAddress.addEventListener('input', updateLivePreview);
    inputResPhone.addEventListener('input', updateLivePreview);
    
    // Logo Dropper triggers
    logoDropzone.addEventListener('click', () => logoFileInput.click());
    logoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      logoDropzone.style.borderColor = 'var(--primary)';
      logoDropzone.style.backgroundColor = 'var(--primary-light)';
    });
    logoDropzone.addEventListener('dragleave', () => {
      logoDropzone.style.borderColor = 'var(--border-color)';
      logoDropzone.style.backgroundColor = '#fcfbfa';
    });
    logoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      logoDropzone.style.borderColor = 'var(--border-color)';
      logoDropzone.style.backgroundColor = '#fcfbfa';
      if (e.dataTransfer.files.length) {
        handleLogoFile(e.dataTransfer.files[0]);
      }
    });
    logoFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleLogoFile(e.target.files[0]);
      }
    });

    btnRemoveLogo.addEventListener('click', (e) => {
      e.stopPropagation();
      resetToDefaultEmoji();
    });

    // Preset emoji buttons
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLogo = btn.getAttribute('data-emoji');
        logoType = "emoji";
        
        // Hide image preview
        logoPreviewWrapper.classList.add('hidden');
        logoFileInput.value = '';
        
        updateLivePreview();
      });
    });

    // Theme Picker change triggers
    themeRadioButtons.forEach(radio => {
      radio.addEventListener('change', (e) => {
        currentTheme = e.target.value;
        // Update styling of wrapper active class
        document.querySelectorAll('.theme-option').forEach(opt => {
          opt.classList.remove('active');
          if (opt.querySelector('input').checked) {
            opt.classList.add('active');
          }
        });
        updateLivePreview();
      });
    });

    // Add Category button
    btnAddCategory.addEventListener('click', () => {
      addCategoryBlock({
        id: "cat_" + Date.now(),
        title: "",
        items: []
      });
      updateLivePreview();
    });

    // Generate Menu button
    btnGenerateMenu.addEventListener('click', generateQRCodeAndLinks);

    // Mobile tabs switcher
    tabPreviewBtn.addEventListener('click', () => switchTab('preview'));
    tabResultBtn.addEventListener('click', () => switchTab('result'));

    // Copy Link button
    btnCopyLink.addEventListener('click', copyLinkToClipboard);
    
    // Download QR
    btnDownloadQr.addEventListener('click', downloadQRCodeImage);
  }

  // --- Functions: Logo Image Compression (Serverless ready) ---
  function handleLogoFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // We compress/resize the image onto a canvas to be exactly max 120x120px
        // This ensures the Base64 representation is tiny and fits in standard URLs easily!
        const canvas = document.createElement('canvas');
        const maxSize = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to highly optimized JPEG to minimize size
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        // Update preview wrapper
        selectedLogo = compressedBase64;
        logoType = "image";
        
        logoPreviewImg.src = compressedBase64;
        logoPreviewWrapper.classList.remove('hidden');
        
        // Remove preset selection active states
        presetButtons.forEach(b => b.classList.remove('active'));

        updateLivePreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function resetToDefaultEmoji() {
    selectedLogo = "🍔";
    logoType = "emoji";
    logoPreviewWrapper.classList.add('hidden');
    logoFileInput.value = '';
    
    presetButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('.btn-preset[data-emoji="🍔"]').classList.add('active');
    
    updateLivePreview();
  }

  // --- Functions: Category & Items Form Rendering ---
  
  function addCategoryBlock(catData) {
    const clone = categoryTemplate.content.cloneNode(true);
    const catBlock = clone.querySelector('.category-block');
    catBlock.setAttribute('data-category-id', catData.id);
    
    const titleInput = catBlock.querySelector('.category-title-input');
    titleInput.value = catData.title;
    titleInput.addEventListener('input', updateLivePreview);

    // Delete category event
    catBlock.querySelector('.btn-delete-category').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this entire category and its items?')) {
        catBlock.remove();
        updateLivePreview();
      }
    });

    // Add item button inside category
    const itemsContainer = catBlock.querySelector('.items-container');
    catBlock.querySelector('.btn-add-item').addEventListener('click', () => {
      addItemRow(itemsContainer, {
        id: "item_" + Date.now(),
        name: "",
        price: "",
        desc: ""
      });
      updateLivePreview();
    });

    // Populate pre-existing items
    catData.items.forEach(item => {
      addItemRow(itemsContainer, item);
    });

    categoriesContainer.appendChild(catBlock);
    lucide.createIcons();
  }

  function addItemRow(container, itemData) {
    const clone = itemTemplate.content.cloneNode(true);
    const row = clone.querySelector('.menu-item-row');
    row.setAttribute('data-item-id', itemData.id);

    const nameInput = row.querySelector('.item-name-input');
    const priceInput = row.querySelector('.item-price-input');
    const descInput = row.querySelector('.item-desc-input');

    nameInput.value = itemData.name;
    priceInput.value = itemData.price;
    descInput.value = itemData.desc;

    // Hook up real-time live preview triggers
    nameInput.addEventListener('input', updateLivePreview);
    priceInput.addEventListener('input', updateLivePreview);
    descInput.addEventListener('input', updateLivePreview);

    // Delete item trigger
    row.querySelector('.btn-delete-item').addEventListener('click', () => {
      row.remove();
      updateLivePreview();
    });

    container.appendChild(row);
    lucide.createIcons();
  }

  // --- Functions: Real-Time Live Preview Sync ---

  function updateLivePreview() {
    // 1. Sync restaurant name, phone, address
    simResName.textContent = inputResName.value || "Your Restaurant";
    simResAddress.textContent = inputResAddress.value || "123 Main Street, City";
    
    if (inputResPhone.value) {
      simResPhone.innerHTML = `<i data-lucide="phone" class="icon-tiny"></i> ${inputResPhone.value}`;
      simResPhone.classList.remove('hidden');
    } else {
      simResPhone.classList.add('hidden');
    }

    // 2. Sync Theme Styling
    simMenuContainer.className = `sim-menu-container theme-${currentTheme}`;

    // 3. Sync Logo Display
    if (logoType === "emoji") {
      simLogoArea.innerHTML = selectedLogo;
    } else {
      simLogoArea.innerHTML = `<img src="${selectedLogo}" alt="Logo">`;
    }

    // 4. Sync Category Tabs & Items
    simCategoryNav.innerHTML = '';
    simMenuBody.innerHTML = '';

    const categories = [];
    document.querySelectorAll('.category-block').forEach((catBlock, catIdx) => {
      const catTitle = catBlock.querySelector('.category-title-input').value.trim() || `Category ${catIdx + 1}`;
      categories.push(catTitle);

      // Add to simulated category nav bar
      const navItem = document.createElement('div');
      navItem.className = `sim-nav-item ${catIdx === 0 ? 'active' : ''}`;
      navItem.textContent = catTitle;
      simCategoryNav.appendChild(navItem);

      // Create simulated category block
      const simSec = document.createElement('div');
      simSec.className = 'sim-category-section';
      
      const simSecTitle = document.createElement('h4');
      simSecTitle.className = 'sim-category-section-title';
      simSecTitle.textContent = catTitle;
      simSec.appendChild(simSecTitle);

      const items = catBlock.querySelectorAll('.menu-item-row');
      let itemsAdded = 0;

      items.forEach((itemRow, itemIdx) => {
        const itemName = itemRow.querySelector('.item-name-input').value.trim();
        const itemPrice = itemRow.querySelector('.item-price-input').value.trim();
        const itemDesc = itemRow.querySelector('.item-desc-input').value.trim();

        if (itemName) {
          itemsAdded++;
          const simItem = document.createElement('div');
          simItem.className = 'sim-menu-item';
          
          simItem.innerHTML = `
            <div class="sim-item-details">
              <div class="sim-item-name-row">
                <span class="sim-item-name">${itemName}</span>
                <span class="sim-item-price">$${parseFloat(itemPrice || 0).toFixed(2)}</span>
              </div>
              ${itemDesc ? `<p class="sim-item-desc">${itemDesc}</p>` : ''}
            </div>
            <button class="sim-btn-add">+ Add</button>
          `;
          simSec.appendChild(simItem);
        }
      });

      // Show placeholder if no items added to category yet
      if (itemsAdded === 0) {
        const placeholder = document.createElement('p');
        placeholder.style.fontSize = '0.72rem';
        placeholder.style.color = 'var(--text-light)';
        placeholder.style.fontStyle = 'italic';
        placeholder.textContent = 'Add items in the editor to preview them here.';
        simSec.appendChild(placeholder);
      }

      simMenuBody.appendChild(simSec);
    });

    if (categories.length === 0) {
      simCategoryNav.innerHTML = `<span class="sim-nav-item active">Menu</span>`;
      simMenuBody.innerHTML = `
        <div style="text-align:center; padding: 2rem 0; color: var(--text-light); font-size: 0.8rem;">
          <i data-lucide="utensils" style="width: 24px; height: 24px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p>Your menu is empty. Add a category above to begin!</p>
        </div>
      `;
    }

    lucide.createIcons();
  }

  // --- Functions: Data Compression & URL Generation ---
  
  function generateQRCodeAndLinks() {
    // 1. Validate Form Basics
    if (!inputResName.value || !inputWhatsapp.value) {
      alert("Please fill in the Restaurant Name and WhatsApp Order Number.");
      return;
    }

    // 2. Build the JSON Model
    const menuData = {
      n: inputResName.value.trim(),
      w: inputWhatsapp.value.replace(/\D/g, ''), // Numbers only
      p: inputResPhone.value.trim(),
      a: inputResAddress.value.trim(),
      l: selectedLogo, // Base64 or Emoji
      t: currentTheme,
      c: []
    };

    let itemCheck = 0;
    document.querySelectorAll('.category-block').forEach(catBlock => {
      const category = {
        n: catBlock.querySelector('.category-title-input').value.trim() || "Untitled Category",
        i: []
      };

      catBlock.querySelectorAll('.menu-item-row').forEach(itemRow => {
        const name = itemRow.querySelector('.item-name-input').value.trim();
        const price = itemRow.querySelector('.item-price-input').value.trim();
        const desc = itemRow.querySelector('.item-desc-input').value.trim();

        if (name) {
          category.i.push({
            n: name,
            p: price ? parseFloat(price) : 0,
            d: desc
          });
          itemCheck++;
        }
      });

      menuData.c.push(category);
    });

    if (itemCheck === 0) {
      alert("Please add at least one menu item before generating.");
      return;
    }

    // 3. Serialize and Compress Data using URI Safe Base64
    let urlSafeBase64 = "";
    try {
      const jsonStr = JSON.stringify(menuData);
      const rawBase64 = btoa(unescape(encodeURIComponent(jsonStr)));
      urlSafeBase64 = rawBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (err) {
      console.error("Encoding failed: ", err);
      alert("An error occurred during menu packing. Please check if your custom logo is too large.");
      return;
    }

    // Save configuration in localStorage for drafts / edit recall
    localStorage.setItem('dineqr_draft_menu', JSON.stringify(menuData));

    // 4. Generate URL pointing to menu.html
    const locationHref = window.location.href;
    const baseDir = locationHref.substring(0, locationHref.lastIndexOf('/'));
    activeMenuUrl = `${baseDir}/menu.html?d=${urlSafeBase64}`;

    // Populate URL input box
    generatedUrlInput.value = activeMenuUrl;
    btnVisitMenu.href = activeMenuUrl;

    // 5. Render high-res QR Code canvas inside element
    const canvasContainer = document.getElementById('qrcode-canvas');
    canvasContainer.innerHTML = ''; // Clear previous

    new QRCode(canvasContainer, {
      text: activeMenuUrl,
      width: 180,
      height: 180,
      colorDark: "#121212",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    // Enable and switch to Result tab
    tabResultBtn.disabled = false;
    switchTab('result');
  }

  // --- Helper Functions ---
  
  function switchTab(tab) {
    if (tab === 'preview') {
      tabPreviewBtn.classList.add('active');
      tabResultBtn.classList.remove('active');
      previewTabContent.classList.remove('hidden');
      resultTabContent.classList.add('hidden');
    } else {
      tabResultBtn.classList.add('active');
      tabPreviewBtn.classList.remove('active');
      resultTabContent.classList.remove('hidden');
      previewTabContent.classList.add('hidden');
    }
  }

  function copyLinkToClipboard() {
    if (!activeMenuUrl) return;
    navigator.clipboard.writeText(activeMenuUrl).then(() => {
      const oldHtml = btnCopyLink.innerHTML;
      btnCopyLink.innerHTML = `<i data-lucide="check"></i> Link Copied!`;
      btnCopyLink.style.borderColor = '#10b981';
      btnCopyLink.style.color = '#10b981';
      lucide.createIcons();

      setTimeout(() => {
        btnCopyLink.innerHTML = oldHtml;
        btnCopyLink.style.borderColor = '';
        btnCopyLink.style.color = '';
        lucide.createIcons();
      }, 2000);
    }).catch(err => {
      console.error("Clipboard copy failed: ", err);
      alert("Failed to copy link automatically. Please select it inside the URL box manually.");
    });
  }

  function downloadQRCodeImage() {
    // QRCode.js creates a canvas and/or an image inside the holder.
    const canvas = document.querySelector('#qrcode-canvas canvas');
    const img = document.querySelector('#qrcode-canvas img');
    let sourceData = "";

    if (canvas) {
      sourceData = canvas.toDataURL('image/png');
    } else if (img) {
      sourceData = img.src;
    }

    if (!sourceData) {
      alert("Unable to grab QR image data. Please try again.");
      return;
    }

    const downloadLink = document.createElement('a');
    const resNameNormalized = (inputResName.value || "bistronomy").toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadLink.href = sourceData;
    downloadLink.download = `${resNameNormalized}_menu_qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  // --- Run Initialization ---
  init();
});
