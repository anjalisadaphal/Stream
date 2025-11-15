# Chatbot & Dynamic Questions Setup Guide

## Overview

The STREAM application now includes:
1. **AI-Powered Chatbot**: Interactive assistant on the home page to help users understand the platform
2. **Dynamic Question Generation**: Each quiz generates unique 30 questions using AI instead of static hardcoded questions

## Features

### Chatbot Features
- Floating chatbot button on the home page
- Minimize/maximize functionality
- Quick question suggestions
- Real-time AI responses about the platform
- Helpful information about features, careers, and assessment process

### Dynamic Question Generation
- Generates 30 unique questions per quiz attempt
- Questions distributed across 3 domains (Programmer, Analytics, Tester)
- Mix of difficulty levels (Easy, Medium, Hard)
- Questions are cached in database for performance
- Fallback to database questions if AI is unavailable

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### 2. Add to Environment Variables

Add to your `.env` file:

```env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Restart Development Server

```bash
npm run dev
```

## How It Works

### Chatbot
- Uses OpenAI GPT-4o-mini model for cost efficiency
- System prompt includes STREAM platform information
- Handles questions about features, careers, and assessment process
- Falls back gracefully if API key is not configured

### Question Generation
1. When user starts quiz, system attempts to generate questions via AI
2. Generates 10 questions per domain (Programmer, Analytics, Tester)
3. Questions are validated and saved to database
4. If AI fails, falls back to database questions
5. If database is empty, uses fallback template questions

## API Costs

- **Chatbot**: ~$0.001-0.002 per conversation (using GPT-4o-mini)
- **Question Generation**: ~$0.05-0.10 per quiz (30 questions, 3 API calls)

**Cost Optimization Tips:**
- Questions are cached in database to reduce API calls
- Consider implementing rate limiting for production
- Monitor usage in OpenAI dashboard

## Security Notes

⚠️ **Important**: The OpenAI API key is exposed in client-side code (VITE_ prefix).

**For Production:**
- Create a backend API proxy to hide the API key
- Use serverless functions (Vercel, Netlify, etc.)
- Implement rate limiting and usage monitoring
- Consider using Supabase Edge Functions for the proxy

## Troubleshooting

### Chatbot not responding
- Check if `VITE_OPENAI_API_KEY` is set in `.env`
- Restart dev server after adding the key
- Check browser console for errors
- Verify API key is valid in OpenAI dashboard

### Questions not generating
- Check API key configuration
- Verify OpenAI account has credits
- Check browser console for errors
- System will fallback to database questions automatically

### High API costs
- Questions are cached - subsequent quizzes use cached questions
- Consider reducing question generation frequency
- Implement question pooling from database

## Customization

### Modify Chatbot Behavior
Edit `src/services/aiService.js` → `getChatbotResponse()` function:
- Change system prompt
- Adjust temperature for more/less creative responses
- Modify max_tokens for response length

### Modify Question Generation
Edit `src/services/aiService.js` → `generateQuizQuestions()` function:
- Change question distribution (currently 10 per domain)
- Adjust difficulty distribution
- Modify prompts for different question styles

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check OpenAI API status: https://status.openai.com
4. Review API usage in OpenAI dashboard

