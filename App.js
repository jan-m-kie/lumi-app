import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './services/supabase';
import TabNavigator from './navigation/TabNavigator';

// Screens importieren
import ParentalGate from './components/ParentalGate';
import OnboardingScreen from './screens/OnboardingScreen';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null); // Wir tracken die Session direkt
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Session beim Start prüfen
    const checkUser = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
    };

    checkUser();

    // 2. Listener für Auth-Änderungen (Login/Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession); // Wenn signOut gerufen wird, wird session null -> UI springt um
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6200EE' }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: 'white', marginTop: 15, fontSize: 18, fontWeight: 'bold' }}>Lumi erwacht...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          // --- BEREICH FÜR EINGELOGGTE USER ---
          <>
            <Stack.Screen 
  name="MainTabs" 
  component={TabNavigator} 
  key={session.user.id} // Zwingt den Navigator zum Neu-Initialisieren
/>
            <Stack.Screen name="ParentalGate" component={ParentalGate} />
          </>
        ) : (
          // --- BEREICH FÜR GÄSTE / NACH LOGOUT ---
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}