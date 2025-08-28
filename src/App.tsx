import { useState } from 'react';
import LandingScreen from './components/LandingScreen';
import PriorityInputScreen from './components/PriorityInputScreen';
import MappingResultsScreen from './components/MappingResultsScreen';
import PolicyMapperScreen from './components/PolicyMapperScreen';
import PolicyAlternativesScreen from './components/PolicyAlternativesScreen';
import PolicyClarificationScreen from './components/PolicyClarificationScreen';
import PolicyEditScreen from './components/PolicyEditScreen';
import RecommendationsScreen from './components/RecommendationsScreen';
import CandidatesScreen from './components/CandidatesScreen';
import POTUSCandidatesScreen from './components/POTUSCandidatesScreen';
import SenateCandidatesScreen from './components/SenateCandidatesScreen';
import HouseCandidatesScreen from './components/HouseCandidatesScreen';
import StateHouseCandidatesScreen from './components/StateHouseCandidatesScreen';
import SchoolBoardCandidatesScreen from './components/SchoolBoardCandidatesScreen';
import CountyBoardCandidatesScreen from './components/CountyBoardCandidatesScreen';
import EmailOfficialsScreen from './components/EmailOfficialsScreen';
import EmailDraftScreen from './components/EmailDraftScreen';
import BallotMeasuresScreen from './components/BallotMeasuresScreen';
import BallotMeasureDetailScreen from './components/BallotMeasureDetailScreen';
import BallotpediaViewScreen from './components/BallotpediaViewScreen';
import PetitionsScreen from './components/PetitionsScreen';
import PetitionDetailScreen from './components/PetitionDetailScreen';
import ChangeOrgViewScreen from './components/ChangeOrgViewScreen';
import InterestGroupsScreen from './components/InterestGroupsScreen';
import InterestGroupDetailScreen from './components/InterestGroupDetailScreen';
import OrganizationViewScreen from './components/OrganizationViewScreen';
import CivicEducationScreen from './components/CivicEducationScreen';
import CivicEducationDetailScreen from './components/CivicEducationDetailScreen';
import EducationalResourceViewScreen from './components/EducationalResourceViewScreen';
import SaveShareScreen from './components/SaveShareScreen';
import PolicyMappingSummaryScreen from './components/PolicyMappingSummaryScreen';

type Screen = 'landing' | 'priority-input' | 'mapping-results' | 'policy-mapper' | 'policy-alternatives' | 'policy-clarification' | 'policy-edit' | 'policy-mapping-summary' | 'recommendations' | 'candidates' | 'potus-candidates' | 'senate-candidates' | 'house-candidates' | 'state-house-candidates' | 'school-board-candidates' | 'county-board-candidates' | 'email-officials' | 'email-draft' | 'ballot-measures' | 'ballot-measure-detail' | 'ballotpedia-view' | 'petitions' | 'petition-detail' | 'changeorg-view' | 'interest-groups' | 'interest-group-detail' | 'organization-view' | 'civic-education' | 'civic-education-detail' | 'educational-resource-view' | 'save-share';

