// constants/Theme.js
export const COLORS = {
  primary: '#F47B4D',      // Warmes Korallen-Orange statt Lila
  secondary: '#5BB9E8',    // Sanftes Himmelblau
  accent: '#FFC633',       // Verspieltes Gelb
  background: '#E2E8F0',   // Ein sanftes, dunkleres Blaugrau für Kinderaugen
  surface: '#FFFFFF',
  text: '#F8FAFC',
  textLight: '#64748B',
  textDark: '#1E293B',    // Dunkler Text für helle Karten/Bubbles
  bubble: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.85)',
  white: '#FFFFFF',
  
  // Funktionale Farben
  danger: '#FF5544',
  success: '#00C853',
  glass: 'rgba(255, 255, 255, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Belohnungen
  gems: '#A14DF4',         // Lila für Edelsteine
  lumis: '#FFD100',        // Sattes Gold
  
  // Die Welt-Farben (aus deiner Worlds.js)
  worlds: {
    astro: '#7E57C2',
    wild: '#81C784',
    word: '#FFB74D',
    math: '#4DB6AC',
    body: '#F06292'
  }
};

export const ICONS = {
  mute: 'volume-mute',
  unmute: 'volume-high',
  // Hier könnten wir später auf Ionicons/MaterialIcons Namen verweisen
};

export const SIZES = {
  font: 14,
  h1: 26,
  h2: 20,
  body: 16,
  radius: 16, // Einheitliche Abrundung für alle Buttons/Karten
  padding: 20,
  radiusBubble: 30, // Der extrem runde Look
  radiusCard: 40
};
