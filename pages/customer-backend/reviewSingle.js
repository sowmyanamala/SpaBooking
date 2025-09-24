import React, { useState } from 'react';
import CustomerReview from '../../components/customerReview';
import modelStyle from '../../styles/model.module.css';
import axios from 'axios';

function ReviewSingle({ reviewData }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleReviewSubmitted = (reviewData) => {
    setReviewSubmitted(true);
    setShowReviewForm(false);
    // You can add additional logic here like refreshing the parent component
  };

  return (
    <div className={modelStyle.reviewItem}>
      <div className={modelStyle.reviewHeader}>
        <h4>Review for {reviewData?.model_name || 'Andrea Sherri Parton'}</h4>
        <p>Service Date: {reviewData?.service_date || 'Recent'}</p>
      </div>

      {!reviewSubmitted && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className={modelStyle.reviewButton}
        >
          Write Review
        </button>
      )}

      {showReviewForm && (
        <CustomerReview
          orderId={reviewData?.order_id}
          modelId={reviewData?.model_id}
          modelName={reviewData?.model_name || 'Andrea Sherri Parton'}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {reviewSubmitted && (
        <div className={modelStyle.reviewCompleted}>
          ✅ Review completed - Thank you for your feedback!
        </div>
      )}
    </div>
  );
}

function ReviewSingle() {

  return (
    <tr>
      <td>
        <form>
          {/* Form content would go here */}
        </form>
      </td>
      <td>Provide Review to Andrea Sherri Parton</td>
    </tr>
  );
}

export default ReviewSingle;



