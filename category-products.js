/**
 * FORDIPS TECH - Category-Based Product Display System
 * Organizes products by category with pagination and search
 */

// Configuration
const ITEMS_PER_CATEGORY = 4; // Show 4 items initially
const ITEMS_TO_LOAD = 4; // Load 4 more items when "View More" is clicked

// Track expanded state for each category
const categoryState = {
    iphone: { expanded: false, currentCount: ITEMS_PER_CATEGORY },
    samsung: { expanded: false, currentCount: ITEMS_PER_CATEGORY },
    laptop: { expanded: false, currentCount: ITEMS_PER_CATEGORY },
    desktop: { expanded: false, currentCount: ITEMS_PER_CATEGORY },
    tablet: { expanded: false, currentCount: ITEMS_PER_CATEGORY },
    smartwatch: { expanded: false, currentCount: ITEMS_PER_CATEGORY },
    starlink: { expanded: false, currentCount: ITEMS_PER_CATEGORY },
    camera: { expanded: false, currentCount: ITEMS_PER_CATEGORY },
    accessory: { expanded: false, currentCount: ITEMS_PER_CATEGORY }
};

/**
 * Initialize category-based product display
 */
function initializeCategoryProducts() {
    const categories = ['iphone', 'samsung', 'laptop', 'desktop', 'tablet', 'smartwatch', 'starlink', 'camera', 'accessory'];

    categories.forEach(category => {
        renderCategoryProducts(category);
        setupViewMoreButton(category);
    });

    setupGlobalSearch();
}

/**
 * Render products for a specific category
 */
function renderCategoryProducts(category) {
    const categoryProducts = products.filter(p => p.category === category);
    const grid = document.querySelector(`.products-grid[data-category="${category}"]`);
    const viewMoreBtn = document.querySelector(`.btn-view-more[data-category="${category}"]`);
    const countSpan = document.querySelector(`#category-${category} .category-item-count`);

    if (!grid || !categoryProducts.length) return;

    const currentCount = categoryState[category].currentCount;
    const productsToShow = categoryProducts.slice(0, currentCount);

    // Update count
    if (countSpan) {
        countSpan.textContent = `${productsToShow.length} of ${categoryProducts.length}`;
    }

    // Render products
    grid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');

    // Update View More button
    if (viewMoreBtn) {
        if (productsToShow.length >= categoryProducts.length) {
            viewMoreBtn.style.display = 'none';
        } else {
            viewMoreBtn.style.display = 'flex';
            const remaining = categoryProducts.length - productsToShow.length;
            viewMoreBtn.querySelector('span').textContent =
                `View More (${remaining} more ${category === 'iphone' ? 'iPhones' : category === 'samsung' ? 'Samsung' : category === 'laptop' ? 'Laptops' : category === 'desktop' ? 'Desktops' : category === 'tablet' ? 'Tablets' : category === 'smartwatch' ? 'Smartwatches' : 'Starlink'})`;
        }
    }

    // Re-attach cart listeners
    attachCartListeners();
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
 * Setup View More button functionality
 */
function setupViewMoreButton(category) {
    const btn = document.querySelector(`.btn-view-more[data-category="${category}"]`);
    if (!btn) return;

    btn.addEventListener('click', () => {
        // Increase the count
        categoryState[category].currentCount += ITEMS_TO_LOAD;
        categoryState[category].expanded = true;

        // Re-render with more products
        renderCategoryProducts(category);

        // Smooth scroll to show new items
        setTimeout(() => {
            const grid = document.querySelector(`.products-grid[data-category="${category}"]`);
            if (grid) {
                const cards = grid.querySelectorAll('.product-card');
                if (cards.length > ITEMS_PER_CATEGORY) {
                    cards[cards.length - ITEMS_TO_LOAD].scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            }
        }, 100);
    });
}

/**
 * Global Search Functionality
 */
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('searchResultsDropdown');

    if (!searchInput || !searchDropdown) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            searchDropdown.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query, searchDropdown);
        }, 300);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.style.display = 'none';
        }
    });

    // Reopen dropdown when focusing on input with text
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
            performSearch(searchInput.value.trim().toLowerCase(), searchDropdown);
        }
    });
}

