import { PolicyMatchingRequest, PolicyMatchingResponse, PolicyMatch, PolicyMatchingProvider } from '../../types/policy';

export class MockProvider implements PolicyMatchingProvider {
  async matchPolicies(request: PolicyMatchingRequest): Promise<PolicyMatchingResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const match = this.generateMockMatch(request.userInput);
    
    return {
      matches: [match],
      sessionId: `mock-${Date.now()}`,
      processingTime: 500,
      totalCategories: 10
    };
  }

  async refinePolicies(
    originalInput: string, 
    rejectedIds: string[], 
    clarification?: string,
    zipCode?: string
  ): Promise<PolicyMatchingResponse> {
    // Just call matchPolicies with the clarification
    return this.matchPolicies({
      userInput: clarification || originalInput,
      zipCode,
      rejectedIds,
      clarificationContext: clarification
    });
  }

  private generateMockMatch(input: string): PolicyMatch {
    const lowerInput = input.toLowerCase();
    
    // Generate varied confidence scores
    const baseConfidence = 75 + Math.random() * 20; // 75-95%
    const confidence = Math.round(baseConfidence);
    
    if (lowerInput.includes('environment') || lowerInput.includes('climate') || lowerInput.includes('pollution')) {
      return {
        id: 'climate-environment',
        name: 'Climate & Environmental Protection',
        description: 'Policies addressing environmental concerns, climate change, and pollution control',
        confidence,
        level: 'federal',
        civicTags: ['environment', 'climate'],
        matchReason: 'Mock match based on environmental keywords'
      };
    } else if (lowerInput.includes('health') || lowerInput.includes('medical') || lowerInput.includes('insurance')) {
      return {
        id: 'healthcare-access',
        name: 'Healthcare Access & Reform',
        description: 'Policies related to healthcare accessibility, insurance, and medical services',
        confidence,
        level: 'federal',
        civicTags: ['healthcare', 'insurance'],
        matchReason: 'Mock match based on healthcare keywords'
      };
    } else if (lowerInput.includes('education') || lowerInput.includes('school') || lowerInput.includes('college')) {
      return {
        id: 'education-support',
        name: 'Education & Student Support',
        description: 'Policies addressing educational funding, accessibility, and student support',
        confidence,
        level: 'federal',
        civicTags: ['education', 'students'],
        matchReason: 'Mock match based on education keywords'
      };
    } else if (lowerInput.includes('job') || lowerInput.includes('economy') || lowerInput.includes('employment')) {
      return {
        id: 'economic-development',
        name: 'Economic Development & Jobs',
        description: 'Policies focused on job creation, economic growth, and employment opportunities',
        confidence,
        level: 'federal',
        civicTags: ['economy', 'jobs'],
        matchReason: 'Mock match based on economic keywords'
      };
    } else if (lowerInput.includes('speech') || lowerInput.includes('freedom') || lowerInput.includes('rights')) {
      return {
        id: 'civil-rights',
        name: 'Civil Rights & Liberties',
        description: 'Policies protecting individual rights, freedoms, and civil liberties',
        confidence,
        level: 'federal',
        civicTags: ['rights', 'freedom'],
        matchReason: 'Mock match based on civil rights keywords'
      };
    } else {
      return {
        id: 'general-policy',
        name: 'General Policy & Governance',
        description: 'Broad policy category addressing citizen concerns and government responsiveness',
        confidence: Math.round(65 + Math.random() * 15), // Slightly lower for general
        level: 'federal',
        civicTags: ['general', 'governance'],
        matchReason: 'Mock match for general civic concern'
      };
    }
  }
}
