import { ChevronLeft, ExternalLink, Users, Target, TrendingUp, Heart } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { ImageWithFallback } from './figma/ImageWithFallback';
import freeSpeechImage from 'figma:asset/b2d1a7b95824e8c4141bf9842334fa63e5f5af1b.png';
import climateImage from 'figma:asset/bd5544051ad25dcb9507f78b117439ecf0f96295.png';
import tuitionImage from 'figma:asset/b2f88a5b4b764f6abcd51ed1c706ffe794219174.png';

interface PetitionDetailScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  onViewChangeOrg: () => void;
  petitionId: string;
  onToggleSave?: (recommendation: SavedRecommendation) => void;
  isRecommendationSaved?: (id: string) => boolean;
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

export default function PetitionDetailScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToRecommendations,
  onViewChangeOrg,
  petitionId,
  onToggleSave,
  isRecommendationSaved
}: PetitionDetailScreenProps) {
  
  const getPetitionData = (id: string) => {
    if (id === 'free-speech-campus') {
      return {
        title: 'Protect Free Speech on Campus',
        image: freeSpeechImage,
        signatures: '45,782',
        goal: '50,000',
        progress: 92,
        creator: 'Campus Free Speech Coalition',
        description: 'Universities across America are increasingly restricting free speech and open discourse on campus. Students and faculty face censorship, disinvitation of speakers, and punishment for expressing diverse viewpoints. This petition calls for comprehensive protection of First Amendment rights on all college campuses.',
        matchReason: 'Your Free Speech & Expression Priority',
        matchExplanation: 'You identified "Free speech, open political discourse, freedom from censorship" as a top concern. This petition directly addresses campus speech restrictions and advocates for the same civil liberties protections you prioritized.',
        updates: [
          { date: '3 days ago', text: 'University of Michigan commits to reviewing speech policies' },
          { date: '1 week ago', text: 'Coalition meets with Department of Education officials' },
          { date: '2 weeks ago', text: 'Petition reaches 40,000 signatures' }
        ]
      };
    } else if (id === 'climate-action') {
      return {
        title: 'Invest in Comprehensive Climate Action',
        image: climateImage,
        signatures: '127,493',
        goal: '150,000',
        progress: 85,
        creator: 'Youth Climate Action Network',
        description: 'The climate crisis demands urgent, comprehensive action from our government. We need massive investments in renewable energy, green infrastructure, and sustainable technologies. This petition calls for a national commitment to reach net-zero emissions by 2035 through bold federal investment.',
        matchReason: 'Your Environmental Protection Priority',
        matchExplanation: 'You identified "Environmental protection, clean air and water, electric vehicle infrastructure" as a top concern. This petition advocates for the same comprehensive environmental policies and clean energy investments you prioritized.',
        updates: [
          { date: '2 days ago', text: 'Senator Warren endorses the petition' },
          { date: '5 days ago', text: 'Climate activists deliver petition to EPA headquarters' },
          { date: '1 week ago', text: 'Over 100 environmental groups join coalition' }
        ]
      };
    } else {
      return {
        title: 'Lower College Tuition Costs Nationwide',
        image: tuitionImage,
        signatures: '89,156',
        goal: '100,000',
        progress: 89,
        creator: 'Student Debt Reform Alliance',
        description: 'College tuition has increased by over 1,200% since 1980, leaving millions of students buried in debt. The average graduate now owes over $30,000. This petition demands federal action to cap tuition increases, expand Pell Grants, and make community college free for all Americans.',
        matchReason: 'Your Education & College Costs Priority',
        matchExplanation: 'You identified "Lower college costs, education funding, student debt relief" as a top concern. This petition directly addresses the affordability crisis in higher education that you prioritized.',
        updates: [
          { date: '1 day ago', text: 'Student groups at 200+ colleges endorse petition' },
          { date: '4 days ago', text: 'House Education Committee schedules hearing' },
          { date: '1 week ago', text: 'Petition featured in Washington Post editorial' }
        ]
      };
    }
  };

  const petitionData = getPetitionData(petitionId);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Petition</h1>
        <HamburgerMenu 
          onNavToConcerns={onNavToConcerns}
          onNavToRecommendations={onNavToRecommendations}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Hero Image */}
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg mb-4">
            <ImageWithFallback
              src={petitionData.image}
              alt={petitionData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title and Creator */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight flex-1 pr-4">
                {petitionData.title}
              </h2>
              {/* Heart Save Button */}
              {onToggleSave && isRecommendationSaved && (
                <button
                  onClick={() => onToggleSave({
                    id: `petition-${petitionId}`,
                    category: 'Petitions',
                    title: petitionData.title,
                    description: `Started by ${petitionData.creator}`
                  })}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all flex-shrink-0"
                >
                  <Heart 
                    className={`w-6 h-6 ${
                      isRecommendationSaved(`petition-${petitionId}`) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400 hover:text-red-400'
                    }`} 
                  />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Started by {petitionData.creator}
            </p>
          </div>

          {/* Progress Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{petitionData.signatures} signatures</span>
              <span className="text-sm text-gray-600">Goal: {petitionData.goal}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-black h-2 rounded-full" 
                style={{ width: `${petitionData.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>{petitionData.progress}% of goal reached</span>
            </div>
          </div>

          {/* Why This Matches */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-900 mb-2">
              Why this matches: {petitionData.matchReason}
            </h3>
            <p className="text-sm text-orange-800 leading-relaxed">
              {petitionData.matchExplanation}
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">About this petition</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {petitionData.description}
            </p>
          </div>

          {/* Recent Updates */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Recent updates
            </h3>
            <div className="space-y-3">
              {petitionData.updates.map((update, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{update.date}</div>
                  <div className="text-sm text-gray-700">{update.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={onViewChangeOrg}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Sign on Change.org
            </button>
            
            <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Share with friends
            </button>
          </div>

          {/* Impact Stats */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Petition impact</h4>
            <p className="text-sm text-green-800">
              Petitions like this have successfully influenced policy at 67% of universities that received them, leading to concrete changes in campus speech policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}