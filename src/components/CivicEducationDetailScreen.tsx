import { ChevronLeft, ExternalLink, Clock, BookOpen, Video, Headphones, Play, Heart } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { ImageWithFallback } from './figma/ImageWithFallback';
import censorshipImage from 'figma:asset/46446fdc3152d90123f142373dc1fd7a23d58139.png';
import raisedHandsImage from 'figma:asset/ab1e631d2e6fba214399e0fd4451c4dcc2056b7f.png';
import anonymousMaskImage from 'figma:asset/2139f85e4de56d3062229c6c429c281aed31f976.png';
import pressNewsImage from 'figma:asset/4530e768736bd19ca5b46c2a52aa9313101dc50b.png';

interface CivicEducationDetailScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  onResourceClick: (resourceId: string) => void;
  categoryId: string;
  onToggleSave?: (recommendation: SavedRecommendation) => void;
  isRecommendationSaved?: (id: string) => boolean;
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

export default function CivicEducationDetailScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToRecommendations,
  onResourceClick,
  categoryId,
  onToggleSave,
  isRecommendationSaved
}: CivicEducationDetailScreenProps) {
  
  const getCategoryData = (id: string) => {
    if (id === 'free-speech-censorship') {
      return {
        title: 'Free Speech & Censorship',
        image: censorshipImage,
        description: 'Explore the fundamental principles of free speech and the constitutional limits on censorship in American democracy.',
        matchReason: 'Your Free Speech & Expression Priority',
        matchExplanation: 'You identified "Free speech, open political discourse, freedom from censorship" as a top concern. These resources help you understand the legal foundations and current debates around free expression rights.',
        resources: [
          {
            id: 'annenberg-speech-limits',
            title: 'Freedom of Speech: Finding the Limits',
            source: 'Annenberg Classroom',
            type: 'article',
            duration: '10 min read',
            description: 'A comprehensive look at how courts have balanced free speech rights with other important interests like public safety and individual dignity.'
          },
          {
            id: 'constitution-center-speech',
            title: 'Freedom of Speech and the Press',
            source: 'National Constitution Center',
            type: 'article',
            duration: '8 min read',
            description: 'Constitutional interpretation of the First Amendment\'s speech and press clauses, with historical context and modern applications.'
          }
        ]
      };
    } else if (id === 'speech-in-schools') {
      return {
        title: 'Speech in Schools',
        image: raisedHandsImage,
        description: 'Learn about student speech rights and how the First Amendment applies in educational settings.',
        matchReason: 'Your Free Speech & Expression Priority',
        matchExplanation: 'Understanding how free speech protections work in schools is crucial for protecting expression rights across all contexts, including the political discourse you care about.',
        resources: [
          {
            id: 'annenberg-student-speech',
            title: 'First Amendment: Student Freedom of Speech',
            source: 'Annenberg Classroom',
            type: 'video',
            duration: '12 min',
            description: 'Video exploration of landmark Supreme Court cases that defined student speech rights, from Tinker to Morse.'
          },
          {
            id: 'civic-education-speech-democracy',
            title: 'Freedom of Speech in Constitutional Democracy',
            source: 'Center for Civic Education',
            type: 'lesson',
            duration: '45 min',
            description: 'Comprehensive lesson plan examining how free speech principles support democratic participation and civic engagement.'
          }
        ]
      };
    } else if (id === 'press-freedom-media') {
      return {
        title: 'Press Freedom & Media Literacy',
        image: pressNewsImage,
        description: 'Understand press freedom protections and develop skills to navigate today\'s media landscape.',
        matchReason: 'Your Free Speech & Expression Priority',
        matchExplanation: 'Press freedom is essential for the open political discourse you value. These resources help you understand journalism\'s role in democracy and how to evaluate media sources.',
        resources: [
          {
            id: 'annenberg-press-freedom',
            title: 'Freedom of the Press',
            source: 'Annenberg Classroom',
            type: 'article',
            duration: '9 min read',
            description: 'Examination of press freedom principles, prior restraint doctrine, and the relationship between journalism and democracy.'
          },
          {
            id: 'khan-academy-press-overview',
            title: 'Freedom of the Press: Overview',
            source: 'Khan Academy',
            type: 'video',
            duration: '8 min',
            description: 'Video overview of press freedom rights, including landmark cases and contemporary challenges facing journalism.'
          }
        ]
      };
    } else {
      return {
        title: 'Censorship & Digital Platforms',
        image: anonymousMaskImage,
        description: 'Explore the complex issues of online speech, content moderation, and digital rights in the modern era.',
        matchReason: 'Your Censorship & Social Media Priority',
        matchExplanation: 'You identified concerns about "social media censorship" and "political corruption." These resources address how digital platforms handle speech and their impact on democratic discourse.',
        resources: [
          {
            id: 'khan-academy-online-hate-speech',
            title: 'Should Online Platforms Censor Hate Speech?',
            source: 'Khan Academy',
            type: 'video',
            duration: '10 min',
            description: 'Analysis of the debate over content moderation, exploring arguments for and against platform regulation of speech.'
          },
          {
            id: 'constitution-center-campus-online',
            title: 'The First Amendment on Campus and Online',
            source: 'National Constitution Center',
            type: 'podcast',
            duration: '35 min',
            description: 'Podcast discussion of how First Amendment principles apply to both university settings and digital platforms.'
          }
        ]
      };
    }
  };

  const categoryData = getCategoryData(categoryId);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'podcast': return <Headphones className="w-4 h-4" />;
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Civics Education</h1>
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
              src={categoryData.image}
              alt={categoryData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title and Description */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
              {categoryData.title}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {categoryData.description}
            </p>
          </div>

          {/* Why This Matches */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-900 mb-2">
              Why this matches: {categoryData.matchReason}
            </h3>
            <p className="text-sm text-orange-800 leading-relaxed">
              {categoryData.matchExplanation}
            </p>
          </div>

          {/* Educational Resources */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">Educational resources</h3>
            {categoryData.resources.map((resource) => (
              <div key={resource.id} className="relative">
                <button
                  onClick={() => onResourceClick(resource.id)}
                  className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-900 leading-tight pr-4">
                          {resource.title}
                        </h4>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="font-medium">{resource.source}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {resource.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </button>
                
                {/* Heart Save Button */}
                {onToggleSave && isRecommendationSaved && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave({
                        id: `civic-education-${resource.id}`,
                        category: 'Civics Education',
                        title: resource.title,
                        description: resource.source
                      });
                    }}
                    className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all"
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        isRecommendationSaved(`civic-education-${resource.id}`) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-400 hover:text-red-400'
                      }`} 
                    />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Learning Impact */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Build your civic knowledge
            </h4>
            <p className="text-sm text-green-800">
              These carefully curated resources from trusted educational institutions help you understand complex civic issues and participate more effectively in democratic processes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}