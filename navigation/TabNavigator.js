import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { ActivityIndicator, View } from 'react-native';

// Screens importieren
import FeedScreen from '../screens/FeedScreen';
import LumiBox from '../screens/LumiBox';
import CuratorDashboard from '../screens/CuratorDashboard';
import CuratorProfile from '../screens/CuratorProfile';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [isCurator, setIsCurator] = useState(null); // Auf null setzen für Ladezustand
  const [userId, setUserId] = useState(null);

  useEffect(() => {
  let isMounted = true;

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    // Retry-Logik: Wir versuchen es 3 Mal im Abstand von 1 Sekunde
    for (let i = 0; i < 3; i++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_curator')
        .eq('id', user.id)
        .single();

      // Wenn wir ein Ergebnis haben UND is_curator true ist, brechen wir die Schleife ab
      if (data && data.is_curator === true) {
        if (isMounted) setIsCurator(true);
        console.log(`Rolle gefunden im Versuch ${i + 1}: Kurator`);
        return; 
      }

      console.log(`Versuch ${i + 1}: Rolle noch nicht als Kurator erkannt, warte...`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 Sek warten
    }

    // Wenn nach 3 Versuchen immer noch nichts da ist, setzen wir den finalen Status
    if (isMounted) setIsCurator(false);
  };

  checkRole();
  return () => { isMounted = false; };
}, []);

  // Warten, bis die Rolle bekannt ist, um falsche Tabs zu vermeiden
  if (isCurator === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 70, paddingBottom: 12, paddingTop: 8 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Entdecken') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'LumiBox') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Studio') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Mein Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Gemeinsamer Screen für Entdecker und Kuratoren */}
      <Tab.Screen 
        name="Entdecken" 
        component={FeedScreen} 
        options={{ tabBarLabel: 'Entdecken' }}
      />

      {/* Rollenspezifische Logik */}
      {isCurator ? (
        <>
          <Tab.Screen 
            name="Studio" 
            component={CuratorDashboard} 
            options={{ tabBarLabel: 'Studio' }}
          />
          <Tab.Screen 
            name="Mein Profil" 
            component={CuratorProfile} 
            initialParams={{ curatorId: userId }} 
            options={{ tabBarLabel: 'Profil' }}
          />
        </>
      ) : (
        <Tab.Screen 
          name="LumiBox" 
          component={LumiBox} 
          options={{ tabBarLabel: 'Meine Lumi-Box' }}
        />
      )}
    </Tab.Navigator>
  );
}
