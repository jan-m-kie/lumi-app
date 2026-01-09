import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { supabase } from '../services/supabase';
import { LUMI_WORLDS } from '../constants/Worlds';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiText } from '../components/UI';

const ProgressBar = ({ progress, color }) => (
  <View style={styles.progressContainer}>
    <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: color }]} />
  </View>
);

export default function LumiBox() {
  const [balance, setBalance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setBalance(data || {});
      }
    } catch (error) {
      console.error('Ladefehler Box:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* HEADER BEREICH - Ohne Back-Button, dafür einheitlicher Logout */}
      <View style={styles.header}>
        <LumiText type="h2" style={{ flex: 1 }}>Meine Lumi-Box 🎁</LumiText>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutSmall}>
          <LumiText style={styles.logoutSmallText}>Abmelden 🚪</LumiText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LumiText type="h1" style={styles.sectionTitle}>Deine Erfolge</LumiText>
        
        {LUMI_WORLDS.map((world) => {
          const count = balance[`lumis_${world.id.toLowerCase()}`] || 0;
          const progress = Math.min(count / 10, 1);
          
          return (
            <View key={world.id} style={styles.masteryCard}>
              <View style={styles.masteryHeader}>
                <LumiText style={styles.masteryIcon}>{world.icon}</LumiText>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <LumiText type="h2" style={{ fontSize: 18 }}>{world.label}</LumiText>
                  <LumiText style={styles.masteryStatus}>{count}/10 Chunks gefestigt</LumiText>
                </View>
              </View>
              <ProgressBar progress={progress} color={world.color} />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    // marginTop entfernt, da SafeAreaView das im Web oft selbst regelt, 
    // falls es klebt, kannst du paddingTop: 10 nutzen
  },
  logoutSmall: { 
    backgroundColor: 'rgba(255, 68, 51, 0.1)', 
    paddingHorizontal: 15, // Einheitlich mit CuratorProfile
    paddingVertical: 8, 
    borderRadius: 20 
  },
  logoutSmallText: { 
    color: '#FF4433', 
    fontSize: 14, // Einheitlich mit CuratorProfile
    fontWeight: 'bold' 
  },
  scrollContent: { padding: 20 },
  sectionTitle: { marginBottom: 25, textAlign: 'left' },
  masteryCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    padding: 20, 
    marginBottom: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  masteryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  masteryIcon: { fontSize: 32 },
  masteryStatus: { fontSize: 13, color: '#999', marginTop: 2 },
  progressContainer: { 
    height: 12, 
    backgroundColor: '#F0F0F0', 
    borderRadius: 6, 
    overflow: 'hidden' 
  },
  progressBar: { height: '100%', borderRadius: 6 }
});
