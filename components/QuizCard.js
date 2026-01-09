import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS } from '../constants/Theme';
import { LumiButton, LumiText, LumiSpeechBubble } from './UI';

const { height } = Dimensions.get('window');

export default function QuizCard({ video, onCorrect }) {
  const options = JSON.parse(video.options || "[]");

  return (
    <View style={styles.container}>
      <LottieView
        source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_myejioos.json' }} 
        autoPlay loop
        style={styles.avatar}
      />
      
      <LumiSpeechBubble borderColor={COLORS.primary}>
        <LumiText type="h2" style={{ textAlign: 'center' }}>
          {video.question}
        </LumiText>
      </LumiSpeechBubble>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <LumiButton
            key={index}
            title={option}
            type="secondary"
            onPress={() => index === video.correct_index ? onCorrect() : alert("Fast! ✨")}
            style={{ marginBottom: 12 }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    height: height, 
    backgroundColor: COLORS.background, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 25 
  },
  avatar: { width: 150, height: 150, marginBottom: 20 },
  optionsContainer: { width: '100%', marginTop: 20 }
});
