import { useState } from 'react';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface PolicyEditScreenProps {
  onBack: () => void;
  onUpdate: (originalInput: string, selectedOption?: string, additionalDetails?: string) => void;
  priorityIndex: number;
  originalPriority: string;
}

interface PolicyOption {
  id: string;
  name: string;
  description: string;
}

export default function PolicyEditScreen({ onBack, onUpdate, priorityIndex, originalPriority }: PolicyEditScreenProps) {
  const [showEditInput, setShowEditInput] = useState(false);
  const [editedInput, setEditedInput] = useState(originalPriority);

  // Get the original mapping result
  const getOriginalMapping = (priority: string) => {
    const lowerPriority = priority.toLowerCase();
    
    if (lowerPriority.includes('environment')) {
      return {
        name: 'EV Infrastructure Investment',
        matchPercentage: 92,
        description: 'Policies related to electric vehicle charging stations, infrastructure development, and supporting EV adoption programs.'
      };
    } else if (lowerPriority.includes('free speech') || lowerPriority.includes('speech')) {
      return {
        name: 'First Amendment Protections',
        matchPercentage: 89,
        description: 'Constitutional safeguards for freedom of expression, assembly, and protection from government censorship.'
      };
    } else if (lowerPriority.includes('pronoun') || lowerPriority.includes('gender')) {
      return {
        name: 'Gender Identity Rights',
        matchPercentage: 85,
        description: 'Legal protections and recognition for gender identity, expression, and pronoun usage in public settings.'
      };
    } else if (lowerPriority.includes('social media') || lowerPriority.includes('censorship')) {
      return {
        name: 'Platform Content Policies',
        matchPercentage: 87,
        description: 'Regulations governing how social media platforms moderate content and handle free speech concerns.'
      };
    } else if (lowerPriority.includes('corruption') || lowerPriority.includes('transparency')) {
      return {
        name: 'Government Accountability',
        matchPercentage: 91,
        description: 'Measures to increase transparency, prevent corruption, and ensure ethical conduct in public office.'
      };
    } else if (lowerPriority.includes('college') || lowerPriority.includes('education')) {
      return {
        name: 'Higher Education Affordability',
        matchPercentage: 88,
        description: 'Policies addressing college costs, student debt, and making higher education more accessible and affordable.'
      };
    }
    
    return {
      name: 'General Policy Mapping',
      matchPercentage: 82,
      description: 'Broad policy category addressing citizen concerns and government responsiveness.'
    };
  };

  // Get alternative policy options based on the original priority
  const getPolicyAlternatives = (priority: string): PolicyOption[] => {
    const lowerPriority = priority.toLowerCase();
    
    if (lowerPriority.includes('environment')) {
      return [
        {
          id: 'comprehensive-environmental',
          name: 'Comprehensive Environmental Policy',
          description: 'Broad environmental initiatives including renewable energy, conservation, and sustainability programs.'
        },
        {
          id: 'renewable-energy',
          name: 'Renewable Energy Programs',
          description: 'Solar, wind, and clean energy development with supporting infrastructure and incentives.'
        },
        {
          id: 'conservation',
          name: 'Environmental Conservation',
          description: 'Protection of natural resources, wildlife habitats, and ecosystem preservation efforts.'
        }
      ];
    } else if (lowerPriority.includes('free speech') || lowerPriority.includes('speech')) {
      return [
        {
          id: 'first-amendment',
          name: 'First Amendment Rights',
          description: 'Constitutional protections for free expression, assembly, and religious liberty.'
        },
        {
          id: 'content-moderation',
          name: 'Content Moderation Policies',
          description: 'Regulations on how platforms handle speech, misinformation, and harmful content.'
        },
        {
          id: 'platform-regulation',
          name: 'Social Media Platform Regulation',
          description: 'Government oversight of tech companies and their content policies.'
        }
      ];
    } else if (lowerPriority.includes('pronoun') || lowerPriority.includes('gender')) {
      return [
        {
          id: 'lgbtq-rights',
          name: 'LGBTQ+ Rights and Protections',
          description: 'Legal protections for gender identity, expression, and anti-discrimination measures.'
        },
        {
          id: 'identity-protection',
          name: 'Identity and Expression Protection',
          description: 'Policies supporting individual autonomy and identity recognition in public spaces.'
        },
        {
          id: 'civil-liberties',
          name: 'Civil Liberties',
          description: 'Fundamental rights and freedoms protected by constitutional principles.'
        }
      ];
    } else if (lowerPriority.includes('social media') || lowerPriority.includes('censorship')) {
      return [
        {
          id: 'platform-accountability',
          name: 'Social Media Accountability',
          description: 'Requirements for transparency and fairness in content moderation practices.'
        },
        {
          id: 'tech-oversight',
          name: 'Technology Company Oversight',
          description: 'Government regulation of big tech companies and their market practices.'
        },
        {
          id: 'content-regulation',
          name: 'Content Regulation Policies',
          description: 'Balance between free speech and preventing harmful or misleading content online.'
        }
      ];
    } else if (lowerPriority.includes('corruption') || lowerPriority.includes('transparency')) {
      return [
        {
          id: 'anti-corruption',
          name: 'Anti-Corruption Measures',
          description: 'Laws and enforcement to prevent bribery, fraud, and abuse of public office.'
        },
        {
          id: 'ethics-reform',
          name: 'Ethics and Accountability Reform',
          description: 'Stricter ethical standards and oversight for public officials and institutions.'
        },
        {
          id: 'lobbying-reform',
          name: 'Lobbying Reform',
          description: 'Regulations on influence peddling and special interest access to government.'
        }
      ];
    } else if (lowerPriority.includes('college') || lowerPriority.includes('education')) {
      return [
        {
          id: 'student-loans',
          name: 'Student Loan Reform',
          description: 'Changes to interest rates, forgiveness programs, and repayment options.'
        },
        {
          id: 'college-affordability',
          name: 'College Affordability',
          description: 'Making higher education more accessible through funding and cost reduction.'
        },
        {
          id: 'education-funding',
          name: 'Education Funding',
          description: 'Increased investment in schools, universities, and educational programs.'
        }
      ];
    }
    
    // Default alternatives
    return [
      {
        id: 'economic-policy',
        name: 'Economic Policy',
        description: 'Policies affecting jobs, wages, taxes, and economic development.'
      },
      {
        id: 'social-issues',
        name: 'Social Issues',
        description: 'Policies addressing community welfare, equality, and social justice.'
      },
      {
        id: 'civil-rights',
        name: 'Civil Rights',
        description: 'Protection of individual rights and freedoms under the law.'
      }
    ];
  };

  const originalMapping = getOriginalMapping(originalPriority);
  const policyAlternatives = getPolicyAlternatives(originalPriority);

  const handleOptionSelect = (option: PolicyOption) => {
    onUpdate(originalPriority, option.name);
  };

  const handleNoneOfThese = () => {
    setShowEditInput(true);
  };

  const handleUpdateInput = () => {
    if (editedInput.trim() !== originalPriority) {
      // User changed their input, generate new mapping
      onUpdate(editedInput.trim(), 'Updated Input (New Mapping)', editedInput.trim());
    } else {
      // No change, just go back
      setShowEditInput(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedInput(originalPriority);
    setShowEditInput(false);
  };

  if (showEditInput) {
    return (
      <div className="h-full bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <Button 
            onClick={handleCancelEdit}
            variant="ghost" 
            className="p-1 h-auto hover:bg-transparent -ml-1"
          >
            <ChevronLeft size={20} className="text-black" />
          </Button>
          <h1 className="text-lg font-medium text-black">Update Your Concern</h1>
          <div className="w-8 h-8"></div>
        </div>

        <div className="flex-1 px-4 py-4 overflow-y-auto">
          {/* Instructions */}
          <div className="mb-6">
            <p className="text-sm font-medium text-black mb-2">
              Help us understand your concern better
            </p>
          </div>

          {/* Edit Input */}
          <div className="mb-6">
            <label className="text-sm font-medium text-black mb-2 block">
              Concern #{priorityIndex + 1}
            </label>
            <Textarea
              value={editedInput}
              onChange={(e) => setEditedInput(e.target.value)}
              placeholder="Describe your concern with more specific details..."
              className="w-full min-h-32 border-2 border-gray-200 rounded-lg p-3 resize-none bg-white text-sm"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about what aspects matter most to you
            </p>
          </div>
        </div>

        {/* Update button */}
        <div className="px-4 pb-6 border-t border-gray-100 pt-4 bg-white">
          <Button 
            onClick={handleUpdateInput}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-base font-medium"
            disabled={!editedInput.trim()}
          >
            Get New Mapping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="p-1 h-auto hover:bg-transparent -ml-1"
        >
          <ChevronLeft size={20} className="text-black" />
        </Button>
        <h1 className="text-lg font-medium text-black">Improve Mapping</h1>
        <div className="w-8 h-8"></div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Orange header */}
        <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-4">
          <p className="text-orange-700 text-sm font-medium">
            PLEASE REVIEW THIS MAPPING
          </p>
        </div>

        {/* Original Concern */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {priorityIndex + 1}
            </div>
            <span className="text-sm font-medium text-black">Your concern:</span>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-black leading-relaxed">
              "{originalPriority}"
            </p>
          </div>

          {/* Original Mapping Result */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-black text-base">
                {originalMapping.name}
              </h3>
              <div className="flex items-center gap-1">
                <Check size={14} className="text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {originalMapping.matchPercentage}% match
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {originalMapping.description}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <p className="text-sm font-medium text-black mb-1">
            Or choose a better match:
          </p>
          <p className="text-xs text-gray-600">
            Select the option that best fits your concern
          </p>
        </div>

        {/* Policy Options */}
        <div className="space-y-3 mb-6">
          {policyAlternatives.map((option, index) => (
            <Button
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              variant="outline"
              className="w-full h-auto p-4 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 text-left justify-between group transition-all"
            >
              <div className="flex-1 pr-3">
                <div className="text-sm font-medium text-black mb-1 group-hover:text-green-700">
                  {option.name}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed group-hover:text-green-600 break-words">
                  {option.description}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Check size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ChevronRight size={16} className="text-gray-400 group-hover:text-green-500" />
              </div>
            </Button>
          ))}
        </div>

        {/* None of these option */}
        <div className="border-t border-gray-200 pt-4">
          <Button
            onClick={handleNoneOfThese}
            variant="outline"
            className="w-full h-auto p-4 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-left justify-between group transition-all"
          >
            <div className="flex-1 pr-3">
              <div className="text-sm font-medium text-gray-700 mb-1 group-hover:text-gray-800">
                None of these match
              </div>
              <div className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-600 break-words">
                Let me clarify my original concern to get better results
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-500 flex-shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
}