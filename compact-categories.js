/**
 * FORDIPS TECH - Compact Categories System
 * Category blocks with modal display
 */

// Category display names
const CATEGORY_NAMES = {
    iphone: 'iPhones',
    samsung: 'Samsung Galaxy',
    laptop: 'Laptops',
    desktop: 'Desktops',
    tablet: 'Tablets',
    smartwatch: 'Smartwatches',
    starlink: 'Starlink Internet',
    camera: 'Cameras',
    accessory: 'Accessories'
};

/**
 * Initialize compact categories system
 */
function initializeCompactCategories() {
    updateCategoryCounts();
    console.log('✅ Compact categories initialized');
}

/**
 * Update product counts for each category
 */
function updateCategoryCounts() {
    if (!window.products || !Array.isArray(window.products)) {
        console.warn('⚠️ Products not loaded yet');
        setTimeout(updateCategoryCounts, 500);
        return;
    }

    const categories = ['iphone', 'samsung', 'laptop', 'desktop', 'tablet', 'smartwatch', 'starlink', 'camera', 'accessory'];

    categories.forEach(category => {
        const count = window.products.filter(p => p.category === category).length;
        const countEl = document.getElementById(`count-${category}`);

        if (countEl) {
            countEl.textContent = count;
        }
    });

    console.log('✅ Category counts updated');
}

/**
 * Open category modal with products
 */
function openCategoryModal(category) {
    const modal = document.getElementById('categoryModal');
    const titleEl = document.getElementById('categoryModalTitle');
    const productsEl = document.getElementById('categoryModalProducts');

    if (!modal || !titleEl || !productsEl) {
        console.error('❌ Category modal elements not found');
        return;
    }

    // Set title
    const categoryName = CATEGORY_NAMES[category] || category;
    titleEl.textContent = categoryName;

    // Show loading state
    productsEl.innerHTML = '<div class="category-modal-loading">Loading products...</div>';

    // Open modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Load products after a brief delay for smooth transition
    setTimeout(() => {
        loadCategoryProducts(category, productsEl);
    }, 200);

    console.log(`📂 Opened category modal: ${categoryName}`);
}

/**
 * Close category modal
 */
function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');

    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    console.log('✅ Category modal closed');
}

/**
 * Load products for a specific category
 */
function loadCategoryProducts(category, container) {
    if (!window.products || !Array.isArray(window.products)) {
        container.innerHTML = '<div class="category-modal-empty">Products not available</div>';
        return;
    }

    // Filter products by category
    const categoryProducts = window.products.filter(p => p.category === category);

    if (categoryProducts.length === 0) {
        container.innerHTML = `
            <div class="category-modal-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No products found in this category</p>
            </div>
        `;
        return;
    }

    // Render products
    container.innerHTML = categoryProducts.map(product => createProductCard(product)).join('');

    // Attach cart listeners
    if (typeof attachCartListeners === 'function') {
        attachCartListeners();
    }

    console.log(`✅ Loaded ${categoryProducts.length} products for ${category}`);
}

/**
 * Create product card HTML
 */
function createProductCard(product) {
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-content">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-price">$${product.price.toLocaleString()}</div>
                <button class="btn btn-add-cart"
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-image="${product.image}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <span data-i18n="addToCart">Add to Cart</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Handle keyboard events
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('categoryModal');
        if (modal && modal.classList.contains('active')) {
            closeCategoryModal();
        }
    }
});

/**
 * Update category counts when products change
 */
window.addEventListener('productsLoaded', () => {
    updateCategoryCounts();
});

// Make functions globally available
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeCompactCategories, 300);
    });
} else {
    setTimeout(initializeCompactCategories, 300);
}

console.log('📦 Compact categories script loaded');
