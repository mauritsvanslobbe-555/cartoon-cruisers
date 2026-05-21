export const COLORS = {
  mint: '#7DD3C0',
  mintDark: '#5DBFA9',
  blue: '#4A9EFF',
  blueDark: '#3082E8',
  yellow: '#FFD93D',
  ink: '#1F2540',
  inkSoft: '#5A6485',
  cream: '#FFF9EE',
  paper: '#F4FBFA',
} as const;

export type SceneId = 'city' | 'beach' | 'mountain' | 'school' | 'playground';

export interface Scene {
  id: SceneId;
  name: string;
  sub: string;
  emoji: string;
  gradient: string;
  accents: string[];
  weather: string;
  prompt: string;
}

export const SCENES: Scene[] = [
  {
    id: 'city',
    name: 'Door de stad',
    sub: 'Vespa langs de grachten',
    emoji: '🏛️',
    gradient: 'linear-gradient(160deg, #FFD7A8 0%, #FFA1B7 55%, #A78BFA 100%)',
    accents: ['🌉', '🚦', '🛵'],
    weather: 'Zonnig · 22°',
    prompt: 'a charming European city street with canals, colorful buildings, cobblestone roads, and warm golden sunset lighting',
  },
  {
    id: 'beach',
    name: 'Langs het strand',
    sub: 'Brommer over de boulevard',
    emoji: '🏖️',
    gradient: 'linear-gradient(160deg, #B6E8FF 0%, #FFD993 60%, #FF9C7A 100%)',
    accents: ['🌴', '🏐', '🛵'],
    weather: 'Strandweer · 27°',
    prompt: 'a tropical beach boulevard with palm trees, ocean waves, golden sand, and bright blue sky with fluffy clouds',
  },
  {
    id: 'mountain',
    name: 'In de bergen',
    sub: 'Scooter op de bergpas',
    emoji: '🏔️',
    gradient: 'linear-gradient(160deg, #C7E4FF 0%, #9BD3B6 55%, #FFE48A 100%)',
    accents: ['⛰️', '🌲', '🛵'],
    weather: 'Fris · 14°',
    prompt: 'a scenic mountain pass with snow-capped peaks, green pine forests, winding road, and crisp blue sky',
  },
  {
    id: 'school',
    name: 'In school',
    sub: 'Rondscheuren door de gang',
    emoji: '🏫',
    gradient: 'linear-gradient(160deg, #FFE0B2 0%, #FFAB91 55%, #CE93D8 100%)',
    accents: ['📚', '✏️', '🛵'],
    weather: 'Lesdag · 20°',
    prompt: 'a fun colorful school hallway with lockers, backpacks, posters on the walls, and bright fluorescent lighting',
  },
  {
    id: 'playground',
    name: 'Op het schoolplein',
    sub: 'Stunten bij de schommel',
    emoji: '🎪',
    gradient: 'linear-gradient(160deg, #C8E6C9 0%, #FFF59D 55%, #81D4FA 100%)',
    accents: ['🎠', '⚽', '🛵'],
    weather: 'Pauze! · 18°',
    prompt: 'a lively school playground with swings, a climbing frame, children playing, colorful markings on the ground, and trees around the edges',
  },
];

export interface Horn {
  id: string;
  name: string;
  sub: string;
  emoji: string;
  color: string;
  price: string;
  pattern: [number, number][];
}

export const HORNS: Horn[] = [
  {
    id: 'classic',
    name: 'Klassieke Toeter',
    sub: 'Tuut! Tuut!',
    emoji: '📯',
    color: '#FFB84D',
    price: '€0,99',
    pattern: [[440, 0.18], [330, 0.22]],
  },
  {
    id: 'disco',
    name: 'Disco Toeter',
    sub: 'Voor extra coole cruisers',
    emoji: '🪩',
    color: '#A78BFA',
    price: '€1,99',
    pattern: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.18]],
  },
  {
    id: 'ahooga',
    name: 'Ahooga Hoorn',
    sub: 'Old-school grappig',
    emoji: '🎺',
    color: '#FF8FB1',
    price: '€1,49',
    pattern: [[220, 0.22], [165, 0.26]],
  },
  {
    id: 'siren',
    name: 'Sirene Special',
    sub: 'Maak iedereen wakker',
    emoji: '🚨',
    color: '#FF6B6B',
    price: '€2,49',
    pattern: [[600, 0.12], [900, 0.12], [600, 0.12], [900, 0.18]],
  },
];

export const LOADING_STEPS = [
  { t: 'Tekenpotloden klaarzetten...', e: '✏️' },
  { t: 'Cartoon aan het maken...', e: '🎨' },
  { t: 'Scooter aan het poetsen...', e: '🛵' },
  { t: 'Bijna klaar!', e: '✨' },
];
