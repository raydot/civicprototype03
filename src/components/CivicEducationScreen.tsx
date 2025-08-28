import { ChevronLeft, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import { ImageWithFallback } from './figma/ImageWithFallback';
import censorshipImage from 'figma:asset/46446fdc3152d90123f142373dc1fd7a23d58139.png';
import raisedHandsImage from 'figma:asset/ab1e631d2e6fba214399e0fd4451c4dcc2056b7f.png';
import anonymousMaskImage from 'figma:asset/2139f85e4de56d3062229c6c429c281aed31f976.png';
import pressNewsImage from 'figma:asset/4530e768736bd19ca5b46c2a52aa9313101dc50b.png';

interface CivicEducationScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
  onCategoryClick: (categoryId: string) => void;
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

const educationCategories = [
  {
    id: 'speech-in-schools',
    title: 'Speech in Schools',
    image: raisedHandsImage,
    resourceCount: 2
  },
  {
    id: 'press-freedom-media',
    title: 'Press Freedom & Media Literacy',
    image: pressNewsImage,
    resourceCount: 2
  },
  {
    id: 'digital-platforms-censorship',
    title: 'Censorship & Digital Platforms',
    image: anonymousMaskImage,
    resourceCount: 2
  },
  {
    id: 'free-speech-censorship',
    title: 'Free Speech & Censorship',
    image: censorshipImage,
    resourceCount: 2
  }
];

export default function CivicEducationScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare,
  onCategoryClick,
  onToggleSave,
  isRecommendationSaved,
  savedItemsCount
}: CivicEducationScreenProps) {
  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Civics Education</h1>
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
          <p className="text-gray-600 mb-6 text-center">
            Learn about the issues that matter to you with trusted educational resources
          </p>

          {/* Education Categories List */}
          <div className="space-y-4">
            {educationCategories.map((category) => {
              // Check if any resources in this category are saved
              const categoryResourceIds = [
                `civic-education-annenberg-speech-limits`,
                `civic-education-constitution-center-speech`,
                `civic-education-annenberg-student-speech`,
                `civic-education-civic-education-speech-democracy`,
                `civic-education-annenberg-press-freedom`,
                `civic-education-khan-academy-press-overview`,
                `civic-education-khan-academy-online-hate-speech`,
                `civic-education-constitution-center-campus-online`
              ];
              
              const hasAnySavedResource = categoryResourceIds.some(id => 
                isRecommendationSaved?.(id) || false
              );
              
              return (
                <div key={category.id} className="relative">
                  <button
                    onClick={() => onCategoryClick(category.id)}
                    className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow text-left"
                  >
                    {/* Image */}
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <ImageWithFallback
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-900 leading-tight flex-1">
                          {category.title}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                          {category.resourceCount} resources
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Heart Icon - Only show if category has saved resources */}
                  {hasAnySavedResource && (
                    <div className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full shadow-sm">
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
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
        currentScreen="civic-education"
      />
    </div>
  );
}