/**
 * FORDIPS TECH - Product Variants & Enhanced Product Details
 * Handles product variants, image galleries, and detailed product views
 */

// Product variants data - extends base products with detailed options
const productVariants = {
    // iPhone 17 Pro Max
    1: {
        gallery: [
            'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/17%20promax.webp',
            'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&q=80',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
        ],
        colors: [
            { name: 'Natural Titanium', price: 0, hex: '#8B8680' },
            { name: 'Blue Titanium', price: 0, hex: '#394551' },
            { name: 'White Titanium', price: 0, hex: '#E5E1DB' },
            { name: 'Black Titanium', price: 0, hex: '#53514D' }
        ],
        storage: [
            { name: '256GB', price: 0 },
            { name: '512GB', price: 200 },
            { name: '1TB', price: 400 }
        ]
    },
    // iPhone SE
    5: {
        gallery: [
            'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/SE.jpg',
            'https://images.unsplash.com/photo-1592286927505-24b683486e36?w=800&q=80'
        ],
        colors: [
            { name: 'Midnight', price: 0, hex: '#2C2C2E' },
            { name: 'Starlight', price: 0, hex: '#FAF6F2' },
            { name: 'Product RED', price: 0, hex: '#BA0C2F' }
        ],
        storage: [
            { name: '64GB', price: 0 },
            { name: '128GB', price: 50 },
            { name: '256GB', price: 100 }
        ]
    },
    // iPad Pro M5
    43: {
        gallery: [
            'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/ipad%20pro%20m5.webp',
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80'
        ],
        colors: [
            { name: 'Space Gray', price: 0, hex: '#535150' },
            { name: 'Silver', price: 0, hex: '#E3E4E5' }
        ],
        storage: [
            { name: '128GB', price: 0 },
            { name: '256GB', price: 100 },
            { name: '512GB', price: 300 },
            { name: '1TB', price: 700 },
            { name: '2TB', price: 1300 }
        ]
    },
    // Canon Camera
    70: {
        gallery: [
            'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/canon.jpg',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80'
        ],
        options: [
            { name: 'Body Only', price: 0 },
            { name: 'With 24-70mm Lens', price: 500 },
            { name: 'With 24-70mm + 70-200mm', price: 1200 }
        ]
    },
    // Starlink Kit
    70: {
        gallery: [
            'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/starlink.png',
            'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80'
        ],
        options: [
            { name: 'Standard Kit', price: 0 },
            { name: 'Extended Kit with Mount', price: 150 },
            { name: 'Premium Kit with Router', price: 300 }
        ]
    }
};

// Current product detail state
let currentProductDetail = {
    product: null,
    selectedColor: null,
    selectedStorage: null,
    selectedOption: null,
    currentPrice: 0,
    currentGalleryIndex: 0
};

