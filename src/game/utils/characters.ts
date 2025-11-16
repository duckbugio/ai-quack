import type { CharacterOption } from '../../types/game.types';

export const CHARACTERS: CharacterOption[] = [
  {
    id: 'classic-duck',
    name: 'Классика',
    emoji: '🦆',
    colors: {
      body: '#FFA500',
      beak: '#FF8C00',
      wing: '#FF8C00',
      eye: '#000000',
    },
  },
  {
    id: 'blue-duck',
    name: 'Синяя',
    emoji: '🦆',
    colors: {
      body: '#3BA3FF',
      beak: '#FFB74D',
      wing: '#1E88E5',
      eye: '#000000',
    },
  },
  {
    id: 'red-duck',
    name: 'Красная',
    emoji: '🦆',
    colors: {
      body: '#FF6B6B',
      beak: '#FFA726',
      wing: '#E53935',
      eye: '#000000',
    },
  },
  {
    id: 'lime-duck',
    name: 'Лайм',
    emoji: '🦆',
    colors: {
      body: '#B2FF59',
      beak: '#FFB300',
      wing: '#7CB342',
      eye: '#000000',
    },
  },
];

export const DEFAULT_CHARACTER_ID = 'classic-duck';
