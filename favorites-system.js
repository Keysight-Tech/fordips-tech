/**
 * FORDIPS TECH - Favorites System
 * Save and manage favorite products with Supabase integration
 */

// User identifier - use email if logged in, otherwise generate unique ID
let userIdentifier = localStorage.getItem('fordipsTechUserIdentifier');

if (!userIdentifier) {
    userIdentifier = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('fordipsTechUserIdentifier', userIdentifier);
}

// In-memory cache of favorites for quick access
let favoritesCache = new Set();

/**
 * Initialize Favorites System
 */
async function initializeFavoritesSystem() {

    // Load favorites from Supabase
    await loadFavoritesFromDatabase();

    // Update UI to show favorite states
    updateAllFavoriteButtons();

    // Update favorites count in header
    updateFavoritesCount();

}

/**
 * Load favorites from Supabase
 */
async function loadFavoritesFromDatabase() {
    if (!window.supabaseClient) {
        loadFavoritesFromLocalStorage();
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('favorites')
            .select('product_id')
            .eq('user_identifier', userIdentifier);

        if (error) throw error;

        // Clear cache and rebuild
        favoritesCache.clear();
        if (data) {
            data.forEach(item => favoritesCache.add(item.product_id));
        }

    } catch (error) {
        // Fallback to localStorage
        loadFavoritesFromLocalStorage();
    }
}

/**
 * Fallback: Load favorites from localStorage
 */
function loadFavoritesFromLocalStorage() {
    const stored = localStorage.getItem('fordipsTechFavorites');
    if (stored) {
        try {
            const favorites = JSON.parse(stored);
            favoritesCache.clear();
            favorites.forEach(id => favoritesCache.add(id));
        } catch (e) {
        }
    }
}

/**
 * Save favorites to localStorage (backup)
 */
function saveFavoritesToLocalStorage() {
    localStorage.setItem('fordipsTechFavorites', JSON.stringify([...favoritesCache]));
}

/**
 * Check if product is favorited
 */
function isFavorited(productId) {
    return favoritesCache.has(parseInt(productId));
}

/**
 * Toggle favorite status
 */
async function toggleFavorite(productId, productData = null) {
    const id = parseInt(productId);

    if (isFavorited(id)) {
        await removeFavorite(id);
    } else {
        await addFavorite(id, productData);
    }
}

/**
 * Add product to favorites
 */
async function addFavorite(productId, productData = null) {
    const id = parseInt(productId);

    // Get product data if not provided
    if (!productData && typeof products !== 'undefined') {
        productData = products.find(p => p.id === id);
    }

    if (!productData) {
        showNotification('Could not add to favorites', 'error');
        return;
    }

    // Add to cache immediately for instant UI update
    favoritesCache.add(id);
    updateFavoriteButton(id, true);
    updateFavoritesCount();
    saveFavoritesToLocalStorage();

    // Save to Supabase
    if (window.supabaseClient) {
        try {
            const { data, error } = await window.supabaseClient
                .from('favorites')
                .insert({
                    user_identifier: userIdentifier,
                    product_id: id,
                    product_name: productData.name,
                    product_price: productData.price,
                    product_image: productData.image,
                    product_category: productData.category
                });

            if (error) {
                // Handle unique constraint violation (already exists)
                if (error.code === '23505') {
                } else {
                    throw error;
                }
            }

            showNotification(`${productData.name} added to favorites! ❤️`, 'success');
        } catch (error) {
            showNotification('Failed to save favorite', 'error');
            // Rollback cache on error
            favoritesCache.delete(id);
            updateFavoriteButton(id, false);
            updateFavoritesCount();
        }
    } else {
        showNotification(`${productData.name} added to favorites! ❤️`, 'success');
    }
}

/**
 * Remove product from favorites
 */
async function removeFavorite(productId) {
    const id = parseInt(productId);

    // Get product name for notification
    let productName = 'Product';
    if (typeof products !== 'undefined') {
        const product = products.find(p => p.id === id);
        if (product) productName = product.name;
    }

    // Remove from cache immediately for instant UI update
    favoritesCache.delete(id);
    updateFavoriteButton(id, false);
    updateFavoritesCount();
    saveFavoritesToLocalStorage();

    // Remove from Supabase
    if (window.supabaseClient) {
        try {
            const { error } = await window.supabaseClient
                .from('favorites')
                .delete()
                .eq('user_identifier', userIdentifier)
                .eq('product_id', id);

            if (error) throw error;

            showNotification(`${productName} removed from favorites`, 'info');
        } catch (error) {
            showNotification('Failed to remove favorite', 'error');
            // Rollback cache on error
            favoritesCache.add(id);
            updateFavoriteButton(id, true);
            updateFavoritesCount();
        }
    } else {
        showNotification(`${productName} removed from favorites`, 'info');
    }
}

