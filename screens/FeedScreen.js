import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Video } from 'expo-av';
import { supabase } from '../services/supabase';
import { COLORS, SIZES } from '../constants/Theme';
import { LUMI_WORLDS } from '../constants/Worlds'; //
import { LumiIconButton, LumiText } from '../components/UI';
import QuizCard from '../components/QuizCard';

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState('all'); // Filter-State

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

  // 1. FILTER-LOGIK: Videos nach Welt filtern
  const filteredVideos = useMemo(() => {
    if (selectedWorld === 'all') return videos;
    return videos.filter(v => v.category?.toLowerCase() === selectedWorld.toLowerCase());
  }, [selectedWorld, videos]);

  // 2. FEED-LOGIK: Mischen von Videos und Quizzes basierend auf der Auswahl
  const feedItems = useMemo(() => {
    const items = [];
    filteredVideos.forEach((video) => {
      items.push({ ...video, feedType: 'video' });
      // Direkt nach dem Video das Quiz einfügen
      items.push({ 
        id: `quiz-${video.id}`, 
        videoReference: video, 
        feedType: 'quiz' 
      });
    });
    return items;
  }, [filteredVideos]);

  const handleQuizSuccess = async (category) => {
    if (!user) return;
    const colName = `lumis_${category.toLowerCase()}`;
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      await supabase.from('profiles').update({
        [colName]: (profile[colName] || 0) + 1,
        total_lumis: (profile.total_lumis || 0) + 1,
      }).eq('id', user.id);
      
      // ALERT ENTFERNT: Das Feedback kommt jetzt akustisch aus der QuizCard.js
      console.log("Lumi-Punkt in DB gespeichert für:", category); 
      
    } catch (err) {
      console.error("Fehler beim Speichern der Lumis:", err);
    }
  };
  
  const renderItem = ({ item, index }) => {
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
          <View style={[styles.categoryBadge, { backgroundColor: COLORS.worlds[item.category] || COLORS.primary }]}>
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

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* TOP NAVIGATION / WORLD FILTER */}
      <View style={styles.topNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            onPress={() => setSelectedWorld('all')}
            style={[styles.worldTab, selectedWorld === 'all' && styles.worldTabActive]}
          >
            <LumiText style={[styles.worldTabText, selectedWorld === 'all' && styles.textWhite]}>
              🌎 Alle
            </LumiText>
          </TouchableOpacity>
          {LUMI_WORLDS.map((world) => (
            <TouchableOpacity 
              key={world.id}
              onPress={() => setSelectedWorld(world.id)}
              style={[
                styles.worldTab, 
                selectedWorld === world.id && { backgroundColor: world.color, borderColor: world.color }
              ]}
            >
              <LumiText style={[styles.worldTabText, selectedWorld === world.id && styles.textWhite]}>
                {world.icon} {world.label.split(' ')[0]}
              </LumiText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        showsVerticalScrollIndicator={false}
        // Optimierung für schnelles Scrollen
        removeClippedSubviews={true}
        windowSize={3}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  itemContainer: { height: height, width: '100%' },
  video: { flex: 1 },
  
  // TOP NAV STYLES
  topNav: { 
    position: 'absolute', 
    top: 50, 
    left: 0, 
    right: 0, 
    zIndex: 20,
    height: 60,
  },
  scrollContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  worldTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)', // Funktioniert primär im Web, für Native nutzen wir Opacity
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  worldTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  worldTabText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textWhite: { color: '#FFF' },

  // OVERLAY & UI
  muteButton: { position: 'absolute', top: 110, right: 20, zIndex: 10 },
  overlay: { position: 'absolute', bottom: 120, left: 20, right: 20 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 10 },
  categoryText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  videoTitle: { color: '#FFF', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 10, fontSize: 24 }
});
