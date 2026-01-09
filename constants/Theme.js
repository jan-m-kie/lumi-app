// constants/Theme.js
export const COLORS = {
  primary: '#6200EE',     // Das tiefe Lumi-Lila
  secondary: '#FFD700',   // Gold für Gems, Quiz & Highlights
  background: '#FFFFFF',
  surface: '#F9F9F9',     // Für Karten und Hintergründe
  text: '#333333',
  textLight: '#999999',
  bubble: '#F0F0F0',
  overlay: 'rgba(0,0,0,0.85)',
  white: '#FFFFFF',
  danger: '#FF4433',      // Für Logout/Löschen
  success: '#22B14C',
  overlay: 'rgba(0, 0, 0, 0.5)',
  glass: 'rgba(255, 255, 255, 0.2)',
  
  // Die Welt-Farben (aus deiner Worlds.js)
  worlds: {
    Astro: '#2E3192',
    Wild: '#22B14C',
    Terra: '#B97A57'
  }
};

export const ICONS = {
  mute: 'volume-mute',
  unmute: 'volume-high',
  // Hier könnten wir später auf Ionicons/MaterialIcons Namen verweisen
};

export const SIZES = {
  font: 14,
  h1: 24,
  h2: 18,
  body: 14,
  radius: 15, // Einheitliche Abrundung für alle Buttons/Karten
  padding: 20,
  radiusBubble: 30, // Der extrem runde Look
  radiusCard: 40
};
