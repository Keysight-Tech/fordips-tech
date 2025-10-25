/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORDIPS TECH - ADVANCED AI CHAT ASSISTANT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Intelligent shopping assistant trained to handle all customer needs
 *
 * CAPABILITIES:
 * ✅ Product Search & Recommendations (iPhone, Samsung, Google Pixel, MacBook, etc.)
 * ✅ Price Inquiries & Best Deals
 * ✅ Cart Management (Add, Remove, View, Checkout)
 * ✅ Order Tracking & Cancellation
 * ✅ Shipping Information (Worldwide, Free Shipping)
 * ✅ Payment Methods (Credit Cards, Mobile Money, PayPal, etc.)
 * ✅ Product Specifications & Comparisons
 * ✅ Stock Availability
 * ✅ Warranty & Return Policy
 * ✅ Refund Processing
 * ✅ Account Management
 * ✅ Store Locations (USA & Cameroon)
 * ✅ Business Hours
 * ✅ Technical Support
 * ✅ Complaint Handling
 * ✅ Language & Currency Help
 * ✅ How-to Tutorials
 * ✅ Conversational AI (Greetings, Thanks, Goodbye)
 *
 * The AI is trained to understand natural language and provide helpful,
 * accurate responses to solve customer problems and improve their experience.
 */

class FordipsTechAI {
    constructor() {
        console.log('🤖 FordipsTechAI: Constructor called');

        this.conversationHistory = [];
        this.isOpen = false;
        this.isTyping = false;
        this.userContext = {
            cart: [],
            viewedProducts: [],
            preferences: {}
        };

        // Get user's selected language
        this.userLang = this.getUserLanguage();
        console.log('🤖 User language:', this.userLang);

        // Initialize on page load
        this.init();
    }

    /**
     * Get the user's selected language from localStorage
     */
    getUserLanguage() {
        return localStorage.getItem('selectedLanguage') || 'en';
    }

    /**
     * Translation helper that uses the global t() function
     */
    t(key) {
        if (typeof window.t === 'function') {
            const translation = window.t(key);
            // Return translation if it exists and is not the same as the key
            return translation && translation !== key ? translation : this.getFallbackText(key);
        }
        return this.getFallbackText(key);
    }

    /**
     * Get fallback English text if translation fails
     */
    getFallbackText(key) {
        const fallbacks = {
            'aiChatTitle': 'Fordips AI Assistant',
            'aiChatStatus': 'Online - Ready to help!',
            'aiChatPlaceholder': 'Search products or ask me anything...',
            'aiChatSend': 'Send',
            'qaBrowseAll': '🛍️ Browse All',
            'qaBestDeals': '💰 Best Deals',
            'qaPopular': '⭐ Popular',
            'qaTrackOrder': '📦 Track Order',
            'aiWelcomeGreeting': '👋 **Welcome to Fordips Tech!**',
            'aiWelcomeIntro': 'I\'m your personal AI shopping assistant, here to make your experience amazing!',
            'aiWelcomeCanHelp': '**I can help you with:**',
            'aiGreetingResponse': 'Hello! 👋 Welcome to Fordips Tech! I\'m your personal shopping assistant.',
            'aiCartEmpty': 'Your cart is currently empty. Let me help you find something great!',
            'aiCartHasItems': '🛒 Your cart has {count} item(s)',
            'aiCheckoutReady': 'Ready to checkout?',
            'aiCheckoutNow': '💳 Checkout Now',
            'aiContinueShopping': '🛍️ Continue Shopping',
            'aiViewCart': '👀 View Cart',
            'aiAddedToCart': 'Great! I\'ll add **{item}** to your cart.',
            'aiProductNotFound': 'Which product would you like? Please tell me more.',
            'aiTyping': 'Typing...'
        };
        return fallbacks[key] || key;
    }

    init() {
        console.log('🤖 AI Chat: init() called');
        this.createChatUI();
        this.attachEventListeners();
        this.loadConversationHistory();

        // Show welcome message after a short delay
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 3000);

