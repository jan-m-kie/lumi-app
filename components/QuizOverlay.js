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
    <Modal transparent visible={true} animationType="fade">
      <View style={styles.container}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          
          <View style={styles.avatarSection}>
            <LottieView
              source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_myejioos.json' }} 
              autoPlay loop
              style={styles.lottieAvatar}
            />
            
            {/* FIX: Dieser View zwingt die Sprechblase in die Breite */}
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
    zIndex: 9999, 
  },
  card: {
    width: '95%', // Etwas schmaler für besseres Layout
    maxWidth: 500,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusCard,
    padding: 20,
    alignItems: 'center',
    elevation: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 25,
  },
  lottieAvatar: { 
    width: 80, 
    height: 80 
  },
  bubbleWrapper: {
    flex: 1, // <--- Das hier ist der magische Fix für die Breite
    marginLeft: 10,
  },
  questionText: { 
    textAlign: 'center',
    fontSize: 16,
  },
  optionsContainer: { 
    width: '100%' 
  },
  optionMargin: { 
    marginBottom: 10 
  },
  skipButton: { 
    marginTop: 15,
    padding: 10 
  },
  skipText: { 
    color: COLORS.textLight, 
    textDecorationLine: 'underline',
    fontSize: 14
  }
});
