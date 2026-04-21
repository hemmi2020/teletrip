import React, { useState, useEffect } from 'react';
import { Hotel, Car, Compass, MapPin, Shield, Globe, CreditCard, Star } from 'lucide-react';
import logo from '../images/Telitrip-Logo.png';

const serviceSteps = {
  hotels: [
    { icon: Globe, text: 'Connecting to 250,000+ properties worldwide', color: '#2563eb' },
    { icon: MapPin, text: 'Searching hotels in your destination', color: '#059669' },
    { icon: Star, text: 'Comparing rates and availability', color: '#f59e0b' },
    { icon: Shield, text: 'Verifying cancellation policies', color: '#7c3aed' },
    { icon: CreditCard, text: 'Calculating best prices for you', color: '#2563eb' },
  ],
  activities: [
    { icon: Compass, text: 'Discovering local experiences', color: '#7c3aed' },
    { icon: MapPin, text: 'Finding activities in your destination', color: '#059669' },
    { icon: Star, text: 'Checking availability and schedules', color: '#f59e0b' },
    { icon: CreditCard, text: 'Fetching the best deals', color: '#2563eb' },
  ],
  transfers: [
    { icon: Car, text: 'Searching available vehicles', color: '#059669' },
    { icon: MapPin, text: 'Calculating routes and distances', color: '#2563eb' },
    { icon: Shield, text: 'Verifying pickup details', color: '#7c3aed' },
    { icon: CreditCard, text: 'Comparing transfer options', color: '#f59e0b' },
  ],
};

const SearchLoadingScreen = ({ type = 'hotels' }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = serviceSteps[type] || serviceSteps.hotels;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % steps.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [steps.length]);

  const currentStep = steps[stepIndex];
  const Icon = currentStep.icon;
  const MainIcon = type === 'activities' ? Compass : type === 'transfers' ? Car : Hotel;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gray-50">
      <img src={logo} alt="Telitrip" className="h-10 mb-10 opacity-70" />

      {/* Animated icon ring */}
      <div className="relative w-28 h-28 mb-8">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent"
          style={{
            borderTopColor: currentStep.color,
            borderRightColor: currentStep.color,
            animation: 'spin 1.2s linear infinite',
          }}
        />
        {/* Inner pulsing circle with icon */}
        <div
          className="absolute inset-3 rounded-full flex items-center justify-center"
          style={{
            background: `${currentStep.color}10`,
            animation: 'pulse-soft 2.4s ease-in-out infinite',
          }}
        >
          <MainIcon
            className="w-10 h-10 transition-colors duration-500"
            style={{ color: currentStep.color, strokeWidth: 1.5 }}
          />
        </div>
        {/* Orbiting dot */}
        <div
          className="absolute w-3 h-3 rounded-full shadow-sm"
          style={{
            background: currentStep.color,
            top: '-6px',
            left: '50%',
            marginLeft: '-6px',
            animation: 'orbit 2.4s linear infinite',
            transformOrigin: '6px 70px',
          }}
        />
      </div>

      {/* Step indicator with fade transition */}
      <div className="h-14 flex flex-col items-center justify-center">
        <div
          key={stepIndex}
          className="flex items-center gap-2.5 mb-2"
          style={{ animation: 'fadeUp 0.4s ease-out' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${currentStep.color}15` }}
          >
            <Icon className="w-4 h-4" style={{ color: currentStep.color }} />
          </div>
          <p className="text-sm text-gray-600 font-medium">{currentStep.text}</p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === stepIndex ? 24 : 6,
              height: 6,
              background: i === stepIndex ? currentStep.color : '#e5e7eb',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes orbit {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SearchLoadingScreen;
