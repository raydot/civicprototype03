export const layoutHeights = {
  header: '3.5rem',        // 56px - standard header height
  headerCompact: '3rem',   // 48px - compact header for nested screens
  bottomNav: '4.5rem',     // 72px - bottom navigation height (includes safe area)
  bottomNavMd: '4rem',     // 64px - bottom navigation on tablets
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  toast: 70,
} as const;

export const layoutClasses = {
  screenContainer: 'w-full min-h-screen bg-white flex flex-col',
  header: 'flex items-center justify-between px-4 py-3 border-b border-gray-100',
  headerCompact: 'flex items-center justify-between px-4 py-2 border-b border-gray-100',
  contentArea: 'flex-1 overflow-y-auto',
  contentWithBottomNav: 'flex-1 overflow-y-auto pb-20 md:pb-16',
  bottomNavSpacer: 'h-20 md:h-16',
} as const;
