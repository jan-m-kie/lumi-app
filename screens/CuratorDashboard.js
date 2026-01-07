import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { supabase } from '../services/supabase';
import { Picker } from '@react-native-picker/picker'; 
import { analyzeVideoContent } from '../services/aiAnalyzer';
import { LUMI_WORLDS } from '../constants/Worlds';

export default function CuratorDashboard({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [myVideos, setMyVideos] = useState([]);
  const [form, setForm] = useState({
    title: '',
    video_url: '',
    category: 'wild', // Kleinschreibung passend zu World-IDs
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

  // Diese Funktion MUSS innerhalb der Komponente stehen!
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
        Alert.alert("Lumi KI ✨", "Ich habe das Video analysiert und die Felder für dich ausgefüllt!");
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
      const { error } = await supabase.from('videos').insert([{
        ...form,
        curator_id: user.id,
        approved: true // Zum Testen direkt auf true
      }]);

      if (error) throw error;
      Alert.alert("Erfolgreich!", "Dein neuer Lern-Chunk ist online.");
      fetchMyVideos(); // Liste aktualisieren
      setForm({ title: '', video_url: '', category: 'wild', question: '', options: ['', '', ''], correct_index: 0 });
    } catch (error) {
      Alert.alert("Fehler", error.message);
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.header}>Lumi Creator Studio 🎨</Text>
      
      <TouchableOpacity 
        style={[styles.aiButton, loading && { opacity: 0.7 }]} 
        onPress={runAIAnalysis}
        disabled={loading}
      >
        <Text style={styles.buttonText}>🪄 Mit KI ausfüllen (Chunking-Hilfe)</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>Video Titel</Text>
        <TextInput 
          style={styles.input} 
          placeholder="z.B. Warum ist der Himmel blau?" 
          value={form.title}
          onChangeText={(t) => setForm({...form, title: t})}
        />

        <Text style={styles.label}>Video URL (MP4)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="https://..." 
          value={form.video_url}
          onChangeText={(t) => setForm({...form, video_url: t})}
        />

        <Text style={styles.label}>Lumi-Welt</Text>
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
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Quiz-Frage (Memorizing)</Text>
        <TextInput 
          style={[styles.input, { height: 60 }]} 
          multiline
          value={form.question}
          onChangeText={(t) => setForm({...form, question: t})}
        />

        {form.options.map((opt, i) => (
          <View key={i} style={styles.optionRow}>
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 5 }]} 
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
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Lern-Chunk veröffentlichen</Text>}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Deine aktiven Chunks ({myVideos.length})</Text>
      {myVideos.map((video) => (
        <View key={video.id} style={styles.videoStatusCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.videoTitleSmall}>{video.title}</Text>
            <Text style={styles.statusTag}>{video.approved ? '✅ Online' : '⏳ Prüfung'}</Text>
          </View>
          <Text style={styles.statsText}>📈 {video.views || 0} Kids</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginTop: 40, marginBottom: 20, color: '#6200EE' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 3 },
  label: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#F9F9F9', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  aiButton: { backgroundColor: '#00C853', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  pickerContainer: { backgroundColor: '#F9F9F9', borderRadius: 10, borderWidth: 1, borderColor: '#DDD', marginBottom: 15 },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#6200EE', marginLeft: 10, marginBottom: 15 },
  radioSelected: { backgroundColor: '#6200EE' },
  uploadButton: { backgroundColor: '#6200EE', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 30 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  videoStatusCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  videoTitleSmall: { fontWeight: 'bold', fontSize: 14 },
  statusTag: { fontSize: 12, color: '#666', marginTop: 4 },
  statsText: { fontSize: 12, fontWeight: 'bold', color: '#6200EE' }
});