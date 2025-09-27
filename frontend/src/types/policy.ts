export interface PolicyMatch {
  id: string;
  title: string; // Changed from 'name' to 'title'
  description: string;
  category: string; // Added category field
  confidence: number; // 0-100
  reasoning: string; // Changed from 'matchReason' to 'reasoning'
  tags: string[]; // Changed from 'civicTags' to 'tags'
  priority: 'high' | 'medium' | 'low'; // Added priority field
  metadata?: any; // Added metadata field for additional data
  // Legacy fields for backward compatibility
  name?: string;
  level?: 'federal' | 'state' | 'local' | 'ballot';
  civicTags?: string[];
  matchReason?: string;
}

export interface PolicyMatchingRequest {
  userInput: string;
  zipCode?: string;
  rejectedIds?: string[]; // For refinement
  clarificationContext?: string; // Additional context from user
}

export interface PolicyMatchingResponse {
  matches: PolicyMatch[];
  sessionId?: string; // Made optional for FastAPI compatibility
  processingTime: number; // milliseconds
  totalCategories?: number; // How many categories were considered (legacy)
  totalMatches?: number; // Added for FastAPI compatibility
  confidence?: number; // Overall confidence score
  metadata?: any; // Additional metadata from providers
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
