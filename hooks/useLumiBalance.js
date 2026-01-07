import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useLumiBalance(userId) {
  const [balance, setBalance] = useState({
    astro: 0, word: 0, math: 0, wild: 0, body: 0, total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('lumis_astro, lumis_word, lumis_math, lumis_wild, lumis_body, total_lumis')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setBalance({
          astro: data.lumis_astro,
          word: data.lumis_word,
          math: data.lumis_math,
          wild: data.lumis_wild,
          body: data.lumis_body,
          total: data.total_lumis
        });
      }
      setLoading(false);
    };

    fetchBalance();

    // Echtzeit-Update: Wenn ein Gem gesammelt wird, aktualisiert sich die Anzeige sofort
    const subscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
      (payload) => {
        const newData = payload.new;
        setBalance({
          astro: newData.lumis_astro,
          word: newData.lumis_word,
          math: newData.lumis_math,
          wild: newData.lumis_wild,
          body: newData.lumis_body,
          total: newData.total_lumis
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return { balance, loading };
}
