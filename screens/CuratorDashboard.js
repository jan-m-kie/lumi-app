import React, { useState, useEffect } from 'react';
import { 
  View, TextInput, StyleSheet, ScrollView, Alert, 
  TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { supabase } from '../services/supabase';
import { COLORS, SIZES } from '../constants/Theme';
import { LumiButton, LumiText } from '../components/UI';
import { Picker } from '@react-native-picker/picker'; 
import { analyzeVideoContent } from '../services/aiAnalyzer';
import { LUMI_WORLDS } from '../constants/Worlds';

export default function CuratorDashboard() {
  const [loading, setLoading] = useState(false);
  const [myVideos, setMyVideos] = useState([]);
  
  // Wir nutzen ein flaches State-Objekt für einfachere Handhabung
  const [form, setForm] = useState({
    title: '',
    video_url: '',
    category: 'wild',
    question: '',
    options: ['', '', ''],
    correct_index: 0
  });

  useEffect(() => {
    fetchMyVideos();
  }, []);

  const fetchMyVideos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('curator_id', user.id)
        .order('created_at', { ascending: false });
      setMyVideos(data || []);
    }
  };

  const runAIAnalysis = async () => {
    if (!form.video_url) {
      Alert.alert("URL fehlt", "Gib zuerst eine Video-URL ein.");
      return;
    }
    setLoading(true);
    try {
      const aiResult = await analyzeVideoContent(form.video_url);
      if (aiResult) {
        setForm({
          ...form,
          title: aiResult.title || form.title,
          category: aiResult.category || form.category,
          question: aiResult.question || form.question,
          options: aiResult.options || form.options,
          correct_index: aiResult.correct_index ?? form.correct_index
        });
        Alert.alert("Lumi KI ✨", "Ich habe das Video analysiert!");
      }
    } catch (err) {
      Alert.alert("KI Fehler", "Lumi konnte das Video gerade nicht analysieren.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!form.title || !form.video_url || !form.question) {
      Alert.alert("Halt!", "Bitte fülle alle Felder aus.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // WICHTIG: Hier speichern wir die Optionen als JSON-String
      const { error } = await supabase.from('videos').insert([{
        ...form,
        options: JSON.stringify(form.options), 
        curator_id: user.id,
        approved: true 
      }]);

      if (error) throw error;
      Alert.alert("Erfolg!", "Dein Wissens-Chunk ist jetzt live! 🚀");
      fetchMyVideos();
      setForm({ title: '', video_url: '', category: 'wild', question: '', options: ['', '', ''], correct_index: 0 });
    } catch (err) {
      Alert.alert("Fehler", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (text, index) => {
    const newOptions = [...form.options];
    newOptions[index] = text;
    setForm({ ...form, options: newOptions });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SIZES.padding * 2 }}>
      <LumiText type="h1">Studio 🎓</LumiText>
      
      <LumiButton 
        title="🪄 Mit KI ausfüllen (Chunking-Hilfe)" 
        onPress={runAIAnalysis}
        style={{ backgroundColor: '#00C853', marginBottom: 20 }}
        loading={loading}
      />

      <View style={styles.card}>
        <LumiText type="h2">Video Infos</LumiText>
        <TextInput 
          style={styles.input} 
          placeholder="Titel des Videos" 
          value={form.title} 
          onChangeText={(t) => setForm({...form, title: t})} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Video URL (MP4)" 
          value={form.video_url} 
          onChangeText={(t) => setForm({...form, video_url: t})} 
        />
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.category}
            onValueChange={(v) => setForm({...form, category: v})}
          >
            {LUMI_WORLDS.map((world) => (
              <Picker.Item key={world.id} label={`${world.icon} ${world.label}`} value={world.id} />
            ))}
          </Picker>
        </View>

        <LumiText type="h2" style={{ marginTop: 20 }}>Das Quiz (Memorizing)</LumiText>
        <TextInput 
          style={[styles.input, { height: 60 }]} 
          multiline
          placeholder="Deine Frage zum Video?" 
          value={form.question} 
          onChangeText={(t) => setForm({...form, question: t})} 
        />
        
        {form.options.map((opt, i) => (
          <View key={i} style={styles.optionRow}>
            <TextInput 
              style={[styles.input, { flex: 1 }, form.correct_index === i && styles.correctInput]} 
              placeholder={`Antwort ${i + 1}`} 
              value={opt}
              onChangeText={(t) => updateOption(t, i)}
            />
            <TouchableOpacity 
              onPress={() => setForm({...form, correct_index: i})}
              style={[styles.radio, form.correct_index === i && styles.radioSelected]}
            />
          </View>
        ))}

        <LumiButton 
          title={loading ? "Wird gespeichert..." : "Chunk veröffentlichen"} 
          onPress={handleUpload}
          style={{ marginTop: 20 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 15, elevation: 3 },
  input: { 
    backgroundColor: COLORS.surface, 
    padding: 12, 
    borderRadius: SIZES.radius, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  pickerContainer: { marginTop: 10, borderWidth: 1, borderColor: '#EEE', borderRadius: SIZES.radius },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary, marginLeft: 10, marginTop: 10 },
  radioSelected: { backgroundColor: COLORS.primary },
  correctInput: { borderColor: COLORS.primary, borderWidth: 1 }
});
