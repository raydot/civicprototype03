import { useState } from 'react';
import { ChevronLeft, CheckCircle, ExternalLink, Twitter, Newspaper, AlertTriangle, X, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import PollingStationButton from './PollingStationButton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface StateHouseCandidatesScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToMappings: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
  onToggleSave: (recommendation: any) => void;
  isRecommendationSaved: (id: string) => boolean;
  savedItemsCount: number;
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

interface Candidate {
  id: string;
  name: string;
  summary: string;
  match: boolean;
  matchPercentage: number;
  website: string;
  websiteUrl: string;
}

export default function StateHouseCandidatesScreen({
  onBack,
  onNavToConcerns,
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare,
  onToggleSave,
  isRecommendationSaved,
  savedItemsCount
}: StateHouseCandidatesScreenProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showMoreCandidates, setShowMoreCandidates] = useState(false);

  const mainCandidates: Candidate[] = [
    {
      id: 'morgan',
      name: 'Jason Morgan',
      summary: 'Education affordability, environmental action',
      match: true,
      matchPercentage: 91,
      website: 'votejasonmorgan.com',
      websiteUrl: 'https://votejasonmorgan.com/'
    },
    {
      id: 'marudas',
      name: 'Christina Marudas',
      summary: 'Strong emphasis on environmental policy, personal freedoms',
      match: true,
      matchPercentage: 87,
      website: 'migreenparty.org',
      websiteUrl: 'https://migreenparty.org/'
    }
  ];

  const additionalCandidates: Candidate[] = [
    {
      id: 'stamp',
      name: 'David Stamp',
      summary: 'Minimal alignment, more conservative platform',
      match: true,
      matchPercentage: 45,
      website: 'davidstamp.com',
      websiteUrl: 'https://davidstamp.com/'
    }
  ];

  const candidates = showMoreCandidates ? [...mainCandidates, ...additionalCandidates] : mainCandidates;

  const renderMatchIcon = (candidate: Candidate) => {
    if (candidate.id === 'stamp') {
      return <span className="text-xl">⚠️</span>;
    }
    if (!candidate.match) {
      return <span className="text-xl">🛑</span>;
    }
    return <span className="text-xl">✅</span>;
  };

  const getWebsitePreviewForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'morgan') {
      return {
        title: "Jason Morgan for State House",
        tagline: "Fighting for Michigan Families",
        sections: [
          "About Jason",
          "Education Funding",
          "Environmental Action", 
          "Government Transparency",
          "Get Involved"
        ],
        description: "State legislator with strong track record on education funding and environmental protection."
      };
    }
    
    if (candidateId === 'marudas') {
      return {
        title: "Christina Marudas - Green Party",
        tagline: "People, Planet, Peace",
        sections: [
          "About Christina",
          "Environmental Justice",
          "Education Reform",
          "Civil Liberties",
          "Join Us"
        ],
        description: "Green Party candidate with progressive stance on environmental and social issues."
      };
    }

    if (candidateId === 'stamp') {
      return {
        title: "David Stamp for State House",
        tagline: "Common Sense Conservative",
        sections: [
          "About David",
          "Fiscal Responsibility",
          "School Choice",
          "Traditional Values",
          "Support"
        ],
        description: "Conservative candidate focused on fiscal responsibility and traditional values."
      };
    }
    
    return {
      title: "Campaign Website",
      tagline: "Working for Michigan",
      sections: ["About", "Issues", "Events", "Donate"],
      description: "Official campaign website with platform details and latest updates."
    };
  };

  const getXPostsForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'morgan') {
      return [
        { post: "Every child deserves access to quality education regardless of their zip code. That's why I'm fighting for increased K-12 and higher education funding.", time: "2h" },
        { post: "Michigan's environment is our shared heritage. We must transition to renewable energy while creating good-paying jobs.", time: "6h" },
        { post: "Government transparency isn't partisan - it's essential for democracy. Voters deserve to know how their tax dollars are spent.", time: "1d" }
      ];
    }
    
    if (candidateId === 'marudas') {
      return [
        { post: "Environmental justice means ensuring all communities have access to clean air, water, and healthy environments.", time: "3h" },
        { post: "Tuition-free higher education is an investment in our future. Education should be a right, not a privilege.", time: "5h" },
        { post: "Campaign finance reform is critical to getting big money out of politics and returning power to the people.", time: "1d" }
      ];
    }

    if (candidateId === 'stamp') {
      return [
        { post: "Michigan families are struggling with high taxes and government overreach. We need fiscal discipline and smaller government.", time: "4h" },
        { post: "Parents should have the right to choose the best education for their children, including school choice options.", time: "7h" },
        { post: "Traditional values and personal responsibility built this great state. We must preserve these principles.", time: "2d" }
      ];
    }
    
    return [
      { post: "Democracy thrives when every voice is heard and protected. We must defend civil liberties for all Americans.", time: "2h" },
      { post: "The future of our state depends on bold action today. Time to lead, not follow.", time: "5h" },
      { post: "Transparency in government isn't optional - it's essential for trust in democracy.", time: "1d" }
    ];
  };

  const getHeadlinesForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'morgan') {
      return [
        { headline: "Morgan Proposes Education Funding Increase", source: "Michigan Radio", time: "1 hour ago" },
        { headline: "State Rep. Morgan Champions Environmental Bills", source: "Detroit Free Press", time: "6 hours ago" },
        { headline: "Morgan's Transparency Initiative Gains Support", source: "MLive", time: "2 days ago" },
        { headline: "Legislator Outlines Infrastructure Investment Plan", source: "Associated Press", time: "1 week ago" }
      ];
    }
    
    if (candidateId === 'marudas') {
      return [
        { headline: "Green Party Candidate Champions Environmental Justice", source: "Environmental News", time: "3 hours ago" },
        { headline: "Marudas Calls for Tuition-Free Higher Education", source: "Michigan Daily", time: "1 day ago" },
        { headline: "Green Candidate Supports Campaign Finance Reform", source: "Michigan Advance", time: "4 days ago" },
        { headline: "Environmental Activist Runs for State House", source: "Bridge Michigan", time: "1 week ago" }
      ];
    }

    if (candidateId === 'stamp') {
      return [
        { headline: "Conservative Candidate Proposes Tax Cuts", source: "Michigan Capitol Confidential", time: "2 hours ago" },
        { headline: "Stamp Advocates for School Choice Expansion", source: "Education Week", time: "1 day ago" },
        { headline: "Conservative Platform Emphasizes Traditional Values", source: "Grand Rapids Press", time: "3 days ago" },
        { headline: "GOP Candidate Focuses on Fiscal Responsibility", source: "Detroit News", time: "1 week ago" }
      ];
    }
    
    return [
      { headline: "State House Race Features Policy Contrasts", source: "Reuters", time: "2 hours ago" },
      { headline: "Local Candidates Debate Key Issues", source: "CNN", time: "8 hours ago" },
      { headline: "Campaign Focus Shifts to State Priorities", source: "Washington Post", time: "1 day ago" },
      { headline: "State House Hopefuls Outline Platforms", source: "NBC News", time: "3 days ago" }
    ];
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-medium">State House</h1>
          <p className="text-sm text-gray-600">District 23</p>
        </div>
        <div className="w-10 h-10 flex items-center justify-center">
          {savedItemsCount > 0 && (
            <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              {savedItemsCount}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-20">
        <div className="p-4">
          <p className="text-gray-600 mb-6 text-center">
            {showMoreCandidates ? 'All state house candidates' : 'Candidates who match your civic priorities'}
          </p>

          {/* Candidates List */}
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Sheet>
                      <SheetTrigger asChild>
                        <button 
                          className="text-left hover:underline"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <h3 className="font-medium text-gray-900 mb-1">{candidate.name}</h3>
                        </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[80vh]">
                        <SheetHeader>
                          <SheetTitle>{selectedCandidate?.name}</SheetTitle>
                          <SheetDescription>
                            {selectedCandidate?.summary}
                          </SheetDescription>
                        </SheetHeader>
                        
                        <div className="mt-6">
                          <Tabs defaultValue="website" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="website" className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Website
                              </TabsTrigger>
                              <TabsTrigger value="social" className="flex items-center gap-2">
                                <Twitter className="w-4 h-4" />
                                Recent Posts
                              </TabsTrigger>
                              <TabsTrigger value="news" className="flex items-center gap-2">
                                <Newspaper className="w-4 h-4" />
                                Headlines
                              </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="website" className="mt-4">
                              <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600 mb-2">Official Campaign Website</p>
                                  <div className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">{selectedCandidate?.website}</span>
                                  </div>
                                </div>
                                <div className="p-6 border border-gray-200 rounded-lg bg-white">
                                  {(() => {
                                    const preview = getWebsitePreviewForCandidate(selectedCandidate?.id);
                                    return (
                                      <div className="space-y-4">
                                        <div className="text-center border-b border-gray-100 pb-4">
                                          <h3 className="font-semibold text-gray-900 mb-1">{preview.title}</h3>
                                          <p className="text-sm text-gray-600 italic">{preview.tagline}</p>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 justify-center">
                                          {preview.sections.map((section, index) => (
                                            <div key={index} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                                              {section}
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="text-center">
                                          <p className="text-sm text-gray-600 leading-relaxed">{preview.description}</p>
                                        </div>
                                        
                                        <div className="text-center pt-2">
                                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm">
                                            <ExternalLink className="w-4 h-4" />
                                            Visit Full Website
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="social" className="mt-4">
                              <div className="space-y-3">
                                {getXPostsForCandidate(selectedCandidate?.id).map((item, index) => (
                                  <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex items-start gap-3">
                                      <Twitter className="w-5 h-5 text-blue-500 mt-1" />
                                      <div>
                                        <p className="text-sm whitespace-pre-line">{item.post}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="news" className="mt-4">
                              <div className="space-y-3">
                                {getHeadlinesForCandidate(selectedCandidate?.id).map((item, index) => (
                                  <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-start gap-3">
                                      <Newspaper className="w-5 h-5 text-gray-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-medium">{item.headline}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.source} • {item.time}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </SheetContent>
                    </Sheet>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">{candidate.summary}</p>
                  </div>
                  
                  <div className="ml-3 flex-shrink-0 flex items-center gap-3">
                    <button
                      onClick={() => onToggleSave({
                        id: `candidate-${candidate.id}`,
                        category: 'Candidates',
                        title: candidate.name,
                        description: candidate.summary
                      })}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          isRecommendationSaved(`candidate-${candidate.id}`) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-400 hover:text-red-400'
                        }`} 
                      />
                    </button>
                    <div className="flex items-center gap-2">
                      {renderMatchIcon(candidate)}
                      <span className="text-sm font-medium text-gray-700">{candidate.matchPercentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {candidate.website}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Section */}
          {!showMoreCandidates && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowMoreCandidates(true)}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-200 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Load More Candidates
              </button>
              <p className="text-xs text-gray-400 mt-2">Showing 2 of 3 candidates</p>
            </div>
          )}

          {showMoreCandidates && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowMoreCandidates(false)}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-200 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Show Fewer Candidates
              </button>
              <p className="text-xs text-gray-400 mt-2">Showing all 3 candidates</p>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-8">
            <PollingStationButton />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNavToConcerns={onNavToConcerns}
        onNavToMappings={onNavToMappings}
        onNavToRecommendations={onNavToRecommendations}
        onNavToSaveShare={onNavToSaveShare}
        currentScreen="state-house-candidates"
      />
    </div>
  );
}