/**
 * FORDIPS TECH - Enhanced World-Class Product System
 * Complete e-commerce product experience like Amazon
 */

// Comprehensive product variants and details for ALL products
const enhancedProductData = {
    // ===== iPHONES =====
    1: {
        fullDescription: 'The iPhone 6 revolutionized smartphones with its sleek design and powerful performance. Featuring a stunning 4.7-inch Retina HD display, advanced camera system, and the powerful A8 chip.',
        specifications: {
            'Display': '4.7-inch Retina HD',
            'Chip': 'A8 with M8 motion coprocessor',
            'Camera': '8MP iSight camera',
            'Battery': 'Up to 14 hours talk time',
            'Storage Options': '16GB, 64GB, 128GB',
            'Colors': 'Space Gray, Silver, Gold'
        },
        gallery: [
            'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',
            'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
        ],
        colors: [
            { name: 'Space Gray', hex: '#535150', priceModifier: 0 },
            { name: 'Silver', hex: '#E3E4E5', priceModifier: 0 },
            { name: 'Gold', hex: '#F9D8C7', priceModifier: 0 }
        ],
        storage: [
            { name: '16GB', priceModifier: 0 },
            { name: '64GB', priceModifier: 50 },
            { name: '128GB', priceModifier: 100 }
        ]
    },
    2: {
        fullDescription: 'iPhone 6s brings 3D Touch, a revolutionary way to interact with your phone. With improved cameras, faster A9 chip, and Live Photos, it\'s a significant upgrade.',
        specifications: {
            'Display': '4.7-inch Retina HD with 3D Touch',
            'Chip': 'A9 with M9 motion coprocessor',
            'Camera': '12MP iSight camera with Live Photos',
            'Video': '4K video recording',
            'Battery': 'Up to 14 hours talk time',
            'Colors': 'Space Gray, Silver, Gold, Rose Gold'
        },
        gallery: [
            'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
        ],
        colors: [
            { name: 'Space Gray', hex: '#535150', priceModifier: 0 },
            { name: 'Silver', hex: '#E3E4E5', priceModifier: 0 },
            { name: 'Gold', hex: '#F9D8C7', priceModifier: 0 },
            { name: 'Rose Gold', hex: '#E6C7C2', priceModifier: 0 }
        ],
        storage: [
            { name: '32GB', priceModifier: 0 },
            { name: '128GB', priceModifier: 50 }
        ]
    },
    5: {
        fullDescription: 'iPhone SE (2022) packs the powerful A15 Bionic chip in a compact design. Perfect for those who love a smaller phone without compromising on performance.',
        specifications: {
            'Display': '4.7-inch Retina HD',
            'Chip': 'A15 Bionic',
            'Camera': '12MP Wide camera with Smart HDR 4',
            '5G': 'Superfast 5G cellular',
            'Battery': 'Up to 15 hours video playback',
            'Water Resistance': 'IP67'
        },
        gallery: [
            'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/SE.jpg',
            'https://images.unsplash.com/photo-1592286927505-24b683486e36?w=800&q=80'
        ],
        colors: [
            { name: 'Midnight', hex: '#2C2C2E', priceModifier: 0 },
            { name: 'Starlight', hex: '#FAF6F2', priceModifier: 0 },
            { name: 'Product RED', hex: '#BA0C2F', priceModifier: 0 }
        ],
        storage: [
            { name: '64GB', priceModifier: 0 },
            { name: '128GB', priceModifier: 50 },
            { name: '256GB', priceModifier: 100 }
        ]
    },

    // ===== MACBOOKS =====
    20: {
        fullDescription: 'MacBook Air with M1 chip delivers incredible performance with up to 18 hours of battery life. The perfect balance of power and portability for students and professionals.',
        specifications: {
            'Display': '13.3-inch Retina display',
            'Chip': 'Apple M1 chip',
            'Memory': '8GB unified memory',
            'Storage': '256GB to 2TB SSD',
            'Battery': 'Up to 18 hours',
            'Weight': '2.8 pounds'
        },
        gallery: [
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'
        ],
        colors: [
            { name: 'Space Gray', hex: '#535150', priceModifier: 0 },
            { name: 'Silver', hex: '#E3E4E5', priceModifier: 0 },
            { name: 'Gold', hex: '#F9D8C7', priceModifier: 0 }
        ],
        storage: [
            { name: '256GB SSD', priceModifier: 0 },
            { name: '512GB SSD', priceModifier: 200 },
            { name: '1TB SSD', priceModifier: 400 },
            { name: '2TB SSD', priceModifier: 800 }
        ],
        memory: [
            { name: '8GB', priceModifier: 0 },
            { name: '16GB', priceModifier: 200 }
        ]
    },
    21: {
        fullDescription: 'The 15-inch MacBook Air with M2 chip gives you more screen real estate without sacrificing portability. Perfect for creative professionals and multitaskers.',
        specifications: {
            'Display': '15.3-inch Liquid Retina',
            'Chip': 'Apple M2 chip',
            'Memory': 'Up to 24GB unified memory',
            'Storage': 'Up to 2TB SSD',
            'Battery': 'Up to 18 hours',
            'Weight': '3.3 pounds'
        },
        gallery: [
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'
        ],
        colors: [
            { name: 'Midnight', hex: '#2C2C2E', priceModifier: 0 },
            { name: 'Starlight', hex: '#FAF6F2', priceModifier: 0 },
            { name: 'Space Gray', hex: '#535150', priceModifier: 0 },
            { name: 'Silver', hex: '#E3E4E5', priceModifier: 0 }
        ],
        storage: [
            { name: '256GB SSD', priceModifier: 0 },
            { name: '512GB SSD', priceModifier: 200 },
            { name: '1TB SSD', priceModifier: 400 },
            { name: '2TB SSD', priceModifier: 800 }
        ],
        memory: [
            { name: '8GB', priceModifier: 0 },
            { name: '16GB', priceModifier: 200 },
            { name: '24GB', priceModifier: 400 }
        ]
    },

    // ===== TABLETS =====
    40: {
        fullDescription: 'iPad 10th Generation brings a colorful design and powerful performance for everyday tasks. Perfect for students, creatives, and entertainment.',
        specifications: {
            'Display': '10.9-inch Liquid Retina',
            'Chip': 'A14 Bionic',
            'Camera': '12MP Wide camera',
            'Front Camera': '12MP Ultra Wide',
            'Storage': '64GB or 256GB',
            'Connectivity': 'Wi-Fi 6, Optional 5G'
        },
        gallery: [
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
            'https://images.unsplash.com/photo-1585790050230-5dd28404f5ba?w=800&q=80'
        ],
        colors: [
            { name: 'Silver', hex: '#E3E4E5', priceModifier: 0 },
            { name: 'Blue', hex: '#8EBBDC', priceModifier: 0 },
            { name: 'Pink', hex: '#F4C2C2', priceModifier: 0 },
            { name: 'Yellow', hex: '#FFE87C', priceModifier: 0 }
        ],
        storage: [
            { name: '64GB', priceModifier: 0 },
            { name: '256GB', priceModifier: 150 }
        ],
        connectivity: [
            { name: 'Wi-Fi', priceModifier: 0 },
            { name: 'Wi-Fi + Cellular', priceModifier: 150 }
        ]
    },
    43: {
        fullDescription: 'iPad Pro 12.9-inch with M2 chip delivers desktop-class performance in a portable form. The ultimate iPad with Liquid Retina XDR display for professionals.',
        specifications: {
            'Display': '12.9-inch Liquid Retina XDR',
            'Chip': 'Apple M2 chip',
            'Memory': '8GB or 16GB',
            'Storage': 'Up to 2TB',
            'Camera': '12MP Wide and 10MP Ultra Wide',
            'ProMotion': '120Hz refresh rate'
        },
        gallery: [
            'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/ipad%20pro%20m5.webp',
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80'
        ],
        colors: [
            { name: 'Space Gray', hex: '#535150', priceModifier: 0 },
            { name: 'Silver', hex: '#E3E4E5', priceModifier: 0 }
        ],
        storage: [
            { name: '128GB', priceModifier: 0 },
            { name: '256GB', priceModifier: 100 },
            { name: '512GB', priceModifier: 300 },
            { name: '1TB', priceModifier: 700 },
            { name: '2TB', priceModifier: 1300 }
        ],
        connectivity: [
            { name: 'Wi-Fi', priceModifier: 0 },
            { name: 'Wi-Fi + Cellular', priceModifier: 200 }
        ]
    },

    // ===== SMARTWATCHES =====
    50: {
        fullDescription: 'Apple Watch Series 1 is perfect for fitness tracking and staying connected. With heart rate monitoring and activity tracking.',
        specifications: {
            'Display': 'Retina OLED',
            'Case Size': '38mm or 42mm',
            'Water Resistance': 'Splash resistant',
            'Sensors': 'Heart rate, Accelerometer',
            'Battery': 'Up to 18 hours',
            'Connectivity': 'Bluetooth, Wi-Fi'
        },
        gallery: [
            'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
            'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80'
        ],
        caseSize: [
            { name: '38mm', priceModifier: 0 },
            { name: '42mm', priceModifier: 30 }
        ],
        bandColor: [
            { name: 'Black Sport Band', hex: '#2C2C2E', priceModifier: 0 },
            { name: 'White Sport Band', hex: '#F5F5F7', priceModifier: 0 },
            { name: 'Blue Sport Band', hex: '#0071E3', priceModifier: 0 }
        ]
    },
    54: {
        fullDescription: 'Apple Watch Series 9 with the new S9 chip delivers our most powerful and capable Apple Watch yet. Features include Double Tap gesture, brighter display, and advanced health features.',
        specifications: {
            'Display': 'Always-On Retina LTPO OLED',
            'Chip': 'S9 SiP',
            'Case Size': '41mm or 45mm',
            'Water Resistance': '50 meters',
            'Health': 'ECG, Blood Oxygen, Temperature',
            'Battery': 'Up to 18 hours'
        },
        gallery: [
            'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80',
            'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80'
        ],
        caseSize: [
            { name: '41mm', priceModifier: 0 },
            { name: '45mm', priceModifier: 30 }
        ],
        caseMaterial: [
            { name: 'Aluminum', priceModifier: 0 },
            { name: 'Stainless Steel', priceModifier: 300 },
            { name: 'Titanium', priceModifier: 400 }
        ],
        bandColor: [
            { name: 'Midnight Sport Band', hex: '#2C2C2E', priceModifier: 0 },
            { name: 'Starlight Sport Band', hex: '#FAF6F2', priceModifier: 0 },
            { name: 'Product RED', hex: '#BA0C2F', priceModifier: 0 },
            { name: 'Storm Blue', hex: '#4A5C6A', priceModifier: 0 }
        ]
    },

    // ===== SAMSUNG PHONES =====
    60: {
        fullDescription: 'Samsung Galaxy S24 Ultra is the pinnacle of Android innovation. With integrated S Pen, AI-powered camera, and stunning 6.8-inch Dynamic AMOLED display.',
        specifications: {
            'Display': '6.8-inch Dynamic AMOLED 2X',
            'Processor': 'Snapdragon 8 Gen 3',
            'RAM': '12GB',
            'Camera': '200MP Wide, 50MP Telephoto, 12MP Ultra Wide',
            'S Pen': 'Integrated S Pen',
            'Battery': '5000mAh'
        },
        gallery: [
            'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
        ],
        colors: [
            { name: 'Titanium Black', hex: '#2C2C2E', priceModifier: 0 },
            { name: 'Titanium Gray', hex: '#8B8680', priceModifier: 0 },
            { name: 'Titanium Violet', hex: '#9B7EBD', priceModifier: 0 },
            { name: 'Titanium Yellow', hex: '#F0E68C', priceModifier: 0 }
        ],
        storage: [
            { name: '256GB', priceModifier: 0 },
            { name: '512GB', priceModifier: 120 },
            { name: '1TB', priceModifier: 360 }
        ]
    },
    64: {
        fullDescription: 'Samsung Galaxy Z Fold 5 redefines multitasking with its foldable 7.6-inch display. Unfold to work, play, and create like never before.',
        specifications: {
            'Main Display': '7.6-inch Dynamic AMOLED 2X',
            'Cover Display': '6.2-inch Dynamic AMOLED 2X',
            'Processor': 'Snapdragon 8 Gen 2',
            'RAM': '12GB',
            'Camera': '50MP + 12MP + 10MP',
            'Battery': '4400mAh'
        },
        gallery: [
            'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&q=80',
            'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80'
        ],
        colors: [
            { name: 'Phantom Black', hex: '#2C2C2E', priceModifier: 0 },
            { name: 'Cream', hex: '#F5F3EF', priceModifier: 0 },
            { name: 'Icy Blue', hex: '#B8D8E8', priceModifier: 0 }
        ],
        storage: [
            { name: '256GB', priceModifier: 0 },
            { name: '512GB', priceModifier: 120 },
            { name: '1TB', priceModifier: 360 }
        ]
    },

    // ===== STARLINK =====
    70: {
        fullDescription: 'Starlink delivers high-speed internet via satellite, perfect for rural areas and locations without traditional broadband. Get connected anywhere.',
        specifications: {
            'Download Speed': 'Up to 220 Mbps',
            'Upload Speed': 'Up to 25 Mbps',
            'Latency': '25-60ms',
            'Coverage': 'Worldwide',
            'Weather Resistance': 'IP54 rated',
            'Power': '100W average'
        },
        gallery: [
            'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/starlink.png',
            'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80'
        ],
        options: [
            { name: 'Standard Kit', priceModifier: 0, description: 'Includes dish, router, cables, and mounting base' },
            { name: 'Extended Kit with Pole Mount', priceModifier: 150, description: 'Standard kit + professional pole mount for optimal positioning' },
            { name: 'Premium Kit with Mesh Router', priceModifier: 300, description: 'Standard kit + additional mesh router for extended coverage' }
        ]
    }
};

