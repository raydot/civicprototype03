"""
Test script to see what AI-generated educational resources look like
"""
import os
import sys
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from openai import OpenAI
from app.config import settings

def generate_educational_resources(category_name: str, category_description: str = None):
    """Generate educational resources for a given category using OpenAI"""
    
    client = OpenAI(api_key=settings.openai_api_key)
    
    prompt = f"""Generate 3-5 high-quality educational resources for learning about "{category_name}" as a political issue.

For each resource, provide:
- title: Clear, descriptive title
- source: Organization name (strongly prefer: Khan Academy, Ballotpedia, Constitution Center, Annenberg Classroom, C-SPAN, Library of Congress, Congressional Research Service, or other reputable educational institutions)
- type: article, video, podcast, or lesson
- duration: Estimated time (e.g., "10 min read", "15 min video")
- description: 1-2 sentence summary of what the resource covers
- url: Direct link to the resource (MUST be a real, working URL - verify the source exists)

Return ONLY a valid JSON array with no additional text or markdown formatting.
"""

    if category_description:
        prompt += f"\n\nCategory context: {category_description}"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an educational resource curator. Provide only real, verifiable educational resources from reputable institutions. Return only valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        result = response.choices[0].message.content.strip()
        
        # Try to parse as JSON
        try:
            resources = json.loads(result)
            return resources
        except json.JSONDecodeError:
            # If it's wrapped in markdown code blocks, extract the JSON
            if result.startswith("```"):
                result = result.split("```")[1]
                if result.startswith("json"):
                    result = result[4:]
                result = result.strip()
                resources = json.loads(result)
                return resources
            else:
                raise
                
    except Exception as e:
        print(f"Error generating resources: {str(e)}")
        return None

if __name__ == "__main__":
    category = "Economy & Jobs"
    description = "Economic policy, employment, wages, and job creation"
    
    print(f"Generating educational resources for: {category}\n")
    print("=" * 80)
    
    resources = generate_educational_resources(category, description)
    
    if resources:
        print(f"\nGenerated {len(resources)} resources:\n")
        print(json.dumps(resources, indent=2))
        
        print("\n" + "=" * 80)
        print("\nFormatted view:\n")
        
        for i, resource in enumerate(resources, 1):
            print(f"{i}. {resource.get('title', 'N/A')}")
            print(f"   Source: {resource.get('source', 'N/A')}")
            print(f"   Type: {resource.get('type', 'N/A')} | Duration: {resource.get('duration', 'N/A')}")
            print(f"   Description: {resource.get('description', 'N/A')}")
            print(f"   URL: {resource.get('url', 'N/A')}")
            print()
    else:
        print("Failed to generate resources")
