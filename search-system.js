/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORDIPS TECH - ADVANCED REAL-TIME PRODUCT SEARCH SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Search products with instant results as you type
 *
 * FEATURES:
 * ✅ Real-time search with instant results (300ms debounce)
 * ✅ Fuzzy matching - finds products with partial keywords
 * ✅ Multi-field search - searches name, description, category, badges
 * ✅ Word extraction - ignores common stop words for better results
 * ✅ Number recognition - "17" finds "iPhone 17 Pro Max"
 * ✅ Relevance sorting - exact matches first, then starts-with, then contains
 * ✅ Keyword highlighting - highlights matching text in results
 * ✅ Smart categorization - properly formats all product categories
 * ✅ Stock status display - shows in-stock/out-of-stock status
 * ✅ Keyboard navigation - Arrow keys and Enter support
 * ✅ Escape to close - Press ESC to close search results
 * ✅ Click outside to close - Overlay click closes dropdown
 * ✅ Loading states - Shows spinner while searching
 * ✅ Error handling - Graceful error states
 * ✅ No results state - Helpful message with suggestions
 * ✅ Multiple search inputs - Works with header, hero, and global search
 * ✅ Mobile responsive - Optimized for all screen sizes
 * ✅ Top 10 results - Shows most relevant products
 * ✅ View all button - Navigate to see all results
 * ✅ Product highlighting - Highlights selected product in catalog
 *
 * SUPPORTED SEARCH TERMS:
 * - Product names: "iPhone", "Samsung Galaxy", "MacBook Pro"
 * - Categories: "laptop", "phone", "tablet", "smartwatch"
 * - Numbers: "17", "24", "M3"
 * - Keywords: "pro", "max", "ultra", "titanium"
 * - Partial: "sam" (finds Samsung), "book" (finds MacBook)
 */

class ProductSearchSystem {
    constructor() {
        this.searchResults = [];
        this.searchTimeout = null;
        this.minSearchLength = 2;
        this.init();
    }

    init() {
        window.FORDIPS_CONFIG?.logger.log('🔍 Product Search System initializing...');
        this.createSearchUI();
        this.setupEventListeners();
    }

