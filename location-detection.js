/**
 * FORDIPS TECH - Intelligent Location Detection System
 * Automatically detects user location and adjusts currency, shipping, and content
 */

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
    // North America
    'US': { currency: 'USD', symbol: '$', name: 'United States Dollar', country: 'United States' },
    'CA': { currency: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', country: 'Canada' },
    'MX': { currency: 'MXN', symbol: 'MX$', name: 'Mexican Peso', country: 'Mexico' },

    // Europe
    'GB': { currency: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
    'FR': { currency: 'EUR', symbol: '€', name: 'Euro', country: 'France' },
    'DE': { currency: 'EUR', symbol: '€', name: 'Euro', country: 'Germany' },
    'IT': { currency: 'EUR', symbol: '€', name: 'Euro', country: 'Italy' },
    'ES': { currency: 'EUR', symbol: '€', name: 'Euro', country: 'Spain' },
    'NL': { currency: 'EUR', symbol: '€', name: 'Euro', country: 'Netherlands' },
    'BE': { currency: 'EUR', symbol: '€', name: 'Euro', country: 'Belgium' },
    'CH': { currency: 'CHF', symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland' },

    // Africa
    'CM': { currency: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', country: 'Cameroon' },
    'NG': { currency: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria' },
    'GH': { currency: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', country: 'Ghana' },
    'KE': { currency: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya' },
    'ZA': { currency: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
    'EG': { currency: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt' },

    // Asia
    'CN': { currency: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
    'JP': { currency: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
    'IN': { currency: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
    'KR': { currency: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea' },
    'SG': { currency: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
    'AE': { currency: 'AED', symbol: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates' },
    'SA': { currency: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia' },

    // Oceania
    'AU': { currency: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
    'NZ': { currency: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand' }
};

// Location detection state
let locationDetected = false;
let userLocation = null;

/**
 * Initialize location detection on page load
 */
function initializeLocationDetection() {
    // Check if location was already detected in this session
    const savedLocation = sessionStorage.getItem('userLocation');
    const locationPermission = localStorage.getItem('locationPermissionAsked');

    if (savedLocation) {
        // Use saved location from session
        userLocation = JSON.parse(savedLocation);
        applyLocationSettings(userLocation);
        console.log('✅ Using saved location:', userLocation);
        return;
    }

    // Wait a bit before showing the modal to avoid overwhelming the user
    setTimeout(() => {
        if (!locationPermission || locationPermission === 'prompt') {
            showLocationPermissionModal();
        }
    }, 2000);
}

/**
 * Show location permission modal
 */
function showLocationPermissionModal() {
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Hide location permission modal
 */
function hideLocationPermissionModal() {
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Request geolocation from browser
 */
function requestGeolocation() {
    const statusEl = document.getElementById('locationStatus');

    if (!navigator.geolocation) {
        console.warn('⚠️ Geolocation not supported, using IP fallback');
        detectLocationByIP();
        return;
    }

    if (statusEl) {
        statusEl.textContent = 'Detecting your location...';
        statusEl.style.color = '#667eea';
    }

    navigator.geolocation.getCurrentPosition(
        // Success callback
        async (position) => {
            console.log('📍 Geolocation success:', position.coords);
            localStorage.setItem('locationPermissionAsked', 'granted');

            // Get country from coordinates using reverse geocoding
            await getCountryFromCoordinates(position.coords.latitude, position.coords.longitude);
        },
        // Error callback
        (error) => {
            console.warn('⚠️ Geolocation denied or failed:', error.message);
            localStorage.setItem('locationPermissionAsked', 'denied');

            if (statusEl) {
                statusEl.textContent = 'Location access denied. Using IP-based detection...';
            }

            // Fallback to IP-based detection
            setTimeout(() => {
                detectLocationByIP();
            }, 1000);
        },
        // Options
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * Get country from coordinates using reverse geocoding
 */
async function getCountryFromCoordinates(lat, lon) {
    try {
        // Using OpenStreetMap Nominatim API for reverse geocoding (free)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();
        const countryCode = data.address.country_code?.toUpperCase();

        if (countryCode) {
            const locationInfo = {
                countryCode: countryCode,
                country: data.address.country,
                city: data.address.city || data.address.town || data.address.village,
                state: data.address.state,
                latitude: lat,
                longitude: lon,
                method: 'geolocation'
            };

            console.log('✅ Location detected:', locationInfo);
            saveAndApplyLocation(locationInfo);
        } else {
            throw new Error('Country code not found');
        }
    } catch (error) {
        console.error('❌ Reverse geocoding failed:', error);
        detectLocationByIP();
    }
}

/**
 * Detect location by IP address (fallback)
 */
async function detectLocationByIP() {
    const statusEl = document.getElementById('locationStatus');

    try {
        if (statusEl) {
            statusEl.textContent = 'Detecting location from IP address...';
        }

        // Using ipapi.co free API
        const response = await fetch('https://ipapi.co/json/');

        if (!response.ok) throw new Error('IP detection failed');

        const data = await response.json();

        const locationInfo = {
            countryCode: data.country_code,
            country: data.country_name,
            city: data.city,
            state: data.region,
            latitude: data.latitude,
            longitude: data.longitude,
            ip: data.ip,
            method: 'ip'
        };

        console.log('✅ Location detected via IP:', locationInfo);
        saveAndApplyLocation(locationInfo);

    } catch (error) {
        console.error('❌ IP-based detection failed:', error);

        // Ultimate fallback - use US as default
        const defaultLocation = {
            countryCode: 'US',
            country: 'United States',
            method: 'default'
        };

        if (statusEl) {
            statusEl.textContent = 'Using default location (United States)';
            statusEl.style.color = '#f39c12';
        }

        saveAndApplyLocation(defaultLocation);
    }
}

/**
 * Save location and apply settings
 */
function saveAndApplyLocation(locationInfo) {
    userLocation = locationInfo;
    locationDetected = true;

    // Save to session storage
    sessionStorage.setItem('userLocation', JSON.stringify(locationInfo));

    // Apply location-based settings
    applyLocationSettings(locationInfo);

    // Show success message
    const statusEl = document.getElementById('locationStatus');
    if (statusEl) {
        statusEl.textContent = `✓ Location set to ${locationInfo.country}`;
        statusEl.style.color = '#27ae60';
    }

    // Hide modal after a brief delay
    setTimeout(() => {
        hideLocationPermissionModal();
    }, 2000);
}

/**
 * Apply location-based settings
 */
function applyLocationSettings(locationInfo) {
    const countryCode = locationInfo.countryCode;
    const currencyInfo = COUNTRY_CURRENCY_MAP[countryCode];

    if (currencyInfo) {
        console.log(`💰 Setting currency to ${currencyInfo.currency} for ${currencyInfo.country}`);

        // Set currency using the existing currency system
        if (window.currencyManager) {
            window.currencyManager.setCurrency(currencyInfo.currency);
        }

        // Update location-specific content
        updateLocationContent(locationInfo, currencyInfo);

    } else {
        // Default to USD if country not in our map
        console.log(`⚠️ No currency mapping for ${countryCode}, using USD`);
        if (window.currencyManager) {
            window.currencyManager.setCurrency('USD');
        }
    }

    // Store location in global scope for other scripts
    window.userLocationInfo = locationInfo;

    // Dispatch custom event for other scripts to react
    window.dispatchEvent(new CustomEvent('locationDetected', {
        detail: { location: locationInfo, currency: currencyInfo }
    }));
}

/**
 * Update location-specific content on the page
 */
function updateLocationContent(locationInfo, currencyInfo) {
    // Update shipping information based on location
    updateShippingInfo(locationInfo);

    // Update contact information to show nearest location
    updateNearestLocation(locationInfo);

    // Show location indicator in UI
    showLocationIndicator(locationInfo, currencyInfo);
}

/**
 * Update shipping information
 */
function updateShippingInfo(locationInfo) {
    const shippingElements = document.querySelectorAll('.shipping-amount, .shipping-info');

    shippingElements.forEach(el => {
        if (locationInfo.countryCode === 'US' || locationInfo.countryCode === 'CM') {
            el.textContent = 'FREE';
            el.style.color = '#27ae60';
        } else {
            el.textContent = 'Calculated at checkout';
            el.style.color = '#666';
        }
    });
}

/**
 * Update nearest location information
 */
function updateNearestLocation(locationInfo) {
    const nearestLocation = document.getElementById('nearestLocation');

    if (nearestLocation) {
        let locationText = '';

        if (locationInfo.countryCode === 'US') {
            locationText = '📍 Nearest store: Laurel, MD (USA)';
        } else if (locationInfo.countryCode === 'CM') {
            locationText = '📍 Nearest store: Buea, Cameroon';
        } else if (locationInfo.country) {
            locationText = `📍 Shipping to: ${locationInfo.country}`;
        }

        nearestLocation.textContent = locationText;
    }
}

/**
 * Show location indicator in the UI
 */
function showLocationIndicator(locationInfo, currencyInfo) {
    let indicator = document.getElementById('locationIndicator');

    if (!indicator) {
        // Create indicator if it doesn't exist
        indicator = document.createElement('div');
        indicator.id = 'locationIndicator';
        indicator.className = 'location-indicator';

        // Add to navbar or top of page
        const navbar = document.querySelector('.navbar .container');
        if (navbar) {
            navbar.appendChild(indicator);
        }
    }

    const flag = getCountryFlag(locationInfo.countryCode);
    const currencyText = currencyInfo ? currencyInfo.currency : 'USD';

    indicator.innerHTML = `
        <span class="location-flag">${flag}</span>
        <span class="location-text">${locationInfo.country}</span>
        <span class="location-currency">${currencyText}</span>
        <button class="change-location-btn" onclick="changeLocation()" title="Change location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        </button>
    `;
}

/**
 * Get country flag emoji
 */
function getCountryFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌍';

    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());

    return String.fromCodePoint(...codePoints);
}

/**
 * Allow user to manually change location
 */
function changeLocation() {
    // Clear saved location
    sessionStorage.removeItem('userLocation');
    localStorage.removeItem('locationPermissionAsked');

    // Show modal again
    showLocationPermissionModal();
}

/**
 * Decline location detection
 */
function declineLocation() {
    localStorage.setItem('locationPermissionAsked', 'declined');

    // Use default US location
    const defaultLocation = {
        countryCode: 'US',
        country: 'United States',
        method: 'manual'
    };

    saveAndApplyLocation(defaultLocation);
}

// Make functions globally available
window.requestGeolocation = requestGeolocation;
window.declineLocation = declineLocation;
window.changeLocation = changeLocation;

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLocationDetection);
} else {
    initializeLocationDetection();
}

console.log('🌍 Location detection system initialized');
