import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// This script checks that row-level security (RLS) policies on the `finds` table
// behave as expected for anonymous (unauthenticated) and privileged (service role) access.
// It uses environment variables defined in `.env.local` or the environment. To run:
//   node --env-file=.env.local scripts/rls_test.mjs

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL in environment.');
  process.exit(1);
}
if (!anonKey) {
  console.error('Missing SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}
if (!serviceKey) {
  console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is missing. Only the anonymous test will run.');
}

async function testAnon() {
  const client = createClient(supabaseUrl, anonKey);
  try {
    const { data, error, status } = await client.from('finds').select('*').limit(5);
    if (error) {
      console.log('Anon access returned error as expected:', error.message);
    } else {
      console.log('Anon access unexpectedly returned data:', data);
    }
  } catch (err) {
    console.error('Anon access threw:', err.message);
  }
}

async function testService() {
  if (!serviceKey) return;
  const admin = createClient(supabaseUrl, serviceKey);
  try {
    const { data, error } = await admin.from('finds').select('*').limit(5);
    if (error) {
      console.error('Service role query error:', error.message);
    } else {
      console.log('Service role access succeeded. Number of rows:', data?.length ?? 0);
    }
  } catch (err) {
    console.error('Service role access threw:', err.message);
  }
}

async function runTests() {
  console.log('Running RLS tests...');
  await testAnon();
  await testService();
  console.log('Done.');
}

runTests();
