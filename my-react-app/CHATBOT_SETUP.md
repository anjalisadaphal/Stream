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

### 1. Get Gemini API Key

1. Go to https://makersuite.google.com/app/apikey or https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the key (starts with `AIza`)

### 2. Add to Environment Variables

Add to your `.env` file:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Restart Development Server

```bash
npm run dev
```

## How It Works

### Chatbot
- Uses Google Gemini Pro model
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

- **Chatbot**: Free tier available, then pay-as-you-go pricing
- **Question Generation**: Free tier available, then pay-as-you-go pricing (30 questions, 3 API calls)
- Check current pricing at: https://ai.google.dev/pricing

**Cost Optimization Tips:**
- Questions are cached in database to reduce API calls
- Consider implementing rate limiting for production
- Monitor usage in Google AI Studio dashboard

## Security Notes

⚠️ **Important**: The Gemini API key is exposed in client-side code (VITE_ prefix).

**For Production:**
- Create a backend API proxy to hide the API key
- Use serverless functions (Vercel, Netlify, etc.)
- Implement rate limiting and usage monitoring
- Consider using Supabase Edge Functions for the proxy

## Troubleshooting

### Chatbot not responding
- Check if `VITE_GEMINI_API_KEY` is set in `.env`
- Restart dev server after adding the key
- Check browser console for errors
- Verify API key is valid in Google AI Studio

### Questions not generating
- Check API key configuration
- Verify Gemini API quota/limits
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
3. Check Gemini API status: https://status.cloud.google.com
4. Review API usage in Google AI Studio dashboard

