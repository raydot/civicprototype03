import React from 'react';
import { Toaster } from './components/ui/toaster';
// Import test functions for development
import './services/testPolicyMatching';

// Import refactored modules
import { useAppState } from './hooks/useAppState';
import { useNavigation } from './hooks/useNavigation';
import { AppRouter } from './components/AppRouter';
import { 
  getDefaultPolicyMapping, 
  handlePriorityConfirmation, 
  handlePolicyEditUpdate 
} from './utils/policyMapping';

export default function App() {
  // Use custom hooks for state and navigation
  const { state, actions } = useAppState();
  const navigationHandlers = useNavigation({ state, actions });

  // Business logic handlers
  const handlePolicyConfirm = (selectedOption?: string) => {
    actions.setIsFirstPriorityCorrected(true);
    if (selectedOption) {
      actions.setSelectedPolicyOption(selectedOption);
    }
    actions.setCurrentScreen('mapping-results');
  };

  const handlePriorityConfirm = (priorityIndex: number) => {
    const shouldShowSummary = handlePriorityConfirmation(
      priorityIndex,
      state.userData,
      state.confirmedMappings,
      actions.setConfirmedMappings,
      actions.setIsFirstPriorityCorrected
    );
    
    if (shouldShowSummary) {
      actions.setCurrentScreen('policy-mapping-summary');
    }
  };

  const handlePriorityReject = (priorityIndex: number) => {
    actions.setEditingPriorityIndex(priorityIndex);
    actions.setCurrentScreen('policy-edit');
  };

  const handlePolicyEdit = (originalInput: string, selectedOption?: string, additionalDetails?: string) => {
    const { updatedUserData, updatedSelectedOption, shouldClearPolicyOption } = handlePolicyEditUpdate(
      state.editingPriorityIndex,
      state.userData,
      originalInput,
      selectedOption,
      additionalDetails
    );
    
    // Update state based on the business logic results
    actions.setUserData(updatedUserData);
    
    if (shouldClearPolicyOption) {
      actions.setSelectedPolicyOption('');
    }
    
    if (selectedOption) {
      actions.setSelectedPolicyOption(updatedSelectedOption);
      actions.setConfirmedMappings(prev => ({ ...prev, [state.editingPriorityIndex]: selectedOption }));
    }
    
    // Mark as corrected if it's the first priority
    if (state.editingPriorityIndex === 0) {
      actions.setIsFirstPriorityCorrected(true);
    }
    
    // Reset editing index and go back to mapping results
    actions.setEditingPriorityIndex(-1);
    actions.setCurrentScreen('mapping-results');
  };

  const businessLogicHandlers = {
    handlePolicyConfirm,
    handlePriorityConfirm,
    handlePriorityReject,
    handlePolicyEdit,
  };

  return (
    <>
      {/* Full width app - no phone frame */}
      <div className="w-full min-h-screen bg-white">
        <AppRouter
          state={state}
          navigationHandlers={navigationHandlers}
          businessLogicHandlers={businessLogicHandlers}
          toggleSaveRecommendation={actions.toggleSaveRecommendation}
          isRecommendationSaved={actions.isRecommendationSaved}
        />
      </div>
      <Toaster />
    </>
  );
}