// Current product being viewed in detail modal
let currentProductView = {
    productId: null,
    selectedColor: null,
    selectedStorage: null,
    selectedMemory: null,
    selectedConnectivity: null,
    selectedCaseSize: null,
    selectedCaseMaterial: null,
    selectedBandColor: null,
    selectedOption: null,
    quantity: 1,
    currentPrice: 0,
    galleryIndex: 0
};

/**
 * Open Enhanced Product Detail Modal
 */
function openEnhancedProductDetail(productId) {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    const enhanced = enhancedProductData[productId];
    if (!enhanced) {
        // Fallback for products without enhanced data
        console.log('Product', productId, 'does not have enhanced data');
        return;
    }

    // Reset state
    currentProductView = {
        productId: parseInt(productId),
        selectedColor: enhanced.colors?.[0] || null,
        selectedStorage: enhanced.storage?.[0] || null,
        selectedMemory: enhanced.memory?.[0] || null,
        selectedConnectivity: enhanced.connectivity?.[0] || null,
        selectedCaseSize: enhanced.caseSize?.[0] || null,
        selectedCaseMaterial: enhanced.caseMaterial?.[0] || null,
        selectedBandColor: enhanced.bandColor?.[0] || null,
        selectedOption: enhanced.options?.[0] || null,
        quantity: 1,
        currentPrice: product.price,
        galleryIndex: 0
    };

    calculateCurrentPrice();

    // Build modal HTML
    const modalHTML = buildProductDetailModal(product, enhanced);

    // Remove existing modal
    const existing = document.getElementById('enhancedProductModal');
    if (existing) existing.remove();

    // Insert modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    // Attach event listeners
    attachProductDetailListeners();
}

