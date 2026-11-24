/**
 * Anoml Art Gallery - Core Application Logic
 * Clean, lightweight, and easy to maintain.
 */

// 1. Artworks Inventory Data
const ARTWORKS_DATA = [
    {
        id: 'art-1',
        title: 'Wise Old Man (Charcoal Study)',
        category: 'sketching',
        medium: 'Natural Charcoal Powder & Pencil',
        paper: '300 GSM Fabriano Grain Sheet',
        dimensions: 'A3 (11.7 × 16.5 inches)',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        description: 'Intricate wrinkles and emotive eye reflections created through layered charcoal shading. Includes protective matte varnish and teak frame.',
        isOriginal: true,
        tag: 'Original Piece'
    },
    {
        id: 'art-2',
        title: 'Royal Bengal Tiger in Shadows',
        category: 'painting',
        medium: 'Graphite & Charcoal Blend (2B - 8B)',
        paper: 'Canson 250 GSM Acid-Free Paper',
        dimensions: 'A3 (11.7 × 16.5 inches)',
        price: 2899,
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
        description: 'Fierce and detailed texture of tiger fur and striking intense gaze. Highlighted using white gelly roll ink.',
        isOriginal: true,
        tag: 'Best Seller'
    },
    {
        id: 'art-3',
        title: 'Taj Mahal Sunrise Reflection',
        category: '3d',
        medium: 'Fine Graphite Pencil (H to 6B)',
        paper: 'Fabriano Artistico 300 GSM',
        dimensions: 'A4 (8.3 × 11.7 inches)',
        price: 1899,
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
        description: 'Architectural line precision meeting soft graphite gradients. Perfect for living room or studio wall decor.',
        isOriginal: true,
        tag: 'Heritage Series'
    },
    {
        id: 'art-4',
        title: 'Traditional Indian Woman with Veil',
        category: 'sketching',
        medium: 'Charcoal & White Pastel Highlight',
        paper: '300 GSM Tinted Toned Paper',
        dimensions: 'A3 (11.7 × 16.5 inches)',
        price: 2699,
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        description: 'Stunning cultural portrait capturing delicate jewelry details, sheer dupatta transparency and soulful eyes.',
        isOriginal: true,
        tag: 'Featured'
    },
    {
        id: 'art-5',
        title: 'Stallion in Motion (Wild Horse)',
        category: 'painting',
        medium: 'Dynamic Charcoal Strokes',
        paper: '250 GSM Textured Cartridge',
        dimensions: 'A4 (8.3 × 11.7 inches)',
        price: 1599,
        image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80',
        description: 'Energetic strokes depicting the muscular grace and windblown mane of a galloping horse.',
        isOriginal: true,
        tag: 'Raw Charcoal'
    },
    {
        id: 'art-6',
        title: 'Old Banaras Ghat at Dusk',
        category: '3d',
        medium: 'Graphite Powder & Blending Stumps',
        paper: 'Fabriano 300 GSM Heavyweight',
        dimensions: 'A3 (11.7 × 16.5 inches)',
        price: 2999,
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
        description: 'Atmospheric depth showing wooden boats, rippling river water, and the historic stone temples of Varanasi.',
        isOriginal: true,
        tag: 'Exclusive'
    }
];

// Artist contact details for WhatsApp order
const ARTIST_WHATSAPP_NUMBER = '919876543210';

// State variables
let cart = [];
let activeCategory = 'all';
let selectedArtworkForModal = null;
let currentWallArtwork = null;
let currentWallFrame = 'teak';
let currentWallScale = 'A3';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    renderArtworks();
    setupCategoryFilters();
    setupWallModal();
    setupCustomOrderCalculator();
    setupCartDrawer();
    setupArtworkModal();
    setupMobileMenu();
});