/**
 * Get all favorites from database
 */
async function getAllFavorites() {
    if (!window.supabaseClient) {
        return getFavoritesFromLocalStorage();
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('favorites')
            .select('*')
            .eq('user_identifier', userIdentifier)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        return getFavoritesFromLocalStorage();
    }
}

/**
 * Fallback: Get favorites from localStorage and products array
 */
function getFavoritesFromLocalStorage() {
    if (typeof products === 'undefined') return [];

    const favoriteProducts = [];
    favoritesCache.forEach(id => {
        const product = products.find(p => p.id === id);
        if (product) {
            favoriteProducts.push({
                product_id: product.id,
                product_name: product.name,
                product_price: product.price,
                product_image: product.image,
                product_category: product.category,
                created_at: new Date().toISOString()
            });
        }
    });

    return favoriteProducts;
}

/**
 * Update favorite button state
 */
function updateFavoriteButton(productId, isFavorited) {
    const buttons = document.querySelectorAll(`[data-favorite-id="${productId}"]`);
    buttons.forEach(btn => {
        if (isFavorited) {
            btn.classList.add('favorited');
            btn.innerHTML = '❤️';
            btn.setAttribute('aria-label', 'Remove from favorites');
        } else {
            btn.classList.remove('favorited');
            btn.innerHTML = '🤍';
            btn.setAttribute('aria-label', 'Add to favorites');
        }
    });
}

/**
 * Update all favorite buttons on page
 */
function updateAllFavoriteButtons() {
    document.querySelectorAll('[data-favorite-id]').forEach(btn => {
        const productId = parseInt(btn.dataset.favoriteId);
        updateFavoriteButton(productId, isFavorited(productId));
    });
}

/**
 * Update favorites count in header
 */
function updateFavoritesCount() {
    const countElement = document.getElementById('headerFavCount');
    if (countElement) {
        const count = favoritesCache.size;
        countElement.textContent = count;
        countElement.style.display = count > 0 ? 'block' : 'none';
    }
}

/**
 * Open favorites modal
 */
async function openFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (!modal) {
        return;
    }

    // Show loading state
    const favoritesContainer = document.getElementById('favoritesContainer');
    if (favoritesContainer) {
        favoritesContainer.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading favorites...</div>';
    }

    // Open modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Load and display favorites
    const favorites = await getAllFavorites();
    displayFavorites(favorites);
}

/**
 * Close favorites modal
 */
function closeFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * Display favorites in modal
 */
function displayFavorites(favorites) {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;

    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-favorites-state">
                <div class="empty-favorites-icon">💔</div>
                <h3>No Favorites Yet</h3>
                <p>Start adding products to your favorites by clicking the heart icon!</p>
                <button class="btn-primary" onclick="closeFavoritesModal()">Start Shopping</button>
            </div>
        `;
        return;
    }

    container.innerHTML = favorites.map(item => `
        <div class="favorite-item" data-product-id="${item.product_id}">
            <div class="favorite-item-image">
                <img src="${item.product_image}" alt="${item.product_name}">
            </div>
            <div class="favorite-item-details">
                <h4>${item.product_name}</h4>
                <p class="favorite-item-category">${item.product_category}</p>
                <p class="favorite-item-price">$${parseFloat(item.product_price).toLocaleString()}</p>
            </div>
            <div class="favorite-item-actions">
                <button class="btn-favorite-remove" onclick="removeFavoriteFromModal(${item.product_id})" aria-label="Remove from favorites">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <button class="btn-favorite-view" onclick="viewFavoriteProduct(${item.product_id})">
                    View Product
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Remove favorite from modal
 */
async function removeFavoriteFromModal(productId) {
    await removeFavorite(productId);

    // Remove from UI with animation
    const item = document.querySelector(`.favorite-item[data-product-id="${productId}"]`);
    if (item) {
        item.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            item.remove();

            // Check if empty
            const container = document.getElementById('favoritesContainer');
            if (container && container.children.length === 0) {
                displayFavorites([]);
            }
        }, 300);
    }
}

/**
 * View favorite product
 */
function viewFavoriteProduct(productId) {
    closeFavoritesModal();

    // Get the product from window.products or global products array
    const productsList = window.products || (typeof products !== 'undefined' ? products : []);
    const product = productsList.find(p => p.id === parseInt(productId));

    if (!product) {
        console.warn('Product not found:', productId);
        showNotification('Product not found', 'error');
        return;
    }

    // Try to open enhanced product detail modal
    if (typeof openEnhancedProductDetail === 'function') {
        setTimeout(() => {
            openEnhancedProductDetail(productId);
        }, 300);
    } else if (typeof openProductModal === 'function') {
        // Fallback to basic product modal if enhanced one doesn't exist
        setTimeout(() => {
            openProductModal(product);
        }, 300);
    } else {
        // Create a simple product view modal
        setTimeout(() => {
            openSimpleProductView(product);
        }, 300);
    }
}

