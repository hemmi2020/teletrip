import React, { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';

// Add this component to your HotelDetails.jsx file
const HotelImageGallery = ({ images, hotelName }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // If no images or less than 2 images, show a fallback
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // If only 1 image, show it full width
  if (images.length === 1) {
    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden">
        <img
          src={images[0]}
          alt={hotelName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
          }}
        />
      </div>
    );
  }

  // Full screen gallery modal
  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-black bg-opacity-90 py-4">
            <h2 className="text-white text-2xl font-semibold">
              All Photos ({images.length})
            </h2>
            <button
              onClick={() => setShowAllPhotos(false)}
              className="text-white hover:text-gray-300 text-3xl font-light w-10 h-10 flex items-center justify-center"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${hotelName} - Photo ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main gallery layout - 1 large image on left, 4 smaller on right
  const displayImages = images.slice(0, 5);

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-[400px] lg:h-[500px]">
        {/* Large image on the left */}
        <div className="relative h-[300px] lg:h-full">
          <img
            src={displayImages[0]}
            alt={`${hotelName} - Main view`}
            className="w-full h-full object-cover rounded-l-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowAllPhotos(true)}
            onError={(e) => {
              e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
            }}
          />
        </div>

        {/* Right side grid - 4 images in 2x2 layout */}
        <div className="hidden lg:grid grid-cols-2 gap-2">
          {displayImages.slice(1, 5).map((img, index) => (
            <div
              key={index}
              className="relative h-full cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={img}
                alt={`${hotelName} - View ${index + 2}`}
                className={`w-full h-full object-cover group-hover:opacity-90 transition-opacity ${
                  index === 1 ? 'rounded-tr-lg' : ''
                } ${index === 3 ? 'rounded-br-lg' : ''}`}
                onError={(e) => {
                  e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                }}
              />
              
              {/* "See all photos" button on the last image */}
              {index === 3 && images.length > 5 && (
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

        {/* Mobile: Show only 3 more images in a row */}
        <div className="grid lg:hidden grid-cols-3 gap-2 h-[100px]">
          {displayImages.slice(1, 4).map((img, index) => (
            <div
              key={index}
              className="relative cursor-pointer"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={img}
                alt={`${hotelName} - View ${index + 2}`}
                className="w-full h-full object-cover rounded hover:opacity-90 transition-opacity"
                onError={(e) => {
                  e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                }}
              />
              
              {/* "See all" on last mobile image */}
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