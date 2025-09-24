import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import { getCityStateFromZip } from '../data/zipCodePrefixes';
import { policyMatchingService } from '../services/policyMatchingService';
import { PolicyMatch } from '../types/policy';
import zipCodePrefixes from '../data/zipCodePrefixes.json';

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

// Function to convert ZIP code to city/state using our comprehensive data
const getCityStateFromZip = (zipCode: string): string => {
  if (zipCode.length === 0) return 'Enter ZIP Code';
  
  // Try 3-digit prefix first
  if (zipCode.length >= 3) {
    const prefix = zipCode.substring(0, 3);
    const location = zipCodePrefixes[prefix as keyof typeof zipCodePrefixes];
    if (location) return location;
  }
  
  // Fallback to first digit for partial entries
  const firstDigit = zipCode[0];
  const fallbackMap: { [key: string]: string } = {
    '0': 'Boston, MA',
    '1': 'New York, NY', 
    '2': 'Philadelphia, PA',
    '3': 'Atlanta, GA',
    '4': 'Wall, South Dakota',
    '5': 'Dallas, TX',
    '6': 'Chicago, IL',
    '7': 'Kansas City, MO',
    '8': 'Denver, CO',
    '9': 'Los Angeles, CA'
  };
  
  return fallbackMap[firstDigit] || 'Unknown Location';
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
  
  // AI Policy Matching State
  const [aiMatches, setAiMatches] = useState<PolicyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track individual priority confirmation states
  const [priorityConfirmations, setPriorityConfirmations] = useState<{[index: number]: boolean}>({});
  
  // Fetch AI matches when priorities change
  useEffect(() => {
    const fetchMatches = async () => {
      if (priorities.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const matches: PolicyMatch[] = [];
        
        // Process each priority individually
        for (let i = 0; i < priorities.length; i++) {
          const priority = priorities[i];
          
          console.log(`🤖 Processing priority ${i + 1}/${priorities.length}: "${priority}"`);
          
          const response = await policyMatchingService.matchPolicies({
            userInput: priority,
            zipCode
          });
          
          matches.push(response.matches[0]);
          
          console.log(`✅ Priority ${i + 1} result:`, {
            input: priority,
            match: response.matches[0].name,
            confidence: response.matches[0].confidence
          });
          
          // Small delay between requests to respect throttling
          if (i < priorities.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        setAiMatches(matches);
        
        console.log('🎉 All priorities processed:', {
          total: matches.length,
          matches: matches.map(m => ({ name: m.name, confidence: m.confidence }))
        });
        
      } catch (err) {
        console.error('AI matching failed:', err);
        setError('Failed to analyze priorities');
        // Keep existing hardcoded behavior as fallback
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatches();
  }, [priorities, zipCode]);
  
  const handlePriorityConfirm = (index: number) => {
    // Mark this priority as confirmed
    setPriorityConfirmations(prev => ({
      ...prev,
      [index]: true
    }));
    
    console.log(`✅ Priority ${index + 1} confirmed:`, aiMatches[index]?.name);
    
    // Call parent handler if provided
    if (onPriorityConfirm) {
      onPriorityConfirm(index);
    }
  };

  const handlePriorityReject = (index: number) => {
    console.log(`👎 Priority ${index + 1} rejected:`, aiMatches[index]?.name);
    
    // Call parent handler if provided (this would navigate to PolicyEditScreen)
    if (onPriorityReject) {
      onPriorityReject(index);
    }
  };
  
  // Check if all priorities are confirmed
  const allPrioritiesConfirmed = priorities.length > 0 && 
    priorities.every((_, index) => priorityConfirmations[index] === true);

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

          {/* AI Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-3 mb-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-sm text-gray-600">Analyzing your priorities...</span>
            </div>
          )}

          {/* AI Error State */}
          {error && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
              <p className="text-sm text-yellow-800">
                {error} - Using demo data for now.
              </p>
            </div>
          )}

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
              
              // New logic: each priority can be confirmed individually
              const isConfirmed = priorityConfirmations[index] === true;
              const needsReview = !isConfirmed; // All unconfirmed priorities need review
              
              // Hide all priorities while AI is loading to prevent showing hardcoded data
              if (isLoading) {
                return null;
              }
              
              return (
                <div 
                  key={index} 
                  className={`rounded-lg border-2 transition-all duration-200 ${
                    isConfirmed
                      ? 'border-green-200 bg-green-50'
                      : 'border-orange-200 bg-orange-50'
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
                    
                    {isConfirmed && (
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
                        isConfirmed
                          ? 'bg-green-500 text-white'
                          : 'bg-orange-500 text-white'
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
                        <h3 className="text-base font-medium text-black">
                          {/* Use AI policy name if available, fallback to hardcoded */}
                          {aiMatches[index] ? aiMatches[index].name : policyName}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">✅</span>
                          <span className="text-xs font-medium text-gray-600">
                            {/* Use AI confidence if available, fallback to 92% */}
                            {aiMatches[index] ? `${aiMatches[index].confidence}% match` : '92% match'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {/* Use AI description if available, fallback to hardcoded */}
                        {aiMatches[index] ? aiMatches[index].description : definition}
                      </p>
                    </div>

                    {/* Action buttons - only show for items that need review */}
                    {needsReview && (
                      <div>
                        <p className="text-sm font-medium text-black mb-3">Does this match your concern?</p>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handlePriorityConfirm(index)}
                            variant="outline"
                            className="flex-1 border-2 border-green-500 text-green-600 bg-green-50 hover:bg-green-100 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
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

                    {/* Confirmed state */}
                    {isConfirmed && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <ThumbsUp size={16} />
                          <span className="text-sm font-medium">Confirmed</span>
                        </div>
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
              className={`w-full h-12 rounded-md text-base font-semibold transition-all ${
                allPrioritiesConfirmed 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!allPrioritiesConfirmed} // Only enable when ALL priorities are confirmed
            >
              {allPrioritiesConfirmed ? 'Get Recommendations' : 'Review all mappings to continue'}
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