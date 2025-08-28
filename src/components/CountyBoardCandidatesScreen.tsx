import { useState } from 'react';
import { ChevronLeft, CheckCircle, ExternalLink, Twitter, Newspaper, AlertTriangle, X, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import PollingStationButton from './PollingStationButton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface CountyBoardCandidatesScreenProps {
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

export default function CountyBoardCandidatesScreen({
  onBack,
  onNavToConcerns,
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare,
  onToggleSave,
  isRecommendationSaved,
  savedItemsCount
}: CountyBoardCandidatesScreenProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const candidates: Candidate[] = [
    {
      id: 'johnson',
      name: 'Sarah Johnson',
      summary: 'Environmental sustainability, government transparency initiatives',
      match: true,
      matchPercentage: 88,
      website: 'sarahjohnsonforcommissioner.com',
      websiteUrl: 'https://sarahjohnsonforcommissioner.com/'
    },
    {
      id: 'martinez',
      name: 'Tom Martinez',
      summary: 'Fiscal responsibility, moderate environmental stance',
      match: true,
      matchPercentage: 61,
      website: 'tommartinezforcommissioner.com',
      websiteUrl: 'https://tommartinezforcommissioner.com/'
    }
  ];

  const renderMatchIcon = (candidate: Candidate) => {
    if (candidate.id === 'martinez') {
      return <span className="text-xl">⚠️</span>;
    }
    if (!candidate.match) {
      return <span className="text-xl">🛑</span>;
    }
    return <span className="text-xl">✅</span>;
  };

  const getWebsitePreviewForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'johnson') {
      return {
        title: "Sarah Johnson for County Commissioner",
        tagline: "Sustainable Solutions for Washtenaw",
        sections: [
          "About Sarah",
          "Environmental Action",
          "Government Transparency", 
          "Affordable Housing",
          "Get Involved"
        ],
        description: "Environmental attorney with extensive experience in local government and sustainability initiatives."
      };
    }
    
    if (candidateId === 'martinez') {
      return {
        title: "Tom Martinez for County Commissioner",
        tagline: "Practical Leadership for Our County",
        sections: [
          "About Tom",
          "Fiscal Responsibility",
          "Infrastructure",
          "Economic Development",
          "Support"
        ],
        description: "Business owner focused on responsible spending and practical environmental solutions."
      };
    }
    
    return {
      title: "County Commissioner Campaign",
      tagline: "Working for Our County",
      sections: ["About", "Local Issues", "Events", "Volunteer"],
      description: "Official campaign website with county platform and latest updates."
    };
  };

  const getXPostsForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'johnson') {
      return [
        { post: "Washtenaw County can be a leader in renewable energy. Investing in clean energy creates jobs and protects our environment for future generations.", time: "1h" },
        { post: "Open government builds trust. Residents deserve transparency in how their tax dollars are spent and how decisions are made.", time: "3h" },
        { post: "Affordable housing is a civil rights issue. Everyone deserves a safe, affordable place to call home in our community.", time: "1d" }
      ];
    }
    
    if (candidateId === 'martinez') {
      return [
        { post: "County government must be fiscally responsible while meeting residents' needs. We can balance environmental goals with practical solutions.", time: "2h" },
        { post: "Infrastructure investment creates jobs and improves quality of life. We need smart spending on roads, bridges, and public facilities.", time: "4h" },
        { post: "Supporting local businesses means supporting our neighbors. County policies should help entrepreneurs thrive.", time: "1d" }
      ];
    }
    
    return [
      { post: "Local government is where democracy happens. County commissioners must listen to residents and serve their interests.", time: "2h" },
      { post: "Our county's diversity is our strength. We must work together to build a community that works for everyone.", time: "5h" },
      { post: "Effective governance requires collaboration, not division. Let's focus on solutions that bring us together.", time: "1d" }
    ];
  };

  const getHeadlinesForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'johnson') {
      return [
        { headline: "Johnson Proposes County Clean Energy Initiative", source: "Ann Arbor News", time: "1 hour ago" },
        { headline: "Environmental Attorney Outlines Sustainability Plan", source: "MLive", time: "6 hours ago" },
        { headline: "Johnson's Affordable Housing Proposal Gains Support", source: "Michigan Radio", time: "2 days ago" },
        { headline: "County Candidate Champions Government Transparency", source: "Washtenaw County Legal News", time: "1 week ago" }
      ];
    }
    
    if (candidateId === 'martinez') {
      return [
        { headline: "Martinez Focuses on Fiscal Responsibility", source: "Ann Arbor Observer", time: "3 hours ago" },
        { headline: "Business Owner Outlines Infrastructure Priorities", source: "Detroit News", time: "1 day ago" },
        { headline: "Martinez Proposes Business-Friendly Policies", source: "Crain's Detroit", time: "4 days ago" },
        { headline: "County Commissioner Candidate Emphasizes Growth", source: "Bridge Michigan", time: "1 week ago" }
      ];
    }
    
    return [
      { headline: "County Commissioner Race Features Local Priorities", source: "Local News", time: "2 hours ago" },
      { headline: "Candidates Debate County Development Plans", source: "Regional Report", time: "8 hours ago" },
      { headline: "County Board Campaign Focuses on Resident Needs", source: "Community Voice", time: "1 day ago" },
      { headline: "Commissioner Hopefuls Outline Vision for County", source: "County News", time: "1 week ago" }
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
          <h1 className="text-lg font-medium">County Board</h1>
          <p className="text-sm text-gray-600">Washtenaw County District 9</p>
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
            Candidates who match your civic priorities
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
        currentScreen="county-board-candidates"
      />
    </div>
  );
}