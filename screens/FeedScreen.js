import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import QuizOverlay from '../components/QuizOverlay';
import { LumiIconButton } from '../components/UI';

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [user, setUser] = useState(null);
  
  // Trackt, welche Video-IDs bereits erfolgreich gequizzt wurden
  const [solvedQuizzes, setSolvedQuizzes] = useState([]);

  const videoRefs = useRef([]);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_curator')
            .eq('id', authUser.id)
            .single();

          if (!error && profile) {
            setUser({ ...authUser, is_curator: profile.is_curator });
          } else {
            setUser(authUser);
          }
        }
      } catch (err) {
        console.error('User-Fetch Fehler:', err);
      }
    };

    fetchUserAndProfile();
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data);
    } catch (error) {
      console.error('Fehler beim Laden:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      const currentVideo = viewableItems[0].item;
      setCurrentIndex(index);

      // --- CHUNKING LOGIK ---
      // Trigger: Jedes 3. Video UND das Quiz für dieses Video wurde noch nicht gelöst
      if ((index + 1) % 3 === 0 && !solvedQuizzes.includes(currentVideo.id)) {
        setShowQuiz(true);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const handleQuizSuccess = async (category) => {
    const currentVideoId = videos[currentIndex]?.id;
    
    // Video als "gelöst" markieren, damit das Quiz nicht erneut triggert
    if (currentVideoId) {
      setSolvedQuizzes(prev => [...prev, currentVideoId]);
    }

    if (user) {
      const colName = `lumis_${category.toLowerCase()}`;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const newBalance = (profile[colName] || 0) + 1;
        const totalLumis = (profile.total_lumis || 0) + 1;

        await supabase
          .from('profiles')
          .update({
            [colName]: newBalance,
            total_lumis: totalLumis,
          })
          .eq('id', user.id);

      } catch (err) {
        console.error('Update Fehler:', err);
      }
    }
    setShowQuiz(false);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.videoContainer}>
      <Video
        ref={(ref) => (videoRefs.current[index] = ref)}
        source={{ uri: item.video_url }}
        style={styles.video}
        resizeMode="cover"
        shouldPlay={currentIndex === index && !showQuiz}
        isLooping
        isMuted={isMuted}
        useNativeControls={false}
      />

      <View style={styles.overlay}>
        <Text style={styles.categoryTag}>{item.category} Welt</Text>
        <Text style={styles.videoTitle}>{item.title}</Text>

        <TouchableOpacity
          style={styles.curatorLink}
          onPress={() =>
            navigation.navigate('ParentalGate', {
              targetScreen: 'CuratorProfile',
              params: { curatorId: item.curator_id },
            })
          }>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>🎓</Text>
          </View>
          <Text style={styles.curatorName}>Kurator ansehen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Lumi bereitet die Welt vor...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsVerticalScrollIndicator={false}
        windowSize={3}
        removeClippedSubviews={true}
      />

      <LumiIconButton 
        iconName={isMuted ? "volume-mute" : "volume-high"} 
        onPress={() => setIsMuted(!isMuted)}
        style={styles.fixedMuteButton} 
      />

      {showQuiz && (
        <QuizOverlay
          video={videos[currentIndex]}
          onCorrect={handleQuizSuccess}
          onWrong={() => setShowQuiz(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { height, backgroundColor: '#000' },
  video: { flex: 1 },
  fixedMuteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 999,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200EE',
  },
  loadingText: { color: 'white', marginTop: 10, fontWeight: 'bold' },
  overlay: { position: 'absolute', bottom: 100, left: 20, right: 20 },
  categoryTag: {
    backgroundColor: '#FFD700',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowRadius: 4,
  },
  curatorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  curatorName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
