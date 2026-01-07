// components/UI.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/Theme';

export const LumiButton = ({ title, onPress, type = 'primary', style }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[
      styles.button, 
      { backgroundColor: type === 'primary' ? COLORS.primary : COLORS.surface },
      type === 'danger' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.danger },
      style
    ]}
  >
    <Text style={[
      styles.buttonText, 
      { color: type === 'primary' ? COLORS.white : COLORS.primary },
      type === 'danger' && { color: COLORS.danger }
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export const LumiText = ({ children, type = 'body', style, ...props }) => {
  // Hier wählen wir den Style explizit aus, damit ESLint die Nutzung registriert
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

const styles = StyleSheet.create({
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: SIZES.radius, alignItems: 'center' },
  buttonText: { fontSize: SIZES.body, fontWeight: 'bold' },
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text },
  body: { fontSize: SIZES.body, color: COLORS.text },
  small: { fontSize: 12, color: COLORS.textLight }
});