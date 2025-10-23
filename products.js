/**
 * FORDIPS TECH - Complete Products Database
 * Premium Electronics Catalog
 */

const products = [
    // ===== IPHONES =====
    {
        id: 1,
        name: 'iPhone 6',
        category: 'iphone',
        price: 199,
        image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',
        badge: null,
        description: 'Classic design, still reliable'
    },
    {
        id: 2,
        name: 'iPhone 6s',
        category: 'iphone',
        price: 249,
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
        badge: null,
        description: '3D Touch, improved camera'
    },
    {
        id: 3,
        name: 'iPhone 7',
        category: 'iphone',
        price: 299,
        image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&q=80',
        badge: null,
        description: 'Water resistant, no headphone jack'
    },
    {
        id: 4,
        name: 'iPhone 7 Plus',
        category: 'iphone',
        price: 349,
        image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80',
        badge: null,
        description: 'Dual camera, larger display'
    },
    {
        id: 5,
        name: 'iPhone SE',
        category: 'iphone',
        price: 429,
        image: 'https://images.unsplash.com/photo-1592286927505-24b683486e36?w=800&q=80',
        badge: 'VALUE',
        description: 'Compact powerhouse, A15 Bionic'
    },
    {
        id: 6,
        name: 'iPhone 8',
        category: 'iphone',
        price: 449,
        image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',
        badge: null,
        description: 'Wireless charging, glass back'
    },
    {
        id: 7,
        name: 'iPhone 8 Plus',
        category: 'iphone',
        price: 549,
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
        badge: null,
        description: 'Larger screen, portrait mode'
    },

    // ===== MACBOOKS =====
    {
        id: 20,
        name: 'MacBook Air 13" M1',
        category: 'laptop',
        price: 999,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
        badge: 'POPULAR',
        description: 'Lightweight, all-day battery'
    },
    {
        id: 21,
        name: 'MacBook Air 15" M2',
        category: 'laptop',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
        badge: null,
        description: 'Bigger screen, fanless design'
    },
    {
        id: 22,
        name: 'MacBook Pro 13" M2',
        category: 'laptop',
        price: 1499,
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
        badge: null,
        description: 'Touch Bar, powerful performance'
    },
    {
        id: 23,
        name: 'MacBook Pro 14" M3 Pro',
        category: 'laptop',
        price: 1999,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
        badge: 'PRO',
        description: 'Liquid Retina XDR display'
    },
    {
        id: 24,
        name: 'MacBook Pro 16" M3 Max',
        category: 'laptop',
        price: 3499,
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
        badge: 'PRO',
        description: 'Ultimate power for professionals'
    },

    // ===== DESKTOPS =====
    {
        id: 30,
        name: 'iMac 24" M3',
        category: 'desktop',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
        badge: 'NEW',
        description: 'Colorful design, 4.5K display'
    },
    {
        id: 31,
        name: 'Mac Mini M2',
        category: 'desktop',
        price: 599,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        badge: 'COMPACT',
        description: 'Small but mighty desktop'
    },
    {
        id: 32,
        name: 'Mac Mini M2 Pro',
        category: 'desktop',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&q=80',
        badge: null,
        description: 'Pro performance in compact form'
    },
    {
        id: 33,
        name: 'Mac Pro',
        category: 'desktop',
        price: 6999,
        image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
        badge: 'ULTIMATE',
        description: 'Maximum expansion and performance'
    },

    // ===== TABLETS =====
    {
        id: 40,
        name: 'iPad 10th Gen',
        category: 'tablet',
        price: 449,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
        badge: 'VALUE',
        description: 'Perfect for everyday tasks'
    },
    {
        id: 41,
        name: 'iPad Air 11"',
        category: 'tablet',
        price: 599,
        image: 'https://images.unsplash.com/photo-1585790050230-5dd28404f5ba?w=800&q=80',
        badge: null,
        description: 'Powerful M1 chip, stunning display'
    },
    {
        id: 42,
        name: 'iPad Pro 11"',
        category: 'tablet',
        price: 799,
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
        badge: 'PRO',
        description: 'M2 chip, ProMotion display'
    },
    {
        id: 43,
        name: 'iPad Pro 12.9"',
        category: 'tablet',
        price: 1099,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
        badge: 'PRO',
        description: 'Liquid Retina XDR, ultimate iPad'
    },
    {
        id: 44,
        name: 'iPad Mini',
        category: 'tablet',
        price: 499,
        image: 'https://images.unsplash.com/photo-1585790050230-5dd28404f5ba?w=800&q=80',
        badge: 'COMPACT',
        description: 'Small size, big capabilities'
    },

    // ===== SMARTWATCHES =====
    {
        id: 50,
        name: 'Apple Watch Series 1',
        category: 'smartwatch',
        price: 199,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
        badge: null,
        description: 'Entry-level fitness tracking'
    },
    {
        id: 51,
        name: 'Apple Watch Series 2',
        category: 'smartwatch',
        price: 249,
        image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80',
        badge: null,
        description: 'Water resistant, GPS'
    },
    {
        id: 52,
        name: 'Apple Watch Series 3',
        category: 'smartwatch',
        price: 299,
        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80',
        badge: null,
        description: 'Cellular connectivity option'
    },
    {
        id: 53,
        name: 'Apple Watch SE',
        category: 'smartwatch',
        price: 249,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
        badge: 'VALUE',
        description: 'Essential features, great price'
    },
    {
        id: 54,
        name: 'Apple Watch Series 9',
        category: 'smartwatch',
        price: 399,
        image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80',
        badge: 'NEW',
        description: 'Latest features, S9 chip'
    },

    // ===== SAMSUNG SMARTPHONES =====
    {
        id: 60,
        name: 'Samsung Galaxy S24 Ultra',
        category: 'samsung',
        price: 1199,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
        badge: 'NEW',
        description: 'Flagship power, S Pen included'
    },
    {
        id: 61,
        name: 'Samsung Galaxy S24+',
        category: 'samsung',
        price: 999,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
        badge: null,
        description: 'Premium display, great cameras'
    },
    {
        id: 62,
        name: 'Samsung Galaxy S24',
        category: 'samsung',
        price: 799,
        image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
        badge: null,
        description: 'Compact flagship performance'
    },
    {
        id: 63,
        name: 'Samsung Galaxy S23 FE',
        category: 'samsung',
        price: 599,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
        badge: 'VALUE',
        description: 'Fan Edition, great value'
    },
    {
        id: 64,
        name: 'Samsung Galaxy Z Fold 5',
        category: 'samsung',
        price: 1799,
        image: 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&q=80',
        badge: 'FOLDABLE',
        description: 'Ultimate multitasking device'
    },
    {
        id: 65,
        name: 'Samsung Galaxy Z Flip 5',
        category: 'samsung',
        price: 999,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
        badge: 'FOLDABLE',
        description: 'Compact flip phone design'
    },
    {
        id: 66,
        name: 'Samsung Galaxy A54 5G',
        category: 'samsung',
        price: 449,
        image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
        badge: 'POPULAR',
        description: 'Mid-range with great features'
    },
    {
        id: 67,
        name: 'Samsung Galaxy A34 5G',
        category: 'samsung',
        price: 349,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
        badge: null,
        description: 'Affordable 5G smartphone'
    },
    {
        id: 68,
        name: 'Samsung Galaxy Note 20 Ultra',
        category: 'samsung',
        price: 899,
        image: 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&q=80',
        badge: null,
        description: 'Premium Note with S Pen'
    },

    // ===== STARLINK PRODUCTS =====
    {
        id: 70,
        name: 'Starlink Internet Kit',
        category: 'starlink',
        price: 599,
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
        badge: 'COMPLETE',
        description: 'Complete satellite internet system'
    },
    {
        id: 71,
        name: 'Starlink Router',
        category: 'starlink',
        price: 199,
        image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
        badge: null,
        description: 'High-performance WiFi 6 router'
    },
    {
        id: 72,
        name: 'Starlink Dish (Satellite Antenna)',
        category: 'starlink',
        price: 499,
        image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&q=80',
        badge: null,
        description: 'Phased array satellite dish'
    },
    {
        id: 73,
        name: 'Starlink Accessories Kit',
        category: 'starlink',
        price: 149,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        badge: null,
        description: 'Cables, mounts, power supplies'
    },
    {
        id: 74,
        name: 'Starlink Ethernet Adapter',
        category: 'starlink',
        price: 49,
        image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80',
        badge: null,
        description: 'Wired connection adapter'
    },
    {
        id: 75,
        name: 'Starlink Pole Mount',
        category: 'starlink',
        price: 99,
        image: 'https://images.unsplash.com/photo-1621905252472-119e265d1b12?w=800&q=80',
        badge: null,
        description: 'Professional mounting solution'
    }
];

// Initialize products on page load
function initializeProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    renderProducts(products);
}

function renderProducts(productsToRender) {
    const productsGrid = document.getElementById('productsGrid');

    productsGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-category="${product.category}">
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
    `).join('');

    // Re-attach cart button listeners
    attachCartListeners();
}

function filterProducts(category) {
    if (category === 'all') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Setup product filters (called from initializeProducts)
function setupProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            filterProducts(filter);
        });
    });

    // Category card filters
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;

            // Scroll to products
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });

            // Filter products
            setTimeout(() => {
                const filterBtn = document.querySelector(`[data-filter="${category}"]`);
                if (filterBtn) filterBtn.click();
            }, 500);
        });
    });
}

// Enhanced initialize function that also sets up filters
function initializeProductsWithFilters() {
    initializeProducts();
    setupProductFilters();
}

// Auto-initialize if Supabase doesn't take over (fallback)
// Note: This will be prevented if supabase-integration.js loads first
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Only initialize if products aren't already loaded
        setTimeout(() => {
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid && productsGrid.children.length === 0) {
                console.log('🟡 Auto-initializing static products (Supabase fallback)');
                initializeProductsWithFilters();
            }
        }, 100);
    });
}
