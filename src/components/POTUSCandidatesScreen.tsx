import { useState } from 'react';
import { ChevronLeft, CheckCircle, ExternalLink, Twitter, Newspaper, AlertTriangle, X, Heart } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import PollingStationButton from './PollingStationButton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface POTUSCandidatesScreenProps {
  onBack: () => void;
  onNavToConcerns?: () => void;
  onNavToMappings?: () => void;
  onNavToRecommendations?: () => void;
  onNavToSaveShare?: () => void;
  onToggleSave?: (recommendation: SavedRecommendation) => void;
  isRecommendationSaved?: (id: string) => boolean;
  savedItemsCount?: number;
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

export default function POTUSCandidatesScreen({ onBack, onNavToConcerns, onNavToMappings, onNavToRecommendations, onNavToSaveShare, onToggleSave, isRecommendationSaved, savedItemsCount }: POTUSCandidatesScreenProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showMoreCandidates, setShowMoreCandidates] = useState(false);
  const [showInteractionTip, setShowInteractionTip] = useState(true);
  


  const mainCandidates: Candidate[] = [
    {
      id: 'chase-oliver',
      name: 'Chase Oliver',
      summary: 'Advocates strong civil liberties, free speech protections',
      match: true,
      matchPercentage: 92,
      website: 'votechaseoliver.com',
      websiteUrl: 'https://votechaseoliver.com/'
    },
    {
      id: 'jill-stein',
      name: 'Jill Stein',
      summary: 'Comprehensive climate policy, higher education reform',
      match: true,
      matchPercentage: 88,
      website: 'jillstein2024.com',
      websiteUrl: 'https://www.jillstein2024.com/'
    },
    {
      id: 'rfk-jr',
      name: 'Robert F. Kennedy Jr.',
      summary: 'Anti-censorship, transparency in politics, environmental protection',
      match: true,
      matchPercentage: 76,
      website: 'kennedy24.com',
      websiteUrl: 'https://www.kennedy24.com/'
    }
  ];

  const additionalCandidates: Candidate[] = [
    {
      id: 'kamala-harris',
      name: 'Kamala Harris',
      summary: 'Advocates for expanded government programs and mandates (e.g. federal pronoun policies)',
      match: false,
      matchPercentage: 42,
      website: 'kamalaharris.org',
      websiteUrl: 'https://kamalaharris.org/'
    },
    {
      id: 'donald-trump',
      name: 'Donald Trump',
      summary: 'Emphasizes strong border enforcement and tax cuts but has clashed with free‐speech norms',
      match: false,
      matchPercentage: 38,
      website: 'donaldjtrump.com',
      websiteUrl: 'https://www.donaldjtrump.com/'
    }
  ];

  const candidates = showMoreCandidates ? [...mainCandidates, ...additionalCandidates] : mainCandidates;

  const renderMatchIcon = (candidate: Candidate) => {
    if (!candidate.match) {
      return <span className="text-xl">🛑</span>;
    }
    if (candidate.matchPercentage < 80) {
      return <span className="text-xl">⚠️</span>;
    }
    return <span className="text-xl">✅</span>;
  };

  const getXPostsForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'chase-oliver') {
      return [
        { post: "War is not Peace\n\nNo matter how many times governments try to convince you otherwise.", time: "Jun 22" },
        { post: "MAGA is not limited government\n\nMAGA is not fiscally responsible\n\nMAGA is not conservative\n\nMAGA is control, central planning, and authoritarianism\n\nIt's closer to Lenin than liberty", time: "May 19" },
        { post: "On the campaign trail, I was asked to describe my opponent's term if they should be elected in a single word.\n\nFor Trump, I said \"uncertainty\"\n\nI chose that word because he isn't guided by some sort of overarching principles. The only guide he has is \"might makes right.\" The", time: "Mar 19" }
      ];
    }
    
    if (candidateId === 'jill-stein') {
      return [
        { post: "Once again the two-party system has delivered a disastrous result for the American people. Now we must continue the uprising for people-powered politics and demand the world we deserve - which will never be delivered by the twin parties of war and Wall Street.", time: "4h" },
        { post: "Elon Musk is now worth $405.6 billion & set to become the world's first trillionaire by 2027. I can't believe people worship this fraud or the capitalist system that allowed him to amass this much wealth by exploiting workers and using CHILD LABOR to make the batteries in Teslas.", time: "10h" },
        { post: "Kudos to the few journalists who dare to take on this subject most media won't touch, even as Americans and people the world over are horrified & rising up in growing numbers.", time: "3h" }
      ];
    }
    
    if (candidateId === 'rfk-jr') {
      return [
        { post: "@HHSGov is making it clear: Federal funding must support excellence—not race—in medical education, research, and training. Today, @EDSecMcMahon and I are calling on @DukeU to address serious allegations of racial discrimination by forming a Merit and Civil Rights Committee", time: "1h" },
        { post: "Thank you, Idaho @GovernorLittle, for your bold leadership. From banning cell phones in classrooms to eliminating sugary drinks and candy from SNAP, your state is taking decisive action to protect kids' health and tackle the chronic disease crisis head-on.", time: "7h" },
        { post: "🚨BREAKING EXCLUSIVE: HHS Sec. Bobby Kennedy just joined me to discuss his major new initiative to fix the Vaccine Injury Compensation Program (VICP) established by The 1986 Vaccine Act, which gave vaccine makers immunity from lawsuits if people were harmed by taking them.", time: "6h" }
      ];
    }
    
    // Generic posts for other candidates
    return [
      { post: "Democracy thrives when every voice is heard and protected. We must defend civil liberties for all Americans.", time: "2h" },
      { post: "The future of our planet depends on bold climate action today. Time to lead, not follow.", time: "5h" },
      { post: "Transparency in government isn't optional - it's essential for trust in democracy.", time: "1d" }
    ];
  };

  const getWebsitePreviewForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'chase-oliver') {
      return {
        title: "Chase Oliver for President 2024",
        tagline: "Liberty. Peace. Prosperity.",
        sections: [
          "Issues & Positions",
          "End the Wars",
          "Criminal Justice Reform", 
          "Immigration Reform",
          "Economic Freedom"
        ],
        description: "Chase Oliver is the Libertarian nominee for President, advocating for civil liberties, non-interventionism, and limited government."
      };
    }
    
    if (candidateId === 'jill-stein') {
      return {
        title: "Dr. Jill Stein for President 2024",
        tagline: "People, Planet, Peace over Profit",
        sections: [
          "Green New Deal",
          "Healthcare for All",
          "End Wars & Military Spending",
          "Cancel Student Debt",
          "Justice & Democracy"
        ],
        description: "Dr. Jill Stein is running on the Green Party ticket with a platform focused on environmental justice, healthcare reform, and economic equality."
      };
    }
    
    if (candidateId === 'rfk-jr') {
      return {
        title: "Robert F. Kennedy Jr. for President",
        tagline: "Heal the Divide",
        sections: [
          "End Chronic Disease Epidemic",
          "Free Speech & Civil Liberties",
          "Environmental Protection",
          "Government Transparency",
          "Economic Opportunity"
        ],
        description: "Robert F. Kennedy Jr. campaigns on healing America's chronic disease epidemic, protecting civil liberties, and restoring transparency to government."
      };
    }
    
    return {
      title: "Campaign Website",
      tagline: "Working for America",
      sections: ["About", "Issues", "Events", "Donate"],
      description: "Official campaign website with platform details and latest updates."
    };
  };

  const getHeadlinesForCandidate = (candidateId: string | undefined) => {
    if (candidateId === 'rfk-jr') {
      return [
        { headline: "RFK Jr. lashes out at vaccine injury program, pledges changes", source: "The Hill", time: "1 hour ago" },
        { headline: "RFK Jr. Plans Overhaul of Federal Vaccine-Injury Compensation System", source: "The New York Times", time: "5 hours ago" },
        { headline: "A Non-Exhaustive Timeline of Robert F. Kennedy Jr.'s War on Vaccines", source: "Mother Jones", time: "1 day ago" },
        { headline: "Kennedy Campaign Promises Transparency in Health Agencies", source: "Associated Press", time: "2 days ago" }
      ];
    }
    
    if (candidateId === 'jill-stein') {
      return [
        { headline: "US Must Recognize Palestine Amid Gaza Starvation Horror, Says Jill Stein", source: "Newsweek", time: "15 hours ago" },
        { headline: "Jill Stein seeks to get St. Louis County assault charges thrown out", source: "St. Louis Magazine", time: "1 month ago" },
        { headline: "Jill Stein talks oligarchy, foreign policy at Political Union winter speaker event", source: "The Daily Northwestern", time: "Mar 7, 2025" },
        { headline: "Green Party Candidate Calls for Climate Emergency Declaration", source: "Environmental News", time: "3 days ago" }
      ];
    }
    
    if (candidateId === 'chase-oliver') {
      return [
        { headline: "Chase Oliver on Budget Cuts, War, and Immigration", source: "Reason Magazine", time: "Oct 10, 2024" },
        { headline: "Presidential candidate Chase Oliver and the Libertarian Party's Waffle House Caucus", source: "Savannah Morning News", time: "Oct 20, 2024" },
        { headline: "Armed, Gay and Looking for Redemption", source: "New Lines Magazine", time: "Nov 4, 2024" },
        { headline: "Libertarian Nominee Advocates for Criminal Justice Reform", source: "Liberty Times", time: "Dec 15, 2024" }
      ];
    }
    
    // Generic headlines for other candidates
    return [
      { headline: "Presidential Candidate Outlines New Climate Initiative", source: "Reuters", time: "3 hours ago" },
      { headline: "Third Party Candidates Gain Momentum in Swing States", source: "CNN", time: "6 hours ago" },
      { headline: "Campaign Trail Focus Shifts to Civil Rights Issues", source: "Washington Post", time: "1 day ago" },
      { headline: "Environmental Policy Takes Center Stage in Presidential Race", source: "NBC News", time: "2 days ago" }
    ];
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Presidential Candidates</h1>
        <div className="w-10 h-10 flex items-center justify-center">
          {savedItemsCount && savedItemsCount > 0 && (
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
          {showMoreCandidates ? 'All presidential candidates' : 'Candidates who match your civic priorities'}
        </p>

        {/* Interactive Tip Banner */}
        {showInteractionTip && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 relative">
            <button 
              onClick={() => setShowInteractionTip(false)}
              className="absolute top-3 right-3 p-1 hover:bg-orange-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-orange-600" />
            </button>
            <div className="pr-8">
              <p className="text-sm text-orange-800">
                <span className="font-medium">Tip:</span> Tap candidate names to see their campaign website, recent posts, and headline mentions.
              </p>
            </div>
          </div>
        )}

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
                                      {/* Website Header */}
                                      <div className="text-center border-b border-gray-100 pb-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">{preview.title}</h3>
                                        <p className="text-sm text-gray-600 italic">{preview.tagline}</p>
                                      </div>
                                      
                                      {/* Navigation Menu */}
                                      <div className="flex flex-wrap gap-2 justify-center">
                                        {preview.sections.map((section, index) => (
                                          <div key={index} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                                            {section}
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {/* Description */}
                                      <div className="text-center">
                                        <p className="text-sm text-gray-600 leading-relaxed">{preview.description}</p>
                                      </div>
                                      
                                      {/* Visit Website Button */}
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
                  {onToggleSave && isRecommendationSaved && (
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
                  )}
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
            <p className="text-xs text-gray-400 mt-2">Showing 3 of 5 candidates</p>
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
            <p className="text-xs text-gray-400 mt-2">Showing all 5 candidates</p>
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-8">
          <PollingStationButton />
        </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      {onNavToConcerns && onNavToMappings && onNavToRecommendations && onNavToSaveShare && (
        <BottomNavigation 
          onNavToConcerns={onNavToConcerns}
          onNavToMappings={onNavToMappings}
          onNavToRecommendations={onNavToRecommendations}
          onNavToSaveShare={onNavToSaveShare}
          currentScreen="potus-candidates"
        />
      )}
    </div>
  );
}