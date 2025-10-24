/**
 * FORDIPS TECH - Admin Notification System
 * AWS-style toast notifications and alerts
 */

// Notification container
let notificationContainer;

// Initialize notification system
function initializeNotifications() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.setAttribute('role', 'region');
        notificationContainer.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(notificationContainer);
    }
}

/**
 * Show toast notification (AWS CloudWatch style)
 * @param {string} message - Notification message
 * @param {string} type - success, error, warning, info
 * @param {number} duration - Duration in ms (0 = permanent)
 */
function showNotification(message, type = 'info', duration = 5000) {
    initializeNotifications();

    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    const icon = getNotificationIcon(type);

    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="closeNotification(this)" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </path>
        </button>
    `;

    notificationContainer.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            closeNotificationElement(notification);
        }, duration);
    }

    return notification;
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type) {
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
    };
    return icons[type] || icons.info;
}

/**
 * Close notification
 */
function closeNotification(button) {
    const notification = button.closest('.admin-notification');
    closeNotificationElement(notification);
}

function closeNotificationElement(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

/**
 * Show confirmation dialog (AWS-style)
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmText - Confirm button text
 * @param {string} type - danger, warning, info
 * @returns {Promise<boolean>}
 */
function showConfirmDialog(title, message, confirmText = 'Confirm', type = 'warning') {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'admin-confirm-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-labelledby', 'confirm-title');
        dialog.setAttribute('aria-describedby', 'confirm-message');

        dialog.innerHTML = `
            <div class="confirm-overlay"></div>
            <div class="confirm-content ${type}">
                <div class="confirm-icon">${getNotificationIcon(type)}</div>
                <h3 id="confirm-title" class="confirm-title">${title}</h3>
                <p id="confirm-message" class="confirm-message">${message}</p>
                <div class="confirm-actions">
                    <button class="btn-secondary confirm-cancel">Cancel</button>
                    <button class="btn-${type === 'danger' ? 'danger' : 'primary'} confirm-ok">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Focus on OK button
        requestAnimationFrame(() => {
            dialog.querySelector('.confirm-ok').focus();
        });

        // Handle buttons
        dialog.querySelector('.confirm-cancel').addEventListener('click', () => {
            dialog.remove();
            resolve(false);
        });

        dialog.querySelector('.confirm-ok').addEventListener('click', () => {
            dialog.remove();
            resolve(true);
        });

        dialog.querySelector('.confirm-overlay').addEventListener('click', () => {
            dialog.remove();
            resolve(false);
        });

        // ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                dialog.remove();
                resolve(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    });
}

/**
 * Show loading spinner (AWS-style)
 */
function showLoadingSpinner(message = 'Loading...') {
    let spinner = document.getElementById('admin-loading-spinner');

    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'admin-loading-spinner';
        spinner.className = 'admin-loading-overlay';
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-live', 'polite');

        spinner.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;

        document.body.appendChild(spinner);
    } else {
        spinner.querySelector('.loading-message').textContent = message;
        spinner.style.display = 'flex';
    }

    return spinner;
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('admin-loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

/**
 * Real-time notification badge for new contacts/messages
 */
function updateNotificationBadge(count, tabName) {
    const tab = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (!tab) return;

    let badge = tab.querySelector('.notification-badge');

    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            tab.appendChild(badge);
        }
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'inline-block';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

/**
 * Poll for new contact submissions (real-time notifications)
 */
let notificationPollingInterval;

function startNotificationPolling() {
    // Poll every 30 seconds
    notificationPollingInterval = setInterval(async () => {
        try {
            if (typeof window.fordipsTech === 'undefined') return;

            const contacts = await window.fordipsTech.getAllContactSubmissions();
            const newContacts = contacts.filter(c => c.status === 'new' || !c.status);

            if (newContacts.length > 0) {
                updateNotificationBadge(newContacts.length, 'contacts');

                // Show desktop notification if permitted
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Fordips Tech Admin', {
                        body: `You have ${newContacts.length} new contact submission(s)`,
                        icon: 'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/fordips%20logo.png',
                        badge: 'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/fordips%20logo.png'
                    });
                }
            }
        } catch (error) {
            // Silent fail
        }
    }, 30000); // 30 seconds
}

function stopNotificationPolling() {
    if (notificationPollingInterval) {
        clearInterval(notificationPollingInterval);
    }
}

/**
 * Request browser notification permission
 */
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return Notification.permission === 'granted';
}

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotifications);
} else {
    initializeNotifications();
}
