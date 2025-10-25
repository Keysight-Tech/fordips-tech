/**
 * FORDIPS TECH - Product Reviews & Ratings System
 * Handles customer reviews, ratings, and display
 */

// Load reviews for a product
async function loadProductReviews(productId) {
    try {
        if (typeof supabaseClient !== 'undefined') {
            const { data: reviews, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return reviews || [];
        } else {
            // Fallback to localStorage
            return getReviewsFromLocalStorage(productId);
        }
    } catch (error) {
        return getReviewsFromLocalStorage(productId);
    }
}

// Get reviews from localStorage (fallback)
function getReviewsFromLocalStorage(productId) {
    const allReviews = JSON.parse(localStorage.getItem('fordips_reviews') || '[]');
    return allReviews.filter(r => r.product_id === productId && r.status === 'approved');
}

// Calculate average rating
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// Submit a review
async function submitReview(productId, productName, rating, reviewText, customerName, customerEmail) {
    const reviewData = {
        product_id: productId,
        product_name: productName,
        rating: rating,
        review_text: reviewText,
        customer_name: customerName,
        customer_email: customerEmail,
        status: 'pending', // Pending admin approval
        created_at: new Date().toISOString()
    };

    try {
        if (typeof supabaseClient !== 'undefined') {
            const { data, error } = await supabaseClient
                .from('reviews')
                .insert([reviewData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Fallback to localStorage
            return saveReviewToLocalStorage(reviewData);
        }
    } catch (error) {
        return saveReviewToLocalStorage(reviewData);
    }
}

// Save review to localStorage (fallback)
function saveReviewToLocalStorage(reviewData) {
    const reviews = JSON.parse(localStorage.getItem('fordips_reviews') || '[]');
    const newReview = {
        ...reviewData,
        id: 'REV-' + Date.now()
    };
    reviews.push(newReview);
    localStorage.setItem('fordips_reviews', JSON.stringify(reviews));
    return newReview;
}

// Render reviews HTML
function renderReviewsHTML(reviews) {
    if (!reviews || reviews.length === 0) {
        const noReviewsText = typeof t === 'function' ? t('noReviewsYet') : 'No reviews yet. Be the first to review this product!';
        return `
            <div class="no-reviews">
                <p>${noReviewsText}</p>
            </div>
        `;
    }

    const averageRating = calculateAverageRating(reviews);

    return `
        <div class="reviews-summary">
            <div class="average-rating">
                <div class="rating-number">${averageRating}</div>
                <div class="rating-stars-large">
                    ${renderStars(parseFloat(averageRating), true)}
                </div>
                <div class="rating-count">${typeof t === 'function' ? (reviews.length === 1 ? t('reviewsCountSingular').replace('{count}', reviews.length) : t('reviewsCountPlural').replace('{count}', reviews.length)) : `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}</div>
            </div>
        </div>

        <div class="reviews-list">
            ${reviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <div class="review-author">
                            <div class="author-avatar">${review.customer_name.charAt(0).toUpperCase()}</div>
                            <div class="author-info">
                                <div class="author-name">${escapeHtml(review.customer_name)}</div>
                                <div class="review-date">${formatDate(review.created_at)}</div>
                            </div>
                        </div>
                        <div class="review-rating">
                            ${renderStars(review.rating)}
                        </div>
                    </div>
                    <div class="review-text">
                        ${escapeHtml(review.review_text)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render star rating
function renderStars(rating, large = false) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const starClass = large ? 'star-large' : 'star';

    let html = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        html += `<span class="${starClass} star-full">★</span>`;
    }

    // Half star
    if (hasHalfStar) {
        html += `<span class="${starClass} star-half">★</span>`;
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        html += `<span class="${starClass} star-empty">★</span>`;
    }

    return html;
}

// Render rating input (for submitting reviews)
function renderRatingInput() {
    return `
        <div class="rating-input">
            <span class="rating-star" data-rating="1">★</span>
            <span class="rating-star" data-rating="2">★</span>
            <span class="rating-star" data-rating="3">★</span>
            <span class="rating-star" data-rating="4">★</span>
            <span class="rating-star" data-rating="5">★</span>
        </div>
    `;
}

// Handle rating input interaction
function initializeRatingInput() {
    const ratingStars = document.querySelectorAll('.rating-star');
    let selectedRating = 0;

    ratingStars.forEach(star => {
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });

        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            highlightStars(selectedRating);

            // Store selected rating
            const ratingInput = document.getElementById('reviewRatingValue');
            if (ratingInput) ratingInput.value = selectedRating;
        });
    });

    const ratingContainer = document.querySelector('.rating-input');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            if (selectedRating > 0) {
                highlightStars(selectedRating);
            } else {
                highlightStars(0);
            }
        });
    }

    function highlightStars(rating) {
        ratingStars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
}

