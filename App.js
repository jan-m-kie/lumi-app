import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native'; // Platform hinzugefügt
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './services/supabase';
import TabNavigator from './navigation/TabNavigator';

// Screens importieren
import ParentalGate from './components/ParentalGate';
import OnboardingScreen from './screens/OnboardingScreen';

// Sicherer Import für SpeedInsights (nur im Web)
let SpeedInsights;
if (Platform.OS === 'web') {
  try {
    SpeedInsights = require("@vercel/speed-insights/react").SpeedInsights;
  } catch (e) {
    console.warn("Vercel Speed Insights konnten nicht geladen werden.");
  }
}

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
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
    <View style={{ flex: 1 }}> {/* Root View für SpeedInsights */}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <>
              <Stack.Screen 
                name="MainTabs" 
                component={TabNavigator} 
                key={session.user.id} 
              />
              <Stack.Screen name="ParentalGate" component={ParentalGate} />
            </>
          ) : (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Vercel Speed Insights nur im Web am Ende einfügen */}
      {Platform.OS === 'web' && SpeedInsights && <SpeedInsights />}
    </View>
  );
}
