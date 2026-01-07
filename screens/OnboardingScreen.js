import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { LUMI_WORLDS } from '../constants/Worlds'; // Importieren
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabase';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText } from '../components/UI';

export default function OnboardingScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');

const handleStart = async () => {
  if (username.length < 3) {
    alert("Lumi möchte deinen Namen wissen!");
    return;
  }

  setLoading(true);
  const email = `${username.toLowerCase().replace(/\s/g, '')}@lumi.app`;
  const password = 'lumi-password-2026';

  try {
    // 1. Registrierung oder Login einleiten
    let authResult = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, is_curator: role === 'curator' } }
    });

    // Falls User schon da ist -> Login
    if (authResult.error && authResult.error.message.includes('already registered')) {
      authResult = await supabase.auth.signInWithPassword({ email, password });
    }

    if (authResult.error) throw authResult.error;

    const user = authResult.data.user;

    // 2. WICHTIG: Erst den Datenbank-Eintrag ERZWINGEN
    // Wir warten mit 'await', bis die Datenbank "OK" sagt
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      username: username,
      is_curator: role === 'curator',
      total_lumis: 0
    });

    if (profileError) throw profileError;

    // 3. Erst wenn wir hier ankommen, hat die DB den Kurator-Status gespeichert!
    // Da App.js auf session reagiert, wird jetzt MainTabs geladen.
    // Der TabNavigator findet nun garantiert den korrekten Eintrag.
    
    console.log("Profil erfolgreich gespeichert. Starte Lumi...");

  } catch (err) {
    alert("Fehler: " + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <LumiText type="h1" style={styles.title}>Willkommen bei Lumi! ✨</LumiText>
          <LumiText style={styles.subtitle}>
            Entdecke die Welt in kleinen Häppchen. Wie heißt du?
          </LumiText>

          <TextInput
            style={styles.input}
            placeholder="Dein Name..."
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={COLORS.textLight}
          />

          <LumiText type="h2" style={styles.sectionLabel}>Wer bist du?</LumiText>
          
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              onPress={() => setRole('student')}
              style={[styles.roleCard, role === 'student' && styles.roleActive]}
            >
              <LumiText style={role === 'student' && {color: COLORS.white, fontWeight: 'bold'}}>
                🚀 Entdecker
              </LumiText>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setRole('curator')}
              style={[styles.roleCard, role === 'curator' && styles.roleActive]}
            >
              <LumiText style={role === 'curator' && {color: COLORS.white, fontWeight: 'bold'}}>
                🎓 Kurator
              </LumiText>
            </TouchableOpacity>
          </View>

          <LumiButton 
            title={loading ? "Lumi lädt..." : "Abenteuer starten"} 
            onPress={handleStart}
            style={styles.mainButton}
          />
          
          <LumiText type="small" style={styles.footer}>
            "Feed your curiosity" – Dein Weg zum Wissen.
          </LumiText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: SIZES.padding * 2 },
  content: { alignItems: 'center', width: '100%' },
  title: { marginBottom: 10, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 40, color: COLORS.textLight },
  input: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: SIZES.radius,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 30,
    color: COLORS.text
  },
  sectionLabel: { alignSelf: 'flex-start', marginBottom: 15 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
  roleCard: {
    flex: 0.48,
    padding: 20,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  roleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mainButton: { width: '100%', paddingVertical: 18 },
  footer: { marginTop: 30, fontStyle: 'italic' }
});