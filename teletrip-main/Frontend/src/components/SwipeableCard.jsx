import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';

const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight, leftAction, rightAction }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(currentX) > 100) {
      if (currentX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (currentX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    setCurrentX(0);
    setIsSwiping(false);
  };

  return (
    <div className="relative overflow-hidden">
      {currentX < -50 && leftAction && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-white" />
        </div>
      )}
      {currentX > 50 && rightAction && (
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-green-500 flex items-center justify-center">
          <Check className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        style={{ transform: `translateX(${currentX}px)` }}
        className="transition-transform bg-white"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
