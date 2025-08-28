import { Button } from "./ui/button";
import { ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react';

interface PolicyMapperScreenProps {
  onBack: () => void;
  onConfirm: () => void;
  onNotQuite: () => void;
}

export default function PolicyMapperScreen({ onBack, onConfirm, onNotQuite }: PolicyMapperScreenProps) {
  const handleConfirmClick = () => {
    // Make this button unresponsive - do nothing
    return;
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

      {/* Policy match card */}
      <div className="px-4 mb-8">
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="mb-3">
            <h3 className="text-base font-medium text-black mb-1">EV Infrastructure Investment</h3>
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <p className="text-sm font-medium text-gray-700">92% match</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Policies related to electric vehicle charging stations, infrastructure development, and supporting EV adoption programs.
          </p>
          <p className="text-sm font-medium text-black mb-4">Does this match your concern?</p>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleConfirmClick}
              className="flex-1 bg-gray-300 text-gray-600 py-3 rounded-lg text-sm font-medium cursor-default hover:bg-gray-300 flex items-center justify-center gap-2"
            >
              <ThumbsUp size={16} />
              Yes, that's right
            </Button>
            <Button 
              onClick={onNotQuite}
              variant="outline"
              className="flex-1 border-2 border-orange-600 text-orange-600 bg-orange-50 hover:bg-orange-100 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <ThumbsDown size={16} />
              Not quite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}