export interface PolicyMatch {
  id: string;
  name: string;
  description: string;
  confidence: number; // 0-100
  level: 'federal' | 'state' | 'local' | 'ballot';
  civicTags: string[];
  matchReason?: string; // Why this policy matched (for debugging/transparency)
}

export interface PolicyMatchingRequest {
  userInput: string;
  zipCode?: string;
  rejectedIds?: string[]; // For refinement
  clarificationContext?: string; // Additional context from user
}

export interface PolicyMatchingResponse {
  matches: PolicyMatch[];
  sessionId: string;
  processingTime: number; // milliseconds
  totalCategories: number; // How many categories were considered
}

export interface PolicyMatchingProvider {
  matchPolicies(request: PolicyMatchingRequest): Promise<PolicyMatchingResponse>;
  refinePolicies(
    originalInput: string, 
    rejectedIds: string[], 
    clarification?: string,
    zipCode?: string
  ): Promise<PolicyMatchingResponse>;
}

// For logging and analytics
export interface PolicyMatchingLog {
  sessionId: string;
  userInput: string;
  zipCode?: string;
  matches: PolicyMatch[];
  userResponse?: 'accepted' | 'rejected' | 'refined';
  selectedMatchId?: string;
  timestamp: Date;
  processingTime: number;
}
