import { Entity } from '../../../../shared/domain/entity.base.js';
import { Estimate } from '../value-objects/estimate.vo.js';
import type { CardValue } from '../value-objects/card.vo.js';

export type RoundStatus = 'voting' | 'revealed' | 'completed';

export interface RoundStatistics {
  count: number;
  average: number | null;
  consensus: boolean;
  min: number | null;
  max: number | null;
  distribution: Record<string, number>;
}

export interface RoundProps {
  roundNumber: number;
  status: RoundStatus;
  topic: string;
  estimates: Map<string, Estimate>;
  startedAt: number;
  revealedAt: number | null;
}

export class Round extends Entity<RoundProps, number> {
  private constructor(roundNumber: number, props: RoundProps) {
    super(roundNumber, props);
  }

  public static startNew(roundNumber: number, topic = ''): Round {
    return new Round(roundNumber, {
      roundNumber,
      status: 'voting',
      topic,
      estimates: new Map<string, Estimate>(),
      startedAt: Date.now(),
      revealedAt: null,
    });
  }

  public static reconstruct(
    roundNumber: number,
    props: {
      status: RoundStatus;
      topic: string;
      estimates: Map<string, Estimate>;
      startedAt: number;
      revealedAt: number | null;
    },
  ): Round {
    return new Round(roundNumber, {
      roundNumber,
      status: props.status,
      topic: props.topic,
      estimates: props.estimates,
      startedAt: props.startedAt,
      revealedAt: props.revealedAt,
    });
  }

  get roundNumber(): number {
    return this._id;
  }

  get status(): RoundStatus {
    return this.props.status;
  }

  get topic(): string {
    return this.props.topic;
  }

  get estimates(): ReadonlyMap<string, Estimate> {
    return this.props.estimates;
  }

  get startedAt(): number {
    return this.props.startedAt;
  }

  get revealedAt(): number | null {
    return this.props.revealedAt;
  }

  public submitEstimate(participantId: string, cardValue: CardValue): void {
    if (this.props.status !== 'voting') {
      throw new Error('Cannot submit estimate when round is not in voting phase');
    }
    const estimate = Estimate.create(participantId, cardValue);
    this.props.estimates.set(participantId, estimate);
  }

  public clearEstimate(participantId: string): void {
    if (this.props.status !== 'voting') {
      throw new Error('Cannot clear estimate when round is not in voting phase');
    }
    this.props.estimates.delete(participantId);
  }

  public reveal(): void {
    this.props.status = 'revealed';
    this.props.revealedAt = Date.now();
  }

  public complete(): void {
    this.props.status = 'completed';
  }

  public calculateStatistics(): RoundStatistics {
    const estimates = Array.from(this.props.estimates.values());
    const count = estimates.length;

    if (count === 0) {
      return {
        count: 0,
        average: null,
        consensus: false,
        min: null,
        max: null,
        distribution: {},
      };
    }

    const distribution: Record<string, number> = {};
    const numericValues: number[] = [];

    for (const est of estimates) {
      const valStr = String(est.cardValue);
      distribution[valStr] = (distribution[valStr] || 0) + 1;

      const num = Number(est.cardValue);
      if (!isNaN(num) && typeof est.cardValue === 'number') {
        numericValues.push(num);
      }
    }

    const uniqueValues = Object.keys(distribution);
    const consensus = count > 1 && uniqueValues.length === 1;

    let average: number | null = null;
    let min: number | null = null;
    let max: number | null = null;

    if (numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      average = Math.round((sum / numericValues.length) * 10) / 10;
      min = Math.min(...numericValues);
      max = Math.max(...numericValues);
    }

    return {
      count,
      average,
      consensus,
      min,
      max,
      distribution,
    };
  }
}
