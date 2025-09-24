import React from 'react';
import { AppState, SavedRecommendation } from '../types/app';

// Import all screen components
import LandingScreen from './LandingScreen';
import PriorityInputScreen from './PriorityInputScreen';
import MappingResultsScreen from './MappingResultsScreen';
import PolicyMapperScreen from './PolicyMapperScreen';
import PolicyAlternativesScreen from './PolicyAlternativesScreen';
import PolicyClarificationScreen from './PolicyClarificationScreen';
import PolicyEditScreen from './PolicyEditScreen';
import RecommendationsScreen from './RecommendationsScreen';
import CandidatesScreen from './CandidatesScreen';
import POTUSCandidatesScreen from './POTUSCandidatesScreen';
import SenateCandidatesScreen from './SenateCandidatesScreen';
import HouseCandidatesScreen from './HouseCandidatesScreen';
import StateHouseCandidatesScreen from './StateHouseCandidatesScreen';
import SchoolBoardCandidatesScreen from './SchoolBoardCandidatesScreen';
import CountyBoardCandidatesScreen from './CountyBoardCandidatesScreen';
import EmailOfficialsScreen from './EmailOfficialsScreen';
import EmailDraftScreen from './EmailDraftScreen';
import BallotMeasuresScreen from './BallotMeasuresScreen';
import BallotMeasureDetailScreen from './BallotMeasureDetailScreen';
import BallotpediaViewScreen from './BallotpediaViewScreen';
import PetitionsScreen from './PetitionsScreen';
import PetitionDetailScreen from './PetitionDetailScreen';
import ChangeOrgViewScreen from './ChangeOrgViewScreen';
import InterestGroupsScreen from './InterestGroupsScreen';
import InterestGroupDetailScreen from './InterestGroupDetailScreen';
import OrganizationViewScreen from './OrganizationViewScreen';
import CivicEducationScreen from './CivicEducationScreen';
import CivicEducationDetailScreen from './CivicEducationDetailScreen';
import EducationalResourceViewScreen from './EducationalResourceViewScreen';
import SaveShareScreen from './SaveShareScreen';
import PolicyMappingSummaryScreen from './PolicyMappingSummaryScreen';

