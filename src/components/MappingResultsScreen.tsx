import { Button } from "./ui/button";
import { ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import BottomNavigation from './BottomNavigation';

interface MappingResultsScreenProps {
  onBack: () => void;
  zipCode: string;
  priorities: string[];
  onPriorityClick: () => void;
  isFirstPriorityCorrected: boolean;
  onGetRecommendations: () => void;
  onNavToConcerns?: () => void;
  onNavToRecommendations?: () => void;
  onNavToSaveShare?: () => void;
  selectedPolicyOption?: string;
  onPriorityConfirm?: (priorityIndex: number) => void;
  onPriorityReject?: (priorityIndex: number) => void;
}

// Demo function to convert ZIP code to city/state
const getCityStateFromZip = (zipCode: string) => {
  // Mock data for demo purposes
  const zipMappings: { [key: string]: string } = {
    '48104': 'Washtenaw County, Michigan',
    '48105': 'Washtenaw County, Michigan',
    '48106': 'Washtenaw County, Michigan',
    '48108': 'Washtenaw County, Michigan',
    '48109': 'Washtenaw County, Michigan',
    '48197': 'Wayne County, Michigan',
    '48198': 'Wayne County, Michigan'
  };
  
  return zipMappings[zipCode] || 'Your County, Michigan';
};

// Demo policy mappings for user concerns
const getPolicyMapping = (concern: string, index: number, isFirstPriorityCorrected: boolean, selectedOption?: string) => {
  const mappings = [
    isFirstPriorityCorrected ? (selectedOption || "Comprehensive Environmental Policy") : "EV Infrastructure Investment", // Shows corrected mapping after clarification
    "Free Speech & Expression",
    "Civil Liberties", 
    "Media & Censorship",
    "Government Transparency",
    "Education & Higher Learning"
  ];
  return mappings[index] || "General Policy";
};

// Policy definitions for each mapping
const getPolicyDefinition = (policyName: string) => {
  const definitions: { [key: string]: string } = {
    "EV Infrastructure Investment": "Policies related to electric vehicle charging stations, infrastructure development, and supporting EV adoption programs.",
    "Free Speech & Expression": "Legal protections and policies ensuring the right to express opinions, ideas, and beliefs without government interference or censorship.",
    "Civil Liberties": "Fundamental rights and freedoms protected by the Constitution, including privacy rights, due process, and individual autonomy.",
    "Media & Censorship": "Policies governing content moderation, platform regulation, and the balance between free expression and harmful content online.",
    "Government Transparency": "Policies requiring open access to government information, ethical conduct standards, and anti-corruption measures.",
    "Education & Higher Learning": "Policies affecting educational funding, student financial aid, college affordability, and access to higher education.",
    "Comprehensive Environmental Policy": "Broad environmental initiatives including renewable energy, conservation, pollution control, and sustainability programs."
  };
  return definitions[policyName] || "Policy-related initiatives and programs in this area.";
};

export default function MappingResultsScreen({ 
  onBack, 
  zipCode, 
  priorities, 
  onPriorityClick, 
  isFirstPriorityCorrected, 
  onGetRecommendations, 
  onNavToConcerns, 
  onNavToRecommendations, 
  onNavToSaveShare, 
  selectedPolicyOption,
  onPriorityConfirm,
  onPriorityReject
}: MappingResultsScreenProps) {
  
  const handlePriorityConfirm = (index: number) => {
    if (onPriorityConfirm) {
      onPriorityConfirm(index);
    }
  };

  const handlePriorityReject = (index: number) => {
    if (onPriorityReject) {
      onPriorityReject(index);
    }
  };

  const handleNavToMappings = () => {
    // Already on mappings screen, do nothing
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="p-1 h-auto hover:bg-transparent -ml-1"
        >
          <ChevronLeft size={20} className="text-black" />
        </Button>
        <h1 className="text-lg font-medium text-black">Policy Mappings</h1>
        <div className="w-8 h-8"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 pb-24 md:pb-20 overflow-y-auto">
        <div className="px-4 pt-3">
          {/* Instructions */}
          <div className="mb-2 p-2.5 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-900 text-center font-medium">
              We've mapped your concerns to policy terms. Review each definition and confirm or edit.
            </p>
          </div>

          {/* Location Display */}
          <div className="mb-3 text-center">
            <div className="text-sm font-medium text-gray-900">
              {getCityStateFromZip(zipCode)} • {zipCode}
            </div>
          </div>

          <div className="space-y-3">
            {priorities.map((priority, index) => {
              const policyName = getPolicyMapping(priority, index, isFirstPriorityCorrected, selectedPolicyOption);
              const definition = getPolicyDefinition(policyName);
              const isCompleted = index === 0 && isFirstPriorityCorrected;
              const needsReview = index === 0 && !isFirstPriorityCorrected;
              
              return (
                <div 
                  key={index} 
                  className={`rounded-lg border-2 transition-all duration-200 ${
                    needsReview 
                      ? 'border-orange-200 bg-orange-50' 
                      : isCompleted
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Header section */}
                  <div className="p-3 border-b border-gray-200">
                    {/* Status indicator */}
                    {needsReview && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">
                          Please review this mapping
                        </span>
                      </div>
                    )}
                    
                    {isCompleted && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
                          Reviewed & confirmed
                        </span>
                      </div>
                    )}
                    
                    {/* Number badge and user concern */}
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        needsReview 
                          ? 'bg-orange-500 text-white' 
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-1">
                          Your concern:
                        </p>
                        <p className="text-sm font-medium text-black leading-snug">
                          "{priority}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Policy mapping section */}
                  <div className="p-3">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-medium text-black">{policyName}</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">✅</span>
                          <span className="text-xs font-medium text-gray-600">92% match</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {definition}
                      </p>
                    </div>

                    {/* Action buttons - only show for items that need review */}
                    {needsReview && (
                      <div>
                        <p className="text-sm font-medium text-black mb-3">Does this match your concern?</p>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handlePriorityConfirm(index)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <ThumbsUp size={16} />
                            Yes, that's right
                          </Button>
                          <Button 
                            onClick={() => handlePriorityReject(index)}
                            variant="outline"
                            className="flex-1 border-2 border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <ThumbsDown size={16} />
                            Not quite
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Completed state */}
                    {isCompleted && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <ThumbsUp size={16} />
                          <span className="text-sm font-medium">Confirmed</span>
                        </div>
                      </div>
                    )}

                    {/* Other priorities - no action needed */}
                    {!needsReview && !isCompleted && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500 italic">Ready for recommendations</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Get Recommendations button */}
          <div className="mt-6 pb-4">
            <Button 
              onClick={onGetRecommendations}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-base font-semibold"
              disabled={!isFirstPriorityCorrected} // Only enable after first priority is confirmed
            >
              {isFirstPriorityCorrected ? 'Get Recommendations' : 'Review mapping above to continue'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      {onNavToConcerns && onNavToRecommendations && onNavToSaveShare && (
        <BottomNavigation 
          onNavToConcerns={onNavToConcerns}
          onNavToMappings={handleNavToMappings}
          onNavToRecommendations={onNavToRecommendations}
          onNavToSaveShare={onNavToSaveShare}
          currentScreen="mapping-results"
        />
      )}
    </div>
  );
}