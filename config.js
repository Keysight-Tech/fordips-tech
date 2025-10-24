/**
 * FORDIPS TECH - Configuration Management
 * Centralized configuration with environment support
 */

// Environment detection
const ENV = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname.includes('github.io') || window.location.hostname.includes('fordipstech.com')
};

// Supabase Configuration
// WARNING: In production, these should be loaded from environment variables
// For GitHub Pages, we'll use a build-time replacement strategy
const SUPABASE_CONFIG = {
    url: 'https://loutcbvftzojsioahtdw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdXRjYnZmdHpvanNpb2FodGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDc5NjMsImV4cCI6MjA3NjgyMzk2M30.u49fBtuF99IsEAr8iYLo_3SnHAOqTR-Y7WPXnkGVKOs'
};

// Application Configuration
const APP_CONFIG = {
    name: 'Fordips Tech',
    version: '1.0.0',
    email: {
        admin: 'brineketum@gmail.com',
        support: 'support@fordipstech.com'
    },
    phone: {
        us: '(667) 256-3680',
        cameroon: '+237 678 123 456'
    },
    urls: {
        website: ENV.isProduction ? 'https://keysight-tech.github.io/fordips-tech/' : 'http://localhost:8000',
        api: SUPABASE_CONFIG.url
    },
    features: {
        enableAnalytics: ENV.isProduction,
        enableLogging: ENV.isDevelopment,
        enableNotifications: true,
        enableMultiCurrency: true,
        enableReviews: true
    },
    limits: {
        maxCartItems: 99,
        maxProductsPerPage: 24,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        cacheExpiry: 6 * 60 * 60 * 1000 // 6 hours
    }
};

// Analytics Configuration
const ANALYTICS_CONFIG = {
    googleAnalyticsId: ENV.isProduction ? 'G-XXXXXXXXXX' : null, // Replace with actual GA4 ID
    enableTracking: ENV.isProduction
};

// Payment Gateway Configuration
const PAYMENT_CONFIG = {
    stripe: {
        publishableKey: ENV.isProduction ? 'pk_live_XXXXXXXX' : 'pk_test_XXXXXXXX',
        enabled: false // Enable when integrated
    },
    paypal: {
        clientId: 'XXXXXXXX',
        enabled: false // Enable when integrated
    }
};

// Logging utility - only logs in development
const logger = {
    log: (...args) => {
        if (APP_CONFIG.features.enableLogging) {
            console.log('[Fordips Tech]', ...args);
        }
    },
    error: (...args) => {
        if (APP_CONFIG.features.enableLogging) {
            console.error('[Fordips Tech ERROR]', ...args);
        }
    },
    warn: (...args) => {
        if (APP_CONFIG.features.enableLogging) {
            console.warn('[Fordips Tech WARN]', ...args);
        }
    },
    info: (...args) => {
        if (APP_CONFIG.features.enableLogging) {
            console.info('[Fordips Tech INFO]', ...args);
        }
    }
};

// Export configuration
window.FORDIPS_CONFIG = {
    ENV,
    SUPABASE_CONFIG,
    APP_CONFIG,
    ANALYTICS_CONFIG,
    PAYMENT_CONFIG,
    logger
};

// Log initialization in development only
logger.info('Configuration loaded', {
    environment: ENV.isDevelopment ? 'development' : 'production',
    version: APP_CONFIG.version
});
