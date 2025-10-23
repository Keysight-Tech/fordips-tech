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

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Prevent menu from closing when clicking inside it
if (navMenu) {
    navMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

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

function initDeviceCarousel() {
    const slides = document.querySelectorAll('.device-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    console.log(`📸 Carousel found ${slides.length} slides`);

    if (slides.length === 0) {
        console.warn('⚠️ No carousel slides found!');
        return;
    }

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
            console.log(`✅ Image ${index + 1} loaded successfully`);
        });
        img.addEventListener('error', () => {
            console.error(`❌ Image ${index + 1} failed to load: ${img.src}`);
        });
    });

    console.log('✅ Device carousel initialized successfully!');
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

    // Initialize device carousel
    initDeviceCarousel();

    console.log('🚀 Fordips Tech loaded successfully!');
    console.log(`Cart contains ${getCartCount()} items`);
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
