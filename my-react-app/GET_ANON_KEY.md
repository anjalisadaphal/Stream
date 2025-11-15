# How to Get Your Supabase Anon Key

## Quick Steps:

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/vtndzgtkmnrdbrywfzlj/settings/api

2. **Find the "Project API keys" section**

3. **Copy the "anon public" key** (it starts with `eyJ...`)

4. **Update your `.env` file:**
   - Open `my-react-app/.env`
   - Replace `your-anon-key-here` with your actual anon key
   - Make sure there are no quotes around the key

5. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Example .env file:

```env
VITE_SUPABASE_URL=https://vtndzgtkmnrdbrywfzlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bmR6Z3RrbW5yZGJyeXdmemxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2ODk2MDAsImV4cCI6MjA0NzI2NTYwMH0.your-actual-key-here
```

**Important:** 
- The anon key is safe to use in client-side code (it's public)
- Never commit your `.env` file to git (it's already in `.gitignore`)
- After updating `.env`, you MUST restart the dev server for changes to take effect

