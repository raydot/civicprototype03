import { ArrowLeft, ChevronRight } from 'lucide-react';
import BottomNavigation from './BottomNavigation';

interface EmailOfficialsScreenProps {
  onBack: () => void;
  onConcernClick: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
}

export default function EmailOfficialsScreen({ 
  onBack, 
  onConcernClick,
  onNavToConcerns,
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare 
}: EmailOfficialsScreenProps) {
  const concerns = [
    { title: "Affordable Education", isClickable: true },
    { title: "Free Expression & Civil Liberties", isClickable: false },
    { title: "Anti-Censorship & Digital Rights", isClickable: false },
    { title: "Government Transparency & Anti-Corruption", isClickable: false }
  ];

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2>Email Officials</h2>
          </div>
          <div className="w-8 h-8"></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-6">
        <div className="mb-6">
          <h3 className="text-lg text-gray-900 mb-4 font-medium">Email your elected officials about:</h3>
        </div>

        <div className="space-y-3">
          {concerns.map((concern, index) => (
            <button
              key={index}
              onClick={concern.isClickable ? onConcernClick : undefined}
              className={`w-full p-4 rounded-lg border flex items-center justify-between transition-colors ${
                concern.isClickable 
                  ? 'border-orange-500 bg-orange-50 hover:bg-orange-100 cursor-pointer' 
                  : 'border-gray-200 cursor-not-allowed'
              }`}
              disabled={!concern.isClickable}
            >
              <span className={`text-left ${
                concern.isClickable ? 'text-orange-900 font-medium' : 'text-gray-600'
              }`}>{concern.title}</span>
              <ChevronRight className={`w-5 h-5 ${
                concern.isClickable ? 'text-orange-600' : 'text-gray-600'
              }`} />
            </button>
          ))}
        </div>


        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNavToConcerns={onNavToConcerns}
        onNavToMappings={onNavToMappings}
        onNavToRecommendations={onNavToRecommendations}
        onNavToSaveShare={onNavToSaveShare}
        currentScreen="email-officials"
      />
    </div>
  );
}