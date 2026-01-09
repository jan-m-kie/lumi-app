import React, { useState, useRef, useEffect } from 'react'; // useEffect hinzugefügt
import { 
  View, 
  TextInput, 
  StyleSheet,
  Image,
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity,
  Animated // Wichtig für die Animation
} from 'react-native';
import { supabase } from '../services/supabase';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText } from '../components/UI';

export default function OnboardingScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');

  // ANIMATION: Schwebe-Effekt initialisieren
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15, 
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleStart = async () => {
    const cleanName = username.trim();
    if (cleanName.length < 3) {
      alert("Lumi möchte deinen Namen wissen! (Mindestens 3 Zeichen)");
      return;
    }

    setLoading(true);
    const email = `${cleanName.toLowerCase().replace(/\s/g, '')}@lumi.app`;
    const password = 'lumi-password-2026';

    try {
      let authResult = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: cleanName, is_curator: role === 'curator' } }
      });

      if (authResult.error) {
        authResult = await supabase.auth.signInWithPassword({ email, password });
      }

      if (authResult.error) throw authResult.error;

      const user = authResult.data.user;

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        username: cleanName,
        is_curator: role === 'curator',
        total_lumis: 0
      });

      if (profileError) throw profileError;
      
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
          
          {/* ANIMIERTER AVATAR WRAPPER */}
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <Image 
              source={require('../assets/Gemini_Generated_Image_q46murq46murq46m.png')} 
              style={styles.onboardingAvatar}
              resizeMode="contain"
            />
          </Animated.View>
              
          <LumiText type="h1" style={styles.title}>Willkommen bei Lumi! ✨</LumiText>
          <LumiText style={styles.subtitle}>
            Entdecke die Welt in kleinen Häppchen. Wie heißt du?
          </LumiText>

          <TextInput
            style={styles.input}
            placeholder="Dein Vorname..."
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: SIZES.padding * 1.5 },
  content: { alignItems: 'center', width: '100%' },
  title: { marginBottom: 10, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 35, color: COLORS.textLight },
  onboardingAvatar: {
    width: 220, // Etwas größer gemacht für mehr Fokus
    height: 220,
    marginBottom: 10, // Weniger Margin, da translateY Platz braucht
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: SIZES.radius,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 25,
    color: COLORS.text,
    textAlign: 'center'
  },
  sectionLabel: { alignSelf: 'center', marginBottom: 15 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
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
});
