import { useState } from 'react';
import { Screen, UserData, SavedRecommendation, AppState } from '../types/app';

export const useAppState = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [userData, setUserData] = useState<UserData>({ zipCode: '', priorities: [] });
  const [isFirstPriorityCorrected, setIsFirstPriorityCorrected] = useState(false);
  const [selectedPolicyOption, setSelectedPolicyOption] = useState<string>('');
  const [editingPriorityIndex, setEditingPriorityIndex] = useState<number>(-1);
  const [confirmedMappings, setConfirmedMappings] = useState<{ [key: number]: string }>({});
  const [selectedMeasureId, setSelectedMeasureId] = useState<string>('');
  const [selectedPetitionId, setSelectedPetitionId] = useState<string>('');
  const [selectedInterestGroupId, setSelectedInterestGroupId] = useState<string>('');
  const [selectedEducationCategoryId, setSelectedEducationCategoryId] = useState<string>('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [savedRecommendations, setSavedRecommendations] = useState<SavedRecommendation[]>([]);

  // Helper functions for saved recommendations
  const toggleSaveRecommendation = (recommendation: SavedRecommendation) => {
    setSavedRecommendations(prev => {
      const isAlreadySaved = prev.some(item => item.id === recommendation.id);
      if (isAlreadySaved) {
        return prev.filter(item => item.id !== recommendation.id);
      } else {
        return [...prev, recommendation];
      }
    });
  };

  const isRecommendationSaved = (id: string) => {
    return savedRecommendations.some(item => item.id === id);
  };

  // State object for easy access
  const state: AppState = {
    currentScreen,
    previousScreen,
    userData,
    isFirstPriorityCorrected,
    selectedPolicyOption,
    editingPriorityIndex,
    confirmedMappings,
    selectedMeasureId,
    selectedPetitionId,
    selectedInterestGroupId,
    selectedEducationCategoryId,
    selectedResourceId,
    savedRecommendations,
  };

  // State setters object
  const actions = {
    setCurrentScreen,
    setPreviousScreen,
    setUserData,
    setIsFirstPriorityCorrected,
    setSelectedPolicyOption,
    setEditingPriorityIndex,
    setConfirmedMappings,
    setSelectedMeasureId,
    setSelectedPetitionId,
    setSelectedInterestGroupId,
    setSelectedEducationCategoryId,
    setSelectedResourceId,
    setSavedRecommendations,
    toggleSaveRecommendation,
    isRecommendationSaved,
  };

  return { state, actions };
};
