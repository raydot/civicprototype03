import { ChevronLeft, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import transparencyImage from 'figma:asset/79fb4a6546d29d3b2e44ea78637a6571365d3079.png';
import votingImage from 'figma:asset/5dd6b8bb49527eb024ba674b58076e6c260a2fc5.png';

interface BallotMeasuresScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
  onMeasureClick: (measureId: string) => void;
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

export default function BallotMeasuresScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare,
  onMeasureClick,
  onToggleSave,
  isRecommendationSaved,
  savedItemsCount
}: BallotMeasuresScreenProps) {
  const ballotMeasures = [
    {
      id: 'transparency-initiative',
      title: 'Government Transparency Initiative',
      image: transparencyImage
    },
    {
      id: 'popular-vote-compact',
      title: 'National Popular Vote Compact',
      image: votingImage
    }
  ];

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Ballot Measures</h1>
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
          Ballot measures that match your concerns
        </p>

        {/* Simple Cards - Image and Title Only */}
        <div className="space-y-4">
          {ballotMeasures.map((measure) => {
            const savedId = `ballot-${measure.id}`;
            const isSaved = isRecommendationSaved?.(savedId) || false;
            
            return (
              <div key={measure.id} className="relative">
                <button
                  onClick={() => onMeasureClick(measure.id)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left"
                >
                  {/* Image */}
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={measure.image} 
                      alt={measure.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Title */}
                  <div className="p-4">
                    <h3 className="text-gray-900 font-medium">{measure.title}</h3>
                  </div>
                </button>

                {/* Heart Icon - Only show if saved */}
                {isSaved && onToggleSave && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave({
                        id: savedId,
                        category: 'Ballot Measures',
                        title: measure.title
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
        currentScreen="ballot-measures"
      />
    </div>
  );
}