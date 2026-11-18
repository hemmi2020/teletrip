import React from "react";
import { Star } from "lucide-react";

const TestimonialCard = ({ name, image, rating, text }) => {
  return (
    <div className="bento-card bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-48 flex flex-col">
      <div className="flex items-center mb-4">
        <img src={image} alt={name} className="w-12 h-12 rounded-full mr-4 object-cover" />
        <div>
          <h3 className="font-bold text-gray-900">{name}</h3>
          <div className="flex text-amber-500 gap-0.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-600 italic flex-1 overflow-hidden">"{text}"</p>
    </div>
  );
};

export default TestimonialCard;
