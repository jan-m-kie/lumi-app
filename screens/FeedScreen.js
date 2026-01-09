import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Video } from 'expo-av';
import { supabase } from '../services/supabase';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiIconButton, LumiText } from '../components/UI';
import QuizCard from '../components/QuizCard'; // Diese Komponente erstellen wir als Nächstes

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [user, setUser] = useState(null);

  const videoRefs = useRef([]);

  useEffect(() => {
    fetchUser();
    fetchVideos();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // LOGIK: Wir mischen Quizzes unter die Videos
  const feedItems = useMemo(() => {
    const items = [];
    videos.forEach((video) => {
      // 1. Das Video-Item
      items.push({ ...video, feedType: 'video' });
      // 2. Direkt danach das Quiz-Item (Test-Modus: nach jedem Video)
      items.push({ 
        id: `quiz-${video.id}`, 
        videoReference: video, 
        feedType: 'quiz' 
      });
    });
    return items;
  }, [videos]);

  const handleQuizSuccess = async (category) => {
    if (!user) return;
    const colName = `lumis_${category.toLowerCase()}`;
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      await supabase.from('profiles').update({
        [colName]: (profile[colName] || 0) + 1,
        total_lumis: (profile.total_lumis || 0) + 1,
      }).eq('id', user.id);
      
      alert("Super! Lumi-Punkt gesammelt! 🌟");
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item, index }) => {
    // FALL 1: Das Item ist ein Quiz
    if (item.feedType === 'quiz') {
      return (
        <View style={styles.itemContainer}>
          <QuizCard 
            video={item.videoReference} 
            onCorrect={() => handleQuizSuccess(item.videoReference.category)} 
          />
        </View>
      );
    }

    // FALL 2: Das Item ist ein Video
    return (
      <View style={styles.itemContainer}>
        <Video
          ref={(ref) => (videoRefs.current[index] = ref)}
          source={{ uri: item.video_url }}
          style={styles.video}
          resizeMode="cover"
          shouldPlay={currentIndex === index}
          isLooping
          isMuted={isMuted}
        />
        <View style={styles.overlay}>
          <View style={styles.categoryBadge}>
            <LumiText style={styles.categoryText}>{item.category} Welt</LumiText>
          </View>
          <LumiText type="h1" style={styles.videoTitle}>{item.title}</LumiText>
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        showsVerticalScrollIndicator={false}
      />
      <LumiIconButton 
        iconName={isMuted ? "volume-mute" : "volume-high"} 
        onPress={() => setIsMuted(!isMuted)}
        style={styles.muteButton} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  itemContainer: { height: height, width: '100%' },
  video: { flex: 1 },
  muteButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  overlay: { position: 'absolute', bottom: 120, left: 20, right: 20 },
  categoryBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 10 },
  categoryText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  videoTitle: { color: '#FFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 }
});