/**
 * Perform search and display results
 */
function performSearch(query, dropdown) {
    // Search products
    const matchedProducts = products.filter(product => {
        return product.name.toLowerCase().includes(query) ||
               product.category.toLowerCase().includes(query) ||
               product.description.toLowerCase().includes(query);
    });

    // Group by category
    const categoryResults = {};
    matchedProducts.forEach(product => {
        if (!categoryResults[product.category]) {
            categoryResults[product.category] = [];
        }
        categoryResults[product.category].push(product);
    });

    // Display results
    if (Object.keys(categoryResults).length === 0) {
        dropdown.innerHTML = `
            <div class="search-no-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>No products found for "${query}"</p>
            </div>
        `;
    } else {
        let html = '<div class="search-results-header">Search Results</div>';

        Object.keys(categoryResults).forEach(category => {
            const categoryName = getCategoryDisplayName(category);
            const items = categoryResults[category];

            html += `
                <div class="search-category-group">
                    <div class="search-category-header">${categoryName} (${items.length})</div>
                    <div class="search-items">
                        ${items.slice(0, 3).map(product => `
                            <div class="search-item" data-product-id="${product.id}" data-category="${category}">
                                <img src="${product.image}" alt="${product.name}" class="search-item-image">
                                <div class="search-item-info">
                                    <div class="search-item-name">${product.name}</div>
                                    <div class="search-item-price">$${product.price.toLocaleString()}</div>
                                </div>
                            </div>
                        `).join('')}
                        ${items.length > 3 ? `
                            <div class="search-view-all" data-category="${category}">
                                View all ${items.length} ${categoryName} →
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        dropdown.innerHTML = html;

        // Attach click handlers
        dropdown.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                const productId = parseInt(item.dataset.productId);
                const category = item.dataset.category;
                scrollToProduct(productId, category);
                dropdown.style.display = 'none';
                document.getElementById('globalSearchInput').value = '';
            });
        });

        dropdown.querySelectorAll('.search-view-all').forEach(link => {
            link.addEventListener('click', () => {
                const category = link.dataset.category;
                scrollToCategory(category);
                dropdown.style.display = 'none';
                document.getElementById('globalSearchInput').value = '';
            });
        });
    }

    dropdown.style.display = 'block';
}

/**
 * Get display name for category
 */
function getCategoryDisplayName(category) {
    const names = {
        iphone: 'iPhones',
        samsung: 'Samsung Galaxy',
        laptop: 'Laptops',
        desktop: 'Desktops',
        tablet: 'Tablets',
        smartwatch: 'Smartwatches',
        starlink: 'Starlink',
        camera: 'Cameras',
        accessory: 'Accessories'
    };
    return names[category] || category;
}

/**
 * Scroll to specific product
 */
function scrollToProduct(productId, category) {
    // Expand category if needed
    const categoryProducts = products.filter(p => p.category === category);
    const productIndex = categoryProducts.findIndex(p => p.id === productId);

    if (productIndex >= categoryState[category].currentCount) {
        categoryState[category].currentCount = productIndex + 1;
        categoryState[category].expanded = true;
        renderCategoryProducts(category);
    }

    // Scroll to product
    setTimeout(() => {
        const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (productCard) {
            productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            productCard.classList.add('highlight-product');
            setTimeout(() => {
                productCard.classList.remove('highlight-product');
            }, 2000);
        }
    }, 300);
}

/**
 * Scroll to category section
 */
function scrollToCategory(category) {
    const categorySection = document.getElementById(`category-${category}`);
    if (categorySection) {
        categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Update category filters on category card click
 */
function setupCategoryCardFilters() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            scrollToCategory(category);
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.products && Array.isArray(window.products)) {
                initializeCategoryProducts();
                setupCategoryCardFilters();
                console.log('✅ Category-based product system initialized');
            }
        }, 200);
    });
} else {
    setTimeout(() => {
        if (window.products && Array.isArray(window.products)) {
            initializeCategoryProducts();
            setupCategoryCardFilters();
            console.log('✅ Category-based product system initialized');
        }
    }, 200);
}
