import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText, LumiSpeechBubble } from './UI'; // UI-Komponenten nutzen

export default function QuizOverlay({ video, onCorrect, onWrong }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const parsedOptions = useMemo(() => {
    if (!video?.options) return [];
    if (Array.isArray(video.options)) return video.options;
    try { return JSON.parse(video.options); } catch (e) { return []; }
  }, [video.options]);

  const worldColor = COLORS.worlds?.[video.category] || COLORS.primary;

  return (
    <Modal transparent visible={true}>
      <View style={styles.container}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          
          <View style={styles.avatarSection}>
            <LottieView
              source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_myejioos.json' }} 
              autoPlay loop
              style={styles.lottieAvatar}
            />
            {/* Hier nutzen wir die neue zentrale Sprechblase */}
            <LumiSpeechBubble borderColor={worldColor}>
              <LumiText type="h2" style={styles.centeredText}>
                {video.question}
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
                // Der Style für Radius etc. sollte in der LumiButton Komponente selbst liegen!
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
  },
  card: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusCard,
    padding: SIZES.padding * 1.5,
    alignItems: 'center',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  lottieAvatar: { width: 100, height: 100 },
  centeredText: { textAlign: 'center' },
  optionsContainer: { width: '100%' },
  optionMargin: { marginBottom: 10 },
  skipButton: { marginTop: 20 },
  skipText: { color: COLORS.textLight, textDecorationLine: 'underline' }
});
