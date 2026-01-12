import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image, Platform, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons'; // Für den Play-Button
import { COLORS } from '../constants/Theme';
import { LumiButton, LumiText, LumiSpeechBubble } from './UI';

const { height, width } = Dimensions.get('window');

export default function QuizCard({ video, isActive, setIsMuted, onCorrect }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== 'web';

  const lumiVoiceOptions = {
    language: 'de-DE',
    pitch: 1.2,
    rate: 0.9,
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 2000, useNativeDriver }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver }),
      ])
    ).start();

    // Automatisches Vorlesen beim Scrollen entfernt
    return () => Speech.stop();
  }, [floatAnim]);

  // Funktion zum Vorlesen der Frage per Knopfdruck
  const handlePlayQuestion = () => {
    Speech.stop();
    setIsMuted(false); // Ton automatisch anstellen
    Speech.speak(video.question, lumiVoiceOptions);
  };

  const handleAnswerPress = (index) => {
    Speech.stop();
    if (index === video.correct_index) {
      Speech.speak("Super! Das ist richtig!", lumiVoiceOptions);
      onCorrect();
    } else {
      Speech.speak("Probiere es noch einmal.", lumiVoiceOptions);
    }
  };

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
              <View style={styles.bubbleContent}>
                <LumiText type="h2" style={styles.questionText}>
                  {video?.question}
                </LumiText>
                
                {/* Play Button in der Sprechblase */}
                <TouchableOpacity onPress={handlePlayQuestion} style={styles.playButton}>
                  <Ionicons name="play-circle" size={32} color={worldColor} />
                </TouchableOpacity>
              </View>
            </LumiSpeechBubble>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {/* ... Antworten ... */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... bestehende Styles ...
  bubbleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 5,
  },
  questionText: { 
    flex: 1,
    textAlign: 'left', // Linksbündig für Platz für den Button
    fontSize: 18, 
    color: '#1E293B' 
  },
  playButton: {
    marginLeft: 10,
    padding: 5,
  }
});
