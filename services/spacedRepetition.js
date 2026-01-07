import { supabase } from './supabase';

export const getRepetitionQuestion = async (userId) => {
  try {
    // Finde Videos, die vor mehr als 24 Stunden gelernt wurden
    const { data, error } = await supabase
      .from('learning_history')
      .select(`
        video_id,
        videos (title, question, options, correct_index, category)
      `)
      .eq('user_id', userId)
      .lt('last_learned_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data.videos;
  } catch (e) {
    return null;
  }
};