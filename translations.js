/**
 * FORDIPS TECH - Multi-Language Support
 * English & French Translations
 */

const translations = {
    en: {
        // Brand
        brandName: 'FORDIPS TECH',

        // Navigation
        navHome: 'Home',
        navProducts: 'Products',
        navCategories: 'Categories',
        navLocations: 'Locations',
        navContact: 'Contact',

        // Hero
        heroBadge: 'NEW ARRIVAL',
        heroTitle1: 'iPhone 17',
        heroTitle2: 'Pro Max',
        heroSubtitle: 'Experience the future. Titanium design. A17 Pro chip. Revolutionary camera system. Starting at $1,199.',
        heroBuyNow: 'Buy Now',
        heroLearnMore: 'Learn More',
        feature1Label: '6.7" Display',
        feature2Label: 'Camera',
        feature3Label: 'Battery',
        scrollDown: 'Scroll to explore',

        // Categories
        categoriesTitle: 'Shop by Category',
        categoriesSubtitle: 'Premium electronics for every need',
        categoryPhones: 'Phones',
        categoryPhonesDesc: 'Latest smartphone models',
        categoryIphones: 'iPhones',
        categoryIphonesDesc: 'Latest iPhone models',
        categoryMacbooks: 'Laptops',
        categoryMacbooksDesc: 'Powerful computing devices',
        categoryCameras: 'Cameras',
        categoryCamerasDesc: 'Professional photography equipment',
        categoryAccessories: 'Accessories',
        categoryAccessoriesDesc: 'Premium tech accessories',
        shopNow: 'Shop Now →',

        // Products
        productsTitle: 'Featured Products',
        productsSubtitle: 'Handpicked for you',
        filterAll: 'All Products',
        filterIphones: 'iPhones',
        filterMacbooks: 'MacBooks',
        filterCameras: 'Cameras',
        addToCart: 'Add to Cart',

        // Locations
        locationsTitle: 'Our Locations',
        locationsSubtitle: 'Visit us worldwide',
        locationUSA: 'United States',
        locationBuea: 'Buea, Cameroon',
        locationLimbe: 'Limbe, Cameroon',

        // Cart
        cartTitle: 'Your Cart',
        cartEmpty: 'Your cart is empty',
        cartTotal: 'Total:',
        cartCheckout: 'Proceed to Checkout',

        // Footer
        footerTagline: 'Premium electronics, worldwide delivery',
        footerShop: 'Shop',
        footerIphones: 'iPhones',
        footerMacbooks: 'MacBooks',
        footerCameras: 'Cameras',
        footerAccessories: 'Accessories',
        footerSupport: 'Support',
        footerContact: 'Contact Us',
        footerShipping: 'Shipping Info',
        footerReturns: 'Returns',
        footerWarranty: 'Warranty',
        footerRights: 'All rights reserved.'
    },

    fr: {
        // Brand
        brandName: 'FORDIPS TECH',

        // Navigation
        navHome: 'Accueil',
        navProducts: 'Produits',
        navCategories: 'Catégories',
        navLocations: 'Emplacements',
        navContact: 'Contact',

        // Hero
        heroBadge: 'NOUVELLE ARRIVÉE',
        heroTitle1: 'iPhone 17',
        heroTitle2: 'Pro Max',
        heroSubtitle: 'Découvrez le futur. Design en titane. Puce A17 Pro. Système de caméra révolutionnaire. À partir de 1 199 $.',
        heroBuyNow: 'Acheter',
        heroLearnMore: 'En savoir plus',
        feature1Label: 'Écran 6,7"',
        feature2Label: 'Caméra',
        feature3Label: 'Batterie',
        scrollDown: 'Faites défiler pour explorer',

        // Categories
        categoriesTitle: 'Acheter par catégorie',
        categoriesSubtitle: 'Électronique premium pour tous les besoins',
        categoryPhones: 'Téléphones',
        categoryPhonesDesc: 'Derniers modèles de smartphones',
        categoryIphones: 'iPhones',
        categoryIphonesDesc: 'Derniers modèles iPhone',
        categoryMacbooks: 'Ordinateurs portables',
        categoryMacbooksDesc: 'Appareils informatiques puissants',
        categoryCameras: 'Caméras',
        categoryCamerasDesc: 'Équipement photographique professionnel',
        categoryAccessories: 'Accessoires',
        categoryAccessoriesDesc: 'Accessoires technologiques premium',
        shopNow: 'Acheter maintenant →',

        // Products
        productsTitle: 'Produits en vedette',
        productsSubtitle: 'Sélectionnés pour vous',
        filterAll: 'Tous les produits',
        filterIphones: 'iPhones',
        filterMacbooks: 'MacBooks',
        filterCameras: 'Caméras',
        addToCart: 'Ajouter au panier',

        // Locations
        locationsTitle: 'Nos emplacements',
        locationsSubtitle: 'Visitez-nous dans le monde entier',
        locationUSA: 'États-Unis',
        locationBuea: 'Buea, Cameroun',
        locationLimbe: 'Limbe, Cameroun',

        // Cart
        cartTitle: 'Votre panier',
        cartEmpty: 'Votre panier est vide',
        cartTotal: 'Total:',
        cartCheckout: 'Procéder au paiement',

        // Footer
        footerTagline: 'Électronique premium, livraison mondiale',
        footerShop: 'Boutique',
        footerIphones: 'iPhones',
        footerMacbooks: 'MacBooks',
        footerCameras: 'Caméras',
        footerAccessories: 'Accessoires',
        footerSupport: 'Assistance',
        footerContact: 'Nous contacter',
        footerShipping: 'Info livraison',
        footerReturns: 'Retours',
        footerWarranty: 'Garantie',
        footerRights: 'Tous droits réservés.'
    }
};

let currentLang = 'en';

function translatePage(lang) {
    currentLang = lang;
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Update language dropdown
    const langDropdown = document.getElementById('languageSelect');
    if (langDropdown) {
        langDropdown.value = lang;
    }

    // Save preference
    localStorage.setItem('fordipsTechLang', lang);
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('fordipsTechLang') || 'en';
    translatePage(savedLang);

    // Language dropdown
    const langDropdown = document.getElementById('languageSelect');
    if (langDropdown) {
        langDropdown.addEventListener('change', (e) => {
            const lang = e.target.value;
            translatePage(lang);

            // Show notification
            showNotification(
                lang === 'en' ? 'Language changed to English' : 'Langue changée en français',
                'success'
            );
        });
    }
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        background: type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#3b82f6',
        color: 'white',
        fontWeight: '600',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