// ========================================================
// 2. RENDER ARTWORKS & FILTERS
// ========================================================
function renderArtworks() {
    const grid = document.getElementById('artworksGrid');
    const emptyNotice = document.getElementById('emptyFilterNotice');
    if (!grid) return;

    let filtered = ARTWORKS_DATA;
    if (activeCategory !== 'all') {
        filtered = ARTWORKS_DATA.filter(item => item.category === activeCategory);
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyNotice.classList.remove('hidden');
        return;
    }

    emptyNotice.classList.add('hidden');
    grid.innerHTML = filtered.map(item => `
        <div class="art-card bg-white rounded-2xl border border-charcoal-200/80 overflow-hidden flex flex-col justify-between group">
            <!-- Image & Tag -->
            <div class="relative aspect-[4/5] bg-charcoal-100 overflow-hidden cursor-pointer">
                <img 
                    src="${item.image}" 
                    alt="${item.title}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                    loading="lazy"
                    onclick="openArtworkModal('${item.id}')"
                >
                <div class="absolute top-3 left-3 bg-charcoal-900/90 backdrop-blur-sm text-cream text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    ${item.tag}
                </div>

                <!-- See on Wall Button -->
                <button 
                    onclick="event.stopPropagation(); openWallModal('${item.id}')"
                    class="absolute top-3 right-3 bg-white/95 hover:bg-charcoal-900 text-charcoal-900 hover:text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow flex items-center gap-1 transition"
                    title="See how this artwork looks on your wall"
                >
                    <span>🖼️ See on Wall</span>
                </button>
            </div>

            <!-- Content info -->
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between text-[11px] text-charcoal-500 mb-1">
                        <span class="uppercase tracking-wider font-semibold text-amberart">${item.category}</span>
                        <span>${item.dimensions.split(' ')[0]} Size</span>
                    </div>
                    <h3 class="font-serif text-lg font-bold text-charcoal-900 group-hover:text-amberart transition">
                        ${item.title}
                    </h3>
                    <p class="text-xs text-charcoal-500 mt-1 line-clamp-2">
                        ${item.description}
                    </p>
                </div>

                <!-- Price and CTA -->
                <div class="pt-4 mt-4 border-t border-charcoal-100 space-y-2.5">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[10px] text-charcoal-400 block uppercase">Framed Price</span>
                            <span class="font-serif text-xl font-bold text-charcoal-900">₹${item.price.toLocaleString('en-IN')}</span>
                        </div>
                        <button onclick="openWallModal('${item.id}')" class="text-xs font-semibold text-amberart hover:underline">
                            Room Preview →
                        </button>
                    </div>

                    <div class="flex gap-2">
                        <button onclick="addToCart('${item.id}')" class="flex-1 py-2.5 bg-charcoal-900 text-white rounded-xl text-xs font-semibold hover:bg-amberart transition flex items-center justify-center gap-1.5 shadow-sm" title="Add to Cart">
                            <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>
                            <span>Add to Cart</span>
                        </button>
                        <button onclick="directWhatsAppBuy('${item.id}')" class="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-600/30 transition text-xs" title="Direct WhatsApp Order">
                            <i data-lucide="message-circle" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active-filter', 'bg-charcoal-900', 'text-white', 'border-charcoal-900');
                b.classList.add('bg-white', 'text-charcoal-700', 'border-charcoal-200');
            });

            btn.classList.add('active-filter', 'bg-charcoal-900', 'text-white', 'border-charcoal-900');
            btn.classList.remove('bg-white', 'text-charcoal-700', 'border-charcoal-200');

            activeCategory = btn.getAttribute('data-category');
            renderArtworks();
        });
    });
}

// ========================================================
// 3. "VIEW ON WALL" LIVING ROOM PREVIEW
// ========================================================
function setupWallModal() {
    const wallAddToCartBtn = document.getElementById('wallAddToCartBtn');
    if (wallAddToCartBtn) {
        wallAddToCartBtn.addEventListener('click', () => {
            if (currentWallArtwork) {
                addToCart(currentWallArtwork.id);
                closeWallModal();
            }
        });
    }

    const modal = document.getElementById('wallModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeWallModal();
        });
    }
}

window.openWallModal = function (artworkId) {
    const artwork = ARTWORKS_DATA.find(a => a.id === artworkId) || ARTWORKS_DATA[0];
    if (!artwork) return;

    currentWallArtwork = artwork;
    document.getElementById('wallModalTitle').textContent = `Preview "${artwork.title}" on Wall`;
    document.getElementById('wallArtworkImg').src = artwork.image;
    document.getElementById('wallAddToCartBtn').textContent = `Add to Cart (₹${artwork.price.toLocaleString('en-IN')})`;

    setWallFrame('teak');
    setWallScale('A3');

    const modal = document.getElementById('wallModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeWallModal = function () {
    const modal = document.getElementById('wallModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
    currentWallArtwork = null;
};

window.setWallFrame = function (frameStyle) {
    currentWallFrame = frameStyle;
    const border = document.getElementById('wallFrameBorder');
    const matting = document.getElementById('wallMatting');

    if (!border || !matting) return;

    if (frameStyle === 'teak') {
        border.className = 'p-2 sm:p-3 bg-[#8B5A2B] border-4 border-[#5C3A1E] shadow-inner transition-colors duration-300';
        matting.className = 'p-2 sm:p-3 bg-cream shadow-inner';
    } else if (frameStyle === 'black') {
        border.className = 'p-2 sm:p-3 bg-[#1A1816] border-4 border-[#0F0E0D] shadow-inner transition-colors duration-300';
        matting.className = 'p-2 sm:p-3 bg-cream shadow-inner';
    } else if (frameStyle === 'white') {
        border.className = 'p-2 sm:p-3 bg-white border-4 border-[#E8E5DF] shadow-inner transition-colors duration-300';
        matting.className = 'p-2 sm:p-3 bg-cream shadow-inner';
    } else {
        border.className = 'p-0 border-0';
        matting.className = 'p-0';
    }

    // Update active button state
    document.querySelectorAll('.wall-frame-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${frameStyle}'`)) {
            btn.className = 'wall-frame-btn px-3 py-1.5 rounded-xl text-xs font-semibold border border-charcoal-900 bg-charcoal-900 text-white flex items-center gap-1.5';
        } else {
            btn.className = 'wall-frame-btn px-3 py-1.5 rounded-xl text-xs font-semibold border border-charcoal-200 bg-cream text-charcoal-700 flex items-center gap-1.5 hover:border-charcoal-900';
        }
    });
};

