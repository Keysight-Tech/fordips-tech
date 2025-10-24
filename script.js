/**
 * FORDIPS TECH - Main Script
 * Navigation, Animations & Interactions
 */

// Navbar scroll effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Drawer Navigation
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
const mobileDrawerSearchInput = document.getElementById('mobileDrawerSearchInput');

// Open/Close Mobile Drawer
function openMobileDrawer() {
    navMenu.classList.add('active');
    if (mobileDrawerOverlay) {
        mobileDrawerOverlay.classList.add('active');
        mobileDrawerOverlay.setAttribute('aria-hidden', 'false');
    }
    if (mobileMenuToggle) {
        mobileMenuToggle.classList.add('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
    navMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus trap - focus first focusable element
    const firstFocusable = navMenu.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
}

function closeMobileDrawer() {
    navMenu.classList.remove('active');
    if (mobileDrawerOverlay) {
        mobileDrawerOverlay.classList.remove('active');
        mobileDrawerOverlay.setAttribute('aria-hidden', 'true');
    }
    if (mobileMenuToggle) {
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.focus(); // Return focus to toggle button
    }
    navMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Clear search input when closing
    if (mobileDrawerSearchInput) mobileDrawerSearchInput.value = '';
}

// Toggle drawer on menu button click
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains('active')) {
            closeMobileDrawer();
        } else {
            openMobileDrawer();
        }
    });
}

// Close drawer when clicking overlay
if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);
}

// Close drawer on navigation link click
document.querySelectorAll('.nav-link, .mobile-quick-link').forEach(link => {
    link.addEventListener('click', () => {
        closeMobileDrawer();
    });
});

// Active Link Highlighting based on scroll position
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const quickLinks = document.querySelectorAll('.mobile-quick-link');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    // Update nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.classList.add('active');
        }
    });

    // Update quick links
    quickLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Listen for scroll events to update active link
window.addEventListener('scroll', updateActiveLink);

// Update on page load
document.addEventListener('DOMContentLoaded', updateActiveLink);

// Keyboard Navigation Support
// ESC key to close drawer
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        closeMobileDrawer();
    }
});

// Enter/Space on drawer close button
document.addEventListener('DOMContentLoaded', () => {
    const drawerCloseBtn = document.querySelector('.mobile-drawer-close');
    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeMobileDrawer();
            }
        });
    }
});

// Mobile Drawer Search Functionality
if (mobileDrawerSearchInput) {
    mobileDrawerSearchInput.addEventListener('input', handleMobileDrawerSearch);
    mobileDrawerSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = mobileDrawerSearchInput.value.trim().toLowerCase();
            if (searchTerm) {
                scrollToProductSection(searchTerm);
            }
        }
    });
}

function handleMobileDrawerSearch(e) {
    const searchTerm = e.target.value.trim().toLowerCase();

    if (!searchTerm) return;

    // Debounce search
    clearTimeout(window.mobileSearchTimeout);
    window.mobileSearchTimeout = setTimeout(() => {
        scrollToProductSection(searchTerm);
    }, 500);
}

function scrollToProductSection(searchTerm) {
    // Search in products array (from products.js)
    if (typeof products === 'undefined') {
        return;
    }

    // Find matching product
    const matchingProduct = products.find(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );

    if (matchingProduct) {
        // Close drawer
        closeMobileDrawer();

        // Scroll to products section first
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // After scrolling to section, try to open the category modal if it exists
            setTimeout(() => {
                const categoryBlock = document.querySelector(`[data-category="${matchingProduct.category}"]`);
                if (categoryBlock && typeof openCategoryModal === 'function') {
                    openCategoryModal(matchingProduct.category);
                }
            }, 600);
        }
    } else {
        // Search for category keywords
        const categoryMap = {
            'iphone': 'iphone',
            'samsung': 'samsung',
            'galaxy': 'samsung',
            'laptop': 'laptop',
            'macbook': 'laptop',
            'desktop': 'desktop',
            'imac': 'desktop',
            'tablet': 'tablet',
            'ipad': 'tablet',
            'watch': 'smartwatch',
            'smartwatch': 'smartwatch',
            'apple watch': 'smartwatch',
            'starlink': 'other'
        };

        const matchedCategory = Object.keys(categoryMap).find(key =>
            searchTerm.includes(key)
        );

        if (matchedCategory) {
            closeMobileDrawer();
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                setTimeout(() => {
                    if (typeof openCategoryModal === 'function') {
                        openCategoryModal(categoryMap[matchedCategory]);
                    }
                }, 600);
            }
        }
    }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Enhanced Scroll-Triggered Animations with Intersection Observer
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Parallax Effect
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;

    // Parallax for hero background
    const heroBg = document.querySelector('.hero-bg-animation');
    if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
    }

    // Parallax for floating badges
    const badges = document.querySelectorAll('.floating-badge');
    badges.forEach((badge, index) => {
        const speed = 0.15 + (index * 0.05);
        badge.style.transform = `translateY(${scrolled * speed}px)`;
    });

    // Parallax for hero image
    const heroImage = document.querySelector('.phone-showcase');
    if (heroImage) {
        heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
    }

    ticking = false;
}

function requestParallax() {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestParallax);

// Device Carousel Functionality
let currentSlide = 0;
let carouselInterval;
let carouselInitialized = false;

function initDeviceCarousel() {
    const slides = document.querySelectorAll('.device-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');


    if (slides.length === 0) {
        return;
    }

    // Prevent double initialization
    if (carouselInitialized) {
        clearInterval(carouselInterval);
    }
    carouselInitialized = true;

    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });
        dots.forEach(dot => dot.classList.remove('active'));

        // Add prev class to current slide for exit animation
        if (slides[currentSlide]) {
            slides[currentSlide].classList.add('prev');
        }

        // Update current slide index
        currentSlide = index;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;

        // Show new slide
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function goToSlide(index) {
        showSlide(index);
        resetInterval();
    }

    function resetInterval() {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
    }

    // Add click handlers to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Start auto-play
    resetInterval();

    // Pause on hover
    const carousel = document.querySelector('.device-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => clearInterval(carouselInterval));
        carousel.addEventListener('mouseleave', resetInterval);
    }

    // Add error handling for images
    const images = document.querySelectorAll('.device-img-large');
    images.forEach((img, index) => {
        img.addEventListener('load', () => {
        });
        img.addEventListener('error', () => {
        });
    });

}

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with animation classes
    const fadeInElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in');

    fadeInElements.forEach(el => {
        fadeObserver.observe(el);
    });

    // Keep existing card animations for dynamically loaded products
    const animateElements = document.querySelectorAll('.product-card, .category-card, .location-card');
    animateElements.forEach(el => {
        fadeObserver.observe(el);
    });

    // Initialize device carousel (only if products.js hasn't already done it)
    setTimeout(() => {
        if (!carouselInitialized) {
            initDeviceCarousel();
        }
    }, 200);

});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    // Escape closes cart
    if (e.key === 'Escape') {
        const cartModal = document.getElementById('cartModal');
        if (cartModal && cartModal.classList.contains('active')) {
            closeCart();
        }
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
