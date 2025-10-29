import React, { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';

// Add this component to your HotelDetails.jsx file
const HotelImageGallery = ({ hotel }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extract and format images from hotel data
  const getFormattedImages = () => {
    if (!hotel?.images || hotel.images.length === 0) {
      // Fallback to thumbnail if no images array
      return hotel?.thumbnail ? [hotel.thumbnail] : [];
    }

    // Format images from Hotelbeds API response
    return hotel.images.map(img => {
      // Images come in this format from your backend:
      // { path: "00/001234/001234a_hb_ro_001.jpg", typeCode: "GEN", ... }
      if (typeof img === 'string') {
        return img; // Already formatted URL
      }
      if (img.path) {
        return `https://photos.hotelbeds.com/giata/original/${img.path}`;
      }
      return null;
    }).filter(Boolean);
  };

  const images = getFormattedImages();

  // If no images, show fallback
  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg mb-8">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Full screen gallery modal - Bedsonline style with proper overlay
  if (showAllPhotos) {

    return (
      <>
        {/* Backdrop Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={() => setShowAllPhotos(false)}
        />

        {/* Modal Container */}
        <div className="fixed pt-25 inset-0 z-50 flex items-center justify-center p-4 ">
          <div 
            className="bg-white w-[80%] rounded-lg shadow-2xl  max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4  flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{hotel.name}</h2>
              <p className="text-sm text-gray-500">Photo gallery</p>
            </div>
          </div>
          <button
            onClick={() => setShowAllPhotos(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Large Preview Image */}
            <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
              <div className="relative h-[500px] bg-gray-100">
                <img
                  src={images[currentImageIndex]}
                  alt={`${hotel.name} - Photo ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                  }}
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className="relative cursor-pointer rounded-lg overflow-hidden transition-all hover:ring-2 hover:ring-gray-300"
                >
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={img}
                      alt={`${hotel.name} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                      }}
                    />
                  </div>
                  {currentImageIndex === index && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
      </>
    );
  }

  // Main gallery layout
  const displayImages = images.slice(0, 5);

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-[400px] lg:h-[500px]">
        {/* Large image on the left */}
        <div className="relative h-[300px] lg:h-full">
          <img
            src={displayImages[0]}
            alt={`${hotel.name} - Main view`}
            className="w-full h-full object-cover rounded-l-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowAllPhotos(true)}
            onError={(e) => {
              e.target.src = hotel.thumbnail || "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
            }}
          />
        </div>

        {/* Right side grid - 4 images in 2x2 */}
        <div className="hidden lg:grid grid-cols-2 gap-2">
          {displayImages.slice(1, 5).map((img, index) => (
            <div
              key={index}
              className="relative h-full cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={img}
                alt={`${hotel.name} - View ${index + 2}`}
                className={`w-full h-full object-cover group-hover:opacity-90 transition-opacity ${
                  index === 1 ? 'rounded-tr-lg' : ''
                } ${index === 3 ? 'rounded-br-lg' : ''}`}
                onError={(e) => {
                  e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                }}
              />
              
              {/* "See all photos" button on last image */}
              {index === 3 && (
                <div className="absolute inset-0 bg-black bg-opacity-40 hover:bg-opacity-50 transition-all flex items-center justify-center rounded-br-lg">
                  <button className="text-white font-medium text-base px-6 py-3 border-2 border-white rounded-lg hover:bg-white hover:text-black transition-all flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    See all {images.length} photos
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: 3 images in a row */}
        <div className="grid lg:hidden grid-cols-3 gap-2 h-[100px]">
          {displayImages.slice(1, 4).map((img, index) => (
            <div
              key={index}
              className="relative cursor-pointer"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={img}
                alt={`${hotel.name} - View ${index + 2}`}
                className="w-full h-full object-cover rounded hover:opacity-90 transition-opacity"
                onError={(e) => {
                  e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                }}
              />
              
              {index === 2 && images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded">
                  <button className="text-white text-xs font-medium px-2 py-1 border border-white rounded flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    +{images.length - 4}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default HotelImageGallery;