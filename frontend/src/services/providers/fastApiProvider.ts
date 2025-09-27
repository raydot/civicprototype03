import { PolicyMatchingProvider, PolicyMatchingRequest, PolicyMatchingResponse, PolicyMatch } from '../../types/policy';
import { config } from '../../config/environment';

export class FastApiProvider implements PolicyMatchingProvider {
  private baseUrl: string;

  constructor() {
    // Use environment config for backend URL
    this.baseUrl = config.BACKEND_URL || 'http://localhost:8000';
  }

  async matchPolicies(request: PolicyMatchingRequest): Promise<PolicyMatchingResponse> {
    try {
      // Call your VoterPrime AI backend for category matching
      const categoryResponse = await fetch(`${this.baseUrl}/category-matching/find-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: request.userInput,
          top_k: 5
        })
      });

      if (!categoryResponse.ok) {
        throw new Error(`Category matching failed: ${categoryResponse.statusText}`);
      }

      const categoryData = await categoryResponse.json();

      // Call sentiment analysis for priority intensity
      const sentimentResponse = await fetch(`${this.baseUrl}/sentiment-analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.userInput,
          analysis_type: 'priority'
        })
      });

      let sentimentData: any = null;
      if (sentimentResponse.ok) {
        sentimentData = await sentimentResponse.json();
      }

      // Convert AI backend response to frontend format
      const matches: PolicyMatch[] = categoryData.matches.map((match: any, index: number) => ({
        id: `match_${match.category_id}`,
        title: match.category_name,
        description: this.generateDescription(match),
        category: match.category_type,
        confidence: Math.round(match.confidence_score * 100),
        reasoning: this.generateReasoning(match, sentimentData),
        tags: match.keywords.slice(0, 3), // Top 3 keywords as tags
        priority: this.calculatePriority(match.confidence_score, sentimentData),
        metadata: {
          similarity_score: match.similarity_score,
          category_id: match.category_id,
          category_type: match.category_type,
          sentiment_intensity: sentimentData?.intensity || 5,
          sentiment_urgency: sentimentData?.urgency || 'medium'
        }
      }));

      return {
        matches,
        totalMatches: categoryData.total_categories_searched,
        processingTime: categoryData.processing_time_ms,
        confidence: this.calculateOverallConfidence(matches),
        metadata: {
          model_info: categoryData.model_info,
          sentiment_analysis: sentimentData,
          backend_version: '0.6.0'
        }
      };

    } catch (error) {
      console.error('FastAPI provider error:', error);
      throw new Error(`Failed to connect to VoterPrime AI backend: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refinePolicies(
    originalInput: string,
    rejectedIds: string[],
    clarification?: string,
    zipCode?: string
  ): Promise<PolicyMatchingResponse> {
    try {
      // Extract category IDs from rejected matches
      const rejectedCategoryIds = rejectedIds.map(id => {
        const match = id.match(/match_(\d+)/);
        return match ? parseInt(match[1]) : null;
      }).filter(id => id !== null);

      // Build refined input with clarification
      let refinedInput = originalInput;
      if (clarification) {
        refinedInput += ` Additional context: ${clarification}`;
      }

      // Call category refinement endpoint
      const response = await fetch(`${this.baseUrl}/category-matching/refine-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: refinedInput,
          rejected_category_ids: rejectedCategoryIds,
          top_k: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Category refinement failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Convert refined matches to frontend format
      const matches: PolicyMatch[] = data.matches.map((match: any) => ({
        id: `refined_${match.category_id}`,
        title: match.category_name,
        description: this.generateDescription(match),
        category: match.category_type,
        confidence: Math.round(match.confidence_score * 100),
        reasoning: `Refined match based on your feedback: ${match.category_name}`,
        tags: match.keywords.slice(0, 3),
        priority: this.calculatePriority(match.confidence_score),
        metadata: {
          similarity_score: match.similarity_score,
          category_id: match.category_id,
          category_type: match.category_type,
          is_refined: true
        }
      }));

      return {
        matches,
        totalMatches: data.total_categories_searched,
        processingTime: data.processing_time_ms,
        confidence: this.calculateOverallConfidence(matches),
        metadata: {
          model_info: data.model_info,
          refinement_context: { originalInput, rejectedIds, clarification },
          backend_version: '0.6.0'
        }
      };

    } catch (error) {
      console.error('FastAPI refinement error:', error);
      throw new Error(`Failed to refine matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateDescription(match: any): string {
    const { category_name, category_type, keywords } = match;
    
    switch (category_type) {
      case 'issue':
        return `Political issue focused on ${keywords.slice(0, 3).join(', ')}. This represents a key policy area that aligns with your priorities.`;
      case 'candidate_attribute':
        return `Candidate characteristic: ${category_name}. Look for candidates who embody these qualities and values.`;
      case 'policy':
        return `Specific policy proposal: ${category_name}. This represents concrete legislative action on your priorities.`;
      case 'attribute':
        return `Political attribute: ${category_name}. This reflects a broader political philosophy or approach.`;
      default:
        return `${category_name} - ${keywords.slice(0, 2).join(', ')}`;
    }
  }

  private generateReasoning(match: any, sentimentData: any): string {
    const intensity = sentimentData?.intensity || 5;
    const urgency = sentimentData?.urgency || 'medium';
    
    let reasoning = `Matched based on semantic similarity (${Math.round(match.similarity_score * 100)}%)`;
    
    if (intensity >= 8) {
      reasoning += ` and high priority intensity detected`;
    } else if (intensity >= 6) {
      reasoning += ` and moderate priority intensity`;
    }
    
    if (urgency === 'high') {
      reasoning += `. Your urgent tone suggests this is a critical issue for you.`;
    } else if (urgency === 'medium') {
      reasoning += `. This appears to be an important concern for you.`;
    }
    
    return reasoning;
  }

  private calculatePriority(confidenceScore: number, sentimentData?: any): 'high' | 'medium' | 'low' {
    const intensity = sentimentData?.intensity || 5;
    const urgency = sentimentData?.urgency || 'medium';
    
    // Combine confidence and sentiment for priority
    if (confidenceScore >= 0.7 || intensity >= 8 || urgency === 'high') {
      return 'high';
    } else if (confidenceScore >= 0.4 || intensity >= 6 || urgency === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private calculateOverallConfidence(matches: PolicyMatch[]): number {
    if (matches.length === 0) return 0;
    
    const avgConfidence = matches.reduce((sum, match) => sum + match.confidence, 0) / matches.length;
    return Math.round(avgConfidence);
  }
}
