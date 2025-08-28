import { ChevronLeft, ExternalLink, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import PollingStationButton from './PollingStationButton';

interface BallotMeasureDetailScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare?: () => void;
  onViewBallotpedia: () => void;
  measureId: string;
  onToggleSave?: (recommendation: SavedRecommendation) => void;
  isRecommendationSaved?: (id: string) => boolean;
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

export default function BallotMeasureDetailScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare,
  onViewBallotpedia,
  measureId,
  onToggleSave,
  isRecommendationSaved
}: BallotMeasureDetailScreenProps) {
  
  const getMeasureData = (id: string) => {
    if (id === 'transparency-initiative') {
      return {
        title: 'Government Transparency Initiative',
        subtitle: 'Executive Branch & Legislature Public Information Requests',
        description: 'This constitutional amendment would extend the Freedom of Information Act to include the executive branch and State Legislature, requiring government officials to respond to public information requests.',
        matchReason: 'Government Accountability',
        matchExplanation: 'This directly addresses your concern about political corruption by requiring transparency from government officials and making their records publicly accessible.',
        impact: 'Would increase government accountability and reduce opportunities for corruption by ensuring citizens can access information about government decision-making.'
      };
    } else {
      return {
        title: 'National Popular Vote Compact',
        subtitle: 'Presidential Elections by Popular Vote',
        description: 'Michigan would join the National Popular Vote Interstate Compact, ensuring the presidential candidate who receives the most votes nationwide wins the presidency.',
        matchReason: 'Elections and Campaigns',
        matchExplanation: 'This addresses your concern about political corruption by ensuring every vote counts equally and the candidate with the most support nationwide becomes president.',
        impact: 'Would make every vote count equally in presidential elections and encourage candidates to campaign nationwide rather than focusing only on swing states.'
      };
    }
  };

  const measureData = getMeasureData(measureId);

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Ballot Measure</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900 flex-1 pr-4">
              {measureData.title}
            </h2>
            {/* Heart Save Button */}
            {onToggleSave && isRecommendationSaved && (
              <button
                onClick={() => onToggleSave({
                  id: `ballot-${measureId}`,
                  category: 'Ballot Measures',
                  title: measureData.title,
                  description: measureData.subtitle
                })}
                className="p-2 hover:bg-gray-100 rounded-full transition-all flex-shrink-0"
              >
                <Heart 
                  className={`w-6 h-6 ${
                    isRecommendationSaved(`ballot-${measureId}`) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-400 hover:text-red-400'
                  }`} 
                />
              </button>
            )}
          </div>
          <p className="text-gray-600">{measureData.subtitle}</p>
        </div>

        {/* Why This Matches */}
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-medium text-orange-900 mb-2">
            Why this matches: {measureData.matchReason}
          </h3>
          <p className="text-sm text-orange-800 leading-relaxed">
            {measureData.matchExplanation}
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">What this initiative does</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            {measureData.description}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {measureData.impact}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={onViewBallotpedia}
            className="w-full bg-white border border-gray-300 text-gray-900 py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            View Full Details on Ballotpedia
          </button>
          
          <PollingStationButton />
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">About Voting on This Measure</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            This ballot initiative will appear on your ballot in the November 2024 election. 
            Your vote will help determine whether this becomes law in Michigan.
          </p>
        </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      {onNavToConcerns && onNavToMappings && onNavToRecommendations && onNavToSaveShare && (
        <BottomNavigation 
          onNavToConcerns={onNavToConcerns}
          onNavToMappings={onNavToMappings}
          onNavToRecommendations={onNavToRecommendations}
          onNavToSaveShare={onNavToSaveShare}
          currentScreen="ballot-measure-detail"
        />
      )}
    </div>
  );
}