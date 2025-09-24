import { Button } from "./ui/button";
import { ChevronLeft } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import { ImageWithFallback } from './figma/ImageWithFallback';
import ballotImage from 'figma:asset/7772d404d80e805027cf8f336fbfb063e8643517.png';
import phoneImage from 'figma:asset/de8d06e4a0eb51f216be920051efe81d0df9d151.png';
import petitionImage from 'figma:asset/b19a611d8a0d2ec0948d004a42c63b052849030e.png';
import civicEdImage from 'figma:asset/00516f918ed275f89dc5045dda05598089433bb8.png';
import meetingImage from 'figma:asset/de8f309ff0bf806c5ca746e0fe2782b787fed8c2.png';

interface RecommendationsScreenProps {
  onBack: () => void;
  onCandidatesClick: () => void;
  onEmailOfficialsClick: () => void;
  onBallotMeasuresClick: () => void;
  onPetitionsClick: () => void;
  onInterestGroupsClick: () => void;
  onCivicEducationClick: () => void;
  onSaveShareClick: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
}

const recommendations = [
  {
    id: 'candidates',
    title: 'Candidates',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=300&fit=crop&auto=format'
  },
  {
    id: 'ballot-measures',
    title: 'Ballot Measures',
    image: ballotImage
  },
  {
    id: 'email-officials',
    title: 'Email Officials',
    image: phoneImage
  },
  {
    id: 'petitions',
    title: 'Petitions',
    image: petitionImage
  },
  {
    id: 'interest-groups',
    title: 'Interest Groups',
    image: meetingImage
  },
  {
    id: 'civic-ed',
    title: 'Civics Ed',
    image: civicEdImage
  }
];

export default function RecommendationsScreen({ onBack, onCandidatesClick, onEmailOfficialsClick, onBallotMeasuresClick, onPetitionsClick, onInterestGroupsClick, onCivicEducationClick, onSaveShareClick, onNavToConcerns, onNavToMappings, onNavToRecommendations, onNavToSaveShare }: RecommendationsScreenProps) {
  const handleRecommendationClick = (id: string) => {
    if (id === 'candidates') {
      onCandidatesClick();
    } else if (id === 'email-officials') {
      onEmailOfficialsClick();
    } else if (id === 'ballot-measures') {
      onBallotMeasuresClick();
    } else if (id === 'petitions') {
      onPetitionsClick();
    } else if (id === 'interest-groups') {
      onInterestGroupsClick();
    } else if (id === 'civic-ed') {
      onCivicEducationClick();
    } else {
      // In a real app, this would navigate to specific recommendation screens
      console.log(`Clicked on ${id}`);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="p-1 h-auto hover:bg-transparent -ml-1"
        >
          <ChevronLeft size={20} className="text-black" />
        </Button>
        <h1 className="text-lg font-medium text-black">Recommendations</h1>
        <div className="w-8 h-8"></div>
      </div>



      {/* Main content */}
      <div className="flex-1 px-4 pt-4 pb-24 md:pb-20 overflow-y-auto">
        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-3">
          {recommendations.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRecommendationClick(item.id)}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left"
            >
              {/* Image */}
              <div className="aspect-[4/3] w-full overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Title only */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-black leading-tight">
                  {item.title}
                </h3>
              </div>
            </button>
          ))}
        </div>


      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNavToConcerns={onNavToConcerns}
        onNavToMappings={onNavToMappings}
        onNavToRecommendations={onNavToRecommendations}
        onNavToSaveShare={onNavToSaveShare}
        currentScreen="recommendations"
      />
    </div>
  );
}