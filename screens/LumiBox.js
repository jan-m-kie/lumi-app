import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,    // Hinzugefügt
  TouchableOpacity, // Hinzugefügt
  ActivityIndicator,
  Alert 
} from 'react-native';
import { supabase } from '../services/supabase';
import { LUMI_WORLDS } from '../constants/Worlds';

// Hilfskomponente für den Fortschritt der Chunks
const ProgressBar = ({ progress, color }) => (
  <View style={styles.progressContainer}>
    <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: color }]} />
  </View>
);

export default function LumiBox({ navigation }) {
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meine LumiBox 🎁</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutSmall}>
          <Text style={styles.logoutSmallText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Deine Lern-Meisterwerke</Text>
        {LUMI_WORLDS.map((world) => {
          const count = balance[`lumis_${world.id}`] || 0;
          const progress = Math.min(count / 10, 1);
          return (
            <View key={world.id} style={styles.masteryCard}>
              <View style={styles.masteryHeader}>
                <Text style={styles.masteryIcon}>{world.icon}</Text>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.worldName}>{world.label}</Text>
                  <Text style={styles.masteryStatus}>{count}/10 Chunks gefestigt</Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  backButton: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, flex: 1 },
  logoutSmall: { padding: 5 },
  logoutSmallText: { color: '#FF4433', fontSize: 12 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  masteryCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 2 },
  masteryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  masteryIcon: { fontSize: 30 },
  worldName: { fontSize: 16, fontWeight: 'bold' },
  masteryStatus: { fontSize: 12, color: '#666' },
  progressContainer: { height: 10, backgroundColor: '#EEE', borderRadius: 5, overflow: 'hidden' },
  progressBar: { height: '100%' }
});