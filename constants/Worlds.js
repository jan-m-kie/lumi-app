// constants/Worlds.js
export const LUMI_WORLDS = [
  { id: 'wild', label: 'Wild (Natur)', color: '#4CAF50', icon: '🌿', gem: '🌿' },
  { id: 'astro', label: 'Astro (All)', color: '#6200EE', icon: '🚀', gem: '⭐' },
  { id: 'word', label: 'Word (Sprache)', color: '#FF9800', icon: '📚', gem: '🪶' },
  { id: 'math', label: 'Math (Zahlen)', color: '#E91E63', icon: '🔢', gem: '💎' },
  { id: 'body', label: 'Body (Körper)', color: '#2196F3', icon: '💪', gem: '❤️' },
];

// Hilfsfunktion, um schnell das Gem-Icon für eine ID zu bekommen
export const getGemIcon = (worldId) => {
  const world = LUMI_WORLDS.find(w => w.id === worldId.toLowerCase());
  return world ? world.gem : '✨';
};