/**
 * Build Product Detail Modal HTML
 */
function buildProductDetailModal(product, enhanced) {
    return `
        <div class="enhanced-product-modal active" id="enhancedProductModal">
            <div class="modal-overlay" onclick="closeEnhancedProductDetail()"></div>
            <div class="enhanced-product-content">
                <button class="modal-close-btn" onclick="closeEnhancedProductDetail()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div class="product-detail-layout">
                    <!-- Left: Image Gallery -->
                    <div class="product-gallery-section">
                        ${buildImageGallery(enhanced.gallery, product)}
                    </div>

                    <!-- Right: Product Info -->
                    <div class="product-info-section">
                        <h1 class="product-title">${product.name}</h1>
                        ${product.badge ? `<span class="product-badge-large">${product.badge}</span>` : ''}

                        <div class="product-price-section">
                            <div class="price-display">
                                <span class="price-label">Price:</span>
                                <span class="price-value" id="currentProductPrice">$${product.price.toLocaleString()}</span>
                            </div>
                            <p class="free-shipping-notice">✓ Free worldwide shipping</p>
                        </div>

                        <div class="product-description">
                            <p>${enhanced.fullDescription}</p>
                        </div>

                        <!-- Variants Selection -->
                        <div class="variants-container">
                            ${buildVariantSelectors(enhanced)}
                        </div>

                        <!-- Quantity Selector -->
                        <div class="quantity-section">
                            <label class="variant-label">Quantity:</label>
                            <div class="quantity-controls">
                                <button class="qty-decrease" onclick="adjustQuantity(-1)">−</button>
                                <input type="number" id="productQuantity" value="1" min="1" max="99" readonly>
                                <button class="qty-increase" onclick="adjustQuantity(1)">+</button>
                            </div>
                        </div>

                        <!-- Add to Cart Button -->
                        <div class="product-actions">
                            <button class="btn-add-to-cart-enhanced" onclick="addToCartEnhanced()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                </svg>
                                Add to Cart
                            </button>
                            <button class="btn-buy-now" onclick="buyNowEnhanced()">
                                Buy Now
                            </button>
                        </div>

                        <!-- Specifications -->
                        <div class="specifications-section">
                            <h3>Specifications</h3>
                            <table class="specs-table">
                                ${Object.entries(enhanced.specifications).map(([key, value]) => `
                                    <tr>
                                        <td class="spec-label">${key}</td>
                                        <td class="spec-value">${value}</td>
                                    </tr>
                                `).join('')}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Build Image Gallery
 */
function buildImageGallery(gallery, product) {
    const images = gallery || [product.image];

    return `
        <div class="gallery-main-container">
            <div class="gallery-main-image" id="galleryMainImage" onclick="toggleImageZoom()">
                <img src="${images[0]}" alt="${product.name}" id="mainProductImage">
                <div class="zoom-indicator">🔍 Click to zoom</div>
            </div>
            ${images.length > 1 ? `
                <div class="gallery-navigation">
                    <button class="gallery-nav-btn prev" onclick="navigateGallery(-1)">❮</button>
                    <button class="gallery-nav-btn next" onclick="navigateGallery(1)">❯</button>
                </div>
            ` : ''}
        </div>
        ${images.length > 1 ? `
            <div class="gallery-thumbnails">
                ${images.map((img, idx) => `
                    <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="selectGalleryImage(${idx})">
                        <img src="${img}" alt="View ${idx + 1}">
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
}

/**
 * Build Variant Selectors
 */
function buildVariantSelectors(enhanced) {
    let html = '';

    // Color selector
    if (enhanced.colors && enhanced.colors.length > 0) {
        html += `
            <div class="variant-group">
                <label class="variant-label">Color: <span id="selectedColorName">${enhanced.colors[0].name}</span></label>
                <div class="color-selector">
                    ${enhanced.colors.map((color, idx) => `
                        <button class="color-option ${idx === 0 ? 'selected' : ''}"
                                data-index="${idx}"
                                style="background-color: ${color.hex}"
                                title="${color.name}"
                                onclick="selectColor(${idx})">
                            <span class="check-mark">✓</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Storage selector
    if (enhanced.storage && enhanced.storage.length > 0) {
        html += `
            <div class="variant-group">
                <label class="variant-label">Storage:</label>
                <div class="option-selector">
                    ${enhanced.storage.map((storage, idx) => `
                        <button class="option-btn ${idx === 0 ? 'selected' : ''}" onclick="selectStorage(${idx})">
                            ${storage.name}
                            ${storage.priceModifier > 0 ? `<span class="price-modifier">+$${storage.priceModifier}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Memory selector
    if (enhanced.memory && enhanced.memory.length > 0) {
        html += `
            <div class="variant-group">
                <label class="variant-label">Memory:</label>
                <div class="option-selector">
                    ${enhanced.memory.map((mem, idx) => `
                        <button class="option-btn ${idx === 0 ? 'selected' : ''}" onclick="selectMemory(${idx})">
                            ${mem.name}
                            ${mem.priceModifier > 0 ? `<span class="price-modifier">+$${mem.priceModifier}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Connectivity selector
    if (enhanced.connectivity && enhanced.connectivity.length > 0) {
        html += `
            <div class="variant-group">
                <label class="variant-label">Connectivity:</label>
                <div class="option-selector">
                    ${enhanced.connectivity.map((conn, idx) => `
                        <button class="option-btn ${idx === 0 ? 'selected' : ''}" onclick="selectConnectivity(${idx})">
                            ${conn.name}
                            ${conn.priceModifier > 0 ? `<span class="price-modifier">+$${conn.priceModifier}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Case size selector (for watches)
    if (enhanced.caseSize && enhanced.caseSize.length > 0) {
        html += `
            <div class="variant-group">
                <label class="variant-label">Case Size:</label>
                <div class="option-selector">
                    ${enhanced.caseSize.map((size, idx) => `
                        <button class="option-btn ${idx === 0 ? 'selected' : ''}" onclick="selectCaseSize(${idx})">
                            ${size.name}
                            ${size.priceModifier > 0 ? `<span class="price-modifier">+$${size.priceModifier}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Case material selector
    if (enhanced.caseMaterial && enhanced.caseMaterial.length > 0) {
        html += `
            <div class="variant-group">
                <label class="variant-label">Case Material:</label>
                <div class="option-selector">
                    ${enhanced.caseMaterial.map((material, idx) => `
                        <button class="option-btn ${idx === 0 ? 'selected' : ''}" onclick="selectCaseMaterial(${idx})">
                            ${material.name}
                            ${material.priceModifier > 0 ? `<span class="price-modifier">+$${material.priceModifier}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Band color selector
    if (enhanced.bandColor && enhanced.bandColor.length > 0) {
        html += `
            <div class="variant-group">
                <label class="variant-label">Band Color:</label>
                <div class="color-selector">
                    ${enhanced.bandColor.map((band, idx) => `
                        <button class="color-option ${idx === 0 ? 'selected' : ''}"
                                data-index="${idx}"
                                style="background-color: ${band.hex}"
                                title="${band.name}"
                                onclick="selectBandColor(${idx})">
                            <span class="check-mark">✓</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Options selector (for bundles like Starlink)
    if (enhanced.options && enhanced.options.length > 0) {
        html += `
            <div class="variant-group">
                <label class="variant-label">Package:</label>
                <div class="option-selector-vertical">
                    ${enhanced.options.map((option, idx) => `
                        <button class="option-btn-vertical ${idx === 0 ? 'selected' : ''}" onclick="selectOption(${idx})">
                            <div class="option-name">${option.name}</div>
                            ${option.description ? `<div class="option-description">${option.description}</div>` : ''}
                            ${option.priceModifier > 0 ? `<div class="option-price">+$${option.priceModifier}</div>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return html;
}

/**
 * Variant Selection Functions
 */
function selectColor(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    currentProductView.selectedColor = enhanced.colors[index];

    // Update UI
    document.querySelectorAll('.color-option').forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === index);
    });

    document.getElementById('selectedColorName').textContent = enhanced.colors[index].name;

    calculateCurrentPrice();
}

function selectStorage(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    currentProductView.selectedStorage = enhanced.storage[index];

    updateButtonSelection('.variant-group .option-selector button', index);
    calculateCurrentPrice();
}

function selectMemory(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    currentProductView.selectedMemory = enhanced.memory[index];

    updateButtonSelection('.variant-group:has(.option-selector) .option-selector button', index);
    calculateCurrentPrice();
}

function selectConnectivity(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    currentProductView.selectedConnectivity = enhanced.connectivity[index];

    calculateCurrentPrice();
}

function selectCaseSize(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    currentProductView.selectedCaseSize = enhanced.caseSize[index];

    calculateCurrentPrice();
}

function selectCaseMaterial(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    currentProductView.selectedCaseMaterial = enhanced.caseMaterial[index];

    calculateCurrentPrice();
}

function selectBandColor(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    currentProductView.selectedBandColor = enhanced.bandColor[index];

    document.querySelectorAll('.variant-group:last-child .color-option').forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === index);
    });

    calculateCurrentPrice();
}

function selectOption(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    currentProductView.selectedOption = enhanced.options[index];

    document.querySelectorAll('.option-btn-vertical').forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === index);
    });

    calculateCurrentPrice();
}

/**
 * Update button selection state
 */
function updateButtonSelection(selector, selectedIndex) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === selectedIndex);
    });
}

/**
 * Calculate current price with all modifiers
 */
function calculateCurrentPrice() {
    const product = products.find(p => p.id === currentProductView.productId);
    let price = product.price;

    // Add all price modifiers
    if (currentProductView.selectedColor) price += currentProductView.selectedColor.priceModifier || 0;
    if (currentProductView.selectedStorage) price += currentProductView.selectedStorage.priceModifier || 0;
    if (currentProductView.selectedMemory) price += currentProductView.selectedMemory.priceModifier || 0;
    if (currentProductView.selectedConnectivity) price += currentProductView.selectedConnectivity.priceModifier || 0;
    if (currentProductView.selectedCaseSize) price += currentProductView.selectedCaseSize.priceModifier || 0;
    if (currentProductView.selectedCaseMaterial) price += currentProductView.selectedCaseMaterial.priceModifier || 0;
    if (currentProductView.selectedBandColor) price += currentProductView.selectedBandColor.priceModifier || 0;
    if (currentProductView.selectedOption) price += currentProductView.selectedOption.priceModifier || 0;

    currentProductView.currentPrice = price;

    // Update price display
    const priceElement = document.getElementById('currentProductPrice');
    if (priceElement) {
        priceElement.textContent = `$${price.toLocaleString()}`;
    }
}

/**
 * Quantity controls
 */
function adjustQuantity(change) {
    const input = document.getElementById('productQuantity');
    let newValue = currentProductView.quantity + change;

    if (newValue < 1) newValue = 1;
    if (newValue > 99) newValue = 99;

    currentProductView.quantity = newValue;
    input.value = newValue;
}

/**
 * Gallery navigation
 */
function navigateGallery(direction) {
    const enhanced = enhancedProductData[currentProductView.productId];
    const gallery = enhanced.gallery || [];

    currentProductView.galleryIndex += direction;

    if (currentProductView.galleryIndex < 0) {
        currentProductView.galleryIndex = gallery.length - 1;
    } else if (currentProductView.galleryIndex >= gallery.length) {
        currentProductView.galleryIndex = 0;
    }

    selectGalleryImage(currentProductView.galleryIndex);
}

function selectGalleryImage(index) {
    const enhanced = enhancedProductData[currentProductView.productId];
    const gallery = enhanced.gallery || [];

    currentProductView.galleryIndex = index;

    // Update main image
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = gallery[index];
    }

    // Update thumbnails
    document.querySelectorAll('.gallery-thumb').forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === index);
    });
}

