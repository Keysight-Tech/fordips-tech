/**
 * FORDIPS TECH - REAL-TIME PRODUCT SEARCH SYSTEM
 * Search products with instant results as you type
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

        // First, try to get from local products array (faster)
        if (window.products && window.products.length > 0) {
            const localResults = window.products.filter(product => {
                return (
                    product.name.toLowerCase().includes(lowerQuery) ||
                    product.description.toLowerCase().includes(lowerQuery) ||
                    product.category_slug.toLowerCase().includes(lowerQuery) ||
                    product.badge?.toLowerCase().includes(lowerQuery)
                );
            });

            // Return top 8 results
            return localResults.slice(0, 8);
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
                    <p>No products found for "<strong>${FordipsUtils.sanitize.html(query)}</strong>"</p>
                    <small>Try different keywords or browse our categories</small>
                </div>
            `;
            return;
        }

        // Display results
        const resultsHTML = `
            <div class="search-results-header">
                <span>Found ${results.length} product${results.length !== 1 ? 's' : ''}</span>
                <button class="search-view-all" onclick="window.productSearch.viewAllResults('${query}')">
                    View All
                </button>
            </div>
            <div class="search-results-list">
                ${results.map(product => this.createResultItem(product, query)).join('')}
            </div>
        `;

        resultsContent.innerHTML = resultsHTML;
    }

    createResultItem(product, query) {
        const priceDisplay = typeof product.price === 'number'
            ? `$${product.price.toFixed(2)}`
            : product.price;

        // Highlight matching text
        const highlightedName = this.highlightMatch(product.name, query);

        return `
            <div class="search-result-item" onclick="window.productSearch.selectProduct('${product.id}')">
                <div class="search-result-image">
                    <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                    ${product.badge ? `<span class="search-result-badge">${product.badge}</span>` : ''}
                </div>
                <div class="search-result-info">
                    <h4>${highlightedName}</h4>
                    <p class="search-result-category">${this.formatCategory(product.category_slug)}</p>
                    <p class="search-result-description">${this.truncateText(product.description, 60)}</p>
                </div>
                <div class="search-result-price">
                    <span class="price">${priceDisplay}</span>
                    ${product.stock_quantity > 0
                        ? `<span class="stock in-stock">In Stock</span>`
                        : `<span class="stock out-of-stock">Out of Stock</span>`
                    }
                </div>
            </div>
        `;
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    formatCategory(slug) {
        const categoryNames = {
            'iphone': 'iPhone',
            'samsung': 'Samsung',
            'laptop': 'Laptop',
            'desktop': 'Desktop',
            'tablet': 'Tablet',
            'smartwatch': 'Smartwatch',
            'starlink': 'Starlink'
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
        const clearBtn = document.getElementById('searchClearBtn');

        if (searchInput) searchInput.value = '';
        if (globalSearchInput) globalSearchInput.value = '';
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
