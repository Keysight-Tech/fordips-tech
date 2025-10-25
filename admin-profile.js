/**
 * FORDIPS TECH - Admin Profile System
 * Deep Supabase integration for admin profile management
 */

const AdminProfile = {
    currentUser: null,
    activityLog: [],

    /**
     * Initialize admin profile
     */
    async init() {
        await this.loadAdminData();
        await this.loadActivityLog();
        await this.loadStatistics();
        this.setupEventListeners();
    },

    /**
     * Load admin data from Supabase
     */
    async loadAdminData() {
        try {
            this.currentUser = await window.fordipsTech.getCurrentUser();

            if (!this.currentUser) {
                window.location.href = 'index.html';
                return;
            }

            // Check admin status
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (!profile || !profile.is_admin) {
                if (typeof showNotification === 'function') {
                    showNotification('Access denied. Admin privileges required.', 'error');
                }
                setTimeout(() => window.location.href = 'index.html', 2000);
                return;
            }

            this.updateProfileUI(this.currentUser, profile);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    },

    /**
     * Update profile UI with user data
     */
    updateProfileUI(user, profile) {
        // Update avatar
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            const initials = this.getInitials(profile.full_name || user.email);
            avatar.textContent = initials;
        }

        // Update name
        const nameEl = document.getElementById('profileName');
        if (nameEl) {
            nameEl.textContent = profile.full_name || user.email.split('@')[0];
        }

        // Update email
        const emailEl = document.getElementById('profileEmail');
        if (emailEl) {
            emailEl.textContent = user.email;
        }

        // Update form fields
        document.getElementById('profileFullName').value = profile.full_name || '';
        document.getElementById('profileEmailInput').value = user.email || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileAddress').value = profile.address || '';
        document.getElementById('profileCity').value = profile.city || '';
        document.getElementById('profileCountry').value = profile.country || '';

        // Update member since
        const memberSince = new Date(user.created_at);
        const daysAgo = Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24));
        document.getElementById('profileDaysSince').textContent = daysAgo;
    },

    /**
     * Get user initials from name
     */
    getInitials(name) {
        if (!name) return 'A';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * Load activity log from Supabase
     */
    async loadActivityLog() {
        try {
            // Load admin activity from various tables
            const activities = [];

            // Recent orders
            const { data: orders } = await supabaseClient
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (orders) {
                orders.forEach(order => {
                    activities.push({
                        type: 'order',
                        icon: '🛒',
                        title: `New Order #${order.order_number}`,
                        description: `Order placed by ${order.customer_name}`,
                        time: order.created_at
                    });
                });
            }

            // Recent contact messages
            const { data: contacts } = await supabaseClient
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (contacts) {
                contacts.forEach(contact => {
                    activities.push({
                        type: 'contact',
                        icon: '📧',
                        title: 'New Contact Message',
                        description: `From ${contact.name} - ${contact.subject}`,
                        time: contact.created_at
                    });
                });
            }

            // Sort by time
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));
            this.activityLog = activities.slice(0, 10);

            this.renderActivityLog();
        } catch (error) {
            console.error('Error loading activity log:', error);
        }
    },

    /**
     * Render activity log
     */
    renderActivityLog() {
        const container = document.getElementById('activityLogContainer');
        if (!container) return;

        if (this.activityLog.length === 0) {
            container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">No recent activity</p>';
            return;
        }

        container.innerHTML = this.activityLog.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <span>${activity.icon}</span>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${this.formatTimeAgo(activity.time)}</div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Load statistics
     */
    async loadStatistics() {
        try {
            // Total actions
            const { count: ordersCount } = await supabaseClient
                .from('orders')
                .select('*', { count: 'exact', head: true });

            document.getElementById('statTotalActions').textContent = ordersCount || 0;

            // Total messages
            const { count: messagesCount } = await supabaseClient
                .from('contact_messages')
                .select('*', { count: 'exact', head: true });

            document.getElementById('statTotalMessages').textContent = messagesCount || 0;

            // Total revenue
            const { data: orders } = await supabaseClient
                .from('orders')
                .select('total_amount');

            let totalRevenue = 0;
            if (orders) {
                totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
            }

            document.getElementById('statTotalRevenue').textContent = '$' + totalRevenue.toFixed(2);

            // Active users (count of orders in last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { count: activeUsersCount } = await supabaseClient
                .from('orders')
                .select('customer_email', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo.toISOString());

            document.getElementById('statActiveUsers').textContent = activeUsersCount || 0;

        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Profile menu items
        document.querySelectorAll('.profile-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Save profile button
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveProfile());
        }

        // Change password button
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.changePassword());
        }

        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const setting = toggle.dataset.setting;
                this.updateSecuritySetting(setting, toggle.classList.contains('active'));
            });
        });

        // Generate API key
        const generateApiKeyBtn = document.getElementById('generateApiKeyBtn');
        if (generateApiKeyBtn) {
            generateApiKeyBtn.addEventListener('click', () => this.generateApiKey());
        }
    },

    /**
     * Show profile section
     */
    showSection(sectionId) {
        // Update menu
        document.querySelectorAll('.profile-menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });

        // Update sections
        document.querySelectorAll('.profile-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    },

    /**
     * Save profile
     */
    async saveProfile() {
        try {
            const fullName = document.getElementById('profileFullName').value;
            const phone = document.getElementById('profilePhone').value;
            const address = document.getElementById('profileAddress').value;
            const city = document.getElementById('profileCity').value;
            const country = document.getElementById('profileCountry').value;

            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: phone,
                    address: address,
                    city: city,
                    country: country,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id);

            if (error) throw error;

            if (typeof showNotification === 'function') {
                showNotification('Profile updated successfully!', 'success');
            }

            // Reload data
            await this.loadAdminData();

        } catch (error) {
            console.error('Error saving profile:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to update profile', 'error');
            }
        }
    },

    /**
     * Change password
     */
    async changePassword() {
        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!currentPassword || !newPassword || !confirmPassword) {
                if (typeof showNotification === 'function') {
                    showNotification('Please fill in all password fields', 'error');
                }
                return;
            }

            if (newPassword !== confirmPassword) {
                if (typeof showNotification === 'function') {
                    showNotification('New passwords do not match', 'error');
                }
                return;
            }

            if (newPassword.length < 6) {
                if (typeof showNotification === 'function') {
                    showNotification('Password must be at least 6 characters', 'error');
                }
                return;
            }

            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            if (typeof showNotification === 'function') {
                showNotification('Password changed successfully!', 'success');
            }

            // Clear fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';

        } catch (error) {
            console.error('Error changing password:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to change password', 'error');
            }
        }
    },

    /**
     * Update security setting
     */
    async updateSecuritySetting(setting, enabled) {
        try {
            const settings = {};
            settings[setting] = enabled;

            const { error } = await supabaseClient
                .from('admin_settings')
                .upsert({
                    admin_id: this.currentUser.id,
                    settings: settings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            if (typeof showNotification === 'function') {
                showNotification(
                    `${setting.replace('_', ' ')} ${enabled ? 'enabled' : 'disabled'}`,
                    'success'
                );
            }

        } catch (error) {
            console.error('Error updating security setting:', error);
        }
    },

    /**
     * Generate API key
     */
    async generateApiKey() {
        try {
            const apiKey = 'sk_' + this.generateRandomString(32);
            const keyName = prompt('Enter a name for this API key:');

            if (!keyName) return;

            const { error } = await supabaseClient
                .from('api_keys')
                .insert({
                    admin_id: this.currentUser.id,
                    key_name: keyName,
                    api_key: apiKey,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            if (typeof showNotification === 'function') {
                showNotification('API key generated successfully!', 'success');
            }

            await this.loadApiKeys();

        } catch (error) {
            console.error('Error generating API key:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to generate API key', 'error');
            }
        }
    },

    /**
     * Load API keys
     */
    async loadApiKeys() {
        try {
            const { data: keys, error } = await supabaseClient
                .from('api_keys')
                .select('*')
                .eq('admin_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const container = document.getElementById('apiKeysContainer');
            if (!container) return;

            if (!keys || keys.length === 0) {
                container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">No API keys generated yet</p>';
                return;
            }

            container.innerHTML = keys.map(key => `
                <div class="api-key-item">
                    <div class="api-key-details">
                        <h4>${key.key_name}</h4>
                        <div class="api-key-value">${this.maskApiKey(key.api_key)}</div>
                        <div class="api-key-created">Created: ${new Date(key.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class="api-key-actions">
                        <button class="api-key-btn api-key-btn-copy" onclick="AdminProfile.copyApiKey('${key.api_key}')">
                            Copy
                        </button>
                        <button class="api-key-btn api-key-btn-revoke" onclick="AdminProfile.revokeApiKey('${key.id}')">
                            Revoke
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading API keys:', error);
        }
    },

    /**
     * Mask API key for display
     */
    maskApiKey(key) {
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    },

    /**
     * Copy API key to clipboard
     */
    async copyApiKey(key) {
        try {
            await navigator.clipboard.writeText(key);
            if (typeof showNotification === 'function') {
                showNotification('API key copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Error copying API key:', error);
        }
    },

    /**
     * Revoke API key
     */
    async revokeApiKey(keyId) {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('api_keys')
                .delete()
                .eq('id', keyId);

            if (error) throw error;

            if (typeof showNotification === 'function') {
                showNotification('API key revoked successfully', 'success');
            }

            await this.loadApiKeys();

        } catch (error) {
            console.error('Error revoking API key:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to revoke API key', 'error');
            }
        }
    },

    /**
     * Generate random string
     */
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Format time ago
     */
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 2592000) return Math.floor(seconds / 86400) + ' days ago';
        return date.toLocaleDateString();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profileContainer')) {
        AdminProfile.init();
    }
});

// Make AdminProfile globally available
window.AdminProfile = AdminProfile;
