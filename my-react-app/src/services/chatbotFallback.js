/**
 * Fallback responses for chatbot when AI API is unavailable
 * Provides intelligent responses based on common questions
 */

const fallbackResponses = {
  // Platform questions
  "what is stream": "STREAM (Smart Career Guidance System) is an AI-powered platform that helps you discover your ideal tech career path. Through a 30-question assessment, we analyze your skills and recommend whether you're best suited for Programming, Analytics, or Testing careers.",
  
  "how does it work": "STREAM works in 3 simple steps: 1) Take our 30-minute assessment quiz, 2) Get instant results with personalized career recommendations, 3) Access your dashboard to track progress and view detailed insights about your recommended career path.",
  
  "how long": "The assessment takes approximately 30 minutes to complete. You'll answer 30 questions covering different aspects of programming, analytics, and testing. Results are generated instantly after completion!",
  
  "how long does": "The quiz takes about 30 minutes to complete. You have a 30-minute timer, and you can navigate between questions, mark them for review, and submit when ready.",
  
  // Career questions
  "programmer": "The Programmer career path focuses on building software solutions, creating applications, and solving complex technical problems. If you enjoy logical thinking, problem-solving, and creating things with code, this might be your path. Our assessment evaluates your programming aptitude through various questions.",
  
  "analytics": "The Analytics career path is perfect for those who love working with data, finding patterns, and making data-driven decisions. Analytics professionals transform raw data into actionable insights that drive business decisions. If you're curious about trends and enjoy working with numbers, this could be your calling.",
  
  "tester": "The Tester/QA career path is ideal for detail-oriented individuals who ensure software quality. Testers find bugs, verify functionality, and maintain excellence in software releases. If you have a keen eye for detail and enjoy systematic problem-solving, testing might be perfect for you.",
  
  // Feature questions
  "features": "STREAM offers several key features: 1) Personalized career assessment quiz, 2) Detailed results with career recommendations, 3) Dashboard to track your progress over time, 4) Learning roadmaps tailored to your recommended path, 5) Skill analysis and improvement suggestions.",
  
  "dashboard": "Your dashboard shows your assessment history, progress over time, skill affinity charts, and past attempts. You can retake the assessment to see how your skills evolve and track your career journey.",
  
  "results": "After completing the quiz, you'll receive: 1) Your recommended career domain (Programmer, Analytics, or Tester), 2) Detailed scores for each domain, 3) A personalized learning roadmap, 4) Job profile recommendations, 5) Skills to improve, and 6) Learning resources.",
  
  // General help
  "help": "I can help you with: Understanding what STREAM is, How the assessment works, Information about career paths (Programming, Analytics, Testing), Platform features, Getting started, Dashboard and results. What would you like to know?",
  
  "start": "To get started: 1) Sign up or sign in to your account, 2) Click 'Start Your Free Assessment' on the home page, 3) Complete the 30-question quiz, 4) View your personalized results. It's completely free and takes just 30 minutes!",
};

/**
 * Get a fallback response based on user input
 */
export function getFallbackResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Check for exact matches or keywords
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  // Default responses based on question type
  if (lowerMessage.includes("?")) {
    if (lowerMessage.includes("what") || lowerMessage.includes("tell me")) {
      return "STREAM is a career assessment platform that helps you discover your ideal tech career path. We offer assessments in Programming, Analytics, and Testing. Would you like to know more about a specific career path or how the assessment works?";
    }
    if (lowerMessage.includes("how")) {
      return "The STREAM assessment is simple: take a 30-question quiz covering different tech domains, get instant results with career recommendations, and access your personalized dashboard. The whole process takes about 30 minutes. Would you like more details about any specific part?";
    }
    if (lowerMessage.includes("when") || lowerMessage.includes("time")) {
      return "The assessment takes 30 minutes to complete. You can start anytime after signing in. Results are available immediately after you finish the quiz!";
    }
  }
  
  // Generic helpful response
  return "I'm here to help you learn about STREAM! I can answer questions about: the platform features, how the assessment works, career paths (Programming, Analytics, Testing), getting started, and your results. What would you like to know?";
}

