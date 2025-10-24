/**
 * FORDIPS TECH - Utility Functions
 * Common utilities for security, validation, and helpers
 */

/**
 * Input Sanitization - Prevent XSS attacks
 */
const sanitize = {
    /**
     * Sanitize HTML string
     */
    html: (dirty) => {
        const div = document.createElement('div');
        div.textContent = dirty;
        return div.innerHTML;
    },

    /**
     * Sanitize for attribute use
     */
    attribute: (dirty) => {
        return String(dirty)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    /**
     * Sanitize URL
     */
    url: (url) => {
        try {
            const parsed = new URL(url);
            // Only allow http and https protocols
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                return '';
            }
            return parsed.toString();
        } catch (e) {
            return '';
        }
    },

    /**
     * Sanitize email
     */
    email: (email) => {
        return String(email).trim().toLowerCase();
    }
};

/**
 * Validation Functions
 */
const validate = {
    /**
     * Validate email format
     */
    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Validate phone number (international format)
     */
    phone: (phone) => {
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    },

    /**
     * Validate credit card number (Luhn algorithm)
     */
    creditCard: (cardNumber) => {
        const digits = cardNumber.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return false;

        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    },

    /**
     * Validate ZIP code (US and international)
     */
    zipCode: (zip) => {
        return zip.trim().length >= 3;
    },

    /**
     * Validate required field
     */
    required: (value) => {
        return value !== null && value !== undefined && String(value).trim().length > 0;
    },

    /**
     * Validate minimum length
     */
    minLength: (value, min) => {
        return String(value).length >= min;
    },

    /**
     * Validate maximum length
     */
    maxLength: (value, max) => {
        return String(value).length <= max;
    }
};

/**
 * Error Handling
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: 'Unhandled Promise Rejection',
                reason: event.reason
            });
        });
    }

    logError(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            ...error,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errors.push(errorLog);

        // Log to console in development
        if (window.FORDIPS_CONFIG?.logger) {
            window.FORDIPS_CONFIG.logger.error('Application Error:', errorLog);
        }

        // In production, send to error tracking service (e.g., Sentry)
        if (window.FORDIPS_CONFIG?.ENV.isProduction) {
            this.sendToErrorTracking(errorLog);
        }
    }

    async sendToErrorTracking(errorLog) {
        // Placeholder for error tracking service integration
        // Example: Sentry, LogRocket, etc.
        try {
            // await fetch('/api/log-error', {
            //     method: 'POST',
            //     body: JSON.stringify(errorLog)
            // });
        } catch (e) {
            // Fail silently
        }
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
    }
}

/**
 * Storage Utilities (with error handling)
 */
const storage = {
    /**
     * Get item from localStorage
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            window.FORDIPS_CONFIG?.logger.error('Storage get error:', e);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            window.FORDIPS_CONFIG?.logger.error('Storage set error:', e);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            window.FORDIPS_CONFIG?.logger.error('Storage remove error:', e);
            return false;
        }
    },

    /**
     * Clear all localStorage
     */
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            window.FORDIPS_CONFIG?.logger.error('Storage clear error:', e);
            return false;
        }
    }
};

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'USD') {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch (e) {
        return `$${amount.toFixed(2)}`;
    }
}

/**
 * Format date
 */
function formatDate(date, format = 'short') {
    try {
        const options = format === 'long'
            ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            : { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    } catch (e) {
        return new Date(date).toLocaleDateString();
    }
}

/**
 * Generate unique ID
 */
function generateId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

/**
 * Sleep/delay utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize error handler
const errorHandler = new ErrorHandler();

// Export utilities
window.FordipsUtils = {
    sanitize,
    validate,
    errorHandler,
    storage,
    debounce,
    throttle,
    formatCurrency,
    formatDate,
    generateId,
    copyToClipboard,
    sleep
};

window.FORDIPS_CONFIG?.logger.info('Utilities loaded');
