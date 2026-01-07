import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto'

// Ersetze diese Werte mit deinen echten Projektdaten aus dem Supabase Dashboard
// Einstellungen -> API
const supabaseUrl = 'https://kkynrejiugopgurqorwb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreW5yZWppdWdvcGd1cnFvcndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDc5MTksImV4cCI6MjA4MjUyMzkxOX0.FRs67770FcimdZgcT9pILrkZjwzoifaBPSmITilXuyk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Hilfsfunktion, um den aktuell eingeloggten User zu bekommen
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};