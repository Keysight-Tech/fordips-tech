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
    setupCategoryModalCloseListeners();
}

/**
 * Update product counts for each category
 */
let categoryCountRetries = 0;
const MAX_RETRIES = 10;

function updateCategoryCounts() {
    if (!window.products || !Array.isArray(window.products)) {
        if (categoryCountRetries < MAX_RETRIES) {
            categoryCountRetries++;
            setTimeout(updateCategoryCounts, 500);
        } else {
            window.products = products; // Use products from products.js
            updateCategoryCounts();
        }
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

}

/**
 * Open category modal with products
 */
function openCategoryModal(category) {
    const modal = document.getElementById('categoryModal');
    const titleEl = document.getElementById('categoryModalTitle');
    const productsEl = document.getElementById('categoryModalProducts');

    if (!modal || !titleEl || !productsEl) {
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

}

/**
 * Close category modal
 */
function closeCategoryModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const modal = document.getElementById('categoryModal');

    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

}

/**
 * Setup close button listeners
 */
function setupCategoryModalCloseListeners() {
    const modal = document.getElementById('categoryModal');
    const closeBtn = document.querySelector('.category-modal-close');
    const overlay = document.querySelector('.category-modal-overlay');
    const modalContent = document.querySelector('.category-modal-content');

    if (closeBtn) {
        // Remove any existing listeners and add new one
        closeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeCategoryModal(e);
        };

        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeCategoryModal(e);
        });
    }

    if (overlay) {
        overlay.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeCategoryModal(e);
        };

        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeCategoryModal(e);
        });
    }

    // Prevent modal content clicks from closing modal
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // ESC key to close
    const escKeyHandler = (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeCategoryModal(e);
        }
    };

    // Remove existing handler if any
    document.removeEventListener('keydown', escKeyHandler);
    document.addEventListener('keydown', escKeyHandler);

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

}

/**
 * Create product card HTML
 */
function createProductCard(product) {
    const isFav = typeof isFavorited === 'function' ? isFavorited(product.id) : false;

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <button class="product-favorite-btn ${isFav ? 'favorited' : ''}"
                        data-product-id="${product.id}"
                        data-product-name="${product.name}"
                        data-product-price="${product.price}"
                        data-product-image="${product.image}"
                        data-product-category="${product.category}"
                        data-product-description="${product.description || ''}"
                        onclick="handleFavoriteClick(${product.id}, this)"
                        aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="${isFav ? '#2CA9A1' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
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
 * Handle favorite button click
 */
async function handleFavoriteClick(productId, button) {
    if (typeof toggleFavorite !== 'function') {
        return;
    }

    const productData = {
        id: productId,
        name: button.dataset.productName,
        price: parseFloat(button.dataset.productPrice),
        image: button.dataset.productImage,
        category: button.dataset.productCategory,
        description: button.dataset.productDescription
    };

    await toggleFavorite(productId, productData);

    // Update button state
    const isFav = typeof isFavorited === 'function' ? isFavorited(productId) : false;
    const svg = button.querySelector('svg');

    if (isFav) {
        button.classList.add('favorited');
        svg.setAttribute('fill', '#2CA9A1');
        button.setAttribute('aria-label', 'Remove from favorites');
    } else {
        button.classList.remove('favorited');
        svg.setAttribute('fill', 'none');
        button.setAttribute('aria-label', 'Add to favorites');
    }

    // Update favorites count in header
    if (typeof updateFavoritesCount === 'function') {
        updateFavoritesCount();
    }
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

