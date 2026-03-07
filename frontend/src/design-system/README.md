# VoterPrime Design System

A consistent design system for the VoterPrime application, replacing Figma port inconsistencies with maintainable patterns.

## Overview

This design system provides:
- **Design tokens** - Spacing, colors, typography, breakpoints
- **Layout components** - Consistent screen structure
- **Component patterns** - Reusable UI patterns

## Quick Start

### Basic Screen Layout

```tsx
import { ScreenLayout, ScreenHeader, ContentArea } from '@/design-system';

function MyScreen({ onBack }) {
  return (
    <ScreenLayout hasBottomNav>
      <ScreenHeader title="My Screen" onBack={onBack} />
      <ContentArea hasBottomNav>
        {/* Your content here */}
      </ContentArea>
    </ScreenLayout>
  );
}
```

## Components

### ScreenLayout

Main container for all screens. Handles full-height layout and background.

**Props:**
- `hasBottomNav?: boolean` - Whether screen has bottom navigation
- `className?: string` - Additional classes

**Example:**
```tsx
<ScreenLayout hasBottomNav>
  {/* Screen content */}
</ScreenLayout>
```

### ScreenHeader

Standardized header with back button, title, and optional right action.

**Props:**
- `title?: string` - Header title
- `onBack?: () => void` - Back button handler
- `rightAction?: ReactNode` - Right side content (e.g., save button)
- `compact?: boolean` - Use compact height
- `className?: string` - Additional classes

**Examples:**
```tsx
// Basic header with back button
<ScreenHeader title="Settings" onBack={handleBack} />

// Header with right action
<ScreenHeader 
  title="Edit Profile" 
  onBack={handleBack}
  rightAction={<Button>Save</Button>}
/>

// Compact header for nested screens
<ScreenHeader title="Details" onBack={handleBack} compact />
```

### ContentArea

Scrollable content container with proper padding and bottom nav spacing.

**Props:**
- `hasBottomNav?: boolean` - Adds bottom padding for nav
- `padding?: 'default' | 'none' | 'compact'` - Padding preset
- `className?: string` - Additional classes

**Examples:**
```tsx
// Default padding with bottom nav
<ContentArea hasBottomNav>
  <div>Content</div>
</ContentArea>

// No padding (for full-width content)
<ContentArea hasBottomNav padding="none">
  <img src="..." className="w-full" />
</ContentArea>

// Compact padding
<ContentArea padding="compact">
  <div>Tight content</div>
</ContentArea>
```

## Design Tokens

### Spacing

```tsx
import { spacing, safeArea } from '@/design-system';

// spacing.xs = '0.25rem' (4px)
// spacing.sm = '0.5rem' (8px)
// spacing.md = '0.75rem' (12px)
// spacing.lg = '1rem' (16px)
// spacing.xl = '1.5rem' (24px)
// spacing['2xl'] = '2rem' (32px)
// spacing['3xl'] = '3rem' (48px)
// spacing['4xl'] = '4rem' (64px)

// Safe areas for mobile devices
// safeArea.top = '1rem'
// safeArea.bottom = '1.5rem'
// safeArea.sides = '1rem'
```

### Layout Heights

```tsx
import { layoutHeights } from '@/design-system';

// layoutHeights.header = '3.5rem' (56px)
// layoutHeights.headerCompact = '3rem' (48px)
// layoutHeights.bottomNav = '4.5rem' (72px)
// layoutHeights.bottomNavMd = '4rem' (64px)
```

### Breakpoints

```tsx
import { breakpoints } from '@/design-system';

// breakpoints.sm = '640px'
// breakpoints.md = '768px'
// breakpoints.lg = '1024px'
// breakpoints.xl = '1280px'
```

## Migration Guide

### Before (Figma port pattern)
```tsx
function OldScreen({ onBack }) {
  return (
    <div className="h-full bg-white flex flex-col relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Button onClick={onBack} variant="ghost" className="p-1 h-auto hover:bg-transparent -ml-1">
          <ChevronLeft size={20} className="text-black" />
        </Button>
        <h1 className="text-lg font-medium text-black">My Screen</h1>
        <div className="w-8 h-8"></div>
      </div>
      
      <div className="flex-1 px-4 pt-4 pb-24 md:pb-20 overflow-y-auto">
        {/* Content */}
      </div>
      
      <BottomNavigation {...navProps} />
    </div>
  );
}
```

### After (Design system pattern)
```tsx
import { ScreenLayout, ScreenHeader, ContentArea } from '@/design-system';

function NewScreen({ onBack }) {
  return (
    <ScreenLayout hasBottomNav>
      <ScreenHeader title="My Screen" onBack={onBack} />
      <ContentArea hasBottomNav>
        {/* Content */}
      </ContentArea>
      <BottomNavigation {...navProps} />
    </ScreenLayout>
  );
}
```

## Benefits

✅ **Consistency** - All screens use same layout structure
✅ **Maintainability** - Change once, update everywhere
✅ **Responsive** - Built-in mobile/tablet/desktop handling
✅ **Accessibility** - Proper ARIA labels and semantic HTML
✅ **DRY** - No repeated layout code across 38+ screens

## Next Steps

1. Migrate existing screens to use design system components
2. Add more component patterns (cards, lists, buttons) as needed
3. Document component variants and usage patterns
4. Create Storybook documentation (optional)