/**
 * Simple product view fallback
 */
function openSimpleProductView(product) {
    // Remove any existing modal first
    const existingModal = document.getElementById('simpleProductModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create a simple product modal
    const modal = document.createElement('div');
    modal.id = 'simpleProductModal';
    modal.className = 'modal';
    modal.style.display = 'flex';

    // Safely escape HTML to prevent XSS and parsing issues
    const safeName = (product.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeDescription = (product.description || 'Premium quality product').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeBadge = product.badge ? (product.badge || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

    modal.innerHTML = `
        <div class="modal-overlay" data-action="close-modal"></div>
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" data-action="close-modal">&times;</button>
            <div style="padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <img src="${product.image}" alt="${safeName}" style="max-width: 100%; height: auto; border-radius: 12px;">
                </div>
                <h2 style="margin-bottom: 1rem; color: #1a1a2e;">${safeName}</h2>
                ${safeBadge ? `<span class="product-badge">${safeBadge}</span>` : ''}
                <p style="color: #666; margin: 1rem 0; line-height: 1.6;">${safeDescription}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 2rem 0;">
                    <div style="font-size: 2rem; font-weight: 700; color: #2563eb;">$${product.price.toLocaleString()}</div>
                    <div style="color: #10b981; font-weight: 600;">In Stock</div>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button
                        data-action="add-to-cart"
                        data-product-id="${product.id}"
                        class="btn-primary btn-simple-add-cart"
                        style="flex: 1; padding: 1rem; font-size: 1rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Add to Cart
                    </button>
                    <button
                        data-action="toggle-favorite"
                        data-product-id="${product.id}"
                        class="btn-secondary btn-simple-favorite"
                        style="padding: 1rem 1.5rem; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer; font-size: 1.5rem;">
                        ${isFavorited(product.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Attach event listeners using event delegation
    const addToCartBtn = modal.querySelector('[data-action="add-to-cart"]');
    const favoriteBtn = modal.querySelector('[data-action="toggle-favorite"]');
    const closeButtons = modal.querySelectorAll('[data-action="close-modal"]');

    // Add to cart handler
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Disable button to prevent multiple clicks
            addToCartBtn.disabled = true;
            addToCartBtn.style.opacity = '0.6';
            addToCartBtn.textContent = 'Adding...';

            // Add to cart
            if (typeof addToCart === 'function') {
                try {
                    addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                    });

                    // Close modal after successful add
                    setTimeout(() => {
                        closeSimpleProductView();
                    }, 300);
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    showNotification('Failed to add to cart', 'error');
                    // Re-enable button
                    addToCartBtn.disabled = false;
                    addToCartBtn.style.opacity = '1';
                    addToCartBtn.textContent = 'Add to Cart';
                }
            } else {
                console.error('addToCart function not available');
                showNotification('Unable to add to cart', 'error');
                // Re-enable button
                addToCartBtn.disabled = false;
                addToCartBtn.style.opacity = '1';
                addToCartBtn.textContent = 'Add to Cart';
            }
        });
    }

    // Favorite toggle handler
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (typeof toggleFavorite === 'function') {
                toggleFavorite(product.id, product);
                // Update button icon
                favoriteBtn.textContent = isFavorited(product.id) ? '❤️' : '🤍';
            }
        });
    }

    // Close modal handlers
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSimpleProductView();
        });
    });
}

/**
 * Close simple product view
 */
function closeSimpleProductView() {
    const modal = document.getElementById('simpleProductModal');
    if (modal) {
        // Add fade-out animation
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

/**
 * Attach favorite button listeners
 */
function attachFavoriteListeners() {
    document.querySelectorAll('[data-favorite-id]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const productId = parseInt(btn.dataset.favoriteId);

            // Get product data
            let productData = null;
            if (typeof products !== 'undefined') {
                productData = products.find(p => p.id === productId);
            }

            await toggleFavorite(productId, productData);
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeFavoritesSystem();
    attachFavoriteListeners();

    // Debug: Log favorite buttons found
    const favoriteButtons = document.querySelectorAll('[data-favorite-id]');
});

// Re-attach listeners when products are loaded dynamically
if (window.MutationObserver) {
    const observer = new MutationObserver(() => {
        updateAllFavoriteButtons();
        attachFavoriteListeners();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Export functions for global use
window.favoritesSystem = {
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorited,
    getAllFavorites,
    openFavoritesModal,
    closeFavoritesModal,
    viewFavoriteProduct,
    openSimpleProductView,
    closeSimpleProductView
};

