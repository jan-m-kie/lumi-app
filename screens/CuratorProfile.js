import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,           
  ActivityIndicator 
} from 'react-native';
import { supabase } from '../services/supabase';
import { LUMI_WORLDS } from '../constants/Worlds';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText } from '../components/UI';

export default function CuratorProfile({ route, navigation }) {
  const curatorIdFromParams = route.params?.curatorId;
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Wer ist gerade eingeloggt?
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        // 2. Welches Profil schauen wir uns an? 
        const targetId = curatorIdFromParams || authUser?.id;
        
        if (!targetId) return;

        // Prüfen, ob es das eigene Profil ist
        setIsOwnProfile(authUser?.id === targetId);

        // 3. Profil-Details laden
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();
        setProfile(profileData);

        // 4. Videos laden
        const { data: videoData } = await supabase
          .from('videos')
          .select('*')
          .eq('curator_id', targetId)
          .eq('approved', true);
        setVideos(videoData || []);

      } catch (error) {
        console.error("Fehler im Profil-Load:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [curatorIdFromParams]);

  const handleLogout = async () => {
    Alert.alert(
      "Abmelden",
      "Möchtest du Lumi verlassen?",
      [
        { text: "Abbrechen", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            await supabase.auth.signOut();
          } 
        }
      ]
    );
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#6200EE" />
    </View>
  );

  const worldInfo = LUMI_WORLDS.find(w => w.id === profile?.specialty);

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
    {isOwnProfile && (
      <LumiButton 
        title="Abmelden 🚪" 
        onPress={handleLogout} 
        type="danger" 
        style={{ position: 'absolute', top: 10, right: 20, zIndex: 10 }}
      />
    )}

    <ScrollView>
      <View style={styles.header}>
        <View style={[styles.avatarLarge, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.avatarText}>{profile?.username?.charAt(0) || '🎓'}</Text>
        </View>
        <LumiText type="h1">{profile?.username}</LumiText>
        
        {worldInfo && (
          <View style={[styles.badge, { backgroundColor: worldInfo.color }]}>
            <LumiText style={{ color: COLORS.white, fontWeight: 'bold' }}>
              {worldInfo.icon} Experte für {worldInfo.label}
            </LumiText>
          </View>
        )}
        <LumiText style={styles.bio}>
          {profile?.bio || "Dieser Kurator liebt es, Wissen in kleinen Chunks zu teilen."}
        </LumiText>
      </View>
      
      {/* ... weitere Bereiche ... */}
    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    alignItems: 'center', 
    padding: SIZES.padding * 2, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE', 
    marginTop: 20 
  },
  avatarLarge: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  avatarText: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
  bio: { 
    textAlign: 'center', 
    marginTop: 15, 
    paddingHorizontal: 20, 
    lineHeight: 20 
  },
  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginTop: 10 
  }
  // videoGrid, videoMiniCard etc. wurden gelöscht, 
  // falls du sie im JSX oben noch nicht durch Lumi-Elemente ersetzt hast, 
  // füge sie hier wieder ein, aber NUR wenn sie oben im Code auch gerufen werden!
});