/**
 * Image zoom functionality
 */
let isZoomed = false;
function toggleImageZoom() {
    const container = document.getElementById('galleryMainImage');
    const img = document.getElementById('mainProductImage');

    isZoomed = !isZoomed;

    if (isZoomed) {
        container.classList.add('zoomed');
        img.style.cursor = 'zoom-out';
    } else {
        container.classList.remove('zoomed');
        img.style.cursor = 'zoom-in';
    }
}

/**
 * Add to Cart (Enhanced)
 */
function addToCartEnhanced() {
    const product = products.find(p => p.id === currentProductView.productId);

    const cartItem = {
        id: currentProductView.productId,
        name: product.name,
        price: currentProductView.currentPrice,
        image: product.image,
        quantity: currentProductView.quantity,
        selectedVariants: {
            color: currentProductView.selectedColor?.name || null,
            storage: currentProductView.selectedStorage?.name || null,
            memory: currentProductView.selectedMemory?.name || null,
            connectivity: currentProductView.selectedConnectivity?.name || null,
            caseSize: currentProductView.selectedCaseSize?.name || null,
            caseMaterial: currentProductView.selectedCaseMaterial?.name || null,
            bandColor: currentProductView.selectedBandColor?.name || null,
            option: currentProductView.selectedOption?.name || null
        }
    };

    // Add to cart using existing cart system
    addToCart(cartItem);

    // Show success message
    showNotification(`${product.name} added to cart!`, 'success');

    // Close modal
    closeEnhancedProductDetail();
}

