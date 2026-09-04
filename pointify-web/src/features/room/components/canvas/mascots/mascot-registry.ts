export type MascotType =
  | 'cat'
  | 'corgi'
  | 'bear'
  | 'fox'
  | 'rabbit'
  | 'penguin'
  | 'panda'
  | 'koala'
  | 'lion'
  | 'tiger'
  | 'monkey'
  | 'hamster'
  | 'frog'
  | 'pig'
  | 'unicorn'
  | 'chick'
  | 'owl'
  | 'otter'
  | 'dragon'
  | 'husky'
  | 'squirrel'
  | 'dolphin'
  | 'giraffe'
  | 'hedgehog'
  | 'turtle'
  | 'elephant';

export type MascotCategory = 'all' | 'pets' | 'wild' | 'ocean' | 'fantasy';

export interface MascotInfo {
  id: MascotType;
  nameVi: string;
  nameEn: string;
  imageSrc: string;
  category: 'pets' | 'wild' | 'ocean' | 'fantasy';
}

export const MASCOT_LIST: MascotInfo[] = [
  // ── Thú cưng (Pets) ──
  {
    id: 'cat',
    nameVi: 'Mèo cam',
    nameEn: 'Ginger Cat',
    imageSrc: '/assets/mascots/cat-animated.png',
    category: 'pets',
  },
  {
    id: 'corgi',
    nameVi: 'Cún Corgi',
    nameEn: 'Cute Corgi',
    imageSrc: '/assets/mascots/corgi-animated.png',
    category: 'pets',
  },
  {
    id: 'husky',
    nameVi: 'Cún Husky',
    nameEn: 'Cute Husky',
    imageSrc: '/assets/mascots/husky-animated.png',
    category: 'pets',
  },
  {
    id: 'hamster',
    nameVi: 'Chuột Hamster',
    nameEn: 'Fluffy Hamster',
    imageSrc: '/assets/mascots/hamster-animated.png',
    category: 'pets',
  },
  {
    id: 'rabbit',
    nameVi: 'Thỏ trắng',
    nameEn: 'White Rabbit',
    imageSrc: '/assets/mascots/rabbit-animated.png',
    category: 'pets',
  },
  {
    id: 'pig',
    nameVi: 'Heo hồng',
    nameEn: 'Cute Piggy',
    imageSrc: '/assets/mascots/pig-animated.png',
    category: 'pets',
  },
  {
    id: 'chick',
    nameVi: 'Gà con',
    nameEn: 'Hatching Chick',
    imageSrc: '/assets/mascots/chick-animated.png',
    category: 'pets',
  },

  // ── Hoang dã & Rừng nhiệt đới (Wild & Forest) ──
  {
    id: 'panda',
    nameVi: 'Gấu trúc',
    nameEn: 'Giant Panda',
    imageSrc: '/assets/mascots/panda-animated.png',
    category: 'wild',
  },
  {
    id: 'bear',
    nameVi: 'Gấu nâu',
    nameEn: 'Brown Bear',
    imageSrc: '/assets/mascots/bear-animated.png',
    category: 'wild',
  },
  {
    id: 'koala',
    nameVi: 'Gấu Koala',
    nameEn: 'Sleepy Koala',
    imageSrc: '/assets/mascots/koala-animated.png',
    category: 'wild',
  },
  {
    id: 'fox',
    nameVi: 'Cáo thông minh',
    nameEn: 'Clever Fox',
    imageSrc: '/assets/mascots/fox-animated.png',
    category: 'wild',
  },
  {
    id: 'lion',
    nameVi: 'Sư tử con',
    nameEn: 'Little Lion',
    imageSrc: '/assets/mascots/lion-animated.png',
    category: 'wild',
  },
  {
    id: 'tiger',
    nameVi: 'Hổ dũng mãnh',
    nameEn: 'Brave Tiger',
    imageSrc: '/assets/mascots/tiger-animated.png',
    category: 'wild',
  },
  {
    id: 'monkey',
    nameVi: 'Khỉ tinh nghịch',
    nameEn: 'Playful Monkey',
    imageSrc: '/assets/mascots/monkey-animated.png',
    category: 'wild',
  },
  {
    id: 'squirrel',
    nameVi: 'Sóc hạt dẻ',
    nameEn: 'Fluffy Squirrel',
    imageSrc: '/assets/mascots/squirrel-animated.png',
    category: 'wild',
  },
  {
    id: 'giraffe',
    nameVi: 'Hươu cao cổ',
    nameEn: 'Gentle Giraffe',
    imageSrc: '/assets/mascots/giraffe-animated.png',
    category: 'wild',
  },
  {
    id: 'elephant',
    nameVi: 'Voi con',
    nameEn: 'Baby Elephant',
    imageSrc: '/assets/mascots/elephant-animated.png',
    category: 'wild',
  },
  {
    id: 'hedgehog',
    nameVi: 'Nhím gai cute',
    nameEn: 'Tiny Hedgehog',
    imageSrc: '/assets/mascots/hedgehog-animated.png',
    category: 'wild',
  },
  {
    id: 'owl',
    nameVi: 'Cú mèo thông thái',
    nameEn: 'Wise Owl',
    imageSrc: '/assets/mascots/owl-animated.png',
    category: 'wild',
  },

  // ── Đại dương & Đầm lầy (Ocean & Wetlands) ──
  {
    id: 'dolphin',
    nameVi: 'Cá heo đại dương',
    nameEn: 'Playful Dolphin',
    imageSrc: '/assets/mascots/dolphin-animated.png',
    category: 'ocean',
  },
  {
    id: 'penguin',
    nameVi: 'Chim cánh cụt',
    nameEn: 'Little Penguin',
    imageSrc: '/assets/mascots/penguin-animated.png',
    category: 'ocean',
  },
  {
    id: 'turtle',
    nameVi: 'Rùa biển',
    nameEn: 'Sea Turtle',
    imageSrc: '/assets/mascots/turtle-animated.png',
    category: 'ocean',
  },
  {
    id: 'otter',
    nameVi: 'Rái cá',
    nameEn: 'Playful Otter',
    imageSrc: '/assets/mascots/otter-animated.png',
    category: 'ocean',
  },
  {
    id: 'frog',
    nameVi: 'Ếch xanh',
    nameEn: 'Friendly Frog',
    imageSrc: '/assets/mascots/frog-animated.png',
    category: 'ocean',
  },

  // ── Thần thoại & Kỳ thú (Fantasy & Mythical) ──
  {
    id: 'dragon',
    nameVi: 'Rồng con thần tiên',
    nameEn: 'Baby Dragon',
    imageSrc: '/assets/mascots/dragon-animated.png',
    category: 'fantasy',
  },
  {
    id: 'unicorn',
    nameVi: 'Kỳ lân thần tiên',
    nameEn: 'Magic Unicorn',
    imageSrc: '/assets/mascots/unicorn-animated.png',
    category: 'fantasy',
  },
];

/**
 * Deterministically hash any participant ID to pick one of the mascots.
 * Ensures the same user gets the same mascot throughout the session.
 */
export function getMascotForParticipant(participantId: string): MascotType {
  if (!participantId) return 'cat';

  let hash = 0;
  for (let i = 0; i < participantId.length; i++) {
    hash = (hash << 5) - hash + participantId.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % MASCOT_LIST.length;
  return MASCOT_LIST[index].id;
}

/**
 * Match an avatar image path or ID back to the MascotInfo in the registry.
 */
export function getMascotFromPhotoUrl(photoURL: string | null | undefined): MascotInfo | null {
  if (!photoURL) return null;

  // Check direct mascot id match
  const directMatch = MASCOT_LIST.find((m) => m.id === photoURL || m.imageSrc === photoURL);
  if (directMatch) return directMatch;

  // Check if URL ends with <id>-animated.png or <id>.png
  for (const mascot of MASCOT_LIST) {
    if (photoURL.includes(mascot.id)) {
      return mascot;
    }
  }

  return null;
}
