/**
 * FORDIPS TECH - Contact Form System with Admin Notifications
 * Handles contact form submissions, storage, and notifications
 */

const ADMIN_EMAIL = 'brineketum@gmail.com';

/**
 * Submit contact form message
 */
async function submitContactMessage(formData) {
    try {
        // Prepare contact message data
        const contactData = {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            status: 'new',
            ip_address: await getUserIP(),
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
        };

        // Save to Supabase
        if (typeof supabaseClient !== 'undefined') {
            const { data: savedMessage, error } = await supabaseClient
                .from('contact_messages')
                .insert([contactData])
                .select()
                .single();

            if (error) throw error;

            // Send notifications
            await sendContactNotifications(savedMessage);

            return {
                success: true,
                messageId: savedMessage.id,
                message: 'Your message has been sent successfully!'
            };
        } else {
            // Fallback to localStorage
            return saveContactToLocalStorage(contactData);
        }
    } catch (error) {
        console.error('Error submitting contact message:', error);
        return saveContactToLocalStorage(contactData);
    }
}

/**
 * Send notifications for contact form submission
 */
async function sendContactNotifications(contactMessage) {
    try {
        const notifications = [];

        // 1. Admin notification
        const adminNotification = {
            contact_message_id: contactMessage.id,
            recipient_email: ADMIN_EMAIL,
            notification_type: 'admin_notification',
            subject: `New Contact Message: ${contactMessage.subject}`,
            message: `
                You have received a new contact message from your website.

                FROM: ${contactMessage.name}
                EMAIL: ${contactMessage.email}
                SUBJECT: ${contactMessage.subject}

                MESSAGE:
                ${contactMessage.message}

                ---
                Sent at: ${new Date(contactMessage.created_at).toLocaleString()}
                IP Address: ${contactMessage.ip_address || 'Unknown'}

                View all messages: https://fordipstech.com/admin/contacts
            `,
            status: 'pending'
        };
        notifications.push(adminNotification);

        // 2. Customer confirmation
        const customerNotification = {
            contact_message_id: contactMessage.id,
            recipient_email: contactMessage.email,
            notification_type: 'customer_confirmation',
            subject: 'We received your message - Fordips Tech',
            message: `
                Dear ${contactMessage.name},

                Thank you for contacting Fordips Tech! We have received your message and will get back to you as soon as possible.

                Here's a copy of your message:

                SUBJECT: ${contactMessage.subject}

                MESSAGE:
                ${contactMessage.message}

                ---
                Our team typically responds within 24 hours during business days.

                Best regards,
                Fordips Tech Support Team

                Email: support@fordipstech.com
                Phone: (667) 256-3680
            `,
            status: 'pending'
        };
        notifications.push(customerNotification);

        // Save notifications to database
        if (typeof supabaseClient !== 'undefined') {
            const { error } = await supabaseClient
                .from('contact_notifications')
                .insert(notifications);

            if (error) {
                console.error('Error saving notifications:', error);
            } else {
                console.log('✅ Contact notifications created successfully');

                // Show notification to user about admin being notified
                if (typeof showNotification === 'function') {
                    setTimeout(() => {
                        showNotification(
                            `Admin has been notified at ${ADMIN_EMAIL}`,
                            'success'
                        );
                    }, 1500);
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending contact notifications:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's IP address (best effort)
 */
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return null;
    }
}

/**
 * Save contact message to localStorage (fallback)
 */
function saveContactToLocalStorage(contactData) {
    try {
        const messages = JSON.parse(localStorage.getItem('fordips_contact_messages') || '[]');
        const newMessage = {
            ...contactData,
            id: 'MSG-' + Date.now()
        };
        messages.push(newMessage);
        localStorage.setItem('fordips_contact_messages', JSON.stringify(messages));

        // Show notification about admin
        if (typeof showNotification === 'function') {
            setTimeout(() => {
                showNotification(
                    `Message saved! Admin (${ADMIN_EMAIL}) will be notified when online.`,
                    'success'
                );
            }, 1500);
        }

        return {
            success: true,
            messageId: newMessage.id,
            message: 'Your message has been saved and will be sent to admin when connection is restored.'
        };
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return {
            success: false,
            error: 'Could not save message. Please try again.'
        };
    }
}

/**
 * Load all contact messages (admin only)
 */
async function loadContactMessages(status = null) {
    try {
        if (typeof supabaseClient !== 'undefined') {
            let query = supabaseClient
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } else {
            // Fallback to localStorage
            const messages = JSON.parse(localStorage.getItem('fordips_contact_messages') || '[]');
            return status ? messages.filter(m => m.status === status) : messages;
        }
    } catch (error) {
        console.error('Error loading contact messages:', error);
        return [];
    }
}

/**
 * Mark contact message as read
 */
async function markContactAsRead(messageId) {
    try {
        if (typeof supabaseClient !== 'undefined') {
            const { error } = await supabaseClient
                .from('contact_messages')
                .update({
                    status: 'read',
                    read_at: new Date().toISOString()
                })
                .eq('id', messageId);

            if (error) throw error;
            return { success: true };
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get unread contact message count
 */
async function getUnreadContactCount() {
    try {
        if (typeof supabaseClient !== 'undefined') {
            const { count, error } = await supabaseClient
                .from('contact_messages')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'new');

            if (error) throw error;
            return count || 0;
        } else {
            const messages = JSON.parse(localStorage.getItem('fordips_contact_messages') || '[]');
            return messages.filter(m => m.status === 'new').length;
        }
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
}

/**
 * Update contact message status
 */
async function updateContactStatus(messageId, newStatus, adminNotes = null) {
    try {
        if (typeof supabaseClient !== 'undefined') {
            const updateData = { status: newStatus };

            if (newStatus === 'replied') {
                updateData.replied_at = new Date().toISOString();
            }

            if (adminNotes) {
                updateData.admin_notes = adminNotes;
            }

            const { error } = await supabaseClient
                .from('contact_messages')
                .update(updateData)
                .eq('id', messageId);

            if (error) throw error;
            return { success: true };
        }
    } catch (error) {
        console.error('Error updating contact status:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get contact notifications for a message
 */
async function getContactNotifications(messageId) {
    try {
        if (typeof supabaseClient !== 'undefined') {
            const { data, error } = await supabaseClient
                .from('contact_notifications')
                .select('*')
                .eq('contact_message_id', messageId)
                .order('sent_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
        return [];
    } catch (error) {
        console.error('Error loading notifications:', error);
        return [];
    }
}

// Make functions globally available
window.contactSystem = {
    submitContactMessage,
    sendContactNotifications,
    loadContactMessages,
    markContactAsRead,
    getUnreadContactCount,
    updateContactStatus,
    getContactNotifications
};

console.log('✅ Contact System with Notifications loaded');