interface AppRouterProps {
  state: AppState;
  navigationHandlers: any;
  businessLogicHandlers: any;
  toggleSaveRecommendation: (recommendation: SavedRecommendation) => void;
  isRecommendationSaved: (id: string) => boolean;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  state,
  navigationHandlers,
  businessLogicHandlers,
  toggleSaveRecommendation,
  isRecommendationSaved,
}) => {
  const {
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
  } = state;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <LandingScreen onGetStarted={navigationHandlers.handleGetStarted} />
        );

      case 'priority-input':
        return (
          <PriorityInputScreen 
            onBack={previousScreen ? navigationHandlers.navigateBackToPrevious : navigationHandlers.handleBackToLanding} 
            onSubmit={navigationHandlers.handleSubmit}
            showReturnOption={previousScreen !== null}
            previousScreenName={previousScreen}
            initialData={previousScreen ? userData : undefined}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
          />
        );

      case 'mapping-results':
        return (
          <MappingResultsScreen 
            onBack={navigationHandlers.handleBackToPriorityInput}
            zipCode={userData.zipCode}
            priorities={userData.priorities}
            onPriorityClick={navigationHandlers.handleOpenPolicyMapper}
            isFirstPriorityCorrected={isFirstPriorityCorrected}
            onGetRecommendations={navigationHandlers.handleGetRecommendations}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            selectedPolicyOption={selectedPolicyOption}
            onPriorityConfirm={businessLogicHandlers.handlePriorityConfirm}
            onPriorityReject={businessLogicHandlers.handlePriorityReject}
          />
        );

      case 'policy-mapper':
        return (
          <PolicyMapperScreen 
            onBack={navigationHandlers.handleBackToMappingResults}
            onConfirm={businessLogicHandlers.handlePolicyConfirm}
            onNotQuite={navigationHandlers.handlePolicyNotQuite}
          />
        );

      case 'policy-alternatives':
        return (
          <PolicyAlternativesScreen 
            onBack={navigationHandlers.handleBackToMappingResults}
            onNoneMatch={navigationHandlers.handleNoneMatch}
          />
        );

      case 'policy-clarification':
        return (
          <PolicyClarificationScreen 
            onBack={navigationHandlers.handleBackToMappingResults}
            onSubmit={businessLogicHandlers.handlePolicyConfirm}
          />
        );

      case 'policy-edit':
        return (
          <PolicyEditScreen 
            onBack={navigationHandlers.handleBackToMappingResults}
            onUpdate={businessLogicHandlers.handlePolicyEdit}
            priorityIndex={editingPriorityIndex}
            originalPriority={userData.priorities[editingPriorityIndex] || ''}
          />
        );

      case 'policy-mapping-summary':
        return (
          <PolicyMappingSummaryScreen 
            onBack={navigationHandlers.handleBackToMappingResults}
            onGetRecommendations={navigationHandlers.handleGetRecommendationsFromSummary}
            confirmedMappings={confirmedMappings}
            originalPriorities={userData.priorities}
          />
        );

      case 'recommendations':
        return (
          <RecommendationsScreen 
            onBack={navigationHandlers.handleBackToPolicyMappingSummary}
            onCandidatesClick={navigationHandlers.handleOpenCandidates}
            onEmailOfficialsClick={navigationHandlers.handleOpenEmailOfficials}
            onBallotMeasuresClick={navigationHandlers.handleOpenBallotMeasures}
            onPetitionsClick={navigationHandlers.handleOpenPetitions}
            onInterestGroupsClick={navigationHandlers.handleOpenInterestGroups}
            onCivicEducationClick={navigationHandlers.handleOpenCivicEducation}
            onSaveShareClick={navigationHandlers.handleOpenSaveShare}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
          />
        );

      case 'candidates':
        return (
          <CandidatesScreen 
            onBack={navigationHandlers.handleBackToRecommendations}
            onPOTUSClick={navigationHandlers.handleOpenPOTUSCandidates}
            onSenateClick={navigationHandlers.handleOpenSenateCandidates}
            onHouseClick={navigationHandlers.handleOpenHouseCandidates}
            onStateHouseClick={navigationHandlers.handleOpenStateHouseCandidates}
            onSchoolBoardClick={navigationHandlers.handleOpenSchoolBoardCandidates}
            onCountyBoardClick={navigationHandlers.handleOpenCountyBoardCandidates}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
          />
        );

      case 'potus-candidates':
        return (
          <POTUSCandidatesScreen 
            onBack={navigationHandlers.handleBackToCandidates}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'senate-candidates':
        return (
          <SenateCandidatesScreen 
            onBack={navigationHandlers.handleBackToCandidates}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'house-candidates':
        return (
          <HouseCandidatesScreen 
            onBack={navigationHandlers.handleBackToCandidates}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'state-house-candidates':
        return (
          <StateHouseCandidatesScreen 
            onBack={navigationHandlers.handleBackToCandidates}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'school-board-candidates':
        return (
          <SchoolBoardCandidatesScreen 
            onBack={navigationHandlers.handleBackToCandidates}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'county-board-candidates':
        return (
          <CountyBoardCandidatesScreen 
            onBack={navigationHandlers.handleBackToCandidates}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'email-officials':
        return (
          <EmailOfficialsScreen 
            onBack={navigationHandlers.handleBackToRecommendations}
            onConcernClick={navigationHandlers.handleOpenEmailDraft}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
          />
        );

      case 'email-draft':
        return (
          <EmailDraftScreen 
            onBack={navigationHandlers.handleBackToEmailOfficials}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
          />
        );

      case 'ballot-measures':
        return (
          <BallotMeasuresScreen 
            onBack={navigationHandlers.handleBackToRecommendations}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onMeasureClick={navigationHandlers.handleMeasureClick}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'ballot-measure-detail':
        return (
          <BallotMeasureDetailScreen 
            onBack={navigationHandlers.handleBackToBallotMeasures}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onViewBallotpedia={navigationHandlers.handleViewBallotpedia}
            measureId={selectedMeasureId}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
          />
        );

      case 'ballotpedia-view':
        return (
          <BallotpediaViewScreen 
            onBack={navigationHandlers.handleBackToMeasureDetail}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            measureId={selectedMeasureId}
          />
        );

      case 'petitions':
        return (
          <PetitionsScreen 
            onBack={navigationHandlers.handleBackToRecommendations}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onPetitionClick={navigationHandlers.handlePetitionClick}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'petition-detail':
        return (
          <PetitionDetailScreen 
            onBack={navigationHandlers.handleBackToPetitions}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onViewChangeOrg={navigationHandlers.handleViewChangeOrg}
            petitionId={selectedPetitionId}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
          />
        );

      case 'changeorg-view':
        return (
          <ChangeOrgViewScreen 
            onBack={navigationHandlers.handleBackToPetitionDetail}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            petitionId={selectedPetitionId}
          />
        );

      case 'interest-groups':
        return (
          <InterestGroupsScreen 
            onBack={navigationHandlers.handleBackToRecommendations}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onInterestGroupClick={navigationHandlers.handleInterestGroupClick}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'interest-group-detail':
        return (
          <InterestGroupDetailScreen 
            onBack={navigationHandlers.handleBackToInterestGroups}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onViewOrganization={navigationHandlers.handleViewOrganization}
            interestGroupId={selectedInterestGroupId}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
          />
        );

      case 'organization-view':
        return (
          <OrganizationViewScreen 
            onBack={navigationHandlers.handleBackToInterestGroupDetail}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            interestGroupId={selectedInterestGroupId}
          />
        );

      case 'civic-education':
        return (
          <CivicEducationScreen 
            onBack={navigationHandlers.handleBackToRecommendations}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            onCategoryClick={navigationHandlers.handleEducationCategoryClick}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
            savedItemsCount={savedRecommendations.length}
          />
        );

      case 'civic-education-detail':
        return (
          <CivicEducationDetailScreen 
            onBack={navigationHandlers.handleBackToCivicEducation}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onResourceClick={navigationHandlers.handleResourceClick}
            categoryId={selectedEducationCategoryId}
            onToggleSave={toggleSaveRecommendation}
            isRecommendationSaved={isRecommendationSaved}
          />
        );

      case 'educational-resource-view':
        return (
          <EducationalResourceViewScreen 
            onBack={navigationHandlers.handleBackToCivicEducationDetail}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            resourceId={selectedResourceId}
          />
        );

      case 'save-share':
        return (
          <SaveShareScreen 
            onBack={navigationHandlers.handleBackToRecommendations}
            onNavToConcerns={navigationHandlers.handleNavToConcerns}
            onNavToMappings={navigationHandlers.handleNavToMappings}
            onNavToRecommendations={navigationHandlers.handleNavToRecommendations}
            onNavToSaveShare={navigationHandlers.handleNavToSaveShare}
            savedRecommendations={savedRecommendations}
            onToggleSave={toggleSaveRecommendation}
          />
        );

      default:
        return (
          <LandingScreen onGetStarted={navigationHandlers.handleGetStarted} />
        );
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden relative">
      {renderScreen()}
    </div>
  );
};
