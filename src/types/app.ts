export type Screen = 
  | 'landing' 
  | 'priority-input' 
  | 'mapping-results' 
  | 'policy-mapper' 
  | 'policy-alternatives' 
  | 'policy-clarification' 
  | 'policy-edit' 
  | 'policy-mapping-summary' 
  | 'recommendations' 
  | 'candidates' 
  | 'potus-candidates' 
  | 'senate-candidates' 
  | 'house-candidates' 
  | 'state-house-candidates' 
  | 'school-board-candidates' 
  | 'county-board-candidates' 
  | 'email-officials' 
  | 'email-draft' 
  | 'ballot-measures' 
  | 'ballot-measure-detail' 
  | 'ballotpedia-view' 
  | 'petitions' 
  | 'petition-detail' 
  | 'changeorg-view' 
  | 'interest-groups' 
  | 'interest-group-detail' 
  | 'organization-view' 
  | 'civic-education' 
  | 'civic-education-detail' 
  | 'educational-resource-view' 
  | 'save-share';

export interface UserData {
  zipCode: string;
  priorities: string[];
}

export interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

export interface AppState {
  currentScreen: Screen;
  previousScreen: Screen | null;
  userData: UserData;
  isFirstPriorityCorrected: boolean;
  selectedPolicyOption: string;
  editingPriorityIndex: number;
  confirmedMappings: { [key: number]: string };
  selectedMeasureId: string;
  selectedPetitionId: string;
  selectedInterestGroupId: string;
  selectedEducationCategoryId: string;
  selectedResourceId: string;
  savedRecommendations: SavedRecommendation[];
}
