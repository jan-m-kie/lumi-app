import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image, Platform, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Theme';
import { LumiButton, LumiText, LumiSpeechBubble } from './UI';

const { height, width } = Dimensions.get('window');

const FEEDBACK_CORRECT = ["Super! Das ist richtig!", "Klasse gemacht!", "Genau! Weiter so!", "Spitze!"];
const FEEDBACK_INCORRECT = ["Probiere es noch einmal.", "Fast! Versuch es nochmal.", "Knapp daneben!", "Lumi glaubt an dich, versuch's nochmal!"];

export default function QuizCard({ video, isActive, setIsMuted, onCorrect }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== 'web';

  const lumiVoiceOptions = { language: 'de-DE', pitch: 1.2, rate: 0.9 };
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 2000, useNativeDriver }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver }),
      ])
    ).start();
    return () => Speech.stop();
  }, [floatAnim]);

  const handlePlayQuestion = () => {
    Speech.stop();
    setIsMuted(false); 
    Speech.speak(video?.question || "", lumiVoiceOptions);
  };

  const handleAnswerPress = (index) => {
    Speech.stop();
    if (index === video.correct_index) {
      Speech.speak(getRandom(FEEDBACK_CORRECT), lumiVoiceOptions);
      onCorrect();
    } else {
      Speech.speak(getRandom(FEEDBACK_INCORRECT), lumiVoiceOptions);
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
            <Image source={require('../assets/Gemini_Generated_Image_q46murq46murq46m.png')} style={styles.lumiMascot} resizeMode="contain" />
          </Animated.View>
          
          <View style={styles.bubbleWrapper}>
            <LumiSpeechBubble borderColor={worldColor}>
              <View style={styles.bubbleContent}>
                <LumiText type="h2" style={styles.questionText}>{video?.question}</LumiText>
                <TouchableOpacity onPress={handlePlayQuestion} style={styles.playButton}>
                  <Ionicons name="play-circle" size={36} color={worldColor} />
                </TouchableOpacity>
              </View>
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
  container: { height, width, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { width: '100%', maxWidth: 500, alignItems: 'center' },
  avatarSection: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 30 },
  avatarWrapper: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  lumiMascot: { width: 100, height: 100 },
  bubbleWrapper: { flex: 1, marginLeft: 10 },
  bubbleContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionText: { flex: 1, textAlign: 'left', fontSize: 18, color: '#1E293B' },
  playButton: { marginLeft: 10, padding: 5 },
  optionsContainer: { width: '100%' },
  optionMargin: { marginBottom: 12 }
});
