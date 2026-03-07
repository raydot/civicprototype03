import React from 'react';
import { layoutClasses } from '../tokens/layout';

interface ScreenLayoutProps {
  children: React.ReactNode;
  hasBottomNav?: boolean;
  className?: string;
}

export function ScreenLayout({ 
  children, 
  hasBottomNav = false,
  className = '' 
}: ScreenLayoutProps) {
  return (
    <div className={`${layoutClasses.screenContainer} ${className}`}>
      {children}
    </div>
  );
}

interface ContentAreaProps {
  children: React.ReactNode;
  hasBottomNav?: boolean;
  padding?: 'default' | 'none' | 'compact';
  className?: string;
}

export function ContentArea({ 
  children, 
  hasBottomNav = false,
  padding = 'default',
  className = '' 
}: ContentAreaProps) {
  const paddingClasses = {
    default: 'px-4 py-4 md:px-6 md:py-6',
    compact: 'px-4 py-2 md:px-6 md:py-3',
    none: '',
  };

  const baseClasses = hasBottomNav 
    ? layoutClasses.contentWithBottomNav 
    : layoutClasses.contentArea;

  return (
    <div className={`${baseClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
