import { ChevronLeft, ExternalLink, Users, Share2, Heart, MessageCircle, X } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import freeSpeechImage from 'figma:asset/b2d1a7b95824e8c4141bf9842334fa63e5f5af1b.png';
import climateImage from 'figma:asset/bd5544051ad25dcb9507f78b117439ecf0f96295.png';
import tuitionImage from 'figma:asset/b2f88a5b4b764f6abcd51ed1c706ffe794219174.png';

interface ChangeOrgViewScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  petitionId: string;
}

export default function ChangeOrgViewScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToRecommendations,
  petitionId
}: ChangeOrgViewScreenProps) {
  
  const getPetitionData = (id: string) => {
    if (id === 'free-speech-campus') {
      return {
        title: 'Protect Free Speech on Campus',
        image: freeSpeechImage,
        signatures: '45,782',
        goal: '50,000',
        progress: 92,
        creator: 'Campus Free Speech Coalition',
        location: 'National, United States',
        category: 'Education',
        description: 'Universities across America are increasingly restricting free speech and open discourse on campus. Students and faculty face censorship, disinvitation of speakers, and punishment for expressing diverse viewpoints.\n\nThis petition calls for:\n• Comprehensive protection of First Amendment rights on all college campuses\n• Clear policies protecting controversial but legal speech\n• Due process protections for students and faculty\n• Transparency in disciplinary proceedings\n\nFree speech is the cornerstone of academic inquiry and democratic discourse. We cannot allow our universities to become echo chambers.',
        recentSigners: [
          'Sarah M. from Ann Arbor, MI',
          'Dr. James K. from Austin, TX',
          'Maria R. from Boston, MA',
          'Tyler S. from Berkeley, CA'
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
        location: 'National, United States',
        category: 'Environment',
        description: 'The climate crisis demands urgent, comprehensive action from our government. We need massive investments in renewable energy, green infrastructure, and sustainable technologies.\n\nThis petition demands:\n• National commitment to reach net-zero emissions by 2035\n• $2 trillion investment in clean energy infrastructure\n• Just transition support for fossil fuel workers\n• Environmental justice priorities for frontline communities\n\nThe science is clear: we have less than a decade to prevent catastrophic climate change. Our government must act now with the urgency this crisis demands.',
        recentSigners: [
          'Alex C. from Portland, OR',
          'Dr. Emma L. from Denver, CO',
          'Carlos M. from Phoenix, AZ',
          'Rachel T. from Seattle, WA'
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
        location: 'National, United States',
        category: 'Education',
        description: 'College tuition has increased by over 1,200% since 1980, leaving millions of students buried in debt. The average graduate now owes over $30,000, forcing young people to delay homeownership, starting families, and pursuing their dreams.\n\nWe demand:\n• Federal cap on annual tuition increases at public universities\n• Expansion of Pell Grants to cover full tuition costs\n• Free community college for all Americans\n• Student loan forgiveness for existing borrowers\n\nEducation should be a pathway to opportunity, not a lifetime of debt. It\'s time for our government to treat education as the public good it is.',
        recentSigners: [
          'Jessica P. from Athens, GA',
          'Michael H. from Madison, WI',
          'Sophia L. from Gainesville, FL',
          'David K. from Columbus, OH'
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
        <div className="flex items-center gap-2 flex-1 mx-4">
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23e53e3e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'%3E%3C/path%3E%3C/svg%3E" 
            alt="Change.org" 
            className="w-5 h-5"
          />
          <span className="text-sm text-gray-600 truncate">change.org</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
          <HamburgerMenu 
            onNavToConcerns={onNavToConcerns}
            onNavToRecommendations={onNavToRecommendations}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Hero Section */}
          <div className="mb-6">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg mb-4">
              <img 
                src={petitionData.image}
                alt={petitionData.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
              {petitionData.title}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span>{petitionData.creator}</span>
              <span>•</span>
              <span>{petitionData.location}</span>
              <span>•</span>
              <span>{petitionData.category}</span>
            </div>
          </div>

          {/* Signature Progress */}
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-red-600">{petitionData.signatures}</div>
              <div className="text-sm text-red-600">of {petitionData.goal} signatures</div>
            </div>
            <div className="w-full bg-red-200 rounded-full h-3 mb-3">
              <div 
                className="bg-red-600 h-3 rounded-full" 
                style={{ width: `${petitionData.progress}%` }}
              ></div>
            </div>
            <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold">
              Sign this petition
            </button>
          </div>

          {/* Recent Supporters */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Recent supporters
            </h3>
            <div className="space-y-2">
              {petitionData.recentSigners.map((signer, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {signer.split(' ')[0][0]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">{signer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Petition Story */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Why this petition matters</h3>
            <div className="prose prose-sm max-w-none">
              {petitionData.description.split('\n').map((paragraph, index) => (
                <p key={index} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Social Actions */}
          <div className="mb-6 flex gap-3">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              Follow
            </button>
            <button className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comment
            </button>
          </div>

          {/* Victory Info */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Petition victories
            </h3>
            <p className="text-sm text-green-800">
              Similar petitions on Change.org have led to policy changes at over 200 institutions. When we come together, we can create real change.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Powered by Change.org
            </p>
            <button className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline">
              <ExternalLink className="w-3 h-3" />
              View full petition on change.org
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}