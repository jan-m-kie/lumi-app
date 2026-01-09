import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native'; // Lottie für Animationen
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText } from './UI';

export default function QuizOverlay({ video, onCorrect, onWrong }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const parsedOptions = useMemo(() => {
    if (!video?.options) return [];
    if (Array.isArray(video.options)) return video.options;
    try {
      const parsed = JSON.parse(video.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [video.options]);

  const handleAnswer = (index) => {
    if (index === video.correct_index) {
      onCorrect(video.category);
    } else {
      alert("Fast richtig! Schau nochmal genau hin. ✨");
    }
  };

  const worldColor = COLORS.worlds?.[video.category] || COLORS.primary;

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.container}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          
          {/* Avatar & Sprechblasen Bereich */}
          <View style={styles.avatarSection}>
            <LottieView
              // Ein freundlicher Stern/Roboter als Platzhalter
              source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_myejioos.json' }} 
              autoPlay
              loop
              style={styles.lottieAvatar}
            />
            <View style={[styles.speechBubble, { borderColor: worldColor }]}>
              <LumiText type="h2" style={styles.questionText}>
                {video.question}
              </LumiText>
              {/* Kleiner Pfeil der Sprechblase */}
              <View style={[styles.bubbleArrow, { borderRightColor: worldColor }]} />
            </View>
          </View>

          {/* Antwort-Optionen als "Bubble-Buttons" */}
          <View style={styles.optionsContainer}>
            {parsedOptions.map((option, index) => (
              <LumiButton
                key={index}
                title={option}
                type="secondary"
                onPress={() => handleAnswer(index)}
                style={[styles.optionButton, { borderRadius: 30 }]} // Extra rund
              />
            ))}
          </View>

          <TouchableOpacity onPress={onWrong} style={styles.skipContainer}>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: COLORS.background,
    borderRadius: 40, // Extrem weiche Kanten für Kinder
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  lottieAvatar: {
    width: 100,
    height: 100,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 15,
    borderWidth: 3,
    marginLeft: 10,
    position: 'relative',
    // Leichter Schatten für die Blase
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bubbleArrow: {
    position: 'absolute',
    left: -18,
    top: 35,
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderTopColor: 'transparent',
    borderBottomWidth: 12,
    borderBottomColor: 'transparent',
    borderRightWidth: 18,
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    color: '#333',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    width: '100%',
    height: 60, // Höhere Buttons für Kinderfinger
    marginBottom: 10,
  },
  skipContainer: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});
