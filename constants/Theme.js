// constants/Theme.js
export const COLORS = {
  primary: '#F47B4D',      // Warmes Korallen-Orange statt Lila
  secondary: '#5BB9E8',    // Sanftes Himmelblau
  accent: '#FFC633',       // Verspieltes Gelb
  background: '#FAF9F6',   // Soft Cream statt reinem Weiß
  surface: '#FFFFFF',
  text: '#333344',
  textLight: '#888899',
  bubble: '#F0F0F0',
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
    Astro: '#7E57C2',
    Wild: '#81C784',
    Terra: '#B97A57',
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
  radiusCard: 20
};
