import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { supabase } from '../services/supabase';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText } from '../components/UI';

export default function OnboardingScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');

  const handleStart = async () => {
    // Validierung: Name muss lang genug sein
    const cleanName = username.trim();
    if (cleanName.length < 3) {
      alert("Lumi möchte deinen Namen wissen! (Mindestens 3 Zeichen)");
      return;
    }

    setLoading(true);
    
    // Automatische E-Mail-Erstellung für den Test-Betrieb
    // Wir nutzen ein festes Passwort für die Beta-Phase
    const email = `${cleanName.toLowerCase().replace(/\s/g, '')}@lumi.app`;
    const password = 'lumi-password-2026';

    try {
      // 1. Versuch: Registrierung
      let authResult = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            username: cleanName, 
            is_curator: role === 'curator' 
          } 
        }
      });

      // Falls User bereits existiert (Invalid credentials Bugfix) -> Login
      // Wir prüfen auf verschiedene Fehlertypen, um den Login zu erzwingen
      if (authResult.error) {
        authResult = await supabase.auth.signInWithPassword({ email, password });
      }

      if (authResult.error) throw authResult.error;

      const user = authResult.data.user;

      // 2. Datenbank-Profil sicherstellen (Upsert)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        username: cleanName,
        is_curator: role === 'curator',
        total_lumis: 0
      });

      if (profileError) throw profileError;
      
      console.log("Lumi Abenteuer gestartet für:", cleanName);

    } catch (err) {
      alert("Hoppla! Lumi hat ein Problem: " + err.message);
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
          
          {/* Willkommens-Bereich */}
          <LumiText type="h1" style={styles.title}>Willkommen bei Lumi! ✨</LumiText>
          <LumiText style={styles.subtitle}>
            Entdecke die Welt in kleinen Häppchen. Wie heißt du?
          </LumiText>

          {/* Namens-Eingabe (Bubble Style) */}
          <TextInput
            style={styles.input}
            placeholder="Dein Vorname..."
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={COLORS.textLight}
            autoCorrect={false}
          />

          <LumiText type="h2" style={styles.sectionLabel}>Wer bist du heute?</LumiText>
          
          {/* Rollenauswahl (Kindgerechte Karten) */}
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              onPress={() => setRole('student')}
              activeOpacity={0.8}
              style={[styles.roleCard, role === 'student' && styles.roleActive]}
            >
              <LumiText style={[styles.roleEmoji, role === 'student' && styles.textWhite]}>🚀</LumiText>
              <LumiText style={[styles.roleLabel, role === 'student' && styles.textWhite]}>
                Entdecker
              </LumiText>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setRole('curator')}
              activeOpacity={0.8}
              style={[styles.roleCard, role === 'curator' && styles.roleActive]}
            >
              <LumiText style={[styles.roleEmoji, role === 'curator' && styles.textWhite]}>🎓</LumiText>
              <LumiText style={[styles.roleLabel, role === 'curator' && styles.textWhite]}>
                Kurator
              </LumiText>
            </TouchableOpacity>
          </View>

          {/* Main Action Button */}
          <LumiButton 
            title={loading ? "Lumi bereitet alles vor..." : "Abenteuer starten"} 
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
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: SIZES.padding * 1.5 
  },
  content: { 
    alignItems: 'center', 
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 40, // Große Card für das Onboarding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5
  },
  title: { 
    marginBottom: 10, 
    textAlign: 'center',
    fontSize: 28 
  },
  subtitle: { 
    textAlign: 'center', 
    marginBottom: 35, 
    color: COLORS.textLight,
    lineHeight: 22 
  },
  input: {
    width: '100%',
    backgroundColor: '#F7F9FC',
    padding: 18,
    borderRadius: 25, // Runder Input
    fontSize: 18,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    marginBottom: 25,
    color: COLORS.text,
    textAlign: 'center'
  },
  sectionLabel: { 
    alignSelf: 'center', 
    marginBottom: 20,
    fontSize: 20 
  },
  roleContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginBottom: 35 
  },
  roleCard: {
    flex: 0.47,
    paddingVertical: 20,
    borderRadius: 25,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0'
  },
  roleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  roleEmoji: {
    fontSize: 32,
    marginBottom: 5
  },
  roleLabel: {
    fontWeight: 'bold',
    fontSize: 14
  },
  textWhite: {
    color: COLORS.white
  },
  mainButton: { 
    width: '100%', 
    height: 65,
    borderRadius: 35 
  },
  footer: { 
    marginTop: 25, 
    fontStyle: 'italic', 
    color: '#CCC' 
  }
});
