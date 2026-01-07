import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Modal } from 'react-native';
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

  const handleAnswer = (index) => {
    if (index === video.correct_index) {
      onCorrect(video.category);
    } else {
      alert("Fast richtig! Probier es nochmal.");
      onWrong();
    }
  };

  // Dynamische Farbe basierend auf der Welt des Videos
  const worldColor = COLORS.worlds[video.category] || COLORS.primary;

  return (
    <Modal transparent animationType="none" visible={true}>
      <View style={styles.container}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={[styles.headerBadge, { backgroundColor: worldColor }]}>
            <LumiText style={{ color: COLORS.white, fontWeight: 'bold' }}>
              Quiz Zeit! 🌟
            </LumiText>
          </View>

          <LumiText type="h2" style={styles.question}>
            {video.question}
          </LumiText>

          {/* Die Antwort-Optionen als einheitliche Buttons */}
          <View style={styles.optionsContainer}>
  {(Array.isArray(video.options) 
    ? video.options 
    : typeof video.options === 'string' 
      ? JSON.parse(video.options) 
      : []
  ).map((option, index) => (
    <LumiButton
      key={index}
      title={option}
      type="secondary"
      onPress={() => handleAnswer(index)}
      style={styles.optionButton}
    />
  ))}
</View>

          <LumiButton 
            title="Später" 
            onPress={onWrong} 
            type="danger" 
            style={styles.skipButton}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)', // Dunkler Hintergrund für Fokus
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding,
    alignItems: 'center',
    overflow: 'hidden'
  },
  headerBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  question: {
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
  },
  optionsContainer: {
    width: '100%',
    gap: 10, // Funktioniert in modernem React Native für Abstände
  },
  optionButton: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  skipButton: {
    marginTop: 20,
    borderWidth: 0,
  }
});