interface UserData {
  zipCode: string;
  priorities: string[];
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

export default function App() {
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

  const handleGetStarted = () => {
    setCurrentScreen('priority-input');
  };

  const handleSubmit = (data: UserData) => {
    setUserData(data);
    setCurrentScreen('mapping-results');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
  };

  const handleBackToPriorityInput = () => {
    setCurrentScreen('priority-input');
  };

  const handleBackToMappingResults = () => {
    setCurrentScreen('mapping-results');
  };

  const handleBackToPolicyMappingSummary = () => {
    setCurrentScreen('policy-mapping-summary');
  };

  const handleBackToRecommendations = () => {
    setCurrentScreen('recommendations');
  };

  const handleOpenPolicyMapper = () => {
    setCurrentScreen('policy-mapper');
  };

  const handlePolicyNotQuite = () => {
    setCurrentScreen('policy-alternatives');
  };

  const handleNoneMatch = () => {
    setCurrentScreen('policy-clarification');
  };

  const handlePolicyConfirm = (selectedOption?: string) => {
    setIsFirstPriorityCorrected(true);
    if (selectedOption) {
      setSelectedPolicyOption(selectedOption);
    }
    setCurrentScreen('mapping-results');
  };

  const handlePriorityConfirm = (priorityIndex: number) => {
    if (priorityIndex === 0) {
      setIsFirstPriorityCorrected(true);
    }
    
    // Mark this priority as confirmed with its default mapping
    const priority = userData.priorities[priorityIndex];
    const defaultMapping = getDefaultPolicyMapping(priority);
    setConfirmedMappings(prev => ({ ...prev, [priorityIndex]: defaultMapping }));
    
    // Check if all priorities are now confirmed
    const allConfirmed = userData.priorities.every((_, index) => 
      confirmedMappings[index] || index === priorityIndex
    );
    
    if (allConfirmed && userData.priorities.length === 6) {
      // All mappings confirmed, show summary screen
      setCurrentScreen('policy-mapping-summary');
    }
  };

  const getDefaultPolicyMapping = (priority: string): string => {
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

  const handlePriorityReject = (priorityIndex: number) => {
    setEditingPriorityIndex(priorityIndex);
    setCurrentScreen('policy-edit');
  };

  const handlePolicyEdit = (originalInput: string, selectedOption?: string, additionalDetails?: string) => {
    // If user updated their original input, update the priorities array
    if (additionalDetails && additionalDetails.trim() !== userData.priorities[editingPriorityIndex]) {
      const updatedPriorities = [...userData.priorities];
      updatedPriorities[editingPriorityIndex] = additionalDetails.trim();
      setUserData({ ...userData, priorities: updatedPriorities });
      // Clear any previous policy selection since we have new input
      setSelectedPolicyOption('');
    }
    
    // Set the selected policy option and confirm the mapping
    if (selectedOption) {
      setSelectedPolicyOption(selectedOption);
      setConfirmedMappings(prev => ({ ...prev, [editingPriorityIndex]: selectedOption }));
    }
    
    // Mark as corrected if it's the first priority
    if (editingPriorityIndex === 0) {
      setIsFirstPriorityCorrected(true);
    }
    
    // Reset editing index and go back to mapping results
    setEditingPriorityIndex(-1);
    setCurrentScreen('mapping-results');
  };

  const handleBackToPolicyEdit = () => {
    setCurrentScreen('policy-edit');
  };

  const handleGetRecommendations = () => {
    setCurrentScreen('recommendations');
  };

  const handleGetRecommendationsFromSummary = () => {
    setCurrentScreen('recommendations');
  };

  const handleOpenCandidates = () => {
    setCurrentScreen('candidates');
  };

  const handleOpenPOTUSCandidates = () => {
    setCurrentScreen('potus-candidates');
  };

  const handleOpenSenateCandidates = () => {
    setCurrentScreen('senate-candidates');
  };

  const handleOpenHouseCandidates = () => {
    setCurrentScreen('house-candidates');
  };

  const handleOpenStateHouseCandidates = () => {
    setCurrentScreen('state-house-candidates');
  };

  const handleOpenSchoolBoardCandidates = () => {
    setCurrentScreen('school-board-candidates');
  };

  const handleOpenCountyBoardCandidates = () => {
    setCurrentScreen('county-board-candidates');
  };

  const handleBackToCandidates = () => {
    setCurrentScreen('candidates');
  };

  const handleOpenEmailOfficials = () => {
    setCurrentScreen('email-officials');
  };

  const handleBackToEmailOfficials = () => {
    setCurrentScreen('email-officials');
  };

  const handleOpenEmailDraft = () => {
    setCurrentScreen('email-draft');
  };

  const handleOpenBallotMeasures = () => {
    setCurrentScreen('ballot-measures');
  };

  const handleOpenPetitions = () => {
    setCurrentScreen('petitions');
  };

  const handleOpenInterestGroups = () => {
    setCurrentScreen('interest-groups');
  };

  const handleOpenCivicEducation = () => {
    setCurrentScreen('civic-education');
  };

  const handleOpenSaveShare = () => {
    setCurrentScreen('save-share');
  };

  const handleMeasureClick = (measureId: string) => {
    setSelectedMeasureId(measureId);
    setCurrentScreen('ballot-measure-detail');
  };

  const handleViewBallotpedia = () => {
    setCurrentScreen('ballotpedia-view');
  };

  const handleBackToBallotMeasures = () => {
    setCurrentScreen('ballot-measures');
  };

  const handleBackToMeasureDetail = () => {
    setCurrentScreen('ballot-measure-detail');
  };

  const handlePetitionClick = (petitionId: string) => {
    setSelectedPetitionId(petitionId);
    setCurrentScreen('petition-detail');
  };

  const handleViewChangeOrg = () => {
    setCurrentScreen('changeorg-view');
  };

  const handleBackToPetitions = () => {
    setCurrentScreen('petitions');
  };

  const handleBackToPetitionDetail = () => {
    setCurrentScreen('petition-detail');
  };

  const handleInterestGroupClick = (groupId: string) => {
    setSelectedInterestGroupId(groupId);
    setCurrentScreen('interest-group-detail');
  };

  const handleViewOrganization = () => {
    setCurrentScreen('organization-view');
  };

  const handleBackToInterestGroups = () => {
    setCurrentScreen('interest-groups');
  };

  const handleBackToInterestGroupDetail = () => {
    setCurrentScreen('interest-group-detail');
  };

  const handleEducationCategoryClick = (categoryId: string) => {
    setSelectedEducationCategoryId(categoryId);
    setCurrentScreen('civic-education-detail');
  };

  const handleResourceClick = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setCurrentScreen('educational-resource-view');
  };

  const handleBackToCivicEducation = () => {
    setCurrentScreen('civic-education');
  };

  const handleBackToCivicEducationDetail = () => {
    setCurrentScreen('civic-education-detail');
  };

  const handleNavToConcerns = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen('priority-input');
  };

