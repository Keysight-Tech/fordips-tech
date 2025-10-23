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
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
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
