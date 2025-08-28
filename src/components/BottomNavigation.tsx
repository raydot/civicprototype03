import { Bookmark } from 'lucide-react';
import { ConcernsIcon, MappingsIcon, RecommendationsIcon } from './NavigationIcons';

interface BottomNavigationProps {
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
  currentScreen?: string;
}

export default function BottomNavigation({ 
  onNavToConcerns, 
  onNavToMappings, 
  onNavToRecommendations, 
  onNavToSaveShare,
  currentScreen 
}: BottomNavigationProps) {
  const navItems = [
    {
      id: 'concerns',
      label: 'Concerns',
      icon: ConcernsIcon,
      onClick: onNavToConcerns,
      isActive: currentScreen === 'priority-input' || currentScreen === 'concerns'
    },
    {
      id: 'mappings',
      label: 'Mappings',
      icon: MappingsIcon,
      onClick: onNavToMappings,
      isActive: currentScreen === 'mapping-results' || currentScreen === 'mappings'
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: RecommendationsIcon,
      onClick: onNavToRecommendations,
      isActive: currentScreen === 'recommendations' || currentScreen === 'candidates' || currentScreen?.includes('candidates') || currentScreen?.includes('email-') || currentScreen?.includes('ballot-') || currentScreen?.includes('petition') || currentScreen?.includes('interest-') || currentScreen?.includes('civic-education')
    },
    {
      id: 'save-share',
      label: 'Save/Share',
      icon: Bookmark,
      onClick: onNavToSaveShare,
      isActive: currentScreen === 'save-share'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 md:absolute">
      {/* Safe area padding for mobile devices */}
      <div className="px-4 py-3 pb-6 md:pb-3 flex justify-around items-center">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${
                item.isActive 
                  ? 'text-black' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {item.id === 'save-share' ? (
                <IconComponent className="w-5 h-5 mb-1" />
              ) : (
                <IconComponent className="w-5 h-5 mb-1" size={20} />
              )}
              <span className={`text-xs ${item.isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}