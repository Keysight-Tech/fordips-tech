/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎬 WORLD-CLASS CINEMATIC PRODUCT SHOWCASE - JavaScript Controller
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Smooth transitions, auto-play, responsive controls, touch gestures
 */

class CinematicShowcase {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.dots = [];
        this.isTransitioning = false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds per slide
        this.touchStartX = 0;
        this.touchEndX = 0;

        // Parallax settings
        this.parallaxEnabled = window.innerWidth > 768; // Disable on mobile
        this.mouseX = 0;
        this.mouseY = 0;
        this.centerX = 0;
        this.centerY = 0;

        this.init();
    }

    init() {
        // Get DOM elements
        this.showcase = document.querySelector('.cinematic-product-showcase');
        if (!this.showcase) {
            console.warn('Cinematic showcase not found');
            return;
        }

        this.slides = Array.from(this.showcase.querySelectorAll('.showcase-slide'));
        this.dots = Array.from(this.showcase.querySelectorAll('.showcase-dot'));
        this.prevBtn = this.showcase.querySelector('.showcase-nav-prev .showcase-nav-btn');
        this.nextBtn = this.showcase.querySelector('.showcase-nav-next .showcase-nav-btn');

        // Hide loading animation
        setTimeout(() => {
            const loading = this.showcase.querySelector('.showcase-loading');
            if (loading) {
                loading.classList.add('hidden');
                setTimeout(() => loading.remove(), 500);
            }
        }, 500);

        // Set first slide as active
        if (this.slides.length > 0) {
            this.slides[0].classList.add('active');
            if (this.dots.length > 0) {
                this.dots[0].classList.add('active');
            }
        }

        // Attach event listeners
        this.attachEventListeners();

        // Start auto-play
        this.startAutoPlay();

        // Preload images for smooth transitions
        this.preloadImages();

        console.log('✅ Cinematic showcase initialized with', this.slides.length, 'slides');
    }

    attachEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Dot indicators
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.showcase) return;

            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Touch/swipe gestures for mobile
        this.showcase.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.pauseAutoPlay(); // Pause when user interacts
        }, { passive: true });

        this.showcase.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.startAutoPlay(); // Resume after interaction
        }, { passive: true });

        // Mouse drag for desktop
        let isDragging = false;
        let startX = 0;

        this.showcase.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX;
            this.pauseAutoPlay();
        });

        this.showcase.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        this.showcase.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const diff = e.pageX - startX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            }
            this.startAutoPlay();
        });

        this.showcase.addEventListener('mouseleave', () => {
            isDragging = false;
            this.startAutoPlay();
        });

        // Pause auto-play when showcase is not visible
        this.setupIntersectionObserver();

        // Pause on hover
        this.showcase.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });

        this.showcase.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });

        // Parallax mouse tracking (desktop only)
        if (this.parallaxEnabled) {
            this.showcase.addEventListener('mousemove', (e) => {
                this.handleParallax(e);
            });

            this.showcase.addEventListener('mouseleave', () => {
                this.resetParallax();
            });

            // Update center position on resize
            window.addEventListener('resize', () => {
                this.updateShowcaseCenter();
                this.parallaxEnabled = window.innerWidth > 768;
            });

            this.updateShowcaseCenter();
        }
    }

    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;

        // Minimum swipe distance threshold (50px)
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swiped left - next slide
                this.nextSlide();
            } else {
                // Swiped right - previous slide
                this.prevSlide();
            }
        }
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide) return;

        this.isTransitioning = true;

        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        if (this.dots[this.currentSlide]) {
            this.dots[this.currentSlide].classList.remove('active');
        }

        // Update current slide
        this.currentSlide = index;

        // Add active class to new slide and dot
        this.slides[this.currentSlide].classList.add('active');
        if (this.dots[this.currentSlide]) {
            this.dots[this.currentSlide].classList.add('active');
        }

        // Update dynamic background
        this.updateDynamicBackground();

        // Reset transition lock after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 2000); // Match CSS transition duration

        // Reset auto-play
        this.resetAutoPlay();
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        this.pauseAutoPlay(); // Clear any existing interval
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetAutoPlay() {
        this.pauseAutoPlay();
        this.startAutoPlay();
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startAutoPlay();
                } else {
                    this.pauseAutoPlay();
                }
            });
        }, options);

        if (this.showcase) {
            observer.observe(this.showcase);
        }
    }

    preloadImages() {
        // Preload all slide images for smooth transitions
        this.slides.forEach(slide => {
            const img = slide.querySelector('.showcase-image');
            if (img && img.dataset.src) {
                const image = new Image();
                image.src = img.dataset.src;
            }
        });
    }

    // Parallax mouse-move effect
    handleParallax(e) {
        if (!this.parallaxEnabled) return;

        const rect = this.showcase.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // Calculate movement relative to center (-1 to 1)
        const moveX = (this.mouseX - this.centerX) / this.centerX;
        const moveY = (this.mouseY - this.centerY) / this.centerY;

        // Apply parallax to current slide elements
        const activeSlide = this.slides[this.currentSlide];
        if (!activeSlide) return;

        const image = activeSlide.querySelector('.showcase-image');
        const info = activeSlide.querySelector('.showcase-info');
        const glow = activeSlide.querySelector('.showcase-glow');

        // Different depths create parallax effect
        if (image) {
            const depth = 15; // pixels
            image.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
        }

        if (info) {
            const depth = 8; // Less movement for info panel
            info.style.transform = `translate(calc(-50% + ${moveX * depth}px), ${moveY * depth}px)`;
        }

        if (glow) {
            const depth = 25; // More movement for glow (background layer)
            glow.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px) scale(1.2)`;
        }
    }

    resetParallax() {
        if (!this.parallaxEnabled) return;

        const activeSlide = this.slides[this.currentSlide];
        if (!activeSlide) return;

        const image = activeSlide.querySelector('.showcase-image');
        const info = activeSlide.querySelector('.showcase-info');
        const glow = activeSlide.querySelector('.showcase-glow');

        if (image) image.style.transform = '';
        if (info) info.style.transform = 'translateX(-50%)';
        if (glow) glow.style.transform = '';
    }

    updateShowcaseCenter() {
        if (!this.showcase) return;
        const rect = this.showcase.getBoundingClientRect();
        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
    }

    // Update dynamic background based on slide data attributes
    updateDynamicBackground() {
        const currentSlideEl = this.slides[this.currentSlide];
        if (!currentSlideEl) return;

        const bgColor = currentSlideEl.dataset.bgColor;
        const accentColor = currentSlideEl.dataset.accentColor;

        if (bgColor) {
            // Convert hex to rgba for gradient
            const rgba = this.hexToRgba(bgColor, 0.15);
            this.showcase.style.setProperty('--showcase-bg-color', rgba);

            // Add transitioning class for smooth fade
            this.showcase.classList.add('transitioning');

            setTimeout(() => {
                this.showcase.classList.remove('transitioning');
            }, 3000); // Match CSS transition duration
        }
    }

    // Helper: Convert hex color to rgba
    hexToRgba(hex, alpha = 1) {
        // Remove # if present
        hex = hex.replace('#', '');

        // Parse hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Public method to destroy the showcase (cleanup)
    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners if needed
    }
}

// Initialize showcase when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are loaded
    setTimeout(() => {
        window.cinematicShowcase = new CinematicShowcase();
    }, 100);
});

// Re-initialize on resize (debounced) for responsive adjustments
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Just log resize for now - showcase is already responsive via CSS
        console.log('Showcase: Window resized');
    }, 250);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.cinematicShowcase) {
        window.cinematicShowcase.destroy();
    }
});
