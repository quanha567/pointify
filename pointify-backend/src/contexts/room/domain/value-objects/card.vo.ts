import { ValueObject } from '../../../../shared/domain/value-object.base.js';

export type CardValue = number | string;

export interface CardProps {
  value: CardValue;
  display: string;
}

export class Card extends ValueObject<CardProps> {
  private constructor(props: CardProps) {
    super(props);
  }

  public static create(value: CardValue, display?: string): Card {
    const stringVal = String(value).trim();
    return new Card({
      value,
      display: display || stringVal,
    });
  }

  get value(): CardValue {
    return this.props.value;
  }

  get display(): string {
    return this.props.display;
  }
}