// Open product details modal
function openProductDetails(productId) {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    currentProductDetail.product = product;
    currentProductDetail.currentPrice = product.price;

    const variants = productVariants[productId];

    // Build modal HTML
    const modalHTML = `
        <div class="product-detail-modal active" id="productDetailModal">
            <div class="modal-overlay" onclick="closeProductDetails()"></div>
            <div class="product-detail-content">
                <button class="modal-close" onclick="closeProductDetails()">&times;</button>

                <div class="product-detail-grid">
                    <!-- Image Gallery -->
                    <div class="product-gallery">
                        <div class="gallery-main">
                            <img src="${variants?.gallery?.[0] || product.image}"
                                 alt="${product.name}"
                                 id="galleryMainImage">
                            ${variants?.gallery?.length > 1 ? `
                                <button class="gallery-nav gallery-prev" onclick="changeGalleryImage(-1)">❮</button>
                                <button class="gallery-nav gallery-next" onclick="changeGalleryImage(1)">❯</button>
                            ` : ''}
                        </div>
                        ${variants?.gallery?.length > 1 ? `
                            <div class="gallery-thumbs">
                                ${variants.gallery.map((img, idx) => `
                                    <img src="${img}"
                                         class="${idx === 0 ? 'active' : ''}"
                                         onclick="setGalleryImage(${idx})"
                                         alt="View ${idx + 1}">
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Product Info -->
                    <div class="product-detail-info">
                        <h2>${product.name}</h2>
                        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        <p class="product-description">${product.description}</p>

                        <div class="product-price-display">
                            <span class="price-label">Price:</span>
                            <span class="price-amount" id="dynamicPrice">$${product.price.toLocaleString()}</span>
                        </div>

                        <!-- Variants Section -->
                        <div class="product-variants">
                            ${variants?.colors ? `
                                <div class="variant-group">
                                    <label>Color:</label>
                                    <div class="color-options">
                                        ${variants.colors.map((color, idx) => `
                                            <button class="color-btn ${idx === 0 ? 'active' : ''}"
                                                    style="background-color: ${color.hex}"
                                                    onclick="selectColor(${idx})"
                                                    data-price="${color.price}"
                                                    title="${color.name}">
                                                <span class="color-check">✓</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                    <span class="selected-variant-name" id="selectedColorName">${variants.colors[0].name}</span>
                                </div>
                            ` : ''}

                            ${variants?.storage ? `
                                <div class="variant-group">
                                    <label>Storage:</label>
                                    <div class="storage-options">
                                        ${variants.storage.map((storage, idx) => `
                                            <button class="storage-btn ${idx === 0 ? 'active' : ''}"
                                                    onclick="selectStorage(${idx})"
                                                    data-price="${storage.price}">
                                                ${storage.name}
                                                ${storage.price > 0 ? `<span class="variant-price">+$${storage.price}</span>` : ''}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${variants?.options ? `
                                <div class="variant-group">
                                    <label>Options:</label>
                                    <div class="option-select">
                                        ${variants.options.map((option, idx) => `
                                            <button class="option-btn ${idx === 0 ? 'active' : ''}"
                                                    onclick="selectOption(${idx})"
                                                    data-price="${option.price}">
                                                ${option.name}
                                                ${option.price > 0 ? `<span class="variant-price">+$${option.price}</span>` : ''}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Add to Cart Button -->
                        <button class="btn btn-primary btn-full btn-add-to-cart-detail"
                                onclick="addToCartFromDetails()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                            <span>Add to Cart - $<span id="addToCartPrice">${product.price.toLocaleString()}</span></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('productDetailModal');
    if (existingModal) existingModal.remove();

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    // Initialize with first variants selected
    if (variants?.colors) currentProductDetail.selectedColor = variants.colors[0];
    if (variants?.storage) currentProductDetail.selectedStorage = variants.storage[0];
    if (variants?.options) currentProductDetail.selectedOption = variants.options[0];
}

// Close product details
function closeProductDetails() {
    const modal = document.getElementById('productDetailModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
    currentProductDetail = {
        product: null,
        selectedColor: null,
        selectedStorage: null,
        selectedOption: null,
        currentPrice: 0,
        currentGalleryIndex: 0
    };
}

// Gallery navigation
function changeGalleryImage(direction) {
    const productId = currentProductDetail.product.id;
    const variants = productVariants[productId];
    if (!variants?.gallery) return;

    currentProductDetail.currentGalleryIndex += direction;

    if (currentProductDetail.currentGalleryIndex < 0) {
        currentProductDetail.currentGalleryIndex = variants.gallery.length - 1;
    } else if (currentProductDetail.currentGalleryIndex >= variants.gallery.length) {
        currentProductDetail.currentGalleryIndex = 0;
    }

    setGalleryImage(currentProductDetail.currentGalleryIndex);
}

function setGalleryImage(index) {
    const productId = currentProductDetail.product.id;
    const variants = productVariants[productId];
    if (!variants?.gallery) return;

    currentProductDetail.currentGalleryIndex = index;

    const mainImg = document.getElementById('galleryMainImage');
    if (mainImg) mainImg.src = variants.gallery[index];

    // Update thumbnails
    document.querySelectorAll('.gallery-thumbs img').forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === index);
    });
}

// Variant selection functions
function selectColor(index) {
    const productId = currentProductDetail.product.id;
    const variants = productVariants[productId];
    if (!variants?.colors) return;

    currentProductDetail.selectedColor = variants.colors[index];

    // Update UI
    document.querySelectorAll('.color-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
    });

    const colorName = document.getElementById('selectedColorName');
    if (colorName) colorName.textContent = variants.colors[index].name;

    updatePrice();
}

function selectStorage(index) {
    const productId = currentProductDetail.product.id;
    const variants = productVariants[productId];
    if (!variants?.storage) return;

    currentProductDetail.selectedStorage = variants.storage[index];

    // Update UI
    document.querySelectorAll('.storage-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
    });

    updatePrice();
}

function selectOption(index) {
    const productId = currentProductDetail.product.id;
    const variants = productVariants[productId];
    if (!variants?.options) return;

    currentProductDetail.selectedOption = variants.options[index];

    // Update UI
    document.querySelectorAll('.option-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
    });

    updatePrice();
}

// Update price based on selected variants
function updatePrice() {
    let totalPrice = currentProductDetail.product.price;

    if (currentProductDetail.selectedColor) {
        totalPrice += currentProductDetail.selectedColor.price;
    }
    if (currentProductDetail.selectedStorage) {
        totalPrice += currentProductDetail.selectedStorage.price;
    }
    if (currentProductDetail.selectedOption) {
        totalPrice += currentProductDetail.selectedOption.price;
    }

    currentProductDetail.currentPrice = totalPrice;

    // Update UI
    const priceDisplay = document.getElementById('dynamicPrice');
    const addToCartPrice = document.getElementById('addToCartPrice');

    if (priceDisplay) priceDisplay.textContent = `$${totalPrice.toLocaleString()}`;
    if (addToCartPrice) addToCartPrice.textContent = totalPrice.toLocaleString();
}

// Add to cart from details modal
function addToCartFromDetails() {
    if (!currentProductDetail.product) return;

    const cartItem = {
        id: currentProductDetail.product.id,
        name: currentProductDetail.product.name,
        price: currentProductDetail.currentPrice,
        image: currentProductDetail.product.image,
        variant: {
            color: currentProductDetail.selectedColor?.name || null,
            storage: currentProductDetail.selectedStorage?.name || null,
            option: currentProductDetail.selectedOption?.name || null
        }
    };

    // Use existing cart system
    if (typeof addItemToCart === 'function') {
        addItemToCart(cartItem);
    }

    closeProductDetails();
}

// Add click listeners to product cards
document.addEventListener('DOMContentLoaded', () => {
    // Delegate click events for product cards
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.btn-add-cart')) {
            const productId = productCard.querySelector('.btn-add-cart')?.dataset?.id;
            if (productId) {
                openProductDetails(productId);
            }
        }
    });
});