window.setWallScale = function (size) {
    currentWallScale = size;
    const container = document.getElementById('wallArtFrameContainer');
    const badge = document.getElementById('wallDimensionsBadge');
    const shadow = document.getElementById('wallFloorShadow');

    if (container) {
        if (size === 'A4') {
            container.className = 'w-40 sm:w-52 relative transition-all duration-300 ease-out';
            if (badge) badge.textContent = '📐 Size: A4 (8.3×11.7 in)';
            if (shadow) shadow.style.width = '130px';
        } else if (size === 'A3') {
            container.className = 'w-56 sm:w-72 relative transition-all duration-300 ease-out';
            if (badge) badge.textContent = '📐 Size: A3 (11.7×16.5 in)';
            if (shadow) shadow.style.width = '200px';
        } else {
            container.className = 'w-72 sm:w-96 relative transition-all duration-300 ease-out';
            if (badge) badge.textContent = '📐 Size: A2 (16.5×23.4 in)';
            if (shadow) shadow.style.width = '270px';
        }
    }

    document.querySelectorAll('.wall-scale-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${size}'`)) {
            btn.className = 'wall-scale-btn px-2.5 py-1 rounded-lg bg-charcoal-900 text-white font-bold shadow-sm';
        } else {
            btn.className = 'wall-scale-btn px-2.5 py-1 rounded-lg text-charcoal-600 hover:text-charcoal-900';
        }
    });
};

// ========================================================
// 5. CUSTOM PORTRAIT CALCULATOR & PHOTO UPLOADER
// ========================================================
function setupCustomOrderCalculator() {
    const mediumInputs = document.querySelectorAll('input[name="medium"]');
    const sizeInputs = document.querySelectorAll('input[name="size"]');
    const facesSelect = document.getElementById('customFaces');
    const frameSelect = document.getElementById('customFrame');

    const summaryMedium = document.getElementById('summaryMedium');
    const summarySize = document.getElementById('summarySize');
    const summaryFaces = document.getElementById('summaryFaces');
    const summaryFrame = document.getElementById('summaryFrame');
    const customTotalPrice = document.getElementById('customTotalPrice');

    const photoUpload = document.getElementById('photoUpload');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const fileName = document.getElementById('fileName');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    let uploadedPhotoBase64 = null;

    function calculateCustomPrice() {
        let basePrice = 1499;

        const selectedMedium = document.querySelector('input[name="medium"]:checked').value;
        if (selectedMedium === 'charcoal') basePrice += 200;
        if (selectedMedium === 'color') basePrice += 500;

        const selectedSize = document.querySelector('input[name="size"]:checked').value;
        if (selectedSize === 'A3') basePrice += 600;
        if (selectedSize === 'A2') basePrice += 1300;

        const faces = parseInt(facesSelect.value, 10);
        if (faces === 2) basePrice += 600;
        if (faces === 3) basePrice += 1100;
        if (faces >= 4) basePrice += 1600;

        const frame = frameSelect.value;
        if (frame === 'black' || frame === 'white') basePrice += 450;
        if (frame === 'brown') basePrice += 550;

        summaryMedium.textContent = selectedMedium === 'pencil' ? 'Graphite Pencil' : (selectedMedium === 'charcoal' ? 'Dark Charcoal' : 'Color Pencil');
        summarySize.textContent = selectedSize === 'A4' ? 'A4 (8.3 × 11.7 in)' : (selectedSize === 'A3' ? 'A3 (11.7 × 16.5 in)' : 'A2 (16.5 × 23.4 in)');
        summaryFaces.textContent = facesSelect.options[facesSelect.selectedIndex].text.split('(')[0].trim();
        summaryFrame.textContent = frameSelect.options[frameSelect.selectedIndex].text.split('(')[0].trim();
        customTotalPrice.textContent = `₹${basePrice.toLocaleString('en-IN')}`;

        return {
            medium: summaryMedium.textContent,
            size: summarySize.textContent,
            faces: summaryFaces.textContent,
            frame: summaryFrame.textContent,
            price: basePrice
        };
    }

    mediumInputs.forEach(i => i.addEventListener('change', calculateCustomPrice));
    sizeInputs.forEach(i => i.addEventListener('change', calculateCustomPrice));
    facesSelect.addEventListener('change', calculateCustomPrice);
    frameSelect.addEventListener('change', calculateCustomPrice);

    calculateCustomPrice();

    if (photoUpload) {
        photoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    uploadedPhotoBase64 = event.target.result;
                    previewImg.src = uploadedPhotoBase64;
                    fileName.textContent = file.name;
                    uploadPrompt.classList.add('hidden');
                    uploadPreview.classList.remove('hidden');
                    showToast('Reference photo uploaded successfully!');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            photoUpload.value = '';
            uploadedPhotoBase64 = null;
            uploadPreview.classList.add('hidden');
            uploadPrompt.classList.remove('hidden');
        });
    }

    const customWhatsAppBtn = document.getElementById('customWhatsAppBtn');
    if (customWhatsAppBtn) {
        customWhatsAppBtn.addEventListener('click', () => {
            const details = calculateCustomPrice();
            const message = `*Hello Anmol Art! I want to commission a Custom Portrait Sketch:*\n\n` +
                `🎨 *Style:* ${details.medium}\n` +
                `📐 *Paper Size:* ${details.size}\n` +
                `👥 *Persons/Faces:* ${details.faces}\n` +
                `🖼️ *Framing:* ${details.frame}\n` +
                `💰 *Estimated Price:* ₹${details.price}\n\n` +
                (uploadedPhotoBase64 ? `📸 *Note:* I have my reference photo ready to send here on chat.` : `📸 I will send my photo here for review.`);

            const url = `https://wa.me/${ARTIST_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });
    }

    const addCustomToCartBtn = document.getElementById('addCustomToCartBtn');
    if (addCustomToCartBtn) {
        addCustomToCartBtn.addEventListener('click', () => {
            const details = calculateCustomPrice();
            const customItem = {
                id: 'custom-' + Date.now(),
                title: `Custom ${details.medium} Sketch`,
                medium: details.medium,
                dimensions: details.size,
                frame: details.frame,
                faces: details.faces,
                price: details.price,
                image: uploadedPhotoBase64 || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
                qty: 1,
                isCustom: true
            };

            cart.push(customItem);
            saveCartToStorage();
            updateCartUI();
            openCartDrawer();
            showToast('Custom Portrait added to cart!');
        });
    }
}

