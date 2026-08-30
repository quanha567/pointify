import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import * as crypto from 'node:crypto';

export interface FacilitatorKeyProps {
  value: string;
}

export class FacilitatorKey extends ValueObject<FacilitatorKeyProps> {
  private constructor(props: FacilitatorKeyProps) {
    super(props);
  }

  public static generate(): FacilitatorKey {
    const randomKey = crypto.randomBytes(16).toString('hex');
    return new FacilitatorKey({ value: randomKey });
  }

  public static fromExisting(key: string): FacilitatorKey {
    return new FacilitatorKey({ value: key });
  }

  get value(): string {
    return this.props.value;
  }

  public matches(key: string): boolean {
    return this.props.value === key;
  }
}
