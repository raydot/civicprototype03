import { ChevronLeft, ExternalLink, Users, Share2, Heart, Mail, X, Globe, DollarSign, Calendar, Target } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import acluImage from 'figma:asset/89fc84822435d7a813176901195f92e4e486a03a.png';
import nrdcImage from 'figma:asset/3ac5f368cc3c84212784a1cc83afed25037a69d4.png';
import educationTrustImage from 'figma:asset/6d80c6ea5453a84bccdac04f06d66889524ef932.png';

interface OrganizationViewScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  interestGroupId: string;
}

export default function OrganizationViewScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToRecommendations,
  interestGroupId
}: OrganizationViewScreenProps) {
  
  const getOrganizationData = (id: string) => {
    if (id === 'aclu') {
      return {
        title: 'American Civil Liberties Union',
        acronym: 'ACLU',
        url: 'aclu.org',
        tagline: 'Because Freedom Can\'t Protect Itself',
        image: acluImage,
        description: 'For almost 100 years, the ACLU has worked to defend and preserve the individual rights and liberties guaranteed by the Constitution and laws of the United States.',
        currentCampaigns: [
          'Voting Rights Protection',
          'Criminal Justice Reform',
          'LGBTQ+ Rights Defense',
          'Immigrant Rights Advocacy'
        ],
        waysToDonate: [
          { amount: '$25', impact: 'Supports one hour of legal research' },
          { amount: '$50', impact: 'Funds court filing fees for one case' },
          { amount: '$100', impact: 'Covers legal brief preparation costs' }
        ],
        upcomingEvents: [
          { date: 'Mar 15', event: 'Virtual Town Hall: Protecting Voting Rights' },
          { date: 'Mar 22', event: 'ACLU Lobby Day in Washington, DC' },
          { date: 'Apr 5', event: 'Free Speech on Campus Workshop' }
        ]
      };
    } else if (id === 'nrdc') {
      return {
        title: 'Natural Resources Defense Council',
        acronym: 'NRDC',
        url: 'nrdc.org',
        tagline: 'The Earth\'s Best Defense',
        image: nrdcImage,
        description: 'NRDC works to safeguard the earth—its people, its plants and animals, and the natural systems on which all life depends.',
        currentCampaigns: [
          'Climate Action Now',
          'Clean Water Protection',
          'Renewable Energy Transition',
          'Wildlife Conservation'
        ],
        waysToDonate: [
          { amount: '$35', impact: 'Plants 7 trees in reforestation efforts' },
          { amount: '$75', impact: 'Supports one day of water quality testing' },
          { amount: '$150', impact: 'Funds legal action against polluters' }
        ],
        upcomingEvents: [
          { date: 'Mar 18', event: 'Climate Action Summit 2024' },
          { date: 'Mar 25', event: 'Virtual Nature Walk & Talk' },
          { date: 'Apr 10', event: 'Clean Energy Policy Briefing' }
        ]
      };
    } else {
      return {
        title: 'Education Trust',
        acronym: 'EdTrust',
        url: 'edtrust.org',
        tagline: 'Advancing Student Success',
        image: educationTrustImage,
        description: 'Education Trust promotes high academic achievement for all students at all levels—pre-kindergarten through college.',
        currentCampaigns: [
          'College Affordability Initiative',
          'Teacher Quality Campaign',
          'Student Success Analytics',
          'Educational Equity Advocacy'
        ],
        waysToDonate: [
          { amount: '$30', impact: 'Supports college readiness materials for 5 students' },
          { amount: '$60', impact: 'Funds scholarship application assistance' },
          { amount: '$120', impact: 'Sponsors college preparation workshop' }
        ],
        upcomingEvents: [
          { date: 'Mar 20', event: 'College Access & Success Conference' },
          { date: 'Mar 28', event: 'Webinar: Closing Achievement Gaps' },
          { date: 'Apr 8', event: 'Teacher Excellence Awards Ceremony' }
        ]
      };
    }
  };

  const orgData = getOrganizationData(interestGroupId);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1 mx-4">
          <Globe className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600 truncate">{orgData.url}</span>
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
                src={orgData.image}
                alt={orgData.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-1 leading-tight">
              {orgData.title}
            </h1>
            
            <p className="text-lg text-blue-600 font-medium mb-2">
              {orgData.tagline}
            </p>
            
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {orgData.description}
            </p>
          </div>

          {/* Membership CTA */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Join the movement</h3>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">
              Become a member
            </button>
          </div>

          {/* Current Campaigns */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Current campaigns
            </h3>
            <div className="space-y-2">
              {orgData.currentCampaigns.map((campaign, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{campaign}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ways to Support */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ways to support our work
            </h3>
            <div className="space-y-3">
              {orgData.waysToDonate.map((option, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{option.amount}</span>
                    <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors">
                      Donate
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{option.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming events
            </h3>
            <div className="space-y-3">
              {orgData.upcomingEvents.map((event, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                      {event.date}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.event}</p>
                    </div>
                  </div>
                </div>
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
              <Mail className="w-4 h-4" />
              Newsletter
            </button>
          </div>

          {/* Get Involved */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Get involved locally
            </h3>
            <p className="text-sm text-orange-800 mb-3">
              Connect with {orgData.acronym} chapters and volunteers in your area to take action on the issues you care about.
            </p>
            <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition-colors text-sm font-medium">
              Find local opportunities
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Learn more at {orgData.url}
            </p>
            <button className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline">
              <ExternalLink className="w-3 h-3" />
              Visit official website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}