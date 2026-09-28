import type { DeckType } from '../types/room.types';

export interface DeckConfig {
  id: DeckType;
  translationKey: 'fibonacci' | 'modified-fibonacci' | 't-shirt' | 'powers-of-2';
  cards: string[];
  image: string;
}

export const DECK_CONFIGS: DeckConfig[] = [
  {
    id: 'fibonacci',
    translationKey: 'fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '?'],
    image: '/decks/fibonacci.jpg',
  },
  {
    id: 'modified-fibonacci',
    translationKey: 'modified-fibonacci',
    cards: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '?'],
    image: '/decks/modified-fibonacci.jpg',
  },
  {
    id: 't-shirt',
    translationKey: 't-shirt',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'],
    image: '/decks/t-shirt.jpg',
  },
  {
    id: 'powers-of-2',
    translationKey: 'powers-of-2',
    cards: ['0', '1', '2', '4', '8', '16', '32', '64', '?'],
    image: '/decks/powers-of-2.jpg',
  },
];
