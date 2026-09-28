import type { CardValue } from '../types/room.types';

export interface CardVisualMeta {
  value: CardValue;
  subtitleKey: string;
  defaultSubtitleEn: string;
  defaultSubtitleVi: string;
  containerCount: number;
  specialIcon?: 'coffee' | 'question' | 'pallet' | 'infinite' | 'warning';
  imagePath?: string;
}

export const FIBONACCI_CARD_METADATA: Record<string, CardVisualMeta> = {
  '0': {
    value: 0,
    subtitleKey: 'room.cardSubtitles.0',
    defaultSubtitleEn: 'Trivial',
    defaultSubtitleVi: 'Không đáng kể',
    containerCount: 0,
    specialIcon: 'pallet',
    imagePath: '/images/cards/card-0-pallet.png',
  },
  '1': {
    value: 1,
    subtitleKey: 'room.cardSubtitles.1',
    defaultSubtitleEn: 'Tiny',
    defaultSubtitleVi: 'Cực đơn giản',
    containerCount: 1,
    imagePath: '/images/cards/card-1-container.png',
  },
  '2': {
    value: 2,
    subtitleKey: 'room.cardSubtitles.2',
    defaultSubtitleEn: 'Small',
    defaultSubtitleVi: 'Nhỏ, rõ ràng',
    containerCount: 2,
    imagePath: '/images/cards/card-2-containers.png',
  },
  '3': {
    value: 3,
    subtitleKey: 'room.cardSubtitles.3',
    defaultSubtitleEn: 'Medium',
    defaultSubtitleVi: 'Trung bình',
    containerCount: 3,
    imagePath: '/images/cards/card-3-truck.png',
  },
  '5': {
    value: 5,
    subtitleKey: 'room.cardSubtitles.5',
    defaultSubtitleEn: 'Large',
    defaultSubtitleVi: 'Lớn, cần chú ý',
    containerCount: 5,
    imagePath: '/images/cards/card-5-crane.png',
  },
  '8': {
    value: 8,
    subtitleKey: 'room.cardSubtitles.8',
    defaultSubtitleEn: 'Complex',
    defaultSubtitleVi: 'Khá phức tạp',
    containerCount: 8,
    imagePath: '/images/cards/card-8-barge.png',
  },
  '13': {
    value: 13,
    subtitleKey: 'room.cardSubtitles.13',
    defaultSubtitleEn: 'Risk & big story',
    defaultSubtitleVi: 'Rủi ro & việc lớn',
    containerCount: 13,
    imagePath: '/images/cards/card-13-feeder.png',
  },
  '21': {
    value: 21,
    subtitleKey: 'room.cardSubtitles.21',
    defaultSubtitleEn: 'Too large',
    defaultSubtitleVi: 'Quá lớn, chia nhỏ',
    containerCount: 21,
    specialIcon: 'warning',
    imagePath: '/images/cards/card-21-megaship.png',
  },
  '34': {
    value: 34,
    subtitleKey: 'room.cardSubtitles.34',
    defaultSubtitleEn: 'Massive',
    defaultSubtitleVi: 'Khổng lồ',
    containerCount: 28,
    imagePath: '/images/cards/card-34-massive.png',
  },
  '55': {
    value: 55,
    subtitleKey: 'room.cardSubtitles.55',
    defaultSubtitleEn: 'Epic',
    defaultSubtitleVi: 'Sử thi (Epic)',
    containerCount: 35,
    imagePath: '/images/cards/card-55-epic.png',
  },
  '89': {
    value: 89,
    subtitleKey: 'room.cardSubtitles.89',
    defaultSubtitleEn: 'Impossible',
    defaultSubtitleVi: 'Bất khả thi',
    containerCount: 45,
    specialIcon: 'infinite',
    imagePath: '/images/cards/card-89-impossible.png',
  },
  '?': {
    value: '?',
    subtitleKey: 'room.cardSubtitles.?',
    defaultSubtitleEn: 'Uncertain',
    defaultSubtitleVi: 'Chưa rõ',
    containerCount: 0,
    specialIcon: 'question',
    imagePath: '/images/cards/card-question.png',
  },
  '☕': {
    value: '☕',
    subtitleKey: 'room.cardSubtitles.☕',
    defaultSubtitleEn: 'Coffee break',
    defaultSubtitleVi: 'Giải lao',
    containerCount: 0,
    specialIcon: 'coffee',
    imagePath: '/images/cards/card-coffee.png',
  },
};

export function getCardVisualMeta(
  cardValue: CardValue | string | number | undefined | null,
): CardVisualMeta {
  const key = String(cardValue ?? '');
  if (FIBONACCI_CARD_METADATA[key]) {
    return FIBONACCI_CARD_METADATA[key];
  }

  // Fallback for custom or T-shirt values
  const numVal = Number(key);
  const count = !isNaN(numVal) && numVal > 0 ? Math.min(numVal, 25) : 1;

  return {
    value: key,
    subtitleKey: `room.cardSubtitles.${key}`,
    defaultSubtitleEn: key,
    defaultSubtitleVi: key,
    containerCount: count,
  };
}
