import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { layoutClasses } from '../tokens/layout';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function ScreenHeader({ 
  title, 
  onBack, 
  rightAction,
  compact = false,
  className = '' 
}: ScreenHeaderProps) {
  const headerClass = compact ? layoutClasses.headerCompact : layoutClasses.header;

  return (
    <div className={`${headerClass} ${className}`}>
      {onBack ? (
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="p-1 h-auto hover:bg-transparent -ml-1"
          aria-label="Go back"
        >
          <ChevronLeft size={20} className="text-black" />
        </Button>
      ) : (
        <div className="w-8" />
      )}

      {title && (
        <h1 className="text-lg font-medium text-black">
          {title}
        </h1>
      )}

      {rightAction || <div className="w-8" />}
    </div>
  );
}
