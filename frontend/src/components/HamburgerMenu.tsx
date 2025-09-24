import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HamburgerMenuProps {
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare?: () => void;
  savedItemsCount?: number;
}

export default function HamburgerMenu({ 
  onNavToConcerns, 
  onNavToRecommendations,
  onNavToSaveShare,
  savedItemsCount = 0
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
            <div className="py-2">
              <button 
                onClick={() => handleMenuClick(onNavToConcerns)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit Concerns
              </button>
              <button 
                onClick={() => handleMenuClick(onNavToRecommendations)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Recommendations
              </button>
              {onNavToSaveShare && savedItemsCount > 0 && (
                <button 
                  onClick={() => handleMenuClick(onNavToSaveShare)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  Save/Share
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    {savedItemsCount}
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}