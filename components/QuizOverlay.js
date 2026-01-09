import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText, LumiSpeechBubble } from './UI';

export default function QuizOverlay({ video, onCorrect, onWrong }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Debug Log: Prüfen, ob das Quiz überhaupt gestartet wird
    console.log("QuizOverlay gerendert für Video:", video?.title);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [video]);

  const parsedOptions = useMemo(() => {
    if (!video?.options) return [];
    if (Array.isArray(video.options)) return video.options;
    try { 
      return JSON.parse(video.options); 
    } catch (e) { 
      console.error("Quiz Parse Error:", e);
      return []; 
    }
  }, [video.options]);

  const worldColor = COLORS.worlds?.[video.category] || COLORS.primary;

  return (
    <Modal 
      transparent 
      visible={true} 
      animationType="fade"
      // Sicherstellen, dass das Modal im Web-DOM ganz oben landet
      style={{ zIndex: 10000 }} 
    >
      <View style={styles.container}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          
          <View style={styles.avatarSection}>
            <LottieView
              source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_myejioos.json' }} 
              autoPlay 
              loop
              style={styles.lottieAvatar}
            />
            <LumiSpeechBubble borderColor={worldColor}>
              <LumiText type="h2" style={styles.centeredText}>
                {video?.question || "Was hast du gerade gelernt?"}
              </LumiText>
            </LumiSpeechBubble>
          </View>

          <View style={styles.optionsContainer}>
            {parsedOptions.map((option, index) => (
              <LumiButton
                key={index}
                title={option}
                type="secondary"
                onPress={() => index === video.correct_index ? onCorrect(video.category) : alert("Fast! ✨")}
                style={styles.optionMargin} 
              />
            ))}
          </View>

          <TouchableOpacity onPress={onWrong} style={styles.skipButton}>
            <LumiText style={styles.skipText}>Später weiterlernen</LumiText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    // Höchster zIndex für das Web-Overlay
    zIndex: 9999, 
  },
  card: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusCard,
    padding: SIZES.padding * 1.5,
    alignItems: 'center',
    // Schatten für Plastizität im Web/Android
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 10000,
  },
  avatarSection: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start', // Wichtig!
  marginBottom: 30,
  width: '100%',
  paddingHorizontal: 10,
},
lottieAvatar: { 
  width: 80, // Etwas kleiner für mehr Platz für den Text
  height: 80, 
},
centeredText: { 
  textAlign: 'center',
  flexShrink: 1, // Verhindert vertikales Ausbrechen
  width: '100%',
},
  optionsContainer: { 
    width: '100%' 
  },
  optionMargin: { 
    marginBottom: 10 
  },
  skipButton: { 
    marginTop: 20,
    padding: 10 
  },
  skipText: { 
    color: COLORS.textLight, 
    textDecorationLine: 'underline',
    fontSize: 14
  }
});
