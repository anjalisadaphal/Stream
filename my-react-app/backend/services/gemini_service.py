import os
import json
from typing import Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def generate_career_guidance(
    recommended_domain: str,
    programmer_score: int,
    analytics_score: int,
    tester_score: int,
    total_score: int
) -> Dict[str, Any]:
    """
    Generate personalized career guidance using Gemini AI.
    
    Returns a dictionary with:
    - description: Personalized description
    - job_profiles: List of job profiles with demand and growth
    - skills_to_improve: List of skills with priority
    - learning_roadmap: List of learning steps
    - resources: List of learning resources
    - future_scope: Future career scope analysis
    """
    
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    # Create the prompt
    prompt = f"""You are an expert career guidance counselor specializing in technology careers. 
Based on the following career assessment quiz results, provide comprehensive, personalized career guidance.

Assessment Results:
- Recommended Domain: {recommended_domain}
- Programming Score: {programmer_score}/100
- Analytics Score: {analytics_score}/100
- Testing Score: {tester_score}/100
- Total Score: {total_score}/150

Please generate a detailed career guidance report in JSON format with the following structure:

{{
  "description": "A personalized 2-3 sentence description explaining why this domain suits the candidate based on their scores",
  "job_profiles": [
    {{
      "title": "Job Title",
      "demand": "High/Very High/Medium",
      "growth": "+XX%"
    }}
    // Include 4-6 relevant job profiles
  ],
  "skills_to_improve": [
    {{
      "skill": "Skill name",
      "priority": "High/Medium"
    }}
    // Include 3-4 high-priority skills
  ],
  "learning_roadmap": [
    {{
      "step": 1,
      "title": "Step title",
      "description": "What to learn",
      "duration": "X-Y months"
    }}
    // Include 5-7 progressive learning steps
  ],
  "resources": [
    {{
      "title": "Resource title",
      "source": "Platform name (Coursera, Udemy, YouTube, etc.)",
      "link": "Actual URL to the resource",
      "type": "Course/Guide/Practice/Book"
    }}
    // Include 6-8 specific, real learning resources with actual URLs
  ],
  "future_scope": "A comprehensive paragraph (4-5 sentences) about career prospects, industry trends, salary expectations, and growth opportunities in this domain"
}}

Important guidelines:
1. Make the description specific to their score pattern
2. Provide realistic job profiles with current market demand
3. Suggest practical, actionable skills to improve
4. Create a progressive learning roadmap with realistic timeframes
5. Include REAL resources with actual URLs (not placeholder links)
6. Make future scope analysis realistic and encouraging
7. Ensure all JSON is properly formatted and valid

Return ONLY the JSON object, no additional text."""

    try:
        # Use Gemini to generate the response
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Extract the text response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON
        guidance = json.loads(response_text)
        
        return guidance
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {response_text}")
        raise ValueError(f"Failed to parse AI response as JSON: {e}")
    except Exception as e:
        print(f"Error generating career guidance: {e}")
        raise
