import React, { useState, useEffect } from 'react';
import { Check, X, Flag, Star } from 'lucide-react';

const ReviewModeration = ({ showToast }) => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    // Mock data - replace with API call
    setReviews([
      {
        id: 1,
        hotelName: 'Grand Hotel',
        userName: 'John Doe',
        rating: 5,
        comment: 'Excellent service and clean rooms!',
        status: 'pending',
        date: new Date()
      }
    ]);
  };

  const handleAction = async (reviewId, action) => {
    // API call to approve/reject/flag review
    showToast?.(`Review ${action}`, 'success');
    loadReviews();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Review Moderation</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">{review.hotelName}</div>
                <div className="text-sm text-gray-600">{review.userName}</div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm mb-3">{review.comment}</p>
            {review.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(review.id, 'approved')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  <Check size={14} className="inline mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction(review.id, 'rejected')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  <X size={14} className="inline mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => handleAction(review.id, 'flagged')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  <Flag size={14} className="inline mr-1" />
                  Flag
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewModeration;
