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
const quizTimerRef = useRef(null); // Neuer Ref für den Timer

export default function FeedScreen() {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState(null); 
  const [solvedQuizzes, setSolvedQuizzes] = useState([]);
  const [user, setUser] = useState(null);

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

  // Initialer Trigger für das allererste Video
  useEffect(() => {
    if (videos.length > 0 && !loading) {
      const firstVideo = videos[0];
      if (!solvedQuizzes.includes(firstVideo.id) && !activeQuizId) {
        setTimeout(() => {
          setActiveQuizId(firstVideo.id);
          setShowQuiz(true);
        }, 1000);
      }
    }
  }, [videos, loading]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const item = viewableItems[0];
      const index = item.index;
      const currentVideo = item.item;
      
      setCurrentIndex(index);
      setShowQuiz(false); // Altes Quiz schließen, falls noch offen
      setActiveQuizId(null);

      // Timer zurücksetzen, falls wir schnell weiterwischen
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current);

      // Nur starten, wenn Video noch nicht gelöst
      if (!solvedQuizzes.includes(currentVideo.id)) {
        console.log("Starte 5s Timer für Quiz:", currentVideo.title);
        
        quizTimerRef.current = setTimeout(() => {
          setActiveQuizId(currentVideo.id);
          setShowQuiz(true);
          console.log("Quiz jetzt eingeblendet!");
        }, 5000); // 5 Sekunden suggeriertes Zuschauen
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  const handleQuizSuccess = async (category) => {
    const currentVideoId = videos[currentIndex]?.id;
    
    if (currentVideoId) {
      setSolvedQuizzes(prev => [...prev, currentVideoId]);
      setActiveQuizId(null); // Lock lösen
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

  const handleQuizClose = () => {
    setShowQuiz(false);
    // Wir lassen activeQuizId gesetzt, damit es beim selben Video nicht sofort wieder kommt
  };

  // Lock freigeben, wenn das Video gewechselt wird
  useEffect(() => {
    const currentVideo = videos[currentIndex];
    if (currentVideo && activeQuizId !== currentVideo.id) {
       setActiveQuizId(null);
    }
  }, [currentIndex]);

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
          onWrong={handleQuizClose}
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    alignSelf: 'flex-start'
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
