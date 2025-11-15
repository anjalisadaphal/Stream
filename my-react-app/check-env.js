import { readFileSync } from 'fs';

try {
  const envContent = readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  
  let hasUrl = false;
  let hasKey = false;
  let keyValue = '';
  
  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=') && !line.includes('your-project-ref')) {
      hasUrl = true;
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      hasKey = true;
      keyValue = line.split('=')[1]?.trim() || '';
    }
  }
  
  console.log('\n📋 Environment Variables Check:\n');
  console.log(`VITE_SUPABASE_URL: ${hasUrl ? '✅ Set' : '❌ Missing or invalid'}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${hasKey ? (keyValue === 'your-anon-key-here' ? '❌ Still has placeholder' : '✅ Set') : '❌ Missing'}`);
  
  if (!hasUrl || !hasKey || keyValue === 'your-anon-key-here') {
    console.log('\n⚠️  Please update your .env file with the correct values.');
    console.log('Get your anon key from: https://supabase.com/dashboard/project/vtndzgtkmnrdbrywfzlj/settings/api\n');
    process.exit(1);
  } else {
    console.log('\n✅ All environment variables are configured correctly!\n');
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}

