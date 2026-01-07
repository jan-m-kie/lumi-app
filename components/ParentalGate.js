import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Platform 
} from 'react-native';

export default function ParentalGate({ route, navigation }) {
  const { targetScreen, params } = route.params;
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const [input, setInput] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      // Fix für den RCTAnimation Fehler: Im Web auf false, sonst true
      useNativeDriver: Platform.OS !== 'web', 
    }).start();
  }, [fadeAnim]);

  const handleSubmit = () => {
  const result = num1 + num2;
  
  if (parseInt(input) === result) {
    // FALL 1: Navigation zum Studio (Tab-Wechsel)
    if (targetScreen === 'MainTabs') {
      navigation.navigate('MainTabs', { screen: 'Studio' });
    } 
    // FALL 2: Navigation zu einem Stack-Screen (z.B. CuratorProfile) mit Parametern
    else {
      // Wir navigieren zum Ziel-Screen und geben die params (z.B. curatorId) mit
      navigation.replace(targetScreen, params);
    }
  } else {
    alert("Hoppla, das stimmt nicht ganz. Frag kurz deine Eltern!");
    setInput('');
  }
};

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.modal}>
        <Text style={styles.title}>Nur für Erwachsene 🔐</Text>
        <Text style={styles.sub}>Bitte löse die Aufgabe, um fortzufahren:</Text>
        
        <View style={styles.mathRow}>
          <Text style={styles.mathText}>{num1} + {num2} = </Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={input}
            onChangeText={setInput}
            autoFocus={true}
            onSubmitEditing={handleSubmit} // Ermöglicht Absenden via Enter/Return
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Bestätigen</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Abbrechen</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(98, 0, 238, 0.9)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modal: { 
    width: '85%', 
    backgroundColor: 'white', 
    borderRadius: 25, 
    padding: 30, 
    alignItems: 'center',
    elevation: 20
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  sub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  mathRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  mathText: { fontSize: 32, fontWeight: 'bold' },
  input: { 
    width: 80, 
    borderBottomWidth: 3, 
    borderBottomColor: '#6200EE', 
    fontSize: 32, 
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6200EE'
  },
  button: { 
    backgroundColor: '#6200EE', 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 15, 
    marginBottom: 15 
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  cancelText: { color: '#888', fontWeight: '500' }
});