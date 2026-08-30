import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { Card, type CardValue } from './card.vo.js';

export type DeckType = 'fibonacci' | 'modified-fibonacci' | 't-shirt' | 'custom';

export interface DeckProps {
  type: DeckType;
  cards: Card[];
}

export class Deck extends ValueObject<DeckProps> {
  private constructor(props: DeckProps) {
    super(props);
  }

  public static fibonacci(): Deck {
    const rawValues: CardValue[] = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'];
    return new Deck({
      type: 'fibonacci',
      cards: rawValues.map((v) => Card.create(v)),
    });
  }

  public static modifiedFibonacci(): Deck {
    const rawValues: CardValue[] = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?', '☕'];
    return new Deck({
      type: 'modified-fibonacci',
      cards: rawValues.map((v) => Card.create(v)),
    });
  }

  public static tShirt(): Deck {
    const rawValues: CardValue[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'];
    return new Deck({
      type: 't-shirt',
      cards: rawValues.map((v) => Card.create(v)),
    });
  }

  public static custom(cards: CardValue[]): Deck {
    const safeCards = cards.length > 0 ? cards : [1, 2, 3, 5, 8];
    return new Deck({
      type: 'custom',
      cards: safeCards.map((v) => Card.create(v)),
    });
  }

  public static fromType(type: DeckType, customCards?: CardValue[]): Deck {
    switch (type) {
      case 'fibonacci':
        return Deck.fibonacci();
      case 'modified-fibonacci':
        return Deck.modifiedFibonacci();
      case 't-shirt':
        return Deck.tShirt();
      case 'custom':
        return Deck.custom(customCards || []);
      default:
        return Deck.fibonacci();
    }
  }

  get type(): DeckType {
    return this.props.type;
  }

  get cards(): Card[] {
    return this.props.cards;
  }

  public isValidCard(value: CardValue): boolean {
    return this.props.cards.some((c) => String(c.value) === String(value));
  }
}
