"""
Generate AI-suggested educational resources for 10 sample categories
"""
import os
import sys
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from openai import OpenAI
from app.config import settings
from sqlalchemy import create_engine, text

def generate_resources_for_category(client, category_name, category_description):
    """Generate educational resources for a given category using OpenAI"""
    
    prompt = f"""Generate 3-5 high-quality educational resources for learning about "{category_name}" as a political issue.

Category context: {category_description}

For each resource, provide:
- title: Clear, descriptive title
- source: Organization name (strongly prefer: Khan Academy, Ballotpedia, Constitution Center, Annenberg Classroom, C-SPAN, Library of Congress, Congressional Research Service, or other reputable educational institutions)
- type: article, video, podcast, or lesson
- duration: Estimated time (e.g., "10 min read", "15 min video")
- description: 1-2 sentence summary of what the resource covers
- url: Direct link to the resource (MUST be a real, working URL - verify the source exists)

Return ONLY a valid JSON array with no additional text or markdown formatting.
"""
    
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
        print(f"Error generating resources for {category_name}: {str(e)}")
        return None

def main():
    """Generate resources for 10 sample categories (every 7th)"""
    
    client = OpenAI(api_key=settings.openai_api_key)
    
    # Hardcoded sample categories (every 7th from the 70 active categories)
    # Based on categories_list.txt
    sample_categories = [
        {"id": 334, "name": "Academic Freedom and Speech", "type": "issue", "description": "Academic freedom and free speech on college campuses are under scrutiny. Policies address balancing open discourse with safety, combating censorship, and protecting diverse viewpoints in educational settings."},
        {"id": 1, "name": "Climate & Environment", "type": "issue", "description": "Climate change poses urgent threats to our planet. Environmental policy must prioritize renewable energy, conservation, and sustainable practices to protect future generations."},
        {"id": 4, "name": "Education & Research", "type": "issue", "description": "Quality education and robust research funding are essential for innovation and economic growth. Policy should support accessible education and scientific advancement."},
        {"id": 318, "name": "Freedom of Expression", "type": "issue", "description": "Freedom of expression is a cornerstone of democracy. Policies must protect speech rights while addressing harmful content and misinformation in the digital age."},
        {"id": 2, "name": "Healthcare & Social Services", "type": "issue", "description": "Access to affordable healthcare and social services is a fundamental right. Policy must ensure comprehensive coverage and support for vulnerable populations."},
        {"id": 5, "name": "Immigration & Border Security", "type": "issue", "description": "Immigration policy must balance security with compassion, creating pathways for legal immigration while protecting borders and supporting immigrant communities."},
        {"id": 357, "name": "Media & Journalism", "type": "issue", "description": "A free and independent press is vital for democracy. Policies should protect journalism, combat misinformation, and ensure media accountability."},
        {"id": 329, "name": "Political Violence & Extremism", "type": "issue", "description": "Rising political violence and extremism threaten democratic institutions. Policies must address radicalization, protect public safety, and promote civil discourse."},
        {"id": 323, "name": "Second Amendment Rights", "type": "issue", "description": "The Second Amendment protects the right to bear arms. Policy debates focus on balancing gun rights with public safety and preventing gun violence."},
        {"id": 10, "name": "Technology & Privacy", "type": "issue", "description": "Technology advances raise privacy concerns. Policy must protect personal data, regulate tech companies, and ensure digital rights in an increasingly connected world."}
    ]
    
    print(f"Generating resources for {len(sample_categories)} categories:\n")
    print("=" * 100)
    
    all_generated_resources = []
    
    for category in sample_categories:
        print(f"\n{category['id']}. {category['name']} ({category['type']})")
        print(f"Description: {category['description'][:100]}...")
        print("-" * 100)
        
        resources = generate_resources_for_category(
            client, 
            category['name'], 
            category['description']
        )
        
        if resources:
            print(f"✓ Generated {len(resources)} resources")
            
            # Add category info to each resource
            for resource in resources:
                resource['category_id'] = category['id']
                resource['category_name'] = category['name']
                
            all_generated_resources.extend(resources)
        else:
            print(f"✗ Failed to generate resources")
        
        print()
    
    # Save to JSON file
    output_file = Path(__file__).parent.parent / 'data' / 'generated_resources.json'
    output_file.parent.mkdir(exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(all_generated_resources, f, indent=2)
    
    print("=" * 100)
    print(f"\n✓ Generated {len(all_generated_resources)} total resources")
    print(f"✓ Saved to: {output_file}")
    print("\nNext steps:")
    print("1. Review the generated resources in generated_resources.json")
    print("2. Verify/fix any incorrect URLs")
    print("3. Use the admin UI to import these resources into the database")

if __name__ == "__main__":
    main()
