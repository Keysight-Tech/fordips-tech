/**
 * FORDIPS TECH - Modern Header JavaScript
 * Handles search, cart sync, and header interactions
 */

(function() {
    'use strict';

    // ============================================
    // STICKY HEADER ON SCROLL
    // ============================================
    let lastScroll = 0;
    const header = document.getElementById('modernHeader');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // ============================================
    // SYNC CART & FAVORITES COUNTS
    // ============================================
    function syncHeaderCounts() {
        // Sync cart count
        const oldCartCount = document.getElementById('cartCount');
        const newCartBadge = document.querySelector('.cart-btn-header .header-badge');

        if (oldCartCount && newCartBadge) {
            const count = oldCartCount.textContent;
            newCartBadge.textContent = count;
            newCartBadge.style.display = count > 0 ? 'flex' : 'none';
        }

        // Sync favorites count
        const oldFavCount = document.getElementById('favoritesCount');
        const newFavBadge = document.getElementById('headerFavCount');

        if (oldFavCount && newFavBadge) {
            const count = oldFavCount.textContent;
            newFavBadge.textContent = count;
            newFavBadge.style.display = count > 0 ? 'flex' : 'none';
        }

        // Sync account label
        const accountButtonText = document.getElementById('accountButtonText');
        const accountLabel = document.getElementById('accountLabel');

        if (accountButtonText && accountLabel) {
            accountLabel.textContent = accountButtonText.textContent;
        }
    }

    // Sync counts on load
    document.addEventListener('DOMContentLoaded', syncHeaderCounts);

    // Sync counts when cart/favorites update
    const observer = new MutationObserver(syncHeaderCounts);

    document.addEventListener('DOMContentLoaded', () => {
        const cartCount = document.getElementById('cartCount');
        const favCount = document.getElementById('favoritesCount');
        const accountText = document.getElementById('accountButtonText');

        if (cartCount) {
            observer.observe(cartCount, { childList: true, characterData: true, subtree: true });
        }
        if (favCount) {
            observer.observe(favCount, { childList: true, characterData: true, subtree: true });
        }
        if (accountText) {
            observer.observe(accountText, { childList: true, characterData: true, subtree: true });
        }
    });

    // ============================================
    // HEADER SEARCH FUNCTIONALITY
    // ============================================
    const searchInput = document.getElementById('headerSearch');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput && searchBtn) {
        // Search on button click
        searchBtn.addEventListener('click', performSearch);

        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // Real-time search suggestions (optional)
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length > 2) {
                    // Could add autocomplete suggestions here
                    console.log('Search query:', query);
                }
            }, 300);
        });
    }

    function performSearch() {
        const query = searchInput.value.trim();

        if (!query) {
            showNotification('Please enter a search term', 'info');
            return;
        }

        // Use existing search system if available
        if (typeof window.searchProducts === 'function') {
            window.searchProducts(query);
        } else if (typeof window.handleSearch === 'function') {
            window.handleSearch(query);
        } else {
            // Fallback: scroll to products and filter
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });

                // Try to trigger existing search if available
                const existingSearchInput = document.getElementById('searchInput');
                if (existingSearchInput) {
                    existingSearchInput.value = query;
                    existingSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }

        // Show notification
        if (typeof showNotification === 'function') {
            showNotification(`Searching for "${query}"...`, 'info');
        }
    }

    // ============================================
    // LANGUAGE SYNC
    // ============================================
    const langSelectTop = document.getElementById('languageSelectTop');
    const langSelectOld = document.getElementById('languageSelect');

    if (langSelectTop && langSelectOld) {
        // Sync from top bar to old selector
        langSelectTop.addEventListener('change', (e) => {
            langSelectOld.value = e.target.value;
            langSelectOld.dispatchEvent(new Event('change'));
        });

        // Sync from old selector to top bar
        langSelectOld.addEventListener('change', (e) => {
            langSelectTop.value = e.target.value;
        });
    }

})();