/**
 * Buy Now (Quick checkout)
 */
function buyNowEnhanced() {
    addToCartEnhanced();

    // Open cart and checkout
    setTimeout(() => {
        if (typeof openCart === 'function') {
            openCart();
        }

        setTimeout(() => {
            if (typeof openCheckoutModal === 'function') {
                openCheckoutModal();
            }
        }, 500);
    }, 300);
}

/**
 * Close Enhanced Product Detail
 */
function closeEnhancedProductDetail() {
    const modal = document.getElementById('enhancedProductModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';

    // Reset state
    currentProductView = {
        productId: null,
        selectedColor: null,
        selectedStorage: null,
        selectedMemory: null,
        selectedConnectivity: null,
        selectedCaseSize: null,
        selectedCaseMaterial: null,
        selectedBandColor: null,
        selectedOption: null,
        quantity: 1,
        currentPrice: 0,
        galleryIndex: 0
    };
    isZoomed = false;
}

/**
 * Attach event listeners
 */
function attachProductDetailListeners() {
    // Close on overlay click
    const overlay = document.querySelector('.enhanced-product-modal .modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeEnhancedProductDetail);
    }

    // Close on ESC key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeEnhancedProductDetail();
            document.removeEventListener('keydown', escHandler);
        }
    });

    // Quantity input handling
    const qtyInput = document.getElementById('productQuantity');
    if (qtyInput) {
        qtyInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 1;
            if (value < 1) value = 1;
            if (value > 99) value = 99;
            currentProductView.quantity = value;
            e.target.value = value;
        });
    }
}

/**
 * Initialize - attach click handlers to product cards
 */
document.addEventListener('DOMContentLoaded', () => {
    // Use event delegation for dynamically loaded products
    document.addEventListener('click', (e) => {
        // Check if clicked on a product card (but not the "Add to Cart" button)
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.btn-add-cart')) {
            const productId = productCard.querySelector('.btn-add-cart')?.dataset?.id;
            if (productId && enhancedProductData[productId]) {
                e.preventDefault();
                openEnhancedProductDetail(productId);
            }
        }
    });
});
