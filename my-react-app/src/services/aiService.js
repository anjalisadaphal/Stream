/**
 * AI Service for generating questions and handling chatbot responses
 * Uses OpenAI API or can be configured to use other AI providers
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Generate 30 unique quiz questions dynamically
 * @param {Array} existingQuestions - Questions to avoid duplicates
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateQuizQuestions(existingQuestions = []) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.");
  }

  const domains = ["programmer", "analytics", "tester"];
  const difficulties = ["easy", "medium", "hard"];
  
  // Generate 10 questions per domain
  const questionsPerDomain = 10;
  const allQuestions = [];

  for (const domain of domains) {
    try {
      const prompt = `Generate ${questionsPerDomain} unique multiple-choice questions for a career assessment quiz in the ${domain} domain. 
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

Make questions practical, relevant to real-world ${domain} work, and avoid generic questions.`;

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using cheaper model for cost efficiency
          messages: [
            {
              role: "system",
              content: "You are a quiz question generator. Always return valid JSON arrays only, no additional text.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8, // Higher temperature for more variety
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to generate questions");
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content received from AI");
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
  if (!OPENAI_API_KEY) {
    // Fallback response if API key is not configured
    return "I'm currently unavailable. Please configure the OpenAI API key to enable chatbot functionality.";
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
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
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

