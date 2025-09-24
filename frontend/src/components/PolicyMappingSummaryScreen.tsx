import { Button } from "./ui/button";
import { ChevronLeft, Check, Sparkles } from 'lucide-react';

interface PolicyMappingSummaryScreenProps {
  onBack: () => void;
  onGetRecommendations: () => void;
  confirmedMappings: { [key: number]: string };
  originalPriorities: string[];
}

export default function PolicyMappingSummaryScreen({ 
  onBack, 
  onGetRecommendations, 
  confirmedMappings,
  originalPriorities 
}: PolicyMappingSummaryScreenProps) {

  // Generate policy mappings for each concern
  const getPolicyMapping = (priority: string, index: number) => {
    // If we have a confirmed mapping, use it
    if (confirmedMappings[index]) {
      return confirmedMappings[index];
    }

    // Otherwise generate the default mapping
    const lowerPriority = priority.toLowerCase();
    
    if (lowerPriority.includes('environment')) {
      return 'EV Infrastructure Investment';
    } else if (lowerPriority.includes('free speech') || lowerPriority.includes('speech')) {
      return 'First Amendment Protections';
    } else if (lowerPriority.includes('pronoun') || lowerPriority.includes('gender')) {
      return 'Gender Identity Rights';
    } else if (lowerPriority.includes('social media') || lowerPriority.includes('censorship')) {
      return 'Platform Content Policies';
    } else if (lowerPriority.includes('corruption') || lowerPriority.includes('transparency')) {
      return 'Government Accountability';
    } else if (lowerPriority.includes('college') || lowerPriority.includes('education')) {
      return 'Higher Education Affordability';
    }
    
    return 'General Policy Mapping';
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
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

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Success message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Check size={18} className="text-green-600" />
            <h3 className="font-medium text-green-800">Mapping Complete!</h3>
          </div>
          <p className="text-sm text-green-700">
            Your concerns have been successfully mapped to policy areas.
          </p>
        </div>

        {/* Confirmed mappings */}
        <div className="space-y-3 mb-8">
          {originalPriorities.map((priority, index) => {
            const policyMapping = getPolicyMapping(priority, index);
            
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-black">Concern #{index + 1}:</h4>
                      <Check size={14} className="text-green-600" />
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-3">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        "{priority}"
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Mapped to:</span>
                      <span className="text-sm font-medium text-black">{policyMapping}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ready message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-blue-600" />
            <h3 className="font-medium text-blue-800">Ready for Recommendations</h3>
          </div>
          <p className="text-sm text-blue-700">
            Based on your policy mappings, we can now show you personalized civic action recommendations.
          </p>
        </div>
      </div>

      {/* Get Recommendations button */}
      <div className="px-4 pb-6 border-t border-gray-100 pt-4 bg-white">
        <Button 
          onClick={onGetRecommendations}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          Get Recommendations!
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Discover candidates, ballot measures, petitions, and more
        </p>
      </div>
    </div>
  );
}