import { ChevronLeft, ExternalLink, Calendar, MapPin, Users, FileText, X } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';

interface BallotpediaViewScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  measureId: string;
}

export default function BallotpediaViewScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToRecommendations,
  measureId
}: BallotpediaViewScreenProps) {
  
  const getMeasureData = (id: string) => {
    if (id === 'transparency-initiative') {
      return {
        title: 'Michigan Provide that the Executive Branch and State Legislature are Subject to Public Information Requests Initiative (2024)',
        subtitle: 'Government Transparency Initiative',
        status: 'On the ballot',
        electionDate: 'November 5, 2024',
        summary: 'This initiated constitutional amendment would amend the Michigan Constitution to provide that members of the executive branch and the State Legislature are subject to public information requests under the Freedom of Information Act.',
        sections: [
          {
            title: 'Background',
            content: 'Currently, the Michigan Freedom of Information Act (FOIA) does not apply to the executive branch or the State Legislature. This means that records and communications from the Governor\'s office, other executive departments, and legislative offices are not subject to public disclosure requests.'
          },
          {
            title: 'What it would do',
            content: 'If approved, this amendment would extend FOIA requirements to include records from the executive branch and State Legislature, providing greater transparency in government operations and decision-making processes.'
          },
          {
            title: 'Arguments in favor',
            content: 'Supporters argue this would increase government accountability, reduce corruption, and give citizens better access to information about how their government operates.'
          },
          {
            title: 'Arguments against',
            content: 'Opponents worry about the cost of implementation, potential privacy concerns for elected officials, and the administrative burden on government offices.'
          }
        ],
        ballotLanguage: '"Shall the Michigan Constitution be amended to require that members of the executive branch and the State Legislature be subject to the Freedom of Information Act?"'
      };
    } else {
      return {
        title: 'Michigan National Popular Vote Interstate Compact Initiative (2024)',
        subtitle: 'National Popular Vote Compact',
        status: 'On the ballot',
        electionDate: 'November 5, 2024',
        summary: 'This initiated statute would have Michigan join the National Popular Vote Interstate Compact, which would effectively ensure that the candidate who receives the most votes nationwide wins the presidency.',
        sections: [
          {
            title: 'Background',
            content: 'Currently, the president is elected through the Electoral College system. The National Popular Vote Interstate Compact is an agreement among states to award their electoral votes to the presidential candidate who wins the national popular vote.'
          },
          {
            title: 'What it would do',
            content: 'Michigan would join other states in agreeing to award its electoral votes to the presidential candidate who receives the most votes nationwide, regardless of who wins Michigan specifically. The compact only takes effect when states totaling 270+ electoral votes join.'
          },
          {
            title: 'Arguments in favor',
            content: 'Supporters believe every vote should count equally and that the candidate with the most votes nationwide should win. They argue this would increase voter participation and ensure all votes matter.'
          },
          {
            title: 'Arguments against',
            content: 'Opponents argue this could diminish Michigan\'s influence in presidential elections and that the Electoral College system protects the interests of smaller states and encourages coalition-building.'
          }
        ],
        ballotLanguage: '"Shall Michigan join the National Popular Vote Interstate Compact to ensure that the presidential candidate who receives the most votes nationwide wins the presidency?"'
      };
    }
  };

  const measureData = getMeasureData(measureId);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1 mx-4">
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%234285f4' d='M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z'/%3E%3C/svg%3E" 
            alt="Ballotpedia" 
            className="w-5 h-5"
          />
          <span className="text-sm text-gray-600 truncate">ballotpedia.org</span>
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

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
              {measureData.subtitle}
            </h1>
            <p className="text-sm text-gray-600 mb-3">{measureData.title}</p>
            
            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                <Calendar className="w-3 h-3" />
                {measureData.status}
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                <MapPin className="w-3 h-3" />
                {measureData.electionDate}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{measureData.summary}</p>
          </div>

          {/* Ballot Language */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-orange-50">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ballot Language
            </h3>
            <p className="text-sm text-gray-700 italic leading-relaxed">
              {measureData.ballotLanguage}
            </p>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-6">
            {measureData.sections.map((section, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <h3 className="font-medium text-gray-900 mb-3">{section.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Additional Resources */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Additional Resources
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Full ballot text</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </button>
              <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Campaign finance reports</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </button>
              <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">News and analysis</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Information provided by Ballotpedia
            </p>
            <button className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline">
              <ExternalLink className="w-3 h-3" />
              View full page on ballotpedia.org
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}