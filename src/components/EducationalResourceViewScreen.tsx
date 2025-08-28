import { ChevronLeft, ExternalLink, X, Globe, Clock, BookOpen, Video, Headphones, Share2, Bookmark } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import censorshipImage from 'figma:asset/46446fdc3152d90123f142373dc1fd7a23d58139.png';
import raisedHandsImage from 'figma:asset/ab1e631d2e6fba214399e0fd4451c4dcc2056b7f.png';
import anonymousMaskImage from 'figma:asset/2139f85e4de56d3062229c6c429c281aed31f976.png';
import pressNewsImage from 'figma:asset/4530e768736bd19ca5b46c2a52aa9313101dc50b.png';

interface EducationalResourceViewScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  resourceId: string;
}

export default function EducationalResourceViewScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToRecommendations,
  resourceId
}: EducationalResourceViewScreenProps) {
  
  const getResourceData = (id: string) => {
    if (id === 'annenberg-speech-limits') {
      return {
        title: 'Freedom of Speech: Finding the Limits',
        source: 'Annenberg Classroom',
        url: 'annenbergclassroom.org',
        type: 'article',
        duration: '10 min read',
        image: censorshipImage,
        summary: 'This comprehensive article examines how the Supreme Court has interpreted the First Amendment\'s free speech protections, exploring the balance between individual expression rights and legitimate government interests.',
        keyPoints: [
          'The "clear and present danger" test and its evolution',
          'Time, place, and manner restrictions on speech',
          'Categories of unprotected speech (obscenity, defamation, incitement)',
          'Symbolic speech and expressive conduct protections'
        ],
        content: 'The First Amendment\'s guarantee of free speech is not absolute. Throughout American history, courts have grappled with defining the boundaries of protected expression. This article explores landmark cases like Schenck v. United States, Brandenburg v. Ohio, and Tinker v. Des Moines, showing how constitutional interpretation has evolved to protect robust debate while maintaining public order.',
        relatedTopics: ['First Amendment', 'Constitutional Law', 'Supreme Court Cases', 'Civil Liberties']
      };
    } else if (id === 'constitution-center-speech') {
      return {
        title: 'Freedom of Speech and the Press',
        source: 'National Constitution Center',
        url: 'constitutioncenter.org',
        type: 'article',
        duration: '8 min read',
        image: raisedHandsImage,
        summary: 'An in-depth analysis of the First Amendment\'s speech and press clauses, examining their historical origins and modern applications in digital media.',
        keyPoints: [
          'Historical context of the First Amendment\'s adoption',
          'Press freedom and the role of journalism in democracy',
          'Modern challenges: social media and digital platforms',
          'International comparisons of speech protections'
        ],
        content: 'The framers of the Constitution recognized that free speech and a free press are essential to democratic self-governance. This article traces the development of these rights from their English common law origins through contemporary debates about online speech and content moderation.',
        relatedTopics: ['Press Freedom', 'First Amendment', 'Digital Rights', 'Democracy']
      };
    } else if (id === 'annenberg-student-speech') {
      return {
        title: 'First Amendment: Student Freedom of Speech',
        source: 'Annenberg Classroom',
        url: 'annenbergclassroom.org',
        type: 'video',
        duration: '12 min',
        image: raisedHandsImage,
        summary: 'This educational video examines how First Amendment protections apply to students in public schools, featuring analysis of key Supreme Court cases.',
        keyPoints: [
          'Tinker v. Des Moines: Students don\'t "shed their constitutional rights at the schoolhouse gate"',
          'Bethel v. Fraser: Schools can regulate lewd and offensive speech',
          'Hazelwood v. Kuhlmeier: School-sponsored speech has different protections',
          'Morse v. Frederick: The "Bong Hits 4 Jesus" case and drug advocacy'
        ],
        content: 'Student speech rights have been shaped by several landmark Supreme Court cases that balance educational needs with constitutional protections. This video provides clear explanations of how these precedents apply to modern school environments.',
        relatedTopics: ['Student Rights', 'Education Law', 'First Amendment', 'Supreme Court']
      };
    } else if (id === 'civic-education-speech-democracy') {
      return {
        title: 'Freedom of Speech in Constitutional Democracy',
        source: 'Center for Civic Education',
        url: 'civiced.org',
        type: 'lesson',
        duration: '45 min',
        image: censorshipImage,
        summary: 'A comprehensive lesson plan exploring how free speech principles support democratic participation and civic engagement.',
        keyPoints: [
          'The marketplace of ideas theory',
          'Speech as a tool for democratic participation',
          'Balancing individual rights with community interests',
          'The role of tolerance in democratic society'
        ],
        content: 'This lesson helps students understand why free speech is fundamental to democratic governance and how citizens can use their voice effectively in civic life while respecting others\' rights.',
        relatedTopics: ['Democratic Theory', 'Civic Participation', 'Constitutional Democracy', 'Tolerance']
      };
    } else if (id === 'annenberg-press-freedom') {
      return {
        title: 'Freedom of the Press',
        source: 'Annenberg Classroom',
        url: 'annenbergclassroom.org',
        type: 'article',
        duration: '9 min read',
        image: pressNewsImage,
        summary: 'An examination of press freedom principles, prior restraint doctrine, and the relationship between journalism and democracy.',
        keyPoints: [
          'The prior restraint doctrine and Pentagon Papers case',
          'Shield laws and reporter\'s privilege',
          'Access to government information',
          'The press as the "fourth estate"'
        ],
        content: 'Press freedom serves as a crucial check on government power and keeps citizens informed. This article explores how courts have protected journalism while addressing legitimate security concerns.',
        relatedTopics: ['Journalism', 'Government Transparency', 'Prior Restraint', 'Fourth Estate']
      };
    } else if (id === 'khan-academy-press-overview') {
      return {
        title: 'Freedom of the Press: Overview',
        source: 'Khan Academy',
        url: 'khanacademy.org',
        type: 'video',
        duration: '8 min',
        image: pressNewsImage,
        summary: 'Video overview of press freedom rights, including landmark cases and contemporary challenges facing journalism.',
        keyPoints: [
          'New York Times v. Sullivan and actual malice standard',
          'Government secrecy vs. public\'s right to know',
          'Digital age challenges for traditional journalism',
          'International press freedom comparisons'
        ],
        content: 'This video provides an accessible introduction to press freedom concepts, showing how these rights have evolved to meet changing media landscapes while maintaining core democratic functions.',
        relatedTopics: ['Media Law', 'Defamation', 'Digital Journalism', 'International Law']
      };
    } else if (id === 'khan-academy-online-hate-speech') {
      return {
        title: 'Should Online Platforms Censor Hate Speech?',
        source: 'Khan Academy',
        url: 'khanacademy.org',
        type: 'video',
        duration: '10 min',
        image: anonymousMaskImage,
        summary: 'Analysis of the debate over content moderation, exploring arguments for and against platform regulation of speech.',
        keyPoints: [
          'The distinction between government censorship and private platform policies',
          'Section 230 protections and their implications',
          'Global approaches to online speech regulation',
          'The challenge of defining "hate speech"'
        ],
        content: 'This video examines one of the most contentious issues in digital rights: whether and how online platforms should moderate content, balancing free expression with user safety.',
        relatedTopics: ['Digital Rights', 'Content Moderation', 'Section 230', 'Online Safety']
      };
    } else {
      return {
        title: 'The First Amendment on Campus and Online',
        source: 'National Constitution Center',
        url: 'constitutioncenter.org',
        type: 'podcast',
        duration: '35 min',
        image: anonymousMaskImage,
        summary: 'Podcast discussion of how First Amendment principles apply to both university settings and digital platforms.',
        keyPoints: [
          'Academic freedom and its limits',
          'The public forum doctrine in digital spaces',
          'Campus speech codes and their constitutional validity',
          'The future of online speech regulation'
        ],
        content: 'This podcast features expert discussion of how traditional First Amendment principles apply to modern contexts like social media and university campuses, exploring current legal debates.',
        relatedTopics: ['Academic Freedom', 'Campus Speech', 'Digital Platforms', 'Legal Analysis']
      };
    }
  };

  const resourceData = getResourceData(resourceId);

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
        <div className="flex items-center gap-2 flex-1 mx-4">
          <Globe className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600 truncate">{resourceData.url}</span>
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
                src={resourceData.image}
                alt={resourceData.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                {getResourceIcon(resourceData.type)}
                {resourceData.type}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {resourceData.duration}
              </span>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
              {resourceData.title}
            </h1>
            
            <p className="text-sm text-green-600 font-medium mb-4">
              {resourceData.source}
            </p>
            
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {resourceData.summary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700 transition-colors">
              {resourceData.type === 'video' || resourceData.type === 'podcast' ? 'Watch Now' : 'Read Article'}
            </button>
            <button className="bg-gray-100 text-gray-900 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="bg-gray-100 text-gray-900 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          {/* Key Points */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Key topics covered</h3>
            <div className="space-y-2">
              {resourceData.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Preview */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">About this resource</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {resourceData.content}
              </p>
            </div>
          </div>

          {/* Related Topics */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Related topics</h3>
            <div className="flex flex-wrap gap-2">
              {resourceData.relatedTopics.map((topic, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 cursor-pointer transition-colors"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Educational Value */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Educational value</h4>
            <p className="text-sm text-green-800">
              This resource from {resourceData.source} provides authoritative, non-partisan information to help you understand complex civic issues and participate more effectively in democratic processes.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Visit {resourceData.url} for more educational resources
            </p>
            <button className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
              <ExternalLink className="w-3 h-3" />
              View on official website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}