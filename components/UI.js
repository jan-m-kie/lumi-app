import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SIZES } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

// 1. LumiIconButton: Für Mute, Schließen oder kleine Aktionen
export const LumiIconButton = ({ iconName, onPress, style }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.iconButton, style]}
    activeOpacity={0.7}
  >
    <Ionicons name={iconName} size={24} color={COLORS.white} />
  </TouchableOpacity>
);

// 2. LumiButton: Jetzt im "Bubble-Look" mit mehr Radius und Schatten
export const LumiButton = ({ title, onPress, type = 'primary', style }) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={0.8}
    style={[
      styles.button, 
      type === 'primary' && { backgroundColor: COLORS.primary },
      type === 'secondary' && { backgroundColor: COLORS.white, borderWidth: 2, borderColor: '#EEE' },
      type === 'danger' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.danger },
      style
    ]}
  >
    <Text style={[
      styles.buttonText, 
      type === 'primary' && { color: COLORS.white },
      type === 'secondary' && { color: COLORS.primary },
      type === 'danger' && { color: COLORS.danger }
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// 3. LumiText: Zentralisierte Schriftstile
export const LumiText = ({ children, type = 'body', style, ...props }) => {
  let selectedStyle;
  switch (type) {
    case 'h1': selectedStyle = styles.h1; break;
    case 'h2': selectedStyle = styles.h2; break;
    case 'small': selectedStyle = styles.small; break;
    default: selectedStyle = styles.body;
  }

  return (
    <Text style={[selectedStyle, style]} {...props}>
      {children}
    </Text>
  );
};

// 4. LumiSpeechBubble: Die neue kindgerechte Sprechblase
export const LumiSpeechBubble = ({ children, borderColor = COLORS.primary, style }) => (
  <View style={[styles.speechBubble, { borderColor }, style]}>
    {children}
    {/* Der kleine Pfeil, der zum Avatar zeigt */}
    <View style={[styles.bubbleArrow, { borderRightColor: borderColor }]} />
  </View>
);

const styles = StyleSheet.create({
  // BUTTONS
  button: { 
    paddingVertical: 14,
    paddingHorizontal: 24, 
    borderRadius: 30, 
    alignItems: 'center',
    justifyContent: 'center',
    // Lovable Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { 
    fontSize: SIZES.body, 
    fontWeight: 'bold',
    letterSpacing: 0.5 
  },
  
  // TYPOGRAFIE
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text },
  body: { fontSize: SIZES.body, color: COLORS.text },
  small: { fontSize: 12, color: COLORS.textLight },

  // ICON BUTTONS (z.B. Mute)
  iconButton: {
    backgroundColor: COLORS.overlay,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass,
  },

  // SPRECHBLASE
  speechBubble: {
  flex: 1, // Behalten, aber wir müssen im QuizOverlay den Wrapper korrigieren
  backgroundColor: COLORS.white,
  borderRadius: 25,
  padding: 15,
  borderWidth: 3,
  marginLeft: 15,
  position: 'relative',
  minHeight: 80, // Verhindert das Zusammenquetschen
  justifyContent: 'center',
},
  bubbleArrow: {
    position: 'absolute',
    left: -18,
    top: '40%', // Zentriert den Pfeil vertikal zur Blase
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderTopColor: 'transparent',
    borderBottomWidth: 12,
    borderBottomColor: 'transparent',
    borderRightWidth: 18,
  }
});
