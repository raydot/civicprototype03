import { UserData } from '../types/app';

export const getDefaultPolicyMapping = (priority: string): string => {
  const lowerPriority = priority.toLowerCase();
  
  if (lowerPriority.includes('environment')) {
    return 'EV Infrastructure Investment';
  } else if (lowerPriority.includes('free speech') || lowerPriority.includes('speech')) {
    return 'First Amendment Protections';
  } else if (lowerPriority.includes('pronoun') || lowerPriority.includes('gender')) {
    return 'Gender Identity Rights';
  } else if (lowerPriority.includes('social media') || lowerPriority.includes('censorship')) {
    return 'Platform Content Policies';
  } else if (lowerPriority.includes('corruption') || lowerPriority.includes('transparency')) {
    return 'Government Accountability';
  } else if (lowerPriority.includes('college') || lowerPriority.includes('education')) {
    return 'Higher Education Affordability';
  }
  
  return 'General Policy Mapping';
};

export const handlePriorityConfirmation = (
  priorityIndex: number,
  userData: UserData,
  confirmedMappings: { [key: number]: string },
  setConfirmedMappings: (mappings: { [key: number]: string }) => void,
  setIsFirstPriorityCorrected: (corrected: boolean) => void
): boolean => {
  if (priorityIndex === 0) {
    setIsFirstPriorityCorrected(true);
  }
  
  // Mark this priority as confirmed with its default mapping
  const priority = userData.priorities[priorityIndex];
  const defaultMapping = getDefaultPolicyMapping(priority);
  const newMappings = { ...confirmedMappings, [priorityIndex]: defaultMapping };
  setConfirmedMappings(newMappings);
  
  // Check if all priorities are now confirmed
  const allConfirmed = userData.priorities.every((_, index) => 
    newMappings[index] !== undefined
  );
  
  return allConfirmed && userData.priorities.length === 6;
};

export const handlePolicyEditUpdate = (
  editingPriorityIndex: number,
  userData: UserData,
  originalInput: string,
  selectedOption?: string,
  additionalDetails?: string
): {
  updatedUserData: UserData;
  updatedSelectedOption: string;
  shouldClearPolicyOption: boolean;
} => {
  let updatedUserData = userData;
  let shouldClearPolicyOption = false;
  
  // If user updated their original input, update the priorities array
  if (additionalDetails && additionalDetails.trim() !== userData.priorities[editingPriorityIndex]) {
    const updatedPriorities = [...userData.priorities];
    updatedPriorities[editingPriorityIndex] = additionalDetails.trim();
    updatedUserData = { ...userData, priorities: updatedPriorities };
    shouldClearPolicyOption = true;
  }
  
  const updatedSelectedOption = selectedOption || '';
  
  return {
    updatedUserData,
    updatedSelectedOption,
    shouldClearPolicyOption,
  };
};
