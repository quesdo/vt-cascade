// Supabase configuration for real-time synchronization
// Copy this file to 'supabase-config.js' and replace with your actual credentials

window.SUPABASE_URL = 'https://your-project-id.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key-here';

// Generate unique user ID for this session
window.USER_ID = 'user_' + Math.random().toString(36).substr(2, 9);
