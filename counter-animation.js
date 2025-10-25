/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔢 ANIMATED COUNTER - Count-Up Animation on Scroll
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Animates numbers from 0 to target value when scrolled into view
 */

class AnimatedCounter {
    constructor() {
        this.counters = [];
        this.hasAnimated = new WeakMap();
        this.init();
    }

    init() {
        // Get all counter elements
        this.counters = Array.from(document.querySelectorAll('.counter'));

        if (this.counters.length === 0) {
            console.log('No counters found');
            return;
        }

        // Setup intersection observer
        this.setupObserver();

        console.log(`✅ Animated Counter initialized with ${this.counters.length} counters`);
    }

    setupObserver() {
        const options = {
            root: null,
            threshold: 0.3, // Trigger when 30% visible
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Only animate once when element comes into view
                if (entry.isIntersecting && !this.hasAnimated.get(entry.target)) {
                    this.hasAnimated.set(entry.target, true);
                    this.animateCounter(entry.target);
                }
            });
        }, options);

        // Observe all counters
        this.counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseFloat(element.dataset.target);
        const decimals = parseInt(element.dataset.decimals) || 0;
        const suffix = element.dataset.suffix || '';
        const duration = 2000; // 2 seconds - fast spinning effect
        const startTime = performance.now();

        // Add animating class for CSS effects
        element.classList.add('animating');

        // Use easing function for smooth animation
        const easeOutQuad = (t) => t * (2 - t);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Apply easing
            const easedProgress = easeOutQuad(progress);

            // Calculate current value
            const currentValue = easedProgress * target;

            // Format the number
            let displayValue;
            if (decimals > 0) {
                displayValue = currentValue.toFixed(decimals);
            } else {
                displayValue = Math.floor(currentValue);
            }

            // Add comma formatting for large numbers
            if (target >= 1000 && decimals === 0) {
                displayValue = this.formatWithCommas(displayValue);
            }

            // Update element text
            element.textContent = displayValue + suffix;

            // Continue animation if not finished
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Ensure final value is exact
                let finalValue = decimals > 0 ? target.toFixed(decimals) : target;
                if (target >= 1000 && decimals === 0) {
                    finalValue = this.formatWithCommas(finalValue);
                }
                element.textContent = finalValue + suffix;

                // Remove animating class
                element.classList.remove('animating');

                // Add completion animation - pop effect
                element.style.transform = 'scale(1.15)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 300);

                // Add completed class for styling
                element.classList.add('completed');
            }
        };

        // Add smooth transition for scale effect
        element.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Elastic easing

        // Start animation
        requestAnimationFrame(updateCounter);
    }

    formatWithCommas(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.animatedCounter = new AnimatedCounter();
    }, 100);
});

// Also initialize on page show (for back/forward navigation)
window.addEventListener('pageshow', (event) => {
    if (event.persisted && !window.animatedCounter) {
        window.animatedCounter = new AnimatedCounter();
    }
});
