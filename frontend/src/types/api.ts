// Ballot measure types
export interface BallotMeasure {
    id: string;
    title: string;
    description: string;
    type: "initiative" | "referendum" | "bond" | "constitutional";
    recommendation?: "yes" | "no" | "neutral";
    reasoning?: string;
    fiscalImpact?: string;
    supportingOrgs?: string[];
    opposingOrgs?: string[];
}

// User feedback for learning
export interface UserFeedback {
    sessionId: string;
    candidateId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    feedback?: string;
    helpful: boolean;
}

// Error response structure
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string>;
}

// Session management
export interface UserSession {
    sessionId: string;
    userId?: string;
    priorities: string[];
    zipCode?: string;
    createdAt: Date;
    lastActivity: Date;
}

// Analytics and metrics
export interface MatchMetrics {
    totalMatches: number;
    averageConfidence: number;
    topCategories: string[];
    processingTime: number;
}