// Show review form
function showReviewForm(productId, productName) {
    const writeReviewText = typeof t === 'function' ? t('writeReviewButton') : 'Write a Review';
    const forProductText = typeof t === 'function' ? t('writeReviewFor').replace('{productName}', productName) : `for ${productName}`;
    const yourRatingText = typeof t === 'function' ? t('yourRatingLabel') : 'Your Rating *';
    const yourNameText = typeof t === 'function' ? t('yourNameLabel') : 'Your Name *';
    const yourEmailText = typeof t === 'function' ? t('yourEmailLabel') : 'Your Email *';
    const yourReviewText = typeof t === 'function' ? t('yourReviewLabel') : 'Your Review *';
    const submitReviewText = typeof t === 'function' ? t('submitReviewButton') : 'Submit Review';
    const reviewNoteText = typeof t === 'function' ? t('reviewNoteText') : 'Note: Your review will be reviewed by our team before being published.';

    const reviewFormHTML = `
        <div class="review-form-modal active" id="reviewFormModal">
            <div class="modal-overlay" onclick="closeReviewForm()"></div>
            <div class="review-form-content">
                <button class="modal-close" onclick="closeReviewForm()">&times;</button>

                <h3>${writeReviewText}</h3>
                <p class="review-product-name">${forProductText}</p>

                <form id="reviewSubmitForm" onsubmit="handleReviewSubmit(event, ${productId}, '${productName}')">
                    <div class="form-group">
                        <label>${yourRatingText}</label>
                        ${renderRatingInput()}
                        <input type="hidden" id="reviewRatingValue" required>
                    </div>

                    <div class="form-group">
                        <label for="reviewName">${yourNameText}</label>
                        <input type="text" id="reviewName" required placeholder="John Doe">
                    </div>

                    <div class="form-group">
                        <label for="reviewEmail">${yourEmailText}</label>
                        <input type="email" id="reviewEmail" required placeholder="john@example.com">
                    </div>

                    <div class="form-group">
                        <label for="reviewText">${yourReviewText}</label>
                        <textarea id="reviewText" rows="5" required
                                  placeholder="Share your experience with this product..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary btn-full">
                        ${submitReviewText}
                    </button>

                    <p class="review-note">
                        ${reviewNoteText}
                    </p>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', reviewFormHTML);
    document.body.style.overflow = 'hidden';

    // Initialize rating input
    setTimeout(initializeRatingInput, 100);
}

// Close review form
function closeReviewForm() {
    const modal = document.getElementById('reviewFormModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

// Handle review form submission
async function handleReviewSubmit(e, productId, productName) {
    e.preventDefault();

    const rating = parseInt(document.getElementById('reviewRatingValue').value);
    const name = document.getElementById('reviewName').value;
    const email = document.getElementById('reviewEmail').value;
    const reviewText = document.getElementById('reviewText').value;

    if (!rating || rating < 1 || rating > 5) {
        showNotification(typeof t === 'function' ? t('pleaseSelectRating') : 'Please select a rating', 'error');
        return;
    }

    try {
        await submitReview(productId, productName, rating, reviewText, name, email);

        closeReviewForm();
        showNotification(typeof t === 'function' ? t('reviewSubmittedSuccess') : 'Thank you! Your review has been submitted and is pending approval.', 'success');

        // Reload reviews in product detail if open
        const reviewsSection = document.getElementById('productReviews');
        if (reviewsSection) {
            const reviews = await loadProductReviews(productId);
            reviewsSection.innerHTML = renderReviewsHTML(reviews);
        }

    } catch (error) {
        showNotification(typeof t === 'function' ? t('reviewSubmitError') : 'Failed to submit review. Please try again.', 'error');
    }
}

// Add reviews section to product detail modal
async function addReviewsToProductDetail(productId, productName) {
    const reviews = await loadProductReviews(productId);
    const averageRating = calculateAverageRating(reviews);
    const customerReviewsText = typeof t === 'function' ? t('customerReviews') : 'Customer Reviews';
    const writeReviewText = typeof t === 'function' ? t('writeReviewButton') : 'Write a Review';

    return `
        <div class="product-reviews-section">
            <div class="reviews-header">
                <h3>${customerReviewsText}</h3>
                <button class="btn btn-outline" onclick="showReviewForm(${productId}, '${escapeHtml(productName)}')">
                    ${writeReviewText}
                </button>
            </div>

            <div id="productReviews">
                ${renderReviewsHTML(reviews)}
            </div>
        </div>
    `;
}

// Get average rating for product card display
async function getProductRating(productId) {
    const reviews = await loadProductReviews(productId);
    return calculateAverageRating(reviews);
}

// Helper: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally
window.showReviewForm = showReviewForm;
window.closeReviewForm = closeReviewForm;
window.handleReviewSubmit = handleReviewSubmit;
window.loadProductReviews = loadProductReviews;
window.addReviewsToProductDetail = addReviewsToProductDetail;
window.renderStars = renderStars;
window.getProductRating = getProductRating;