// ========================================================
// 6. CART & STORAGE MANAGEMENT
// ========================================================
function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('kalakriti_cart');
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        cart = [];
    }
    updateCartUI();
}

function saveCartToStorage() {
    try {
        localStorage.setItem('kalakriti_cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart', e);
    }
}

function addToCart(artworkId) {
    const artwork = ARTWORKS_DATA.find(item => item.id === artworkId);
    if (!artwork) return;

    const existingIndex = cart.findIndex(item => item.id === artworkId);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: artwork.id,
            title: artwork.title,
            medium: artwork.medium,
            dimensions: artwork.dimensions,
            price: artwork.price,
            image: artwork.image,
            qty: 1,
            isCustom: false
        });
    }

    saveCartToStorage();
    updateCartUI();
    showToast(`"${artwork.title}" added to your cart!`);
}

function directWhatsAppBuy(artworkId) {
    const artwork = ARTWORKS_DATA.find(item => item.id === artworkId);
    if (!artwork) return;

    const msg = `*Hello Anmol Art! I want to buy this ready artwork:*\n\n` +
        `🎨 *Artwork:* ${artwork.title}\n` +
        `📐 *Size:* ${artwork.dimensions}\n` +
        `💰 *Price:* ₹${artwork.price}\n\n` +
        `Please confirm availability & delivery details.`;

    window.open(`https://wa.me/${ARTIST_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function updateCartQty(index, change) {
    if (cart[index]) {
        cart[index].qty += change;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        saveCartToStorage();
        updateCartUI();
    }
}

function removeCartItem(index) {
    if (cart[index]) {
        cart.splice(index, 1);
        saveCartToStorage();
        updateCartUI();
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const mobileCartCount = document.getElementById('mobileCartCount');
    const cartDrawerCount = document.getElementById('cartDrawerCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCartState = document.getElementById('emptyCartState');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    if (cartCount) cartCount.textContent = totalItems;
    if (mobileCartCount) mobileCartCount.textContent = totalItems;
    if (cartDrawerCount) cartDrawerCount.textContent = `${totalItems} items`;

    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '';
        emptyCartState.classList.remove('hidden');
        cartFooter.classList.add('hidden');
        return;
    }

    emptyCartState.classList.add('hidden');
    cartFooter.classList.remove('hidden');

    cartItemsList.innerHTML = cart.map((item, index) => `
        <div class="flex gap-3 bg-white p-3 rounded-xl border border-charcoal-200 shadow-sm items-center">
            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-lg bg-charcoal-100 flex-shrink-0">
            <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-charcoal-900 truncate">${item.title}</h4>
                <p class="text-[10px] text-charcoal-500">${item.dimensions || item.medium}</p>
                ${item.isCustom ? `<span class="inline-block bg-amberart/10 text-amberart text-[9px] font-bold px-1.5 py-0.5 rounded">Custom Order</span>` : ''}
                <p class="text-xs font-bold text-charcoal-900 mt-1">₹${item.price.toLocaleString('en-IN')}</p>
            </div>
            
            <div class="flex flex-col items-end gap-1.5">
                <button onclick="removeCartItem(${index})" class="text-charcoal-400 hover:text-red-500 p-1" title="Remove">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
                <div class="flex items-center border border-charcoal-200 rounded-lg bg-cream">
                    <button onclick="updateCartQty(${index}, -1)" class="px-2 py-0.5 text-xs text-charcoal-600 hover:bg-charcoal-200 rounded-l">-</button>
                    <span class="px-2 text-xs font-semibold text-charcoal-900">${item.qty}</span>
                    <button onclick="updateCartQty(${index}, 1)" class="px-2 py-0.5 text-xs text-charcoal-600 hover:bg-charcoal-200 rounded-r">+</button>
                </div>
            </div>
        </div>
    `).join('');

    if (cartTotal) cartTotal.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    lucide.createIcons();
}

// ========================================================
// 7. CART DRAWER TOGGLE & CHECKOUT
// ========================================================
function setupCartDrawer() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const checkoutWhatsAppBtn = document.getElementById('checkoutWhatsAppBtn');

    if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

    if (checkoutWhatsAppBtn) {
        checkoutWhatsAppBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            const name = document.getElementById('custName').value.trim();
            const phone = document.getElementById('custPhone').value.trim();
            const city = document.getElementById('custCity').value.trim() || 'Not specified';

            if (!name) {
                alert('Kripya apna Naam dalein!');
                return;
            }
            if (!phone) {
                alert('Kripya apna Mobile number dalein!');
                return;
            }

            const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
            let itemsText = cart.map(item => `${item.qty}x ${item.title}`).join(', ');

            // Save to Orders list
            const existingOrders = JSON.parse(localStorage.getItem('kalakriti_orders') || '[]');
            const newOrder = {
                id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
                date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                customerName: name,
                customerPhone: phone,
                customerCity: city,
                items: itemsText,
                total: total,
                status: 'New'
            };
            existingOrders.unshift(newOrder);
            localStorage.setItem('kalakriti_orders', JSON.stringify(existingOrders));

            // Clear Cart
            cart = [];
            saveCartToStorage();
            updateCartUI();
            closeCartDrawer();

            alert(`🎉 Order #${newOrder.id} successfully placed! Notification sent to Admin Panel.`);
        });
    }
}

