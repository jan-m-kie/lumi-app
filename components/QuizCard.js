import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText, LumiSpeechBubble } from './UI';

const { height, width } = Dimensions.get('window');

// Zufällige Reaktionen für Lumi
const FEEDBACK_CORRECT = [
  "Super! Das ist richtig, Weiter so.",
  "Klasse! Du bist ein echter Profi!",
  "Genau richtig! Lumi ist stolz auf dich!",
  "Spitze! Du hast gut aufgepasst!",
  "Einfach toll! Du lernst ja wahnsinnig schnell."
];

const FEEDBACK_INCORRECT = [
  "Leider falsch, probiere es noch einmal.",
  "Knapp daneben! Versuch's noch mal!",
  "Ohoh! Das war nicht ganz richtig. Traust du dich nochmal?",
  "Nicht aufgeben! Probier eine andere Antwort.",
  "Fast geschafft! Lumi glaubt an dich, versuch es noch mal."
];

export default function QuizCard({ video, isActive, onCorrect }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const hasSpokenRef = useRef(false); // Trackt, ob die Frage für dieses Quiz schon vorgelesen wurde
  const useNativeDriver = Platform.OS !== 'web';

  const lumiVoiceOptions = {
    language: 'de-DE',
    pitch: 1.2,
    rate: 0.9,
  };

  const getRandomFeedback = (list) => list[Math.floor(Math.random() * list.length)];

  useEffect(() => {
    // 1. Schwebe-Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 2000, useNativeDriver }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // 2. SPRACH-LOGIK: Reagiert auf Sichtbarkeit
    if (isActive && video?.question) {
      if (!hasSpokenRef.current) {
        // Wir stoppen nur, wenn wir wirklich etwas Neues sagen wollen
        Speech.speak(video.question, lumiVoiceOptions);
        hasSpokenRef.current = true;
      }
    } else {
      // Wenn wir wegscrollen, stoppen wir und setzen den Merker zurück
      Speech.stop();
      hasSpokenRef.current = false;
    }

    return () => {
      if (!isActive) Speech.stop();
    };
  }, [isActive, video]);

  const handleAnswerPress = (index) => {
    Speech.stop();
    if (index === video.correct_index) {
      Speech.speak(getRandomFeedback(FEEDBACK_CORRECT), lumiVoiceOptions);
      onCorrect();
    } else {
      Speech.speak(getRandomFeedback(FEEDBACK_INCORRECT), lumiVoiceOptions);
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
    backgroundColor: COLORS.background, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  content: { width: '100%', maxWidth: 500, alignItems: 'center' },
  avatarSection: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 30 },
  avatarWrapper: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  lumiMascot: { width: 100, height: 100 },
  bubbleWrapper: { flex: 1, marginLeft: 10 },
  questionText: { textAlign: 'center', fontSize: 18, color: '#1E293B' }, // Dunkler Text in weißer Bubble
  optionsContainer: { width: '100%' },
  optionMargin: { marginBottom: 12 }
});
