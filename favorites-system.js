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
    console.log('🎯 Initializing Favorites System...');

    // Load favorites from Supabase
    await loadFavoritesFromDatabase();

    // Update UI to show favorite states
    updateAllFavoriteButtons();

    // Update favorites count in header
    updateFavoritesCount();

    console.log('✅ Favorites System initialized');
}

/**
 * Load favorites from Supabase
 */
async function loadFavoritesFromDatabase() {
    if (!window.supabaseClient) {
        console.warn('⚠️ Supabase client not available, using localStorage fallback');
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

        console.log(`📦 Loaded ${favoritesCache.size} favorites from database`);
    } catch (error) {
        console.error('❌ Error loading favorites:', error);
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
            console.error('Error parsing favorites from localStorage:', e);
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
        console.error('Product data not found for ID:', productId);
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
                    console.log('Product already in favorites');
                } else {
                    throw error;
                }
            }

            console.log('✅ Added to favorites:', productData.name);
            showNotification(`${productData.name} added to favorites! ❤️`, 'success');
        } catch (error) {
            console.error('❌ Error saving favorite:', error);
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

            console.log('✅ Removed from favorites:', productName);
            showNotification(`${productName} removed from favorites`, 'info');
        } catch (error) {
            console.error('❌ Error removing favorite:', error);
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
        console.error('❌ Error fetching favorites:', error);
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
    const countElement = document.getElementById('favoritesCount');
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
        console.error('Favorites modal not found');
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

    // Try to open product detail modal
    if (typeof openEnhancedProductDetail === 'function') {
        setTimeout(() => {
            openEnhancedProductDetail(productId);
        }, 300);
    } else {
        // Fallback: scroll to products section
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
    console.log('💖 DOM loaded, initializing favorites system...');
    initializeFavoritesSystem();
    attachFavoriteListeners();

    // Debug: Log favorite buttons found
    const favoriteButtons = document.querySelectorAll('[data-favorite-id]');
    console.log(`💖 Found ${favoriteButtons.length} favorite buttons on page`);
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
    closeFavoritesModal
};

console.log('💖 Favorites System loaded');
