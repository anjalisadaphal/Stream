/**
 * AI Service for generating questions and handling chatbot responses
 * Uses Google Gemini API
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using gemini-1.5-flash for better availability and performance
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Generate 30 unique quiz questions dynamically
 * @param {Array} existingQuestions - Questions to avoid duplicates
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateQuizQuestions(existingQuestions = []) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const domains = ["programmer", "analytics", "tester"];
  const difficulties = ["easy", "medium", "hard"];
  
  // Generate 10 questions per domain
  const questionsPerDomain = 10;
  const allQuestions = [];

  for (const domain of domains) {
    try {
      const prompt = `You are a quiz question generator. Generate ${questionsPerDomain} unique multiple-choice questions for a career assessment quiz in the ${domain} domain. 
Each question should have:
- A clear, relevant question text
- 4 answer options (option_1, option_2, option_3, option_4)
- One correct answer (1, 2, 3, or 4)
- A difficulty level (easy, medium, or hard)

Distribute the difficulty levels: 3 easy, 4 medium, 3 hard questions.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question_text": "Question here?",
    "option_1": "First option",
    "option_2": "Second option",
    "option_3": "Third option",
    "option_4": "Fourth option",
    "correct_answer": 1,
    "domain": "${domain}",
    "difficulty": "easy"
  },
  ...
]

Make questions practical, relevant to real-world ${domain} work, and avoid generic questions. Always return valid JSON arrays only, no additional text.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4000,
          },
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate questions";
        try {
          const error = await response.json();
          errorMessage = error.error?.message || error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Check for safety ratings or blocked content
      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error("Content was blocked by safety filters. Please try again.");
      }
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error("No content received from AI. The model may have been blocked or returned an empty response.");
      }

      // Parse JSON from response (handle markdown code blocks if present)
      let jsonContent = content.trim();
      if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      }

      const domainQuestions = JSON.parse(jsonContent);
      
      // Validate and add domain questions
      if (Array.isArray(domainQuestions)) {
        domainQuestions.forEach((q) => {
          if (
            q.question_text &&
            q.option_1 &&
            q.option_2 &&
            q.option_3 &&
            q.option_4 &&
            q.correct_answer >= 1 &&
            q.correct_answer <= 4 &&
            q.domain === domain &&
            ["easy", "medium", "hard"].includes(q.difficulty)
          ) {
            allQuestions.push(q);
          }
        });
      }

      // Add delay between API calls to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error generating questions for ${domain}:`, error);
      // Continue with other domains even if one fails
    }
  }

  // Shuffle questions to mix domains
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  
  // Return exactly 30 questions (or as many as we got)
  return shuffled.slice(0, 30);
}

/**
 * Get chatbot response using AI
 * @param {Array} messages - Conversation history
 * @returns {Promise<string>} AI response
 */
export async function getChatbotResponse(messages) {
  if (!GEMINI_API_KEY) {
    // Fallback response if API key is not configured
    return "I'm currently unavailable. Please configure the Gemini API key to enable chatbot functionality.";
  }

  const systemPrompt = `You are a helpful assistant for STREAM (Smart Career Guidance System), a platform that helps users discover their career path in tech through assessments.

Key information about STREAM:
- It's a career assessment platform
- Users take a 30-question quiz (30 minutes)
- Results recommend one of three domains: Programmer, Analytics, or Tester
- Features include: Quiz assessment, Dashboard with progress tracking, Results with personalized career guidance
- The platform helps users discover their tech career path

Be friendly, concise, and helpful. Answer questions about:
- How the platform works
- Features and functionality
- Career domains (Programming, Analytics, Testing)
- Assessment process
- How to get started

Keep responses conversational and under 200 words when possible.`;

  try {
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return "I'm here to help! What would you like to know about STREAM?";
    }

    // Build conversation context
    let conversationContext = systemPrompt + "\n\nConversation history:\n";
    messages.slice(0, -1).forEach((msg) => {
      const role = msg.role === 'assistant' ? 'Assistant' : 'User';
      conversationContext += `${role}: ${msg.content}\n`;
    });
    conversationContext += `\nUser: ${lastUserMessage.content}\nAssistant:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: conversationContext
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to get response";
      try {
        const error = await response.json();
        errorMessage = error.error?.message || error.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Check for safety ratings or blocked content
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      return "I apologize, but I cannot respond to that request due to content safety filters.";
    }
    
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Clean up response if it contains role prefixes
    if (responseText) {
      return responseText.replace(/^(Model|Assistant):\s*/i, '').trim();
    }
    
    return "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Chatbot error:", error);
    
    // Check for specific error types
    if (error.message?.includes("quota") || error.message?.includes("billing")) {
      throw new Error("API_QUOTA_EXCEEDED");
    }
    if (error.message?.includes("429") || error.message?.includes("rate limit")) {
      throw new Error("API_RATE_LIMIT");
    }
    
    throw error;
  }
}

/**
 * Fallback: Generate questions using a simple algorithm if AI is unavailable
 * This creates basic questions based on templates
 */
export function generateFallbackQuestions() {
  const templates = {
    programmer: [
      {
        question_text: "What is the time complexity of binary search?",
        option_1: "O(n)",
        option_2: "O(log n)",
        option_3: "O(n log n)",
        option_4: "O(1)",
        correct_answer: 2,
        domain: "programmer",
        difficulty: "medium",
      },
      {
        question_text: "Which data structure follows LIFO principle?",
        option_1: "Queue",
        option_2: "Stack",
        option_3: "Array",
        option_4: "Linked List",
        correct_answer: 2,
        domain: "programmer",
        difficulty: "easy",
      },
    ],
    analytics: [
      {
        question_text: "What does SQL stand for?",
        option_1: "Structured Query Language",
        option_2: "Simple Query Language",
        option_3: "System Query Language",
        option_4: "Standard Query Language",
        correct_answer: 1,
        domain: "analytics",
        difficulty: "easy",
      },
    ],
    tester: [
      {
        question_text: "What is the purpose of unit testing?",
        option_1: "Test the entire system",
        option_2: "Test individual components",
        option_3: "Test user interface",
        option_4: "Test performance",
        correct_answer: 2,
        domain: "tester",
        difficulty: "easy",
      },
    ],
  };

  // This is just a fallback - in production, you'd want more questions
  const questions = [];
  Object.values(templates).forEach((domainQuestions) => {
    questions.push(...domainQuestions);
  });

  return questions;
}

