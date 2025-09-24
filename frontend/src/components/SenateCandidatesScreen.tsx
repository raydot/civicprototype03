import { useState } from 'react';
import { ChevronLeft, CheckCircle, ExternalLink, Twitter, Newspaper, AlertTriangle, X, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import PollingStationButton from './PollingStationButton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SenateCandidatesScreenProps {
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

export default function SenateCandidatesScreen({
  onBack,
  onNavToConcerns,
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare,
  onToggleSave,
  isRecommendationSaved,
  savedItemsCount
}: SenateCandidatesScreenProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const candidates: Candidate[] = [
    {
      id: 'slotkin',
      name: 'Elissa Slotkin',
      summary: 'Government transparency, education affordability',
      match: true,
      matchPercentage: 89,
      website: 'elissaforcongress.com',
      websiteUrl: 'https://elissaforcongress.com/'
    },
    {
      id: 'rogers',
      name: 'Mike Rogers',
      summary: 'Intelligence background, moderate stance on expression',
      match: true,
      matchPercentage: 62,
      website: 'rogersforsenate.com',
      websiteUrl: 'https://rogersforsenate.com/'
    }
  ];

  const renderMatchIcon = (candidate: Candidate) => {
    if (candidate.id === 'rogers') {
      return <span className="text-xl">⚠️</span>;
    }
    if (!candidate.match) {
      return <span className="text-xl">🛑</span>;
    }
    return <span className="text-xl">✅</span>;
  };

  const getWebsitePreviewForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'slotkin') {
      return {
        title: "Elissa Slotkin for U.S. Senate",
        tagline: "Fighting for Michigan",
        sections: [
          "About Elissa",
          "Issues & Positions",
          "Government Transparency", 
          "Education Affordability",
          "Get Involved"
        ],
        description: "Former CIA analyst and current Representative advocating for government accountability and affordable education."
      };
    }
    
    if (candidateId === 'rogers') {
      return {
        title: "Mike Rogers for U.S. Senate",
        tagline: "Experience. Leadership. Results.",
        sections: [
          "About Mike",
          "National Security",
          "Economic Growth",
          "Conservative Values",
          "Endorsements"
        ],
        description: "Former FBI agent and House Intelligence Committee chair with national security expertise."
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
    if (candidateId === 'slotkin') {
      return [
        { post: "Transparency in government isn't just a campaign promise - it's essential for democracy. That's why I've consistently voted for bills requiring disclosure of political spending.", time: "2h" },
        { post: "College shouldn't put families into debt for decades. We need real solutions to make higher education affordable for Michigan families.", time: "5h" },
        { post: "From the CIA to Congress, I've seen firsthand why oversight and accountability matter. Michigan deserves representatives who will fight corruption.", time: "1d" }
      ];
    }
    
    if (candidateId === 'rogers') {
      return [
        { post: "Michigan families are struggling with inflation and rising costs. We need fiscal responsibility and policies that support working families.", time: "3h" },
        { post: "My experience on the House Intelligence Committee taught me the importance of strong national security while protecting civil liberties.", time: "6h" },
        { post: "Small businesses are the backbone of Michigan's economy. We must reduce regulations and support entrepreneurs.", time: "1d" }
      ];
    }
    
    return [
      { post: "Democracy thrives when every voice is heard and protected. We must defend civil liberties for all Americans.", time: "2h" },
      { post: "The future of our state depends on bold action today. Time to lead, not follow.", time: "5h" },
      { post: "Transparency in government isn't optional - it's essential for trust in democracy.", time: "1d" }
    ];
  };

  const getHeadlinesForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'slotkin') {
      return [
        { headline: "Slotkin Calls for Transparency in Government Spending", source: "Detroit Free Press", time: "2 hours ago" },
        { headline: "Rep. Slotkin Proposes College Affordability Initiative", source: "MLive", time: "1 day ago" },
        { headline: "Slotkin's Government Accountability Record in Focus", source: "Michigan Radio", time: "3 days ago" },
        { headline: "Senate Candidate Outlines Education Reform Plan", source: "Associated Press", time: "1 week ago" }
      ];
    }
    
    if (candidateId === 'rogers') {
      return [
        { headline: "Rogers Emphasizes National Security Experience", source: "Grand Rapids Press", time: "4 hours ago" },
        { headline: "Former FBI Agent Outlines Crime Prevention Plan", source: "Detroit News", time: "2 days ago" },
        { headline: "Rogers Campaign Focuses on Economic Growth", source: "Crain's Detroit", time: "5 days ago" },
        { headline: "Intelligence Committee Background Highlighted", source: "Politico", time: "1 week ago" }
      ];
    }
    
    return [
      { headline: "Senate Race Heats Up with Policy Debates", source: "Reuters", time: "3 hours ago" },
      { headline: "Michigan Candidates Focus on Key Issues", source: "CNN", time: "6 hours ago" },
      { headline: "Campaign Trail Spotlight on Civil Rights", source: "Washington Post", time: "1 day ago" },
      { headline: "Senate Hopefuls Outline Policy Platforms", source: "NBC News", time: "2 days ago" }
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
          <h1 className="text-lg font-medium">U.S. Senate</h1>
          <p className="text-sm text-gray-600">Michigan</p>
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
        currentScreen="senate-candidates"
      />
    </div>
  );
}