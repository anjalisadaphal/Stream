# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root of `my-react-app` with the following variables:

### Supabase Client Configuration (Required for React App)

These are needed for the Supabase JavaScript client used in the React app:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini API Key (Required for AI-powered features)
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

**How to get these:**
1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to Settings → API
3. Copy the "Project URL" → use as `VITE_SUPABASE_URL`
4. Copy the "anon public" key → use as `VITE_SUPABASE_ANON_KEY`

**How to get Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey or https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the key and add it as `VITE_GEMINI_API_KEY`
5. **Note:** The API key will be visible in client-side code. For production, consider using a backend proxy.

### Database Connection Strings (For Migrations/Server-side)

These are for direct PostgreSQL database access (migrations, server-side operations):

```env
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.vtndzgtkmnrdbrywfzlj:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.vtndzgtkmnrdbrywfzlj:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password.

## Setup Steps

1. Create a `.env` file in the `my-react-app` directory
2. Add all the variables above with your actual values
3. Restart your development server (`npm run dev`) for changes to take effect

## Security Note

- Never commit `.env` files to version control
- The `.env` file is already in `.gitignore`
- Use `.env.example` as a template (without actual secrets)

