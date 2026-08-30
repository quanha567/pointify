import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { Card, type CardValue } from './card.vo.js';

export interface EstimateProps {
  participantId: string;
  card: Card;
  submittedAt: number;
}

export class Estimate extends ValueObject<EstimateProps> {
  private constructor(props: EstimateProps) {
    super(props);
  }

  public static create(
    participantId: string,
    cardValue: CardValue,
    submittedAt = Date.now(),
  ): Estimate {
    return new Estimate({
      participantId,
      card: Card.create(cardValue),
      submittedAt,
    });
  }

  get participantId(): string {
    return this.props.participantId;
  }

  get card(): Card {
    return this.props.card;
  }

  get cardValue(): CardValue {
    return this.props.card.value;
  }

  get submittedAt(): number {
    return this.props.submittedAt;
  }
}
