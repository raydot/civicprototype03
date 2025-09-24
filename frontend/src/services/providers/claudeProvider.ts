import { config } from '../../config/environment';
import { PolicyMatchingRequest, PolicyMatchingResponse, PolicyMatch, PolicyMatchingProvider } from '../../types/policy';

export class ClaudeProvider implements PolicyMatchingProvider {
  private lastCall = 0;
  private cache = new Map<string, PolicyMatchingResponse>();

  async matchPolicies(request: PolicyMatchingRequest): Promise<PolicyMatchingResponse> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (config.DEBUG_MODE) {
        console.log('Using cached result for:', request.userInput);
      }
      return cached;
    }

    // Throttle API calls
    await this.throttle();

    try {
      const response = await this.callClaudeAPI(request);
      const result = this.parseClaudeResponse(response, request, startTime);
      
      // Cache successful results
      this.cache.set(cacheKey, result);
      
      if (config.DEBUG_MODE) {
        console.log('Claude API success:', {
          input: request.userInput,
          matches: result.matches.length,
          processingTime: result.processingTime
        });
      }
      
      return result;
    } catch (error) {
      console.error('Claude API error:', error);
      return this.getFallbackResponse(request, startTime);
    }
  }

  async refinePolicies(
    originalInput: string, 
    rejectedIds: string[], 
    clarification?: string,
    zipCode?: string
  ): Promise<PolicyMatchingResponse> {
    // For now, just call matchPolicies with clarification
    return this.matchPolicies({
      userInput: clarification || originalInput,
      zipCode,
      rejectedIds,
      clarificationContext: clarification
    });
  }

  private getCacheKey(request: PolicyMatchingRequest): string {
    return `${request.userInput}-${request.zipCode || 'no-zip'}`;
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    if (timeSinceLastCall < config.THROTTLE_INTERVAL) {
      const waitTime = config.THROTTLE_INTERVAL - timeSinceLastCall;
      if (config.DEBUG_MODE) {
        console.log(`Throttling API call, waiting ${waitTime}ms`);
      }
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastCall = Date.now();
  }

  private async callClaudeAPI(request: PolicyMatchingRequest): Promise<any> {
    const prompt = this.buildPrompt(request);
    
    const response = await fetch(config.CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.CLAUDE_MODEL,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
      signal: AbortSignal.timeout(config.TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private buildPrompt(request: PolicyMatchingRequest): string {
    return `You are a policy matching expert. Analyze this civic priority and map it to the most relevant policy category.

USER PRIORITY: "${request.userInput}"

INSTRUCTIONS:
- Map to a broad policy category (not location-specific)  
- This concern may apply at federal, state, or local levels
- Focus on policy substance, not geographic constraints
- Provide a confidence score (0-100) based on how well the category matches
- Give a brief reason for the match

AVAILABLE POLICY CATEGORIES (examples):
- Climate & Environmental Protection
- Healthcare Access & Reform
- Education & Student Support
- Economic Development & Jobs
- Civil Rights & Liberties
- Government Transparency & Ethics
- Infrastructure & Transportation
- Housing & Development
- Public Safety & Justice
- Social Services & Welfare

Return your response as JSON in this exact format:
{
  "match": {
    "id": "policy-category-id",
    "name": "Policy Category Name",
    "description": "Brief description of what this policy covers",
    "confidence": 85,
    "level": "federal",
    "civicTags": ["environment", "regulation"],
    "matchReason": "Brief explanation of why this matches the user's concern"
  }
}

Return only valid JSON, no other text.`;
  }

  private parseClaudeResponse(response: any, request: PolicyMatchingRequest, startTime: number): PolicyMatchingResponse {
    try {
      // Extract content from Claude's response format
      const content = response.content?.[0]?.text || '';
      const parsed = JSON.parse(content);
      
      const match: PolicyMatch = {
        id: parsed.match.id || 'unknown',
        name: parsed.match.name || 'General Policy',
        description: parsed.match.description || 'Policy description not provided',
        confidence: Math.min(100, Math.max(0, parsed.match.confidence || 75)),
        level: parsed.match.level || 'federal',
        civicTags: parsed.match.civicTags || [],
        matchReason: parsed.match.matchReason || 'AI-generated match'
      };

      return {
        matches: [match],
        sessionId: `claude-${Date.now()}`,
        processingTime: Date.now() - startTime,
        totalCategories: 10 // Approximate number of categories considered
      };
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      throw new Error('Invalid response format from Claude API');
    }
  }

  private getFallbackResponse(request: PolicyMatchingRequest, startTime: number): PolicyMatchingResponse {
    // Generate a reasonable fallback based on keywords
    const input = request.userInput.toLowerCase();
    let match: PolicyMatch;

    if (input.includes('environment') || input.includes('climate') || input.includes('pollution')) {
      match = {
        id: 'climate-environment',
        name: 'Climate & Environmental Protection',
        description: 'Policies addressing environmental concerns, climate change, and pollution control',
        confidence: 75,
        level: 'federal',
        civicTags: ['environment', 'climate'],
        matchReason: 'Keyword-based fallback match for environmental concerns'
      };
    } else if (input.includes('health') || input.includes('medical') || input.includes('insurance')) {
      match = {
        id: 'healthcare-access',
        name: 'Healthcare Access & Reform',
        description: 'Policies related to healthcare accessibility, insurance, and medical services',
        confidence: 75,
        level: 'federal',
        civicTags: ['healthcare', 'insurance'],
        matchReason: 'Keyword-based fallback match for healthcare concerns'
      };
    } else if (input.includes('education') || input.includes('school') || input.includes('college')) {
      match = {
        id: 'education-support',
        name: 'Education & Student Support',
        description: 'Policies addressing educational funding, accessibility, and student support',
        confidence: 75,
        level: 'federal',
        civicTags: ['education', 'students'],
        matchReason: 'Keyword-based fallback match for education concerns'
      };
    } else if (input.includes('job') || input.includes('economy') || input.includes('employment')) {
      match = {
        id: 'economic-development',
        name: 'Economic Development & Jobs',
        description: 'Policies focused on job creation, economic growth, and employment opportunities',
        confidence: 75,
        level: 'federal',
        civicTags: ['economy', 'jobs'],
        matchReason: 'Keyword-based fallback match for economic concerns'
      };
    } else {
      match = {
        id: 'general-policy',
        name: 'General Policy & Governance',
        description: 'Broad policy category addressing citizen concerns and government responsiveness',
        confidence: 65,
        level: 'federal',
        civicTags: ['general', 'governance'],
        matchReason: 'Default fallback match when specific category cannot be determined'
      };
    }

    return {
      matches: [match],
      sessionId: `fallback-${Date.now()}`,
      processingTime: Date.now() - startTime,
      totalCategories: 5 // Number of fallback categories considered
    };
  }
}
