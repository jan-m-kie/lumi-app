import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, FlatList, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { supabase } from '../services/supabase';
import { COLORS } from '../constants/Theme';
import { LUMI_WORLDS } from '../constants/Worlds'; 
import { LumiIconButton, LumiText } from '../components/UI';
import QuizCard from '../components/QuizCard';

const { height } = Dimensions.get('window');

const VideoItem = ({ url, isActive, isMuted, item, badgeColor }) => {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = isMuted;
    if (isActive) p.play();
  });

  useEffect(() => {
    if (isActive) player.play();
    else player.pause();
  }, [isActive, player]);

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  return (
    <View style={styles.itemContainer}>
      <VideoView player={player} style={styles.video} contentFit="cover" showsPlaybackControls={false} />
      <View style={styles.overlay}>
        <View style={[styles.categoryBadge, { backgroundColor: badgeColor }]}>
          <LumiText style={styles.categoryText}>{item.category} Welt</LumiText>
        </View>
        <LumiText type="h1" style={styles.videoTitle}>{item.title}</LumiText>
      </View>
    </View>
  );
};

export default function FeedScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState('all');

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (data) setVideos(data);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const filteredVideos = useMemo(() => {
    if (selectedWorld === 'all') return videos;
    return videos.filter(v => v.category?.toLowerCase() === selectedWorld.toLowerCase());
  }, [selectedWorld, videos]);

  const feedItems = useMemo(() => {
    const items = [];
    filteredVideos.forEach((v) => {
      items.push({ ...v, feedType: 'video' });
      items.push({ id: `quiz-${v.id}`, videoReference: v, feedType: 'quiz' });
    });
    return items;
  }, [filteredVideos]);

  const handleQuizSuccess = async (category) => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const colName = `lumis_${category.toLowerCase()}`;
      await supabase.from('profiles').update({
        [colName]: (profile[colName] || 0) + 1,
        total_lumis: (profile.total_lumis || 0) + 1,
      }).eq('id', user.id);
    } catch (err) { console.error(err); }
  };

  const renderItem = ({ item, index }) => {
    if (item.feedType === 'quiz') {
      return (
        <View style={styles.itemContainer}>
          <QuizCard 
            video={item.videoReference} 
            isActive={currentIndex === index} 
            setIsMuted={setIsMuted} 
            onCorrect={() => handleQuizSuccess(item.videoReference.category)} 
          />
        </View>
      );
    }
    const badgeColor = COLORS.worlds?.[item.category?.toLowerCase()] || COLORS.primary;
    return <VideoItem url={item.video_url} isActive={currentIndex === index} isMuted={isMuted} item={item} badgeColor={badgeColor} />;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }).current;

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const isCurrentItemQuiz = feedItems[currentIndex]?.feedType === 'quiz';

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => setSelectedWorld('all')} style={[styles.worldTab, selectedWorld === 'all' && styles.worldTabActive]}>
            <LumiText style={[styles.worldTabText, selectedWorld === 'all' && styles.textWhite]}>🌎 Alle</LumiText>
          </TouchableOpacity>
          {LUMI_WORLDS.map((w) => (
            <TouchableOpacity key={w.id} onPress={() => setSelectedWorld(w.id)} style={[styles.worldTab, selectedWorld === w.id && { backgroundColor: w.color, borderColor: w.color }]}>
              <LumiText style={[styles.worldTabText, selectedWorld === w.id && styles.textWhite]}>{w.icon} {w.label.split(' ')[0]}</LumiText>
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
      />

      {/* FIX: Mute-Button verschwindet beim Quiz automatisch */}
      {!isCurrentItemQuiz && (
        <LumiIconButton 
          iconName={isMuted ? "volume-off" : "volume-high"} 
          onPress={() => setIsMuted(!isMuted)} 
          style={styles.muteButton} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  itemContainer: { height: height, width: '100%' },
  video: { flex: 1 },
  topNav: { position: 'absolute', top: 50, left: 0, right: 0, zIndex: 20, height: 60 },
  scrollContent: { paddingHorizontal: 15, alignItems: 'center' },
  worldTab: { backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  worldTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  worldTabText: { color: COLORS.textDark, fontSize: 14, fontWeight: 'bold' },
  textWhite: { color: '#FFF' },
  muteButton: { position: 'absolute', top: 110, right: 20, zIndex: 10 },
  overlay: { position: 'absolute', bottom: 120, left: 20, right: 20 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 10 },
  categoryText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  videoTitle: { color: '#FFF', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 10, fontSize: 24 }
});
