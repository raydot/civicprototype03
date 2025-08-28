import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { GripVertical } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import voterPrimeLogo from 'figma:asset/801ef4806bb3cd8196927850a6f8118dfb616704.png';

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

interface DraggablePriorityItemProps {
  index: number;
  priority: { id: string; text: string };
  onPriorityChange: (index: number, value: string) => void;
  onMoveItem: (dragIndex: number, hoverIndex: number) => void;
  isDemoFilled: boolean;
  onViewText: (text: string, title: string) => void;
}

const DraggablePriorityItem = ({ 
  index, 
  priority, 
  onPriorityChange, 
  onMoveItem, 
  isDemoFilled,
  onViewText 
}: DraggablePriorityItemProps) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'priority',
    item: { index },
    canDrag: true, // Always allow dragging in demo
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'priority',
    hover: (item: { index: number }, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      if (item.index !== index) {
        onMoveItem(item.index, index);
        item.index = index;
      }
    },
  });

  const canDrag = true; // Always show drag handle in demo

  const handleClick = () => {
    if (isDemoFilled && priority.text.trim()) {
      onViewText(priority.text, `Priority ${index + 1}`);
    }
  };

  return (
    <div
      ref={(node) => {
        preview(node);
        drop(node);
      }}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      {canDrag && (
        <div
          ref={drag}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={16} />
        </div>
      )}
      <div className="flex-1">
        <Input
          type="text"
          value={priority.text}
          onChange={(e) => onPriorityChange(index, e.target.value)}
          onClick={handleClick}
          placeholder={`Priority ${index + 1}`}
          className={`w-full h-12 border-2 border-gray-300 rounded-md px-4 text-base bg-gray-50 text-gray-700 ${
            isDemoFilled ? 'cursor-pointer' : 'cursor-default'
          }`}
          maxLength={250}
          readOnly={isDemoFilled}
          title={isDemoFilled ? "Click to view full text" : ""}
        />
      </div>
    </div>
  );
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

  const handleAutoFill = () => {
    setZipCode(DEMO_DATA.zipCode);
    setPriorities(DEMO_DATA.priorities.map((text, index) => ({ id: `priority-${index}`, text })));
    setIsDemoFilled(true);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Do nothing - field is read-only
  };

  const handlePriorityChange = (index: number, value: string) => {
    // Do nothing - fields are read-only
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
    if (zipCode.length === 5 && priorities.some(p => p.text.trim())) {
      onSubmit({ zipCode, priorities: priorities.filter(p => p.text.trim()).map(p => p.text) });
    }
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
    <DndProvider backend={HTML5Backend}>
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
        {!isDemoFilled && (
          <div className="mb-8 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-orange-800 font-medium mb-3">
                This is a demo! Click below to auto-fill with sample data
              </p>
              <Button 
                onClick={handleAutoFill}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
              >
                Fill Demo Data
              </Button>
            </div>
          </div>
        )}
        
        {isDemoFilled && (
          <div className="mb-8 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <p className="text-sm text-center text-orange-800 font-medium">
              Demo data loaded - click any field to view full text
            </p>
          </div>
        )}

        {/* ZIP Code section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium text-black">Enter ZIP Code</label>
            <div className="relative">
              <Input
                type="text"
                value={zipCode}
                onChange={handleZipCodeChange}
                onClick={handleZipCodeClick}
                placeholder="#####"
                className={`w-20 h-10 border-2 border-gray-300 rounded-md px-3 text-center text-base bg-gray-50 text-gray-700 ${
                  isDemoFilled ? 'cursor-pointer' : 'cursor-default'
                }`}
                maxLength={5}
                readOnly={isDemoFilled}
                title={isDemoFilled ? "Click to view full text" : ""}
              />
            </div>
          </div>
        </div>

        {/* Priorities section */}
        <div className="mb-6">
          <div className="space-y-4">
            {priorities.map((priority, index) => (
              <DraggablePriorityItem
                key={priority.id}
                index={index}
                priority={priority}
                onPriorityChange={handlePriorityChange}
                onMoveItem={handleMoveItem}
                isDemoFilled={isDemoFilled}
                onViewText={handleViewText}
              />
            ))}
          </div>
        </div>

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
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-gray-900">
              {dialogContent.title}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="mt-3">
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {dialogContent.text}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 text-center">
            <Button 
              onClick={() => setShowDialog(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-2 rounded-lg"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DndProvider>
  );
}