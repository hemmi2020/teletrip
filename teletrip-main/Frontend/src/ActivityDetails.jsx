import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useCart, SlideOutCart } from './components/CartSystem';
import { Loader2, MapPin, Clock, Users, ArrowLeft, Calendar, Star, Check, ShoppingCart } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';

const ActivityDetails = () => {
  const { activityCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        if (!from || !to) {
          throw new Error('Missing date parameters');
        }

        const response = await fetch(
          `${API_BASE_URL}/activities/detail/${activityCode}?from=${from}&to=${to}`
        );

        const data = await response.json();

        if (data.success && data.data) {
          setActivity(data.data);
        } else {
          throw new Error(data.error || 'Activity not available for selected dates');
        }
      } catch (err) {
        console.error('Activity details error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [activityCode, searchParams]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading details...</span>
        </div>
      </>
    );
  }

  if (error || !activity) {
    return (
      <>
        <Header />
        <div className="pt-20 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Not Available</h2>
            <p className="text-gray-600 mb-6">
              {error || 'This activity is not available for the selected dates or has been removed.'}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              ← Back to Search Results
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-16 container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Results
        </button>

        {/* Image Gallery */}
        {activity.images && activity.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 h-64 md:h-96">
            <div className="col-span-2 row-span-2">
              <img
                src={activity.images[0]}
                alt={activity.name}
                className="w-full h-full object-cover rounded-l-lg"
                onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'}
              />
            </div>
            {activity.images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="col-span-1 hidden md:block">
                <img
                  src={img}
                  alt={`${activity.name} ${idx + 2}`}
                  className={`w-full h-full object-cover ${idx === 1 ? 'rounded-tr-lg' : idx === 3 ? 'rounded-br-lg' : ''}`}
                  onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'}
                />
              </div>
            ))}
          </div>
        )}

        {/* Activity Info */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{activity.name}</h1>

          {activity.location?.startPoints?.[0]?.meetingPoint && (
            <div className="flex items-start text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Meeting Point:</p>
                <p>{activity.location.startPoints[0].meetingPoint.description}</p>
                {activity.location.startPoints[0].meetingPoint.address && (
                  <p className="text-sm">{activity.location.startPoints[0].meetingPoint.address}</p>
                )}
              </div>
            </div>
          )}

          {activity.duration && (
            <div className="flex items-center text-gray-600 mb-4">
              <Clock className="w-5 h-5 mr-2" />
              <span>Duration: {activity.duration}</span>
            </div>
          )}

          {activity.summary && (
            <p className="text-gray-700 mb-4 italic" dangerouslySetInnerHTML={{ __html: activity.summary }} />
          )}
          {activity.description && (
            <div className="text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: activity.description }} />
          )}

          {activity.highlights && activity.highlights.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Highlights</h2>
              <ul className="space-y-2">
                {activity.highlights.map((h, i) => (
                  <li key={i} className="flex items-start text-gray-600">
                    <Star className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activity.fullDescription && activity.fullDescription.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">What's Included</h2>
              {activity.fullDescription.map((group, idx) => (
                <div key={idx} className="mb-4">
                  {group.title && <h3 className="font-medium text-gray-800 mb-2">{group.title}</h3>}
                  {group.included && group.included.length > 0 && (
                    <ul className="space-y-2">
                      {group.included.map((f, i) => (
                        <li key={i} className="flex items-start text-gray-600">
                          <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {group.excluded && group.excluded.length > 0 && (
                    <ul className="space-y-2 mt-2">
                      {group.excluded.map((f, i) => (
                        <li key={i} className="flex items-start text-red-600">
                          <span className="mr-2">✗</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {activity.detailedInfo && activity.detailedInfo.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Additional Information</h2>
              <ul className="space-y-2">
                {activity.detailedInfo.map((info, i) => (
                  <li key={i} className="text-gray-600">{info}</li>
                ))}
              </ul>
            </div>
          )}

          {activity.guidingOptions && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Guide Information</h3>
              <p className="text-gray-700">Type: {activity.guidingOptions.guideType}</p>
              {activity.guidingOptions.maxGroupSize && (
                <p className="text-gray-700">Max Group Size: {activity.guidingOptions.maxGroupSize}</p>
              )}
            </div>
          )}

          {activity.redeemInfo && (
            <div className="mb-6 bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Redemption Info</h3>
              <p className="text-gray-700">Direct Entrance: {activity.redeemInfo.directEntrance ? 'Yes' : 'No'}</p>
              {activity.redeemInfo.comments && activity.redeemInfo.comments.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {activity.redeemInfo.comments.map((c, i) => (
                    <li key={i} className="text-gray-600 text-sm">{c.description}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Modalities */}
        {activity.modalities && activity.modalities.length > 0 && activity.modalities.some(m => m.pricing?.[0]?.amount) && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Available Options</h2>
            {activity.modalities.map((modality, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold">{modality.name}</h3>
                    {modality.duration && (
                      <p className="text-gray-600 mt-1">Duration: {modality.duration}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    {modality.pricing && modality.pricing.length > 0 && modality.pricing[0].amount ? (
                      <>
                        <div className="text-2xl font-bold text-blue-600">
                          {modality.pricing[0].currency} {parseFloat(modality.pricing[0].amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">per person</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Price on request</div>
                    )}
                  </div>
                </div>
                {modality.pricing?.[0]?.amount ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: `${activity.code}-${modality.code}`,
                        type: 'activity',
                        activityCode: activity.code,
                        modalityCode: modality.code,
                        name: activity.name,
                        modalityName: modality.name,
                        checkIn: searchParams.get('from'),
                        checkOut: searchParams.get('to'),
                        price: parseFloat(modality.pricing[0].amount),
                        currency: modality.pricing[0].currency,
                        thumbnail: activity.images?.[0]
                      });
                      setIsCartOpen(true);
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed font-semibold"
                  >
                    Contact for Price
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fallback: Show button if no valid modalities */}
        {(!activity.modalities || activity.modalities.length === 0 || !activity.modalities.some(m => m.pricing?.[0]?.amount)) && (() => {
          const urlPrice = searchParams.get('price');
          const urlCurrency = searchParams.get('currency');
          const adults = parseInt(searchParams.get('adults')) || 1;
          const pricePerPerson = urlPrice || activity.pricing?.amount || activity.modalities?.[0]?.pricing?.[0]?.amount;
          const totalPrice = parseFloat(pricePerPerson || 0) * adults;
          const currency = urlCurrency || activity.pricing?.currency || activity.modalities?.[0]?.pricing?.[0]?.currency || 'AED';
          
          return (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Standard Booking</h3>
                  <p className="text-sm text-gray-600 mt-1">{adults} {adults === 1 ? 'Person' : 'Persons'}</p>
                </div>
                <div className="text-right ml-4">
                  {pricePerPerson && parseFloat(pricePerPerson) > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-blue-600">
                        {currency} {totalPrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">{currency} {parseFloat(pricePerPerson).toFixed(2)} × {adults}</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Price on request</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  addToCart({
                    id: `${activity.code}-default`,
                    type: 'activity',
                    activityCode: activity.code,
                    modalityCode: activity.modalities?.[0]?.code || 'standard',
                    name: activity.name,
                    modalityName: activity.modalities?.[0]?.name || 'Standard Option',
                    checkIn: searchParams.get('from'),
                    checkOut: searchParams.get('to'),
                    price: totalPrice,
                    currency: currency,
                    thumbnail: activity.images?.[0],
                    adults: adults
                  });
                  setIsCartOpen(true);
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          );
        })()}

        {/* Old fallback with pricing - keeping for backward compatibility */}
        {false && (!activity.modalities || activity.modalities.length === 0) && activity.pricing?.amount && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">Standard Booking</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {activity.pricing.currency} {parseFloat(activity.pricing.amount).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">per person</div>
              </div>
            </div>
            <button
              onClick={() => {
                addToCart({
                  id: `${activity.code}-standard`,
                  type: 'activity',
                  activityCode: activity.code,
                  modalityCode: 'standard',
                  name: activity.name,
                  modalityName: 'Standard Option',
                  checkIn: searchParams.get('from'),
                  checkOut: searchParams.get('to'),
                  price: parseFloat(activity.pricing.amount),
                  currency: activity.pricing.currency,
                  thumbnail: activity.images?.[0]
                });
                setIsCartOpen(true);
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        )}

        {(!activity.modalities || activity.modalities.length === 0) && !activity.pricing?.amount && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">No booking options available. Please contact us for more information.</p>
          </div>
        )}
      </div>
      <Footer />
      <SlideOutCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          navigate('/checkout');
        }}
      />
    </>
  );
};

export default ActivityDetails;
