import { Button } from "./ui/button";
import { ChevronLeft, ThumbsDown } from 'lucide-react';

interface PolicyAlternativesScreenProps {
  onBack: () => void;
  onNoneMatch: () => void;
}

export default function PolicyAlternativesScreen({ onBack, onNoneMatch }: PolicyAlternativesScreenProps) {
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

      {/* Alternative matches heading */}
      <div className="px-4 mb-4">
        <p className="text-base font-medium text-black">We found a few possible matches:</p>
      </div>

      {/* Alternative options - made unclickable */}
      <div className="px-4 mb-6 space-y-4">
        <div className="border-2 border-gray-200 rounded-lg p-4 opacity-60 cursor-default">
          <h3 className="text-base font-medium text-black mb-1">Electric Vehicle Mandates</h3>
          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
            Government requirements and regulations for electric vehicle adoption and manufacturing standards.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium text-gray-700">85% match</p>
          </div>
        </div>

        <div className="border-2 border-gray-200 rounded-lg p-4 opacity-60 cursor-default">
          <h3 className="text-base font-medium text-black mb-1">Green Tech Innovation</h3>
          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
            Support for renewable energy technology development and environmental innovation programs.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium text-gray-700">72% match</p>
          </div>
        </div>
      </div>

      {/* Bottom button - only this one is functional */}
      <div className="mt-auto px-4 pb-8">
        <Button 
          onClick={onNoneMatch}
          variant="outline"
          className="w-full border-2 border-orange-600 text-orange-600 bg-orange-50 hover:bg-orange-100 py-3 rounded-lg text-base font-medium flex items-center justify-center gap-2"
        >
          <ThumbsDown size={16} />
          None of these match
        </Button>
      </div>
    </div>
  );
}