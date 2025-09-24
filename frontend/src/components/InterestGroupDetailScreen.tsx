import { ChevronLeft, ExternalLink, Users, MapPin, Target, TrendingUp, Globe, Heart } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { ImageWithFallback } from './figma/ImageWithFallback';
import acluImage from 'figma:asset/89fc84822435d7a813176901195f92e4e486a03a.png';
import nrdcImage from 'figma:asset/3ac5f368cc3c84212784a1cc83afed25037a69d4.png';
import educationTrustImage from 'figma:asset/6d80c6ea5453a84bccdac04f06d66889524ef932.png';

interface InterestGroupDetailScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  onViewOrganization: () => void;
  interestGroupId: string;
  onToggleSave?: (recommendation: SavedRecommendation) => void;
  isRecommendationSaved?: (id: string) => boolean;
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

export default function InterestGroupDetailScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToRecommendations,
  onViewOrganization,
  interestGroupId,
  onToggleSave,
  isRecommendationSaved
}: InterestGroupDetailScreenProps) {
  
  const getGroupData = (id: string) => {
    if (id === 'aclu') {
      return {
        title: 'American Civil Liberties Union',
        acronym: 'ACLU',
        image: acluImage,
        members: '1.7M',
        founded: '1920',
        headquarters: 'New York, NY',
        focus: 'Constitutional Rights & Civil Liberties',
        description: 'The ACLU works to defend and preserve the individual rights and liberties guaranteed by the Constitution and laws of the United States. For over 100 years, we have been the nation\'s guardian of liberty, working in courts, legislatures, and communities to protect constitutional freedoms.',
        matchReason: 'Your Free Speech & Expression Priority',
        matchExplanation: 'You identified "Free speech, open political discourse, freedom from censorship" as a top concern. The ACLU is the nation\'s leading defender of First Amendment rights and has litigated landmark free speech cases for over a century.',
        recentWork: [
          { date: '1 week ago', text: 'Filed lawsuit challenging campus speech restrictions at public universities' },
          { date: '2 weeks ago', text: 'Successfully defended protesters\' right to peaceful assembly' },
          { date: '1 month ago', text: 'Argued Supreme Court case on digital privacy rights' }
        ],
        keyIssues: ['Free Speech', 'Privacy Rights', 'Criminal Justice Reform', 'Voting Rights'],
        website: 'aclu.org'
      };
    } else if (id === 'nrdc') {
      return {
        title: 'Natural Resources Defense Council',
        acronym: 'NRDC',
        image: nrdcImage,
        members: '3M',
        founded: '1970',
        headquarters: 'New York, NY',
        focus: 'Environmental Protection & Climate Action',
        description: 'NRDC works to safeguard the earth—its people, its plants and animals, and the natural systems on which all life depends. We combine the power of more than three million members and online activists with the expertise of some 700 scientists, lawyers, and policy advocates across the globe.',
        matchReason: 'Your Environmental Protection Priority',
        matchExplanation: 'You identified "Environmental protection, clean air and water, electric vehicle infrastructure" as a top concern. NRDC has been fighting for environmental justice and climate action for over 50 years, leading campaigns for clean energy and pollution reduction.',
        recentWork: [
          { date: '3 days ago', text: 'Launched campaign for stronger EPA methane emission standards' },
          { date: '1 week ago', text: 'Won court case blocking offshore drilling permits' },
          { date: '2 weeks ago', text: 'Published report on renewable energy job growth potential' }
        ],
        keyIssues: ['Climate Change', 'Clean Energy', 'Water Protection', 'Wildlife Conservation'],
        website: 'nrdc.org'
      };
    } else {
      return {
        title: 'Education Trust',
        acronym: 'EdTrust',
        image: educationTrustImage,
        members: '500K',
        founded: '1996',
        headquarters: 'Washington, DC',
        focus: 'Educational Equity & College Access',
        description: 'Education Trust promotes high academic achievement for all students at all levels—pre-kindergarten through college. Our work is focused on closing achievement and opportunity gaps that separate students of color and low-income students from their peers.',
        matchReason: 'Your Education & College Costs Priority',
        matchExplanation: 'You identified "Lower college costs, education funding, student debt relief" as a top concern. Education Trust advocates for policies that make higher education more affordable and accessible, particularly for underserved communities.',
        recentWork: [
          { date: '5 days ago', text: 'Released analysis of state funding gaps in higher education' },
          { date: '2 weeks ago', text: 'Testified before Congress on Pell Grant expansion' },
          { date: '3 weeks ago', text: 'Published research on community college transfer success rates' }
        ],
        keyIssues: ['College Affordability', 'Student Success', 'Educational Equity', 'Teacher Quality'],
        website: 'edtrust.org'
      };
    }
  };

  const groupData = getGroupData(interestGroupId);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Interest Group</h1>
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
              src={groupData.image}
              alt={groupData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title and Basic Info */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight flex-1 pr-4">
                {groupData.title}
              </h2>
              {/* Heart Save Button */}
              {onToggleSave && isRecommendationSaved && (
                <button
                  onClick={() => onToggleSave({
                    id: `interest-group-${interestGroupId}`,
                    category: 'Interest Groups',
                    title: groupData.title,
                    description: groupData.focus
                  })}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all flex-shrink-0"
                >
                  <Heart 
                    className={`w-6 h-6 ${
                      isRecommendationSaved(`interest-group-${interestGroupId}`) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400 hover:text-red-400'
                    }`} 
                  />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {groupData.acronym} • Founded {groupData.founded}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {groupData.members} members
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {groupData.headquarters}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              Focus: {groupData.focus}
            </p>
          </div>

          {/* Why This Matches */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-900 mb-2">
              Why this matches: {groupData.matchReason}
            </h3>
            <p className="text-sm text-orange-800 leading-relaxed">
              {groupData.matchExplanation}
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">About this organization</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {groupData.description}
            </p>
          </div>

          {/* Key Issues */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Key issues they work on
            </h3>
            <div className="flex flex-wrap gap-2">
              {groupData.keyIssues.map((issue, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Work */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recent work
            </h3>
            <div className="space-y-3">
              {groupData.recentWork.map((work, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{work.date}</div>
                  <div className="text-sm text-gray-700">{work.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={onViewOrganization}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5" />
              Visit {groupData.website}
            </button>
            
            <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Join this organization
            </button>
          </div>

          {/* Impact Stats */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Organization impact</h4>
            <p className="text-sm text-green-800">
              Organizations like {groupData.acronym} have successfully influenced policy through litigation, advocacy, and grassroots mobilization, creating lasting change in their focus areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}