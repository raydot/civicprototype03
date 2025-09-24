// Simple test file to verify Claude integration works
// Run this with: npm run dev and check browser console

import { policyMatchingService } from './policyMatchingService';

export async function testPolicyMatching() {
  console.log('🧪 Testing Policy Matching Service...');
  
  const testCases = [
    "I'm concerned about environmental pollution in my area",
    "Healthcare costs are too high for my family",
    "My kids' school needs better funding",
    "There aren't enough jobs in my community"
  ];

  for (const testInput of testCases) {
    try {
      console.log(`\n📝 Testing: "${testInput}"`);
      
      const startTime = Date.now();
      const response = await policyMatchingService.matchPolicies({
        userInput: testInput,
        zipCode: '90210' // Optional test ZIP
      });
      const endTime = Date.now();
      
      console.log('✅ Success:', {
        match: response.matches[0],
        processingTime: endTime - startTime,
        sessionId: response.sessionId
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
    
    // Wait between tests to respect throttling
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  
  console.log('\n🎉 Policy matching tests completed!');
}

// Make test function available globally for easy browser console testing
if (typeof window !== 'undefined') {
  (window as any).testPolicyMatching = testPolicyMatching;
  console.log('🧪 Policy matching test available. Run: testPolicyMatching()');
}
