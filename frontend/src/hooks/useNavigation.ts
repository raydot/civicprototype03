import { Screen, UserData } from '../types/app';

interface NavigationProps {
  state: any;
  actions: any;
}

export const useNavigation = ({ state, actions }: NavigationProps) => {

  // Basic navigation functions
  const navigateToScreen = (screen: Screen) => {
    actions.setCurrentScreen(screen);
  };

  const navigateWithPrevious = (screen: Screen) => {
    actions.setPreviousScreen(state.currentScreen);
    actions.setCurrentScreen(screen);
  };

  const navigateBack = (targetScreen: Screen) => {
    actions.setCurrentScreen(targetScreen);
  };

  const navigateBackToPrevious = () => {
    if (state.previousScreen) {
      actions.setCurrentScreen(state.previousScreen);
      actions.setPreviousScreen(null);
    } else {
      actions.setCurrentScreen('landing');
    }
  };

  // Specific navigation handlers
  const handleGetStarted = () => {
    navigateToScreen('priority-input');
  };

  const handleSubmit = (data: UserData) => {
    actions.setUserData(data);
    navigateToScreen('mapping-results');
  };

  const handleBackToLanding = () => {
    navigateToScreen('landing');
  };

  const handleBackToPriorityInput = () => {
    navigateToScreen('priority-input');
  };

  const handleBackToMappingResults = () => {
    navigateToScreen('mapping-results');
  };

  const handleBackToPolicyMappingSummary = () => {
    navigateToScreen('policy-mapping-summary');
  };

  const handleBackToRecommendations = () => {
    navigateToScreen('recommendations');
  };

  const handleOpenPolicyMapper = () => {
    navigateToScreen('policy-mapper');
  };

  const handlePolicyNotQuite = () => {
    navigateToScreen('policy-alternatives');
  };

  const handleNoneMatch = () => {
    navigateToScreen('policy-clarification');
  };

  const handleGetRecommendations = () => {
    navigateToScreen('recommendations');
  };

  const handleGetRecommendationsFromSummary = () => {
    navigateToScreen('recommendations');
  };

  // Candidate navigation
  const handleOpenCandidates = () => {
    navigateToScreen('candidates');
  };

  const handleOpenPOTUSCandidates = () => {
    navigateToScreen('potus-candidates');
  };

  const handleOpenSenateCandidates = () => {
    navigateToScreen('senate-candidates');
  };

  const handleOpenHouseCandidates = () => {
    navigateToScreen('house-candidates');
  };

  const handleOpenStateHouseCandidates = () => {
    navigateToScreen('state-house-candidates');
  };

  const handleOpenSchoolBoardCandidates = () => {
    navigateToScreen('school-board-candidates');
  };

  const handleOpenCountyBoardCandidates = () => {
    navigateToScreen('county-board-candidates');
  };

  const handleBackToCandidates = () => {
    navigateToScreen('candidates');
  };

  // Email officials navigation
  const handleOpenEmailOfficials = () => {
    navigateToScreen('email-officials');
  };

  const handleBackToEmailOfficials = () => {
    navigateToScreen('email-officials');
  };

  const handleOpenEmailDraft = () => {
    navigateToScreen('email-draft');
  };

  // Ballot measures navigation
  const handleOpenBallotMeasures = () => {
    navigateToScreen('ballot-measures');
  };

  const handleMeasureClick = (measureId: string) => {
    actions.setSelectedMeasureId(measureId);
    navigateToScreen('ballot-measure-detail');
  };

  const handleViewBallotpedia = () => {
    navigateToScreen('ballotpedia-view');
  };

  const handleBackToBallotMeasures = () => {
    navigateToScreen('ballot-measures');
  };

  const handleBackToMeasureDetail = () => {
    navigateToScreen('ballot-measure-detail');
  };

  // Petitions navigation
  const handleOpenPetitions = () => {
    navigateToScreen('petitions');
  };

  const handlePetitionClick = (petitionId: string) => {
    actions.setSelectedPetitionId(petitionId);
    navigateToScreen('petition-detail');
  };

  const handleViewChangeOrg = () => {
    navigateToScreen('changeorg-view');
  };

  const handleBackToPetitions = () => {
    navigateToScreen('petitions');
  };

  const handleBackToPetitionDetail = () => {
    navigateToScreen('petition-detail');
  };

  // Interest groups navigation
  const handleOpenInterestGroups = () => {
    navigateToScreen('interest-groups');
  };

  const handleInterestGroupClick = (groupId: string) => {
    actions.setSelectedInterestGroupId(groupId);
    navigateToScreen('interest-group-detail');
  };

  const handleViewOrganization = () => {
    navigateToScreen('organization-view');
  };

  const handleBackToInterestGroups = () => {
    navigateToScreen('interest-groups');
  };

  const handleBackToInterestGroupDetail = () => {
    navigateToScreen('interest-group-detail');
  };

  // Civic education navigation
  const handleOpenCivicEducation = () => {
    navigateToScreen('civic-education');
  };

  const handleEducationCategoryClick = (categoryId: string) => {
    actions.setSelectedEducationCategoryId(categoryId);
    navigateToScreen('civic-education-detail');
  };

  const handleResourceClick = (resourceId: string) => {
    actions.setSelectedResourceId(resourceId);
    navigateToScreen('educational-resource-view');
  };

  const handleBackToCivicEducation = () => {
    navigateToScreen('civic-education');
  };

  const handleBackToCivicEducationDetail = () => {
    navigateToScreen('civic-education-detail');
  };

  // Save/Share navigation
  const handleOpenSaveShare = () => {
    navigateToScreen('save-share');
  };

  // Navigation bar handlers
  const handleNavToConcerns = () => {
    navigateWithPrevious('priority-input');
  };

  const handleNavToMappings = () => {
    navigateToScreen('mapping-results');
  };

  const handleNavToRecommendations = () => {
    navigateToScreen('recommendations');
  };

  const handleNavToSaveShare = () => {
    navigateToScreen('save-share');
  };

  return {
    // State
    currentScreen: state.currentScreen,
    previousScreen: state.previousScreen,
    
    // Basic navigation
    navigateToScreen,
    navigateWithPrevious,
    navigateBack,
    navigateBackToPrevious,
    
    // Specific handlers
    handleGetStarted,
    handleSubmit,
    handleBackToLanding,
    handleBackToPriorityInput,
    handleBackToMappingResults,
    handleBackToPolicyMappingSummary,
    handleBackToRecommendations,
    handleOpenPolicyMapper,
    handlePolicyNotQuite,
    handleNoneMatch,
    handleGetRecommendations,
    handleGetRecommendationsFromSummary,
    
    // Candidate handlers
    handleOpenCandidates,
    handleOpenPOTUSCandidates,
    handleOpenSenateCandidates,
    handleOpenHouseCandidates,
    handleOpenStateHouseCandidates,
    handleOpenSchoolBoardCandidates,
    handleOpenCountyBoardCandidates,
    handleBackToCandidates,
    
    // Email handlers
    handleOpenEmailOfficials,
    handleBackToEmailOfficials,
    handleOpenEmailDraft,
    
    // Ballot measure handlers
    handleOpenBallotMeasures,
    handleMeasureClick,
    handleViewBallotpedia,
    handleBackToBallotMeasures,
    handleBackToMeasureDetail,
    
    // Petition handlers
    handleOpenPetitions,
    handlePetitionClick,
    handleViewChangeOrg,
    handleBackToPetitions,
    handleBackToPetitionDetail,
    
    // Interest group handlers
    handleOpenInterestGroups,
    handleInterestGroupClick,
    handleViewOrganization,
    handleBackToInterestGroups,
    handleBackToInterestGroupDetail,
    
    // Civic education handlers
    handleOpenCivicEducation,
    handleEducationCategoryClick,
    handleResourceClick,
    handleBackToCivicEducation,
    handleBackToCivicEducationDetail,
    
    // Save/Share handlers
    handleOpenSaveShare,
    
    // Navigation bar handlers
    handleNavToConcerns,
    handleNavToMappings,
    handleNavToRecommendations,
    handleNavToSaveShare,
  };
};
