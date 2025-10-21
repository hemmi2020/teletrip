import React from 'react';
import ImageSlider from './ImageSlider';

const Accommodation = () => {
  return (
    <div className="px-4 py-12 md:py-16 bg-gray-50 text-center">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6 underline">Highlights</h1>
      <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed">
        Discover the finest accommodations tailored to provide you with the ultimate comfort and relaxation during your stay.
        Our rooms are designed with modern amenities and luxurious touches to ensure a memorable experience. Whether you are
        looking for a cozy retreat or a spacious suite, we offer a variety of options to suit your needs and preferences.
      </p>
      <ImageSlider />
    </div>
  );
};

export default Accommodation;
