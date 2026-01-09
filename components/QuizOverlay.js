import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText } from './UI';

export default function QuizOverlay({ video, onCorrect, onWrong }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  // Animation beim Start: Karte blendet sanft ein
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Sicherer Daten-Parser für die Antwort-Optionen
  const parsedOptions = useMemo(() => {
    if (!video?.options) return [];
    
    // Falls Supabase bereits ein Array liefert
    if (Array.isArray(video.options)) return video.options;
    
    // Falls es ein JSON-String aus dem Studio ist
    try {
      const parsed = JSON.parse(video.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Fehler beim Parsen der Quiz-Optionen:", e);
      return [];
    }
  }, [video.options]);

  const handleAnswer = (index) => {
    // Vergleiche gewählte Antwort mit dem korrekten Index aus der DB
    if (index === video.correct_index) {
      onCorrect(video.category);
    } else {
      // Kleiner Hinweis für das Kind, ohne den Lernfluss hart zu stoppen
      alert("Fast richtig! Schau nochmal genau hin. ✨");
      // Wir lassen das Quiz offen, damit das Kind es nochmal probieren kann
    }
  };

  // Dynamische Farbe basierend auf der aktuellen Welt (z.B. Astro = Blau, Wild = Grün)
  const worldColor = COLORS.worlds?.[video.category] || COLORS.primary;

  return (
    <Modal transparent animationType="none" visible={true}>
      <View style={styles.container}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          
          {/* Badge oben: Zeigt dem Kind, dass jetzt die "Belohnungs-Zeit" ist */}
          <View style={[styles.headerBadge, { backgroundColor: worldColor }]}>
            <LumiText style={{ color: COLORS.white, fontWeight: 'bold' }}>
              Quiz Zeit! 🌟
            </LumiText>
          </View>

          <LumiText type="h2" style={styles.question}>
            {video.question}
          </LumiText>

          {/* Die Antwort-Optionen */}
          <View style={styles.optionsContainer}>
            {parsedOptions.map((option, index) => (
              <LumiButton
                key={index}
                title={option}
                type="secondary"
                onPress={() => handleAnswer(index)}
                style={styles.optionButton}
              />
            ))}
          </View>

          {/* Falls das Kind gerade keine Lust hat, kann es überspringen */}
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
    backgroundColor: 'rgba(0,0,0,0.85)', // Etwas dunkler für mehr Fokus auf die Frage
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  card: {
    width: '100%',
    maxWidth: 400, // Begrenzung für Web-Ansicht (Vercel)
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerBadge: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 25,
  },
  question: {
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 28,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  skipButton: {
    marginTop: 25,
    backgroundColor: 'transparent',
    borderWidth: 0,
  }
});
