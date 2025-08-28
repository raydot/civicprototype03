import { useState } from 'react';
import { ChevronLeft, CheckCircle, ExternalLink, Twitter, Newspaper, AlertTriangle, X, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import PollingStationButton from './PollingStationButton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SchoolBoardCandidatesScreenProps {
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

export default function SchoolBoardCandidatesScreen({
  onBack,
  onNavToConcerns,
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare,
  onToggleSave,
  isRecommendationSaved,
  savedItemsCount
}: SchoolBoardCandidatesScreenProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const candidates: Candidate[] = [
    {
      id: 'cherry',
      name: 'Dr. Elena Cherry',
      summary: 'Champions student free-speech policies, inclusive pronoun use, and hands-on climate education',
      match: true,
      matchPercentage: 96,
      website: 'elenacherryforsschools.com',
      websiteUrl: 'https://elenacherryforsschools.com/'
    },
    {
      id: 'patel',
      name: 'Michael Patel',
      summary: 'Emphasizes strict budget oversight and larger class sizes; little on expression or environment',
      match: true,
      matchPercentage: 52,
      website: 'michaelpatelschoolboard.com',
      websiteUrl: 'https://michaelpatelschoolboard.com/'
    }
  ];

  const renderMatchIcon = (candidate: Candidate) => {
    if (candidate.id === 'patel') {
      return <span className="text-xl">⚠️</span>;
    }
    if (!candidate.match) {
      return <span className="text-xl">🛑</span>;
    }
    return <span className="text-xl">✅</span>;
  };

  const getWebsitePreviewForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'cherry') {
      return {
        title: "Dr. Elena Cherry for School Board",
        tagline: "Every Student Deserves Excellence",
        sections: [
          "About Dr. Cherry",
          "Inclusive Education",
          "Climate Science", 
          "Student Rights",
          "Get Involved"
        ],
        description: "Educator with PhD in Educational Leadership, advocating for progressive policies in schools."
      };
    }
    
    if (candidateId === 'patel') {
      return {
        title: "Michael Patel for School Board",
        tagline: "Fiscal Responsibility in Education",
        sections: [
          "About Michael",
          "Budget Efficiency",
          "Academic Standards",
          "Traditional Values",
          "Support"
        ],
        description: "Business professional focused on fiscal responsibility and traditional educational approaches."
      };
    }
    
    return {
      title: "School Board Campaign",
      tagline: "Working for Students",
      sections: ["About", "Education Policy", "Events", "Volunteer"],
      description: "Official campaign website with education platform and latest updates."
    };
  };

  const getXPostsForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'cherry') {
      return [
        { post: "Every student deserves to feel safe and included in their learning environment. That's why we need policies that support all students, regardless of background.", time: "1h" },
        { post: "Climate education isn't political - it's science. Our students need to understand the world they're inheriting and how to care for it.", time: "4h" },
        { post: "Student free expression is a cornerstone of education. We must protect students' rights to learn, question, and grow.", time: "1d" }
      ];
    }
    
    if (candidateId === 'patel') {
      return [
        { post: "Taxpayers deserve accountability in education spending. Every dollar should go toward improving student outcomes, not bureaucracy.", time: "2h" },
        { post: "We need to focus on the fundamentals: reading, writing, and arithmetic. Strong academic standards benefit all students.", time: "5h" },
        { post: "Parents are the primary educators of their children. Schools should support families, not override their values.", time: "1d" }
      ];
    }
    
    return [
      { post: "Quality education is the foundation of our democracy. Every child deserves access to excellent schools.", time: "2h" },
      { post: "Teachers are heroes who shape our future. We must support them with resources and respect.", time: "6h" },
      { post: "School boards must prioritize student success above all else. That's our sacred responsibility.", time: "1d" }
    ];
  };

  const getHeadlinesForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'cherry') {
      return [
        { headline: "Dr. Cherry Proposes Inclusive Education Policies", source: "Ann Arbor News", time: "2 hours ago" },
        { headline: "School Board Candidate Champions Climate Curriculum", source: "Michigan Daily", time: "1 day ago" },
        { headline: "Cherry's Plan for Student Free Expression Rights", source: "MLive", time: "3 days ago" },
        { headline: "Education Leader Outlines Progressive Platform", source: "Bridge Michigan", time: "1 week ago" }
      ];
    }
    
    if (candidateId === 'patel') {
      return [
        { headline: "Patel Calls for School Budget Transparency", source: "Ann Arbor Observer", time: "4 hours ago" },
        { headline: "Business Leader Emphasizes Academic Standards", source: "Education Week", time: "1 day ago" },
        { headline: "Patel Platform Focuses on Traditional Education", source: "Detroit News", time: "5 days ago" },
        { headline: "Conservative Candidate Outlines School Priorities", source: "Washtenaw County Legal News", time: "1 week ago" }
      ];
    }
    
    return [
      { headline: "School Board Race Features Education Debates", source: "Local News", time: "3 hours ago" },
      { headline: "Candidates Discuss School District Priorities", source: "Education Today", time: "8 hours ago" },
      { headline: "School Board Campaign Focuses on Student Success", source: "Community News", time: "2 days ago" },
      { headline: "Education Hopefuls Outline Reform Plans", source: "Regional Report", time: "1 week ago" }
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
          <h1 className="text-lg font-medium">School Board</h1>
          <p className="text-sm text-gray-600">Ann Arbor Public Schools Zone 2</p>
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
        currentScreen="school-board-candidates"
      />
    </div>
  );
}