    createSearchUI() {
        // Find the hero section to insert search bar
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        const searchBarHTML = `
            <div class="product-search-container" id="productSearchContainer">
                <div class="search-bar-wrapper">
                    <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        class="product-search-input"
                        id="productSearchInput"
                        placeholder="Search for products... (e.g., iPhone, Samsung, Laptop)"
                        autocomplete="off"
                    >
                    <button class="search-clear-btn" id="searchClearBtn" style="display: none;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Search Results Dropdown -->
                <div class="search-results-dropdown" id="searchResultsDropdown">
                    <div class="search-results-content" id="searchResultsContent">
                        <!-- Results will be inserted here -->
                    </div>
                </div>

                <!-- Search Overlay (to close dropdown when clicking outside) -->
                <div class="search-overlay" id="searchOverlay"></div>
            </div>
        `;

        // Insert after hero content
        const heroContent = heroSection.querySelector('.hero-content');
        if (heroContent) {
            heroContent.insertAdjacentHTML('afterend', searchBarHTML);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('productSearchInput');
        const globalSearchInput = document.getElementById('globalSearchInput');
        const headerSearchInput = document.getElementById('headerSearch');
        const clearBtn = document.getElementById('searchClearBtn');
        const overlay = document.getElementById('searchOverlay');

        // Setup listeners for dynamically created search input
        if (searchInput) {
            // Real-time search as user types
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            // Show results on focus if there's a query
            searchInput.addEventListener('focus', () => {
                if (searchInput.value.length >= this.minSearchLength) {
                    this.showResults();
                }
            });

            // Handle keyboard navigation
            searchInput.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e);
            });
        }

        // Setup listeners for global search input (static HTML)
        if (globalSearchInput) {
            // Real-time search as user types
            globalSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            // Show results on focus if there's a query
            globalSearchInput.addEventListener('focus', () => {
                if (globalSearchInput.value.length >= this.minSearchLength) {
                    this.showResults();
                }
            });

            // Handle keyboard navigation
            globalSearchInput.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e);
            });
        }

        // Setup listeners for header search input
        if (headerSearchInput) {
            // Real-time search as user types
            headerSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            // Show results on focus if there's a query
            headerSearchInput.addEventListener('focus', () => {
                if (headerSearchInput.value.length >= this.minSearchLength) {
                    this.showResults();
                }
            });

            // Handle keyboard navigation
            headerSearchInput.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e);
            });
        }

        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.hideResults();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideResults();
            }
        });
    }

    handleSearchInput(query) {
        const clearBtn = document.getElementById('searchClearBtn');

        // Show/hide clear button
        if (clearBtn) {
            clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
        }

        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Check minimum length
        if (query.length < this.minSearchLength) {
            this.hideResults();
            return;
        }

        // Debounce search (wait 300ms after user stops typing)
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    async performSearch(query) {
        window.FORDIPS_CONFIG?.logger.log('🔍 Searching for:', query);

        try {
            // Show loading state
            this.showLoadingState();

            // Search in database
            const results = await this.searchProducts(query);

            // Update results
            this.searchResults = results;
            this.displayResults(results, query);

            // Show results dropdown
            this.showResults();

        } catch (error) {
            window.FORDIPS_CONFIG?.logger.error('Search error:', error);
            this.showErrorState();
        }
    }

    async searchProducts(query) {
        const lowerQuery = query.toLowerCase().trim();

        // Extract meaningful words (ignore common stop words)
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from'];
        const words = lowerQuery.split(' ')
            .filter(w => w.length > 2 && !stopWords.includes(w));

        // First, try to get from local products array (faster)
        if (window.products && window.products.length > 0) {
            const results = window.products.filter(product => {
                const productName = product.name.toLowerCase();
                const productDesc = (product.description || '').toLowerCase();
                const productCategory = (product.category_slug || product.category || '').toLowerCase();
                const productBadge = (product.badge || '').toLowerCase();

                // Combine all searchable text
                const searchText = `${productName} ${productDesc} ${productCategory} ${productBadge}`;

                // Check for exact or partial match in full query
                if (searchText.includes(lowerQuery)) return true;

                // Check if any significant word matches
                for (const word of words) {
                    if (searchText.includes(word)) {
                        return true;
                    }
                }

                // Check for number variations (e.g., "17" matches "iPhone 17")
                const numbers = lowerQuery.match(/\d+/g);
                if (numbers) {
                    for (const num of numbers) {
                        if (productName.includes(num)) {
                            return true;
                        }
                    }
                }

                return false;
            });

            // Sort by relevance
            results.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();

                // Exact match first
                if (aName === lowerQuery && bName !== lowerQuery) return -1;
                if (bName === lowerQuery && aName !== lowerQuery) return 1;

                // Starts with query
                if (aName.startsWith(lowerQuery) && !bName.startsWith(lowerQuery)) return -1;
                if (bName.startsWith(lowerQuery) && !aName.startsWith(lowerQuery)) return 1;

                // Contains query in name
                if (aName.includes(lowerQuery) && !bName.includes(lowerQuery)) return -1;
                if (bName.includes(lowerQuery) && !aName.includes(lowerQuery)) return 1;

                // Priority to products with badges
                if (a.badge && !b.badge) return -1;
                if (b.badge && !a.badge) return 1;

                // Finally sort by price (cheaper first)
                return (a.price || 0) - (b.price || 0);
            });

            // Return top 10 results
            return results.slice(0, 10);
        }

        // Fallback: Search in Supabase
        if (window.fordipsTech && typeof window.fordipsTech.searchProducts === 'function') {
            return await window.fordipsTech.searchProducts(query);
        }

        return [];
    }

    displayResults(results, query) {
        const resultsContent = document.getElementById('searchResultsContent');
        if (!resultsContent) return;

        if (results.length === 0) {
            resultsContent.innerHTML = `
                <div class="search-no-results">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>No products found for "<strong>${this.escapeHtml(query)}</strong>"</p>
                    <small>Try searching for: iPhone, Samsung, MacBook, iPad, or other products</small>
                </div>
            `;
            return;
        }

        // Display results
        const resultsHTML = `
            <div class="search-results-header">
                <span>Found ${results.length} product${results.length !== 1 ? 's' : ''}</span>
                ${results.length > 3 ? `<button class="search-view-all" onclick="window.productSearch.viewAllResults('${this.escapeHtml(query)}')">
                    View All
                </button>` : ''}
            </div>
            <div class="search-results-list">
                ${results.map(product => this.createResultItem(product, query)).join('')}
            </div>
        `;

        resultsContent.innerHTML = resultsHTML;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createResultItem(product, query) {
        const priceDisplay = typeof product.price === 'number'
            ? `$${product.price.toFixed(2)}`
            : product.price;

        // Highlight matching text
        const highlightedName = this.highlightMatch(product.name, query);

        // Get category slug (support both category and category_slug)
        const categorySlug = product.category_slug || product.category || '';

        // Determine stock status (default to in stock if not specified)
        const stockQuantity = product.stock_quantity !== undefined ? product.stock_quantity : 100;
        const isInStock = stockQuantity > 0;

        return `
            <div class="search-result-item" onclick="window.productSearch.selectProduct('${product.id}')">
                <div class="search-result-image">
                    <img src="${product.image_url || product.image}" alt="${this.escapeHtml(product.name)}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-family=%22sans-serif%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                    ${product.badge ? `<span class="search-result-badge">${this.escapeHtml(product.badge)}</span>` : ''}
                </div>
                <div class="search-result-info">
                    <h4>${highlightedName}</h4>
                    <p class="search-result-category">${this.formatCategory(categorySlug)}</p>
                    <p class="search-result-description">${this.truncateText(product.description, 60)}</p>
                </div>
                <div class="search-result-price">
                    <span class="price">${priceDisplay}</span>
                    ${isInStock
                        ? `<span class="stock in-stock">In Stock</span>`
                        : `<span class="stock out-of-stock">Out of Stock</span>`
                    }
                </div>
            </div>
        `;
    }

    highlightMatch(text, query) {
        if (!query || !text) return text;

        // Escape special regex characters
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Also highlight individual words from the query
        const words = query.toLowerCase().split(' ').filter(w => w.length > 2);
        const allTerms = [escapedQuery, ...words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))];

        // Create regex for all terms
        const uniqueTerms = [...new Set(allTerms)];
        const regex = new RegExp(`(${uniqueTerms.join('|')})`, 'gi');

        return text.replace(regex, '<mark>$1</mark>');
    }

    formatCategory(slug) {
        const categoryNames = {
            'iphone': 'iPhone',
            'samsung': 'Samsung',
            'pixel': 'Google Pixel',
            'laptop': 'Laptop',
            'desktop': 'Desktop',
            'tablet': 'Tablet',
            'smartwatch': 'Smartwatch',
            'starlink': 'Starlink',
            'camera': 'Camera',
            'accessories': 'Accessories'
        };
        return categoryNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showLoadingState() {
        const resultsContent = document.getElementById('searchResultsContent');
        if (!resultsContent) return;

        resultsContent.innerHTML = `
            <div class="search-loading">
                <div class="search-loading-spinner"></div>
                <p>Searching...</p>
            </div>
        `;
    }

    showErrorState() {
        const resultsContent = document.getElementById('searchResultsContent');
        if (!resultsContent) return;

        resultsContent.innerHTML = `
            <div class="search-error">
                <p>⚠️ Error searching products</p>
                <small>Please try again</small>
            </div>
        `;
    }

    showResults() {
        const dropdown = document.getElementById('searchResultsDropdown');
        const overlay = document.getElementById('searchOverlay');

        if (dropdown) dropdown.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }

    hideResults() {
        const dropdown = document.getElementById('searchResultsDropdown');
        const overlay = document.getElementById('searchOverlay');

        if (dropdown) dropdown.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    clearSearch() {
        const searchInput = document.getElementById('productSearchInput');
        const globalSearchInput = document.getElementById('globalSearchInput');
        const headerSearchInput = document.getElementById('headerSearch');
        const clearBtn = document.getElementById('searchClearBtn');

        if (searchInput) searchInput.value = '';
        if (globalSearchInput) globalSearchInput.value = '';
        if (headerSearchInput) headerSearchInput.value = '';
        if (clearBtn) clearBtn.style.display = 'none';

        this.hideResults();
        this.searchResults = [];
    }

    selectProduct(productId) {
        window.FORDIPS_CONFIG?.logger.log('📦 Product selected:', productId);

        // Hide search results
        this.hideResults();

        // Scroll to products section
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Highlight the selected product
        setTimeout(() => {
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                productCard.classList.add('highlight-product');
                productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Remove highlight after 3 seconds
                setTimeout(() => {
                    productCard.classList.remove('highlight-product');
                }, 3000);
            }
        }, 500);
    }

    viewAllResults(query) {
        window.FORDIPS_CONFIG?.logger.log('🔍 View all results for:', query);

        // Hide search dropdown
        this.hideResults();

        // Scroll to products section
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Filter products by search query
        setTimeout(() => {
            if (typeof filterBySearch === 'function') {
                filterBySearch(query);
            }
        }, 500);
    }

    handleKeyboardNavigation(e) {
        const resultItems = document.querySelectorAll('.search-result-item');
        if (resultItems.length === 0) return;

        const activeItem = document.querySelector('.search-result-item.active');
        let currentIndex = activeItem ? Array.from(resultItems).indexOf(activeItem) : -1;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, resultItems.length - 1);
                this.setActiveResult(resultItems, currentIndex);
                break;

            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                this.setActiveResult(resultItems, currentIndex);
                break;

            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    activeItem.click();
                }
                break;
        }
    }

    setActiveResult(items, index) {
        items.forEach(item => item.classList.remove('active'));
        if (items[index]) {
            items[index].classList.add('active');
            items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// Initialize search system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.productSearch = new ProductSearchSystem();
    window.FORDIPS_CONFIG?.logger.log('✅ Product Search System ready');
});
