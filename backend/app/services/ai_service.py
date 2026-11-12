import json
import httpx
from app.config import settings
from app.schemas.grievance import AIAnalysisResult

# List of valid departments for the AI to suggest
VALID_DEPARTMENTS = [
    "Public Works Department",
    "Health Department",
    "Education Department",
    "Revenue Department",
    "Police Department",
    "Transport Department",
    "Water Resources Department",
    "Agriculture Department",
    "Housing Department",
    "Labour Department",
]

SYSTEM_PROMPT = f"""You are a government grievance analysis assistant for the Chief Minister of Kerala's office.
Analyze the citizen complaint and return ONLY a valid JSON object (no markdown, no extra text) with these fields:
- "department": one of {json.dumps(VALID_DEPARTMENTS)}
- "category": a specific sub-category string (e.g., "Road Maintenance", "Hospital Services", etc.)
- "priority": one of "Low", "Medium", "High"
- "summary": a 1-2 sentence summary for the CMO
- "reason": why you chose this department and priority
- "confidence": a float between 0.0 and 1.0

Example:
{{"department": "Public Works Department", "category": "Road Maintenance", "priority": "High", "summary": "Citizen reports damaged road creating safety concerns.", "reason": "Road damage with safety risks requires immediate attention from Public Works.", "confidence": 0.85}}
"""


async def analyze_grievance(subject: str, description: str) -> AIAnalysisResult:
    """Call Gemini API to analyze a grievance and return structured suggestions."""
    if not settings.AI_API_KEY:
        return AIAnalysisResult(error="AI API key not configured")

    url = f"{settings.AI_API_URL}/models/{settings.AI_MODEL_NAME}:generateContent?key={settings.AI_API_KEY}"

    user_message = f"Subject: {subject}\n\nDescription: {description}"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": SYSTEM_PROMPT + "\n\nAnalyze this grievance:\n\n" + user_message}],
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 500,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)

            if response.status_code == 429:
                return AIAnalysisResult(error="AI API rate limit exceeded. Please try again later.")

            if response.status_code != 200:
                return AIAnalysisResult(error=f"AI API returned status {response.status_code}")

            data = response.json()

            # Extract text from Gemini response
            text = data["candidates"][0]["content"]["parts"][0]["text"]

            # Clean up: remove markdown code fences if present
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            # Parse JSON
            result = json.loads(text)

            return AIAnalysisResult(
                department=result.get("department"),
                category=result.get("category"),
                priority=result.get("priority"),
                summary=result.get("summary"),
                reason=result.get("reason"),
                confidence=result.get("confidence"),
            )

    except json.JSONDecodeError:
        return AIAnalysisResult(error="AI returned invalid JSON response")
    except httpx.TimeoutException:
        return AIAnalysisResult(error="AI API request timed out")
    except Exception as e:
        return AIAnalysisResult(error=f"AI analysis failed: {str(e)}")

