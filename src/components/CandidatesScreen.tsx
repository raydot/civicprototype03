import { ChevronLeft, Landmark, Building2, Building, Home, GraduationCap, Map } from 'lucide-react';
import BottomNavigation from './BottomNavigation';

interface CandidatesScreenProps {
  onBack: () => void;
  onPOTUSClick: () => void;
  onSenateClick: () => void;
  onHouseClick: () => void;
  onStateHouseClick: () => void;
  onSchoolBoardClick: () => void;
  onCountyBoardClick: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
}

export default function CandidatesScreen({ 
  onBack, 
  onPOTUSClick, 
  onSenateClick, 
  onHouseClick, 
  onStateHouseClick, 
  onSchoolBoardClick, 
  onCountyBoardClick, 
  onNavToConcerns, 
  onNavToMappings, 
  onNavToRecommendations, 
  onNavToSaveShare 
}: CandidatesScreenProps) {
  const candidateCategories = [
    {
      id: 'potus',
      title: 'President',
      subtitle: 'POTUS',
      icon: Landmark,
      onClick: onPOTUSClick
    },
    {
      id: 'senate',
      title: 'U.S. Senate',
      subtitle: 'Michigan',
      icon: Building2,
      onClick: onSenateClick
    },
    {
      id: 'house',
      title: 'U.S. House',
      subtitle: 'District MI-6',
      icon: Building,
      onClick: onHouseClick
    },
    {
      id: 'state-house',
      title: 'State House',
      subtitle: 'District 23',
      icon: Home,
      onClick: onStateHouseClick
    },
    {
      id: 'school-board',
      title: 'School Board',
      subtitle: 'Ann Arbor Public Schools Zone 2',
      icon: GraduationCap,
      onClick: onSchoolBoardClick
    },
    {
      id: 'county-board',
      title: 'County Board',
      subtitle: 'Washtenaw County District 9',
      icon: Map,
      onClick: onCountyBoardClick
    }
  ];

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Candidates</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
        <p className="text-lg text-gray-900 mb-6 text-center font-medium">
          Here are your top matches
        </p>

        {/* Candidates Grid */}
        <div className="grid grid-cols-2 gap-4">
          {candidateCategories.map((category) => {
            const IconComponent = category.icon;
            const isPOTUS = category.id === 'potus';
            
            return (
              <div
                key={category.id}
                className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all relative cursor-pointer hover:shadow-lg transform hover:scale-105 ${
                  isPOTUS 
                    ? 'border-2 border-orange-500' 
                    : 'border border-gray-200'
                } p-6`}
                onClick={category.onClick}
              >
                {/* Demo indicator for POTUS */}
                {isPOTUS && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    tap to explore
                  </div>
                )}
                
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isPOTUS ? 'bg-orange-50' : 'bg-gray-50'
                  }`}>
                    <IconComponent className={`w-8 h-8 ${
                      isPOTUS ? 'text-orange-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                
                {/* Text */}
                <div className="text-center">
                  <h3 className={`font-medium mb-1 ${
                    isPOTUS ? 'text-orange-900' : 'text-gray-900'
                  }`}>{category.title}</h3>
                  <p className={`text-sm leading-tight ${
                    isPOTUS ? 'text-orange-700' : 'text-gray-600'
                  }`}>{category.subtitle}</p>
                </div>
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
        currentScreen="candidates"
      />
    </div>
  );
}