window.openCartDrawer = function () {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    const panel = document.getElementById('cartPanel');

    drawer.classList.remove('pointer-events-none');
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');
};

window.closeCartDrawer = function () {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    const panel = document.getElementById('cartPanel');

    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');

    setTimeout(() => {
        drawer.classList.add('pointer-events-none');
    }, 300);
};

// ========================================================
// 8. ARTWORK ZOOM MODAL
// ========================================================
function setupArtworkModal() {
    const modal = document.getElementById('previewModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
    const modalBuyWhatsAppBtn = document.getElementById('modalBuyWhatsAppBtn');
    const modalViewOnWallBtn = document.getElementById('modalViewOnWallBtn');

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeArtworkModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeArtworkModal();
        });
    }

    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            if (selectedArtworkForModal) {
                addToCart(selectedArtworkForModal.id);
                closeArtworkModal();
            }
        });
    }

    if (modalBuyWhatsAppBtn) {
        modalBuyWhatsAppBtn.addEventListener('click', () => {
            if (selectedArtworkForModal) {
                directWhatsAppBuy(selectedArtworkForModal.id);
            }
        });
    }

    if (modalViewOnWallBtn) {
        modalViewOnWallBtn.addEventListener('click', () => {
            if (selectedArtworkForModal) {
                const art = selectedArtworkForModal;
                closeArtworkModal();
                openWallModal(art.id);
            }
        });
    }
}

window.openArtworkModal = function (artworkId) {
    const artwork = ARTWORKS_DATA.find(item => item.id === artworkId);
    if (!artwork) return;

    selectedArtworkForModal = artwork;

    document.getElementById('modalImg').src = artwork.image;
    document.getElementById('modalTitle').textContent = artwork.title;
    document.getElementById('modalCategory').textContent = artwork.category;
    document.getElementById('modalMedium').textContent = artwork.medium;
    document.getElementById('modalDimensions').textContent = artwork.dimensions;
    document.getElementById('modalDesc').textContent = artwork.description;
    document.getElementById('modalPrice').textContent = `₹${artwork.price.toLocaleString('en-IN')}`;

    const modal = document.getElementById('previewModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeArtworkModal = function () {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
    selectedArtworkForModal = null;
};

// ========================================================
// 9. TOAST & MOBILE MENU
// ========================================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('toast-visible');

    setTimeout(() => {
        toast.classList.remove('toast-visible');
    }, 3000);
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}
