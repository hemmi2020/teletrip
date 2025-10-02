// ReviewsModal.jsx - FIXED VERSION
import React from 'react';
import { X } from 'lucide-react';

const ReviewsModal = ({ isOpen, onClose, hotelName, reviewData }) => {
  if (!isOpen || !reviewData) return null;

  // ✅ FIX: Safely extract and convert rating to number
  const rating = Number(reviewData.rating) || 0;
  const numReviews = Number(reviewData.numReviews) || 0;
  const rankingData = reviewData.rankingData;
  const reviews = reviewData.reviews || [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed  inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed pt-25 inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img 
                  src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
                  alt="TripAdvisor"
                  className="h-6"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{hotelName}</h2>
              <p className="text-sm text-gray-600">Traveler reviews brought to you by Tripadvisor</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 py-6">
            {/* Rating Overview */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* TripAdvisor Circles */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${
                          i < Math.floor(rating) ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{rating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">{numReviews.toLocaleString()} Reviews</div>
                  </div>
                </div>

                {rankingData && rankingData.ranking_string && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">
                      Ranked #{rankingData.ranking_string}
                    </div>
                  </div>
                )}
              </div>

              {/* Traveler Rating Breakdown */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-sm font-semibold mb-2">Value</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full ${i < 4 ? 'bg-green-600' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Rooms</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full ${i < 4 ? 'bg-green-600' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Cleanliness</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full ${i < 4 ? 'bg-green-600' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Service</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full ${i < 4 ? 'bg-green-600' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div>
              <h3 className="text-xl font-bold mb-4">Recent Reviews:</h3>
              
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, idx) => {
                    // ✅ FIX: Safely convert review rating to number
                    const reviewRating = Number(review.rating) || 0;
                    
                    return (
                      <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {review.user?.username || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {review.published_date ? new Date(review.published_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                }) : 'Date unknown'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-5 h-5 rounded-full ${
                                  i < reviewRating ? 'bg-green-600' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-bold text-lg mb-2 text-gray-900">{review.title}</h4>
                        )}
                        
                        <p className="text-gray-700 leading-relaxed mb-2">
                          {review.text || 'No review text available'}
                        </p>
                        
                        {review.trip_type && (
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-gray-600">
                              Trip type: <span className="font-normal">{review.trip_type}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews available</p>
              )}

              {/* View More on TripAdvisor */}
              {reviews && reviews.length > 0 && numReviews > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => window.open('https://www.tripadvisor.com', '_blank')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View all {numReviews.toLocaleString()} reviews on TripAdvisor
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewsModal;