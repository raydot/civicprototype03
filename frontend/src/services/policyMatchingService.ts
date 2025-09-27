import { PolicyMatchingProvider, PolicyMatchingRequest, PolicyMatchingResponse } from '../types/policy';
import { ClaudeProvider } from './providers/claudeProvider';
import { MockProvider } from './providers/mockProvider';
import { FastApiProvider } from './providers/fastApiProvider';
import { config } from '../config/environment';

// Service factory - easy to swap providers based on environment
class PolicyMatchingService {
  private provider: PolicyMatchingProvider;

  constructor() {
    // Provider options:
    // - MockProvider (for testing without API)
    // - ClaudeProvider (current AI implementation)
    // - FastApiProvider (VoterPrime AI backend integration)
    this.provider = this.createProvider();
  }

  private createProvider(): PolicyMatchingProvider {
    const apiMode = config.API_MODE;
    
    // Debug logging to see which provider is being used
    console.log('🔧 PolicyMatchingService - API Mode:', apiMode);
    console.log('🔧 PolicyMatchingService - Backend URL:', config.BACKEND_URL);
    
    switch (apiMode) {
      case 'mock':
        console.log('📝 Using MockProvider');
        return new MockProvider();
      case 'production':
        console.log('🤖 Using ClaudeProvider');
        return new ClaudeProvider();
      case 'fastapi':
        console.log('🚀 Using FastApiProvider');
        return new FastApiProvider();
      default:
        throw new Error(`Unknown API mode: ${apiMode}. Use 'mock', 'production', or 'fastapi'.`);
    }
  }

  async matchPolicies(request: PolicyMatchingRequest): Promise<PolicyMatchingResponse> {
    try {
      const startTime = Date.now();
      const response = await this.provider.matchPolicies(request);
      const endTime = Date.now();
      
      // Add processing time
      response.processingTime = endTime - startTime;
      
      // Log for analytics (if enabled)
      if (config.DEBUG_MODE) {
        console.log('Policy matching completed:', {
          input: request.userInput,
          matches: response.matches.length,
          processingTime: response.processingTime
        });
      }
      
      return response;
    } catch (error) {
      console.error('Policy matching failed:', error);
      throw new Error('Failed to match policies. Please try again.');
    }
  }

  async refinePolicies(
    originalInput: string,
    rejectedIds: string[],
    clarification?: string,
    zipCode?: string
  ): Promise<PolicyMatchingResponse> {
    try {
      const startTime = Date.now();
      const response = await this.provider.refinePolicies(
        originalInput,
        rejectedIds,
        clarification,
        zipCode
      );
      const endTime = Date.now();
      
      response.processingTime = endTime - startTime;
      
      if (config.DEBUG_MODE) {
        console.log('Policy refinement completed:', {
          originalInput,
          rejectedIds,
          clarification,
          matches: response.matches.length,
          processingTime: response.processingTime
        });
      }
      
      return response;
    } catch (error) {
      console.error('Policy refinement failed:', error);
      throw new Error('Failed to refine policy matches. Please try again.');
    }
  }
}

// Export singleton instance
export const policyMatchingService = new PolicyMatchingService();