        console.log('✅ AI Chat Assistant initialized');
        window.FORDIPS_CONFIG?.logger.log('✅ AI Chat Assistant initialized');
    }

    createChatUI() {
        console.log('🤖 AI Chat: createChatUI() called');
        const chatHTML = `
            <!-- AI Chat Widget -->
            <div class="ai-chat-widget" id="aiChatWidget">
                <!-- Chat Button -->
                <button class="ai-chat-button" id="aiChatButton" aria-label="Open AI assistant">
                    <svg class="chat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <svg class="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <div class="chat-badge" id="chatBadge">1</div>
                </button>

                <!-- Chat Window -->
                <div class="ai-chat-window" id="aiChatWindow">
                    <!-- Header -->
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <div class="chat-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M12 1v6m0 6v6m-6-6h6m6 0h6"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="chat-title">${this.t('aiChatTitle')}</div>
                                <div class="chat-status">
                                    <span class="status-dot"></span>
                                    <span>${this.t('aiChatStatus')}</span>
                                </div>
                            </div>
                        </div>
                        <button class="chat-minimize" id="chatMinimize" aria-label="Minimize chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>

                    <!-- Messages Container -->
                    <div class="chat-messages" id="chatMessages">
                        <!-- Messages will be inserted here -->
                    </div>

                    <!-- Quick Actions -->
                    <div class="chat-quick-actions" id="chatQuickActions">
                        <button class="quick-action-btn" data-action="browse-products">
                            ${this.t('qaBrowseAll')}
                        </button>
                        <button class="quick-action-btn" data-action="best-deals">
                            ${this.t('qaBestDeals')}
                        </button>
                        <button class="quick-action-btn" data-action="popular">
                            ${this.t('qaPopular')}
                        </button>
                        <button class="quick-action-btn" data-action="track-order">
                            ${this.t('qaTrackOrder')}
                        </button>
                    </div>

                    <!-- Input Area -->
                    <div class="chat-input-area">
                        <div class="chat-input-wrapper">
                            <input
                                type="text"
                                class="chat-input"
                                id="chatInput"
                                placeholder="${this.t('aiChatPlaceholder')}"
                                autocomplete="off"
                            />
                            <button class="chat-send-btn" id="chatSendBtn" aria-label="Send message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                        <div class="chat-suggestions" id="chatSuggestions"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);

        const chatWidget = document.getElementById('aiChatWidget');
        console.log('🤖 AI Chat: Widget inserted into DOM. Element found:', chatWidget !== null);
        if (chatWidget) {
            console.log('🤖 AI Chat: Widget styles:', window.getComputedStyle(chatWidget).display);
        }
    }

    attachEventListeners() {
        const chatButton = document.getElementById('aiChatButton');
        const chatMinimize = document.getElementById('chatMinimize');
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');

        chatButton?.addEventListener('click', () => this.toggleChat());
        chatMinimize?.addEventListener('click', () => this.toggleChat());
        chatSendBtn?.addEventListener('click', () => this.sendMessage());

        // Enhanced keyboard handling
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Enable/disable send button based on input
        chatInput?.addEventListener('input', (e) => {
            const hasText = e.target.value.trim().length > 0;
            if (chatSendBtn) {
                chatSendBtn.disabled = !hasText;
                chatSendBtn.style.opacity = hasText ? '1' : '0.5';
            }
        });

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Prevent body scroll when chat is open on mobile
        const chatWindow = document.getElementById('aiChatWindow');
        if (chatWindow) {
            chatWindow.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            }, { passive: false });
        }

        // Add escape key to close chat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.toggleChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('aiChatWindow');
        const chatButton = document.getElementById('aiChatButton');
        const chatBadge = document.getElementById('chatBadge');

        if (this.isOpen) {
            chatWindow.classList.add('active');
            chatButton.classList.add('active');
            chatBadge.style.display = 'none';

            // Prevent body scroll on mobile when chat is open
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
            }

            // Focus input after animation
            setTimeout(() => {
                document.getElementById('chatInput')?.focus();
            }, 300);
        } else {
            chatWindow.classList.remove('active');
            chatButton.classList.remove('active');

            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    showWelcomeMessage() {
        if (this.conversationHistory.length === 0) {
            const welcomeMessage = {
                role: 'assistant',
                content: `${this.t('aiWelcomeGreeting')}

${this.t('aiWelcomeIntro')}

${this.t('aiWelcomeCanHelp')}

${this.t('aiWelcomeProducts')}
${this.t('aiWelcomePricing')}
${this.t('aiWelcomeShopping')}
${this.t('aiWelcomeShipping')}
${this.t('aiWelcomePayment')}
${this.t('aiWelcomeLocations')}
${this.t('aiWelcomeSupport')}

${this.t('aiWelcomeAsk')}

${this.t('aiWelcomeQuestion')}`,
                timestamp: new Date()
            };

            this.addMessage(welcomeMessage);
            this.showChatBadge();
        }
    }

    showChatBadge() {
        const chatBadge = document.getElementById('chatBadge');
        if (chatBadge && !this.isOpen) {
            chatBadge.style.display = 'flex';
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        input.value = '';
        this.showTypingIndicator();

        // Process message and get AI response
        const response = await this.processMessage(message);

        this.hideTypingIndicator();
        this.addMessage({
            role: 'assistant',
            content: response.message,
            actions: response.actions,
            timestamp: new Date()
        });

        // Execute any actions
        if (response.executeAction) {
            await this.executeAction(response.executeAction);
        }

        this.saveConversationHistory();
    }

    async processMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Update user context
        this.updateUserContext(message);

        // Greetings
        if (this.matchesIntent(lowerMessage, ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'])) {
            return {
                message: this.t('aiGreetingResponse'),
                actions: this.getSuggestedActions(['browse', 'deals', 'recommendations'])
            };
        }

        // Product searches - Enhanced
        if (this.matchesIntent(lowerMessage, ['iphone', 'iphones', 'apple phone', 'ios phone'])) {
            return await this.handleProductSearch('iphone');
        }

        if (this.matchesIntent(lowerMessage, ['samsung', 'galaxy', 'android phone'])) {
            return await this.handleProductSearch('samsung');
        }

        if (this.matchesIntent(lowerMessage, ['google pixel', 'pixel', 'google phone'])) {
            return await this.handleProductSearch('pixel');
        }

        if (this.matchesIntent(lowerMessage, ['macbook', 'laptop', 'mac', 'computer', 'notebook'])) {
            return await this.handleProductSearch('laptop');
        }

        if (this.matchesIntent(lowerMessage, ['tablet', 'ipad', 'ipad pro'])) {
            return await this.handleProductSearch('tablet');
        }

        if (this.matchesIntent(lowerMessage, ['watch', 'smartwatch', 'apple watch', 'wearable'])) {
            return await this.handleProductSearch('smartwatch');
        }

        if (this.matchesIntent(lowerMessage, ['starlink', 'internet', 'satellite', 'wifi'])) {
            return await this.handleProductSearch('starlink');
        }

        if (this.matchesIntent(lowerMessage, ['camera', 'canon', 'nikon', 'photography'])) {
            return await this.handleProductSearch('camera');
        }

        if (this.matchesIntent(lowerMessage, ['accessories', 'accessory', 'case', 'charger', 'cable', 'headphones'])) {
            return await this.handleProductSearch('accessories');
        }

        // Price and deals
        if (this.matchesIntent(lowerMessage, ['cheap', 'affordable', 'budget', 'best price', 'lowest price', 'save money'])) {
            return await this.handleBudgetSearch();
        }

        if (this.matchesIntent(lowerMessage, ['deal', 'deals', 'discount', 'sale', 'offer', 'promo', 'promotion'])) {
            return await this.handleDealsInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['best', 'recommend', 'popular', 'top', 'suggestion'])) {
            return await this.handleRecommendations();
        }

        // Cart and checkout
        if (this.matchesIntent(lowerMessage, ['cart', 'basket', 'shopping cart', 'my cart'])) {
            return this.handleCartInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['checkout', 'pay now', 'complete order', 'finish order'])) {
            return this.handleCheckoutInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['add to cart', 'buy', 'purchase', 'want to buy'])) {
            return this.handleAddToCart(message);
        }

        if (this.matchesIntent(lowerMessage, ['remove from cart', 'delete from cart', 'clear cart'])) {
            return this.handleCartRemoval();
        }

        // Order tracking
        if (this.matchesIntent(lowerMessage, ['order', 'track', 'tracking', 'delivery', 'where is my order', 'order status'])) {
            return this.handleOrderTracking();
        }

        if (this.matchesIntent(lowerMessage, ['cancel order', 'cancel my order'])) {
            return this.handleOrderCancellation();
        }

        // Product info
        if (this.matchesIntent(lowerMessage, ['price', 'cost', 'how much', 'pricing'])) {
            return await this.handlePriceInquiry(message);
        }

        if (this.matchesIntent(lowerMessage, ['spec', 'specification', 'specs', 'features', 'details'])) {
            return await this.handleSpecsInquiry(message);
        }

        if (this.matchesIntent(lowerMessage, ['compare', 'comparison', 'difference', 'vs', 'versus'])) {
            return this.handleComparisonInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['stock', 'availability', 'available', 'in stock'])) {
            return this.handleStockInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['warranty', 'guarantee', 'return policy'])) {
            return this.handleWarrantyInquiry();
        }

        // Shipping and delivery
        if (this.matchesIntent(lowerMessage, ['shipping', 'delivery', 'ship', 'how long', 'shipping cost', 'delivery time'])) {
            return this.handleShippingInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['free shipping', 'shipping fee'])) {
            return this.handleFreeShippingInfo();
        }

        if (this.matchesIntent(lowerMessage, ['international', 'ship to', 'country'])) {
            return this.handleInternationalShipping();
        }

        // Payment
        if (this.matchesIntent(lowerMessage, ['payment', 'pay', 'credit card', 'payment method', 'how to pay'])) {
            return this.handlePaymentInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['mobile money', 'mtn', 'orange money', 'momo'])) {
            return this.handleMobileMoneyInfo();
        }

        if (this.matchesIntent(lowerMessage, ['refund', 'money back'])) {
            return this.handleRefundInquiry();
        }

        // Account and profile
        if (this.matchesIntent(lowerMessage, ['account', 'profile', 'sign in', 'login', 'register'])) {
            return this.handleAccountInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['password', 'forgot password', 'reset password'])) {
            return this.handlePasswordHelp();
        }

        // Location and store
        if (this.matchesIntent(lowerMessage, ['location', 'store', 'where', 'address', 'find you'])) {
            return this.handleLocationInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['open', 'hours', 'business hours', 'working hours'])) {
            return this.handleBusinessHours();
        }

        // Support and help
        if (this.matchesIntent(lowerMessage, ['contact', 'support', 'help', 'talk to human', 'customer service'])) {
            return this.handleContactInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['problem', 'issue', 'not working', 'error'])) {
            return this.handleTechnicalSupport();
        }

        if (this.matchesIntent(lowerMessage, ['complaint', 'complain', 'unhappy'])) {
            return this.handleComplaint();
        }

        // Website help
        if (this.matchesIntent(lowerMessage, ['how to', 'how do i', 'tutorial'])) {
            return this.handleHowToInquiry(message);
        }

        if (this.matchesIntent(lowerMessage, ['language', 'translate', 'french', 'pidgin'])) {
            return this.handleLanguageHelp();
        }

        if (this.matchesIntent(lowerMessage, ['currency', 'dollar', 'euro', 'fcfa'])) {
            return this.handleCurrencyHelp();
        }

        // Search queries
        if (this.matchesIntent(lowerMessage, ['search', 'find', 'looking for', 'show me', 'i need', 'i want'])) {
            const searchResults = this.searchAllProducts(message);
            if (searchResults.length > 0) {
                return this.handleGeneralSearchResults(message, searchResults);
            }
        }

        // Gratitude
        if (this.matchesIntent(lowerMessage, ['thank', 'thanks', 'appreciate'])) {
            return {
                message: "You're very welcome! 😊 I'm happy to help. Is there anything else you'd like to know?",
                actions: this.getSuggestedActions(['browse', 'deals', 'contact'])
            };
        }

        // Farewell
        if (this.matchesIntent(lowerMessage, ['bye', 'goodbye', 'see you', 'later'])) {
            return {
                message: "Goodbye! 👋 Thank you for visiting Fordips Tech. Come back soon for amazing deals! Have a great day!",
                actions: this.getSuggestedActions(['browse', 'deals'])
            };
        }

        // Default response - try to extract product search
        const productMatch = this.extractProductFromMessage(message);
        if (productMatch) {
            return await this.handleProductSearch(productMatch);
        }

        // Enhanced: Search for any product on the website
        const searchResults = this.searchAllProducts(message);
        if (searchResults.length > 0) {
            return this.handleGeneralSearchResults(message, searchResults);
        }

        // Smart fallback response
        return {
            message: `I'm here to help! I can assist you with:

📱 **Products** - Browse iPhones, Samsung, MacBooks, iPads, accessories
💰 **Pricing** - Find best deals and compare prices
🛒 **Shopping** - Add to cart, checkout, track orders
🚚 **Shipping** - Free worldwide delivery information
💳 **Payment** - Multiple payment methods including mobile money
📍 **Locations** - USA and Cameroon store locations
❓ **Support** - Any questions or issues you have

What would you like help with?`,
            actions: this.getSuggestedActions(['browse', 'deals', 'contact'])
        };
    }

    // Handle general search results
    handleGeneralSearchResults(query, results) {
        const topResults = results.slice(0, 5);
        let message = `🔍 **Search Results for "${query}"**\n\nI found ${results.length} product(s):\n\n`;

        topResults.forEach((product, index) => {
            message += `${index + 1}. **${product.name}** - $${product.price}\n`;
            message += `   ${product.description}\n`;
            if (product.badge) message += `   🏷️ ${product.badge}\n`;
            message += `\n`;
        });

        if (results.length > 5) {
            message += `_...and ${results.length - 5} more products!_\n\n`;
        }

        message += `Would you like to:\n• Add any to cart\n• Get more details\n• See similar products`;

        return {
            message,
            actions: [
                { label: '🛍️ View All Results', action: 'browse' },
                { label: '💰 Show Best Deals', action: 'deals' },
                ...topResults.slice(0, 3).map(p => ({
                    label: `➕ Add ${p.name.split(' ').slice(0, 3).join(' ')}`,
                    action: 'add-to-cart',
                    data: p
                }))
            ]
        };
    }

    matchesIntent(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    extractProductFromMessage(message) {
        const products = ['iphone', 'samsung', 'pixel', 'macbook', 'laptop', 'tablet', 'ipad', 'watch', 'starlink', 'camera', 'accessories', 'phone', 'computer', 'notebook'];
        for (const product of products) {
            if (message.toLowerCase().includes(product)) {
                return product;
            }
        }
        return null;
    }

    // Enhanced: Search all products by name or description
    searchAllProducts(query) {
        if (!window.products || !query) return [];

        const lowerQuery = query.toLowerCase().trim();

        // Extract meaningful words (ignore common words)
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'show', 'me', 'find', 'search', 'looking', 'need', 'want'];
        const words = lowerQuery.split(' ')
            .filter(w => w.length > 2 && !stopWords.includes(w));

        // Search through all products
        const results = window.products.filter(product => {
            const productName = product.name.toLowerCase();
            const productDesc = product.description?.toLowerCase() || '';
            const productCategory = product.category?.toLowerCase() || '';
            const productBadge = product.badge?.toLowerCase() || '';

            // Combine all searchable text
            const searchText = `${productName} ${productDesc} ${productCategory} ${productBadge}`;

            // Check if query matches product name (full or partial)
            if (productName.includes(lowerQuery)) return true;

            // Check if query matches description
            if (productDesc.includes(lowerQuery)) return true;

            // Check if query matches category
            if (productCategory.includes(lowerQuery)) return true;

            // Check if any significant word matches
            for (const word of words) {
                if (searchText.includes(word)) {
                    return true;
                }
            }

            // Check for number variations (e.g., "17" matches "iPhone 17")
            const numbers = lowerQuery.match(/\d+/g);
            if (numbers) {
                for (const num of numbers) {
                    if (productName.includes(num)) {
                        return true;
                    }
                }
            }

            return false;
        });

        // Sort by relevance (exact name matches first)
        return results.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            // Exact match first
            if (aName === lowerQuery && bName !== lowerQuery) return -1;
            if (bName === lowerQuery && aName !== lowerQuery) return 1;

            // Starts with query
            if (aName.startsWith(lowerQuery) && !bName.startsWith(lowerQuery)) return -1;
            if (bName.startsWith(lowerQuery) && !aName.startsWith(lowerQuery)) return 1;

            // Contains query
            if (aName.includes(lowerQuery) && !bName.includes(lowerQuery)) return -1;
            if (bName.includes(lowerQuery) && !aName.includes(lowerQuery)) return 1;

            // Default: sort by price (cheaper first)
            return a.price - b.price;
        });
    }

    async handleProductSearch(category) {
        // Map search terms to actual categories
        const categoryMap = {
            'iphone': 'iphone',
            'samsung': 'samsung',
            'pixel': 'pixel',
            'google': 'pixel',
            'macbook': 'laptop',
            'laptop': 'laptop',
            'mac': 'laptop',
            'computer': 'laptop',
            'tablet': 'tablet',
            'ipad': 'tablet',
            'watch': 'smartwatch',
            'smartwatch': 'smartwatch',
            'wearable': 'smartwatch',
            'starlink': 'starlink',
            'internet': 'starlink',
            'wifi': 'starlink',
            'camera': 'camera',
            'canon': 'camera',
            'nikon': 'camera',
            'photography': 'camera',
            'accessories': 'accessories',
            'accessory': 'accessories',
            'case': 'accessories',
            'charger': 'accessories',
            'cable': 'accessories',
            'headphones': 'accessories'
        };

        const actualCategory = categoryMap[category] || category;

        // Get products from the global products array
        const categoryProducts = window.products ?
            window.products.filter(p => p.category === actualCategory) : [];

        if (categoryProducts.length === 0) {
            return {
                message: `I couldn't find any ${category} products right now. Would you like to browse other categories?`,
                actions: this.getSuggestedActions(['browse', 'deals'])
            };
        }

        // Get top 3 products
        const topProducts = categoryProducts.slice(0, 3);

        let message = `Great choice! Here are our top ${category} options:\n\n`;

        topProducts.forEach((product, index) => {
            message += `${index + 1}. **${product.name}** - $${product.price}\n`;
            message += `   ${product.description}\n`;
            if (product.badge) message += `   🏷️ ${product.badge}\n`;
            message += `\n`;
        });

        message += `\nWould you like me to add any of these to your cart? Just say "add [product name] to cart"`;

        return {
            message,
            actions: [
                { label: '🛍️ View All ' + category.toUpperCase(), action: 'view-category', data: actualCategory },
                { label: '➕ Add to Cart', action: 'show-add-options', data: topProducts },
                { label: '💰 Compare Prices', action: 'compare', data: topProducts }
            ],
            executeAction: { type: 'scroll-to-category', category: actualCategory }
        };
    }

    async handleBudgetSearch() {
        const affordableProducts = window.products ?
            window.products.filter(p => p.price < 500).sort((a, b) => a.price - b.price).slice(0, 5) : [];

        if (affordableProducts.length === 0) {
            return {
                message: "Let me show you our best value products!",
                actions: this.getSuggestedActions(['browse', 'deals'])
            };
        }

        let message = `Here are our most affordable options:\n\n`;

        affordableProducts.forEach((product, index) => {
            message += `${index + 1}. ${product.name} - $${product.price}\n`;
        });

        message += `\nAll under $500! Which one interests you?`;

        return {
            message,
            actions: affordableProducts.slice(0, 3).map(p => ({
                label: `➕ Add ${p.name}`,
                action: 'add-to-cart',
                data: p
            }))
        };
    }

    async handleRecommendations() {
        const popularProducts = window.products ?
            window.products.filter(p => p.badge === 'POPULAR' || p.badge === 'NEW').slice(0, 3) : [];

        let message = `🌟 Here are our most popular products:\n\n`;

        if (popularProducts.length > 0) {
            popularProducts.forEach((product, index) => {
                message += `${index + 1}. ${product.name} - $${product.price}\n`;
                message += `   ${product.description}\n\n`;
            });
        } else {
            message = "Let me show you our best sellers!";
        }

        return {
            message,
            actions: this.getSuggestedActions(['browse', 'iphone', 'samsung'])
        };
    }

    handleCartInquiry() {
        const cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];

        if (cart.length === 0) {
            return {
                message: this.t('aiCartEmpty'),
                actions: this.getSuggestedActions(['browse', 'deals', 'recommendations'])
            };
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let message = this.t('aiCartHasItems').replace('{count}', cart.length) + '\n\n';

        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        message += `\n**Total: $${total.toFixed(2)}**\n\n`;
        message += this.t('aiCheckoutReady');

        return {
            message,
            actions: [
                { label: this.t('aiCheckoutNow'), action: 'checkout' },
                { label: this.t('aiContinueShopping'), action: 'browse' },
                { label: this.t('aiViewCart'), action: 'show-cart' }
            ],
            executeAction: { type: 'show-cart' }
        };
    }

    handleOrderTracking() {
        return {
            message: `To track your order, I'll need your order number.

You can find it in:
• Your confirmation email
• Your account orders section

Please enter your order number (format: FT123456789) and I'll look it up for you!`,
            actions: [
                { label: '📧 Check Email', action: 'help' },
                { label: '👤 View My Orders', action: 'my-orders' }
            ]
        };
    }

    handleAddToCart(message) {
        // Try to search for the product in the message
        const searchResults = this.searchAllProducts(message);

        if (searchResults.length === 0) {
            return {
                message: this.t('aiProductNotFound'),
                actions: this.getSuggestedActions(['browse', 'iphone', 'samsung'])
            };
        }

        if (searchResults.length === 1) {
            // Exact match - add to cart
            const product = searchResults[0];
            return {
                message: this.t('aiAddedToCart').replace('{item}', product.name),
                executeAction: { type: 'add-to-cart', product }
            };
        }

        // Multiple matches - let user choose
        const topResults = searchResults.slice(0, 5);
        let responseText = `I found ${searchResults.length} products matching your search. Which one would you like to add to cart?\n\n`;

        topResults.forEach((product, index) => {
            responseText += `${index + 1}. **${product.name}** - $${product.price}\n`;
        });

        return {
            message: responseText,
            actions: topResults.map(p => ({
                label: `➕ ${p.name.split(' ').slice(0, 3).join(' ')}`,
                action: 'add-to-cart',
                data: p
            }))
        };
    }

    extractProductNameFromMessage(message) {
        // Simple extraction - can be enhanced
        const words = message.toLowerCase().split(' ');
        const productKeywords = ['iphone', 'samsung', 'macbook', 'ipad', 'watch', 'starlink', 'pixel', 'camera', 'accessories'];

        for (const keyword of productKeywords) {
            if (words.includes(keyword)) {
                return keyword;
            }
        }

        return null;
    }

    // NEW ENHANCED HANDLERS

    async handleDealsInquiry() {
        const dealProducts = window.products ?
            window.products.filter(p => p.badge === 'SALE' || p.badge === 'NEW' || p.badge === 'POPULAR').slice(0, 5) : [];

        let message = `🔥 **Hot Deals Right Now:**\n\n`;

        if (dealProducts.length > 0) {
            dealProducts.forEach((product, index) => {
                message += `${index + 1}. **${product.name}** - $${product.price}`;
                if (product.badge) message += ` 🏷️ ${product.badge}`;
                message += `\n`;
            });
            message += `\n✅ FREE worldwide shipping on all items!`;
        } else {
            message = `Check out our entire catalog for amazing prices! All products come with:\n\n✅ FREE worldwide shipping\n✅ Quality guarantee\n✅ Fast delivery\n\nWhat product are you interested in?`;
        }

        return {
            message,
            actions: this.getSuggestedActions(['browse', 'iphone', 'samsung'])
        };
    }

    handleCheckoutInquiry() {
        const cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];

        if (cart.length === 0) {
            return {
                message: this.t('aiCartEmpty'),
                actions: this.getSuggestedActions(['browse', 'deals', 'recommendations'])
            };
        }

        return {
            message: `Great! You have ${cart.length} item(s) ready for checkout. Click the checkout button below to complete your purchase.\n\n💳 We accept: Credit cards, Mobile Money, PayPal, Zelle, Cash App\n🚚 FREE worldwide shipping!`,
            actions: [
                { label: this.t('aiCheckoutNow'), action: 'checkout' },
                { label: this.t('aiViewCart'), action: 'show-cart' },
                { label: this.t('aiContinueShopping'), action: 'browse' }
            ],
            executeAction: { type: 'checkout' }
        };
    }

    handleCartRemoval() {
        return {
            message: `To remove an item from your cart:\n\n1. Click the cart icon (🛒) at the top\n2. Find the item you want to remove\n3. Click the remove/delete button next to it\n\nWould you like me to open your cart for you?`,
            actions: [
                { label: '🛒 Open Cart', action: 'show-cart' },
                { label: '🛍️ Continue Shopping', action: 'browse' }
            ]
        };
    }

    handleOrderCancellation() {
        return {
            message: `To cancel an order:\n\n📧 **If not shipped yet:**\n• Email: support@fordipstech.com\n• Call: (667) 256-3680 (USA)\n• Include your order number\n\n⚠️ **If already shipped:**\n• You can refuse delivery\n• Or initiate a return once received\n\nWe typically ship within 24 hours, so please contact us quickly!\n\nNeed help with anything else?`,
            actions: [
                { label: '📞 Contact Support', action: 'contact' },
                { label: '📦 Track Order', action: 'track-order' }
            ]
        };
    }

    async handleSpecsInquiry(message) {
        // Try to search for the product in the message
        const searchResults = this.searchAllProducts(message);

        if (searchResults.length === 0) {
            return {
                message: "Which product would you like detailed specifications for? I can provide complete specs for all our products!",
                actions: this.getSuggestedActions(['iphone', 'samsung', 'browse'])
            };
        }

        if (searchResults.length === 1) {
            const product = searchResults[0];
            return {
                message: `📋 **${product.name} Specifications:**\n\n${product.description}\n\n💰 Price: $${product.price}\n${product.badge ? `🏷️ ${product.badge}\n` : ''}\nFor complete technical specifications:\n• Visit the product page\n• Check manufacturer's website\n• Contact our support team\n\nWould you like to add this to your cart?`,
                actions: [
                    { label: `➕ Add to Cart`, action: 'add-to-cart', data: product },
                    { label: '🔍 Similar Products', action: 'similar', data: product.category }
                ]
            };
        }

        // Multiple matches
        let specMessage = `I found ${searchResults.length} products. Which one would you like specifications for?\n\n`;
        searchResults.slice(0, 5).forEach((p, index) => {
            specMessage += `${index + 1}. **${p.name}** - $${p.price}\n`;
        });

        return {
            message: specMessage,
            actions: searchResults.slice(0, 3).map(p => ({
                label: `${p.name.split(' ').slice(0, 3).join(' ')} Details`,
                action: 'view-product',
                data: p
            }))
        };
    }

    handleComparisonInquiry() {
        return {
            message: `🔍 **Product Comparison:**\n\nI can help you compare products! Popular comparisons:\n\n📱 **iPhone vs Samsung**\n• iPhone: iOS, premium build, ecosystem\n• Samsung: Android, more features, flexibility\n\n💻 **MacBook vs Windows Laptop**\n• MacBook: macOS, premium, great for creative work\n• Windows: More software compatibility, gaming\n\n⌚ **Apple Watch vs Others**\n• Apple Watch: Best iPhone integration\n• Others: More affordable, good fitness tracking\n\nWhat specific products would you like to compare?`,
            actions: this.getSuggestedActions(['iphone', 'samsung', 'browse'])
        };
    }

    handleStockInquiry() {
        return {
            message: `✅ **Product Availability:**\n\nAll products shown on our website are currently in stock and ready to ship!\n\n• 🚚 Ships within 24 hours\n• 📦 FREE worldwide delivery\n• ✉️ Tracking provided for all orders\n\nIf a product is out of stock, it won't appear in our catalog. Which product are you interested in?`,
            actions: this.getSuggestedActions(['browse', 'iphone', 'samsung'])
        };
    }

    handleWarrantyInquiry() {
        return {
            message: `🛡️ **Warranty & Return Policy:**\n\n**Manufacturer Warranty:**\n• All products include original manufacturer warranty\n• Apple: 1 year limited warranty\n• Samsung: 1 year limited warranty\n• Other brands: As specified by manufacturer\n\n**Our Guarantee:**\n✅ 30-day return policy\n✅ Products must be unused and in original packaging\n✅ Full refund if defective on arrival\n✅ Free return shipping for defective items\n\n**How to Return:**\n1. Email support@fordipstech.com within 30 days\n2. Include order number and reason\n3. We'll provide return instructions\n\nQuestions about a specific product warranty?`,
            actions: [
                { label: '📞 Contact Support', action: 'contact' },
                { label: '🛍️ Browse Products', action: 'browse' }
            ]
        };
    }

    handleFreeShippingInfo() {
        return {
            message: `🚚 **FREE WORLDWIDE SHIPPING!**\n\n✅ Yes, shipping is 100% FREE on ALL orders!\n✅ No minimum purchase required\n✅ Available to all countries\n✅ Fully tracked and insured\n\n**Delivery Times:**\n• USA: 3-5 business days\n• Cameroon: 5-7 business days\n• Other countries: 7-14 business days\n\nReady to order?`,
            actions: this.getSuggestedActions(['browse', 'deals', 'contact'])
        };
    }

    handleInternationalShipping() {
        return {
            message: `🌍 **International Shipping:**\n\nWe ship to ALL countries worldwide!\n\n**Popular Destinations:**\n🇺🇸 USA - 3-5 days\n🇨🇲 Cameroon - 5-7 days\n🇳🇬 Nigeria - 7-10 days\n🇬🇭 Ghana - 7-10 days\n🇨🇦 Canada - 5-7 days\n🇬🇧 UK - 7-10 days\n🇫🇷 France - 7-10 days\n\n✅ FREE shipping to all countries\n✅ Customs paperwork included\n✅ Full tracking provided\n\n💡 **Note:** Customs duties may apply depending on your country.\n\nWhere do you need shipping to?`,
            actions: this.getSuggestedActions(['browse', 'deals', 'contact'])
        };
    }

    handleMobileMoneyInfo() {
        return {
            message: `📱 **Mobile Money Payment:**\n\nWe accept Mobile Money payments!\n\n**Supported Services:**\n✅ MTN Mobile Money (MTN MoMo)\n✅ Orange Money\n\n**How to Pay:**\n1. Add items to cart\n2. Proceed to checkout\n3. Select "Mobile Money" as payment method\n4. Enter your mobile money number\n5. Approve the payment on your phone\n\n**Benefits:**\n• Instant processing\n• Secure transactions\n• No credit card needed\n• Works with all mobile networks\n\nReady to start shopping?`,
            actions: [
                { label: '🛍️ Browse Products', action: 'browse' },
                { label: '💳 All Payment Methods', action: 'payment' }
            ]
        };
    }

    handleRefundInquiry() {
        return {
            message: `💰 **Refund Policy:**\n\n**When You Get a Refund:**\n✅ Product defective on arrival\n✅ Wrong item shipped\n✅ Item not as described\n✅ Return within 30 days (unused)\n\n**Refund Process:**\n1. Contact us: support@fordipstech.com\n2. Provide order number and reason\n3. Return the item (we cover shipping for defects)\n4. Refund processed within 5-7 business days\n\n**Refund Method:**\n• Returned to original payment method\n• Mobile Money refunds: within 24 hours\n• Credit card refunds: 5-7 business days\n\nNeed to request a refund?`,
            actions: [
                { label: '📞 Contact Support', action: 'contact' },
                { label: '📦 Track Order', action: 'track-order' }
            ]
        };
    }

    handleAccountInquiry() {
        return {
            message: `👤 **Your Account:**\n\nCurrently, you can shop without creating an account!\n\n**Guest Checkout:**\n✅ No registration needed\n✅ Fast checkout\n✅ Email order confirmation\n✅ Track with order number\n\n**Coming Soon:**\n🔜 Account creation\n🔜 Order history\n🔜 Saved addresses\n🔜 Wishlists\n\nFor now, save your order confirmation email to track purchases!\n\nReady to start shopping?`,
            actions: this.getSuggestedActions(['browse', 'deals', 'contact'])
        };
    }

    handlePasswordHelp() {
        return {
            message: `Currently, our website doesn't require account creation! You can shop as a guest.\n\nIf you need help with:\n• Order tracking - Use your order number\n• Purchase issues - Contact our support team\n\nHow else can I help you?`,
            actions: [
                { label: '🛍️ Start Shopping', action: 'browse' },
                { label: '📞 Contact Support', action: 'contact' }
            ]
        };
    }

    handleBusinessHours() {
        return {
            message: `🕐 **Business Hours:**\n\n**Online Store:**\n🌐 Open 24/7 - Shop anytime!\n\n**Customer Support:**\n📞 Monday - Saturday\n🕐 9:00 AM - 6:00 PM EST (USA)\n🕐 3:00 PM - 12:00 AM WAT (Cameroon)\n\n**Sunday:**\n📧 Email only: support@fordipstech.com\n\n**Response Times:**\n• Live Chat: Instant (during hours)\n• Email: Within 24 hours\n• Phone: Immediate (during hours)\n\nNeed help now?`,
            actions: [
                { label: '📞 Contact Us', action: 'contact' },
                { label: '🛍️ Browse Products', action: 'browse' }
            ]
        };
    }

    handleTechnicalSupport() {
        return {
            message: `🔧 **Technical Support:**\n\nI'm sorry you're experiencing issues! Let's fix it:\n\n**Common Issues:**\n1️⃣ **Can't add to cart** - Try refreshing the page\n2️⃣ **Checkout not working** - Clear browser cache\n3️⃣ **Payment failed** - Check card details or try different method\n4️⃣ **Images not loading** - Check internet connection\n\n**Need More Help?**\n📧 Email: support@fordipstech.com\n📞 Call: (667) 256-3680 (USA)\n📞 Call: +237 678 123 456 (Cameroon)\n\nPlease describe your issue and I'll help you solve it!`,
            actions: [
                { label: '📞 Contact Support', action: 'contact' },
                { label: '🔄 Refresh Page', action: 'refresh' }
            ]
        };
    }

    handleComplaint() {
        return {
            message: `😔 **We're Sorry!**\n\nYour satisfaction is our priority. I want to help resolve your concern immediately.\n\n**How to Report:**\n📧 Email: support@fordipstech.com\n📞 Phone: (667) 256-3680 (USA)\n📞 Phone: +237 678 123 456 (Cameroon)\n\n**Please Include:**\n• Your order number (if applicable)\n• Description of the issue\n• Any photos (if relevant)\n\n**We Promise:**\n✅ Response within 24 hours\n✅ Fair resolution\n✅ Your satisfaction guaranteed\n\nWhat specific issue would you like to report?`,
            actions: [
                { label: '📞 Contact Support', action: 'contact' },
                { label: '📦 Check My Order', action: 'track-order' }
            ]
        };
    }

    handleHowToInquiry(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('checkout') || lowerMessage.includes('buy')) {
            return {
                message: `🛒 **How to Checkout:**\n\n1. Browse and find products\n2. Click "Add to Cart" button\n3. Click cart icon (🛒) at top\n4. Review your items\n5. Click "Checkout" button\n6. Enter shipping details\n7. Select payment method\n8. Complete payment\n9. Receive confirmation email!\n\nNeed help with a specific step?`,
                actions: [
                    { label: '🛍️ Start Shopping', action: 'browse' },
                    { label: '🛒 View Cart', action: 'show-cart' }
                ]
            };
        }

        if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
            return {
                message: `📦 **How to Track Your Order:**\n\n1. Check your email for order confirmation\n2. Find your order number (Format: FT123456789)\n3. Click tracking link in email\n   OR\n4. Tell me your order number and I'll help track it!\n\nDo you have an order to track?`,
                actions: [
                    { label: '📦 Track Order', action: 'track-order' },
                    { label: '📞 Contact Support', action: 'contact' }
                ]
            };
        }

        return {
            message: `📚 **How Can I Help?**\n\nI can guide you through:\n\n🛒 How to shop and checkout\n📦 How to track orders\n💳 How to pay (various methods)\n🚚 How shipping works\n↩️ How to return items\n🌍 How to change language/currency\n\nWhat would you like to learn?`,
            actions: this.getSuggestedActions(['browse', 'contact', 'help'])
        };
    }

    handleLanguageHelp() {
        return {
            message: `🌍 **Language Options:**\n\nOur website supports multiple languages!\n\n**Available Languages:**\n🇺🇸 English\n🇫🇷 French (Français)\n🇨🇲 Pidgin English\n\n**How to Change Language:**\n1. Look at the top right of the page\n2. Click the language selector (🌐)\n3. Choose your preferred language\n4. Page will reload in that language!\n\n**Note:** All products, prices, and information are translated!\n\nNeed help finding anything?`,
            actions: this.getSuggestedActions(['browse', 'deals', 'contact'])
        };
    }

    handleCurrencyHelp() {
        return {
            message: `💱 **Currency Options:**\n\nWe support multiple currencies!\n\n**Available Currencies:**\n💵 USD (US Dollar)\n💶 EUR (Euro)\n🇨🇲 XAF (CFA Franc)\n\n**How to Change Currency:**\n1. Look at the top right of the page\n2. Click the currency selector (💰)\n3. Choose your preferred currency\n4. All prices update automatically!\n\n**Note:** \n• Prices are converted in real-time\n• Payment can be made in any currency\n• FREE shipping regardless of currency!\n\nReady to shop?`,
            actions: this.getSuggestedActions(['browse', 'deals', 'contact'])
        };
    }

    async handlePriceInquiry(message) {
        // Try to search for the product in the message
        const searchResults = this.searchAllProducts(message);

        if (searchResults.length > 0) {
            const product = searchResults[0]; // Get best match

            if (searchResults.length === 1) {
                return {
                    message: `The **${product.name}** is priced at **$${product.price}**.\n\n${product.description}\n\nWould you like to add it to your cart?`,
                    actions: [
                        { label: `➕ Add to Cart`, action: 'add-to-cart', data: product },
                        { label: '🔍 See Similar', action: 'similar', data: product.category }
                    ]
                };
            } else {
                // Multiple matches
                let priceMessage = `I found ${searchResults.length} products. Here are the prices:\n\n`;
                searchResults.slice(0, 5).forEach((p, index) => {
                    priceMessage += `${index + 1}. **${p.name}** - $${p.price}\n`;
                });
                priceMessage += `\nWhich one are you interested in?`;

                return {
                    message: priceMessage,
                    actions: searchResults.slice(0, 3).map(p => ({
                        label: `${p.name.split(' ').slice(0, 3).join(' ')} - $${p.price}`,
                        action: 'add-to-cart',
                        data: p
                    }))
                };
            }
        }

        return {
            message: "Which product's price would you like to know? Please tell me the product name or describe what you're looking for.",
            actions: this.getSuggestedActions(['browse', 'iphone', 'samsung'])
        };
    }

    handleShippingInquiry() {
        return {
            message: `📦 **Shipping Information:**

✅ **FREE WORLDWIDE SHIPPING** on all orders!

🚚 **Delivery Times:**
• USA: 3-5 business days
• Cameroon: 5-7 business days
• Other countries: 7-14 business days

📍 **We ship to:** USA, Cameroon, Nigeria, Ghana, and worldwide!

💳 All orders are tracked and insured.

Would you like to place an order?`,
            actions: [
                { label: '🛍️ Browse Products', action: 'browse' },
                { label: '📍 Our Locations', action: 'locations' }
            ]
        };
    }

    handlePaymentInquiry() {
        return {
            message: `💳 **Payment Methods We Accept:**

💵 Credit/Debit Cards (Visa, Mastercard, Amex)
📱 MTN Mobile Money
📱 Orange Money
💸 Zelle
💰 Cash App
🔵 PayPal

🔒 All payments are secure and encrypted.
✅ No hidden fees - what you see is what you pay!

Ready to checkout?`,
            actions: [
                { label: '💳 Checkout', action: 'checkout' },
                { label: '🛍️ Continue Shopping', action: 'browse' }
            ]
        };
    }

    handleLocationInquiry() {
        return {
            message: `📍 **Our Locations:**

**🇺🇸 USA (Headquarters):**
15706 Dorset Rd
Laurel, MD 20707
📞 (667) 256-3680

**🇨🇲 Cameroon:**
Mountain Plaza, Molyko
Buea, South West Region
📞 +237 678 123 456

🌐 **Online Store:** Open 24/7
📧 Email: support@fordipstech.com

We offer FREE worldwide shipping! 🚚`,
            actions: [
                { label: '🛍️ Shop Now', action: 'browse' },
                { label: '📞 Contact Us', action: 'contact' }
            ],
            executeAction: { type: 'scroll-to-section', section: 'locations' }
        };
    }

    handleContactInquiry() {
        return {
            message: `📞 **Contact Fordips Tech:**

**Phone:**
• USA: (667) 256-3680
• Cameroon: +237 678 123 456

**Email:**
• support@fordipstech.com

**Social Media:**
• Facebook: Fordips Tech
• TikTok: @fordipstechllc
• YouTube: @alsinna

**Business Hours:**
• 24/7 Online Store
• Support: Mon-Sat, 9AM-6PM EST

How else can I help you today?`,
            actions: [
                { label: '📧 Send Message', action: 'contact-form' },
                { label: '🛍️ Browse Products', action: 'browse' }
            ],
            executeAction: { type: 'scroll-to-section', section: 'contact' }
        };
    }

    handleQuickAction(action) {
        const actionMap = {
            'browse-products': () => this.executeAction({ type: 'scroll-to-section', section: 'products' }),
            'best-deals': () => this.handleBudgetSearch().then(r => this.addMessage({ role: 'assistant', content: r.message, actions: r.actions, timestamp: new Date() })),
            'popular': () => this.handleRecommendations().then(r => this.addMessage({ role: 'assistant', content: r.message, actions: r.actions, timestamp: new Date() })),
            'track-order': () => this.handleOrderTracking().then(r => this.addMessage({ role: 'assistant', content: r.message, actions: r.actions, timestamp: new Date() })),
            'help': () => this.handleContactInquiry().then(r => this.addMessage({ role: 'assistant', content: r.message, actions: r.actions, timestamp: new Date() }))
        };

        const handler = actionMap[action];
        if (handler) handler();
    }

    async executeAction(action) {
        switch (action.type) {
            case 'scroll-to-section':
                const section = document.getElementById(action.section);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
                break;

            case 'scroll-to-category':
                // Click the category filter button
                const filterBtn = document.querySelector(`[data-filter="${action.category}"]`);
                if (filterBtn) {
                    setTimeout(() => {
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => filterBtn.click(), 500);
                    }, 300);
                }
                break;

            case 'add-to-cart':
                if (action.product && typeof addToCart === 'function') {
                    addToCart(action.product.id, action.product.name, action.product.price, action.product.image);
                    this.addMessage({
                        role: 'assistant',
                        content: this.t('aiAddedToCart').replace('{item}', action.product.name),
                        timestamp: new Date()
                    });
                }
                break;

            case 'show-cart':
                const cartButton = document.getElementById('cartButton');
                if (cartButton) cartButton.click();
                break;

            case 'checkout':
                if (typeof openCheckoutModal === 'function') {
                    openCheckoutModal();
                }
                break;

            default:
                window.FORDIPS_CONFIG?.logger.log('Unknown action:', action);
        }
    }

    getSuggestedActions(types) {
        const actionTemplates = {
            'browse': { label: '🛍️ Browse All Products', action: 'browse' },
            'deals': { label: '💰 Show Best Deals', action: 'deals' },
            'iphone': { label: '📱 Show iPhones', action: 'search', data: 'iphone' },
            'samsung': { label: '📱 Show Samsung', action: 'search', data: 'samsung' },
            'contact': { label: '📞 Contact Us', action: 'contact' },
            'help': { label: '❓ Get Help', action: 'help' },
            'recommendations': { label: '⭐ Top Picks', action: 'recommendations' },
            'search': { label: '🔍 Search Products', action: 'search' },
            'locations': { label: '📍 Our Locations', action: 'locations' }
        };

        return types.map(type => actionTemplates[type]).filter(Boolean);
    }

    addMessage(message) {
        this.conversationHistory.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${message.role}`;

        const content = message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

        messageEl.innerHTML = `
            <div class="message-bubble">
                ${content}
                ${message.actions ? this.renderActions(message.actions) : ''}
            </div>
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
        `;

        fragment.appendChild(messageEl);
        messagesContainer.appendChild(fragment);

        // Attach action button listeners
        if (message.actions) {
            messageEl.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const actionData = JSON.parse(btn.dataset.action);
                    this.executeAction(actionData);
                }, { passive: true });
            });
        }

        // Trigger reflow only once
        requestAnimationFrame(() => {
            messageEl.style.opacity = '1';
        });
    }

    renderActions(actions) {
        if (!actions || actions.length === 0) return '';

        return `
            <div class="message-actions">
                ${actions.map(action => `
                    <button class="action-btn" data-action='${JSON.stringify(action)}'>
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const typingEl = document.createElement('div');
        typingEl.className = 'chat-message assistant typing-indicator';
        typingEl.id = 'typingIndicator';
        typingEl.innerHTML = `
            <div class="message-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingEl);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            // Use requestAnimationFrame for smoother scrolling
            requestAnimationFrame(() => {
                messagesContainer.scrollTo({
                    top: messagesContainer.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updateUserContext(message) {
        // Track user interests
        const categories = ['iphone', 'samsung', 'laptop', 'tablet', 'watch'];
        categories.forEach(cat => {
            if (message.toLowerCase().includes(cat)) {
                this.userContext.preferences[cat] = (this.userContext.preferences[cat] || 0) + 1;
            }
        });

        // Update cart context
        this.userContext.cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];
    }

    saveConversationHistory() {
        try {
            FordipsUtils.storage.set('aiChatHistory', this.conversationHistory);
        } catch (e) {
            window.FORDIPS_CONFIG?.logger.error('Error saving chat history:', e);
        }
    }

    loadConversationHistory() {
        try {
            const history = FordipsUtils.storage.get('aiChatHistory', []);
            // Only load recent history (last 10 messages)
            this.conversationHistory = history.slice(-10);

            // Render loaded messages
            this.conversationHistory.forEach(msg => this.renderMessage(msg));
        } catch (e) {
            window.FORDIPS_CONFIG?.logger.error('Error loading chat history:', e);
        }
    }
}

// Initialize AI Chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 AI Chat: DOM ready, starting initialization...');

    // Wait for utils, config, and translations to load
    const initAIChat = () => {
        const hasTranslations = typeof window.t === 'function';
        const hasUtils = typeof window.FordipsUtils !== 'undefined';

        console.log('🤖 AI Chat: Checking dependencies...', {
            hasTranslations,
            hasUtils
        });

        if (hasTranslations && hasUtils) {
            console.log('🤖 AI Chat: Dependencies ready! Initializing...');
            window.fordipsAI = new FordipsTechAI();
            console.log('✅ AI Chat: Initialized successfully!');
        } else {
            console.log('⏳ AI Chat: Dependencies not ready, retrying in 100ms...');
            // Retry after a short delay if translations not ready
            setTimeout(initAIChat, 100);
        }
    };

    setTimeout(initAIChat, 500);
});

window.FORDIPS_CONFIG?.logger.log('✅ AI Chat module loaded');
