import { ChevronLeft, Share2, Heart, X } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import PollingStationButton from './PollingStationButton';

interface SaveShareScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
  savedRecommendations: SavedRecommendation[];
  onToggleSave: (recommendation: SavedRecommendation) => void;
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

export default function SaveShareScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToMappings, 
  onNavToRecommendations,
  onNavToSaveShare,
  savedRecommendations,
  onToggleSave
}: SaveShareScreenProps) {
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My VoterPrime Action Plan',
          text: 'Check out my personalized civic action recommendations from VoterPrime',
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support native share
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Group saved recommendations by category
  const groupedRecommendations = savedRecommendations.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SavedRecommendation[]>);

  const totalCount = savedRecommendations.length;
  const categoryCount = Object.keys(groupedRecommendations).length;

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Save & Share</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-20">
        <div className="p-4">
          {/* Summary Stats */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-medium text-gray-900 mb-3">Your Saved Recommendations</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900 mb-1">{totalCount}</div>
                <div className="text-sm text-gray-600">Saved Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900 mb-1">{categoryCount}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>

          {/* Saved Items */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Your Saved Items</h3>
            {totalCount === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No saved recommendations yet</p>
                <p className="text-sm text-gray-400">Use the ❤️ button on any recommendation to save it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(groupedRecommendations).map(([category, items]) => (
                  <div key={category} className="border border-gray-200 rounded-lg">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 text-sm flex items-center justify-between">
                        {category}
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                          {items.length} saved
                        </span>
                      </h4>
                    </div>
                    <div className="p-3 space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
                            {item.description && (
                              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => onToggleSave(item)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleNativeShare}
              disabled={totalCount === 0}
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Share2 className="w-5 h-5" />
              {totalCount === 0 ? 'Save items to share' : `Share ${totalCount} saved items`}
            </button>
            <PollingStationButton />
            <button 
              onClick={onNavToRecommendations}
              className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Recommendations
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNavToConcerns={onNavToConcerns}
        onNavToMappings={onNavToMappings}
        onNavToRecommendations={onNavToRecommendations}
        onNavToSaveShare={onNavToSaveShare}
        currentScreen="save-share"
      />
    </div>
  );
}