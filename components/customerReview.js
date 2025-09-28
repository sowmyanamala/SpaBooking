import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/customerReview.module.css';

const CustomerReview = ({ orderId, modelId, modelName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoverRating(starValue);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (reviewText.trim().length < 10) {
      setError('Please write at least 10 characters for your review');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const customerId = localStorage.getItem('customertoken');
      const reviewData = {
        customer_id: customerId,
        model_id: modelId,
        order_id: orderId,
        rating: rating,
        review_text: reviewText,
        created_at: new Date().toISOString()
      };

      const response = await axios.post('https://tsm.spagram.com/api/submit-review.php', reviewData);
      
      if (response.data.success) {
        setSuccess(true);
        setReviewText('');
        setRating(0);
        if (onReviewSubmitted) {
          onReviewSubmitted(reviewData);
        }
      } else {
        setError(response.data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${
              star <= (hoverRating || rating) ? styles.starFilled : styles.starEmpty
            }`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  if (success) {
    return (
      <div className={styles.successMessage}>
        <h3>✅ Review Submitted Successfully!</h3>
        <p>Thank you for your feedback about {modelName}</p>
      </div>
    );
  }

  return (
    <div className={styles.reviewContainer}>
      <h3>Rate Your Experience with {modelName}</h3>
      
      <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
        <div className={styles.ratingSection}>
          <label>Your Rating:</label>
          <StarRating />
          <span className={styles.ratingText}>
            {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
          </span>
        </div>

        <div className={styles.textSection}>
          <label htmlFor="reviewText">Your Review:</label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this therapist..."
            rows={4}
            className={styles.reviewTextarea}
            maxLength={500}
          />
          <small className={styles.charCount}>
            {reviewText.length}/500 characters
          </small>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button 
          type="submit" 
          disabled={isSubmitting || rating === 0}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default CustomerReview;