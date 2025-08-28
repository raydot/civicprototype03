import { useState } from 'react';
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ChevronLeft, ThumbsUp } from 'lucide-react';

interface PolicyClarificationScreenProps {
  onBack: () => void;
  onSubmit: (selectedOption?: string) => void;
}

export default function PolicyClarificationScreen({ onBack, onSubmit }: PolicyClarificationScreenProps) {
  const [selectedOption, setSelectedOption] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleSubmit = () => {
    // Convert selectedOption value to readable text
    const optionText = {
      'comprehensive-environmental': 'Comprehensive Environmental Policy',
      'renewable-energy': 'Renewable Energy Programs',
      'conservation': 'Environmental Conservation',
      'pollution-control': 'Pollution Control Measures',
      'sustainability': 'Sustainability Initiatives'
    }[selectedOption] || selectedOption;
    
    onSubmit(optionText);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="p-1 h-auto hover:bg-transparent -ml-1"
        >
          <ChevronLeft size={20} className="text-black" />
        </Button>
        <h1 className="text-lg font-medium text-black">Policy Mapping</h1>
        <div className="w-8 h-8"></div>
      </div>

      {/* User input section */}
      <div className="px-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm font-medium text-black mb-1">Your input:</p>
          <p className="text-sm text-gray-700">
            "Doing more about the environment, beyond electric cars."
          </p>
        </div>
      </div>

      {/* Help card */}
      <div className="px-4 mb-6">
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤝</span>
            <h3 className="text-base font-medium text-black">Help us understand</h3>
          </div>
          
          <p className="text-sm text-gray-700 mb-4">
            Could you clarify what you mean by "doing more about the environment, beyond electric cars"?
          </p>

          <div className="space-y-4">
            {/* Dropdown */}
            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Select what matters most:
              </label>
              <Select value={selectedOption} onValueChange={setSelectedOption}>
                <SelectTrigger className="w-full border-2 border-gray-200 rounded-lg h-12">
                  <SelectValue placeholder="Comprehensive Environmental Policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive-environmental">Comprehensive Environmental Policy</SelectItem>
                  <SelectItem value="renewable-energy">Renewable energy programs</SelectItem>
                  <SelectItem value="conservation">Environmental conservation</SelectItem>
                  <SelectItem value="pollution-control">Pollution control measures</SelectItem>
                  <SelectItem value="sustainability">Sustainability initiatives</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text area */}
            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Additional details (optional):
              </label>
              <Textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Type here..."
                className="w-full min-h-24 border-2 border-gray-200 rounded-lg p-3 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-auto px-4 pb-8">
        <Button 
          onClick={handleSubmit}
          className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center gap-2"
        >
          <ThumbsUp size={16} />
          Update
        </Button>
      </div>
    </div>
  );
}