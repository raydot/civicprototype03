import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from "../ui/button";
import BottomNavigation from '../BottomNavigation';
import { DemoCallout, ZipCodeInput, PriorityList, TextViewDialog } from './';
import { voterPrimeLogo } from '@/assets';

interface PriorityInputScreenProps {
  onBack: () => void;
  onSubmit: (data: { zipCode: string; priorities: string[] }) => void;
  showReturnOption?: boolean;
  previousScreenName?: string | null;
  initialData?: { zipCode: string; priorities: string[] };
  onNavToMappings?: () => void;
  onNavToRecommendations?: () => void;
  onNavToSaveShare?: () => void;
}

const DEMO_DATA = {
  zipCode: '48104',
  priorities: [
    'Doing more about the environment, beyond electric cars.',
    'I don\'t want to be labeled or canceled just for having questions.',
    'Pronouns should be a personal choice, not mandatory.',
    'Censorship on social media is concerning.',
    'Political corruption makes politics hard to trust.',
    'College costs seem unjustifiably high.'
  ]
};


export default function PriorityInputScreen({ 
  onBack, 
  onSubmit, 
  showReturnOption = false, 
  previousScreenName,
  initialData,
  onNavToMappings,
  onNavToRecommendations,
  onNavToSaveShare
}: PriorityInputScreenProps) {
  // Start with empty state, then allow autofill
  const [zipCode, setZipCode] = useState(initialData?.zipCode || '');
  const [priorities, setPriorities] = useState(() => {
    if (initialData?.priorities) {
      return initialData.priorities.map((text, index) => ({ id: `priority-${index}`, text }));
    }
    return Array.from({ length: 6 }, (_, index) => ({ id: `priority-${index}`, text: '' }));
  });
  const [isDemoFilled, setIsDemoFilled] = useState(!!initialData);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', text: '' });
  const [showDemoCallout, setShowDemoCallout] = useState(false);
  const [debugBuffer, setDebugBuffer] = useState('');

  // Global DEBUG toggle listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newBuffer = (debugBuffer + e.key.toUpperCase()).slice(-5); // Keep last 5 characters
      setDebugBuffer(newBuffer);
      
      if (newBuffer === 'DEBUG') {
        setShowDemoCallout(!showDemoCallout);
        setDebugBuffer(''); // Reset buffer after successful toggle
        toast.success(showDemoCallout ? 'Demo callout hidden' : 'Demo callout shown');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugBuffer, showDemoCallout]);

  const handleAutoFill = () => {
    setZipCode(DEMO_DATA.zipCode);
    setPriorities(DEMO_DATA.priorities.map((text, index) => ({ id: `priority-${index}`, text })));
    setIsDemoFilled(true);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 5 characters
    if (/^\d{0,5}$/.test(value)) {
      setZipCode(value);
    }
  };

  const handlePriorityChange = (index: number, value: string) => {
    // Update the priority text
    const newPriorities = [...priorities];
    newPriorities[index] = { ...newPriorities[index], text: value };
    setPriorities(newPriorities);
  };

  const handleMoveItem = (dragIndex: number, hoverIndex: number) => {
    // Still allow reordering for demo purposes
    const newPriorities = [...priorities];
    const draggedItem = newPriorities[dragIndex];
    newPriorities.splice(dragIndex, 1);
    newPriorities.splice(hoverIndex, 0, draggedItem);
    setPriorities(newPriorities);
  };

  const handleSubmit = () => {
    const hasZipCode = zipCode.length === 5;
    const hasPriorities = priorities.some(p => p.text.trim());
    
    if (!hasZipCode && !hasPriorities) {
      toast.error('Please enter a ZIP code and at least one priority');
      return;
    }
    
    if (!hasZipCode) {
      toast.error('Please enter a valid 5-digit ZIP code');
      return;
    }
    
    if (!hasPriorities) {
      toast.error('Please enter at least one priority');
      return;
    }
    
    // All validation passed
    onSubmit({ zipCode, priorities: priorities.filter(p => p.text.trim()).map(p => p.text) });
  };

  const handleViewText = (text: string, title: string) => {
    setDialogContent({ title, text });
    setShowDialog(true);
  };

  const handleZipCodeClick = () => {
    if (isDemoFilled && zipCode.trim()) {
      handleViewText(zipCode, 'ZIP Code');
    }
  };

  const isValid = zipCode.length === 5 && priorities.some(p => p.text.trim());

  const handleNavToConcerns = () => {
    // Already on concerns screen, do nothing
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-6 pt-4">
        <div className="w-6"></div> {/* Spacer for centering */}
        <img 
          src={voterPrimeLogo} 
          alt="VoterPrime" 
          className="h-6"
        />
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-20 px-6">

        {/* Description */}
        <div className="mb-6">
          <p className="text-base text-black text-center leading-relaxed">
            Tell us what matters to you most and we'll suggest civic actions that align with your values
          </p>
        </div>

        {/* Demo Callout */}
        <DemoCallout 
          isDemoFilled={isDemoFilled}
          showDemoCallout={showDemoCallout}
          onAutoFill={handleAutoFill}
        />

        {/* ZIP Code section */}
        <ZipCodeInput
          zipCode={zipCode}
          onChange={handleZipCodeChange}
          onClick={handleZipCodeClick}
          isDemoFilled={isDemoFilled}
        />

        {/* Priorities section */}
        <PriorityList
          priorities={priorities}
          onPriorityChange={handlePriorityChange}
          onMoveItem={handleMoveItem}
          isDemoFilled={isDemoFilled}
          onViewText={handleViewText}
        />

        {/* Submit button */}
        <div className="pb-4">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
            }}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-base font-semibold"
          >
            SUBMIT
          </Button>
        </div>
      </div>

      {/* Bottom Navigation - only show if user is editing concerns from another screen */}
      {showReturnOption && onNavToMappings && onNavToRecommendations && onNavToSaveShare && (
        <BottomNavigation 
          onNavToConcerns={handleNavToConcerns}
          onNavToMappings={onNavToMappings}
          onNavToRecommendations={onNavToRecommendations}
          onNavToSaveShare={onNavToSaveShare}
          currentScreen="concerns"
        />
      )}

      {/* View Full Text Dialog */}
      <TextViewDialog
        showDialog={showDialog}
        onClose={() => setShowDialog(false)}
        dialogContent={dialogContent}
      />
    </div>
  );
}
