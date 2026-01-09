import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText, LumiSpeechBubble } from './UI';

const { height, width } = Dimensions.get('window');

export default function QuizCard({ video, onCorrect }) {
  // Sicherstellen, dass Optionen ein Array sind
  const parsedOptions = React.useMemo(() => {
    if (!video?.options) return [];
    if (Array.isArray(video.options)) return video.options;
    try { 
      return JSON.parse(video.options); 
    } catch (e) { 
      return []; 
    }
  }, [video.options]);

  const worldColor = COLORS.worlds?.[video.category?.toLowerCase()] || COLORS.primary;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {/* Lumi Maskottchen & Frage */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <LottieView
              source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_myejioos.json' }} 
              autoPlay loop
              style={styles.lottieAvatar}
            />
          </View>
          
          <View style={styles.bubbleWrapper}>
            <LumiSpeechBubble borderColor={worldColor}>
              <LumiText type="h2" style={styles.questionText}>
                {video?.question || "Was hast du gerade gelernt?"}
              </LumiText>
            </LumiSpeechBubble>
          </View>
        </View>

        {/* Antwortmöglichkeiten */}
        <View style={styles.optionsContainer}>
          {parsedOptions.map((option, index) => (
            <LumiButton
              key={index}
              title={option}
              type="secondary"
              onPress={() => {
                if (index === video.correct_index) {
                  onCorrect();
                } else {
                  alert("Fast! ✨ Versuch es nochmal!");
                }
              }}
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
    height: height,
    width: width,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 80,
    alignItems: 'center',
  },
  lottieAvatar: { 
    width: 80, 
    height: 80 
  },
  bubbleWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  questionText: { 
    textAlign: 'center',
    fontSize: 18,
  },
  optionsContainer: {
    width: '100%',
  },
  optionMargin: {
    marginBottom: 12,
  }
});
