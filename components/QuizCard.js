import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText, LumiSpeechBubble } from './UI';

const { height, width } = Dimensions.get('window');

export default function QuizCard({ video, isActive, onCorrect }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const hasSpoken = useRef(false); // Trackt, ob für dieses Quiz schon gesprochen wurde
  const useNativeDriver = Platform.OS !== 'web';

  const lumiVoiceOptions = {
    language: 'de-DE',
    pitch: 1.2,
    rate: 0.9,
  };

  // 1. Animation (separater Effekt)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 2000, useNativeDriver }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver }),
      ])
    ).start();
  }, []);

  // 2. SPRACH-LOGIK: Präzise Steuerung
  useEffect(() => {
    if (isActive && video?.question && !hasSpoken.current) {
      Speech.stop(); 
      Speech.speak(video.question, lumiVoiceOptions);
      hasSpoken.current = true; // Markiert als vorgelesen
    } 
    
    if (!isActive) {
      Speech.stop();
      hasSpoken.current = false; // Reset für den nächsten Besuch
    }

    return () => Speech.stop();
  }, [isActive, video]);

  const handleAnswerPress = (index) => {
    Speech.stop();
    if (index === video.correct_index) {
      Speech.speak("Super! Das ist richtig, Weiter so.", lumiVoiceOptions);
      onCorrect();
    } else {
      Speech.speak("Leider falsch, probiere es noch einmal", lumiVoiceOptions);
    }
  };

  const parsedOptions = useMemo(() => {
    if (!video?.options) return [];
    if (Array.isArray(video.options)) return video.options;
    try { return JSON.parse(video.options); } catch (e) { return []; }
  }, [video.options]);

  const worldColor = COLORS.worlds?.[video.category?.toLowerCase()] || COLORS.primary;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <Animated.View style={[styles.avatarWrapper, { transform: [{ translateY: floatAnim }] }]}>
            <Image 
              source={require('../assets/Gemini_Generated_Image_q46murq46murq46m.png')} 
              style={styles.lumiMascot}
              resizeMode="contain"
            />
          </Animated.View>
          <View style={styles.bubbleWrapper}>
            <LumiSpeechBubble borderColor={worldColor}>
              <LumiText type="h2" style={styles.questionText}>
                {video?.question || "Was hast du gerade gelernt?"}
              </LumiText>
            </LumiSpeechBubble>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {parsedOptions.map((option, index) => (
            <LumiButton
              key={index}
              title={option}
              type="secondary"
              onPress={() => handleAnswerPress(index)}
              style={styles.optionMargin} 
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    height, 
    width, 
    backgroundColor: COLORS.background, // Jetzt dunkel für Kontrast
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  content: { width: '100%', maxWidth: 500, alignItems: 'center' },
  avatarSection: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 30 },
  avatarWrapper: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  lumiMascot: { width: 100, height: 100 },
  bubbleWrapper: { flex: 1, marginLeft: 10 },
  questionText: { 
    textAlign: 'center', 
    fontSize: 18, 
    color: COLORS.textDark // Dunkler Text in weißer Sprechblase
  },
  optionsContainer: { width: '100%' },
  optionMargin: { marginBottom: 12 }
});