  const handleNavToMappings = () => {
    setCurrentScreen('mapping-results');
  };

  const handleBackToPreviousScreen = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    } else {
      setCurrentScreen('landing');
    }
  };

  const handleNavToRecommendations = () => {
    setCurrentScreen('recommendations');
  };

  const handleNavToSaveShare = () => {
    setCurrentScreen('save-share');
  };

  const handleToggleSaveRecommendation = (recommendation: SavedRecommendation) => {
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

  return (
    <>
      {/* Desktop Version - Show phone frame on larger screens */}
      <div className="hidden md:flex w-full min-h-screen bg-gray-200 items-center justify-center p-4">
        {/* Mobile Frame Container - iPhone 14 Dimensions */}
        <div className="w-[390px] h-[844px] mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800 relative flex-shrink-0">
          {/* Phone dimensions constraint */}
          <div id="mobile-frame" className="w-full h-full bg-white flex flex-col overflow-hidden relative">
            {/* Status bar - now always visible */}
            <div className="w-full h-11 bg-black relative flex-shrink-0">
              {/* Dynamic Island */}
              <div 
                className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black rounded-full"
                style={{ 
                  width: '126px', 
                  height: '37px',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)'
                }}
              />
            </div>
            
            {/* App content */}
            <div className="flex-1 bg-white relative overflow-hidden">
              {currentScreen === 'landing' && (
                <LandingScreen onGetStarted={handleGetStarted} />
              )}
              {currentScreen === 'priority-input' && (
                <PriorityInputScreen 
                  onBack={previousScreen ? handleBackToPreviousScreen : handleBackToLanding} 
                  onSubmit={handleSubmit}
                  showReturnOption={previousScreen !== null}
                  previousScreenName={previousScreen}
                  initialData={previousScreen ? userData : undefined}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                />
              )}
              {currentScreen === 'mapping-results' && (
                <MappingResultsScreen 
                  onBack={handleBackToPriorityInput}
                  zipCode={userData.zipCode}
                  priorities={userData.priorities}
                  onPriorityClick={handleOpenPolicyMapper}
                  isFirstPriorityCorrected={isFirstPriorityCorrected}
                  onGetRecommendations={handleGetRecommendations}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  selectedPolicyOption={selectedPolicyOption}
                  onPriorityConfirm={handlePriorityConfirm}
                  onPriorityReject={handlePriorityReject}
                />
              )}
              {currentScreen === 'policy-mapper' && (
                <PolicyMapperScreen 
                  onBack={handleBackToMappingResults}
                  onConfirm={handlePolicyConfirm}
                  onNotQuite={handlePolicyNotQuite}
                />
              )}
              {currentScreen === 'policy-alternatives' && (
                <PolicyAlternativesScreen 
                  onBack={handleBackToMappingResults}
                  onNoneMatch={handleNoneMatch}
                />
              )}
              {currentScreen === 'policy-clarification' && (
                <PolicyClarificationScreen 
                  onBack={handleBackToMappingResults}
                  onSubmit={handlePolicyConfirm}
                />
              )}
              {currentScreen === 'policy-edit' && (
                <PolicyEditScreen 
                  onBack={handleBackToMappingResults}
                  onUpdate={handlePolicyEdit}
                  priorityIndex={editingPriorityIndex}
                  originalPriority={userData.priorities[editingPriorityIndex] || ''}
                />
              )}
              {currentScreen === 'policy-mapping-summary' && (
                <PolicyMappingSummaryScreen 
                  onBack={handleBackToMappingResults}
                  onGetRecommendations={handleGetRecommendationsFromSummary}
                  confirmedMappings={confirmedMappings}
                  originalPriorities={userData.priorities}
                />
              )}
              {currentScreen === 'recommendations' && (
                <RecommendationsScreen 
                  onBack={handleBackToPolicyMappingSummary}
                  onCandidatesClick={handleOpenCandidates}
                  onEmailOfficialsClick={handleOpenEmailOfficials}
                  onBallotMeasuresClick={handleOpenBallotMeasures}
                  onPetitionsClick={handleOpenPetitions}
                  onInterestGroupsClick={handleOpenInterestGroups}
                  onCivicEducationClick={handleOpenCivicEducation}
                  onSaveShareClick={handleOpenSaveShare}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                />
              )}
              {currentScreen === 'candidates' && (
                <CandidatesScreen 
                  onBack={handleBackToRecommendations}
                  onPOTUSClick={handleOpenPOTUSCandidates}
                  onSenateClick={handleOpenSenateCandidates}
                  onHouseClick={handleOpenHouseCandidates}
                  onStateHouseClick={handleOpenStateHouseCandidates}
                  onSchoolBoardClick={handleOpenSchoolBoardCandidates}
                  onCountyBoardClick={handleOpenCountyBoardCandidates}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                />
              )}
              {currentScreen === 'potus-candidates' && (
                <POTUSCandidatesScreen 
                  onBack={handleBackToCandidates}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'senate-candidates' && (
                <SenateCandidatesScreen 
                  onBack={handleBackToCandidates}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'house-candidates' && (
                <HouseCandidatesScreen 
                  onBack={handleBackToCandidates}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'state-house-candidates' && (
                <StateHouseCandidatesScreen 
                  onBack={handleBackToCandidates}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'school-board-candidates' && (
                <SchoolBoardCandidatesScreen 
                  onBack={handleBackToCandidates}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'county-board-candidates' && (
                <CountyBoardCandidatesScreen 
                  onBack={handleBackToCandidates}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'email-officials' && (
                <EmailOfficialsScreen 
                  onBack={handleBackToRecommendations}
                  onConcernClick={handleOpenEmailDraft}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                />
              )}
              {currentScreen === 'email-draft' && (
                <EmailDraftScreen 
                  onBack={handleBackToEmailOfficials}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                />
              )}
              {currentScreen === 'ballot-measures' && (
                <BallotMeasuresScreen 
                  onBack={handleBackToRecommendations}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onMeasureClick={handleMeasureClick}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'ballot-measure-detail' && (
                <BallotMeasureDetailScreen 
                  onBack={handleBackToBallotMeasures}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onViewBallotpedia={handleViewBallotpedia}
                  measureId={selectedMeasureId}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                />
              )}
              {currentScreen === 'ballotpedia-view' && (
                <BallotpediaViewScreen 
                  onBack={handleBackToMeasureDetail}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  measureId={selectedMeasureId}
                />
              )}
              {currentScreen === 'petitions' && (
                <PetitionsScreen 
                  onBack={handleBackToRecommendations}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onPetitionClick={handlePetitionClick}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'petition-detail' && (
                <PetitionDetailScreen 
                  onBack={handleBackToPetitions}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onViewChangeOrg={handleViewChangeOrg}
                  petitionId={selectedPetitionId}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                />
              )}
              {currentScreen === 'changeorg-view' && (
                <ChangeOrgViewScreen 
                  onBack={handleBackToPetitionDetail}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  petitionId={selectedPetitionId}
                />
              )}
              {currentScreen === 'interest-groups' && (
                <InterestGroupsScreen 
                  onBack={handleBackToRecommendations}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onInterestGroupClick={handleInterestGroupClick}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'interest-group-detail' && (
                <InterestGroupDetailScreen 
                  onBack={handleBackToInterestGroups}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onViewOrganization={handleViewOrganization}
                  interestGroupId={selectedInterestGroupId}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                />
              )}
              {currentScreen === 'organization-view' && (
                <OrganizationViewScreen 
                  onBack={handleBackToInterestGroupDetail}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  interestGroupId={selectedInterestGroupId}
                />
              )}
              {currentScreen === 'civic-education' && (
                <CivicEducationScreen 
                  onBack={handleBackToRecommendations}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  onCategoryClick={handleEducationCategoryClick}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                  savedItemsCount={savedRecommendations.length}
                />
              )}
              {currentScreen === 'civic-education-detail' && (
                <CivicEducationDetailScreen 
                  onBack={handleBackToCivicEducation}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onResourceClick={handleResourceClick}
                  categoryId={selectedEducationCategoryId}
                  onToggleSave={handleToggleSaveRecommendation}
                  isRecommendationSaved={isRecommendationSaved}
                />
              )}
              {currentScreen === 'educational-resource-view' && (
                <EducationalResourceViewScreen 
                  onBack={handleBackToCivicEducationDetail}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  resourceId={selectedResourceId}
                />
              )}
              {currentScreen === 'save-share' && (
                <SaveShareScreen 
                  onBack={handleBackToRecommendations}
                  onNavToConcerns={handleNavToConcerns}
                  onNavToMappings={handleNavToMappings}
                  onNavToRecommendations={handleNavToRecommendations}
                  onNavToSaveShare={handleNavToSaveShare}
                  savedRecommendations={savedRecommendations}
                  onToggleSave={handleToggleSaveRecommendation}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Full screen on mobile devices */}
      <div className="md:hidden w-full min-h-screen bg-white flex flex-col">
        {/* Mobile layout without phone frame */}
        <div id="mobile-frame" className="w-full h-full bg-white flex flex-col overflow-hidden relative min-h-screen">
          {/* App content */}
          <div className="flex-1 bg-white relative overflow-hidden">
            {currentScreen === 'landing' && (
              <LandingScreen onGetStarted={handleGetStarted} />
            )}
            {currentScreen === 'priority-input' && (
              <PriorityInputScreen 
                onBack={previousScreen ? handleBackToPreviousScreen : handleBackToLanding} 
                onSubmit={handleSubmit}
                showReturnOption={previousScreen !== null}
                previousScreenName={previousScreen}
                initialData={previousScreen ? userData : undefined}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
              />
            )}
            {currentScreen === 'mapping-results' && (
              <MappingResultsScreen 
                onBack={handleBackToPriorityInput}
                zipCode={userData.zipCode}
                priorities={userData.priorities}
                onPriorityClick={handleOpenPolicyMapper}
                isFirstPriorityCorrected={isFirstPriorityCorrected}
                onGetRecommendations={handleGetRecommendations}
                onNavToConcerns={handleNavToConcerns}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                selectedPolicyOption={selectedPolicyOption}
                onPriorityConfirm={handlePriorityConfirm}
                onPriorityReject={handlePriorityReject}
              />
            )}
            {currentScreen === 'policy-mapper' && (
              <PolicyMapperScreen 
                onBack={handleBackToMappingResults}
                onConfirm={handlePolicyConfirm}
                onNotQuite={handlePolicyNotQuite}
              />
            )}
            {currentScreen === 'policy-alternatives' && (
              <PolicyAlternativesScreen 
                onBack={handleBackToMappingResults}
                onNoneMatch={handleNoneMatch}
              />
            )}
            {currentScreen === 'policy-clarification' && (
              <PolicyClarificationScreen 
                onBack={handleBackToMappingResults}
                onSubmit={handlePolicyConfirm}
              />
            )}
            {currentScreen === 'policy-edit' && (
              <PolicyEditScreen 
                onBack={handleBackToMappingResults}
                onUpdate={handlePolicyEdit}
                priorityIndex={editingPriorityIndex}
                originalPriority={userData.priorities[editingPriorityIndex] || ''}
              />
            )}
            {currentScreen === 'policy-mapping-summary' && (
              <PolicyMappingSummaryScreen 
                onBack={handleBackToMappingResults}
                onGetRecommendations={handleGetRecommendationsFromSummary}
                confirmedMappings={confirmedMappings}
                originalPriorities={userData.priorities}
              />
            )}
            {currentScreen === 'recommendations' && (
              <RecommendationsScreen 
                onBack={handleBackToPolicyMappingSummary}
                onCandidatesClick={handleOpenCandidates}
                onEmailOfficialsClick={handleOpenEmailOfficials}
                onBallotMeasuresClick={handleOpenBallotMeasures}
                onPetitionsClick={handleOpenPetitions}
                onInterestGroupsClick={handleOpenInterestGroups}
                onCivicEducationClick={handleOpenCivicEducation}
                onSaveShareClick={handleOpenSaveShare}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
              />
            )}
            {currentScreen === 'candidates' && (
              <CandidatesScreen 
                onBack={handleBackToRecommendations}
                onPOTUSClick={handleOpenPOTUSCandidates}
                onSenateClick={handleOpenSenateCandidates}
                onHouseClick={handleOpenHouseCandidates}
                onStateHouseClick={handleOpenStateHouseCandidates}
                onSchoolBoardClick={handleOpenSchoolBoardCandidates}
                onCountyBoardClick={handleOpenCountyBoardCandidates}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
              />
            )}
            {currentScreen === 'potus-candidates' && (
              <POTUSCandidatesScreen 
                onBack={handleBackToCandidates}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'senate-candidates' && (
              <SenateCandidatesScreen 
                onBack={handleBackToCandidates}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'house-candidates' && (
              <HouseCandidatesScreen 
                onBack={handleBackToCandidates}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'state-house-candidates' && (
              <StateHouseCandidatesScreen 
                onBack={handleBackToCandidates}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'school-board-candidates' && (
              <SchoolBoardCandidatesScreen 
                onBack={handleBackToCandidates}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'county-board-candidates' && (
              <CountyBoardCandidatesScreen 
                onBack={handleBackToCandidates}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'email-officials' && (
              <EmailOfficialsScreen 
                onBack={handleBackToRecommendations}
                onConcernClick={handleOpenEmailDraft}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
              />
            )}
            {currentScreen === 'email-draft' && (
              <EmailDraftScreen 
                onBack={handleBackToEmailOfficials}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
              />
            )}
            {currentScreen === 'ballot-measures' && (
              <BallotMeasuresScreen 
                onBack={handleBackToRecommendations}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onMeasureClick={handleMeasureClick}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'ballot-measure-detail' && (
              <BallotMeasureDetailScreen 
                onBack={handleBackToBallotMeasures}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onViewBallotpedia={handleViewBallotpedia}
                measureId={selectedMeasureId}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
              />
            )}
            {currentScreen === 'ballotpedia-view' && (
              <BallotpediaViewScreen 
                onBack={handleBackToMeasureDetail}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                measureId={selectedMeasureId}
              />
            )}
            {currentScreen === 'petitions' && (
              <PetitionsScreen 
                onBack={handleBackToRecommendations}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onPetitionClick={handlePetitionClick}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'petition-detail' && (
              <PetitionDetailScreen 
                onBack={handleBackToPetitions}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onViewChangeOrg={handleViewChangeOrg}
                petitionId={selectedPetitionId}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
              />
            )}
            {currentScreen === 'changeorg-view' && (
              <ChangeOrgViewScreen 
                onBack={handleBackToPetitionDetail}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                petitionId={selectedPetitionId}
              />
            )}
            {currentScreen === 'interest-groups' && (
              <InterestGroupsScreen 
                onBack={handleBackToRecommendations}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onInterestGroupClick={handleInterestGroupClick}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'interest-group-detail' && (
              <InterestGroupDetailScreen 
                onBack={handleBackToInterestGroups}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onViewOrganization={handleViewOrganization}
                interestGroupId={selectedInterestGroupId}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
              />
            )}
            {currentScreen === 'organization-view' && (
              <OrganizationViewScreen 
                onBack={handleBackToInterestGroupDetail}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                interestGroupId={selectedInterestGroupId}
              />
            )}
            {currentScreen === 'civic-education' && (
              <CivicEducationScreen 
                onBack={handleBackToRecommendations}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                onCategoryClick={handleEducationCategoryClick}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
                savedItemsCount={savedRecommendations.length}
              />
            )}
            {currentScreen === 'civic-education-detail' && (
              <CivicEducationDetailScreen 
                onBack={handleBackToCivicEducation}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onResourceClick={handleResourceClick}
                categoryId={selectedEducationCategoryId}
                onToggleSave={handleToggleSaveRecommendation}
                isRecommendationSaved={isRecommendationSaved}
              />
            )}
            {currentScreen === 'educational-resource-view' && (
              <EducationalResourceViewScreen 
                onBack={handleBackToCivicEducationDetail}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                resourceId={selectedResourceId}
              />
            )}
            {currentScreen === 'save-share' && (
              <SaveShareScreen 
                onBack={handleBackToRecommendations}
                onNavToConcerns={handleNavToConcerns}
                onNavToMappings={handleNavToMappings}
                onNavToRecommendations={handleNavToRecommendations}
                onNavToSaveShare={handleNavToSaveShare}
                savedRecommendations={savedRecommendations}
                onToggleSave={handleToggleSaveRecommendation}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}