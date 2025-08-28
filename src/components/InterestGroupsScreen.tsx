import { ChevronLeft, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import { ImageWithFallback } from './figma/ImageWithFallback';
import acluImage from 'figma:asset/89fc84822435d7a813176901195f92e4e486a03a.png';
import nrdcImage from 'figma:asset/3ac5f368cc3c84212784a1cc83afed25037a69d4.png';
import educationTrustImage from 'figma:asset/6d80c6ea5453a84bccdac04f06d66889524ef932.png';

interface InterestGroupsScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
  onInterestGroupClick: (groupId: string) => void;
  onToggleSave?: (recommendation: SavedRecommendation) => void;
  isRecommendationSaved?: (id: string) => boolean;
  savedItemsCount?: number;
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

const interestGroups = [
  {
    id: 'aclu',
    title: 'American Civil Liberties Union',
    image: acluImage
  },
  {
    id: 'nrdc',
    title: 'Natural Resources Defense Council',
    image: nrdcImage
  },
  {
    id: 'education-trust',
    title: 'Education Trust',
    image: educationTrustImage
  }
];

export default function InterestGroupsScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare,
  onInterestGroupClick,
  onToggleSave,
  isRecommendationSaved,
  savedItemsCount
}: InterestGroupsScreenProps) {
  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Interest Groups</h1>
        <div className="w-10 h-10 flex items-center justify-center">
          {savedItemsCount && savedItemsCount > 0 && (
            <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              {savedItemsCount}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-20">
        <div className="p-4">
          <p className="text-lg text-gray-900 mb-6 text-center font-medium">
            Connect with organizations
          </p>

          {/* Interest Groups List */}
          <div className="space-y-4">
            {interestGroups.map((group) => {
              const savedId = `interest-group-${group.id}`;
              const isSaved = isRecommendationSaved?.(savedId) || false;
              
              return (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => onInterestGroupClick(group.id)}
                    className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow text-left"
                  >
                    {/* Image */}
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <ImageWithFallback
                        src={group.image}
                        alt={group.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 leading-tight">
                        {group.title}
                      </h3>
                    </div>
                  </button>

                  {/* Heart Icon - Only show if saved */}
                  {isSaved && onToggleSave && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave({
                          id: savedId,
                          category: 'Interest Groups',
                          title: group.title
                        });
                      }}
                      className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNavToConcerns={onNavToConcerns}
        onNavToMappings={onNavToMappings}
        onNavToRecommendations={onNavToRecommendations}
        onNavToSaveShare={onNavToSaveShare}
        currentScreen="interest-groups"
      />
    </div>
  );
}