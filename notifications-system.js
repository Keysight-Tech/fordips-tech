/**
 * FORDIPS TECH - NOTIFICATIONS SYSTEM
 * Real-time notifications for customers with accounts
 */

class NotificationsSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.isOpen = false;
        this.pollingInterval = null;
        this.init();
    }

    async init() {
        window.FORDIPS_CONFIG?.logger.log('🔔 Notifications System initializing...');

        // Check if user is logged in
        const user = await window.fordipsTech?.getCurrentUser();
        if (!user) {
            window.FORDIPS_CONFIG?.logger.log('No user logged in, notifications disabled');
            return;
        }

        this.createNotificationUI();
        await this.loadNotifications();
        this.startPolling();
        this.setupEventListeners();
    }

    createNotificationUI() {
        const notificationHTML = `
            <div class="notification-system" id="notificationSystem">
                <!-- Notification Bell -->
                <button class="notification-bell" id="notificationBell" aria-label="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                </button>

                <!-- Notification Dropdown -->
                <div class="notification-dropdown" id="notificationDropdown">
                    <div class="notification-header">
                        <h3>Notifications</h3>
                        <button class="mark-all-read-btn" id="markAllReadBtn">
                            Mark all as read
                        </button>
                    </div>

                    <div class="notification-list" id="notificationList">
                        <!-- Notifications will be inserted here -->
                    </div>

                    <div class="notification-footer">
                        <button class="view-all-notifications-btn" onclick="window.notificationSystem.viewAll()">
                            View All Notifications
                        </button>
                    </div>
                </div>

                <!-- Notification Overlay -->
                <div class="notification-overlay" id="notificationOverlay"></div>
            </div>
        `;

        // Find the header or create a notifications container
        const header = document.querySelector('header nav .nav-links');
        if (header) {
            header.insertAdjacentHTML('beforeend', notificationHTML);
        }
    }

    setupEventListeners() {
        const bell = document.getElementById('notificationBell');
        const overlay = document.getElementById('notificationOverlay');
        const markAllRead = document.getElementById('markAllReadBtn');

        if (bell) {
            bell.addEventListener('click', () => {
                this.toggleDropdown();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeDropdown();
            });
        }

        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDropdown();
            }
        });
    }

    async loadNotifications() {
        try {
            const user = await window.fordipsTech?.getCurrentUser();
            if (!user) return;

            // Load from Supabase
            const notifications = await window.fordipsTech.getUserNotifications(user.id);

            this.notifications = notifications || [];
            this.updateUnreadCount();
            this.renderNotifications();

        } catch (error) {
            window.FORDIPS_CONFIG?.logger.error('Error loading notifications:', error);
        }
    }

    renderNotifications() {
        const listContainer = document.getElementById('notificationList');
        if (!listContainer) return;

        if (this.notifications.length === 0) {
            listContainer.innerHTML = `
                <div class="notification-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <p>No notifications yet</p>
                    <small>We'll notify you when something happens</small>
                </div>
            `;
            return;
        }

        // Show latest 10 notifications
        const recentNotifications = this.notifications.slice(0, 10);

        const notificationsHTML = recentNotifications.map(notification =>
            this.createNotificationItem(notification)
        ).join('');

        listContainer.innerHTML = notificationsHTML;
    }

    createNotificationItem(notification) {
        const timeAgo = this.getTimeAgo(notification.created_at);
        const icon = this.getNotificationIcon(notification.type);
        const unreadClass = notification.is_read ? '' : 'unread';

        return `
            <div class="notification-item ${unreadClass}" data-id="${notification.id}" onclick="window.notificationSystem.markAsRead('${notification.id}')">
                <div class="notification-icon ${notification.type}">
                    ${icon}
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                ${!notification.is_read ? '<div class="notification-unread-dot"></div>' : ''}
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            'order': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
            'payment': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
            'help_me_pay': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            'shipping': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
            'account': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
            'promo': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>'
        };

        return icons[notification.type] || icons['account'];
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return then.toLocaleDateString();
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;

        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // Add pulse animation to bell if there are unread notifications
        const bell = document.getElementById('notificationBell');
        if (bell && this.unreadCount > 0) {
            bell.classList.add('has-notifications');
        } else if (bell) {
            bell.classList.remove('has-notifications');
        }
    }

    toggleDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        const overlay = document.getElementById('notificationOverlay');

        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        const overlay = document.getElementById('notificationOverlay');

        if (dropdown) dropdown.classList.add('active');
        if (overlay) overlay.classList.add('active');

        this.isOpen = true;
    }

    closeDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        const overlay = document.getElementById('notificationOverlay');

        if (dropdown) dropdown.classList.remove('active');
        if (overlay) overlay.classList.remove('active');

        this.isOpen = false;
    }

    async markAsRead(notificationId) {
        try {
            // Update in database
            await window.fordipsTech.markNotificationAsRead(notificationId);

            // Update local state
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.is_read = true;
            }

            // Update UI
            this.updateUnreadCount();
            this.renderNotifications();

        } catch (error) {
            window.FORDIPS_CONFIG?.logger.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const user = await window.fordipsTech?.getCurrentUser();
            if (!user) return;

            // Update all in database
            await window.fordipsTech.markAllNotificationsAsRead(user.id);

            // Update local state
            this.notifications.forEach(n => n.is_read = true);

            // Update UI
            this.updateUnreadCount();
            this.renderNotifications();

        } catch (error) {
            window.FORDIPS_CONFIG?.logger.error('Error marking all as read:', error);
        }
    }

    async addNotification(type, title, message, metadata = {}) {
        try {
            const user = await window.fordipsTech?.getCurrentUser();
            if (!user) return;

            const notification = {
                user_id: user.id,
                type: type,
                title: title,
                message: message,
                metadata: metadata,
                is_read: false,
                created_at: new Date().toISOString()
            };

            // Add to database
            const result = await window.fordipsTech.createNotification(notification);

            // Add to local state
            if (result) {
                this.notifications.unshift(result);
                this.updateUnreadCount();
                this.renderNotifications();

                // Show browser notification if permitted
                this.showBrowserNotification(title, message);
            }

        } catch (error) {
            window.FORDIPS_CONFIG?.logger.error('Error creating notification:', error);
        }
    }

    showBrowserNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Fordips Tech - ${title}`, {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            window.FORDIPS_CONFIG?.logger.log('Notification permission:', permission);
        }
    }

    startPolling() {
        // Poll for new notifications every 30 seconds
        this.pollingInterval = setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    viewAll() {
        // Navigate to notifications page (if exists) or show all in modal
        window.FORDIPS_CONFIG?.logger.log('View all notifications');
        this.closeDropdown();
        // TODO: Implement full notifications page
    }

    destroy() {
        this.stopPolling();
        this.notifications = [];
        this.unreadCount = 0;
    }
}

// Initialize notifications system when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for user authentication to complete
    setTimeout(async () => {
        const user = await window.fordipsTech?.getCurrentUser();
        if (user) {
            window.notificationSystem = new NotificationsSystem();
            window.FORDIPS_CONFIG?.logger.log('✅ Notifications System ready');
        }
    }, 1000);
});
